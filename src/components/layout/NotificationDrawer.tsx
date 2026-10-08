import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Calendar, 
  FileCheck2, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markAsRead,
    markAllAsRead,
    setActiveView,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'actions'>('all');

  if (!isNotificationDrawerOpen) return null;

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'unread') return !notif.read;
    if (activeFilter === 'actions') return !!notif.actionLabel;
    return true;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'defense':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'clearance':
        return <ShieldCheck className="h-4 w-4 text-emerald-600" />;
      case 'document':
        return <FileText className="h-4 w-4 text-amber-600" />;
      case 'topic':
        return <FileCheck2 className="h-4 w-4 text-sky-600" />;
      default:
        return <Info className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Workflow Alerts & Notices</h2>
                <p className="text-xs text-slate-500">Automated project lifecycle notifications</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Filter tabs & quick actions */}
          <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 bg-white">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unread')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'unread'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unread ({notifications.filter(n => !n.read).length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('actions')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeFilter === 'actions'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Action Items
              </button>
            </div>

            <button
              type="button"
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <CheckCheck className="h-8 w-8 mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No alerts found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You are completely up to date with project deadlines.</p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`group relative rounded-xl border p-3.5 transition-all duration-150 cursor-pointer ${
                    item.read
                      ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      : 'border-blue-200 bg-blue-50/30 hover:bg-blue-50/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-xs">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.timestamp}
                        </span>

                        {item.actionLabel && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                              if (item.targetView) {
                                setActiveView(item.targetView);
                              }
                              setIsNotificationDrawerOpen(false);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                          >
                            <span>{item.actionLabel}</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] text-slate-500">
              Departmental Notification Dispatcher · Faculty of Computing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
