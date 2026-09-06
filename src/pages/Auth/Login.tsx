import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { GarudaLogo } from '../../components/GarudaLogo';
import supabase from '../../lib/supabaseClient';

interface LoginPageProps {
  onSwitchToSignup?: () => void;
  onSwitchToForgot?: () => void;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToSignup,
  onSwitchToForgot,
  onSuccess,
}) => {
  const auth = useAuth();
  const { signIn } = auth;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (auth.user && onSuccess) {
      onSuccess();
    }
  }, [auth.user, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await signIn({ email: cleanEmail, password: cleanPassword });
      if ((res as any)?.error) {
        // Secure generic message: do not reveal whether email exists
        setError('Invalid email or password.');
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) setError(error.message);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#FAF8F2] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,45,31,0.15)] border border-[#DCD2C3] relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#C49A45]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#2D6A4F]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <GarudaLogo variant="horizontal" theme="light" size="md" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-[#556960]">
            Sign in to access your fresh daily deliveries & farm patron account
          </p>
        </div>

        {/* Google 1-Click Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-2xl bg-white border border-[#DCD2C3] hover:border-[#2D6A4F] text-[#0F2D1F] text-xs font-extrabold tracking-wide flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60 group"
        >
          {googleLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-[#2D6A4F]" />
          ) : (
            <>
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center my-5 text-[11px] text-[#8C6239] font-bold uppercase tracking-wider">
          <div className="flex-1 border-t border-[#DCD2C3]" />
          <span className="px-3 bg-[#FAF8F2]">Or with Email</span>
          <div className="flex-1 border-t border-[#DCD2C3]" />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@garudafarms.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider">
                Password
              </label>
              {onSwitchToForgot && (
                <button
                  type="button"
                  onClick={onSwitchToForgot}
                  className="text-[11px] font-extrabold text-[#2D6A4F] hover:text-[#1B4332] transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#2D6A4F]/25 hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In To Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Signup */}
        {onSwitchToSignup && (
          <div className="mt-5 text-center text-xs text-[#556960]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-extrabold text-[#2D6A4F] hover:underline cursor-pointer ml-1"
            >
              Create Farm Account
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t border-[#DCD2C3] flex items-center justify-between text-[10px] text-[#556960] font-bold">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#2D6A4F]" /> 256-Bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C49A45]" /> Certified A2 Farm
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
