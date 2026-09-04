import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck, Heart } from 'lucide-react';
import { GarudaLogo } from './GarudaLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdmin }) => {
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

            {/* Brand Value Pillars from Logo */}
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

            <div className="flex items-center gap-3 pt-1">
              <span className="px-3 py-1 rounded-full bg-[#143D2B] border border-[#2D6A4F] text-[11px] text-[#52B788] font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Lic. #13621014000382
              </span>
              <span className="px-3 py-1 rounded-full bg-[#143D2B] border border-[#2D6A4F] text-[11px] text-[#D4A373] font-bold">
                100% Pesticide Free
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#FAF8F2]/75">
              {['hero', 'about', 'products', 'farm-story', 'sustainability', 'testimonials'].map((id) => (
                <li key={id}>
                  <button
                    onClick={() => onNavigate(id)}
                    className="hover:text-[#D4A373] transition-colors capitalize"
                  >
                    {id.replace('-', ' ')}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Farm Categories */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Fresh Harvests
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#FAF8F2]/75">
              <li>Pasture Farm Eggs & Nati Kodi</li>
              <li>Free Grazed Mutton & Keema</li>
              <li>A2 Vedic Desi Gir Cow Milk & Ghee</li>
              <li>Fresh Button & Oyster Mushrooms</li>
              <li>Raw Forest Honey & Honeycomb</li>
              <li>Single Origin Sona Masoori & Ragi</li>
            </ul>
          </div>

          {/* Farm Contact & Hours */}
          <div className="space-y-3">
            <h4 className="font-heading text-sm font-bold tracking-widest text-[#D4A373] uppercase">
              Farm Sanctum
            </h4>
            <div className="space-y-2.5 text-xs text-[#FAF8F2]/75">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>Survey #42, Chevella Valley Green Belt, Telangana 501503</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>+91 98490 12847 / +91 40 2384 9000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4A373] shrink-0" />
                <span>harvest@garudafarms.com</span>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="#footer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#143D2B] hover:bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#footer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#143D2B] hover:bg-[#2D6A4F] text-[#FAF8F2] flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#footer"
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
                className="hover:text-[#52B788] transition-colors flex items-center gap-1 font-semibold underline underline-offset-4 decoration-[#52B788]/40"
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
