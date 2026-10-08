/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Statutory Toast Notification Container (StatutoryToastContainer.jsx)
 * 
 * Subscribes to toastManager and displays bespoke notification badges, including
 * the requested stark red error toast:
 * bg-[#1A1A1A] border-rose-600 text-rose-500
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Award, X } from 'lucide-react';
import { toastManager } from '../../services/statutoryActions';

export function StatutoryToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((newToast) => {
      setToasts((prev) => [newToast, ...prev]);

      // Auto dismiss after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isGold = toast.type === 'gold';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all animate-in slide-in-from-bottom-3 duration-200 ${toast.bgClass}`}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {isError ? (
                <ShieldAlert className="w-5 h-5 text-rose-500 animate-pulse" />
              ) : isGold ? (
                <Award className="w-5 h-5 text-[#CBA358]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {toast.title}
                </h4>
                {toast.code && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-400">
                    {toast.code}
                  </span>
                )}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-95">
                {toast.message}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="shrink-0 p-1 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
