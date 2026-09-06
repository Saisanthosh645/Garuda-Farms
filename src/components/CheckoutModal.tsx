import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  AlertCircle,
  Loader2,
  Lock,
  Printer,
  MessageCircle,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, OrderDetails } from '../types';
import { api } from '../lib/api';
import { calculateDeliveryFeeByPincode, PINCODE_DISTANCE_MAP } from '../lib/distance';

interface CheckoutModalProps {
  isOpen: boolean;
  items: CartItem[];
  discountAmount: number;
  couponCode: string;
  onClose: () => void;
  onOrderSuccess: () => void;
  onTrackOrder?: (orderId: string) => void;
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

    const checkWindowRazorpay = (maxRetries = 25): Promise<boolean> => {
      return new Promise((res) => {
        let count = 0;
        const timer = setInterval(() => {
          count++;
          if (typeof window !== 'undefined' && window.Razorpay) {
            clearInterval(timer);
            res(true);
          } else if (count >= maxRetries) {
            clearInterval(timer);
            res(false);
          }
        }, 100);
      });
    };

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      checkWindowRazorpay(25).then((loaded) => {
        if (loaded) {
          resolve(true);
        } else {
          existing.remove();
          appendScript();
        }
      });
      return;
    }

    appendScript();

    function appendScript() {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        checkWindowRazorpay(15).then((success) => resolve(success));
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    }
  });
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  discountAmount,
  couponCode,
  onClose,
  onOrderSuccess,
  onTrackOrder,
}) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [name, setName] = useState('Sai Santhosh');
  const [email, setEmail] = useState('raminisaisanthosh@gmail.com');
  const [phone, setPhone] = useState('9866929427');
  const [address, setAddress] = useState('Mudimyala, Chevella');
  const [city, setCity] = useState('Rangareddy');
  const [pincode, setPincode] = useState('501503');
  const [deliverySlot, setDeliverySlot] = useState('Tomorrow Morning (6:00 AM – 8:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState<'Online' | 'COD'>('Online');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);

  // Address book integration
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      // CRITICAL: Always reset checkout step and confirmed order when modal opens.
      // Without this, re-opening the modal after a successful order shows the
      // previous order's success screen instead of a fresh checkout form.
      setStep('details');
      setConfirmedOrder(null);
      setErrorMessage(null);
      setIsProcessing(false);

      (async () => {
        try {
          const [profRes, addrRes] = await Promise.all([
            api.getProfile(),
            api.getAddresses(),
          ]);
          if (profRes.ok && profRes.profile) {
            if (profRes.profile.full_name) setName(profRes.profile.full_name);
            if (profRes.profile.email) setEmail(profRes.profile.email);
            if (profRes.profile.phone) setPhone(profRes.profile.phone);
          }
          if (addrRes.ok && Array.isArray(addrRes.addresses) && addrRes.addresses.length > 0) {
            setSavedAddresses(addrRes.addresses);
            const defaultAddr = addrRes.addresses.find((a: any) => a.is_default) || addrRes.addresses[0];
            if (defaultAddr) {
              if (defaultAddr.full_name) setName(defaultAddr.full_name);
              if (defaultAddr.phone) setPhone(defaultAddr.phone);
              setAddress(defaultAddr.address_line);
              setCity(defaultAddr.city);
              setPincode(defaultAddr.pincode);
            }
          }
        } catch (e) {
          console.warn('Checkout address prefill error:', e);
        }
      })();
    }
  }, [isOpen]);


  // Razorpay processing & Delivery calculation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [deliveryInfo, setDeliveryInfo] = useState<{
    distanceKm: number;
    ratePerKm: number;
    calculatedFee: number;
    finalFee: number;
    locationName: string;
    isFreeDelivery: boolean;
  }>({
    distanceKm: 4,
    ratePerKm: 10,
    calculatedFee: 40,
    finalFee: 40,
    locationName: 'Mudimyala / Chevella Sanctuary',
    isFreeDelivery: false,
  });
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState<boolean>(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Dynamic server-side delivery fee calculation & PIN serviceability check effect
  useEffect(() => {
    const cleanPin = pincode.trim().replace(/\D/g, '');
    if (cleanPin.length === 6) {
      setIsCheckingDelivery(true);
      api.calculateDeliveryFee(cleanPin, subtotal).then((res) => {
        setIsCheckingDelivery(false);
        if (res.ok && res.serviceable) {
          setDeliveryInfo({
            distanceKm: res.distanceKm || 0,
            ratePerKm: res.ratePerKm || 10,
            calculatedFee: res.calculatedFee || 0,
            finalFee: res.finalFee !== undefined ? res.finalFee : (res.calculatedFee || 0),
            locationName: res.locationName || '',
            isFreeDelivery: Boolean(res.isFreeDelivery),
          });
          setDeliveryError(null);
        } else {
          setDeliveryError(res.error || 'Delivery is not available to this location.');
        }
      }).catch(() => {
        setIsCheckingDelivery(false);
        const localRes = calculateDeliveryFeeByPincode(cleanPin, subtotal);
        if (PINCODE_DISTANCE_MAP[cleanPin]) {
          setDeliveryInfo({
            distanceKm: localRes.distanceKm,
            ratePerKm: localRes.ratePerKm,
            calculatedFee: localRes.calculatedFee,
            finalFee: localRes.finalFee,
            locationName: localRes.locationName,
            isFreeDelivery: localRes.isFreeDelivery,
          });
          setDeliveryError(null);
        } else {
          setDeliveryError('Delivery is not available to this location.');
        }
      });
    } else if (cleanPin.length > 0) {
      setDeliveryError('Please enter a valid 6-digit PIN code.');
    } else {
      setDeliveryError(null);
    }
  }, [pincode, subtotal]);

  const deliveryFee = deliveryError || items.length === 0 ? 0 : deliveryInfo.finalFee;
  const total = Math.max(1, subtotal + deliveryFee - discountAmount);

  // Save placed order helper
  const saveOrderToStorage = (order: OrderDetails) => {
    try {
      const existing = JSON.parse(localStorage.getItem('garuda_placed_orders') || '[]');
      localStorage.setItem('garuda_placed_orders', JSON.stringify([order, ...existing]));
    } catch (e) {
      console.error('Failed to cache order to localStorage:', e);
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

    if (deliveryError) {
      setErrorMessage(deliveryError);
      return;
    }

    const orderReferenceId = `GF-${Math.floor(10000 + Math.random() * 90000)}`;

    // CASH ON DELIVERY FLOW
    if (paymentMethod === 'COD') {
      setIsProcessing(true);
      try {
        const res = await api.createCodOrder({
          customerName: name,
          email,
          phone,
          address,
          city,
          pincode,
          orderId: orderReferenceId,
          deliverySlot,
          items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity, selected_weight: it.selectedWeight })),
          subtotal,
          deliveryFee,
          discount: discountAmount,
          total,
          paymentMethod: 'COD',
        });

        if (res && res.ok) {
          const created: OrderDetails = {
            orderId: res.orderId || orderReferenceId,
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
          saveOrderToStorage(created);
          setConfirmedOrder(created);
          setStep('success');
          onOrderSuccess();
        } else {
          setErrorMessage(res?.error || 'Could not create COD order. Please try again later.');
        }
      } catch (e: any) {
        setErrorMessage(e.message || 'Could not create COD order.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // ONLINE PAYMENT FLOW (Razorpay Standard Checkout)
    setIsProcessing(true);

    try {
      // 1. Create order on backend with authoritative pricing
      let orderData: any = null;
      try {
        orderData = await api.createRazorpayOrder({
          items: items.map((it) => ({
            product_id: it.product.id,
            quantity: it.quantity,
            selected_weight: it.selectedWeight,
          })),
          couponCode: couponCode || undefined,
          receipt: `rcpt_${orderReferenceId}_${Date.now()}`,
          notes: {
            customerName: name,
            email,
            phone,
            orderReferenceId,
            deliverySlot,
          },
        });
      } catch (err) {
        console.error('[Razorpay] Order creation error:', err);
      }

      // If server failed to create a Razorpay order, inform the client.
      if (!orderData || !orderData.ok || !orderData.order_id) {
        console.error('[Razorpay] Order creation failed:', orderData);
        setErrorMessage(orderData?.error || 'Payment gateway is currently unavailable. Please try Cash on Delivery or try again later.');
        setIsProcessing(false);
        return;
      }

      console.log('[Razorpay] Order created:', orderData.order_id, 'Amount:', orderData.amount);

      // Handle simulated test payment mode (when Razorpay test keys in .env are unauthenticated)
      if (orderData.isSimulated) {
        console.log('[Razorpay Simulation] Completing simulated test order:', orderData.order_id);
        const simPayId = `pay_sim_${Date.now()}`;
        const verifyRes = await api.verifyRazorpayPayment({
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: simPayId,
          razorpay_signature: 'simulated_signature',
          custom_order_id: orderReferenceId,
          orderPayload: {
            customerName: name,
            email,
            phone,
            address,
            city,
            pincode,
            deliverySlot,
            items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity, selected_weight: it.selectedWeight })),
            subtotal,
            deliveryFee,
            discount: discountAmount,
            total,
          },
        });

        if (verifyRes.ok && verifyRes.verified) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
          });

          const newOrder: OrderDetails = {
            orderId: verifyRes.orderId || orderReferenceId,
            customerName: name,
            email,
            phone,
            address,
            city,
            pincode,
            paymentMethod: 'Razorpay',
            paymentStatus: 'PAID',
            razorpayPaymentId: simPayId,
            razorpayOrderId: orderData.order_id,
            items,
            subtotal,
            deliveryFee,
            discount: discountAmount,
            total,
            timestamp: new Date().toLocaleString(),
          };

          saveOrderToStorage(newOrder);
          setConfirmedOrder(newOrder);
          setStep('success');
          onOrderSuccess();
        } else {
          setErrorMessage(verifyRes.error || 'Payment verification failed.');
        }
        setIsProcessing(false);
        return;
      }

      // Ensure Razorpay SDK script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        setErrorMessage('Payment gateway script failed to load. Please try again later or select Cash on Delivery.');
        setIsProcessing(false);
        return;
      }

      const razorpayKeyId =
        orderData.key_id ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        setErrorMessage('Payment gateway key not configured. Please contact support.');
        setIsProcessing(false);
        return;
      }

      // Clean phone number: extract last 10 digits for Razorpay prefill
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);

      // 2. Configure Razorpay Standard Checkout Options
      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Garuda Farms',
        description: '100% Pure Vedic & Organic Farm Harvest Order',
        order_id: orderData.order_id,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: cleanPhone,
        },
        notes: {
          orderReference: orderReferenceId,
          shippingAddress: `${address}, ${city} - ${pincode}`,
          deliverySlot,
        },
        theme: {
          color: '#2D6A4F',
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          console.log('[Razorpay] Payment success callback received:', response.razorpay_payment_id);
          setIsProcessing(true);
          try {
            const verifyRes = await api.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              custom_order_id: orderReferenceId,
              orderPayload: {
                customerName: name,
                email,
                phone,
                address,
                city,
                pincode,
                deliverySlot,
                items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity, selected_weight: it.selectedWeight })),
                subtotal,
                deliveryFee,
                discount: discountAmount,
                total,
              },
            });

            console.log('[Razorpay] Verify response:', verifyRes);

            if (verifyRes.ok && verifyRes.verified) {
              confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#2D6A4F', '#52B788', '#D4A373', '#E9C46A', '#0F2D1F'],
              });

              const newOrder: OrderDetails = {
                orderId: verifyRes.orderId || orderReferenceId,
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

              saveOrderToStorage(newOrder);
              setConfirmedOrder(newOrder);
              setStep('success');
              onOrderSuccess();
            } else {
              console.error('[Razorpay] Verification failed:', verifyRes);
              setErrorMessage(verifyRes.error || 'Payment verification failed. Please contact support or try another payment method.');
            }
          } catch (verifyErr: any) {
            console.error('[Razorpay] Payment verification error:', verifyErr);
            setErrorMessage('Payment verification error. Please try again or contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay] Modal dismissed by user');
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error('[Razorpay] Payment failed:', response.error);
        const code = response.error?.code || '';
        const desc = response.error?.description || response.error?.reason || '';
        
        if (code === 'BAD_REQUEST_ERROR' || desc.includes('Unauthorized') || desc.includes('key')) {
          setErrorMessage('Razorpay Key Error (401): The test key in .env is invalid or revoked. Please update RAZORPAY_KEY_ID in .env with valid keys from dashboard.razorpay.com, or select Cash on Delivery.');
        } else {
          setErrorMessage(desc || 'Payment failed or cancelled. Please try again or select Cash on Delivery.');
        }
        setIsProcessing(false);
      });

      rzp.open();

      // Release button loading state — Razorpay modal is now in control
      setIsProcessing(false);
    } catch (err: any) {
      console.error('[Razorpay] Checkout flow error:', err);
      setErrorMessage('An unexpected error occurred during checkout. Please try again or select Cash on Delivery.');
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
          className="fixed inset-0 bg-[#0F2D1F]/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="relative bg-[#FAF8F2] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 my-8 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-6 bg-[#0F2D1F] text-[#FAF8F2] border-b border-[#2D6A4F]/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#FAF8F2]">
                <ShieldCheck className="w-5 h-5 text-[#52B788]" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-[#FAF8F2] leading-none">
                  {step === 'details' ? 'Secure Farm Checkout' : 'Order Confirmed!'}
                </h3>
                <p className="text-[11px] text-[#FAF8F2]/75 font-medium mt-1">
                  {step === 'details'
                    ? '256-Bit Encrypted Payment • Direct Dawn Harvest Dispatch'
                    : `Order Reference: #${confirmedOrder?.orderId}`}
                </p>
              </div>
            </div>

            <button
              id="checkout-close-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === 'details' ? (
            <form onSubmit={handlePlaceOrder} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              {/* Error Banner if any */}
              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-xs animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <div className="space-y-1">
                    <strong className="block font-bold text-red-900">Payment Notice</strong>
                    <p className="text-red-700 leading-relaxed">{errorMessage}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details Form */}
                <div className="space-y-4">
                  <h4 className="font-heading text-xs font-bold tracking-widest text-[#0F2D1F] uppercase border-b border-[#EFE8DC] pb-2">
                    1. Shipping & Harvest Recipient
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                  </div>

                  {savedAddresses.length > 0 && (
                    <div className="space-y-1.5 bg-[#FAF8F2] p-3 rounded-xl border border-[#E5DEC9]">
                      <label className="text-[10px] font-bold uppercase text-[#8C6239] block">
                        Select Saved Address ({savedAddresses.length})
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {savedAddresses.map((addr) => (
                          <button
                            type="button"
                            key={addr.id}
                            onClick={() => {
                              if (addr.full_name) setName(addr.full_name);
                              if (addr.phone) setPhone(addr.phone);
                              setAddress(addr.address_line);
                              setCity(addr.city);
                              setPincode(addr.pincode);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] text-[#0F2D1F] transition-all"
                          >
                            📍 {addr.label} ({addr.city})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      Street / Villa Address
                    </label>
                    <input
                      required
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Pincode {isCheckingDelivery && <span className="text-[#2D6A4F] animate-pulse lowercase font-normal">(verifying...)</span>}
                      </label>
                      <input
                        required
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-sm text-[#0F2D1F] focus:outline-none ${
                          deliveryError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#DCD2C3] focus:border-[#2D6A4F]'
                        }`}
                        placeholder="e.g. 500032"
                      />
                    </div>
                  </div>

                  {/* Delivery Serviceability Alert / Location Banner */}
                  {deliveryError && (
                    <div className="mt-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-red-800 font-bold">Delivery Unavailable</strong>
                        <span>{deliveryError}</span>
                      </div>
                    </div>
                  )}

                  {!deliveryError && deliveryInfo.locationName && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#2D6A4F]/10 border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-semibold flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate mr-2">
                        <Truck className="w-4 h-4 shrink-0 text-[#2D6A4F]" />
                        <span className="truncate">📍 {deliveryInfo.locationName}</span>
                      </div>
                      <span className="bg-white/90 px-2 py-0.5 rounded text-[11px] font-bold shrink-0 shadow-xs">
                        {deliveryInfo.distanceKm} km @ ₹{deliveryInfo.ratePerKm}/km
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                      Preferred Harvest Dispatch Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#DCD2C3] text-sm text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
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
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {/* ONLINE PAYMENT OPTION */}
                      <button
                        id="payment-method-online-btn"
                        type="button"
                        onClick={() => setPaymentMethod('Online')}
                        className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 cursor-pointer ${
                          paymentMethod === 'Online'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md ring-2 ring-[#2D6A4F]/20'
                            : 'bg-white text-[#4A5D53] border-[#DCD2C3] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <CreditCard className="w-4 h-4" />
                          <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded ${
                            paymentMethod === 'Online' ? 'bg-white/20 text-white' : 'bg-[#2D6A4F]/10 text-[#2D6A4F]'
                          }`}>
                            Instant
                          </span>
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">Online Payment</span>
                          <span className="text-[10px] opacity-80 block">UPI, Cards, NetBanking</span>
                        </div>
                      </button>

                      {/* CASH ON DELIVERY OPTION */}
                      <button
                        id="payment-method-cod-btn"
                        type="button"
                        onClick={() => setPaymentMethod('COD')}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                          paymentMethod === 'COD'
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-md ring-2 ring-[#2D6A4F]/20'
                            : 'bg-white text-[#4A5D53] border-[#DCD2C3] hover:bg-[#F4EFE6]'
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
                    <div className="mt-3 p-3 rounded-xl bg-white border border-[#E5DEC9] text-xs text-[#556960] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                      {paymentMethod === 'Online' ? (
                        <span>
                          <strong>Zero Convenience Fee:</strong> Secure checkout supporting Google Pay, PhonePe, Paytm, Visa, Mastercard, RuPay & NetBanking.
                        </span>
                      ) : (
                        <span>
                          <strong>Doorstep Payment:</strong> Pay with cash or scan QR with our delivery partner upon receiving your chilled sealed lot.
                        </span>
                      )}
                    </div>

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
                      <div className="flex justify-between items-center">
                        <span>Delivery ({deliveryInfo.distanceKm} km @ ₹{deliveryInfo.ratePerKm}/km)</span>
                        <span className="font-bold">
                          {deliveryError ? (
                            <span className="text-red-600 font-bold">Unavailable</span>
                          ) : deliveryFee === 0 ? (
                            <span className="text-[#2D6A4F] font-extrabold px-1.5 py-0.5 rounded bg-[#2D6A4F]/10">FREE</span>
                          ) : (
                            `₹${deliveryFee}`
                          )}
                        </span>
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

                  {/* Place Order CTA */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      id="place-order-submit-btn"
                      type="submit"
                      disabled={isProcessing || Boolean(deliveryError) || isCheckingDelivery}
                      className="w-full py-4 rounded-2xl text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-xl hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[#2D6A4F] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>PROCESSING SECURE PAYMENT...</span>
                        </>
                      ) : isCheckingDelivery ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>VERIFYING PINCODE SERVICEABILITY...</span>
                        </>
                      ) : deliveryError ? (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <span>DELIVERY NOT AVAILABLE TO THIS PINCODE</span>
                        </>
                      ) : paymentMethod === 'Online' ? (
                        <>
                          <span>PAY ONLINE • ₹{total}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>CONFIRM DOORSTEP ORDER • ₹{total}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-[#8C6239] flex items-center justify-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                      <span>FSSAI Lic. #13621014000382 • 100% Purity & Freshness Guarantee</span>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            /* Order Success Screen & Official Tax Invoice */
            <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">
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

              {/* Order Info & Official Invoice Card */}
              {confirmedOrder && (
                <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-[#DCD2C3] text-left space-y-3 text-xs shadow-sm">
                  <div className="flex justify-between border-b border-[#EFE8DC] pb-2">
                    <span className="text-[#8C6239] font-semibold">Order Reference:</span>
                    <strong className="text-[#0F2D1F] font-heading font-black">
                      #{confirmedOrder.orderId}
                    </strong>
                  </div>

                  {confirmedOrder.razorpayPaymentId && (
                    <div className="flex justify-between border-b border-[#EFE8DC] pb-2 bg-emerald-50/60 -mx-6 px-6 py-1.5">
                      <span className="text-[#2D6A4F] font-bold">Transaction Reference:</span>
                      <code className="text-[#0F2D1F] font-mono font-bold">
                        {confirmedOrder.razorpayPaymentId}
                      </code>
                    </div>
                  )}

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
                    <span>Total Amount Paid:</span>
                    <span>₹{confirmedOrder.total}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons: Print Invoice, Track Order, WhatsApp Alerts */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-3 rounded-full bg-white border border-[#DCD2C3] hover:bg-[#FAF8F2] text-[#0F2D1F] text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Print Tax Invoice</span>
                </button>

                {onTrackOrder && confirmedOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onTrackOrder(confirmedOrder.orderId);
                    }}
                    className="px-5 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-[#52B788]" />
                    <span>Track Dispatch</span>
                  </button>
                )}

                <a
                  href={`https://wa.me/919866929427?text=Hi%20Garuda%20Farms%2C%20I%20just%20placed%20order%20%23${confirmedOrder?.orderId}.%20Please%20send%20me%20dispatch%20updates.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Alerts</span>
                </a>

                <button
                  id="order-success-continue-btn"
                  onClick={onClose}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0F2D1F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold tracking-widest uppercase transition-all shadow-md cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
