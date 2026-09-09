import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText, Building, Phone, Mail, MapPin } from 'lucide-react';
import { GarudaLogo } from './GarudaLogo';

export interface InvoiceOrderData {
  id: string;
  created_at?: string;
  timestamp?: string;
  customer_name?: string;
  customerName?: string;
  customer_email?: string;
  email?: string;
  customer_phone?: string;
  phone?: string;
  shipping_address?: string;
  address?: string;
  city?: string;
  pincode?: string;
  delivery_slot?: string;
  deliverySlot?: string;
  payment_method?: string;
  paymentMethod?: string;
  payment_status?: string;
  paymentStatus?: string;
  razorpay_payment_id?: string;
  razorpayPaymentId?: string;
  razorpay_order_id?: string;
  items?: Array<{
    id?: string;
    product_name?: string;
    product?: { name: string };
    selected_weight?: string;
    selectedWeight?: string;
    unit_price?: number;
    quantity?: number;
    total_price?: number;
  }>;
  subtotal?: number;
  delivery_charge?: number;
  deliveryFee?: number;
  discount_amount?: number;
  discount?: number;
  total_amount?: number;
  total?: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: InvoiceOrderData | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const orderId = order.id || (order as any).orderId || 'GF-00000';
  const customerName = order.customer_name || order.customerName || 'Valued Patron';
  const customerEmail = order.customer_email || order.email || 'N/A';
  const customerPhone = order.customer_phone || order.phone || 'N/A';
  const address = order.shipping_address || order.address || 'Sanctum Delivery';
  const city = order.city || 'Hyderabad';
  const pincode = order.pincode || '';
  const slot = order.delivery_slot || order.deliverySlot || 'Dawn Farm Express (6:00 AM – 9:00 AM)';
  const paymentMethod = order.payment_method || order.paymentMethod || 'COD';
  const paymentStatus = order.payment_status || order.paymentStatus || 'Pending';
  const razorpayPayId = order.razorpay_payment_id || order.razorpayPaymentId || '';

  const rawSubtotal = Number(order.subtotal || 0);
  const rawDelivery = Number(order.delivery_charge || order.deliveryFee || 0);
  const rawDiscount = Number(order.discount_amount || order.discount || 0);
  const rawTotal = Number(order.total_amount || order.total || 0);

  // Compute GST 5% Breakdown (CGST 2.5% + SGST 2.5%)
  const gstRate = 0.05;
  const taxableAmount = rawSubtotal > 0 ? (rawSubtotal / (1 + gstRate)) : 0;
  const totalGst = rawSubtotal - taxableAmount;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;

  const dateStr = order.created_at || order.timestamp || new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    const printContent = document.getElementById('printable-invoice');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Garuda_Farms_Tax_Invoice_${orderId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Cinzel:wght@700;900&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #19241c;
              background: #ffffff;
              margin: 0;
              padding: 15px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .font-heading { font-family: 'Cinzel', serif; }
            .print\\:hidden { display: none !important; }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 800px; margin: 0 auto;">
            ${printContent.innerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div id="printable-invoice-wrapper" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F2D1F]/80 backdrop-blur-sm print:hidden"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-[#DCD2C3] z-10 my-6 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:my-0 print:rounded-none"
        >
          {/* Header Action Bar (Hidden in Print) */}
          <div className="bg-[#0F2D1F] text-[#FAF8F2] px-6 py-4 flex items-center justify-between border-b border-[#2D6A4F]/40 shrink-0 print:hidden">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#52B788]" />
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#FAF8F2]">
                Official GST Tax Invoice — #{orderId}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-[#2D6A4F] hover:bg-[#52B788] text-white hover:text-[#0F2D1F] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-[#FAF8F2] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-[#19241C] print:overflow-visible print:p-6" id="printable-invoice">
            {/* Top Brand Header */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-stone-200 pb-6">
              <div>
                <GarudaLogo variant="horizontal" theme="light" size="lg" />
                <p className="text-xs text-stone-500 mt-2 max-w-sm leading-relaxed">
                  Garuda Farms Agro Pvt Ltd • Single-Origin Vedic Agriculture
                </p>
                <div className="text-[11px] text-stone-500 space-y-0.5 mt-2">
                  <p>📍 Mudimyala, Chevella, Rangareddy, TS 501503</p>
                  <p>📞 +91 98669 29427 • ✉️ harvest@garudafarms.com</p>
                  <p className="font-semibold text-emerald-800">🛡️ FSSAI Certified • 100% Pesticide Free</p>
                </div>
              </div>

              <div className="text-left sm:text-right bg-stone-50 p-4 rounded-2xl border border-stone-200 min-w-[220px]">
                <span className="px-2.5 py-1 rounded bg-[#0F2D1F] text-[#52B788] font-mono font-extrabold text-[10px] uppercase tracking-widest block w-max sm:ml-auto mb-2">
                  TAX INVOICE
                </span>
                <h4 className="font-heading text-lg font-black text-[#0F2D1F]">#{orderId}</h4>
                <p className="text-xs text-stone-500">Date: {dateStr}</p>
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  Status: {paymentStatus.toUpperCase() === 'PAID' ? '✅ Paid & Verified' : '⏳ Cash on Delivery'}
                </p>
                {razorpayPayId && (
                  <p className="text-[10px] font-mono text-stone-500 mt-1 truncate">
                    Ref: {razorpayPayId}
                  </p>
                )}
              </div>
            </div>

            {/* Recipient & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-[#8C6239] text-[10px] block mb-1">
                  BILLED & SHIPPED TO:
                </span>
                <strong className="text-sm text-[#0F2D1F] font-bold block">{customerName}</strong>
                <p className="text-stone-600">{address}</p>
                <p className="text-stone-600">{city} {pincode ? `— ${pincode}` : ''}</p>
                <p className="text-stone-500">📞 {customerPhone} | ✉️ {customerEmail}</p>
              </div>

              <div className="space-y-1 sm:border-l sm:border-stone-200 sm:pl-6">
                <span className="font-bold uppercase tracking-wider text-[#8C6239] text-[10px] block mb-1">
                  HARVEST DISPATCH DETAILS:
                </span>
                <p><strong className="text-stone-700">Delivery Slot:</strong> {slot}</p>
                <p><strong className="text-stone-700">Payment Method:</strong> {paymentMethod}</p>
                <p><strong className="text-stone-700">Dispatch Type:</strong> Chilled Farm Express</p>
                <p><strong className="text-stone-700">GST Registration:</strong> Exempt (Agricultural Produce)</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div>
              <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0F2D1F] mb-2">
                Order Items & Quantity
              </h5>
              <div className="overflow-x-auto rounded-2xl border border-stone-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0F2D1F] text-[#FAF8F2] font-semibold text-[11px]">
                      <th className="p-3">#</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Weight / Unit</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {(order.items || []).map((item, idx) => {
                      const name = item.product_name || item.product?.name || 'Farm Product';
                      const weight = item.selected_weight || item.selectedWeight || '1 Pack';
                      const price = Number(item.unit_price || 0);
                      const qty = Number(item.quantity || 1);
                      const total = Number(item.total_price || price * qty);

                      return (
                        <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-3 font-mono text-stone-400">{idx + 1}</td>
                          <td className="p-3 font-semibold text-[#0F2D1F]">{name}</td>
                          <td className="p-3 text-stone-600 font-mono text-[11px]">{weight}</td>
                          <td className="p-3 text-right font-mono">₹{price.toFixed(2)}</td>
                          <td className="p-3 text-center font-bold">{qty}</td>
                          <td className="p-3 text-right font-bold font-mono">₹{total.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-stone-200 pt-4">
              <div className="text-xs text-stone-500 space-y-1 max-w-xs">
                <p className="font-bold text-[#0F2D1F]">Notes & Guarantee:</p>
                <p>All produce is harvested direct from Garuda Sanctuary. 100% purity and cold-chain freshness guaranteed.</p>
              </div>

              <div className="w-full sm:w-72 bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Items Subtotal:</span>
                  <span className="font-mono">₹{rawSubtotal.toFixed(2)}</span>
                </div>

                {taxableAmount > 0 && (
                  <>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>Taxable Value:</span>
                      <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>CGST (2.5%):</span>
                      <span className="font-mono">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-400 text-[10px]">
                      <span>SGST (2.5%):</span>
                      <span className="font-mono">₹{sgst.toFixed(2)}</span>
                    </div>
                  </>
                )}

                {rawDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount Code Applied:</span>
                    <span className="font-mono">-₹{rawDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>Delivery Charge:</span>
                  <span className="font-mono">
                    {rawDelivery === 0 ? 'FREE' : `₹${rawDelivery.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-[#0F2D1F] border-t border-stone-300 pt-2">
                  <span>Final Invoice Total:</span>
                  <span className="font-mono text-emerald-800">₹{rawTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Official Signature Seal & Footer */}
            <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-stone-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="font-bold text-[#0F2D1F]">Authorized Garuda Seal</p>
                  <p className="text-[10px]">Computer generated official tax invoice. No physical signature required.</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-[#0F2D1F]">Garuda Farms Agro Pvt Ltd</p>
                <p className="text-[10px] text-stone-400">Chevella Sanctuary, Hyderabad, India</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
