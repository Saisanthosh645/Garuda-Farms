import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck, Heart, Truck, RefreshCw, Award, FileText, Calendar } from 'lucide-react';
import { GarudaLogo } from './GarudaLogo';
import { PolicyTab } from './PoliciesModal';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
  onOpenPolicies?: (tab: PolicyTab) => void;
  onOpenTrackOrder?: () => void;
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenAdmin,
  onOpenPolicies,
  onOpenTrackOrder,
  onOpenContact,
}) => {
  return (
    <footer id="footer" className="bg-[#0A1F15] text-[#FAF8F2] pt-20 pb-12 border-t border-[#1B4332] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <GarudaLogo variant="horizontal" theme="dark" size="lg" />

            <p className="text-sm text-[#FAF8F2]/70 max-w-sm leading-relaxed">
              From Our Farm to Your Home. Pure, unadulterated, single-origin Indian agriculture raised in harmony with nature and ancient Vedic wisdom.
            </p>

            {/* Brand Value Pillars */}
            <div className="flex flex-wrap items-center gap-2.5 py-1 text-[11px] font-bold text-[#FAF8F2]/80">
              <span className="flex items-center gap-1 text-[#52B788]">
                <span>🌿</span> PURE BY NATURE
              </span>
              <span className="text-[#D4A373]/50">•</span>
              <span className="flex items-center gap-1 text-[#D4A373]">
                <span>🛡️</span> ETHICAL BY CHOICE
              </span>
              <span className="text-[#D4A373]/50">•</span>
              <span className="flex items-center gap-1 text-[#FAF8F2]/90">
                <span>🤝</span> GROWN WITH CARE
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenPolicies?.('certifications')}
                className="px-3 py-1 rounded-full bg-[#143D2B] border border-[#2D6A4F] text-[11px] text-[#52B788] font-bold flex items-center gap-1.5 hover:bg-[#1B4332] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Lic. #13621014000382
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicies?.('certifications')}
                className="px-3 py-1 rounded-full bg-[#143D2B] border border-[#2D6A4F] text-[11px] text-[#D4A373] font-bold hover:bg-[#1B4332] transition-colors cursor-pointer"
              >
                100% Pesticide Free
              </button>
            </div>
          </div>

          {/* Quick Navigation & Order Tracking */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Explore Farm
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#FAF8F2]/75">
              <li>
                <button
                  onClick={() => onNavigate('products')}
                  className="hover:text-[#D4A373] transition-colors capitalize cursor-pointer text-left"
                >
                  All 50 Organic Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('farm-story')}
                  className="hover:text-[#D4A373] transition-colors capitalize cursor-pointer text-left"
                >
                  Vedic Farming Process
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('sustainability')}
                  className="hover:text-[#D4A373] transition-colors capitalize cursor-pointer text-left"
                >
                  Soil & Water Sanctuary
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('testimonials')}
                  className="hover:text-[#D4A373] transition-colors capitalize cursor-pointer text-left"
                >
                  Patron Reviews
                </button>
              </li>
              <li className="pt-2 border-t border-white/10">
                <button
                  onClick={onOpenTrackOrder}
                  className="text-[#52B788] hover:text-[#74C69D] font-bold flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Live Order / Dispatch</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Trust, Guarantee & Legal Policies */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Trust & Policies
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#FAF8F2]/75">
              <li>
                <button
                  onClick={() => onOpenPolicies?.('shipping')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Truck className="w-3 h-3 text-[#52B788]" />
                  <span>Cold-Chain Shipping</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies?.('refund')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-[#D4A373]" />
                  <span>Freshness Guarantee</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies?.('certifications')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-[#52B788]" />
                  <span>FSSAI & NPOP Licenses</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies?.('privacy')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-stone-400" />
                  <span>Privacy Policy (DPDP)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicies?.('terms')}
                  className="hover:text-[#D4A373] transition-colors cursor-pointer text-left flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3 text-stone-400" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Farm Contact & Booking */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Farm Sanctum
            </h4>
            <div className="space-y-2.5 text-xs text-[#FAF8F2]/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>Survey #42, Chevella Valley Green Belt, Telangana 501503</span>
              </div>
              <a
                href="tel:+919849012847"
                className="flex items-center gap-2.5 hover:text-[#52B788] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>+91 98490 12847</span>
              </a>
              <a
                href="mailto:harvest@garudafarms.com"
                className="flex items-center gap-2.5 hover:text-[#52B788] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>harvest@garudafarms.com</span>
              </a>

              <div className="pt-2">
                <button
                  onClick={onOpenContact}
                  className="w-full py-2 px-3 rounded-xl bg-[#143D2B] border border-[#2D6A4F] hover:bg-[#2D6A4F] text-[#52B788] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Gaushala Tour</span>
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#143D2B] hover:bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#143D2B] hover:bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#143D2B] hover:bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F2]/60">
          <p>© {new Date().getFullYear()} Garuda Farms Agro Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {onOpenAdmin && (
              <button
                id="footer-admin-btn"
                onClick={onOpenAdmin}
                className="hover:text-[#52B788] transition-colors flex items-center gap-1 font-semibold underline underline-offset-4 decoration-[#52B788]/40 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#52B788]" />
                <span>Admin Console</span>
              </button>
            )}
            <div className="flex items-center gap-1">
              <span>Crafted with reverence for nature and traditional farmers</span>
              <Heart className="w-3.5 h-3.5 text-[#E76F51] fill-[#E76F51] inline ml-1" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
