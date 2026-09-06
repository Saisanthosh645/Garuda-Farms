import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Search, PackageCheck, Truck, CheckCircle2, Clock, Phone, MapPin,
  Printer, AlertCircle, RefreshCw, ShoppingBag, ShieldCheck, Check, Sparkles
} from 'lucide-react';
import { api } from '../lib/api';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledOrderId?: string;
  initialOrderId?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  prefilledOrderId = '',
  initialOrderId = '',
}) => {
  const effectiveOrderId = initialOrderId || prefilledOrderId;
  const [searchQuery, setSearchQuery] = useState(effectiveOrderId);
  const [loading, setLoading] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<any | null>(null);
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  const timerRef = useRef<any>(null);

  // Load recent orders from localStorage for quick suggestions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('garuda_placed_orders');
      if (saved) {
        setRecentOrders(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  // Execute tracking query against real DB endpoint
  const executeTrack = async (queryToUse: string, isSilent = false) => {
    const clean = queryToUse.replace('#', '').trim();
    if (!clean) return;

    if (!isSilent) setLoading(true);
    setErrorMsg(null);

    const res = await api.trackOrder(clean);

    if (res.ok && res.order) {
      setMatchedOrder(res.order);
      setStatusHistory(res.history || []);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else {
      if (!isSilent) {
        setMatchedOrder(null);
        setErrorMsg(res.error || `No active order found for reference "${clean}".`);
      }
    }
    setLoading(false);
  };

  // Trigger tracking on mount/open
  useEffect(() => {
    if (isOpen) {
      if (effectiveOrderId) {
        setSearchQuery(effectiveOrderId);
        executeTrack(effectiveOrderId);
      } else {
        try {
          const saved = localStorage.getItem('garuda_placed_orders');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.length > 0) {
              const topId = parsed[0].orderId || parsed[0].id;
              if (topId) {
                setSearchQuery(topId);
                executeTrack(topId);
              }
            }
          }
        } catch {}
      }
    } else {
      setMatchedOrder(null);
      setErrorMsg(null);
    }
  }, [isOpen, effectiveOrderId]);

  // Real-Time Auto-Polling (fetches updated status from DB every 7 seconds)
  useEffect(() => {
    if (isOpen && searchQuery.trim()) {
      timerRef.current = setInterval(() => {
        executeTrack(searchQuery, true);
      }, 7000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeTrack(searchQuery);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const status = matchedOrder?.order_status || 'Pending';
  const isCancelled = status === 'Cancelled';

  const stages = [
    {
      key: 'Confirmed',
      label: '1. Order Confirmed & Harvest Reserved',
      desc: 'Payment & harvest reservation locked in our Mudimyala, Chevella sanctuary.',
    },
    {
      key: 'Packed',
      label: '2. Cold-Chain Processing & Quality Inspection',
      desc: 'Bottling A2 milk in glass & eco-packing produce into temperature-controlled bio-boxes.',
    },
    {
      key: 'Shipped',
      label: '3. Refrigerated Vehicle In Transit',
      desc: 'Harvest lot loaded into active refrigerated van (3.8°C – 5.0°C sensor monitored).',
    },
    {
      key: 'Out for Delivery',
      label: '4. Out for Doorstep Delivery',
      desc: 'Chilled delivery partner is in your neighborhood for final doorstep handover.',
    },
    {
      key: 'Delivered',
      label: '5. Handed Over & Delivered',
      desc: 'Successfully delivered fresh to patron doorstep.',
    },
  ];

  const getStageState = (stageKey: string) => {
    if (isCancelled) return 'cancelled';

    const orderRanks: Record<string, number> = {
      Pending: 1,
      Confirmed: 1,
      Processing: 2,
      Packed: 2,
      Shipped: 3,
      'Out for Delivery': 4,
      Delivered: 5,
    };

    const stageRanks: Record<string, number> = {
      Confirmed: 1,
      Packed: 2,
      Shipped: 3,
      'Out for Delivery': 4,
      Delivered: 5,
    };

    const currentRank = orderRanks[status] || 1;
    const stageRank = stageRanks[stageKey] || 1;

    if (currentRank > stageRank) return 'completed';
    if (currentRank === stageRank) return 'active';
    return 'pending';
  };

  const getStageTimestamp = (stageKey: string) => {
    if (!statusHistory || statusHistory.length === 0) {
      if (stageKey === 'Confirmed' && matchedOrder?.created_at) {
        return new Date(matchedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return null;
    }
    const record = statusHistory.find(
      (h: any) => h.status?.toLowerCase() === stageKey.toLowerCase()
    );
    if (record) {
      return new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (stageKey === 'Confirmed' && matchedOrder?.created_at) {
      return new Date(matchedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return null;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F2D1F]/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#FAF8F2] rounded-3xl shadow-2xl border border-[#DCD2C3] overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="bg-[#0F2D1F] text-[#FAF8F2] px-6 py-4.5 flex items-center justify-between border-b border-[#2D6A4F]/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#FAF8F2] shadow-md">
                <Truck className="w-5 h-5 text-[#52B788]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FAF8F2]">
                    Live Dispatch & Order Tracker
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-[#52B788] px-2 py-0.5 rounded-full font-extrabold uppercase border border-[#52B788]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live DB
                  </span>
                </div>
                <p className="text-xs text-[#FAF8F2]/75">
                  Real-time harvest preparation & temperature-controlled transit
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-[#FAF8F2]/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Box */}
          <div className="p-5 sm:p-6 bg-[#F5EFE6] border-b border-[#EFE8DC] shrink-0">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C6239] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter Order Reference (e.g. GF-10492) or Phone Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/70 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Track Now</span>}
              </button>
            </form>

            {/* Recent Orders Quick Buttons */}
            {recentOrders.length > 0 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto text-[11px] text-[#556960] pt-1">
                <span className="font-bold shrink-0">Your Recent Orders:</span>
                {recentOrders.slice(0, 3).map((o: any) => {
                  const id = o.orderId || o.id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSearchQuery(id);
                        executeTrack(id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] text-[#0F2D1F] font-mono font-bold cursor-pointer transition-colors shrink-0"
                    >
                      #{id}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 pb-10 overflow-y-auto space-y-6 text-[#19241C]">
            {matchedOrder ? (
              <div className="space-y-6">
                {/* Status Header Card */}
                <div className="p-5 rounded-2xl bg-white border border-[#DCD2C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#8C6239] uppercase tracking-wider">
                        Order Reference:
                      </span>
                      <strong className="text-base font-heading font-black text-[#0F2D1F]">
                        #{matchedOrder.id}
                      </strong>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
                          status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : status === 'Shipped' || status === 'Out for Delivery'
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <p className="text-xs text-[#556960] mt-1">
                      Recipient: <strong>{matchedOrder.customer_name}</strong> ({matchedOrder.customer_phone}) • {matchedOrder.city || 'Sanctum'}
                    </p>
                    {lastUpdatedTime && (
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Live DB Sync: {lastUpdatedTime} (auto-refreshing every 7s)
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      title="Print Official Order Receipt"
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] hover:bg-[#EFE8DC] text-[#0F2D1F] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-[#2D6A4F]" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Cancelled Banner */}
                {isCancelled && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                    <div className="text-xs">
                      <strong className="font-bold block">Order Cancelled</strong>
                      <span>This order was cancelled. If you have questions, please reach out to customer support.</span>
                    </div>
                  </div>
                )}

                {/* 4-Stage Visual Logistics Timeline */}
                <div className="bg-white p-6 rounded-2xl border border-[#DCD2C3] space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black tracking-widest uppercase text-[#8C6239]">
                      Cold-Chain Logistics Pipeline
                    </h4>
                    <span className="text-[10px] font-bold text-[#556960] uppercase">
                      Status: {status}
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-8 border-l-2 border-[#DCD2C3]">
                    {stages.map((stage) => {
                      const state = getStageState(stage.key);
                      const timestamp = getStageTimestamp(stage.key);

                      return (
                        <div key={stage.key} className="relative">
                          {/* Circle Icon Badge */}
                          <div
                            className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              state === 'completed'
                                ? 'bg-[#2D6A4F] text-white shadow-sm'
                                : state === 'active'
                                ? 'bg-[#52B788] text-white ring-4 ring-[#52B788]/25 animate-pulse'
                                : 'bg-stone-200 text-stone-500'
                            }`}
                          >
                            {state === 'completed' ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : state === 'active' ? (
                              <Truck className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                          </div>

                          {/* Stage Content */}
                          <div className={`space-y-1 ${state === 'pending' ? 'opacity-55' : ''}`}>
                            <div className="flex items-center justify-between gap-2">
                              <strong
                                className={`text-xs font-black uppercase ${
                                  state === 'completed' || state === 'active'
                                    ? 'text-[#0F2D1F]'
                                    : 'text-stone-600'
                                }`}
                              >
                                {stage.label}
                              </strong>
                              {timestamp && (
                                <span className="text-[11px] font-mono text-[#556960] font-semibold">
                                  {timestamp}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#556960]">{stage.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real Purchased Order Items Card */}
                {matchedOrder.items && matchedOrder.items.length > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-[#DCD2C3] space-y-3">
                    <h4 className="text-xs font-black tracking-widest uppercase text-[#8C6239]">
                      Harvest Items in Package ({matchedOrder.items.length})
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {matchedOrder.items.map((item: any) => (
                        <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-extrabold text-[#0F2D1F]">{item.product_name}</p>
                            <p className="text-[10px] text-[#556960]">
                              {item.selected_weight} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-[#0F2D1F]">₹{item.total_price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#EFE8DC] flex items-center justify-between text-xs font-bold text-[#0F2D1F]">
                      <span>Total Amount Paid ({matchedOrder.payment_method || 'COD'})</span>
                      <span className="text-sm font-black text-[#2D6A4F]">₹{matchedOrder.total_amount}</span>
                    </div>
                  </div>
                )}

                {/* Delivery Address & Slot */}
                {matchedOrder.shipping_address && (
                  <div className="p-4 rounded-2xl bg-white border border-[#DCD2C3] text-xs space-y-1 text-[#556960]">
                    <p className="font-bold text-[#0F2D1F] uppercase tracking-wider text-[10.5px]">
                      Destination Address
                    </p>
                    <p className="font-medium text-[#0F2D1F]">
                      {matchedOrder.shipping_address}, {matchedOrder.city}, {matchedOrder.state} — {matchedOrder.pincode}
                    </p>
                    {matchedOrder.delivery_slot && (
                      <p className="text-[11px] text-[#2D6A4F] font-bold">
                        Slot: {matchedOrder.delivery_slot}
                      </p>
                    )}
                  </div>
                )}

                {/* WhatsApp Support Bar */}
                <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#DCD2C3] flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2 text-[#0F2D1F]">
                    <Phone className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Need to update delivery instructions or speak with dispatch?</span>
                  </div>
                  <a
                    href={`https://wa.me/919866929427?text=Hi%20Garuda%20Farms%2C%20checking%20status%20for%20order%20%23${matchedOrder.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold transition-all shrink-0"
                  >
                    WhatsApp Dispatch
                  </a>
                </div>
              </div>
            ) : errorMsg ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#0F2D1F]">
                  Order Reference Not Found
                </h4>
                <p className="text-xs text-[#556960] max-w-sm mx-auto">
                  {errorMsg}
                </p>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mx-auto">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-base font-bold text-[#0F2D1F]">
                  Check Real-Time Fresh Dispatch Status
                </h4>
                <p className="text-xs text-[#556960] max-w-sm mx-auto">
                  Enter your order reference number or mobile number above to trace your harvest from our fields to your doorstep.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
