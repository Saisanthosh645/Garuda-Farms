import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { GarudaLogo } from '../../components/GarudaLogo';

interface ForgotPasswordPageProps {
  onSwitchToLogin?: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid email address format.' });
      return;
    }

    setLoading(true);
    try {
      const res = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: window.location.origin + '/?reset=true',
      });
      if ((res as any)?.error) {
        setStatusMsg({ type: 'error', text: 'Failed to send reset email. Please verify your address and try again.' });
      } else {
        setStatusMsg({ type: 'success', text: `Password reset link sent! Please check your email (${cleanEmail}).` });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Failed to send password reset email. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FAF8F2] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,45,31,0.15)] border border-[#DCD2C3] relative overflow-hidden"
      >
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <GarudaLogo variant="horizontal" theme="light" size="md" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#2D6A4F]/10 text-[#2D6A4F] flex items-center justify-center mx-auto mt-2">
            <KeyRound className="w-6 h-6 text-[#2D6A4F]" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-tight">
            Reset Password
          </h2>
          <p className="text-xs text-[#556960]">
            Enter your registered email address and we'll send a secure password reset link.
          </p>
        </div>

        {/* Status Alert */}
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </motion.div>
        )}

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@garudafarms.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#2D6A4F]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sending Recovery Email...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Login */}
        {onSwitchToLogin && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#2D6A4F] hover:text-[#1B4332] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
