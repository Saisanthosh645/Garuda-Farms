import React from 'react';
import { Phone, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer id="footer" className="bg-[#0A1F15] text-[#FAF8F2] pt-20 pb-12 border-t border-[#1B4332] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A373] to-[#2D6A4F] p-[1.5px]">
                <div className="w-full h-full rounded-full bg-[#0F2D1F] flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 38C14 26 24 16 32 10C26 22 28 32 14 38Z" fill="#D4A373" />
                    <path d="M50 38C50 26 40 16 32 10C38 22 36 32 50 38Z" fill="#E9C46A" />
                    <path d="M32 20V52" stroke="#52B788" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-[0.18em] text-[#FAF8F2] block leading-none">
                  GARUDA
                </span>
                <span className="text-[10px] tracking-[0.3em] font-semibold text-[#D4A373] uppercase block mt-1">
                  FARMS
                </span>
              </div>
            </div>

            <p className="text-sm text-[#FAF8F2]/70 max-w-sm leading-relaxed">
              From Our Farm to Your Home. Pure, unadulterated, single-origin Indian agriculture raised in harmony with nature and ancient Vedic wisdom.
            </p>

            <div className="flex items-center gap-3 pt-2">
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
          <div className="flex items-center gap-1">
            <span>Crafted with reverence for nature and traditional farmers</span>
            <Heart className="w-3.5 h-3.5 text-[#E76F51] fill-[#E76F51] inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
