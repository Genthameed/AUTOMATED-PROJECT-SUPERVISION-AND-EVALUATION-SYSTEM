import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Login } from './Login';
import { Signup } from './Signup';
import { PendingActivation } from './PendingActivation';
import { UserAccount } from '../../types';

interface AuthModalProps {
  forceOpen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ forceOpen = false }) => {
  const {
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    activeView,
    setActiveView,
  } = useApp();

  const [modalView, setModalView] = useState<'login' | 'signup' | 'pending'>('login');
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  // Sync initial mode from context
  useEffect(() => {
    if (authModalMode === 'register') {
      setModalView('signup');
    } else {
      setModalView('login');
    }
  }, [authModalMode, isAuthModalOpen]);

  // If currentUser is inactive, ensure pending view is ready
  useEffect(() => {
    if (currentUser && currentUser.isActive === false) {
      setPendingUser(currentUser);
      setModalView('pending');
    }
  }, [currentUser]);

  const isModalVisible = isAuthModalOpen || forceOpen;
  if (!isModalVisible) return null;

  const handlePendingEncountered = (user: UserAccount) => {
    setPendingUser(user);
    setModalView('pending');
  };

  const handleRegistrationComplete = (user?: UserAccount) => {
    if (user) {
      setPendingUser(user);
    }
    setModalView('pending');
  };

  const handleActivated = (activatedUser: UserAccount) => {
    setIsAuthModalOpen(false);
    setActiveView('overview');
  };

  const handleClose = () => {
    // Only allow closing if there is an active user logged in
    if (currentUser && currentUser.isActive) {
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-lg my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button (when an active user is already authenticated) */}
        {currentUser && currentUser.isActive && (
          <button
            type="button"
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#1A1A1A] text-white hover:bg-stone-800 shadow-md transition-all cursor-pointer border border-[#E5E2DA]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dynamic Minimalist Auth Screens */}
        {modalView === 'login' && (
          <Login
            onSwitchToSignup={() => {
              setModalView('signup');
              setAuthModalMode('register');
            }}
            onPendingEncountered={handlePendingEncountered}
          />
        )}

        {modalView === 'signup' && (
          <Signup
            onSwitchToLogin={() => {
              setModalView('login');
              setAuthModalMode('login');
            }}
            onRegistrationComplete={handleRegistrationComplete}
          />
        )}

        {modalView === 'pending' && (
          <PendingActivation
            user={pendingUser || currentUser}
            onActivated={handleActivated}
            onSignOut={() => {
              setModalView('login');
              setPendingUser(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
