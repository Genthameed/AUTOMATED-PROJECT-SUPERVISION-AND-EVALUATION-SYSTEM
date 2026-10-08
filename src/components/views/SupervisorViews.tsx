import React, { useState } from 'react';
import { 
  Users2, 
  FileCheck, 
  Files, 
  CalendarClock, 
  Stamp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  MessageSquare, 
  ExternalLink,
  Plus,
  ShieldCheck,
  Check,
  XCircle,
  FileText,
  BarChart3,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InternalStaffDashboard } from './InternalStaffDashboard';
import { PendingSupervisees } from '../supervisor/PendingSupervisees';
import { ProjectMilestoneTracker } from '../supervisor/ProjectMilestoneTracker';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { downloadDocumentFile } from '../../utils/documentDownload';
import { DefenseStage } from '../../types';

export const SupervisorViews: React.FC = () => {
  const { 
    activeView, 
    supervisorStudents, 
    studentProject,
    documentSubmissions,
    approveTopicReview, 
    approveClearance, 
    showToast,
    setActiveView,
    addMeeting,
    currentProfile,
    currentUser
  } = useApp();

  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Track' | 'Needs Attention'>('All');
  const [allocatedSubView, setAllocatedSubView] = useState<'directory' | 'milestones'>('directory');
  const [reviewSubTab, setReviewSubTab] = useState<'topics' | 'documents'>(
    activeView === 'document_reviews' ? 'documents' : 'topics'
  );
  
  // Feedback annotation modal/state
  const [selectedReview, setSelectedReview] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // New consultation log modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logMatric, setLogMatric] = useState('CSC/2021/0482');
  const [logAgenda, setLogAgenda] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Defense Clearance Form Modal state
  const [clearanceModalMatric, setClearanceModalMatric] = useState<string | null>(null);
  const [clearanceModalStage, setClearanceModalStage] = useState<DefenseStage>('internal');

  const handleSaveConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = supervisorStudents.find(s => s.matric === logMatric);
    addMeeting({
      studentMatric: logMatric,
      studentName: student?.name || 'Amina Bello',
      supervisorName: currentProfile.name || 'Dr. Kolawole O. Alabi',
      date: new Date().toISOString().split('T')[0],
      time: '11:00 AM - 11:45 AM',
      agenda: logAgenda || 'Microbial assay review and protocol verification',
      actionItems: logNotes || 'Tabularize antibiograms and check CLSI 2026 breakpoints.',
      status: 'Completed',
      mode: 'In-Person (Office 214)',
    });
    setIsLogModalOpen(false);
    setLogAgenda('');
    setLogNotes('');
  };

  const filteredStudents = supervisorStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      student.matric.toLowerCase().includes(filterQuery.toLowerCase()) ||
      student.topic.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 1. SUPERVISOR OVERVIEW
  if (activeView === 'overview') {
    return <InternalStaffDashboard initialTab="supervisees" />;
  }

  // PENDING SUPERVISEES (Onboarding & Activation)
  if (activeView === 'pending_supervisees') {
    return <PendingSupervisees />;
  }

  // MILESTONE TRACKING VIEW (BAR CHART FORMAT)
  if (activeView === 'milestone_tracking') {
    return <ProjectMilestoneTracker />;
  }

  // 2. ALLOCATED STUDENTS
  if (activeView === 'allocated_students') {
    if (allocatedSubView === 'milestones') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-stone-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Supervisory Analytics Mode:</span>
              <span className="text-xs font-extrabold text-[#CBA358] flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Student Milestone Progress Percentage Bar Chart</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAllocatedSubView('directory')}
              className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs transition-colors"
            >
              ← Back to Supervisee Directory
            </button>
          </div>
          <ProjectMilestoneTracker />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Supervisee Student Directory</h2>
              <p className="text-xs text-slate-500">6 Allocated B.Sc. candidates for 2025/2026 Academic Session (Department of Computer Science)</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setAllocatedSubView('milestones')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358]/15 border border-[#CBA358]/40 px-3.5 py-1.5 text-xs font-bold text-[#8c6720] hover:bg-[#CBA358]/25 transition-colors shadow-2xs"
              >
                <BarChart3 className="h-3.5 w-3.5 text-[#CBA358]" />
                <span>Open Milestone Bar Chart</span>
              </button>

              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery || ''}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter by name, matric, or topic..."
                  className="rounded-full border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <select
                value={statusFilter || 'All'}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Statuses</option>
                <option value="On Track">On Track</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {filteredStudents.map((student) => (
              <div key={student.matric} className="py-4 hover:bg-slate-50/50 rounded-2xl px-3 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{student.name}</h3>
                      <span className="font-mono text-xs text-slate-500">({student.matric})</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        student.status === 'Needs Attention'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}>
                        {student.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-700 mt-1">
                      {student.topic}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span>Current Phase: <strong className="text-slate-800">{student.stage}</strong></span>
                      <span>Turnitin Index: <strong className={student.similarityIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}>{student.similarityIndex}%</strong></span>
                      <span>Last Bench Meeting: <strong className="text-slate-800">{student.lastMeeting}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('document_reviews');
                        showToast(`Viewing drafts for ${student.name}`);
                      }}
                      className="rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      View Drafts
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        approveClearance(student.matric);
                      }}
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                    >
                      Endorse Clearance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. REVIEWS & DOCUMENT WORKFLOW
  if (activeView === 'reviews' || activeView === 'topic_reviews' || activeView === 'document_reviews') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Academic Submissions Review Desk</h2>
              <p className="text-xs text-slate-500">Examine proposed research topics, problem statements, and manuscript drafts</p>
            </div>
            
            {/* Sub-tab pills */}
            <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setReviewSubTab('topics')}
                className={`rounded-full px-4 py-1.5 transition-all ${
                  reviewSubTab === 'topics' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Project Topics & Proposals
              </button>
              <button
                type="button"
                onClick={() => setReviewSubTab('documents')}
                className={`rounded-full px-4 py-1.5 transition-all ${
                  reviewSubTab === 'documents' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Dissertation Chapters & Drafts
              </button>
            </div>
          </div>

          {/* TAB 1: TOPIC REVIEWS */}
          {reviewSubTab === 'topics' && (
            <div className="mt-5 space-y-4">
              {/* Newly submitted student proposal from context */}
              {studentProject?.hasUploadedProject && studentProject.topicStatus === 'Pending Review' && (
                <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-5 space-y-3 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">
                          {studentProject.studentName} <span className="font-mono text-xs text-slate-500">({studentProject.matric})</span>
                        </h3>
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">
                          New Submission
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Department of Computer Science · Candidate Proposal</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                      Awaiting Supervisor Approval
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">Proposed Research Topic:</p>
                    <p className="text-xs text-slate-800 font-semibold mt-0.5">
                      {studentProject.topicTitle}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-800">Problem Statement & Laboratory Scope:</p>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {studentProject.problemStatement}
                    </p>
                  </div>

                  {studentProject.researchObjectives && studentProject.researchObjectives.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-800 mb-1">Proposed Specific Objectives:</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5 bg-white p-3 rounded-xl border border-slate-200">
                        {studentProject.researchObjectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                    <button
                      type="button"
                      onClick={() => approveTopicReview(studentProject.matric, false)}
                      className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    >
                      Request Revisions
                    </button>
                    <button
                      type="button"
                      onClick={() => approveTopicReview(studentProject.matric, true)}
                      className="rounded-full bg-blue-600 px-5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                    >
                      Approve Topic & Objectives
                    </button>
                  </div>
                </div>
              )}

              {/* Chukwudi Nnamdi */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-slate-50/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Chukwudi Nnamdi <span className="font-mono text-xs text-slate-500">(CSC/2021/0511)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Submitted: 16 Sep 2026</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    Awaiting Review
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">Proposed Topic:</p>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Evaluation of Biosurfactant Production and Hydrocarbon Degradation by Indigenous Pseudomonas
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">Problem Statement & Scope:</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    Hydrocarbon spills in wetlands resist natural bioremediation due to high surface tension. This research isolates indigenous Pseudomonas strains capable of producing rhamnolipid biosurfactants with emulsification indices (E24) exceeding 65%.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => approveTopicReview('CSC/2021/0511', false)}
                    className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => approveTopicReview('CSC/2021/0511', true)}
                    className="rounded-full bg-blue-600 px-4.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                  >
                    Approve Topic & Objectives
                  </button>
                </div>
              </div>

              {/* Precious David */}
              <div className="rounded-2xl border border-slate-200/80 p-5 bg-slate-50/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Precious David <span className="font-mono text-xs text-slate-500">(CSC/2021/0703)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Submitted: 14 Sep 2026</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    Awaiting Review
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">Proposed Topic:</p>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Optimization of Cellulase Production by Aspergillus niger Strains Using Agro-Industrial Waste Substrates
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">Problem Statement & Scope:</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    Commercial cellulase enzymes for bioethanol hydrolysate are economically prohibitive. This project explores solid-state fermentation using cassava peel and corn cob substrates to yield high cellulolytic activity.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => approveTopicReview('CSC/2021/0703', false)}
                    className="rounded-full border border-rose-200 px-4 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => approveTopicReview('CSC/2021/0703', true)}
                    className="rounded-full bg-blue-600 px-4.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                  >
                    Approve Topic & Objectives
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHAPTER & DOCUMENT REVIEWS */}
          {reviewSubTab === 'documents' && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Amina Bello (CSC/2021/0482)</h3>
                    <p className="text-xs font-semibold text-blue-700">Chapter 4: Results & Antibiogram Assays (v2.1)</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                    Ready for Review
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600 space-y-2">
                  <p><strong>Candidate Notes:</strong> "Completed agar disk diffusion assays and minimum inhibitory concentration (MIC) tests against 12 clinical isolates. Standard deviation error bars and zone diameter graphs added in Fig 4.2."</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>File: Chapter_4_Microbial_Assays_Draft_v2.1.pdf</span>
                    <span>·</span>
                    <span>Size: 4.8 MB</span>
                    <span>·</span>
                    <span className="text-emerald-700 font-bold">Turnitin: 11% (Verified Pass)</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      downloadDocumentFile({
                        name: 'Chapter_4_Benchmark_Results_Draft_v2.1.pdf',
                        fileName: 'Chapter_4_Benchmark_Results_Draft_v2.1.pdf',
                        title: 'Chapter 4: Implementation Benchmarks & Latency Evaluation (v2.1)',
                        category: 'Chapter Draft',
                        fileSize: '4.8 MB',
                      }, {
                        name: 'Amina Bello',
                        matric: 'CSC/2021/0482',
                        supervisor: currentUser?.name || 'Dr. Kolawole O. Alabi',
                      });
                      showToast('Downloaded Chapter 4 draft file.');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Draft PDF</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showToast('Annotations and laboratory remarks dispatched to Amina Bello.')}
                      className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Send Remarks & Revision
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Chapter 4 Approved! Candidate cleared for Internal Defense.')}
                      className="rounded-full bg-blue-600 px-4.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                    >
                      Approve Chapter 4
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Document Submissions if any */}
              {documentSubmissions && documentSubmissions.filter(d => d.status === 'Under Review' || d.status === 'Pending Review').map((doc) => (
                <div key={doc.id} className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500">{doc.chapter} · {doc.version} · Submitted {doc.dateSubmitted}</p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                      {doc.status}
                    </span>
                  </div>
                  {doc.authorRemarks && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <strong>Candidate Remarks: </strong>{doc.authorRemarks}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        downloadDocumentFile(doc, {
                          name: doc.studentName,
                          matric: doc.studentMatric,
                          supervisor: currentUser?.name,
                        });
                        showToast(`Downloaded ${doc.fileName || doc.title}`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600" />
                      <span>Download Document</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => showToast(`Requested revisions on ${doc.title}.`)}
                        className="rounded-full border border-slate-200 px-3.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Request Corrections
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Approved submission: ${doc.title}`)}
                        className="rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                      >
                        Approve Submission
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. SUPERVISION MEETINGS & LOGS
  if (activeView === 'meetings' || activeView === 'supervision_logs') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Faculty Supervision Consultations</h2>
            <p className="text-xs text-slate-500">Departmental log of all scheduled laboratory consultations and minutes</p>
          </div>
          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Record New Consultation</span>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
          {[
            { matric: 'CSC/2021/0482', name: 'Amina Bello', date: '18 Sep 2026', minutes: 'Reviewed Chapter 4 implementation tables; directed student to compare throughput benchmarks against system specifications.' },
            { matric: 'CSC/2021/0511', name: 'Chukwudi Nnamdi', date: '15 Sep 2026', minutes: 'Refined architecture diagrams and protocol design in Chapter 3 section 3.2.' },
            { matric: 'CSC/2021/0445', name: 'Ibrahim Musa Farouk', date: '12 Sep 2026', minutes: 'Final viva slide rehearsal completed. Recommended 1 minor edit to performance evaluation slide.' },
          ].map((log, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-900">{log.name} ({log.matric})</span>
                <span className="text-[11px] text-slate-400 font-mono">{log.date}</span>
              </div>
              <p className="text-slate-600">{log.minutes}</p>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 my-auto max-h-[calc(100dvh-2rem)] overflow-y-auto">
              <h3 className="text-base font-extrabold text-slate-900">Record Laboratory Consultation Session</h3>
              <p className="text-xs text-slate-500 mt-0.5">Archive supervisor directives and protocol approvals</p>
              
              <form onSubmit={handleSaveConsultation} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supervisee</label>
                  <select
                    value={logMatric || ''}
                    onChange={(e) => setLogMatric(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {supervisorStudents.map(s => (
                      <option key={s.matric} value={s.matric}>{s.name} ({s.matric})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Agenda</label>
                  <input
                    type="text"
                    value={logAgenda || ''}
                    onChange={(e) => setLogAgenda(e.target.value)}
                    placeholder="e.g. Antibiogram zone diameters and PCR control bands"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Directives & Action Items</label>
                  <textarea
                    value={logNotes || ''}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter summary of guidance given to candidate..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                  >
                    Save Log
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. CLEARANCE APPROVALS
  if (activeView === 'clearance_approvals') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Defense Clearance Endorsements</h2>
              <p className="text-xs text-slate-500">Sign off and certify statutory clearance forms for proposal, internal, and external defense</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setClearanceModalStage('internal');
                  setClearanceModalMatric('20/55777U/1');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <FileCheck className="h-3.5 w-3.5 text-blue-700" />
                <span>Open Internal Clearance Slip (Mariya Isa)</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {supervisorStudents.map((s) => (
              <div key={s.matric} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">{s.name}</p>
                    <span className="font-mono text-[11px] text-slate-500">({s.matric})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.clearanceStatus}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${s.similarityIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    Turnitin: {s.similarityIndex}%
                  </span>
                  
                  {/* Internal Defense Clearance Slip Only */}
                  <button
                    type="button"
                    onClick={() => {
                      setClearanceModalStage('internal');
                      setClearanceModalMatric(s.matric);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98 cursor-pointer"
                  >
                    <FileCheck className="h-3.5 w-3.5 text-blue-200" />
                    <span>Internal Clearance Slip</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defense Clearance Modal */}
        <DefenseClearanceFormModal
          isOpen={!!clearanceModalMatric}
          candidateMatric={clearanceModalMatric || undefined}
          initialStage={clearanceModalStage}
          onClose={() => setClearanceModalMatric(null)}
        />
      </div>
    );
  }

  return <InternalStaffDashboard initialTab="supervisees" />;
};
