import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, QrCode, Banknote, Sparkles, ArrowRight, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, OrderDetails } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  discountAmount: number;
  couponCode: string;
  onClose: () => void;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  discountAmount,
  couponCode,
  onClose,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [name, setName] = useState('Sai Santhosh');
  const [email, setEmail] = useState('raminisaisanthosh@gmail.com');
  const [phone, setPhone] = useState('+91 98490 12345');
  const [address, setAddress] = useState('Villa #14, Green Valley Enclave, Gachibowli');
  const [city, setCity] = useState('Hyderabad');
  const [pincode, setPincode] = useState('500032');
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow Morning (6:00 AM – 8:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 500 || items.length === 0 ? 0 : 40;
  const total = subtotal + deliveryFee - discountAmount;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // Trigger celebration confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
    });

    const orderId = `GF-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: OrderDetails = {
      orderId,
      customerName: name,
      email,
      phone,
      address,
      city,
      pincode,
      paymentMethod,
      items,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      timestamp: new Date().toLocaleString(),
    };

    setConfirmedOrder(newOrder);
    setStep('success');
    onOrderSuccess();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative bg-[#FDFBF7] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 my-8"
        >
          {/* Header */}
          <div className="p-6 bg-[#FAF8F2] border-b border-[#EFE8DC] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0F2D1F] text-[#FAF8F2] flex items-center justify-center font-heading font-black">
                GF
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0F2D1F]">
                  {step === 'details' ? 'Garuda Farms Express Checkout' : 'Order Confirmed!'}
                </h3>
                <p className="text-xs text-[#8C6239] font-medium">
                  {step === 'details'
                    ? '100% Secure Farm-Direct Payment Gateway'
                    : `Order ID: #${confirmedOrder?.orderId}`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E5DEC9] text-[#0F2D1F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'details' ? (
            <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2">
                    1. Contact Information
                  </h4>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      Full Name
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Phone Number
                      </label>
                      <input
                        required
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Email Address
                      </label>
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2 pt-2">
                    2. Farm Fresh Delivery Address
                  </h4>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      House / Flat / Street Address
                    </label>
                    <input
                      required
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        City
                      </label>
                      <input
                        required
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Pincode
                      </label>
                      <input
                        required
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      Preferred Morning Harvest Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    >
                      <option>Tomorrow Morning (6:00 AM – 8:00 AM)</option>
                      <option>Tomorrow Daytime (10:00 AM – 1:00 PM)</option>
                      <option>Same Day Evening Express (5:00 PM – 8:00 PM)</option>
                    </select>
                  </div>
                </div>

                {/* Order Summary & Payment Choice */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2">
                      3. Payment Method
                    </h4>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'UPI'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                            : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        <QrCode className="w-5 h-5" />
                        <span className="text-xs font-bold">UPI / QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('Card')}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'Card'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                            : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-bold">Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                          paymentMethod === 'COD'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                            : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        <Banknote className="w-5 h-5" />
                        <span className="text-xs font-bold">Cash on Delivery</span>
                      </button>
                    </div>

                    {/* Method details note */}
                    <div className="mt-3 p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DEC9] text-xs text-[#556960]">
                      {paymentMethod === 'UPI' &&
                        '⚡ Instant payment via GooglePay, PhonePe, Paytm or any UPI app.'}
                      {paymentMethod === 'Card' &&
                        '🔒 256-bit encrypted Visa, MasterCard, RuPay processing.'}
                      {paymentMethod === 'COD' &&
                        '💵 Pay upon receiving your sealed cold-insulated package.'}
                    </div>

                    {/* Order Items Review */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
                      <span className="text-xs font-bold text-[#0F2D1F] block mb-2">
                        Order Items ({items.length})
                      </span>
                      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs text-[#556960]"
                          >
                            <span className="truncate max-w-[200px]">
                              {item.quantity}x {item.product.name} ({item.selectedWeight})
                            </span>
                            <span className="font-bold text-[#0F2D1F]">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Math */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8DC] space-y-1.5 text-xs text-[#556960]">
                      <div className="flex justify-between">
                        <span>Items Total</span>
                        <span className="font-bold text-[#0F2D1F]">₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Insulated Delivery</span>
                        <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#2D6A4F] font-bold">
                          <span>Coupon Discount ({couponCode})</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-[#0F2D1F] pt-2 border-t border-[#EFE8DC]">
                        <span>Grand Total</span>
                        <span className="font-heading text-xl">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    id="place-order-submit-btn"
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>PLACE ORDER • ₹{total}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Order Success Screen */
            <div className="p-8 sm:p-12 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-20 h-20 rounded-full bg-[#52B788]/20 border-2 border-[#52B788] flex items-center justify-center text-[#2D6A4F] mx-auto shadow-inner"
              >
                <CheckCircle2 className="w-12 h-12" />
              </motion.div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239]">
                  ORDER DISPATCH CONFIRMED
                </span>
                <h3 className="font-heading text-3xl sm:text-4xl font-black text-[#0F2D1F]">
                  Thank you for choosing Garuda Farms!
                </h3>
                <p className="text-sm text-[#556960] max-w-md mx-auto">
                  Your harvest lot has been scheduled for dawn packing. Our chilled van will deliver fresh produce to your doorstep.
                </p>
              </div>

              {/* Order Info Card */}
              {confirmedOrder && (
                <div className="max-w-md mx-auto bg-[#FAF8F2] rounded-2xl p-6 border border-[#DCD2C3] text-left space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#EFE8DC] pb-2">
                    <span className="text-[#8C6239] font-semibold">Order Reference:</span>
                    <strong className="text-[#0F2D1F] font-heading font-black">
                      #{confirmedOrder.orderId}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C6239] font-semibold">Delivery Slot:</span>
                    <span className="font-bold text-[#2D6A4F]">{deliverySlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C6239] font-semibold">Recipient:</span>
                    <span className="font-bold text-[#0F2D1F]">{confirmedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C6239] font-semibold">Address:</span>
                    <span className="text-[#0F2D1F] text-right truncate max-w-[200px]">
                      {confirmedOrder.address}, {confirmedOrder.city}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#EFE8DC] pt-2 font-bold text-sm text-[#0F2D1F]">
                    <span>Total Paid ({confirmedOrder.paymentMethod}):</span>
                    <span>₹{confirmedOrder.total}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0F2D1F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase transition-all"
                >
                  Continue Exploring
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
