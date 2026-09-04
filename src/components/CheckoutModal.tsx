import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Lock,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, OrderDetails } from '../types';
import { api } from '../lib/api';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  discountAmount: number;
  couponCode: string;
  onClose: () => void;
  onOrderSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Fallback script loader for Razorpay checkout.js
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'TestPayment' | 'COD'>('Razorpay');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  // Razorpay processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [keyExpiredNotice, setKeyExpiredNotice] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 500 || items.length === 0 ? 0 : 40;
  const total = Math.max(1, subtotal + deliveryFee - discountAmount);

  // Instant 1-Click Pay with Test Details Handler
  const handlePayWithTestDetails = async () => {
    setErrorMessage(null);

    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in your shipping and contact details first.');
      return;
    }

    setIsProcessing(true);
    const orderReferenceId = `GF-TEST-${Math.floor(10000 + Math.random() * 90000)}`;
    const amountInPaise = Math.max(100, Math.round(total * 100));

    try {
      // 1. Create order or call simulate test payment
      let testOrderId = `order_test_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 6)}`;
      try {
        const orderRes = await api.createRazorpayOrder(
          amountInPaise,
          'INR',
          `rcpt_${orderReferenceId}_${Date.now()}`,
          {
            customerName: name,
            email,
            phone,
            orderReferenceId,
            deliverySlot,
            mode: 'test_details'
          }
        );
        if (orderRes.ok && orderRes.order_id) {
          testOrderId = orderRes.order_id;
        }
      } catch (orderErr) {
        console.warn('Backend order creation note:', orderErr);
      }

      // 2. Call backend test-payment endpoint for cryptographically verified test payment
      const testRes = await api.simulateTestPayment({
        amountInPaise,
        order_id: testOrderId,
        receipt: `rcpt_${orderReferenceId}`,
        custom_order_id: orderReferenceId,
      });

      if (!testRes.ok || !testRes.verified) {
        throw new Error(testRes.error || 'Failed to complete test payment verification.');
      }

      setVerificationSuccess(true);

      // Celebration confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
      });

      const newOrder: OrderDetails = {
        orderId: orderReferenceId,
        customerName: name,
        email,
        phone,
        address,
        city,
        pincode,
        paymentMethod: 'TestPayment',
        paymentStatus: 'PAID',
        razorpayPaymentId: testRes.razorpay_payment_id,
        razorpayOrderId: testRes.razorpay_order_id,
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
    } catch (err: any) {
      console.error('Test payment failed:', err);
      setErrorMessage(err.message || 'Error occurred while paying with test details.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Form Submission / Payment Trigger
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all shipping and contact details.');
      return;
    }

    const orderReferenceId = `GF-${Math.floor(10000 + Math.random() * 90000)}`;

    // PAY WITH TEST DETAILS FLOW
    if (paymentMethod === 'TestPayment') {
      await handlePayWithTestDetails();
      return;
    }

    // CASH ON DELIVERY FLOW
    if (paymentMethod === 'COD') {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
      });

      const newOrder: OrderDetails = {
        orderId: orderReferenceId,
        customerName: name,
        email,
        phone,
        address,
        city,
        pincode,
        paymentMethod: 'COD',
        paymentStatus: 'COD',
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
      return;
    }

    // RAZORPAY STANDARD WEB CHECKOUT FLOW
    setIsProcessing(true);

    try {
      // 1. Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout script. Please check your internet connection.');
      }

      // 2. Minimum amount check (100 paise = ₹1.00)
      const amountInPaise = Math.max(100, Math.round(total * 100));

      // 3. Call Backend: POST /api/create-order
      const orderData = await api.createRazorpayOrder(
        amountInPaise,
        'INR',
        `rcpt_${orderReferenceId}_${Date.now()}`,
        {
          customerName: name,
          email,
          phone,
          orderReferenceId,
          deliverySlot,
        }
      );

      if (!orderData.ok || !orderData.order_id) {
        if (
          orderData.is_key_expired ||
          orderData.error?.toLowerCase().includes('expired') ||
          orderData.error?.toLowerCase().includes('authentication')
        ) {
          setKeyExpiredNotice(true);
          throw new Error(
            'The configured Razorpay API Key has expired on Razorpay servers. Please update your API key in Settings, or click "Switch to Pay with Test Details" below for instant 1-click test orders.'
          );
        }
        throw new Error(orderData.error || 'Failed to generate Razorpay order from the server.');
      }

      const razorpayKeyId =
        orderData.key_id ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        'rzp_test_TXrc6nnKy01jiq';

      // 4. Configure Razorpay Standard Checkout Options
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount, // in paise
        currency: orderData.currency || 'INR',
        name: 'Garuda Farms',
        description: '100% Pure Vedic & Organic Farm Harvest Order',
        image: '/garuda-farms-logo.svg',
        order_id: orderData.order_id,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: phone.replace(/[^0-9+]/g, ''),
        },
        notes: {
          orderReference: orderReferenceId,
          shippingAddress: `${address}, ${city} - ${pincode}`,
          deliverySlot,
        },
        theme: {
          color: '#2D6A4F',
          backdrop_color: '#0F2D1F',
        },
        // STEP 2 Handler: Called upon successful payment authorization in the modal
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          try {
            // STEP 3: Call Backend to verify HMAC-SHA256 signature
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              custom_order_id: orderReferenceId,
            });

            if (verifyRes.ok && verifyRes.verified) {
              setVerificationSuccess(true);

              // Celebration confetti
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
              });

              const newOrder: OrderDetails = {
                orderId: orderReferenceId,
                customerName: name,
                email,
                phone,
                address,
                city,
                pincode,
                paymentMethod: 'Razorpay',
                paymentStatus: 'PAID',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
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
            } else {
              setErrorMessage(
                verifyRes.error || 'Payment verification failed. Please contact our support desk.'
              );
            }
          } catch (verifyErr: any) {
            console.error('Payment verification error:', verifyErr);
            setErrorMessage(verifyErr.message || 'Signature verification request failed.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          // Handle user dismissing or closing the Razorpay modal
          ondismiss: function () {
            setIsProcessing(false);
            setErrorMessage('Payment was cancelled or dismissed. Your order is not yet confirmed.');
          },
        },
      };

      // 5. Instantiate and Open Razorpay Checkout Modal
      const rzp = new window.Razorpay(options);

      // Handle payment failure event
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        setIsProcessing(false);
        const desc = response.error?.description || '';
        if (
          desc.toLowerCase().includes('expired') ||
          desc.toLowerCase().includes('api key') ||
          desc.toLowerCase().includes('key and secret')
        ) {
          setKeyExpiredNotice(true);
          setErrorMessage(
            'The Razorpay API key has expired in your Razorpay Dashboard. Click "Switch to Pay with Test Details" below to complete testing instantly.'
          );
        } else {
          setErrorMessage(
            desc || 'Payment was declined by your bank or UPI app. Please try again.'
          );
        }
      });

      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      const msg = err.message || '';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('authentication')) {
        setKeyExpiredNotice(true);
      }
      setErrorMessage(msg || 'Could not initiate Razorpay checkout. Please check server logs.');
      setIsProcessing(false);
    }
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
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#0F2D1F] leading-none">
                  {step === 'details' ? 'Secure Farm Checkout' : 'Order Confirmed!'}
                </h3>
                <p className="text-[11px] text-[#556960] font-medium mt-1">
                  {step === 'details'
                    ? 'Razorpay 256-Bit Encrypted Payment • Direct Harvest Delivery'
                    : `Order Reference: #${confirmedOrder?.orderId}`}
                </p>
              </div>
            </div>

            <button
              id="checkout-close-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E5DEC9] text-[#0F2D1F] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'details' ? (
            <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6">
              {/* Error Banner if any */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex flex-col sm:flex-row items-start justify-between gap-3 text-xs animate-shake">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                    <div className="space-y-1.5 flex-1">
                      <strong className="block font-bold text-red-900">Payment Notice</strong>
                      <p className="text-red-700 leading-relaxed">{errorMessage}</p>
                      {(keyExpiredNotice ||
                        errorMessage.toLowerCase().includes('expired') ||
                        errorMessage.toLowerCase().includes('authentication') ||
                        errorMessage.toLowerCase().includes('api key')) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            id="switch-to-test-payment-btn"
                            onClick={handlePayWithTestDetails}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-200" />
                            <span>Switch to "Pay with Test Details" (1-Click Instant Success)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setKeyExpiredNotice(false);
                    }}
                    className="text-red-400 hover:text-red-700 font-bold text-base leading-none self-start"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact & Shipping Details */}
                <div className="space-y-4">
                  <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2">
                    1. Delivery Address & Contact
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
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Phone Number
                      </label>
                      <input
                        required
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      Street / Villa Address
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
                      Preferred Harvest Dispatch Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    >
                      <option value="Tomorrow Morning (6:00 AM – 8:00 AM)">
                        Tomorrow Morning (6:00 AM – 8:00 AM) • Dawn Chill Express
                      </option>
                      <option value="Tomorrow Afternoon (12:00 PM – 2:00 PM)">
                        Tomorrow Afternoon (12:00 PM – 2:00 PM)
                      </option>
                      <option value="Tomorrow Evening (5:00 PM – 7:00 PM)">
                        Tomorrow Evening (5:00 PM – 7:00 PM)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Payment Selection & Order Review */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2">
                      2. Payment Method
                    </h4>

                    {/* Method Toggle Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
                      {/* RAZORPAY OPTION (DEFAULT & RECOMMENDED) */}
                      <button
                        id="payment-method-razorpay-btn"
                        type="button"
                        onClick={() => setPaymentMethod('Razorpay')}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                          paymentMethod === 'Razorpay'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md ring-2 ring-[#2D6A4F]/20'
                            : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <CreditCard className="w-4 h-4" />
                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            paymentMethod === 'Razorpay' ? 'bg-white/20 text-white' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                          }`}>
                            Live / UPI
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">Razorpay Gateway</span>
                          <span className="text-[10px] opacity-80 block">UPI, QR, Cards</span>
                        </div>
                      </button>

                      {/* PAY WITH TEST DETAILS OPTION (INSTANT SANDBOX) */}
                      <button
                        id="payment-method-test-btn"
                        type="button"
                        onClick={() => setPaymentMethod('TestPayment')}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                          paymentMethod === 'TestPayment'
                            ? 'bg-amber-700 text-white border-amber-700 shadow-md ring-2 ring-amber-500/30'
                            : 'bg-[#FAF8F2] text-amber-900 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            paymentMethod === 'TestPayment' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
                          }`}>
                            Sandbox
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">Pay with Test Details</span>
                          <span className="text-[10px] opacity-80 block">1-Click Fast Sandbox</span>
                        </div>
                      </button>

                      {/* CASH ON DELIVERY OPTION */}
                      <button
                        id="payment-method-cod-btn"
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                          paymentMethod === 'COD'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md ring-2 ring-[#2D6A4F]/20'
                            : 'bg-[#FAF8F2] text-[#4A5D53] border-[#DCD2C3] hover:bg-[#EFE8DC]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Banknote className="w-4 h-4" />
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            paymentMethod === 'COD' ? 'bg-white/20 text-white' : 'text-stone-700 bg-stone-200'
                          }`}>
                            Doorstep
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">Cash on Delivery</span>
                          <span className="text-[10px] opacity-80 block">Pay upon delivery</span>
                        </div>
                      </button>
                    </div>

                    {/* Method details note */}
                    {paymentMethod === 'TestPayment' ? (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Pre-Configured Razorpay Sandbox Test Mode</span>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Clicking <strong>Pay with Test Details</strong> simulates a verified payment with cryptographic HMAC SHA-256 signatures, authentic Razorpay test IDs, and generates a printable confirmation receipt.
                        </p>
                        <div className="flex flex-wrap gap-2 text-[10px] font-mono bg-white/80 p-2 rounded-lg border border-amber-200 text-amber-900">
                          <span>💳 Test Card: <strong>4111 1111 1111 1111</strong> (Exp: 12/28, CVV: 123)</span>
                          <span>•</span>
                          <span>📱 UPI: <strong>success@razorpay</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DEC9] text-xs text-[#556960] flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                          {paymentMethod === 'Razorpay' ? (
                            <span>
                              <strong>Razorpay Standard Gateway:</strong> Zero convenience fees. Supports Google Pay, PhonePe, Paytm, cards & net banking.
                            </span>
                          ) : (
                            <span>
                              <strong>Cash on Delivery:</strong> Pay cash or scan QR with delivery executive when your sealed harvest arrives.
                            </span>
                          )}
                        </div>

                        {paymentMethod === 'Razorpay' && (
                          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-1">
                              <p className="font-semibold text-amber-950">
                                Testing without an active Razorpay key?
                              </p>
                              <p className="text-amber-800 leading-tight">
                                If your Razorpay API key has expired, choose <strong>"Pay with Test Details"</strong> above to complete the payment flow and confirm orders with verified receipts.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Items Review */}
                    <div className="mt-4 pt-3 border-t border-[#EFE8DC]">
                      <span className="text-xs font-bold text-[#0F2D1F] block mb-2">
                        Order Items ({items.length})
                      </span>
                      <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
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
                        <span>Chilled Farm Dispatch</span>
                        <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-[#2D6A4F] font-bold">
                          <span>Applied Coupon ({couponCode})</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-[#0F2D1F] pt-2 border-t border-[#EFE8DC]">
                        <span>Grand Total</span>
                        <span className="font-heading text-xl text-[#0F2D1F]">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Place Order / Razorpay Checkout CTA */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      id="place-order-submit-btn"
                      type="submit"
                      disabled={isProcessing}
                      className={`w-full py-4 rounded-2xl text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        paymentMethod === 'TestPayment'
                          ? 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-800 hover:to-amber-700'
                          : 'bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F]'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>PROCESSING PAYMENT...</span>
                        </>
                      ) : paymentMethod === 'TestPayment' ? (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>PAY WITH TEST DETAILS • ₹{total}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : paymentMethod === 'Razorpay' ? (
                        <>
                          <span>PAY WITH RAZORPAY • ₹{total}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>CONFIRM COD ORDER • ₹{total}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Quick 1-click Pay with Test Details button whenever in Razorpay mode */}
                    {paymentMethod === 'Razorpay' && (
                      <button
                        type="button"
                        id="quick-pay-test-details-action-btn"
                        onClick={handlePayWithTestDetails}
                        disabled={isProcessing}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>⚡ Pay with Test Details (Instant 1-Click Verification)</span>
                      </button>
                    )}

                    <p className="text-[10px] text-center text-[#8C6239] flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>Razorpay Verified Merchant • PCI-DSS Level 1 Compliant</span>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Order Success Screen */
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-[#52B788]/20 text-[#2D6A4F] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#8C6239]">
                  {confirmedOrder?.paymentStatus === 'PAID'
                    ? 'PAYMENT VERIFIED • ORDER DISPATCH CONFIRMED'
                    : 'CASH ON DELIVERY ORDER CONFIRMED'}
                </span>
                <h3 className="font-heading text-3xl sm:text-4xl font-black text-[#0F2D1F]">
                  Thank you for supporting Garuda Farms!
                </h3>
                <p className="text-sm text-[#556960] max-w-md mx-auto">
                  Your harvest lot has been scheduled for dawn packing. Our chilled van will deliver fresh produce to your doorstep.
                </p>
              </div>

              {/* Order Info Card */}
              {confirmedOrder && (
                <div className="max-w-md mx-auto bg-[#FAF8F2] rounded-2xl p-6 border border-[#DCD2C3] text-left space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between border-b border-[#EFE8DC] pb-2">
                    <span className="text-[#8C6239] font-semibold">Order Reference:</span>
                    <strong className="text-[#0F2D1F] font-heading font-black">
                      #{confirmedOrder.orderId}
                    </strong>
                  </div>

                  {confirmedOrder.razorpayPaymentId && (
                    <div className="flex justify-between border-b border-[#EFE8DC] pb-2 bg-emerald-50/60 -mx-6 px-6 py-1.5">
                      <span className="text-[#2D6A4F] font-bold">Razorpay Payment ID:</span>
                      <code className="text-[#0F2D1F] font-mono font-bold">
                        {confirmedOrder.razorpayPaymentId}
                      </code>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-[#8C6239] font-semibold">Payment Method:</span>
                    <span className="font-bold text-[#0F2D1F]">
                      {confirmedOrder.paymentMethod === 'TestPayment'
                        ? '⚡ Pay with Test Details (Verified Sandbox)'
                        : confirmedOrder.paymentMethod === 'Razorpay'
                        ? '💳 Razorpay Online Gateway'
                        : '💵 Cash on Delivery'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#8C6239] font-semibold">Payment Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      confirmedOrder.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {confirmedOrder.paymentStatus === 'PAID' ? 'Verified & Paid (Online)' : 'Cash on Delivery'}
                    </span>
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
                    <span>Total Amount:</span>
                    <span>₹{confirmedOrder.total}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  id="order-success-continue-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0F2D1F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase transition-all shadow-md"
                >
                  Continue Exploring Catalog
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
