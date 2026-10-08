import React, { useState } from 'react';
import { Lock, AlertCircle, ArrowRight, Key } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';

export interface LoginProps {
  onSwitchToSignup?: () => void;
  onPendingEncountered?: (user: UserAccount) => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onPendingEncountered }) => {
  const { login } = useApp();

  const [identifierOrEmail, setIdentifierOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierOrEmail.trim()) {
      setErrorMessage('Please enter your Matric Number or institutional Email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Brief simulation of network verification
    await new Promise((r) => setTimeout(r, 200));

    const result = login(identifierOrEmail, password);

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    // Check if account is in pending state (Statutory Gate)
    if (result.isPending && result.user) {
      if (onPendingEncountered) {
        onPendingEncountered(result.user);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Centered card */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-7 md:p-8 shadow-sm text-[#1A1A1A]">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#1A1A1A] text-[#CBA358] mb-3 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-serif">
            ATBU Faculty of Computing
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#CBA358] font-bold mt-1">
            Project Supervision & Evaluation System
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Sign in with your institutional credentials
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Matric Number, Staff ID, or Email
            </label>
            <div className="relative">
              <input
                type="text"
                id="login-identifier-input"
                value={identifierOrEmail || ''}
                onChange={(e) => setIdentifierOrEmail(e.target.value)}
                placeholder="Enter Matric Number, Staff ID, or Email"
                className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none transition-colors"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[11px] text-stone-400">
                Case-sensitive
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password-input"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none transition-colors pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Submit Button: Gold/Mustard bg-[#CBA358] */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.99] px-5 py-3 text-sm font-bold text-[#1A1A1A] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Verifying Institutional Credentials...</span>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Registration */}
        <div className="mt-5 text-center text-xs text-stone-500">
          New student or staff?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-bold text-[#1A1A1A] hover:text-[#CBA358] underline underline-offset-2 transition-colors ml-1 cursor-pointer"
          >
            Enroll Student / Staff Profile
          </button>
        </div>
      </div>
    </div>
  );
};
