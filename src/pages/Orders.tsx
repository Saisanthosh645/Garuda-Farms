import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Package, Truck, Calendar, MapPin, CreditCard, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react';

interface OrderItemDetail {
  id: string;
  product_id: number;
  product_name: string;
  selected_weight: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface OrderRecord {
  id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  city?: string;
  pincode?: string;
  delivery_slot?: string;
  subtotal?: number;
  delivery_charge?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  razorpay_payment_id?: string;
  created_at: string;
  items?: OrderItemDetail[];
}

const mergeLocalOrders = (serverOrders: OrderRecord[]): OrderRecord[] => {
  try {
    const cached = JSON.parse(localStorage.getItem('garuda_placed_orders') || '[]');
    if (!Array.isArray(cached) || cached.length === 0) return serverOrders;
    const serverMap = new Set(serverOrders.map((o) => String(o.id)));
    const merged = [...serverOrders];
    cached.forEach((loc: any) => {
      const id = String(loc.orderId || loc.id || '');
      if (id && !serverMap.has(id)) {
        merged.push({
          id,
          customer_name: loc.customerName,
          customer_email: loc.email,
          customer_phone: loc.phone,
          shipping_address: loc.address,
          city: loc.city,
          pincode: loc.pincode,
          delivery_slot: loc.deliverySlot,
          total_amount: loc.total || 0,
          subtotal: loc.subtotal || loc.total || 0,
          delivery_charge: loc.deliveryFee || 0,
          discount_amount: loc.discount || 0,
          payment_method: loc.paymentMethod || 'COD',
          payment_status: loc.paymentStatus || 'Pending',
          order_status: 'Confirmed',
          created_at: loc.timestamp || new Date().toISOString(),
          items: (loc.items || []).map((it: any) => ({
            id: String(it.product?.id || Math.random()),
            product_id: Number(it.product?.id || 0),
            product_name: it.product?.name || 'Farm Product',
            selected_weight: it.selectedWeight || '',
            unit_price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
            total_price: Number((it.price || 0) * (it.quantity || 1)),
          })),
        });
      }
    });
    return merged.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  } catch {
    return serverOrders;
  }
};

export const OrdersPage: React.FC = () => {
  const { session, user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>(() => mergeLocalOrders([]));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(mergeLocalOrders(data.orders || []));
      } else {
        setError('Failed to load your orders.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Network error loading orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [session, user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-[#2D6A4F]/10 text-[#2D6A4F] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#0F2D1F] mb-2">Sign in to view your orders</h2>
        <p className="text-sm text-[#556960]">Access your real-time harvest dispatch tracking and purchase receipts.</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
      case 'Packed':
      case 'Confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
        <div>
          <h2 className="font-heading text-3xl font-black text-[#0F2D1F]">My Farm Orders</h2>
          <p className="text-xs text-[#556960] mt-1">
            Real-time cold-chain dispatch records for <strong>{user.email}</strong>
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="p-2 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] hover:bg-[#EFE8DC] text-[#0F2D1F] transition-colors cursor-pointer"
          title="Refresh Orders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs text-[#556960] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#2D6A4F]" />
          <span>Fetching your orders from Garuda database...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#DCD2C3] space-y-3 p-8">
          <Package className="w-12 h-12 text-[#8C6239] mx-auto opacity-60" />
          <h3 className="font-heading text-lg font-bold text-[#0F2D1F]">No orders placed yet</h3>
          <p className="text-xs text-[#556960] max-w-sm mx-auto">
            Browse our 50 single-origin A2 milk, ghee, cold-pressed oils, and organic harvests to place your first order.
          </p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#DCD2C3] p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE8DC] pb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8C6239] uppercase">Order ID:</span>
                    <strong className="font-heading font-black text-lg text-[#0F2D1F]">#{order.id}</strong>
                  </div>
                  <div className="text-[11px] text-[#556960] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>{order.created_at ? new Date(order.created_at).toLocaleString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.order_status
                    )}`}
                  >
                    {order.order_status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      order.payment_status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {order.payment_method === 'COD' ? 'COD' : order.payment_status === 'Paid' ? 'Paid Online' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C6239]">
                  Harvest Produce Items ({order.items?.length || 0})
                </span>

                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-[#EFE8DC] bg-[#FAF8F2] rounded-xl p-3 border border-[#E5DEC9]">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs text-[#0F2D1F]">
                        <div>
                          <strong className="font-semibold">{item.product_name}</strong>
                          <span className="text-[11px] text-[#556960] block">
                            Pack: {item.selected_weight} • Qty: {item.quantity} × ₹{item.unit_price}
                          </span>
                        </div>
                        <strong className="font-bold text-[#0F2D1F]">₹{item.total_price}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#556960] italic">Details logged in system receipt.</p>
                )}
              </div>

              {/* Order Bottom Summary */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#EFE8DC] text-xs text-[#556960]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <span className="truncate max-w-xs">
                    {order.shipping_address ? `${order.shipping_address}, ${order.city}` : 'Direct Dispatch'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-[#8C6239] uppercase font-bold block">Grand Total</span>
                    <strong className="font-heading font-black text-xl text-[#0F2D1F]">
                      ₹{Number(order.total_amount).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
