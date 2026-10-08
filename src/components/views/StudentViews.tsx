import React, { useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload, 
  Calendar, 
  ShieldCheck, 
  Award, 
  Download, 
  ExternalLink, 
  User, 
  ChevronRight, 
  BookOpen, 
  Send, 
  Plus,
  MessageSquare,
  Sparkles,
  FileCheck,
  Building,
  GraduationCap,
  X,
  Paperclip,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudentDashboard } from './StudentDashboard';
import { DownloadReportButton } from '../common/DownloadReportButton';
import { DocumentUploader } from '../common/DocumentUploader';
import { StatutoryWorkflowsDemo } from '../common/StatutoryWorkflowsDemo';
import { downloadDocumentFile } from '../../utils/documentDownload';
import { InitialProjectUploadModal } from '../student/InitialProjectUploadModal';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { DefenseStage } from '../../types';

export const StudentViews: React.FC = () => {
  const { 
    activeView, 
    studentProject, 
    currentUser,
    meetings, 
    addMeeting, 
    showToast, 
    setActiveView,
    documentSubmissions,
    submitDocument
  } = useApp();

  const hasProject = Boolean(currentUser?.hasUploadedProject);
  const [isInitialUploadModalOpen, setIsInitialUploadModalOpen] = useState(false);
  const [isClearanceOpen, setIsClearanceOpen] = useState(false);
  const [clearanceStage, setClearanceStage] = useState<DefenseStage>('proposal');

  // Consultation request form modal state
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState('2026-10-02');
  const [meetingTime, setMeetingTime] = useState('11:00 AM');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingMode, setMeetingMode] = useState<'In-Person (Office 304)' | 'Virtual (Google Meet)' | 'Lab 2'>('In-Person (Office 304)');

  // Chapter upload dynamic state (manual entry)
  const [selectedChapter, setSelectedChapter] = useState('Chapter 4: Implementation & Experimental Results');
  const [uploadNote, setUploadNote] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activeRemarkModal, setActiveRemarkModal] = useState<{ title: string; remarks: string; notes?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingAgenda.trim()) {
      showToast('Please provide an agenda for the consultation.');
      return;
    }
    addMeeting({
      studentMatric: studentProject.matric,
      studentName: studentProject.studentName,
      supervisorName: studentProject.supervisorName,
      date: meetingDate,
      time: meetingTime,
      agenda: meetingAgenda,
      actionItems: 'Pending meeting consultation with supervisor.',
      status: 'Scheduled',
      mode: meetingMode,
    });
    setIsConsultModalOpen(false);
    setMeetingAgenda('');
  };

  const handleChapterUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter.trim()) {
      showToast('Please write the target chapter manually.');
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const now = new Date();
      const formattedDate = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      const cleanFileTitle = selectedFileName || `${selectedChapter.replace(/[^a-zA-Z0-9]/g, '_')}_Draft_Final.pdf`;
      submitDocument({
        chapter: selectedChapter,
        title: `${selectedChapter} (${cleanFileTitle})`,
        fileName: cleanFileTitle,
        category: 'Chapter Draft',
        version: selectedChapter.toLowerCase().includes('4') ? 'v2.2' : selectedChapter.toLowerCase().includes('5') ? 'v1.0' : 'v2.0',
        notes: uploadNote || 'Revised draft submitted for supervisor annotation and verification.',
        authorRemarks: uploadNote || 'Revised draft submitted for supervisor annotation and verification.',
        fileSize: '4.2 MB',
        dateSubmitted: formattedDate,
      });
      setUploadNote('');
      setSelectedFileName('');
      showToast(`Chapter draft uploaded successfully: ${selectedChapter}`);
    }, 700);
  };

  // 1. STUDENT OVERVIEW
  if (activeView === 'overview') {
    return <StudentDashboard />;
  }

  // 2. PROJECT TOPIC
  if (activeView === 'project_topic') {
    if (!hasProject) {
      return (
        <div className="space-y-6">
          <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner mb-4">
              <BookOpen className="h-7 w-7 text-amber-700" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 mb-2">
              Action Required · Step 1
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              No Research Project Proposal Uploaded Yet
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Your student account has been activated, but you have not yet uploaded your research project topic, problem statement, and objectives for departmental vetting and supervisor allocation.
            </p>

            {/* Supervisor Status Pill */}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2 border border-slate-200/80 shadow-xs text-xs">
              <span className="text-slate-500">Supervisor Status:</span>
              {currentUser?.assignedSupervisorName || studentProject?.supervisorName ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  Allocated to {currentUser?.assignedSupervisorName || studentProject?.supervisorName}
                </span>
              ) : (
                <span className="font-semibold text-amber-700 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Pending Departmental Allocation by Admin
                </span>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsInitialUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-xs sm:text-sm font-extrabold text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-98"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Project Topic & Proposal</span>
              </button>
            </div>
          </div>

          <InitialProjectUploadModal
            isOpen={isInitialUploadModalOpen}
            onClose={() => setIsInitialUploadModalOpen(false)}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold border ${
                  studentProject.topicStatus === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : studentProject.topicStatus === 'Revision Required'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  Topic Status: {studentProject.topicStatus}
                </span>
                <span className="text-xs text-slate-400">2025/2026 Academic Session</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-2">
                {studentProject.topicTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => showToast('Topic Amendment Request submitted to Faculty Board for review.')}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Request Title Amendment
            </button>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Problem Statement
              </h3>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {studentProject.problemStatement}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Approved Research Objectives
              </h3>
              <div className="space-y-2">
                {studentProject.researchObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-3 text-xs text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-600 text-[10px]">
                      {i + 1}
                    </span>
                    <p className="flex-1">{obj}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Supervisory Committee</p>
                <p className="text-xs font-extrabold text-slate-900 mt-1">{studentProject.supervisorName || currentUser?.assignedSupervisorName || 'Assigned Lead Supervisor'} (Lead)</p>
                <p className="text-[11px] text-slate-600">{studentProject.coSupervisorName || 'Faculty Advisory Panel'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                <p className="text-[11px] font-bold text-slate-500 uppercase">Research Area / Domain</p>
                <p className="text-xs font-extrabold text-slate-900 mt-1">Medical & Computer Systems (ESBL & AMR)</p>
                <p className="text-[11px] text-slate-600">Department of Computer Science Research Cluster A</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. DOCUMENT SUBMISSIONS
  if (activeView === 'documents' || activeView === 'document_submissions') {
    const mySubmissions = documentSubmissions.filter(sub => {
      if (currentUser?.role === 'student') {
        if (sub.studentMatric && currentUser.identifier) {
          return sub.studentMatric === currentUser.identifier;
        }
        if (sub.studentId && currentUser.id) {
          return sub.studentId === currentUser.id;
        }
        if (currentUser.identifier === 'CSC/2021/0482' || currentUser.id === 'usr_std_01') {
          return true;
        }
        return false;
      }
      return true;
    });

    return (
      <div className="space-y-6">
        {/* Bespoke Computer Science Document & Photomicrograph/Gel Assay Vault Uploader */}
        <DocumentUploader
          studentMatric={studentProject.matric}
          projectId="proj-adama-001"
          onUploadSuccess={(uploadInfo: { file: File; category: string; auditResult?: { digitalReceiptId: string; similarityIndex: number } | null }) => {
            submitDocument({
              chapter: uploadInfo.category === 'LAB_ASSAY_IMAGE' ? 'Chapter 4 (Wet-Lab Assay)' : 'Dissertation Manuscript',
              title: uploadInfo.file.name,
              version: 'v2.4 (Vault Encrypted)',
              notes: uploadInfo.auditResult
                ? `Turnitin Verified: ${uploadInfo.auditResult.similarityIndex}% similarity. Receipt #${uploadInfo.auditResult.digitalReceiptId}`
                : 'Benchmark archive and code documentation uploaded.',
              fileSize: `${(uploadInfo.file.size / (1024 * 1024)).toFixed(2)} MB`,
            });
          }}
        />

        {/* Upload Form Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Upload Dissertation Draft</h2>
              <p className="text-xs text-slate-500">Submit revised computer science chapters in PDF or DOCX format for supervisor annotation</p>
            </div>
            <span className="text-xs font-mono text-slate-400">PDF / DOCX (Max 25MB)</span>
          </div>

          <form onSubmit={handleChapterUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Target Chapter</label>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Write chapter manually
                  </span>
                </div>
                <input
                  type="text"
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  placeholder="e.g. Chapter 4: System Implementation & Benchmarks"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  required
                />
                {/* Dynamic Quick Suggestions for Chapters */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Suggestions:</span>
                  {[
                    'Chapter 1: Introduction',
                    'Chapter 2: Literature Review',
                    'Chapter 3: Methodology & Software Design',
                    'Chapter 4: Implementation & Experimental Results',
                    'Chapter 5: Discussion & Conclusion',
                    'Full Dissertation Manuscript'
                  ].map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setSelectedChapter(ch)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer border ${
                        selectedChapter === ch
                          ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ch.split(':')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Revision Version</label>
                <input
                  type="text"
                  readOnly
                  value="Version 2.3 (Lab Journal & Turnitin sync)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Notes for Supervisor</label>
              <textarea
                value={uploadNote || ''}
                onChange={(e) => setUploadNote(e.target.value)}
                placeholder="Detail implementation revisions (e.g., Added throughput benchmarks in Section 4.2 and updated architecture references)..."
                rows={2}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            {/* Hidden native file input for document selection */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFileName(file.name);
                  showToast(`Selected file: ${file.name}`);
                }
              }}
              accept=".pdf,.docx,.doc"
              className="hidden"
            />

            {/* Document Picker Area with required "Upload a project chapter" label */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/25 p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
            >
              <div className="h-11 w-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                Upload a project chapter
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Click to browse files or drag and drop your chapter manuscript (PDF, DOCX up to 25MB)
              </p>

              {selectedFileName ? (
                <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-1.5 border border-blue-200 text-xs font-mono font-bold text-blue-800 shadow-2xs">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>{selectedFileName}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFileName('');
                    }}
                    className="text-slate-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition-colors"
                    title="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="mt-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Choose Chapter File</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const sanitized = (selectedChapter || 'Chapter_4').replace(/[^a-zA-Z0-9]/g, '_');
                      const names = [
                        `${sanitized}_Draft_Final.pdf`,
                        `${sanitized}_Implementation_Benchmarks.pdf`,
                        `${sanitized}_Methodology_Review.pdf`
                      ];
                      const picked = names[Math.floor(Math.random() * names.length)];
                      setSelectedFileName(picked);
                      showToast(`Chapter draft attached: ${picked}`);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Simulate Attach
                  </button>
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-2.5">
                Automated similarity check & system validation formatting will be dispatched
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500 font-medium truncate">
                {selectedFileName ? `Target: ${selectedChapter} • ${selectedFileName}` : `Target: ${selectedChapter || 'Write chapter manually'} (Ready to upload)`}
              </span>
              <button
                type="submit"
                disabled={isUploading || !selectedChapter.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 sm:px-6 py-2 sm:py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs active:scale-98 shrink-0 whitespace-nowrap"
              >
                <Send className="h-3.5 w-3.5 shrink-0" />
                <span>{isUploading ? 'Uploading & Dispatching...' : 'Submit Document Draft'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Submissions List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Submission History & Feedback</h3>
              <p className="text-xs text-slate-500">Live ledger of uploaded chapters and supervisor annotations</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              {mySubmissions.length} Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Category / Stage</th>
                  <th className="py-2.5 px-3">Document Title & File</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Date Submitted</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mySubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No documents uploaded yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        You have not submitted any chapter drafts or research documents yet. Use the upload box above to submit your manuscript.
                      </p>
                    </td>
                  </tr>
                ) : (
                  mySubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200 uppercase tracking-wider">
                          {sub.category || sub.chapter || 'Chapter Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{sub.title}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                          <Paperclip className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[200px]">{sub.fileName || sub.title}</span>
                          {sub.fileSize && <span>({sub.fileSize})</span>}
                        </div>
                        {sub.authorRemarks && (
                          <p className="text-[11px] text-slate-600 italic mt-1 line-clamp-1">
                            Remarks: "{sub.authorRemarks}"
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-medium">{sub.version}</td>
                      <td className="py-3 px-3 font-medium text-slate-700">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>{sub.dateSubmitted}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                          sub.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sub.status === 'Under Review' || sub.status === 'Pending Review'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : sub.status === 'Needs Revision' || sub.status === 'Requires Correction'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(sub.supervisorRemarks || sub.authorRemarks || sub.notes) && (
                            <button
                              type="button"
                              onClick={() => setActiveRemarkModal({
                                title: sub.title,
                                remarks: sub.supervisorRemarks || 'No supervisor remarks recorded yet.',
                                notes: sub.authorRemarks || sub.notes
                              })}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Remarks
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              downloadDocumentFile(sub, {
                                name: studentProject.studentName,
                                matric: studentProject.matric,
                                supervisor: studentProject.supervisorName,
                              });
                              showToast(`Downloaded ${sub.fileName || sub.title}`);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
                            title="Download document file"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supervisor Remarks Modal */}
        {activeRemarkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setActiveRemarkModal(null)}
            />
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 z-10 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Supervisor Review Annotations</h3>
                    <p className="text-[11px] text-slate-500">Department of Computer Science · Laboratory Oversight</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRemarkModal(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Document Draft</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{activeRemarkModal.title}</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Supervisor Feedback:</span>
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed italic">
                    "{activeRemarkModal.remarks}"
                  </p>
                </div>

                {activeRemarkModal.notes && (
                  <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-200">
                    <span className="text-[11px] font-bold text-blue-700 block mb-1">Your Submission Notes:</span>
                    <p className="text-xs text-slate-700">{activeRemarkModal.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveRemarkModal(null)}
                  className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  Close Annotations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. MILESTONES & PROGRESS
  if (activeView === 'milestones' || activeView === 'milestones_progress') {
    const milestones = hasProject ? [
      { id: 1, title: 'Topic Allocation & Research Formulation', date: 'Semester 1', status: studentProject.topicStatus === 'Approved' ? 'Completed' : 'In-Progress', detail: studentProject.topicTitle },
      { id: 2, title: 'Proposal Defense (Hearing Panel A)', date: 'Stage 2', status: studentProject.scores?.proposalDefense ? 'Completed' : studentProject.topicStatus === 'Approved' ? 'Scheduled' : 'Pending', detail: studentProject.scores?.proposalDefense ? `Score: ${studentProject.scores.proposalDefense}/100 · Software Design (30mks), Presentation (20mks), Project Reports (30mks), Response to Questions (20mks)` : 'Departmental Panel evaluation docket. Rubric: Software Design (30), Presentation (20), Documentation (30), Q&A (20).' },
      { id: 3, title: 'Turnitin Anti-Plagiarism Screening (<15%)', date: 'Stage 3', status: studentProject.clearance?.plagiarismRate ? 'Completed' : 'Pending', detail: `Turnitin Plagiarism rate: ${studentProject.clearance?.plagiarismRate || 0}%. Threshold requirement < 15%.` },
      { id: 4, title: 'System Implementation & Empirical Benchmarks (Chapter 4)', date: 'Stage 4', status: studentProject.overallProgressPercent >= 60 ? 'In-Progress' : 'Pending', detail: 'Microservice testbed deployment, synthetic workload benchmarking, and latency evaluation.' },
      { id: 5, title: 'Internal Defense & Prototype Demonstration', date: 'Stage 5', status: studentProject.clearance?.supervisorSignOff ? 'Scheduled' : 'Pending', detail: 'Faculty of Computing Boardroom.' },
      { id: 6, title: 'Final External Viva Voce Examination', date: 'Stage 6', status: 'Pending', detail: 'Statutory External Examination Senate hearing.' },
    ] : [
      { id: 1, title: 'Topic Formulation & Research Proposal Submission', date: 'Action Required', status: 'In-Progress', detail: 'Submit research topic, problem statement, and objectives for supervisor review.' },
      { id: 2, title: 'Departmental Topic Ratification & Ethical Review', date: 'Stage 2', status: 'Pending', detail: 'Faculty Academic Board ratification and institutional ethics clearance.' },
      { id: 3, title: 'Turnitin Anti-Plagiarism Screening (<15%)', date: 'Stage 3', status: 'Pending', detail: 'Statutory similarity index clearance.' },
      { id: 4, title: 'Software Architecture & System Implementation', date: 'Stage 4', status: 'Pending', detail: 'Software development implementation protocols, microservices, and system benchmarks.' },
      { id: 5, title: 'Proposal & Internal Defense', date: 'Stage 5', status: 'Pending', detail: 'Panel hearing and defense demonstration.' },
      { id: 6, title: 'Final Viva Voce Examination', date: 'Stage 6', status: 'Pending', detail: 'Final Senate examination and degree award.' },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 mb-1">Academic Milestone Progression</h2>
              <p className="text-xs text-slate-500">Departmental statutory milestones required for Bachelor of Science (Computer Science) degree award</p>
            </div>
            <DownloadReportButton
              project={{
                name: 'Adama Bashir Muhammad',
                matric: 'ATBU/CSC/2026/042',
                department: 'Computer Science',
                topic: 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures',
                supervisor: 'Dr. Kolawole O. Alabi',
                progressPercentage: 65,
                status: 'Proposal Defense - Cleared',
              }}
              milestones={milestones}
              variant="light"
            />
          </div>

          <div className="relative pl-6 sm:pl-8 border-l-2 border-blue-200 space-y-8">
            {milestones.map((m) => (
              <div key={m.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[31px] sm:-left-[39px] flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white ${
                  m.status === 'Completed' ? 'border-emerald-500 text-emerald-600' :
                  m.status === 'In-Progress' ? 'border-blue-600 text-blue-700 ring-4 ring-blue-500/20' :
                  m.status === 'Scheduled' ? 'border-amber-500 text-amber-600' : 'border-slate-300 text-slate-300'
                }`}>
                  {m.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[11px] font-bold">{m.id}</span>}
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900">{m.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      m.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      m.status === 'In-Progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      m.status === 'Scheduled' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{m.detail}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-2">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Statutory Workflows Hub (Lab Technologist, Score Gazette & Turnitin Gate Guard) */}
        <StatutoryWorkflowsDemo />
      </div>
    );
  }

  // 5. SUPERVISION MEETINGS
  if (activeView === 'meetings' || activeView === 'supervision_meetings') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Supervision Consultation Logs</h2>
            <p className="text-xs text-slate-500">Statutory record of research guidance and laboratory benchwork sessions</p>
          </div>
          <button
            type="button"
            onClick={() => setIsConsultModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs active:scale-98 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Book Consultation</span>
          </button>
        </div>

        <div className="space-y-3">
          {meetings.map((mtg) => (
            <div key={mtg.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    mtg.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {mtg.status}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{mtg.date} · {mtg.time}</span>
                </div>
                <span className="text-xs text-blue-700 font-semibold">{mtg.mode}</span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-700">Meeting Agenda: </span>
                  <span className="text-slate-600">{mtg.agenda}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Action Items & Next Steps: </span>
                  <span className="text-slate-600">{mtg.actionItems}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-50">
                <span>Supervisor: {mtg.supervisorName}</span>
                <span>Verified by Biometric / Portal Timestamp</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for consultation */}
        {isConsultModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <h3 className="text-base font-extrabold text-slate-900">Request Supervision Consultation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Submit consultation proposal to {studentProject.supervisorName}</p>

              <form onSubmit={handleConsultSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Date</label>
                  <input
                    type="date"
                    value={meetingDate || ''}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time Window</label>
                  <input
                    type="text"
                    value={meetingTime || ''}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                    placeholder="e.g. 11:00 AM - 11:45 AM"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Venue / Mode</label>
                  <select
                    value={meetingMode || 'In-Person (Office 304)'}
                    onChange={(e) => setMeetingMode(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="In-Person (Office 304)">In-Person (Office 214, Computing Block)</option>
                    <option value="Virtual (Google Meet)">Virtual Consultation (Google Meet Link)</option>
                    <option value="Lab 2">Microbial Culture & Assay Lab 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discussion Agenda & Questions</label>
                  <textarea
                    value={meetingAgenda || ''}
                    onChange={(e) => setMeetingAgenda(e.target.value)}
                    rows={3}
                    placeholder="List specific agar assays, MIC data curves, or dissertation chapters to review..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConsultModalOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. DEFENSE CLEARANCE
  if (activeView === 'clearances' || activeView === 'defense_clearance') {
    const checks = [
      { name: 'Computer Science Research Ethics & Software Invariant Review Approval', status: true, code: 'ATBU-CSC-ETH-2026-031' },
      { name: 'Anti-Plagiarism Originality Index (Turnitin < 15%)', status: true, code: 'Similarity: 11.2% (Passed)' },
      { name: 'Primary Supervisor Architecture & Prototype Progress Endorsement', status: true, code: 'Endorsed by Dr. K. O. Alabi' },
      { name: 'Departmental Project Compute & Cloud Infrastructure Clearance', status: true, code: 'Receipt #REC-8849201' },
      { name: 'Final External Viva Voce Examination Clearance', status: false, code: 'Awaiting Internal Defense completion' },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Internal Defense Eligibility & Statutory Clearance</h2>
              <p className="text-xs text-slate-500">Automated verification of prerequisite laboratory clearances and ethical certifications</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setClearanceStage('proposal');
                  setIsClearanceOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 px-3.5 py-1.5 text-xs font-bold text-stone-800 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Proposal Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setClearanceStage('internal');
                  setIsClearanceOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Internal Slip</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setClearanceStage('external');
                  setIsClearanceOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>External Slip</span>
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {checks.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/70 p-3.5 sm:p-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    c.status ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status ? <CheckCircle2 className="h-4.5 w-4.5" /> : <Clock className="h-4.5 w-4.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{c.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.code}</p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold shrink-0 self-start sm:self-auto ${
                  c.status ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {c.status ? 'Cleared' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 text-xs text-slate-800">
            <h4 className="font-extrabold flex items-center gap-2 text-slate-900 mb-1.5 text-sm">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Defense Eligibility Confirmed
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Candidate Amina Bello (CSC/2021/0482) has satisfied all prerequisite clearances for the upcoming 
              Internal Defense session on Oct 15, 2026. Official room allocation ticket is confirmed for Computing Boardroom (Room 102).
            </p>
          </div>
        </div>

        {/* Defense Clearance Slip Modal (Proposal, Internal, and External Defense) */}
        <DefenseClearanceFormModal
          isOpen={isClearanceOpen}
          candidate={currentUser}
          candidateMatric={currentUser?.identifier}
          initialStage={clearanceStage}
          isReadOnly={true}
          onClose={() => setIsClearanceOpen(false)}
        />
      </div>
    );
  }

  // 7. DEFENSE SCORES
  if (activeView === 'defense_scores') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proposal Defense Scorecard */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Confirmed Grade A
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Proposal Defense Evaluation</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-900">88.5</span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Problem Formulation & Scientific Justification (20%)</span>
                <span className="font-extrabold text-slate-900">18.5 / 20</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Literature Review & AMR Background (20%)</span>
                <span className="font-extrabold text-slate-900">18.0 / 20</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Culture Protocols & Experimental Design (30%)</span>
                <span className="font-extrabold text-slate-900">27.0 / 30</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Presentation Delivery & Q&A Defense (30%)</span>
                <span className="font-extrabold text-slate-900">25.0 / 30</span>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 border border-slate-200/60">
              <span className="font-bold text-slate-900">Panel Remarks: </span>
              "Exceptional depth in plasmid isolation and MIC determinations. Commended for rigorous aseptic discipline in Chapter 3."
            </div>
          </div>

          {/* Internal Defense Scorecard */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Scheduled
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1">Internal Benchwork Defense</h3>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-blue-700">Oct 15, 2026</span>
                <p className="text-[10px] text-slate-400">10:00 AM · Room 102</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Candidate is cleared to present live laboratory findings, bacterial isolate plates, and gel electrophoresis photographic plates before Defense Panel A.
            </p>

            <div className="rounded-2xl border border-slate-200/80 p-3.5 space-y-1.5 text-xs text-slate-500 bg-slate-50/50">
              <div className="flex justify-between">
                <span>Panel Chair:</span>
                <span className="font-semibold text-slate-900">Prof. Sarah N. Ibrahim</span>
              </div>
              <div className="flex justify-between">
                <span>Internal Examiners:</span>
                <span className="font-semibold text-slate-900">Dr. V. Adeyemi, Dr. A. Salisu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <StudentDashboard />;
};
