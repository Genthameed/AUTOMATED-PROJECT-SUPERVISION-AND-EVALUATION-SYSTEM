import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GitMerge,
  Users,
  ShieldCheck,
  Award,
  Users2,
  FileCheck,
  Files,
  CalendarClock,
  Stamp,
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  History,
  GraduationCap,
  FileCheck2,
  FolderGit2,
  UserCheck,
  Split,
  CalendarRange,
  BarChart3,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Info,
  Clock,
  Briefcase,
  LogOut,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_NAV_ITEMS } from '../../data/mockData';
import { NavItem } from '../../types';

// Map icon names to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  FileText,
  GitMerge,
  Users,
  ShieldCheck,
  Award,
  Users2,
  FileCheck,
  Files,
  CalendarClock,
  Stamp,
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  History,
  GraduationCap,
  FileCheck2,
  FolderGit2,
  UserCheck,
  Split,
  CalendarRange,
  BarChart3,
  ShieldAlert,
};

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentRole,
    activeView,
    setActiveView,
    currentProfile,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
  } = useApp();

  const navItems = ROLE_NAV_ITEMS[currentRole] || [];

  const getBadgeClass = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'danger':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'info':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const roleLabels: Record<string, string> = {
    student: 'Computer Science Student',
    internal_supervisor: 'Faculty Supervision',
    panel_member: 'Defense Panel Board',
    external_supervisor: 'External Moderation',
    admin: 'Department Directorate',
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto py-4">
      {/* Top section: Role header & Nav list */}
      <div className="px-3">
        {/* Role Category Banner */}
        <div className="mb-4 px-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {roleLabels[currentRole]}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {navItems.length} Sections
            </span>
          </div>
          {!isSidebarCollapsed && (
            <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
              {currentProfile.title || currentProfile.name}
            </p>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item: NavItem) => {
            const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-btn-${item.id}`}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={item.label}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white" />
                )}

                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />

                {!isSidebarCollapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-tight uppercase whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-700 text-blue-100 border-blue-500'
                            : getBadgeClass(item.badgeVariant)
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Role context card & Academic Session status */}
      <div className="mt-6 px-3 space-y-3">
        {/* Session Metadata Card */}
        {!isSidebarCollapsed && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                <span>Account Profile</span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="text-[10px] font-bold text-rose-600 hover:text-rose-800"
                title="Sign out and return to university portal gate"
              >
                Sign Out
              </button>
            </div>

            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p className="truncate font-semibold text-slate-800">{currentProfile.name}</p>
              <p>ID: <span className="font-mono text-indigo-700">{currentProfile.identifier}</span></p>
              <p>Dept: <span className="text-slate-700 truncate">{currentProfile.department}</span></p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
              {currentUser?.role === 'admin' ? (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-indigo-600"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Onboard</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 font-mono">APSES Auth v2.6</span>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800"
              >
                <LogOut className="h-3 w-3" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        )}

        {/* Academic Session indicator */}
        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              {!isSidebarCollapsed && (
                <div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    2025/2026 Academic Session
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Active Workflow</p>
                </div>
              )}
            </div>

            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 shrink-0 select-none ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Slide-out Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span className="font-extrabold text-slate-900 text-sm">Dept. of Computer Science</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
