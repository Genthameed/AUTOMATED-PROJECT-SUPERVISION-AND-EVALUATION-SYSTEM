import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { MainShell } from './components/layout/MainShell';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { AuthPortalGate } from './components/auth/AuthPortalGate';
import { PendingActivation } from './components/auth/PendingActivation';
import { PasswordResetModal } from './components/auth/PasswordResetModal';
import { StatutoryToastContainer } from './components/common/StatutoryToastContainer';

const AppContent: React.FC = () => {
  const { currentUser, quickToast } = useApp();

  // STRICT LOGIN LOCKING:
  // If no authenticated user session exists, display the dedicated University Login Gate!
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#0B132B] text-slate-900 antialiased overflow-y-auto">
        <AuthPortalGate />
        <StatutoryToastContainer />
        {quickToast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-slate-800 animate-in fade-in slide-in-from-bottom-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{quickToast}</span>
          </div>
        )}
      </div>
    );
  }

  // If user account is registered but pending supervisor review
  if (currentUser.isActive === false) {
    return (
      <div className="min-h-screen w-full bg-[#0B132B] flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <PendingActivation user={currentUser} />
        </div>
        <StatutoryToastContainer />
        {quickToast && (
          <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-slate-800 animate-in fade-in slide-in-from-bottom-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{quickToast}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#F4F5F7] text-slate-900 antialiased overflow-hidden select-none">
      {/* Sticky Top Navigation Bar */}
      <TopBar />

      {/* Primary Viewport: Sidebar + Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <MainShell />
      </div>

      {/* Global Notification Slide-out Drawer */}
      <NotificationDrawer />

      {/* Mandatory Password Reset Modal for Temporary Passwords */}
      <PasswordResetModal />

      {/* Statutory Toast Feedback Container */}
      <StatutoryToastContainer />

      {/* Toast Feedback Alert */}
      {quickToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl ring-1 ring-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{quickToast}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
