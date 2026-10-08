import React, { useState } from 'react';
import { UserPlus, ShieldAlert, ArrowRight, AlertCircle, Shield, GraduationCap, Phone, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';
import { ICONIC_STUDENT_AVATAR, ICONIC_INTERNAL_SUPERVISOR_AVATAR } from '../../utils/iconicAvatars';

const DEPARTMENTS = [
  'Department of Computer Science',
  'Department of Cybersecurity',
  'Department of Information Technology',
  'Department of Software Engineering',
  'Department of Artificial Intelligence & Data Science',
];

export interface SignupProps {
  onSwitchToLogin?: () => void;
  onRegistrationComplete?: (user?: UserAccount) => void;
}

export const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onRegistrationComplete }) => {
  const { register } = useApp();

  const [enrollmentType, setEnrollmentType] = useState<'student' | 'staff'>('student');

  // Student Fields
  const [fullName, setFullName] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Staff Fields
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffId, setStaffId] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (enrollmentType === 'student') {
      if (!fullName.trim()) {
        setErrorMessage('Please provide your full legal name.');
        setIsLoading(false);
        return;
      }
      if (!matricNumber.trim()) {
        setErrorMessage('Please enter your institutional Matric Number (e.g. U21CS1089).');
        setIsLoading(false);
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('Please enter a valid institutional email address.');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        setIsLoading(false);
        return;
      }

      // Register student: supervisor and topic removed, allocated post-approval by admin
      const result = register({
        name: fullName.trim(),
        identifier: matricNumber.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        password,
        role: 'student',
        department,
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
        return;
      }

      if (onRegistrationComplete) {
        onRegistrationComplete(result.user);
      }
    } else {
      // Staff enrollment
      if (!staffName.trim()) {
        setErrorMessage('Please provide your full legal name.');
        setIsLoading(false);
        return;
      }
      if (!staffPhone.trim()) {
        setErrorMessage('Please enter your official phone number.');
        setIsLoading(false);
        return;
      }
      if (!staffId.trim()) {
        setErrorMessage('Please enter your official Staff ID (e.g. STAFF/CSC/042).');
        setIsLoading(false);
        return;
      }
      if (!staffEmail.trim() || !staffEmail.includes('@')) {
        setErrorMessage('Please enter a valid institutional email address.');
        setIsLoading(false);
        return;
      }
      if (staffPassword.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }
      if (staffPassword !== staffConfirmPassword) {
        setErrorMessage('Passwords do not match. Please verify.');
        setIsLoading(false);
        return;
      }

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
        return;
      }

      if (onRegistrationComplete) {
        onRegistrationComplete(result.user);
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Hyper-minimalist centered card */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-7 md:p-8 shadow-sm text-[#1A1A1A]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-11 w-11 rounded-xl bg-[#1A1A1A] text-[#CBA358] mb-3 shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#1A1A1A] font-serif">
            ATBU Faculty of Computing
          </h2>
          <p className="text-xs uppercase tracking-widest text-[#CBA358] font-bold mt-1">
            Faculty Enrollment Portal
          </p>
          <p className="text-xs text-stone-500 mt-2">
            Enroll your profile for automated supervision tracking and defense evaluation
          </p>
        </div>

        {/* Enrollment Type Switcher */}
        <div className="flex rounded-xl bg-stone-100 p-1 mb-5 border border-stone-200">
          <button
            type="button"
            onClick={() => {
              setEnrollmentType('student');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              enrollmentType === 'student'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>Student Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEnrollmentType('staff');
              setErrorMessage(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              enrollmentType === 'staff'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Academic Staff</span>
          </button>
        </div>

        {/* Statutory Gate Notice Banner */}
        <div className="mb-5 rounded-xl border border-[#E5E2DA] bg-[#FAF7F0] p-3.5 text-xs text-stone-700 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#CBA358] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-[#1A1A1A]">Statutory Approval Policy: </span>
            {enrollmentType === 'student'
              ? 'New candidate accounts strictly default to Pending Review. Assigned supervisor and research topic will be designated after approval by the Faculty Administrator.'
              : 'New staff accounts strictly require authorization by the Faculty Administrator before supervisory portal access is granted.'}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {enrollmentType === 'student' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Farouk Usman"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Matric Number
                  </label>
                  <input
                    type="text"
                    value={matricNumber || ''}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    placeholder="e.g. U21CS1089"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={email || ''}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. farouk.usman@atbu.edu.ng"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Academic Department
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Account Password
                  </label>
                  <input
                    type="password"
                    value={password || ''}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword || ''}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Staff Form: Name, Phone number, Staff Id, email, then passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Staff Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={staffName || ''}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Dr. Aliyu Mohammed"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={staffPhone || ''}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="e.g. 08123456789"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Official Staff ID
                  </label>
                  <input
                    type="text"
                    value={staffId || ''}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="e.g. STAFF/CSC/042"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    value={staffEmail || ''}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="e.g. a.mohammed@atbu.edu.ng"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={staffPassword || ''}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={staffConfirmPassword || ''}
                    onChange={(e) => setStaffConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-[#D9D4C7] bg-white px-3 py-2 text-xs text-[#1A1A1A] placeholder-stone-400 focus:border-[#CBA358] focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Primary Submit Button: Gold/Mustard bg-[#CBA358] */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.99] px-5 py-3 text-sm font-bold text-[#1A1A1A] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Submitting to Faculty Registry...</span>
            ) : (
              <>
                <span>
                  {enrollmentType === 'student'
                    ? 'Register Student & Await Admin Approval'
                    : 'Register Staff & Await Admin Approval'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to Login */}
        <div className="mt-5 text-center text-xs text-stone-500">
          Already registered with the faculty?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#1A1A1A] hover:text-[#CBA358] underline underline-offset-2 transition-colors ml-1 cursor-pointer"
          >
            Sign in to your account
          </button>
        </div>
      </div>
    </div>
  );
};
