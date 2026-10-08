import React, { useState } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, Clock, Search, Filter, Mail, Sparkles, Building, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';

export const PendingSupervisees: React.FC = () => {
  const { accounts, activateUser, currentUser, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Supervisor can only activate students assigned to them
  // (or if supervisor is logged in, their ID/matric; fallback to Dr. Alabi if in demo view)
  const currentSupervisorId = currentUser?.id || 'usr_sup_01';
  const currentSupervisorName = currentUser?.name || 'Dr. Kolawole O. Alabi';

  // Filter students who are inactive and assigned to this supervisor
  const pendingSupervisees = accounts.filter((account) => {
    const isStudent = account.role === 'student';
    const isInactive = account.isActive === false;
    const isAssigned =
      account.assignedSupervisorId === currentSupervisorId ||
      account.assignedSupervisorName?.toLowerCase().includes('alabi') ||
      account.assignedSupervisorName?.toLowerCase().includes(currentUser?.name?.toLowerCase() || 'dr.');

    return isStudent && isInactive && isAssigned;
  });

  const filteredList = pendingSupervisees.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.specialization && student.specialization.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = departmentFilter === 'All' || student.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  const handleActivate = (studentId: string, studentName: string) => {
    activateUser(studentId);
    showToast(`Statutory Clearance Granted: ${studentName}'s account has been activated.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Cream/Charcoal/Gold aesthetic */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE7DE] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A1A1A] text-[#CBA358] shadow-xs">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-[#1A1A1A] font-serif">
                  Pending Supervisees Activation Desk
                </h1>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
                  {pendingSupervisees.length} Awaiting Authorization
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Statutory Supervisor Gateway: Review and activate final-year candidates assigned to{' '}
                <span className="font-semibold text-stone-800">{currentSupervisorName}</span>
              </p>
            </div>
          </div>

          {/* Quick Filter & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate name or matric..."
                className="rounded-xl border border-[#D9D4C7] bg-white pl-8 pr-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
              />
            </div>

            <select
              value={departmentFilter || 'All'}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-[#D9D4C7] bg-white px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#CBA358] focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Department of Computer Science">Computer Science</option>
              <option value="Department of Cybersecurity">Cybersecurity</option>
              <option value="Department of Information Technology">Information Tech</option>
              <option value="Department of Software Engineering">Software Eng</option>
            </select>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#EADBBD] bg-[#FAF7F0] p-3 text-xs text-stone-700">
          <ShieldAlert className="h-4 w-4 text-[#CBA358] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Candidates remain under the statutory registration gate with zero system read/write access until you click
            <strong className="text-[#1A1A1A] font-bold"> "Activate Account"</strong>. Once approved, the candidate receives full access to submit project topics, benchwork logs, and chapter drafts.
          </p>
        </div>
      </div>

      {/* Supervisee List / Table */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-white shadow-xs overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1A1A1A]">No Supervisees Pending Activation</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              All assigned research candidates have been verified and activated. Newly registered students will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#FAF7F0] border-b border-[#E5E2DA] text-[11px] uppercase font-bold text-stone-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Candidate Profile</th>
                  <th className="py-3.5 px-4">Department & Level</th>
                  <th className="py-3.5 px-4">Proposed Topic / Track</th>
                  <th className="py-3.5 px-4">Status & Gated Access</th>
                  <th className="py-3.5 px-4 text-right">Supervisory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredList.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={normalizeIconicAvatar(student.avatar, 'student')}
                          alt={student.name}
                          className="h-10 w-10 rounded-full border border-stone-200 object-contain p-0.5 bg-stone-100"
                        />
                        <div>
                          <div className="font-bold text-[#1A1A1A] text-sm">{student.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-[#CBA358] font-bold">
                              {student.identifier}
                            </span>
                            <span className="text-[11px] text-stone-400">·</span>
                            <span className="text-[11px] text-stone-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-[#1A1A1A]">{student.department}</div>
                      <div className="text-[11px] text-stone-400">{student.level || '400 Level (Finalist)'}</div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <div className="text-stone-800 line-clamp-2 font-medium">
                        {student.specialization || 'Undergraduate Dissertation Research'}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                        <Clock className="h-3 w-3 animate-pulse text-amber-600" />
                        Gated (isActive: false)
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {/* Required Gold/Mustard primary button: bg-[#CBA358] */}
                      <button
                        type="button"
                        onClick={() => handleActivate(student.id, student.name)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] px-4 py-2 text-xs font-bold text-[#1A1A1A] shadow-xs transition-all cursor-pointer"
                      >
                        <UserCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Activate Account</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
