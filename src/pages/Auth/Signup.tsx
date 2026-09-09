import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { GarudaLogo } from '../../components/GarudaLogo';
import supabase from '../../lib/supabaseClient';
import { api } from '../../lib/api';

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

  // OTP Verification States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | undefined>();
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (auth.user && onSuccess) {
      onSuccess();
    }
  }, [auth.user, onSuccess]);

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

  // Step 1: Validate details and send Mobile OTP
  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const trimmedPassword = password;
    const trimmedConfirm = confirm;

    if (!trimmedName || !trimmedEmail || !cleanPhone || !trimmedPassword || !trimmedConfirm) {
      setError('All fields (Full Name, Email, Mobile Phone, Password, and Confirm Password) are required.');
      return;
    }

    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      setError('Full Name must contain letters and spaces only.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. patron@garudafarms.com).');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (e.g. 9866929427).');
      return;
    }

    if (trimmedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(trimmedPassword) || !/[a-z]/.test(trimmedPassword) || !/[0-9]/.test(trimmedPassword) || !/[^A-Za-z0-9]/.test(trimmedPassword)) {
      setError('Password must contain upper, lower, number, and special character.');
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
      const otpRes = await api.sendPhoneOtp(cleanPhone);
      if (!otpRes.ok) {
        setError(otpRes.error || 'Failed to dispatch verification OTP. Please try again.');
        return;
      }

      setWhatsappLink(otpRes.whatsappLink);
      setShowOtpScreen(true);
    } catch (err: any) {
      setError(err?.message || 'OTP dispatch failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(null);
    setResendMessage(null);
    const cleanPhone = phone.trim().replace(/\D/g, '');
    try {
      const otpRes = await api.sendPhoneOtp(cleanPhone);
      if (otpRes.ok) {
        setWhatsappLink(otpRes.whatsappLink);
        setResendMessage(`New OTP sent to +91 ${cleanPhone}`);
      } else {
        setError(otpRes.error || 'Failed to resend OTP.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to resend OTP.');
    }
  };

  // Step 2: Verify OTP and Register Account
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendMessage(null);

    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your mobile phone.');
      return;
    }

    setOtpLoading(true);

    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const verifyRes = await api.verifyPhoneOtp(cleanPhone, cleanOtp);

      if (!verifyRes.ok) {
        setError(verifyRes.error || 'Invalid OTP code. Please try again.');
        return;
      }

      // OTP Verified! Complete Registration via Auth Provider
      const res = await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: cleanPhone,
      });

      const userData = (res as any)?.data?.user;
      const errorObj = (res as any)?.error;

      const isExistingAccount =
        (userData && Array.isArray(userData.identities) && userData.identities.length === 0) ||
        (errorObj && (
          errorObj.message?.toLowerCase().includes('already registered') ||
          errorObj.message?.toLowerCase().includes('already in use') ||
          errorObj.message?.toLowerCase().includes('already exists') ||
          errorObj.code === 'user_already_exists'
        ));

      if (isExistingAccount) {
        setError('Account already exists with this email/phone. Please Sign In.');
        setShowOtpScreen(false);
        return;
      }

      if (errorObj) {
        setError(errorObj.message || 'Account creation failed.');
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Account verification failed.');
    } finally {
      setOtpLoading(false);
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
        {/* Decorative Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#52B788]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[#C49A45]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <GarudaLogo variant="horizontal" theme="light" size="md" />
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#0F2D1F] tracking-tight">
            {showOtpScreen ? 'Verify Mobile OTP' : 'Join The Sanctum'}
          </h2>
          <p className="text-xs text-[#556960]">
            {showOtpScreen
              ? `We sent a 6-digit code to +91 ${phone.replace(/\D/g, '')}`
              : 'Get 10% instant discount & farm-gate morning express delivery'}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Notice */}
        {resendMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{resendMessage}</span>
          </div>
        )}

        {showOtpScreen ? (
          /* STEP 2: OTP Verification Screen */
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <Smartphone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#DCD2C3] text-center text-lg font-mono tracking-[0.3em] text-[#0F2D1F] font-bold focus:outline-none focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#2D6A4F]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {otpLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Mobile...</span>
                </>
              ) : (
                <>
                  <span>Verify & Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Direct WhatsApp link & Resend Actions */}
            <div className="pt-2 space-y-2 text-center text-xs">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 font-bold flex items-center justify-center gap-2 transition-all block"
                >
                  💬 Receive / View OTP via WhatsApp
                </a>
              )}

              <div className="flex items-center justify-between pt-2 text-[#556960]">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-[#2D6A4F] hover:underline cursor-pointer"
                >
                  Resend OTP Code
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="font-semibold text-stone-500 hover:underline cursor-pointer"
                >
                  Change Details
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* STEP 1: Details Entry Form */
          <>
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

            <div className="flex items-center my-4 text-[11px] text-[#8C6239] font-bold uppercase tracking-wider">
              <div className="flex-1 border-t border-[#DCD2C3]" />
              <span className="px-3 bg-[#FAF8F2]">Or Manual Signup</span>
              <div className="flex-1 border-t border-[#DCD2C3]" />
            </div>

            <form onSubmit={handleSubmitDetails} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                  Mobile Number (Mandatory for OTP Verification)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit Indian mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-extrabold uppercase text-[#8C6239] tracking-wider block mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2D6A4F]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#DCD2C3] text-xs font-semibold text-[#0F2D1F] focus:outline-none focus:border-[#2D6A4F]"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px] font-extrabold">
                    <span className="text-[#556960]">Security Rating:</span>
                    <span className="text-[#0F2D1F]">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2D6A4F] via-[#387656] to-[#52B788] hover:from-[#1B4332] hover:to-[#2D6A4F] text-[#FAF8F2] text-xs font-black tracking-widest uppercase shadow-lg shadow-[#2D6A4F]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Mobile OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Mobile Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

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