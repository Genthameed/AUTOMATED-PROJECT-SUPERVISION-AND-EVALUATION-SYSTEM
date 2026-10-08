import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Menu, 
  Search, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Users, 
  SlidersHorizontal,
  Check,
  Building2,
  Sparkles,
  ExternalLink,
  LogOut,
  UserPlus,
  LogIn,
  Cpu,
  Cloud,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { ROLE_PROFILES } from '../../data/mockData';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';
import { CloudSyncStatusModal } from '../common/CloudSyncStatusModal';

const ROLE_OPTIONS: { role: UserRole; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    role: 'student',
    label: 'Student Portal',
    desc: 'Candidate topic, submissions & defense tracks',
    icon: GraduationCap,
  },
  {
    role: 'internal_supervisor',
    label: 'Internal Supervisor',
    desc: 'Allocated supervisees, chapter reviews & clearance',
    icon: UserCheck,
  },
  {
    role: 'panel_member',
    label: 'Panel Member',
    desc: 'Proposal & internal defense rubric scoring',
    icon: Users,
  },
  {
    role: 'external_supervisor',
    label: 'External Supervisor',
    desc: 'Visiting moderator & final viva defense scoring',
    icon: ShieldCheck,
  },
  {
    role: 'admin',
    label: 'Administrator',
    desc: 'Faculty records, scheduling, allocations & audit logs',
    icon: SlidersHorizontal,
  },
];

export const TopBar: React.FC = () => {
  const { 
    currentUser,
    currentRole, 
    setRole, 
    currentProfile, 
    unreadCount, 
    setIsNotificationDrawerOpen,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    searchQuery,
    setSearchQuery,
    logout,
    setIsAuthModalOpen,
    setAuthModalMode,
    setAuthModalRole
  } = useApp();

  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setIsRoleMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentRoleInfo = ROLE_OPTIONS.find(r => r.role === currentRole) || ROLE_OPTIONS[0];
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200/80 bg-white/95 px-2.5 sm:px-4 md:px-6 backdrop-blur">
      {/* Left: Mobile hamburger & Faculty Branding */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
        <button
          id="mobile-menu-toggle-btn"
          type="button"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:outline-none lg:hidden"
          aria-label="Toggle mobile navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-700">
            <Cpu className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-slate-900 text-xs sm:text-sm md:text-base truncate">
                Department of Computer Science
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200 shrink-0">
                Faculty of Computing
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block truncate">
              Automated Project Supervision & Evaluation System
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Search Bar (Desktop) */}
      <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="global-portal-search-input"
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate, matric, pathogen topic..."
            className="w-full rounded-full border border-slate-200 bg-slate-100/70 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Academic Session, Role Switcher, Notifications, User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
        {/* Session Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>2025/2026 Session</span>
        </div>

        {/* LOCKED INSTITUTIONAL IDENTITY BADGE */}
        <div className="relative" ref={roleMenuRef}>
          <button
            id="role-status-badge-btn"
            type="button"
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-slate-100/90 hover:bg-slate-200/70 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 shrink-0 cursor-pointer shadow-2xs"
            title="Institutional authorization is locked to your account"
          >
            <CurrentRoleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600 shrink-0" />
            <span className="hidden sm:inline font-bold">{currentRoleInfo.label}</span>
            <span className="sm:hidden font-bold text-[11px]">{currentRole.replace('_', ' ')}</span>
            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 px-1.5 py-0.5 text-[10px] font-bold">
              <Lock className="w-2.5 h-2.5 text-emerald-700" />
              Locked
            </span>
          </button>

          {isRoleMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Role Switcher Locked</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Your session is strictly bound to your authenticated institutional profile (<strong>{currentUser?.name || currentRoleInfo.label}</strong>).
                  </p>
                </div>
              </div>

              <div className="py-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Institutional ID:</span>
                  <span className="font-mono font-bold text-slate-800">{currentUser?.identifier || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Role:</span>
                  <span className="font-bold text-blue-700">{currentRoleInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">{currentUser?.department || 'Computer Science'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRoleMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-2 text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out to Switch Persona</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CLOUD FIRESTORE STATUS PILL */}
        <button
          type="button"
          onClick={() => setIsCloudModalOpen(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 text-xs font-semibold transition-all shadow-2xs"
          title="Google Cloud Firestore database connection status"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden md:inline">Cloud DB:</span> Live
        </button>

        {/* NOTIFICATION BELL */}
        <button
          id="topbar-notification-bell-btn"
          type="button"
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:outline-none"
          aria-label="Workflow Alerts"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* USER PROFILE AVATAR & FLYOUT OR LOGIN TRIGGER */}
        {currentUser ? (
          <div className="relative shrink-0" ref={profileMenuRef}>
            <button
              id="topbar-user-profile-btn"
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 rounded-full p-0.5 sm:p-1 hover:bg-stone-100 focus:outline-none shrink-0"
            >
              <img
                src={normalizeIconicAvatar(currentProfile.avatar, currentProfile.role)}
                alt={currentProfile.name}
                className="h-8 w-8 rounded-full object-contain p-0.5 bg-stone-100 ring-2 ring-blue-500/40 shrink-0"
              />
              <div className="hidden text-left md:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {currentProfile.name}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-slate-500 leading-tight">
                  {currentProfile.identifier}
                </p>
              </div>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-slate-400" />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-slate-200 bg-white p-3 shadow-xl ring-1 ring-black/5 focus:outline-none z-50">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <img
                    src={normalizeIconicAvatar(currentProfile.avatar, currentProfile.role)}
                    alt={currentProfile.name}
                    className="h-11 w-11 rounded-full object-contain p-0.5 bg-stone-100 ring-2 ring-blue-600"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {currentProfile.name}
                    </p>
                    <p className="text-[11px] font-mono text-blue-700 font-bold">
                      {currentProfile.identifier}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {currentProfile.email}
                    </p>
                  </div>
                </div>

                <div className="py-2 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px] text-right">{currentProfile.department}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-400">Role:</span>
                    <span className="font-semibold uppercase text-blue-700">{currentProfile.role.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Status:</span>
                    <span className="font-medium text-emerald-700 truncate max-w-[150px] text-right">{currentProfile.status || 'Active'}</span>
                  </div>
                </div>

                {/* Account & Auth Actions */}
                <div className="mt-2 border-t border-slate-100 pt-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-blue-600" />
                    <span>Create New Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setAuthModalMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <LogIn className="h-3.5 w-3.5 text-slate-500" />
                    <span>Switch / Sign In as Other</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNotificationDrawerOpen(true);
                      setIsProfileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    <span>Activity Logs & Alerts</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {unreadCount} unread
                    </span>
                  </button>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      id="topbar-sign-out-btn"
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <CloudSyncStatusModal 
        isOpen={isCloudModalOpen} 
        onClose={() => setIsCloudModalOpen(false)} 
      />
    </header>
  );
};
