import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen, 
  User, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAccount } from '../../types';
import { normalizeIconicAvatar } from '../../utils/iconicAvatars';

interface SupervisorAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: UserAccount | null;
  onSuccess?: () => void;
}

export const SupervisorAllocationModal: React.FC<SupervisorAllocationModalProps> = ({
  isOpen,
  onClose,
  student,
  onSuccess,
}) => {
  const { accounts, allocateSupervisor, showToast } = useApp();

  const internalSupervisors = accounts.filter(
    (a) => a.role === 'internal_supervisor' && a.isActive !== false
  );

  // Fallback to any faculty staff if no specific internal supervisor role is present
  const availableSupervisors = internalSupervisors.length > 0
    ? internalSupervisors
    : accounts.filter((a) => a.role !== 'student' && a.isActive !== false);

  const externalSupervisors = accounts.filter(
    (a) => a.role === 'external_supervisor' && a.isActive !== false
  );

  const [selectedInternalId, setSelectedInternalId] = useState<string>('');
  const [selectedExternalId, setSelectedExternalId] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (student) {
      setSelectedInternalId(student.assignedSupervisorId || (availableSupervisors[0]?.id ?? ''));
      setSelectedExternalId(student.assignedExternalSupervisorId || '');
      setTopic(student.projectTopic || student.specialization || '');
      setNotes('');
    }
  }, [student, accounts]);

  if (!isOpen || !student) return null;

  // Calculate current workload per supervisor
  const getWorkload = (supId: string) => {
    return accounts.filter((a) => a.role === 'student' && a.assignedSupervisorId === supId).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternalId) {
      showToast('Please select an Internal Supervisor.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await allocateSupervisor(
        student.id,
        selectedInternalId,
        selectedExternalId ? selectedExternalId : undefined,
        topic.trim() ? topic.trim() : undefined
      );

      if (result.success) {
        showToast(`Supervisor and Topic successfully designated for ${student.name}. Candidate activated.`);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(result.message || 'Allocation could not be completed.');
      }
    } catch (err) {
      console.error('Error during supervisor allocation:', err);
      showToast('Failed to allocate supervisor due to an unexpected error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSupervisorObj = availableSupervisors.find((s) => s.id === selectedInternalId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 my-auto max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <UserCheck className="h-5 w-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">
                Allocate Research Supervisor
              </h2>
              <p className="text-xs text-stone-500">
                Departmental Academic Board · Faculty of Computing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Candidate Profile Summary */}
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 sm:p-4 mb-5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-2">
            Target Research Candidate
          </div>
          <div className="flex items-start gap-3.5">
            <img
              src={normalizeIconicAvatar(student.avatar, 'student')}
              alt={student.name}
              className="h-11 w-11 rounded-full border border-stone-200 object-contain p-0.5 bg-stone-100 shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <h3 className="text-sm font-extrabold text-stone-900 truncate">
                  {student.name}
                </h3>
                <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {student.identifier}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {student.department} · {student.level || '400 Level'}
              </p>

              {/* Project Upload Status */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {student.hasUploadedProject ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Project Uploaded: {student.projectTopic || 'Proposal Available'}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 border border-amber-200">
                    <Info className="h-3 w-3 text-amber-700" />
                    <span>No Project Uploaded Yet · Fresh Activated Account</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informative helper callout */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 mb-5 flex items-start gap-2.5 text-xs text-blue-900">
          <Sparkles className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Allocating a supervisor binds this candidate to the supervisor&apos;s active docket. Once allocated, this student&apos;s dashboard will reflect their assigned supervisor, and when the candidate uploads their project proposal, this supervisor will supervise the research directly.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Internal Supervisor Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-stone-800">
                Internal Supervisor <span className="text-rose-600">*</span>
              </label>
              <span className="text-[10px] text-stone-500">
                Institutional Academic & Lab Mentor
              </span>
            </div>
            <select
              value={selectedInternalId || ''}
              onChange={(e) => setSelectedInternalId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              required
            >
              <option value="" disabled>-- Select Faculty Internal Supervisor --</option>
              {availableSupervisors.map((sup) => {
                const workload = getWorkload(sup.id);
                const quota = sup.supervisorQuota || 8;
                return (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} ({sup.academicRank || sup.title || 'Faculty Member'} · {sup.specialization || sup.department}) — {workload}/{quota} allocated
                  </option>
                );
              })}
            </select>

            {selectedSupervisorObj && (
              <div className="mt-2 rounded-lg bg-stone-50 p-2.5 border border-stone-200 flex items-center justify-between text-[11px] text-stone-700">
                <div>
                  <span className="font-bold text-stone-900">{selectedSupervisorObj.name}</span>
                  <p className="text-stone-500">{selectedSupervisorObj.title}</p>
                </div>
                <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Staff ID: {selectedSupervisorObj.identifier}
                </span>
              </div>
            )}
          </div>

          {/* Approved Research Topic / Focus Area (Designated by Admin) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-stone-800">
                Approved Research Topic / Focus Area
              </label>
              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Designated by Administrator
              </span>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Design & Implementation of a Scalable Cloud Intrusion Detection System"
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Designate or edit the candidate's statutory research topic. This populates their dissertation dossier.
            </p>
          </div>

          {/* External Supervisor Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-stone-800">
                External Supervisor / Visiting Moderator
              </label>
              <span className="text-[10px] text-stone-400">
                Optional · Inter-Institutional Assessor
              </span>
            </div>
            <select
              value={selectedExternalId || ''}
              onChange={(e) => setSelectedExternalId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 bg-white focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            >
              <option value="">-- None (Assign by Faculty Board Later) --</option>
              {externalSupervisors.map((ext) => (
                <option key={ext.id} value={ext.id}>
                  {ext.name} ({ext.academicRank || 'Visiting Professor'} · {ext.institution || 'External Moderator'})
                </option>
              ))}
            </select>
          </div>

          {/* Special Directives or Bench Notes */}
          <div>
            <label className="block font-bold text-stone-800 mb-1">
              Supervision Terms & Special Directives (Optional)
            </label>
            <textarea
              rows={2}
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Lead mentor for antimicrobial resistance gene sequencing and Kirby-Bauer disc diffusion trials..."
              className="w-full rounded-xl border border-stone-300 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedInternalId}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2 shadow-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Allocating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>Confirm & Allocate Supervisor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
