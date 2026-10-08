import React, { useState } from 'react';
import { Clock, ShieldAlert, RefreshCw, LogOut, User, Building, GraduationCap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';

export interface PendingActivationProps {
  user?: UserAccount | null;
  onActivated?: (user: UserAccount) => void;
  onSignOut?: () => void;
}

export const PendingActivation: React.FC<PendingActivationProps> = ({ user, onActivated, onSignOut }) => {
  const { currentUser, accounts, activateUser, showToast, logout, setActiveView } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const displayUser = user || currentUser;

  const handleCheckStatus = async () => {
    setIsChecking(true);
    setStatusMessage(null);

    await new Promise((r) => setTimeout(r, 600));

    // Look up latest account state in context/storage
    const freshUser = accounts.find(
      (a) => a.id === displayUser?.id || a.identifier === displayUser?.identifier
    );

    setIsChecking(false);

    if (freshUser && freshUser.isActive) {
      showToast(`Account Active! Access granted to ${freshUser.name}.`);
      if (onActivated) {
        onActivated(freshUser);
      } else {
        setActiveView('overview');
      }
    } else {
      setStatusMessage('Status: Still awaiting review. Internal Supervisor has not approved yet.');
    }
  };

  const isStaff = displayUser?.role && displayUser.role !== 'student';

  const handleLogout = () => {
    if (onSignOut) {
      onSignOut();
    } else {
      logout();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4">
      {/* Hyper-minimalist centered card */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-7 md:p-9 shadow-sm text-[#1A1A1A]">
        {/* Amber Clock Icon with Gold Accent */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#FAF5EB] border border-[#EADBBD] text-[#CBA358] mb-3 shadow-xs">
            <Clock className="w-7 h-7 stroke-[2.2] animate-pulse" />
          </div>
          
          <span className="inline-block rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-800 border border-amber-200 mb-2">
            {isStaff ? 'Staff Account Pending Approval' : 'Candidate Account Pending Review'}
          </span>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1A1A1A] font-serif">
            Profile Under Statutory Gate
          </h2>
        </div>

        {/* Required Statutory Notice Text */}
        <div className="rounded-xl border border-[#EADBBD] bg-[#FAF7F0] p-4 text-xs md:text-sm text-[#1A1A1A] text-center font-medium leading-relaxed shadow-2xs">
          {isStaff
            ? '"Your staff enrollment profile has been submitted and is awaiting approval by the Faculty Administrator before supervisory portal access is granted."'
            : '"Your candidate profile is under review. Assigned supervisor and project topic will be designated after approval by the Faculty Administrator."'}
        </div>

        {/* User Record Details */}
        <div className="mt-6 rounded-xl border border-[#E5E2DA] bg-white p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">{isStaff ? 'Staff Name:' : 'Candidate Name:'}</span>
            <span className="font-bold text-[#1A1A1A]">{displayUser?.name || 'Academic Scholar'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">{isStaff ? 'Staff ID:' : 'Matric Number:'}</span>
            <span className="font-mono font-bold text-[#CBA358]">{displayUser?.identifier || 'N/A'}</span>
          </div>

          {displayUser?.phone && (
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-stone-500 font-semibold">Phone Number:</span>
              <span className="font-medium text-stone-800">{displayUser.phone}</span>
            </div>
          )}

          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500 font-semibold">Department:</span>
            <span className="font-medium text-stone-800">{displayUser?.department || 'Department of Computer Science'}</span>
          </div>

          {!isStaff ? (
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-stone-500 font-semibold">Assigned Supervisor:</span>
              <span className="font-medium text-stone-800">
                {displayUser?.assignedSupervisorName || 'Pending Administrator Allocation'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-stone-500 font-semibold">Staff Designation:</span>
              <span className="font-medium text-stone-800">
                {displayUser?.title || 'Academic Staff / Supervisor'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-semibold">Portal Authorization:</span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              Restricted (Awaiting Admin Approval)
            </span>
          </div>
        </div>

        {/* Status Check Feedback Alert */}
        {statusMessage && (
          <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 text-center">
            {statusMessage}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          {/* Refresh / Check Status Button */}
          <button
            type="button"
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.99] px-5 py-3 text-xs md:text-sm font-bold text-[#1A1A1A] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Checking Faculty Registry...' : 'Check Activation Status'}</span>
          </button>

          {/* Sign out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-[#1A1A1A] py-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out or Switch Account</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-[#EAE7DE] text-center text-[11px] text-stone-400">
          Faculty of Computing · Automated Project Supervision and Evaluation System (APSES)
        </div>
      </div>
    </div>
  );
};
