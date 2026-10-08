import React, { useState } from 'react';
import { 
  Cloud, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Database, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Calendar, 
  Award, 
  LogIn, 
  LogOut,
  ExternalLink,
  Layers,
  Activity
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CloudSyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudSyncStatusModal: React.FC<CloudSyncStatusModalProps> = ({ isOpen, onClose }) => {
  const { cloudSyncStatus, loginWithGoogleAuth, logoutGoogleAuth, pushAllToCloud, accounts, senateBroadsheet, defenseSessions } = useApp();
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);

  if (!isOpen) return null;

  const handleManualPush = async () => {
    setIsPushing(true);
    setPushSuccess(false);
    try {
      await pushAllToCloud();
      setPushSuccess(true);
      setTimeout(() => setPushSuccess(false), 4000);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Live Cloud Database Connection
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Google Cloud Firestore · Enterprise Document Database
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Status summary banner */}
          <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-400 block font-medium">Project ID</span>
                <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 text-[11px]">gen-lang-client-0437128035</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Sync Engine</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Real-time onSnapshot
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Database ID</span>
                <span className="font-mono text-[10px] text-stone-600 dark:text-stone-300 truncate block">
                  ai-studio-academicprojecto-...
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Last Cloud Pulse</span>
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  {cloudSyncStatus.lastSyncedAt 
                    ? cloudSyncStatus.lastSyncedAt.toLocaleTimeString()
                    : 'Real-time sync active'}
                </span>
              </div>
            </div>
          </div>

          {/* Synchronized Collections List */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Synchronized Collections (All Roles)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Users className="w-3.5 h-3.5 text-blue-500" /> Users & Accounts
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{accounts.length}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Research Projects
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">Live</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Layers className="w-3.5 h-3.5 text-purple-500" /> Chapters 1–5
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">Synchronized</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Defense Sessions
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{defenseSessions.length}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> External Viva Scores
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">Captured</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-900">
                <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
                  <Award className="w-3.5 h-3.5 text-[#CBA358]" /> Senate Broadsheet
                </span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{senateBroadsheet.length}</span>
              </div>
            </div>
          </div>

          {/* Google Auth status */}
          <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                Google Authentication
              </span>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {cloudSyncStatus.cloudUser 
                  ? `Signed in as ${cloudSyncStatus.cloudUser.email}`
                  : 'Link a Google Account for cloud administration identity'}
              </span>
            </div>
            {cloudSyncStatus.cloudUser ? (
              <button
                type="button"
                onClick={logoutGoogleAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogleAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign in with Google
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 flex items-center justify-between">
          <p className="text-[11px] text-stone-500 dark:text-stone-400">
            {pushSuccess ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All departmental data mirrored in Cloud Firestore!
              </span>
            ) : (
              'Changes across all devices are captured in real time.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualPush}
              disabled={isPushing}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#CBA358] hover:bg-[#b58f44] text-stone-950 text-xs font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
              {isPushing ? 'Syncing to Cloud...' : 'Sync All to Cloud'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
