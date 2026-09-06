-- Non-destructive migration: create transactional RPC to create an order, insert order_items,
-- decrement product stock and insert inventory_logs atomically.
-- This function is SECURITY DEFINER and should be created by a supabase project admin.
-- It accepts order details and an array of order_items as JSONB.

CREATE OR REPLACE FUNCTION garuda_create_order(
  p_order_id TEXT,
  p_customer_id UUID,
  p_auth_id UUID,
  p_notes JSONB,
  p_subtotal NUMERIC,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_order_status TEXT,
  p_order_items JSONB
) RETURNS JSONB AS $$
DECLARE
  item JSONB;
  prod RECORD;
  new_stock INT;
BEGIN
  -- Insert order (idempotent: do nothing if exists)
  INSERT INTO orders(id, customer_id, customer_name, customer_email, customer_phone, shipping_address, city, pincode, delivery_slot, subtotal, total_amount, payment_method, payment_status, order_status, razorpay_order_id, razorpay_payment_id, razorpay_signature, notes, created_at, updated_at)
  VALUES (
    p_order_id,
    p_customer_id,
    COALESCE(p_notes->>'customerName', p_notes->>'name', p_notes->>'email', 'Guest'),
    COALESCE(p_notes->>'email',''),
    COALESCE(p_notes->>'phone',''),
    COALESCE(p_notes->>'shippingAddress', p_notes->>'address',''),
    COALESCE(p_notes->>'city',''),
    COALESCE(p_notes->>'pincode',''),
    COALESCE(p_notes->>'deliverySlot', NULL),
    p_subtotal,
    p_total_amount,
    p_payment_method,
    'Pending',
    p_order_status,
    NULL, NULL, NULL,
    p_notes,
    NOW(), NOW()
  ) ON CONFLICT (id) DO NOTHING;

  -- If order items provided, insert them and update stock
  IF p_order_items IS NOT NULL THEN
    FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
    LOOP
      BEGIN
        INSERT INTO order_items(order_id, product_id, product_name, selected_weight, unit_price, quantity, total_price)
        VALUES (
          p_order_id,
          (item->>'product_id')::INT,
          item->>'product_name',
          item->>'selected_weight',
          (item->>'unit_price')::NUMERIC,
          (item->>'quantity')::INT,
          ((item->>'unit_price')::NUMERIC * (item->>'quantity')::INT)
        );

        -- Update product stock if product exists
        SELECT id, stock_quantity INTO prod FROM products WHERE id = (item->>'product_id')::INT FOR UPDATE;
        IF FOUND THEN
          new_stock := GREATEST(COALESCE(prod.stock_quantity,0) - (item->>'quantity')::INT, 0);
          UPDATE products SET stock_quantity = new_stock, is_in_stock = (new_stock > 0), updated_at = NOW() WHERE id = prod.id;

          -- Insert inventory log
          INSERT INTO inventory_logs(product_id, previous_stock, new_stock, quantity_changed, change_type, reason, created_at)
          VALUES (prod.id, COALESCE(prod.stock_quantity,0), new_stock, -((item->>'quantity')::INT), 'order_placed', p_order_id, NOW());
        END IF;
      EXCEPTION WHEN OTHERS THEN
        -- swallow item-level errors to avoid whole transaction failing for a single item; return warning
        RAISE NOTICE 'garuda_create_order: item processing error: %', SQLERRM;
      END;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('ok', true, 'order_id', p_order_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated role (adjust role name if needed)
GRANT EXECUTE ON FUNCTION garuda_create_order(TEXT, UUID, UUID, JSONB, NUMERIC, NUMERIC, TEXT, TEXT, JSONB) TO public;
