import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { LoginPage } from '../pages/Auth/Login';
import { SignupPage } from '../pages/Auth/Signup';
import { ForgotPasswordPage } from '../pages/Auth/ForgotPassword';

interface AuthModalProps {
  isOpen: boolean;
  initialTab?: 'login' | 'signup' | 'forgot';
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialTab = 'login',
  onClose,
  onAuthenticated,
}) => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup' | 'forgot'>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, isOpen]);

  // When user becomes authenticated, notify parent to close modal and fulfill action
  useEffect(() => {
    if (user && isOpen) {
      onAuthenticated();
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F2D1F]/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[#FAF8F2] rounded-3xl shadow-2xl border border-[#DCD2C3] overflow-hidden z-10 my-8 flex flex-col max-h-[92vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#0F2D1F]/10 hover:bg-[#0F2D1F]/20 text-[#0F2D1F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pill Tab Switcher */}
          {tab !== 'forgot' && (
            <div className="pt-6 px-6 sm:px-8 pb-0">
              <div className="flex bg-[#EFE8DC] p-1 rounded-2xl border border-[#DCD2C3]">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'login'
                      ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm'
                      : 'text-[#8C6239] hover:text-[#0F2D1F]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'signup'
                      ? 'bg-[#2D6A4F] text-[#FAF8F2] shadow-sm'
                      : 'text-[#8C6239] hover:text-[#0F2D1F]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="overflow-y-auto p-2 sm:p-4">
            {tab === 'login' && (
              <LoginPage
                onSwitchToSignup={() => setTab('signup')}
                onSwitchToForgot={() => setTab('forgot')}
                onSuccess={onAuthenticated}
              />
            )}
            {tab === 'signup' && (
              <SignupPage
                onSwitchToLogin={() => setTab('login')}
                onSuccess={onAuthenticated}
              />
            )}
            {tab === 'forgot' && (
              <ForgotPasswordPage
                onSwitchToLogin={() => setTab('login')}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
