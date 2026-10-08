import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  GraduationCap,
  Building2,
  X,
  Database,
  Check,
  AlertTriangle,
  Mail,
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';

interface AssignStaffRoleModalProps {
  user: UserAccount;
  onClose: () => void;
  onSuccess?: () => void;
}

const ROLE_OPTIONS: {
  role: UserRole;
  label: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  privileges: string[];
}[] = [
  {
    role: 'admin',
    label: 'Faculty Administrator / Directorate',
    badge: 'Supreme Directorate Authority',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    icon: Shield,
    description: 'Assign full Departmental Directorate and System Administrator privileges to this staff member.',
    privileges: [
      'Endorse & calibrate Departmental Senate Broadsheet',
      'Assign & re-delegate roles to all other staff members',
      'Constitute defense panels & assign viva venues',
      'Activate new student accounts & manage staff credentials'
    ]
  },
  {
    role: 'internal_supervisor',
    label: 'Internal Research Supervisor',
    badge: 'Benchwork & Continuous Assessment (40%)',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    icon: UserCheck,
    description: 'Oversees candidate research benchwork, consultation logbooks, and chapter draft submissions.',
    privileges: [
      'Evaluate & approve research project proposals',
      'Conduct laboratory bench consultations & verify logbooks',
      'Issue statutory clearance for Chapters 1 through 5',
      'Award 40% Continuous Assessment (CA) supervisory marks'
    ]
  },
  {
    role: 'panel_member',
    label: 'Defense Panel Member & Examiner',
    badge: 'Oral Viva Presentation (30%)',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    icon: Users,
    description: 'Serves on the Departmental Oral Defense Board to question and grade candidate viva defenses.',
    privileges: [
      'Access scheduled viva timetables and candidate dossiers',
      'Score oral thesis presentations against statutory rubrics (30%)',
      'Record formal panel observations & revision stipulations',
      'Participate in departmental defense deliberations'
    ]
  },
  {
    role: 'external_supervisor',
    label: 'Visiting External Examiner / Moderator',
    badge: 'Senate External Moderation (30%)',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    icon: ShieldCheck,
    description: 'Independent external scholar invited from another accredited university to moderate degrees.',
    privileges: [
      'Scrutinize completed dissertation drafts and Turnitin reports',
      'Conduct rigorous external viva voce examination (30%)',
      'Review internal scoring fairness & provide Senate moderation report',
      'Submit independent recommendation to University Senate'
    ]
  },
  {
    role: 'student',
    label: 'Undergraduate Candidate',
    badge: 'Research Student',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: GraduationCap,
    description: 'Demote/revert account to standard final-year undergraduate research candidate.',
    privileges: [
      'Upload initial topic proposal and manuscript chapters',
      'Request consultation appointments with supervisors',
      'Track similarity audit and defense schedule milestones'
    ]
  }
];

export const AssignStaffRoleModal: React.FC<AssignStaffRoleModalProps> = ({
  user,
  onClose,
  onSuccess
}) => {
  const { updateUserRole, showToast, cloudSyncStatus } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
  const [title, setTitle] = useState(user.title || '');
  const [department, setDepartment] = useState(user.department || 'Department of Computer Science');
  const [faculty, setFaculty] = useState(user.faculty || 'Faculty of Computing');
  const [academicRank, setAcademicRank] = useState(user.academicRank || '');
  const [institution, setInstitution] = useState(user.institution || '');
  const [specialization, setSpecialization] = useState(user.specialization || user.projectTopic || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill sensible default title when role changes if not custom-set
  const handleRoleSelect = (newRole: UserRole) => {
    setSelectedRole(newRole);
    if (!title || title === user.title) {
      if (newRole === 'admin') {
        setTitle('Faculty Administrator / Directorate Member');
      } else if (newRole === 'internal_supervisor') {
        setTitle('Internal Research Supervisor & Senior Lecturer');
      } else if (newRole === 'panel_member') {
        setTitle('Defense Panel Member & Examiner');
      } else if (newRole === 'external_supervisor') {
        setTitle('Visiting External Examiner & Professor');
      } else {
        setTitle('Final Year B.Sc. Candidate');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateUserRole(user.id, selectedRole, {
        title,
        department,
        faculty,
        academicRank,
        institution: selectedRole === 'external_supervisor' ? (institution || 'Visiting University') : institution,
        specialization
      });

      if (res.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(res.message || 'Failed to update role.');
      }
    } catch (err) {
      showToast('An error occurred while saving the role to the database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedConfig = ROLE_OPTIONS.find(r => r.role === selectedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto max-h-[calc(100dvh-2rem)] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A1A1A] text-[#CBA358] shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Assign Staff & Governance Role
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <Database className="w-2.5 h-2.5" />
                  Cloud Firestore
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Delegate departmental responsibilities, supervisor rights, or grant Admin directorate access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1 space-y-5 text-left overscroll-contain">
          {/* Target Staff Member Dossier Card */}
          <div className="rounded-xl border border-stone-200 bg-[#FAF8F5] p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={normalizeIconicAvatar(user.avatar, user.role)}
                alt={user.name}
                className="h-12 w-12 rounded-xl object-contain p-0.5 bg-white border border-stone-300 shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-stone-900 text-sm truncate">{user.name}</h4>
                  <span className="font-mono text-[11px] font-semibold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {user.identifier}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-stone-400" />
                    {user.email}
                  </span>
                  <span>•</span>
                  <span>{user.department}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Current Role</div>
              <span className="inline-block mt-0.5 font-bold text-xs text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                {user.role === 'admin' ? 'Faculty Admin' : user.role.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Role Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select New Assigned Statutory Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROLE_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = selectedRole === opt.role;
                const isAdminOption = opt.role === 'admin';

                return (
                  <button
                    key={opt.role}
                    type="button"
                    onClick={() => handleRoleSelect(opt.role)}
                    className={`relative p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? isAdminOption
                          ? 'border-[#CBA358] bg-[#FAF6ED] ring-2 ring-[#CBA358]/30 shadow-xs'
                          : 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            isSelected 
                              ? isAdminOption ? 'bg-[#1A1A1A] text-[#CBA358]' : 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-xs text-slate-900 line-clamp-1">
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && (
                          <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                            isAdminOption ? 'bg-[#CBA358] text-[#1A1A1A]' : 'bg-blue-600 text-white'
                          }`}>
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {opt.description}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100/80">
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Role Highlight Callout if Admin is Selected */}
          {selectedRole === 'admin' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3.5 flex items-start gap-2.5 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold block text-amber-950">
                  Granting Faculty Directorate & Administration Privileges
                </strong>
                Assigning the <span className="font-bold">Faculty Administrator</span> role authorizes this staff member to access the Master Registry, calibrate Senate Broadsheet marks, delegate roles to all other staff, and activate user portals.
              </div>
            </div>
          )}

          {/* Active Privileges Breakdown */}
          {selectedConfig && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
              <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                <span>Statutory Permissions Granted Under This Role</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                {selectedConfig.privileges.map((priv, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{priv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Statutory Title & Departmental Affiliation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Title / Designation
              </label>
              <input
                type="text"
                value={title || ''}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Professor & HOD / Senior Lecturer"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Academic Rank
              </label>
              <input
                type="text"
                value={academicRank || ''}
                onChange={(e) => setAcademicRank(e.target.value)}
                placeholder="e.g. Professor, Associate Prof, Reader, Lecturer I"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={department || ''}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department of Computer Science"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Faculty / School
              </label>
              <input
                type="text"
                value={faculty || ''}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="Faculty of Computing"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {selectedRole === 'external_supervisor' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  External Institution / University of Affiliation
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={institution || ''}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. University of Lagos (UNILAG) / Abubakar Tafawa Balewa University (ATBU)"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specialization / Domain Focus
              </label>
              <input
                type="text"
                value={specialization || ''}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Distributed Systems, Cybersecurity, Artificial Intelligence & ML"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>
          </div>
        </form>

        {/* Sticky Action Footer */}
        <div className="border-t border-slate-100 pt-3.5 mt-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Persisted directly to Cloud Firestore database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] text-[#1A1A1A]'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>
                    {selectedRole === 'admin'
                      ? 'Promote & Assign Admin Role'
                      : 'Confirm Role Assignment'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
