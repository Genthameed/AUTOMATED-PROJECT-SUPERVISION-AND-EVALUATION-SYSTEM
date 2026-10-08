import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  GraduationCap, 
  UserCheck, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Building,
  Check,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AdminOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newUserId: string) => void;
  defaultRole?: UserRole;
}

const DEPARTMENTS = [
  'Department of Computer Science (Faculty of Computing)',
  'Software Systems & Architecture Unit',
  'Distributed Systems & Cloud Computing Unit',
  'Cybersecurity & Cryptography Unit',
  'Artificial Intelligence & Machine Learning Unit',
  'Data Engineering & Systems Unit',
];

const AVAILABLE_SUPERVISORS = [
  { id: 'usr_sup_01', name: 'Dr. Kolawole O. Alabi', rank: 'Senior Lecturer', dept: 'Artificial Intelligence' },
  { id: 'usr_sup_02', name: 'Dr. Victor Adeyemi', rank: 'Associate Professor', dept: 'Cybersecurity' },
  { id: 'usr_sup_03', name: 'Prof. Sarah N. Ibrahim', rank: 'Professor & HOD', dept: 'Distributed Systems & Cloud' },
  { id: 'usr_sup_04', name: 'Dr. Aminu Salisu', rank: 'Senior Lecturer', dept: 'Software Engineering' },
];

const AVAILABLE_EXTERNAL_SUPERVISORS = [
  { id: 'usr_ext_01', name: 'Prof. Charles U. Eze', institution: 'University of Lagos (UNILAG)', dept: 'Applied Computer Science' },
  { id: 'usr_ext_02', name: 'Prof. Bashir A. Sani', institution: 'Bayero University Kano (BUK)', dept: 'Computer Science & AI' },
  { id: 'usr_ext_03', name: 'Dr. Halima Abubakar', institution: 'Ahmadu Bello University (ABU)', dept: 'Computer Science (Cybersecurity)' },
];

const EXTERNAL_INSTITUTIONS = [
  'University of Lagos (UNILAG)',
  'Ahmadu Bello University (ABU Zaria)',
  'Bayero University Kano (BUK)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'University of Nigeria Nsukka (UNN)',
];

const PANEL_VENUES = [
  'Defense Panel A (Computing Boardroom 102)',
  'Defense Panel B (Postgraduate Seminar Suite 1)',
  'Defense Panel C (Distributed Systems & Cloud Computing Lab Suite)',
];

const generateRandomTempPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const nums = '23456789';
  const prefix = 'CSC';
  let randStr = '';
  for (let i = 0; i < 3; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let randNums = '';
  for (let i = 0; i < 3; i++) {
    randNums += nums.charAt(Math.floor(Math.random() * nums.length));
  }
  return `${prefix}@2026#${randStr}${randNums}`;
};

export const AdminOnboardingModal: React.FC<AdminOnboardingModalProps> = ({ isOpen, onClose, onSuccess, defaultRole }) => {
  const { onboardUserByAdmin } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole || 'student');
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [projectTopic, setProjectTopic] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [institution, setInstitution] = useState(EXTERNAL_INSTITUTIONS[0]);
  const [assignedSupervisorId, setAssignedSupervisorId] = useState(AVAILABLE_SUPERVISORS[0].id);
  const [assignedExternalSupervisorId, setAssignedExternalSupervisorId] = useState(AVAILABLE_EXTERNAL_SUPERVISORS[0].id);
  const [panelCode, setPanelCode] = useState(PANEL_VENUES[0]);
  const [isActive, setIsActive] = useState(true);

  // Temporary password state
  const [temporaryPassword, setTemporaryPassword] = useState('TempPass@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [mustResetPassword, setMustResetPassword] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultRole) {
        setSelectedRole(defaultRole);
        if (!projectTopic) {
          if (defaultRole === 'internal_supervisor') {
            setProjectTopic('Supervisory Domain: Distributed Systems, Artificial Intelligence & Cybersecurity');
          } else if (defaultRole === 'external_supervisor') {
            setProjectTopic('External Moderation: Applied Computer Science & Software Systems & Viva Defense');
          } else if (defaultRole === 'panel_member') {
            setProjectTopic('Evaluation Scope: Computer Systems, Network Security & Software Engineering');
          }
        }
      }
    }
  }, [isOpen, defaultRole]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setIdentifier('');
    setEmail('');
    setProjectTopic('');
    setDepartment(DEPARTMENTS[0]);
    setInstitution(EXTERNAL_INSTITUTIONS[0]);
    setIsActive(true);
    setTemporaryPassword('TempPass@2026');
    setMustResetPassword(true);
    setErrorMessage(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (!projectTopic) {
      if (role === 'student') {
        setProjectTopic('');
      } else if (role === 'internal_supervisor') {
        setProjectTopic('Supervisory Domain: Distributed Systems, Artificial Intelligence & Cybersecurity');
      } else if (role === 'external_supervisor') {
        setProjectTopic('External Moderation: Applied Computer Science & Software Systems & Viva Defense');
      } else if (role === 'panel_member') {
        setProjectTopic('Evaluation Scope: Computer Systems, Network Security & Software Engineering');
      }
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage('Please enter the full legal name of the user.');
      return;
    }

    if (!identifier.trim() && !email.trim()) {
      setErrorMessage('Please provide at least one identifier: either a Matric/Staff Number or an Institutional Email.');
      return;
    }

    if (!projectTopic.trim()) {
      setErrorMessage('Please enter the project topic or research specialization.');
      return;
    }

    if (!temporaryPassword.trim() || temporaryPassword.trim().length < 4) {
      setErrorMessage('Please provide a valid temporary password (minimum 4 characters).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const supObj = AVAILABLE_SUPERVISORS.find((s) => s.id === assignedSupervisorId);
    const extSupObj = AVAILABLE_EXTERNAL_SUPERVISORS.find((s) => s.id === assignedExternalSupervisorId);

    const result = onboardUserByAdmin({
      name: fullName.trim(),
      role: selectedRole,
      identifier: identifier.trim() || undefined,
      email: email.trim() || undefined,
      projectTopic: projectTopic.trim(),
      department,
      institution: selectedRole === 'external_supervisor' ? institution : undefined,
      faculty: 'Faculty of Computing',
      isActive,
      assignedSupervisorId: selectedRole === 'student' ? supObj?.id : undefined,
      assignedSupervisorName: selectedRole === 'student' ? supObj?.name : undefined,
      assignedExternalSupervisorId: selectedRole === 'student' ? extSupObj?.id : undefined,
      assignedExternalSupervisorName: selectedRole === 'student' ? extSupObj?.name : undefined,
      specialization: projectTopic.trim(),
      temporaryPassword: temporaryPassword.trim(),
      mustResetPassword,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    resetForm();
    onClose();
    if (onSuccess && result.user) {
      onSuccess(result.user.id);
    }
  };

  const roleDisplayNames: Record<UserRole, string> = {
    student: 'Student (Candidate)',
    internal_supervisor: 'Internal Supervisor',
    external_supervisor: 'External Supervisor',
    panel_member: 'Panel Member',
    admin: 'Faculty Administrator',
  };

  return (
    <div id="admin-onboard-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="admin-onboard-modal-card"
        className="relative w-full max-w-2xl rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] shadow-2xl transition-all my-6 text-[#1A1A1A] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5E2DA] px-5 sm:px-6 py-4 bg-[#1A1A1A] text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2A2A2A] text-[#CBA358] border border-[#3A3A3A]">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-serif">
                  Onboard Faculty User
                </h2>
                <span className="rounded-full bg-[#CBA358]/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#CBA358] border border-[#CBA358]/40">
                  Admin Authority
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Enroll candidates, internal/external supervisors, or panel examiners with temporary initial passwords
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-onboard-modal-btn"
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto px-5 sm:px-6 py-4 space-y-4 flex-1">
          {/* Role Selection Tabs - Categorized into 4 distinct choices */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Target Faculty Role & Supervisorship Category
              </label>
              <span className="text-[11px] text-stone-500 font-medium">
                {roleDisplayNames[selectedRole]}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Student */}
              <button
                type="button"
                id="select-role-student-btn"
                onClick={() => handleRoleChange('student')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'student'
                    ? 'border-[#CBA358] bg-white text-[#1A1A1A] shadow-xs ring-2 ring-[#CBA358]'
                    : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                }`}
              >
                <GraduationCap className={`h-4 w-4 mb-1 ${selectedRole === 'student' ? 'text-[#CBA358]' : 'text-stone-400'}`} />
                <span>Student</span>
                <span className="text-[10px] font-normal text-stone-400">Candidate</span>
              </button>

              {/* Internal Supervisor */}
              <button
                type="button"
                id="select-role-internal-sup-btn"
                onClick={() => handleRoleChange('internal_supervisor')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'internal_supervisor'
                    ? 'border-[#CBA358] bg-white text-[#1A1A1A] shadow-xs ring-2 ring-[#CBA358]'
                    : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                }`}
              >
                <UserCheck className={`h-4 w-4 mb-1 ${selectedRole === 'internal_supervisor' ? 'text-[#CBA358]' : 'text-stone-400'}`} />
                <span>Internal Supervisor</span>
                <span className="text-[10px] font-normal text-stone-400">Faculty Staff</span>
              </button>

              {/* External Supervisor */}
              <button
                type="button"
                id="select-role-external-sup-btn"
                onClick={() => handleRoleChange('external_supervisor')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'external_supervisor'
                    ? 'border-[#CBA358] bg-white text-[#1A1A1A] shadow-xs ring-2 ring-[#CBA358]'
                    : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 mb-1 ${selectedRole === 'external_supervisor' ? 'text-[#CBA358]' : 'text-stone-400'}`} />
                <span>External Supervisor</span>
                <span className="text-[10px] font-normal text-stone-400">Visiting Moderator</span>
              </button>

              {/* Panel Member */}
              <button
                type="button"
                id="select-role-panel-btn"
                onClick={() => handleRoleChange('panel_member')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  selectedRole === 'panel_member'
                    ? 'border-[#CBA358] bg-white text-[#1A1A1A] shadow-xs ring-2 ring-[#CBA358]'
                    : 'border-stone-200 bg-white/70 text-stone-600 hover:bg-white'
                }`}
              >
                <Users className={`h-4 w-4 mb-1 ${selectedRole === 'panel_member' ? 'text-[#CBA358]' : 'text-stone-400'}`} />
                <span>Panel Member</span>
                <span className="text-[10px] font-normal text-stone-400">Defense Board</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="admin-onboard-form" onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="user-fullname-input"
                value={fullName || ''}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  selectedRole === 'student' 
                    ? 'e.g. Adama L. Sanusi' 
                    : selectedRole === 'internal_supervisor'
                    ? 'e.g. Dr. Fatima Bello Bello'
                    : selectedRole === 'external_supervisor'
                    ? 'e.g. Prof. Charles U. Eze'
                    : 'e.g. Prof. Usman G. Danbatta'
                }
                className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2.5 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                required
              />
            </div>

            {/* Identifiers (Matric or Email rule) */}
            <div className="rounded-xl border border-[#E5E2DA] bg-white p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Contact & Registry Identifiers
                </span>
                <span className="text-[11px] font-medium text-[#CBA358]">
                  Provide either Matric/Staff ID or Email (or both)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    {selectedRole === 'student' 
                      ? 'Matriculation Number' 
                      : selectedRole === 'external_supervisor'
                      ? 'External Staff / Accreditation ID'
                      : 'Staff Identifier ID'}
                  </label>
                  <input
                    type="text"
                    id="user-identifier-input"
                    value={identifier || ''}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'student' 
                        ? 'e.g. CSC/2021/0498' 
                        : selectedRole === 'external_supervisor'
                        ? 'e.g. EXT/UNILAG/CSC/019'
                        : 'e.g. STAFF/CSC/055'
                    }
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none uppercase"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Auto-generated if left blank</p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    {selectedRole === 'external_supervisor' ? 'Institutional Email (Visiting Univ.)' : 'Institutional Email Address'}
                  </label>
                  <input
                    type="email"
                    id="user-email-input"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'student' 
                        ? 'adama.sanusi@cs.edu.ng' 
                        : selectedRole === 'external_supervisor'
                        ? 'charles.eze@unilag.edu.ng'
                        : 'fatima.bello@cs.edu.ng'
                    }
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                  <p className="text-[10px] text-stone-400 mt-0.5">Auto-derived if left blank</p>
                </div>
              </div>
            </div>

            {/* TEMPORARY INITIAL PASSWORD & SECURITY (Admin Requirement) */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Temporary Initial Password
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  User Resets Upon Login
                </span>
              </div>

              <p className="text-[11px] text-amber-800 leading-relaxed">
                Provide a temporary password for this user. They will use this password to sign in for the first time, and the system will require them to choose a permanent password.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="user-temp-password-input"
                    value={temporaryPassword || ''}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    placeholder="Enter temporary password..."
                    className="w-full rounded-xl border border-amber-300 bg-white pl-8 pr-10 py-2 text-xs text-[#1A1A1A] font-mono focus:border-[#CBA358] focus:outline-none"
                    required
                  />
                  <Lock className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 cursor-pointer p-0.5"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setTemporaryPassword(generateRandomTempPassword())}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-[11px] font-bold text-amber-900 transition-colors cursor-pointer"
                    title="Generate randomized university temporary password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                    title="Copy temporary password to clipboard"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="checkbox"
                  id="must-reset-password-checkbox"
                  checked={Boolean(mustResetPassword)}
                  onChange={(e) => setMustResetPassword(e.target.checked)}
                  className="rounded border-amber-300 text-amber-700 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                />
                <label htmlFor="must-reset-password-checkbox" className="text-[11px] font-semibold text-amber-900 cursor-pointer">
                  Enforce mandatory password reset on first user login
                </label>
              </div>
            </div>

            {/* Project Topic (Mandatory) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  {selectedRole === 'student' 
                    ? 'Approved Project Topic' 
                    : selectedRole === 'internal_supervisor'
                    ? 'Internal Supervision Research Domain'
                    : selectedRole === 'external_supervisor'
                    ? 'External Moderation Scope / Specialization'
                    : 'Panel Examination Focus Domain'} <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-stone-400">Statutory Record</span>
              </div>
              <textarea
                id="user-project-topic-input"
                value={projectTopic || ''}
                onChange={(e) => setProjectTopic(e.target.value)}
                rows={2}
                placeholder={
                  selectedRole === 'student'
                    ? 'e.g. Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures'
                    : selectedRole === 'internal_supervisor'
                    ? 'e.g. Distributed Systems, Artificial Intelligence & Cybersecurity'
                    : selectedRole === 'external_supervisor'
                    ? 'e.g. Intelligent Systems & Data Engineering, Cloud Infrastructure & Software Quality'
                    : 'e.g. Evaluation Scope: Computer Systems, Network Security & Software Engineering'
                }
                className="w-full rounded-xl border border-[#D9D4C7] bg-white p-2.5 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                required
              />
            </div>

            {/* Department and Specific Role Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Department / Unit
                </label>
                <select
                  value={department || DEPARTMENTS[0]}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Role: Assign Both Internal & External Supervisors */}
              {selectedRole === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Assign Internal Supervisor
                    </label>
                    <select
                      value={assignedSupervisorId || AVAILABLE_SUPERVISORS[0].id}
                      onChange={(e) => setAssignedSupervisorId(e.target.value)}
                      className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                    >
                      {AVAILABLE_SUPERVISORS.map((sup) => (
                        <option key={sup.id} value={sup.id}>
                          {sup.name} ({sup.dept})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Assign External Supervisor / Moderator
                    </label>
                    <select
                      value={assignedExternalSupervisorId || AVAILABLE_EXTERNAL_SUPERVISORS[0].id}
                      onChange={(e) => setAssignedExternalSupervisorId(e.target.value)}
                      className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                    >
                      {AVAILABLE_EXTERNAL_SUPERVISORS.map((ext) => (
                        <option key={ext.id} value={ext.id}>
                          {ext.name} · {ext.institution} ({ext.dept})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* External Supervisor Role: Institution & Moderation Scope */}
              {selectedRole === 'external_supervisor' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Home / Visiting Institution
                  </label>
                  <select
                    value={institution || EXTERNAL_INSTITUTIONS[0]}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                  >
                    {EXTERNAL_INSTITUTIONS.map((inst) => (
                      <option key={inst} value={inst}>
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Internal Supervisor Role: Quota */}
              {selectedRole === 'internal_supervisor' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Internal Supervision Quota
                  </label>
                  <input
                    type="text"
                    disabled
                    value="8 Allocated Candidates Max"
                    className="w-full rounded-xl border border-stone-200 bg-stone-100 px-3 py-2 text-xs text-stone-500"
                  />
                </div>
              )}

              {/* Panel Member Role: Venue */}
              {selectedRole === 'panel_member' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Assign Defense Board
                  </label>
                  <select
                    value={panelCode || PANEL_VENUES[0]}
                    onChange={(e) => setPanelCode(e.target.value)}
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
                  >
                    {PANEL_VENUES.map((venue) => (
                      <option key={venue} value={venue}>
                        {venue}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Immediate Activation Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-[#E5E2DA] bg-[#FAF7F0] p-3">
              <div>
                <span className="text-xs font-bold text-[#1A1A1A] block">
                  Statutory Activation Status
                </span>
                <span className="text-[11px] text-stone-500">
                  {isActive 
                    ? 'Active (User granted operational portal access immediately)' 
                    : 'Gated (User will see Pending Activation screen until activated)'}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="user-isactive-checkbox"
                  checked={Boolean(isActive)}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CBA358]"></div>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E2DA] px-5 sm:px-6 py-3.5 bg-[#FAF7F0] rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            id="submit-onboard-user-btn"
            form="admin-onboard-form"
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] px-5 py-2.5 text-xs sm:text-sm font-bold text-[#1A1A1A] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Registering Record...</span>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Onboard {roleDisplayNames[selectedRole]}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
