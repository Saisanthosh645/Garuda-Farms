import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Phone, Mail, Clock, Calendar, CheckCircle2, Send, Navigation } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorDate, setVisitorDate] = useState('');
  const [visitorsCount, setVisitorsCount] = useState('2');
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const handleBookVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone || !visitorDate) return;
    setIsBooked(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl bg-[#FAF8F2] rounded-3xl shadow-2xl border border-[#DCD2C3] overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#0F2D1F] text-[#FAF8F2] px-6 py-5 flex items-center justify-between border-b border-[#2D6A4F]/40 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-[#FAF8F2]">
                <MapPin className="w-5 h-5 text-[#52B788]" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#FAF8F2]">
                  Farm Sanctum & Gaushala Visits
                </h3>
                <p className="text-xs text-[#FAF8F2]/70">
                  Chevella Valley Natural Sanctuary, Telangana
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

          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#19241C]">
            {/* Quick Contact Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <a
                href="tel:+919849012847"
                className="p-3.5 rounded-2xl bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-[#2D6A4F] text-[#2D6A4F] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C6239] block">Call Sanctum</span>
                  <strong className="text-xs text-[#0F2D1F] block">+91 98490 12847</strong>
                </div>
              </a>

              <a
                href="mailto:harvest@garudafarms.com"
                className="p-3.5 rounded-2xl bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-[#2D6A4F] text-[#2D6A4F] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C6239] block">Email Desk</span>
                  <strong className="text-xs text-[#0F2D1F] block truncate">harvest@garudafarms.com</strong>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=Chevella+Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-2xl bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-[#2D6A4F] text-[#2D6A4F] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8C6239] block">GPS Navigation</span>
                  <strong className="text-xs text-[#0F2D1F] block">Chevella Valley, TS</strong>
                </div>
              </a>
            </div>

            {/* Book a Farm Tour Form */}
            <div className="p-6 rounded-2xl bg-white border border-[#DCD2C3] space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#2D6A4F]" />
                <h4 className="font-heading text-base font-bold text-[#0F2D1F]">
                  Book a Weekend Guided Gaushala & Harvest Tour
                </h4>
              </div>
              <p className="text-xs text-[#556960] leading-relaxed">
                Bring your family to pet our indigenous Gir cows, watch traditional Bilona butter churning, and pick fresh seasonal vegetables straight from the soil. Tours are free for patron families.
              </p>

              {isBooked ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <strong className="text-sm font-bold text-[#0F2D1F] block">
                    Farm Visit Reserved for {visitorName}!
                  </strong>
                  <p className="text-xs text-emerald-800">
                    We have reserved your slot for {visitorDate} ({visitorsCount} Guests). Our sanctuary coordinator will WhatsApp directions and gate pass details.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookVisit} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Sharma"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        WhatsApp Mobile No.
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit Mobile"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Preferred Saturday / Sunday Date
                      </label>
                      <input
                        type="date"
                        required
                        value={visitorDate}
                        onChange={(e) => setVisitorDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-[#8C6239] block mb-1">
                        Number of Guests
                      </label>
                      <select
                        value={visitorsCount}
                        onChange={(e) => setVisitorsCount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F2] border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                      >
                        <option value="1">1 Person</option>
                        <option value="2">2 Persons (Couple)</option>
                        <option value="4">Family (3-4 Persons)</option>
                        <option value="6">Group (5+ Persons)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm Free Weekend Farm Visit</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Farm Visiting Hours */}
            <div className="p-4 rounded-2xl bg-[#F5EFE6] border border-[#DCD2C3] flex items-center justify-between text-xs text-[#556960]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8C6239]" />
                <span>Visiting Hours: Saturdays & Sundays 07:00 AM – 11:30 AM (Prior gate reservation required)</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
