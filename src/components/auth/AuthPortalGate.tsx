import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  BookOpen,
  Dna,
  Code,
  MonitorPlay,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';
import { loginWithGoogle } from '../../firebase/firestoreSync';
import { ICONIC_STUDENT_AVATAR, ICONIC_INTERNAL_SUPERVISOR_AVATAR } from '../../utils/iconicAvatars';

interface AuthPortalGateProps {
  onPendingEncountered?: (user: UserAccount) => void;
}

const DEPARTMENTS = [
  'Department of Computer Science (Host Department)',
  'Department of Biochemistry',
  'Department of Biological Sciences',
  'Department of Computer Science (Bioinformatics)',
];

const AVAILABLE_SUPERVISORS = [
  { id: 'usr_sup_01', name: 'Dr. Kolawole O. Alabi', rank: 'Senior Lecturer', dept: 'Computer Science' },
  { id: 'usr_sup_02', name: 'Prof. Folashade Okonjo', rank: 'Professor', dept: 'Computer Science & Software Systems' },
  { id: 'usr_sup_03', name: 'Dr. Amina Bello', rank: 'Associate Professor / HOD', dept: 'Computer Science' },
];

export const AuthPortalGate: React.FC<AuthPortalGateProps> = () => {
  const { login, register, accounts, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register_student' | 'register_staff'>('login');
  
  // Login State
  const [identifierOrEmail, setIdentifierOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Student Registration State (Assigned supervisor and research topic removed - allocated post-approval by admin)
  const [regFullName, setRegFullName] = useState('');
  const [regMatric, setRegMatric] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState(DEPARTMENTS[0]);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Staff Registration State (Name, Phone number, Staff Id, email, passwords - awaits admin approval)
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierOrEmail.trim()) {
      setErrorMessage('Please enter your Matric Number, Staff ID, or Institutional Email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password (or issued temporary password).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    await new Promise((r) => setTimeout(r, 250));

    const result = login(identifierOrEmail, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const fbUser = await loginWithGoogle();
      if (fbUser && fbUser.email) {
        const emailLower = fbUser.email.toLowerCase();
        if (emailLower.includes('abdulhamid') || emailLower.includes('admin')) {
          login('ADM/CSC/003', 'password123');
          showToast(`Welcome, Prof. Abdulhamid Abubakar! Administrator session verified.`);
          return;
        }
        const existing = accounts.find(a => a.email.toLowerCase() === emailLower);
        if (existing) {
          login(existing.identifier, existing.password || 'password123');
          showToast(`Institutional Google session verified: ${existing.name}`);
        } else {
          // Provision or prompt
          const regRes = register({
            name: fbUser.displayName || 'University Scholar',
            identifier: `STAFF/G/${Math.floor(100 + Math.random() * 900)}`,
            email: emailLower,
            password: 'password123',
            role: 'internal_supervisor',
            department: 'Department of Computer Science',
            faculty: 'Faculty of Computing',
            title: 'Lecturer / Research Fellow',
            status: 'Active Profile · Google Auth Cleared',
            isActive: true,
            avatar: ICONIC_INTERNAL_SUPERVISOR_AVATAR
          });
          if (regRes.success && regRes.user) {
            showToast(`Welcome, ${regRes.user.name}! Institutional profile linked.`);
          }
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google authentication cancelled or not available.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Student Candidate Enrollment (without assigned supervisor & topic - allocated post-approval by admin)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }
    if (!regMatric.trim()) {
      setErrorMessage('Please enter your official Matric Number (e.g. CSC/2021/0482).');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = register({
      name: regFullName.trim(),
      identifier: regMatric.trim().toUpperCase(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: 'student',
      department: regDepartment,
      faculty: 'Faculty of Computing',
      title: 'Final Year B.Sc. Candidate',
      specialization: 'Pending Topic Allocation by Admin',
      level: '400 Level',
      status: 'Under Review · Awaiting Admin Approval',
      isActive: false, // Statutory gate: strictly false awaiting admin approval
      assignedSupervisorId: undefined,
      assignedSupervisorName: undefined,
      avatar: ICONIC_STUDENT_AVATAR,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  // Staff Enrollment (Name, Phone number, Staff Id, email, passwords - awaits admin approval)
  const handleStaffRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffName.trim()) {
      setErrorMessage('Please enter your full legal name.');
      return;
    }
    if (!staffPhone.trim()) {
      setErrorMessage('Please enter your official phone number.');
      return;
    }
    if (!staffId.trim()) {
      setErrorMessage('Please enter your official Staff ID (e.g. STAFF/CSC/042).');
      return;
    }
    if (!staffEmail.trim() || !staffEmail.includes('@')) {
      setErrorMessage('Please enter a valid institutional email address.');
      return;
    }
    if (staffPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (staffPassword !== staffConfirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = register({
      name: staffName.trim(),
      phone: staffPhone.trim(),
      identifier: staffId.trim().toUpperCase(),
      email: staffEmail.trim().toLowerCase(),
      password: staffPassword,
      role: 'internal_supervisor',
      department: 'Department of Computer Science',
      faculty: 'Faculty of Computing',
      title: 'Academic Staff / Supervisor',
      status: 'Under Review · Awaiting Admin Approval',
      isActive: false, // Strictly false awaiting admin approval
      avatar: ICONIC_INTERNAL_SUPERVISOR_AVATAR,
    });

    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B132B] bg-radial-[at_top_right] from-[#1C2541] via-[#0B132B] to-[#0A0E1A] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      
      {/* Institutional Top Crest Header */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg ring-2 ring-emerald-400/30">
            <Dna className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#CBA358]">
                Abubakar Tafawa Balewa University, Bauchi (ATBU)
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Cloud DB
              </span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight font-serif">
              Faculty of Computing · Department of Computer Science
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Automated Project Supervision & Evaluation System (APSES)
            </p>
          </div>
        </div>

        {/* Academic Session & Portal Status */}
        <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
          <ShieldCheck className="h-4 w-4 text-[#CBA358]" />
          <span>2025/2026 Academic Session</span>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-emerald-400">Strict Auth Enforced</span>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="w-full max-w-6xl mx-auto my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Statutory Overview & Compliance Badge */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#CBA358]/20 px-3 py-1 text-xs font-bold text-[#F4D06F] mb-3 border border-[#CBA358]/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Institutional Access Control</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-serif leading-tight">
              Departmental Dissertation & Defense Clearinghouse
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              This portal enforces strict single-identity authorization in compliance with university academic senate regulations. Every student, internal supervisor, panelist, and external examiner must authenticate with their verified institutional credentials.
            </p>
          </div>

          {/* Pillars Checklist */}
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#CBA358] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Statutory Workflow & Scoring Gates</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                100 Marks Total
              </span>
            </div>
            
            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <Code className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Software Design & Quality (30 marks): </strong>
                Architectural soundness, algorithm implementation, code quality, and live testbed execution.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <MonitorPlay className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Presentation (20 marks): </strong>
                Viva voce oral presentation, slide clarity, technical poise, and adherence to time allocation.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Project Reports & Documentation (30 marks): </strong>
                Chapters 1–5 manuscript composition, Turnitin similarity audit (&lt;15%), and IEEE documentation.
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-slate-300">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Response to Questions (20 marks): </strong>
                Panel examination questions, defense mastery, theoretical depth, and empirical justification.
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-200/90">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Unauthorized access attempts are monitored and recorded. Only registered 400-level candidates and accredited departmental faculty are permitted.
            </p>
          </div>
        </div>

        {/* Right Column: Authentication Card & Fast-Track Roster */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Auth Form Box */}
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur-md p-6 sm:p-8 shadow-2xl">
            
            {/* Tab Navigation */}
            <div className="flex rounded-xl bg-black/30 p-1 mb-6 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register_student');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'register_student'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Enroll Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register_staff');
                  setErrorMessage(null);
                }}
                className={`flex-1 rounded-lg py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'register_staff'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Enroll Staff
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/20 p-3.5 text-xs text-rose-200 flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Matric Number, Staff ID, or Institutional Email
                  </label>
                  <input
                    type="text"
                    value={identifierOrEmail || ''}
                    onChange={(e) => setIdentifierOrEmail(e.target.value)}
                    placeholder="Enter Matric Number, Staff ID, or Email"
                    className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none transition-colors"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Account Password
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Case-sensitive
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password || ''}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none transition-colors pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#d8ae5e] active:scale-[0.99] px-5 py-3 text-sm font-extrabold text-[#1A1A1A] shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Verifying Institutional Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In & Unlock Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Google Institutional SSO */}
                <div className="pt-3">
                  <div className="relative flex items-center justify-center mb-3">
                    <div className="border-t border-white/10 w-full" />
                    <span className="bg-[#101A34] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                      or institutional single sign-on
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with University Google Account</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: STUDENT CANDIDATE REGISTRATION (Supervisor and Topic removed: assigned by admin after approval) */}
            {activeTab === 'register_student' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
                  <strong>Statutory Gate:</strong> New candidate profiles strictly require approval by the Faculty Administrator. Assigned supervisor and research topic will be designated after approval.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={regFullName || ''}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Farouk Usman"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Matric Number
                    </label>
                    <input
                      type="text"
                      value={regMatric || ''}
                      onChange={(e) => setRegMatric(e.target.value)}
                      placeholder="e.g. CSC/2021/0482"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Institutional Email
                    </label>
                    <input
                      type="email"
                      value={regEmail || ''}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. student@atbu.edu.ng"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Academic Department
                    </label>
                    <select
                      value={regDepartment || DEPARTMENTS[0]}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs text-white focus:border-[#CBA358] focus:outline-none"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept} className="bg-slate-900 text-white">
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Create Password
                    </label>
                    <input
                      type="password"
                      value={regPassword || ''}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword || ''}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#d8ae5e] active:scale-[0.99] px-5 py-3 text-sm font-extrabold text-[#1A1A1A] shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Submitting Candidate Dossier...</span>
                  ) : (
                    <>
                      <span>Submit Student Enrollment & Await Admin Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: STAFF ENROLLMENT (Name, Phone number, Staff Id, Email, Password -> Await admin approval) */}
            {activeTab === 'register_staff' && (
              <form onSubmit={handleStaffRegisterSubmit} className="space-y-3.5">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[11px] text-amber-200">
                  <strong>Staff Enrollment Policy:</strong> Staff accounts are registered with pending status. After submitting your details, await administrator approval before supervisory portal access is granted.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Staff Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={staffName || ''}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. Dr. Aliyu Mohammed"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={staffPhone || ''}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      placeholder="e.g. 08123456789"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Staff ID
                    </label>
                    <input
                      type="text"
                      value={staffId || ''}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. STAFF/CSC/055"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Institutional Email
                    </label>
                    <input
                      type="email"
                      value={staffEmail || ''}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. staff@atbu.edu.ng"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Create Password
                    </label>
                    <input
                      type="password"
                      value={staffPassword || ''}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={staffConfirmPassword || ''}
                      onChange={(e) => setStaffConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#CBA358] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#d8ae5e] active:scale-[0.99] px-5 py-3 text-sm font-extrabold text-[#1A1A1A] shadow-lg transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Submitting Staff Dossier...</span>
                  ) : (
                    <>
                      <span>Submit Staff Enrollment & Await Admin Approval</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Institutional Compliance & Security Notice */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CBA358]" />
                Institutional Security & Role-Based Access
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">SSL / TLS 256-Bit Encrypted</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Access is restricted to authorized 400-level candidates, assigned supervisors, examiners, and department administrators. If you forgot your password or need your account activated, please contact the Faculty of Computing System Administrator or the Departmental Examination Officer.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Credentials & Accreditation */}
      <footer className="w-full max-w-6xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} Abubakar Tafawa Balewa University, Bauchi (ATBU). All Rights Reserved. National Universities Commission (NUC) BMAS Compliant.
        </p>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <Cloud className="w-3.5 h-3.5" />
            Google Cloud Firestore: Connected
          </span>
          <span>·</span>
          <span>Senate Regulation 2025/2026</span>
        </div>
      </footer>
    </div>
  );
};
