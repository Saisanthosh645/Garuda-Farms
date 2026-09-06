import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, CheckCircle2, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { GarudaLogo } from '../../components/GarudaLogo';
import supabase from '../../lib/supabaseClient';

interface SignupPageProps {
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const auth = useAuth();
  const { signUp } = auth;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (auth.user && onSuccess) {
      onSuccess();
    }
  }, [auth.user, onSuccess]);

  // Live Password Strength Calculation (Min 8 chars, Upper, Lower, Number, Special)
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: 'bg-stone-200' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 3) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 4) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong (Secure)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Required fields check
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const cleanPhone = phone.trim().replace(/\D/g, ''); // digits only
    const trimmedPassword = password;
    const trimmedConfirm = confirm;

    if (!trimmedName || !trimmedEmail || !cleanPhone || !trimmedPassword || !trimmedConfirm) {
      setError('All fields (Full Name, Email, Mobile Phone, Password, and Confirm Password) are required.');
      return;
    }

    // 2. Name validation: Letters and spaces only
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      setError('Full Name must contain letters and spaces only (no numbers or special characters).');
      return;
    }

    // 3. Email validation format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. patron@garudafarms.com).');
      return;
    }

    // 4. Phone validation: Accept numbers only, exactly 10 digits for Indian mobile numbers
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number (numbers only, e.g. 9866929427).');
      return;
    }

    // 5. Password validation: Min 8 characters, uppercase, lowercase, number, special char
    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const hasUpper = /[A-Z]/.test(trimmedPassword);
    const hasLower = /[a-z]/.test(trimmedPassword);
    const hasNumber = /[0-9]/.test(trimmedPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(trimmedPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError(
        'Password must contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character (e.g. @, #, $, !).'
      );
      return;
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!accepted) {
      setError('Please accept the terms of service to create your account.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        fullName: trimmedName,
        phone: cleanPhone,
      });

      const userData = (res as any)?.data?.user;
      const errorObj = (res as any)?.error;

      // Supabase returns identities: [] when email already exists in Auth!
      const isExistingAccount =
        (userData && Array.isArray(userData.identities) && userData.identities.length === 0) ||
        (errorObj && (
          errorObj.message?.toLowerCase().includes('already registered') ||
          errorObj.message?.toLowerCase().includes('already in use') ||
          errorObj.message?.toLowerCase().includes('already exists') ||
          errorObj.message?.toLowerCase().includes('duplicate') ||
          errorObj.code === 'user_already_exists'
        ));

      if (isExistingAccount) {
        setError('Account already exists. Please Login.');
        return;
      }

      if (errorObj) {
        setError('Account creation failed. Please check your details and try again.');
        return;
      }

      // Successful signup
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const rawErr: string = err?.message || '';
      if (
        rawErr.toLowerCase().includes('already registered') ||
        rawErr.toLowerCase().includes('already in use') ||
        rawErr.toLowerCase().includes('exists')
      ) {
        setError('Account already exists. Please Login.');
      } else {
        setError('Account creation failed. Please check your details and try again.');
      }
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
        {/* Decorative Top Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#52B788]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#C49A45]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <GarudaLogo variant="horizontal" theme="light" size="md" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-tight">
            Join The Sanctum
          </h2>
          <p className="text-xs text-[#556960]">
            Get 10% instant discount & farm-gate morning express delivery
          </p>
        </div>

        {/* Google OAuth Button */}
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
        <div className="flex items-center my-4 text-[11px] text-[#8C6239] font-bold uppercase tracking-wider">
          <div className="flex-1 border-t border-[#DCD2C3]" />
          <span className="px-3 bg-[#FAF8F2]">Or Fill Details</span>
          <div className="flex-1 border-t border-[#DCD2C3]" />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-start gap-2.5 shadow-sm"
          >
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-extrabold text-[#0F2D1F]">{error}</p>
              {error.includes('Account already exists') && onSwitchToLogin && (
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="mt-1 px-3.5 py-1.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                >
                  <span>Please Login →</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1">
                Mobile (+91)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C6239] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98490 12847"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength Meter Bar */}
            {password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-[#556960]">{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-black text-[#0F2D1F] uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C6239] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-bold text-[#0F2D1F] placeholder-[#8C6239]/50 focus:outline-none focus:border-[#2D6A4F] transition-all"
              />
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms-check"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 rounded border-[#DCD2C3] text-[#2D6A4F] focus:ring-[#2D6A4F]"
            />
            <label htmlFor="terms-check" className="text-[11px] text-[#556960] leading-snug cursor-pointer select-none">
              I agree to Garuda Farms <span className="font-bold text-[#0F2D1F]">Terms of Service</span> & <span className="font-bold text-[#0F2D1F]">Privacy Policy</span>.
            </label>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Farm Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login */}
        {onSwitchToLogin && (
          <div className="mt-5 text-center text-xs text-[#556960]">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-extrabold text-[#2D6A4F] hover:underline cursor-pointer ml-1"
            >
              Sign In Here
            </button>
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-5 pt-4 border-t border-[#DCD2C3] flex items-center justify-between text-[10px] text-[#556960] font-bold">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#52B788]" /> 10% First Order Discount
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#2D6A4F]" /> Encrypted Credentials
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;