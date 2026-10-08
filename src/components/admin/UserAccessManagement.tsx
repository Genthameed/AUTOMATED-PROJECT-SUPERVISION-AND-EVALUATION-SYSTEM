import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserCheck, 
  AlertTriangle,
  UserX,
  Mail,
  Key,
  Shield,
  UserPlus,
  BookOpen,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
  Users,
  Cloud,
  Database,
  UserCog,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserAccount } from '../../types';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';
import { AdminOnboardingModal } from './AdminOnboardingModal';
import { SupervisorAllocationModal } from './SupervisorAllocationModal';
import { AssignStaffRoleModal } from './AssignStaffRoleModal';
import { CloudSyncStatusModal } from '../common/CloudSyncStatusModal';

const generateTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '23456789';
  let rand = '';
  for (let i = 0; i < 3; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 3; i++) {
    rand += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return `CSC@2026#${rand}`;
};

export const UserAccessManagement: React.FC = () => {
  const {
    accounts,
    toggleUserStatus,
    deleteUser,
    issueTemporaryPassword,
    showToast,
    currentUser,
    refreshAccountsFromCloud,
    updateUserRole,
    cloudSyncStatus
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'staff_only' | 'students_only' | 'pending'>('all');
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isCloudStatusOpen, setIsCloudStatusOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserAccount | null>(null);
  const [isRefreshingCloud, setIsRefreshingCloud] = useState(false);

  // Password visibility tracking per user ID
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  // Issue temporary password modal state
  const [tempPassTargetUser, setTempPassTargetUser] = useState<UserAccount | null>(null);
  const [newTempPasswordInput, setNewTempPasswordInput] = useState('');
  const [modalCopied, setModalCopied] = useState(false);

  // Supervisor allocation modal state
  const [allocationTargetStudent, setAllocationTargetStudent] = useState<UserAccount | null>(null);

  // Confirmation modal state for deletion
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyText = (text: string, userId?: string) => {
    navigator.clipboard.writeText(text);
    if (userId) {
      setCopiedUserId(userId);
      setTimeout(() => setCopiedUserId(null), 2000);
    } else {
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    }
  };

  const openTempPasswordModal = (user: UserAccount) => {
    setTempPassTargetUser(user);
    setNewTempPasswordInput(generateTempPassword());
    setModalCopied(false);
  };

  const handleSaveIssuedTempPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempPassTargetUser) return;
    if (!newTempPasswordInput.trim() || newTempPasswordInput.trim().length < 4) {
      showToast('Temporary password must be at least 4 characters.');
      return;
    }

    issueTemporaryPassword(tempPassTargetUser.id, newTempPasswordInput.trim());
    setTempPassTargetUser(null);
  };

  const handleRefreshFromDatabase = async () => {
    setIsRefreshingCloud(true);
    try {
      const res = await refreshAccountsFromCloud();
      if (res.success) {
        showToast(`Cloud Sync Complete: Fetched ${res.count} staff and student records directly from Firestore.`);
      }
    } catch (e) {
      showToast('Failed to fetch from cloud database.');
    } finally {
      setIsRefreshingCloud(false);
    }
  };

  const filteredAccounts = accounts.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.title && user.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.department && user.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.institution && user.institution.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategoryTab === 'all' ||
      (activeCategoryTab === 'staff_only' && user.role !== 'student') ||
      (activeCategoryTab === 'students_only' && user.role === 'student') ||
      (activeCategoryTab === 'pending' && !user.isActive);

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'suspended' && !user.isActive);

    return matchesSearch && matchesCategory && matchesRole && matchesStatus;
  });

  const staffAccounts = accounts.filter(a => a.role !== 'student');
  const candidateAccounts = accounts.filter(a => a.role === 'student');
  const pendingAccounts = accounts.filter(a => !a.isActive);
  const adminAccounts = accounts.filter(a => a.role === 'admin');

  const handleToggleStatus = (userId: string, currentStatus: boolean, userName: string) => {
    toggleUserStatus(userId);
    if (currentStatus) {
      showToast(`Account Suspended: ${userName}'s portal access has been revoked.`);
    } else {
      showToast(`Account Activated: ${userName}'s portal access is now operational.`);
    }
  };

  const handleDeleteConfirm = (userId: string, userName: string) => {
    deleteUser(userId);
    setDeleteCandidateId(null);
    showToast(`Account Deleted: ${userName} has been removed from faculty registry.`);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
            <GraduationCap className="w-3 h-3" />
            Candidate
          </span>
        );
      case 'internal_supervisor':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
            <UserCheck className="w-3 h-3 text-amber-600" />
            Internal Supervisor
          </span>
        );
      case 'external_supervisor':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            External Supervisor
          </span>
        );
      case 'panel_member':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            <Users className="w-3 h-3" />
            Panel Member
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold text-stone-800 border border-stone-300">
            <Shield className="w-3 h-3 text-[#CBA358]" />
            Administrator
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE7DE] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1A1A] text-[#CBA358] shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-[#1A1A1A] font-serif">
                  Master User Access & Supervision Registry
                </h1>
                <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-[11px] font-bold text-stone-800">
                  {accounts.length} Total Users
                </span>
                <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 text-[11px] font-bold">
                  {staffAccounts.length} Staff ({adminAccounts.length} Admins)
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Assign & delegate staff roles, grant Admin directorate access, and fetch records directly from Cloud Firestore
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Fetch Freshly From Database */}
            <button
              type="button"
              onClick={handleRefreshFromDatabase}
              disabled={isRefreshingCloud}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 active:scale-[0.98] text-blue-900 px-3 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Query & fetch all user and staff records freshly from Google Cloud Firestore database"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-blue-600 ${isRefreshingCloud ? 'animate-spin' : ''}`} />
              <span>{isRefreshingCloud ? 'Fetching DB...' : 'Fetch from Database'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCloudStatusOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-3 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="View Google Cloud Firestore synchronization status"
            >
              <Cloud className="h-3.5 w-3.5 text-emerald-600" />
              <span>Cloud DB Live</span>
            </button>

            <button
              type="button"
              id="admin-open-onboard-btn"
              onClick={() => setIsOnboardingModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] text-[#1A1A1A] px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4 stroke-[2.5]" />
              <span>+ Onboard Member</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Quick Search Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              type="button"
              onClick={() => { setActiveCategoryTab('all'); setRoleFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Registry ({accounts.length})
            </button>
            <button
              type="button"
              onClick={() => { setActiveCategoryTab('staff_only'); setRoleFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategoryTab === 'staff_only'
                  ? 'bg-[#1A1A1A] text-[#CBA358] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#CBA358]" />
              <span>Staff & Faculty ({staffAccounts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveCategoryTab('students_only'); setRoleFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategoryTab === 'students_only'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Candidates ({candidateAccounts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveCategoryTab('pending'); setRoleFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategoryTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Approval ({pendingAccounts.length})</span>
            </button>
          </div>

          {/* Search & Select dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                id="search-user-input"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, name, matric/staff ID..."
                className="rounded-xl border border-[#D9D4C7] bg-white pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none min-w-[200px]"
              />
            </div>

            <select
              id="role-filter-select"
              value={roleFilter || 'all'}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="rounded-xl border border-[#D9D4C7] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="internal_supervisor">Internal Supervisors</option>
              <option value="panel_member">Panel Members</option>
              <option value="external_supervisor">External Supervisors</option>
              <option value="student">Students (Candidates)</option>
            </select>

            <select
              id="status-filter-select"
              value={statusFilter || 'all'}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-xl border border-[#D9D4C7] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Operational)</option>
              <option value="suspended">Suspended / Inactive</option>
            </select>
          </div>
        </div>

        {/* Informational Guidance Callout */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <Key className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                Temporary Password Provisioning & Supervisory Categorization:
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Internal Supervisors guide departmental laboratory research; External Supervisors moderate independent assessments. Administrators can issue or reset temporary passwords for any user, which they can use to log in and subsequently change to a permanent password.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#FAF7F0] border-b border-[#E5E2DA] text-[11px] uppercase font-bold text-stone-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">User & Identifiers</th>
                <th className="py-3.5 px-4">Supervisorship & Role</th>
                <th className="py-3.5 px-4">Affiliation & Allocations</th>
                <th className="py-3.5 px-4">Initial Credentials / Password</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Administrative Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredAccounts.map((user) => {
                const isCurrentLoggedIn = currentUser?.id === user.id;
                const activePassword = user.temporaryPassword || user.password || 'password123';
                const isRevealed = !!revealedPasswords[user.id];
                const isCopied = copiedUserId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-[#FAF9F5] transition-colors">
                    {/* User & Identifiers */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={normalizeIconicAvatar(user.avatar, user.role)}
                          alt={user.name}
                          className="h-10 w-10 rounded-full border border-stone-200 object-contain p-0.5 bg-stone-100"
                        />
                        <div>
                          <div className="font-bold text-[#1A1A1A] text-sm flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrentLoggedIn && (
                              <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-[#CBA358] font-bold">
                              {user.identifier}
                            </span>
                            <span className="text-[11px] text-stone-400">·</span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                          </div>

                          {(user.projectTopic || user.specialization) && (
                            <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-[#EADBBD] bg-[#FAF7F0] px-2 py-1 text-[11px] text-stone-700 max-w-sm">
                              <BookOpen className="h-3 w-3 text-[#CBA358] shrink-0 mt-0.5" />
                              <span className="line-clamp-1 font-medium">
                                <strong className="text-stone-800 font-bold">Topic/Domain:</strong> {user.projectTopic || user.specialization}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Supervisorship & Role */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getRoleBadge(user.role)}
                        {user.role === 'admin' && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                            Directorate
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-600 font-medium mt-1">
                        {user.title || (user.role === 'student' ? 'Undergraduate Candidate' : 'Faculty Member')}
                      </div>

                      {/* Role delegation trigger */}
                      <button
                        type="button"
                        onClick={() => setRoleModalUser(user)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b88e3e] hover:text-[#8a6620] mt-1 cursor-pointer"
                        title="Reassign role or grant administration"
                      >
                        <Shield className="w-3 h-3 text-[#CBA358]" />
                        <span>Assign / Delegate Role</span>
                      </button>

                      {user.role === 'student' && (
                        <div className="mt-1.5 space-y-1">
                          {user.assignedSupervisorName ? (
                            <div className="space-y-0.5">
                              <p className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-amber-700 shrink-0" />
                                <span className="truncate">Int: {user.assignedSupervisorName}</span>
                              </p>
                              {user.assignedExternalSupervisorName && (
                                <p className="text-[10px] text-indigo-700 font-medium px-1 truncate">
                                  Ext: {user.assignedExternalSupervisorName}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setAllocationTargetStudent(user)}
                                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline cursor-pointer inline-block"
                              >
                                Re-allocate / Edit
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-700 shrink-0" />
                                No Supervisor Allocated
                              </span>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setAllocationTargetStudent(user)}
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 text-[10px] font-bold shadow-xs cursor-pointer transition-colors"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Allocate Supervisor</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Project Status Indicator */}
                          <div className="pt-0.5">
                            {user.hasUploadedProject ? (
                              <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                <span>Project Uploaded</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-medium flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                                <span>No Project Uploaded Yet</span>
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Affiliation & Allocations */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-stone-800">{user.department}</div>
                      {user.institution ? (
                        <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1 mt-0.5">
                          <span>Visiting: {user.institution}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-400">{user.faculty}</div>
                      )}
                      {user.role === 'internal_supervisor' && (
                        <div className="text-[10px] text-amber-700 font-medium mt-0.5">
                          Capacity: 8 candidates
                        </div>
                      )}
                    </td>

                    {/* Initial Credentials / Temporary Password */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {isRevealed ? activePassword : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordReveal(user.id)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
                            title={isRevealed ? 'Mask password' : 'Show temporary password'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#CBA358]" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyText(activePassword, user.id)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100 cursor-pointer"
                            title="Copy credentials"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div>
                          {user.mustResetPassword ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              <Key className="w-2.5 h-2.5" />
                              Reset Required on Login
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Permanent Active
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Account Status */}
                    <td className="py-4 px-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-300">
                          <Clock className="h-3 w-3 text-amber-600" />
                          Pending Approval
                        </span>
                      )}
                    </td>

                    {/* Administrative Controls */}
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* 1-Click Approve Profile Button for newly enrolled staff/students */}
                        {!user.isActive && (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id, false, user.name)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                            title="Approve and activate this user's profile immediately"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve & Activate</span>
                          </button>
                        )}

                        {/* Allocate / Re-allocate Supervisor button for students */}
                        {user.role === 'student' && (
                          <button
                            type="button"
                            onClick={() => setAllocationTargetStudent(user)}
                            title={user.assignedSupervisorName ? `Re-allocate supervisor (Current: ${user.assignedSupervisorName})` : 'Allocate supervisor to candidate'}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-amber-700" />
                            <span>{user.assignedSupervisorName ? 'Re-allocate' : 'Allocate'}</span>
                          </button>
                        )}

                        {/* Assign Staff Role / Delegate Administrator */}
                        <button
                          type="button"
                          onClick={() => setRoleModalUser(user)}
                          title="Assign statutory role, elevate to Administrator, or edit rank"
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            user.role === 'admin'
                              ? 'border-[#CBA358] bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#1A1A1A]'
                              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5 text-[#CBA358]" />
                          <span>{user.role === 'admin' ? 'Role Settings' : 'Assign Role'}</span>
                        </button>

                        {/* Issue / Reset Temporary Password Button */}
                        <button
                          type="button"
                          onClick={() => openTempPasswordModal(user)}
                          title="Issue or reset temporary password for this user"
                          className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <Key className="h-3.5 w-3.5 text-amber-700" />
                          <span>Reset Pass</span>
                        </button>

                        {/* Toggle Active/Inactive Button */}
                        {user.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id, true, user.name)}
                            disabled={isCurrentLoggedIn}
                            title="Suspend user access"
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 px-2.5 py-1.5 text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Suspend</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user.id, false, user.name)}
                            title="Activate account"
                            className="inline-flex items-center gap-1 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] text-[#1A1A1A] px-2.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Activate</span>
                          </button>
                        )}

                        {/* Delete Account */}
                        <button
                          type="button"
                          onClick={() => setDeleteCandidateId(user.id)}
                          disabled={isCurrentLoggedIn}
                          title="Delete account from registry"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-xl border border-stone-200 hover:border-rose-300 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Modal Confirmation for Deletion */}
                      {deleteCandidateId === user.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                          <div className="w-full max-w-sm rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-6 text-left shadow-xl text-[#1A1A1A]">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 mb-3">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold font-serif">Confirm Account Deletion</h3>
                            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                              Are you sure you want to permanently delete <strong className="text-stone-900">{user.name}</strong> ({user.identifier}) from the faculty system?
                            </p>
                            <div className="mt-5 flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setDeleteCandidateId(null)}
                                className="rounded-xl border border-stone-300 px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteConfirm(user.id, user.name)}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                              >
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Temporary Password for User */}
      {tempPassTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-6 text-left shadow-2xl text-[#1A1A1A] space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-serif">Issue Temporary Password</h3>
                  <p className="text-xs text-stone-500">
                    Set initial credentials for {tempPassTargetUser.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Account Role:</span>
                <span className="font-bold text-stone-800 capitalize">{tempPassTargetUser.role.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Identifier:</span>
                <span className="font-mono font-bold text-[#CBA358]">{tempPassTargetUser.identifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Email:</span>
                <span className="font-mono text-stone-700">{tempPassTargetUser.email}</span>
              </div>
            </div>

            <form onSubmit={handleSaveIssuedTempPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  New Temporary Password
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="modal-temp-password-input"
                    value={newTempPasswordInput || ''}
                    onChange={(e) => setNewTempPasswordInput(e.target.value)}
                    className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-mono text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setNewTempPasswordInput(generateTempPassword())}
                    className="p-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
                    title="Generate randomized temporary password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(newTempPasswordInput)}
                    className="px-2.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {modalCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{modalCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  This user will be required to change this password to a permanent one upon their next login.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setTempPassTargetUser(null)}
                  className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-issue-temp-pass-btn"
                  className="rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] px-4 py-2 text-xs font-bold text-[#1A1A1A] shadow-xs cursor-pointer transition-colors"
                >
                  Save Temporary Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Onboarding Modal */}
      <AdminOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />

      {/* Supervisor Allocation Modal */}
      <SupervisorAllocationModal
        isOpen={!!allocationTargetStudent}
        student={allocationTargetStudent}
        onClose={() => setAllocationTargetStudent(null)}
      />

      {/* Cloud Sync Status Modal */}
      <CloudSyncStatusModal
        isOpen={isCloudStatusOpen}
        onClose={() => setIsCloudStatusOpen(false)}
      />

      {/* Assign Staff Role Modal */}
      {roleModalUser && (
        <AssignStaffRoleModal
          user={roleModalUser}
          onClose={() => setRoleModalUser(null)}
          onSuccess={() => {
            setRoleModalUser(null);
          }}
        />
      )}
    </div>
  );
};
