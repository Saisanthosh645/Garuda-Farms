import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  const farmWhatsAppNumber = '919849012847';
  const prefilledMessage = encodeURIComponent(
    'Namaste Garuda Farms! I would like to inquire about fresh dawn harvests, A2 Bilona Ghee, and farm deliveries.'
  );
  const whatsappUrl = `https://wa.me/${farmWhatsAppNumber}?text=${prefilledMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3 print:hidden">
      {/* Tooltip prompt */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0F2D1F] text-[#FAF8F2] shadow-2xl border border-[#2D6A4F] text-xs font-semibold animate-bounce">
          <span>🌿 Chat with our Farm Sanctum</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-[#FAF8F2]/60 hover:text-white p-0.5"
            aria-label="Dismiss chat tip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Button */}
      <a
        id="floating-whatsapp-btn"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order or Chat on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:scale-108 active:scale-95 transition-all relative group cursor-pointer"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-pulse" />
      </a>
    </div>
  );
};
