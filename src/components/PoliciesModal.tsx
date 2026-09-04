import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Truck, RefreshCw, FileText, Award } from 'lucide-react';

export type PolicyTab = 'shipping' | 'refund' | 'privacy' | 'terms' | 'certifications';

interface PoliciesModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  initialTab = 'shipping',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

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
          className="fixed inset-0 bg-[#0F2D1F]/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-[#FAF8F2] rounded-3xl shadow-2xl border border-[#DCD2C3] overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#0F2D1F] text-[#FAF8F2] px-6 py-5 flex items-center justify-between border-b border-[#2D6A4F]/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#FAF8F2]">
                <ShieldCheck className="w-5 h-5 text-[#52B788]" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FAF8F2]">
                  Garuda Farms Trust & Policies
                </h3>
                <p className="text-xs text-[#FAF8F2]/70">
                  Transparency, Purity, and Customer Rights
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#EFE8DC] overflow-x-auto shrink-0 bg-[#F5EFE6]">
            {[
              { id: 'shipping', label: 'Cold-Chain Shipping', icon: Truck },
              { id: 'refund', label: 'Freshness Guarantee', icon: RefreshCw },
              { id: 'certifications', label: 'Lab & FSSAI Certs', icon: Award },
              { id: 'privacy', label: 'Privacy Policy', icon: FileText },
              { id: 'terms', label: 'Terms of Service', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PolicyTab)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-[#2D6A4F] text-[#0F2D1F] bg-[#FAF8F2] rounded-t-xl'
                      : 'border-transparent text-[#556960] hover:text-[#0F2D1F]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-[#8C6239]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#19241C] text-sm leading-relaxed">
            {activeTab === 'shipping' && (
              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#0F2D1F] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#2D6A4F]" />
                  <span>Cold-Chain & Dawn Harvest Dispatch Policy</span>
                </h4>
                <p className="text-[#556960]">
                  To protect the live enzymes, essential fatty acids in our A2 milk, and natural aroma of cold-pressed harvests, we maintain an unbroken farm-to-table cold chain.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-1.5">
                    <strong className="text-xs font-black text-[#0F2D1F] uppercase tracking-wide block">
                      🌅 Dawn Harvest & Dispatch
                    </strong>
                    <p className="text-xs text-[#556960]">
                      Leafy greens, pastured eggs, and fresh A2 milk are harvested between 4:00 AM and 6:00 AM, packed into insulated containers, and dispatched within hours.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-1.5">
                    <strong className="text-xs font-black text-[#0F2D1F] uppercase tracking-wide block">
                      ❄️ Temperature Monitored Vans
                    </strong>
                    <p className="text-xs text-[#556960]">
                      All chilled dairy and perishable produce are transported in dedicated refrigerated vehicles maintained at 4°C to 8°C.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-1.5">
                    <strong className="text-xs font-black text-[#0F2D1F] uppercase tracking-wide block">
                      🚚 Free Dispatch Threshold
                    </strong>
                    <p className="text-xs text-[#556960]">
                      Orders above ₹499 receive 100% complimentary chilled delivery. Standard dispatch fee of ₹49 applies for smaller lots.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-1.5">
                    <strong className="text-xs font-black text-[#0F2D1F] uppercase tracking-wide block">
                      ⏱️ Chosen Delivery Slots
                    </strong>
                    <p className="text-xs text-[#556960]">
                      You can select Morning (6-9 AM), Afternoon (12-3 PM), or Evening (5-8 PM) slots during checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'refund' && (
              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#0F2D1F] flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#2D6A4F]" />
                  <span>100% Freshness & Satisfaction Guarantee</span>
                </h4>
                <p className="text-[#556960]">
                  We stand behind the authenticity and vitality of every item raised on our fields. If you are not completely delighted with the taste, texture, or quality, we make it right immediately.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <h5 className="font-bold text-xs uppercase text-[#0F2D1F] mb-1">
                      No-Questions-Asked Replacements
                    </h5>
                    <p className="text-xs text-[#2D6A4F]">
                      If any pastured egg, A2 milk bottle, or vegetable is damaged in transit or does not meet our highest standards, simply message us on WhatsApp with your Order ID within 24 hours. We will send an immediate fresh replacement or full refund to your original payment method.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC]">
                    <h5 className="font-bold text-xs uppercase text-[#0F2D1F] mb-1">
                      Refund Timelines
                    </h5>
                    <p className="text-xs text-[#556960]">
                      Online payment refunds are initiated instantly and credited back to your bank account, UPI, or card within 2 to 4 business days.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#0F2D1F] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#2D6A4F]" />
                  <span>Regulatory Licenses & Quality Standards</span>
                </h4>
                <p className="text-[#556960]">
                  Garuda Farms is fully licensed and audited under national and international organic food standards.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-2">
                    <span className="px-2.5 py-1 rounded bg-[#2D6A4F]/10 text-[#2D6A4F] text-[11px] font-mono font-bold">
                      FSSAI Central License
                    </span>
                    <h5 className="font-bold text-sm text-[#0F2D1F]">FSSAI Lic. #13621014000382</h5>
                    <p className="text-xs text-[#556960]">
                      Licensed for organic processing, A2 dairy bottling, cold oil pressing, and hygienic packaging.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-2">
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[11px] font-mono font-bold">
                      Jaivik Bharat / NPOP
                    </span>
                    <h5 className="font-bold text-sm text-[#0F2D1F]">National Programme for Organic Production</h5>
                    <p className="text-xs text-[#556960]">
                      100% free of synthetic fertilizers, chemical insecticides, growth hormones, and GMO seeds.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-2">
                    <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-900 text-[11px] font-mono font-bold">
                      A2 Gir DNA Testing
                    </span>
                    <h5 className="font-bold text-sm text-[#0F2D1F]">Pure Beta-Casein Verification</h5>
                    <p className="text-xs text-[#556960]">
                      Every cow in our herd is genetically verified for pure A2/A2 beta-casein protein and zero A1 mutation.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#EFE8DC] space-y-2">
                    <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-900 text-[11px] font-mono font-bold">
                      Third-Party Lab Tests
                    </span>
                    <h5 className="font-bold text-sm text-[#0F2D1F]">Zero Heavy Metals & Residual Solvents</h5>
                    <p className="text-xs text-[#556960]">
                      Batch-tested by NABL accredited laboratories. Test reports available upon request for every lot.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#0F2D1F]">Privacy & Data Protection Policy</h4>
                <p className="text-xs text-[#556960] leading-relaxed">
                  Garuda Farms Agro Pvt Ltd is committed to respecting your privacy in accordance with the Digital Personal Data Protection (DPDP) Act of India and international standards.
                </p>
                <div className="space-y-3 text-xs text-[#556960]">
                  <p>
                    <strong>1. Information Collected:</strong> When you place an order, we collect your name, delivery address, phone number, and email strictly for fulfilling and tracking your deliveries.
                  </p>
                  <p>
                    <strong>2. Payment Security:</strong> We never store credit card, debit card, or UPI PIN information on our servers. All transactions are securely processed using PCI-DSS Level 1 compliant gateway infrastructure.
                  </p>
                  <p>
                    <strong>3. No Sale of Data:</strong> We will never sell, rent, or trade your personal data to third-party advertisers.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <h4 className="font-heading text-xl font-bold text-[#0F2D1F]">Terms of Service</h4>
                <p className="text-xs text-[#556960] leading-relaxed">
                  By accessing and ordering from Garuda Farms, you agree to the following terms regarding fresh farm harvests and artisanal goods.
                </p>
                <div className="space-y-3 text-xs text-[#556960]">
                  <p>
                    <strong>1. Natural Product Variations:</strong> As our products are unadulterated and free of artificial coloring or stabilizers, seasonal variations in ghee color, honey texture, or vegetable sizes are natural hallmarks of authentic farming.
                  </p>
                  <p>
                    <strong>2. Delivery Availability:</strong> Perishable products are subject to daily dawn harvest availability. In the rare event of crop failure or heavy weather, we will notify you immediately and issue an alternate delivery slot or refund.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#FAF8F2] border-t border-[#EFE8DC] flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#0F2D1F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
