import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Check, Sparkles, Send } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-[#FAF8F2] text-[#19241C] relative border-t border-[#E8DFC8]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#FDFBF7] rounded-3xl p-8 sm:p-12 border border-[#DCD2C3] shadow-[0_8px_30px_rgba(15,45,31,0.05)] relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center mx-auto mb-4 text-[#2D6A4F]">
            <Mail className="w-6 h-6" />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#8C6239] block mb-2">
            THE GARUDA FARM CHRONICLE
          </span>

          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-[#0F2D1F]">
            STAY CONNECTED TO THE FARM.
          </h2>

          <p className="text-sm sm:text-base text-[#556960] mt-2 max-w-lg mx-auto">
            Receive seasonal harvest alerts, early booking for seasonal Alphonso mangoes, and traditional recipes directly in your inbox.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-4 rounded-2xl bg-[#52B788]/15 border border-[#52B788]/40 text-[#0F2D1F] flex items-center justify-center gap-3 text-sm font-bold max-w-md mx-auto"
            >
              <Check className="w-5 h-5 text-[#2D6A4F]" />
              <span>Welcome to the Garuda Farms Family! First harvest alert on its way.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 max-w-md mx-auto space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="newsletter-email-input"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="flex-1 px-5 py-3.5 rounded-full bg-[#FAF8F2] border border-[#DCD2C3] text-sm text-[#0F2D1F] placeholder-[#889B92] focus:outline-none focus:border-[#2D6A4F] shadow-inner"
                />
                <button
                  id="newsletter-submit-btn"
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#2D6A4F] hover:bg-[#1B4332] text-[#FAF8F2] text-xs font-extrabold tracking-widest uppercase shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <span>SUBSCRIBE</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              {error && <p className="text-xs text-[#E76F51] text-left pl-4 font-semibold">{error}</p>}
              <p className="text-[11px] text-[#889B92] mt-2">
                🌱 We respect your privacy. No spam, unsubscribe at any time.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
