import React, { useState } from 'react';
import { 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PasswordResetModal: React.FC = () => {
  const { 
    isPasswordResetModalOpen, 
    setIsPasswordResetModalOpen, 
    pendingPasswordResetUser, 
    resetUserPassword,
    currentUser
  } = useApp();

  const user = pendingPasswordResetUser || currentUser;

  const [currentTempPassword, setCurrentTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPasswordResetModalOpen || !user) return null;

  const roleLabels: Record<string, string> = {
    student: 'Student (Candidate)',
    internal_supervisor: 'Internal Supervisor',
    external_supervisor: 'External Supervisor',
    panel_member: 'Defense Panel Member',
    admin: 'Faculty Administrator',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 5) {
      setErrorMessage('New password must be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match. Please verify.');
      return;
    }

    // Check if new password is same as temporary
    if (user.temporaryPassword && newPassword === user.temporaryPassword) {
      setErrorMessage('Your new password cannot be the same as the temporary password.');
      return;
    }

    setIsSubmitting(true);
    const result = resetUserPassword(user.id, newPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    // Reset local state
    setNewPassword('');
    setConfirmPassword('');
    setCurrentTempPassword('');
    setErrorMessage(null);
  };

  return (
    <div id="password-reset-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div 
        id="password-reset-modal-card"
        className="relative w-full max-w-md rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-5 sm:p-6 shadow-2xl text-[#1A1A1A] space-y-4 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
            <Key className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">
                Reset Temporary Password
              </h2>
              <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                Action Required
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Please choose a secure permanent password to continue
            </p>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-1.5 text-xs shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Account Name:</span>
            <span className="font-bold text-stone-900">{user.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Supervisory Category / Role:</span>
            <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {roleLabels[user.role] || user.role}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500">Official Identifier:</span>
            <span className="font-mono font-bold text-[#CBA358]">{user.identifier}</span>
          </div>
        </div>

        {/* Explanatory callout */}
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
          <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Your administrator provided an initial temporary password for your onboarding. For system security, set your personal permanent password below.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              New Permanent Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="reset-new-password-input"
                value={newPassword || ''}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter at least 5 characters..."
                className="w-full rounded-xl border border-[#D9D4C7] bg-white pl-9 pr-10 py-2.5 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">Must be at least 5 characters in length</p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="reset-confirm-password-input"
                value={confirmPassword || ''}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password..."
                className="w-full rounded-xl border border-[#D9D4C7] bg-white pl-9 pr-10 py-2.5 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                required
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="submit-password-reset-btn"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] py-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Password & Access Portal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
