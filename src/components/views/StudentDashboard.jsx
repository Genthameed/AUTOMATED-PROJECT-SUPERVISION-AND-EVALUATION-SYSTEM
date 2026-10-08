import React, { useState, useRef, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileText,
  Lock,
  Plus,
  ShieldCheck,
  Upload,
  Calendar,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  X,
  Sparkles,
  Paperclip,
  Trash2,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';
import { DownloadReportButton } from '../common/DownloadReportButton';
import { InitialProjectUploadModal } from '../student/InitialProjectUploadModal';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { useApp } from '../../context/AppContext';
import { downloadDocumentFile } from '../../utils/documentDownload';

const INITIAL_DOCUMENTS = [
  {
    id: 'doc-1',
    name: 'Revised_Proposal_v2.pdf',
    title: 'Revised Proposal & Problem Statement (v2.1)',
    fileName: 'Revised_Proposal_v2.pdf',
    category: 'Proposal Draft',
    size: '3.8 MB',
    dateSubmitted: '15 Sep 2026',
    uploadDate: '15 Sep 2026',
    status: 'Approved',
    version: 'v2.1',
    reviewer: 'Dr. K. O. Alabi',
    authorRemarks: 'Addressed feedback on sample size justification for Barau Dikko clinical isolates.',
    remarks: 'Approved for proposal examination docket.',
  },
  {
    id: 'doc-2',
    name: 'Ethical_Clearance_Certificate.pdf',
    title: 'Institutional Ethical Clearance Certificate',
    fileName: 'Ethical_Clearance_Certificate.pdf',
    category: 'Ethical Approval',
    size: '1.2 MB',
    dateSubmitted: '10 Jul 2026',
    uploadDate: '10 Jul 2026',
    status: 'Approved',
    version: 'v1.0',
    reviewer: 'ATBU Institutional Research & Ethics Committee',
    authorRemarks: 'Official expedited clearance letter endorsed by the Faculty Ethics Sub-committee.',
    remarks: 'Valid for distributed systems testbed deployment across campus network.',
  },
  {
    id: 'doc-3',
    name: 'Chapter_1_to_3_Compiled.pdf',
    title: 'Chapters 1-3: Introduction, Literature & Methodology',
    fileName: 'Chapter_1_to_3_Compiled.pdf',
    category: 'Chapter Draft',
    size: '5.2 MB',
    dateSubmitted: '26 Aug 2026',
    uploadDate: '26 Aug 2026',
    status: 'Approved',
    version: 'v1.4',
    reviewer: 'Dr. K. O. Alabi',
    authorRemarks: 'Expanded architectural specifications and microservices performance metrics.',
    remarks: 'Literature review depth verified; system architecture specifications accepted.',
  },
  {
    id: 'doc-4',
    name: 'System_Methodology_Benchmarking_Protocols.pdf',
    title: 'System Methodology & Benchmarking Protocols',
    fileName: 'System_Methodology_Benchmarking_Protocols.pdf',
    category: 'System Methodology',
    size: '2.4 MB',
    dateSubmitted: '05 Aug 2026',
    uploadDate: '05 Aug 2026',
    status: 'Requires Correction',
    version: 'v1.0',
    reviewer: 'Dr. K. O. Alabi',
    authorRemarks: 'First draft detailing telemetry pipeline and latency evaluation testbed setup.',
    remarks: 'Expand benchmark metrics and latency percentile profiles.',
  },
  {
    id: 'doc-5',
    name: 'Chapter_4_Raw_Telemetry_Traces.xlsx',
    title: 'Chapter 4: Raw Telemetry Traces & Latency Data',
    fileName: 'Chapter_4_Raw_Telemetry_Traces.xlsx',
    category: 'Benchwork Data',
    size: '4.6 MB',
    dateSubmitted: '19 Sep 2026',
    uploadDate: '19 Sep 2026',
    status: 'Pending Review',
    version: 'v1.0',
    reviewer: 'Dr. K. O. Alabi',
    authorRemarks: 'Triplicate benchmark runs across 50 simulated microservice nodes.',
    remarks: 'Awaiting supervisor sign-off on replicate latency runs.',
  },
];

const INITIAL_MEETINGS = [
  {
    id: 'meet-1',
    title: 'System Architecture & Telemetry Inspection',
    date: '28 Sep 2026',
    time: '10:30 AM',
    venue: 'Computer Science Lab 2, ATBU',
    type: 'Upcoming',
    status: 'Confirmed',
    actionPoints:
      'Measurement of latency percentiles across microservice endpoints and node clusters. Reconcile benchmark parameters according to IEEE Cloud standard chart.',
    feedback: 'Supervisor confirmed attendance. Please arrive with typed benchmarking logs.',
  },
  {
    id: 'meet-2',
    title: 'Pre-Proposal Defense Dry Run',
    date: '14 Sep 2026',
    time: '02:00 PM',
    venue: 'Office 304, Faculty of Computing Block',
    type: 'Past',
    status: 'Completed',
    actionPoints:
      'Slide presentation timing capped at 12 minutes. Highlight distributed systems throughput statistics in Bauchi enterprise networks. Clean up architectural diagrams.',
    feedback: 'Strong performance on Q&A anticipation. Cleared to proceed to panel examination.',
  },
  {
    id: 'meet-3',
    title: 'Methodology & Research Protocol Ratification',
    date: '22 Aug 2026',
    time: '11:00 AM',
    venue: 'Virtual Consultation (Google Meet)',
    type: 'Past',
    status: 'Completed',
    actionPoints:
      'Approved telemetry collection procedure from University High Performance Computing cluster. Validated benchmarking protocols and evaluation matrix.',
    feedback: 'Protocol is robust. Maintain logging consistency during test runs.',
  },
  {
    id: 'meet-4',
    title: 'Initial Research Scope Formulation',
    date: '05 Jul 2026',
    time: '09:30 AM',
    venue: 'Office 304, Faculty of Computing Block',
    type: 'Past',
    status: 'Completed',
    actionPoints:
      'Topic ratified and system specifications reviewed. Student assigned key research literature on distributed consensus and microservices architectures.',
    feedback: 'Topic meets departmental honors criteria. Commence chapter one drafting.',
  },
];

export const StudentDashboard = () => {
  const { documentSubmissions, submitDocument, studentProject, currentUser, uploadInitialProject, showToast: contextShowToast, defenseClearances } = useApp();

  // State: Initial Project Upload Modal
  const [isInitialProjectModalOpen, setIsInitialProjectModalOpen] = useState(false);

  // Check if project has been uploaded by the candidate
  const hasProject = Boolean(currentUser?.hasUploadedProject);
  const isSupervisorAllocated = Boolean(
    currentUser?.assignedSupervisorName || studentProject?.supervisorName
  );

  const studentIdentifier = currentUser?.identifier || 'default_candidate';
  const isDemoAccount = (currentUser?.id === 'usr_std_01' || currentUser?.identifier === 'CSC/2021/0482') && Boolean(currentUser?.hasUploadedProject);

  // 1. Injected Mock Data Context (Strictly synchronized with state)
  const studentData = {
    name: currentUser?.name || studentProject?.studentName || 'Student Candidate',
    department: currentUser?.department || studentProject?.department || 'Department of Computer Science',
    institution: 'Abubakar Tafawa Balewa University, Bauchi (ATBU)',
    matric: currentUser?.identifier || studentProject?.matric || 'ATBU/CSC/2026/042',
    topic: hasProject
      ? (studentProject?.topicTitle || currentUser?.projectTopic || 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures')
      : 'No Research Project Uploaded Yet',
    status: hasProject
      ? (studentProject?.topicStatus === 'Pending Review' ? 'Proposal Defense - Under Review' : 'Proposal Defense - Cleared')
      : (isSupervisorAllocated ? 'Supervisor Allocated · Awaiting Project Proposal' : 'Awaiting Initial Topic Submission'),
    supervisor: currentUser?.assignedSupervisorName || studentProject?.supervisorName || '',
    supervisorRank: isSupervisorAllocated
      ? (currentUser?.assignedSupervisorName ? 'Allocated Internal Supervisor' : 'Senior Lecturer · Distributed Systems & Cloud Computing')
      : 'Pending Departmental Allocation',
    externalSupervisor: currentUser?.assignedExternalSupervisorName || studentProject?.coSupervisorName || '',
    externalSupervisorInstitution: currentUser?.assignedExternalSupervisorName
      ? 'External Academic Assessor'
      : (hasProject ? 'University of Lagos (UNILAG) · Visiting Moderator' : 'Visiting Moderator · Awaiting Nomination'),
    progressPercentage: hasProject ? (studentProject?.overallProgressPercent || (isDemoAccount ? 35 : 15)) : 0,
    session: '2025/2026 Academic Year',
    level: currentUser?.level || '400 Level (Finalist)',
  };

  // State: Document Management
  const [docFilter, setDocFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Chapter Draft');
  const [newDocNotes, setNewDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Defense Clearance Form Modal state
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceModalStage, setClearanceModalStage] = useState('proposal');

  // Initialize documents based on whether the student has an uploaded project and user identity
  const [documents, setDocuments] = useState(() => {
    if (!hasProject) {
      return [];
    }
    const storageKey = `abu_docs_${studentIdentifier}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached documents', e);
    }
    return isDemoAccount ? INITIAL_DOCUMENTS : [];
  });

  // Sync documents when project status or global documentSubmissions change
  useEffect(() => {
    if (!hasProject) {
      setDocuments([]);
      setMeetings([]);
    } else {
      // Find submissions belonging to this student
      const studentSubmissions = (documentSubmissions || []).filter(sub => 
        (sub.studentMatric && sub.studentMatric === currentUser?.identifier) ||
        (sub.studentId && sub.studentId === currentUser?.id)
      );

      if (studentSubmissions.length > 0) {
        const mapped = studentSubmissions.map(sub => ({
          id: sub.id,
          name: sub.fileName || sub.title,
          title: sub.title,
          fileName: sub.fileName || sub.title,
          category: sub.category || sub.chapter || 'Chapter Draft',
          size: sub.fileSize || '2.4 MB',
          dateSubmitted: sub.dateSubmitted || 'Today',
          uploadDate: sub.dateSubmitted || 'Today',
          status: sub.status || 'Under Review',
          version: sub.version || 'v1.0',
          reviewer: studentData.supervisor || 'Allocated Internal Supervisor',
          authorRemarks: sub.authorRemarks || sub.notes || '',
          notes: sub.authorRemarks || sub.notes || '',
          remarks: sub.supervisorRemarks || 'Under evaluation by departmental supervisor.',
          file: sub.fileBlob,
          fileBlob: sub.fileBlob,
          fileUrl: sub.fileUrl,
        }));
        setDocuments(mapped);
      } else if (!isDemoAccount) {
        // If not demo account and no submissions, ensure documents is empty
        setDocuments([]);
      }
    }
  }, [hasProject, documentSubmissions, isDemoAccount, studentData.supervisor, currentUser?.identifier, currentUser?.id]);

  // Save documents whenever updated
  useEffect(() => {
    if (!hasProject) return;
    try {
      const serializableDocs = documents.map(doc => ({
        ...doc,
        fileBlob: undefined,
        file: undefined
      }));
      localStorage.setItem(`abu_docs_${studentIdentifier}`, JSON.stringify(serializableDocs));
    } catch (e) {
      console.warn('Could not save documents', e);
    }
  }, [documents, hasProject, studentIdentifier]);

  // State: Supervision Meetings
  const [meetingFilter, setMeetingFilter] = useState('all');
  const [expandedMeetingId, setExpandedMeetingId] = useState('meet-1');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newMeetingAgenda, setNewMeetingAgenda] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('2026-10-05');
  const [newMeetingTime, setNewMeetingTime] = useState('11:00 AM');

  const [meetings, setMeetings] = useState(() => {
    if (!hasProject) {
      return [];
    }
    const storageKey = `abu_meetings_${studentIdentifier}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read cached meetings', e);
    }
    return isDemoAccount ? INITIAL_MEETINGS : [];
  });

  useEffect(() => {
    if (!hasProject) {
      setMeetings([]);
    }
  }, [hasProject]);

  useEffect(() => {
    if (!hasProject) return;
    try {
      localStorage.setItem(`abu_meetings_${studentIdentifier}`, JSON.stringify(meetings));
    } catch (e) {
      console.warn('Could not save meetings', e);
    }
  }, [meetings, hasProject, studentIdentifier]);

  // Toast Helper
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // File selection from browse input
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    setSelectedFile(file);
    // If title is currently empty, prefill with clean file name
    if (!newDocTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setNewDocTitle(cleanName);
    }
    triggerToast(`File ready: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Real document download handler
  const handleDownloadDocument = (doc) => {
    downloadDocumentFile(doc, {
      name: studentData.name,
      matric: studentData.matric,
      supervisor: studentData.supervisor,
    });
    triggerToast(`Downloaded "${doc.fileName || doc.name || doc.title}" successfully.`);
  };

  // Comprehensive Upload submission handler
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    const resolvedTitle = newDocTitle.trim() || (selectedFile ? selectedFile.name : '');
    if (!resolvedTitle && !selectedFile) {
      triggerToast('Please provide a document title or choose a file to upload.');
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullSubmissionDate = `${formattedDate}, ${formattedTime}`;

    const resolvedFileName = selectedFile
      ? selectedFile.name
      : resolvedTitle.endsWith('.pdf') || resolvedTitle.endsWith('.docx') || resolvedTitle.endsWith('.xlsx')
      ? resolvedTitle
      : `${resolvedTitle.replace(/\s+/g, '_')}.pdf`;

    const formattedSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
      : '3.6 MB';

    const authorRemarkText = newDocNotes.trim() || 'Candidate submitted manuscript revision for supervisor verification.';

    const newDoc = {
      id: `doc-${Date.now()}`,
      name: resolvedFileName,
      title: resolvedTitle,
      fileName: resolvedFileName,
      category: newDocCategory,
      size: formattedSize,
      dateSubmitted: fullSubmissionDate,
      uploadDate: fullSubmissionDate,
      status: 'Pending Review',
      version: 'v1.0',
      reviewer: studentData.supervisor,
      authorRemarks: authorRemarkText,
      notes: authorRemarkText,
      remarks: 'Submitted for supervisor laboratory review and methodology annotation.',
      file: selectedFile,
      fileBlob: selectedFile,
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Dispatch to global AppContext
    submitDocument({
      chapter: newDocCategory === 'Chapter Draft' ? (resolvedTitle.includes('Chapter') ? resolvedTitle : `Chapter: ${resolvedTitle}`) : newDocCategory,
      title: resolvedTitle,
      category: newDocCategory,
      fileName: resolvedFileName,
      fileSize: formattedSize,
      notes: authorRemarkText,
      authorRemarks: authorRemarkText,
      dateSubmitted: fullSubmissionDate,
      status: 'Pending Review',
      fileBlob: selectedFile,
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : null,
    });

    // Reset modal state
    setIsUploadModalOpen(false);
    setNewDocTitle('');
    setNewDocCategory('Chapter Draft');
    setNewDocNotes('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    triggerToast(`Document "${resolvedTitle}" successfully submitted to the repository.`);
  };

  // Meeting request handler
  const handleMeetingSubmit = (e) => {
    e.preventDefault();
    if (!newMeetingAgenda.trim()) {
      triggerToast('Please specify a consultation agenda.');
      return;
    }

    const newMeet = {
      id: `meet-${Date.now()}`,
      title: 'Consultation Session',
      date: newMeetingDate,
      time: newMeetingTime,
      venue: 'Office 304, Faculty of Computing Block',
      type: 'Upcoming',
      status: 'Pending Approval',
      actionPoints: newMeetingAgenda,
      feedback: 'Request dispatched to Dr. K. O. Alabi for calendar confirmation.',
    };

    setMeetings([newMeet, ...meetings]);
    setIsMeetingModalOpen(false);
    setNewMeetingAgenda('');
    triggerToast('Supervision consultation request dispatched to supervisor.');
  };

  // Download / View Official Clearance Handler
  const handleDownloadClearance = (stage = 'proposal') => {
    setClearanceModalStage(stage);
    setIsClearanceModalOpen(true);
  };

  // Milestones Data
  const milestones = hasProject ? [
    {
      id: 1,
      title: 'Topic Submission & Ratification',
      completed: true,
      date: isDemoAccount ? '12 June 2026' : (studentProject?.topicStatus === 'Pending Review' ? 'Submitted · Under Review' : 'Ratified'),
      badge: studentProject?.topicStatus === 'Pending Review' ? 'Under Review' : 'Approved by Senate Board',
      details: isDemoAccount
        ? 'Departmental board ratified distributed systems performance optimization focus.'
        : `Submitted research topic: "${studentData.topic}"`,
    },
    {
      id: 2,
      title: 'Chapters 1 - 3 (Proposal Draft)',
      completed: isDemoAccount ? (studentProject?.overallProgressPercent ? studentProject.overallProgressPercent >= 30 : true) : false,
      date: isDemoAccount ? '28 August 2026' : 'Pending Review',
      badge: isDemoAccount ? 'Turnitin: 9% · Supervisor Cleared' : 'In Preparation',
      details: 'Literature review and system architecture methodology validated with departmental compliance.',
    },
    {
      id: 3,
      title: 'Proposal Defense (Viva Voce)',
      completed: isDemoAccount ? (studentProject?.overallProgressPercent ? studentProject.overallProgressPercent >= 60 : true) : false,
      date: isDemoAccount ? '18 September 2026' : 'Awaiting Panel Docket',
      badge: isDemoAccount ? 'Cleared · Score: 78% (A)' : 'Locked',
      details: 'Panel A defended successfully in Boardroom 102. Authorized to begin empirical benchmarks.',
    },
    {
      id: 4,
      title: 'Final Defense & Bound Thesis',
      completed: false,
      date: 'Expected: November 2026',
      badge: 'Pending Systems Validation',
      details: 'Requires completion of Chapter 4 benchmark experiments, Chapter 5 discussion, and External Examiner viva voce review.',
    },
  ] : [
    {
      id: 1,
      title: 'Topic Submission & Ratification',
      completed: false,
      date: 'Pending Submission',
      badge: 'Action Required',
      details: 'Submit your proposed research project topic and problem statement for departmental ratification.',
    },
    {
      id: 2,
      title: 'Chapters 1 - 3 (Proposal Draft)',
      completed: false,
      date: 'Awaiting Topic Approval',
      badge: 'Pending',
      details: 'Develop literature review, system architecture, algorithmic framework, and software design specifications.',
    },
    {
      id: 3,
      title: 'Proposal Defense (Viva Voce)',
      completed: false,
      date: 'Pending Proposal Approval',
      badge: 'Locked',
      details: 'Formal presentation and defense before the Departmental Academic Examination Panel.',
    },
    {
      id: 4,
      title: 'Final Defense & Bound Thesis',
      completed: false,
      date: 'Pending Benchwork',
      badge: 'Locked',
      details: 'Complete experimental bench trials, results collation, and bound thesis submission.',
    },
  ];

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    if (docFilter === 'all') return true;
    if (docFilter === 'Approved') return doc.status === 'Approved';
    if (docFilter === 'Pending') return doc.status === 'Pending Review';
    if (docFilter === 'Corrections') return doc.status === 'Requires Correction';
    return true;
  });

  // Filtered meetings
  const filteredMeetings = meetings.filter((m) => {
    if (meetingFilter === 'all') return true;
    if (meetingFilter === 'upcoming') return m.type === 'Upcoming';
    if (meetingFilter === 'past') return m.type === 'Past';
    return true;
  });

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-8 font-sans text-[#1A1A1A]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-[#1A1A1A] text-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl border border-stone-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 max-w-[90vw]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#CBA358] text-[#1A1A1A] font-extrabold">
            ✓
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* NEW ACCOUNT ONBOARDING HERO BANNER (When No Project Uploaded Yet) */}
      {!hasProject && (
        <section className="rounded-2xl border-2 border-dashed border-amber-300 bg-gradient-to-br from-amber-50/90 via-white to-stone-50 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-extrabold border border-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                <span>Activated Candidate Account · No Project Uploaded Yet</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-stone-900 tracking-tight">
                Welcome to Abubakar Tafawa Balewa University, Bauchi (ATBU) Research Portal
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Your student profile is active. To initialize your dissertation milestones and enable supervisor annotations, please upload your approved or proposed project topic and proposal docket.
              </p>

              {/* Live Supervisor Allocation Info */}
              <div className="mt-3 flex items-start sm:items-center gap-3 p-3 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <UserCheck className="h-5 w-5 text-amber-800" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-stone-900 block">Departmental Supervisor Allocation:</span>
                  {isSupervisorAllocated ? (
                    <span className="text-emerald-800 font-semibold flex items-center gap-1.5 flex-wrap">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                      <span>Allocated: <strong>{studentData.supervisor}</strong> ({studentData.supervisorRank}) — ready to supervise your project once submitted.</span>
                    </span>
                  ) : (
                    <span className="text-amber-800 font-medium">
                      Pending Allocation: Your departmental administrator will assign an internal supervisor from the faculty board to oversee your research. You may submit your topic proposal now.
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsInitialProjectModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-3 text-xs sm:text-sm shadow-md cursor-pointer transition-all active:scale-98"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Project Topic & Proposal</span>
              </button>
              <p className="text-[11px] text-center text-stone-500">
                PDF, Word (.docx) proposal files accepted
              </p>
            </div>
          </div>
        </section>
      )}

      {/* SECTION A: PROJECT OVERVIEW HEADER */}
      <section className="rounded-2xl bg-[#1A1A1A] text-white p-4 sm:p-6 md:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        {/* Subtle decorative gold light glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CBA358]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
          {/* Top Row: Department & Status Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1 text-[11px] sm:text-xs font-semibold text-stone-300 border border-stone-700">
                <BookOpen className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-none">{studentData.department}</span>
                <span className="text-stone-500">·</span>
                <span className="truncate max-w-[140px] sm:max-w-none">{studentData.institution}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-stone-800/80 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-mono text-stone-300 border border-stone-700 shrink-0">
                {studentData.matric}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358]/20 px-3 py-1 text-[11px] sm:text-xs font-bold text-[#CBA358] border border-[#CBA358]/40 shadow-xs whitespace-nowrap">
                <ShieldCheck className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                <span>{studentData.status}</span>
              </span>

              {/* Download Report Button (CSV/JSON) */}
              <DownloadReportButton
                project={studentData}
                milestones={milestones}
                variant="dark"
                size="sm"
                onDownloaded={(fmt) =>
                  triggerToast(`Project milestone report successfully downloaded as ${fmt}`)
                }
              />
            </div>
          </div>

          {/* Middle Row: Student Name & Project Title */}
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Final Year Undergraduate Research Project
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-snug break-words">
              &ldquo;{studentData.topic}&rdquo;
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-stone-300">
              Candidate: <strong className="text-white">{studentData.name}</strong> ({studentData.level})
            </p>
            {!hasProject && (
              <div className="mt-3.5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsInitialProjectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358] hover:bg-[#b89146] text-[#1A1A1A] font-bold px-4 py-2 text-xs shadow-xs cursor-pointer transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Submit Research Topic & Proposal</span>
                </button>
                <span className="text-stone-400 text-xs">
                  {isSupervisorAllocated ? `Supervisor assigned: ${studentData.supervisor}` : 'Supervisor awaiting allocation'}
                </span>
              </div>
            )}
          </div>

          {/* Supervisor Committee & Progress Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2 border-t border-stone-800">
            {/* Internal Supervisor */}
            <div className="flex items-center gap-3 sm:gap-3.5 rounded-xl bg-stone-900/80 p-3 sm:p-3.5 border border-stone-800 min-w-0">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-[#CBA358] text-[#1A1A1A] font-black text-xs sm:text-sm shadow-xs">
                IS
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-[#CBA358] block tracking-wide">
                  Internal Supervisor
                </span>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {studentData.supervisor || 'Awaiting Admin Allocation'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">{studentData.supervisorRank}</p>
              </div>
            </div>

            {/* External Supervisor */}
            <div className="flex items-center gap-3 sm:gap-3.5 rounded-xl bg-stone-900/80 p-3 sm:p-3.5 border border-stone-800 min-w-0">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-xs sm:text-sm border border-indigo-500/30">
                ES
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-indigo-300 block tracking-wide">
                  External Supervisor
                </span>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  {studentData.externalSupervisor || 'Not Assigned'}
                </p>
                <p className="text-[11px] text-stone-400 truncate">{studentData.externalSupervisorInstitution}</p>
              </div>
            </div>

            {/* Visual Progress Bar Section */}
            <div className="flex flex-col justify-center rounded-xl bg-stone-900/80 p-3 sm:p-3.5 border border-stone-800 min-w-0 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-300 text-[11px] sm:text-xs">Overall Completion</span>
                <span className="font-extrabold text-[#CBA358] text-sm">{studentData.progressPercentage}%</span>
              </div>
              {/* Progress Track */}
              <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#CBA358] to-[#e6bd6a] rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${studentData.progressPercentage}%` }}
                />
              </div>
              <div className="flex flex-wrap justify-between items-center text-[10px] text-stone-400 mt-1.5 gap-1">
                <span>{hasProject ? 'Phase 2 of 4 Active' : 'Stage 1: Awaiting Submission'}</span>
                <span className="truncate">{hasProject ? 'Next: Chapter 4 Bench Results' : 'Next: Upload Topic & Proposal'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B & E GRID: Milestones Tracker + Clearances & Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* SECTION B: Milestones & Progress Tracker (7 cols) */}
        <section className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-100 pb-3 sm:pb-4 mb-4 sm:mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Milestones & Progress Tracker</h2>
              <p className="text-[11px] sm:text-xs text-stone-500">Official academic trajectory ratified by Departmental Examination Board</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold text-stone-700 shrink-0">
                {milestones.filter((m) => m.completed).length} of {milestones.length} Completed
              </span>
              {/* Download Report Button (CSV/JSON) */}
              <DownloadReportButton
                project={studentData}
                milestones={milestones}
                variant="light"
                size="sm"
                onDownloaded={(fmt) =>
                  triggerToast(`Milestones summary successfully exported as ${fmt}`)
                }
              />
            </div>
          </div>

          {/* Vertical Stepper / Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative group">
                {/* Node Icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full ring-4 ring-white shadow-xs transition-colors shrink-0 ${
                    milestone.completed
                      ? 'bg-[#CBA358] text-[#1A1A1A]'
                      : 'bg-stone-100 border border-stone-300 text-stone-400'
                  }`}
                >
                  {milestone.completed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
                  ) : (
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </div>

                {/* Milestone Card Content */}
                <div
                  className={`rounded-xl border p-3 sm:p-4 transition-all ${
                    milestone.completed
                      ? 'border-[#CBA358]/30 bg-[#FDFBF7]'
                      : 'border-stone-200/80 bg-stone-50/50 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{milestone.title}</h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-bold self-start sm:self-auto shrink-0 ${
                        milestone.completed
                          ? 'bg-[#CBA358]/20 text-[#8f6d28] border border-[#CBA358]/40'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {milestone.badge}
                    </span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-stone-600 mt-1.5 leading-relaxed">{milestone.details}</p>

                  <div className="mt-2.5 flex flex-wrap items-center justify-between text-[10px] sm:text-[11px] text-stone-500 pt-2 border-t border-stone-200/60 gap-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="h-3 w-3 text-stone-400 shrink-0" />
                      <span>{milestone.date}</span>
                    </span>
                    <span
                      className={`font-semibold shrink-0 ${
                        milestone.completed ? 'text-[#8f6d28]' : 'text-stone-400'
                      }`}
                    >
                      {milestone.completed ? 'Stage Cleared' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION E: Clearances & Scores (5 cols) */}
        <section className="lg:col-span-5 space-y-4 sm:space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Official Clearances & Scores</h2>
                <p className="text-[11px] sm:text-xs text-stone-500">Accredited examination viva voce certifications</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#CBA358] shrink-0" />
            </div>

            {/* CARD 1: Proposal Defense Clearance */}
            {hasProject ? (
              isDemoAccount ? (
                (() => {
                  const clr = defenseClearances?.find(c => (c.candidateMatric === studentData.matric || c.candidateMatric === '20/55777U/1' || c.candidateMatric === 'CSC/2021/0482') && c.defenseType === 'proposal') 
                    || defenseClearances?.find(c => c.defenseType === 'proposal');
                  const scores = clr?.scores || {
                    softwareDesign: 24,
                    presentation: 16,
                    projectReports: 23,
                    responseToQuestions: 15,
                    totalScore: 78,
                    letterGrade: 'A'
                  };
                  const totalScore = scores.totalScore ?? (scores.softwareDesign + scores.presentation + scores.projectReports + scores.responseToQuestions);
                  const grade = scores.letterGrade || (totalScore >= 70 ? 'A (Distinction)' : totalScore >= 60 ? 'B (Very Good)' : totalScore >= 50 ? 'C (Good)' : 'D (Pass)');

                  return (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="min-w-0">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3 shrink-0" />
                            <span>Cleared & Ratified</span>
                          </span>
                          <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 mt-2">Proposal Defense Clearance & Evaluation</h3>
                          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">Faculty Viva Voce Committee · Panel A</p>
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-lg sm:text-2xl font-black text-emerald-800">{totalScore} / 100</div>
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300/50">
                            Grade: {grade}
                          </span>
                        </div>
                      </div>

                      {/* 4 Statutory Grading Components */}
                      <div className="mt-3.5 pt-3 border-t border-emerald-200/80">
                        <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center justify-between">
                          <span>Statutory Grading Breakdown (100 Marks)</span>
                          <span className="text-[10px] text-emerald-700 font-mono">NUC / ATBU Benchmark</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                            <div className="text-[10px] font-bold text-stone-600">Software Design & Quality</div>
                            <div className="text-xs sm:text-sm font-mono font-black text-stone-900 mt-1">
                              {scores.softwareDesign} <span className="text-[10px] font-semibold text-stone-400">/ 30 marks</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(scores.softwareDesign / 30) * 100}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                            <div className="text-[10px] font-bold text-stone-600">Presentation</div>
                            <div className="text-xs sm:text-sm font-mono font-black text-stone-900 mt-1">
                              {scores.presentation} <span className="text-[10px] font-semibold text-stone-400">/ 20 marks</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div className="bg-emerald-600 h-1 rounded-full" style={{ width: `${(scores.presentation / 20) * 100}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                            <div className="text-[10px] font-bold text-stone-600">Project Reports & Docs</div>
                            <div className="text-xs sm:text-sm font-mono font-black text-stone-900 mt-1">
                              {scores.projectReports} <span className="text-[10px] font-semibold text-stone-400">/ 30 marks</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${(scores.projectReports / 30) * 100}%` }}></div>
                            </div>
                          </div>

                          <div className="bg-white/95 p-2.5 rounded-xl border border-emerald-100 shadow-2xs">
                            <div className="text-[10px] font-bold text-stone-600">Response to Questions</div>
                            <div className="text-xs sm:text-sm font-mono font-black text-stone-900 mt-1">
                              {scores.responseToQuestions} <span className="text-[10px] font-semibold text-stone-400">/ 20 marks</span>
                            </div>
                            <div className="w-full bg-stone-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div className="bg-amber-600 h-1 rounded-full" style={{ width: `${(scores.responseToQuestions / 20) * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3.5 space-y-1.5 text-[11px] sm:text-xs text-stone-700 bg-white/80 rounded-xl p-3 border border-emerald-100">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-stone-500 shrink-0">Clearance ID:</span>
                          <span className="font-mono font-bold text-stone-800 truncate">ATBU-CLR-2026-PROP-042</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-stone-500 shrink-0">Exam Date:</span>
                          <span className="font-medium text-stone-800">18 September 2026</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-stone-500 shrink-0">Panel Chair:</span>
                          <span className="font-medium text-stone-800 truncate">Prof. Sarah N. Ibrahim</span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-emerald-800 font-medium italic pt-1 border-t border-emerald-100 mt-1">
                          &ldquo;Candidate demonstrated strong architectural design, sound methodology and software testbed competence. Unanimously cleared for prototype implementation and field validation.&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadClearance('proposal')}
                          className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs active:scale-98 transition-all cursor-pointer"
                        >
                          <FileCheck className="h-3.5 w-3.5 shrink-0" />
                          <span>Proposal Defense Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadClearance('internal')}
                          className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-all cursor-pointer"
                        >
                          <FileCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                          <span>Internal Defense Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadClearance('external')}
                          className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-all cursor-pointer"
                        >
                          <FileCheck className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                          <span>External Viva Slip</span>
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide border border-amber-300">
                        <Clock className="h-3 w-3 shrink-0 text-amber-700" />
                        <span>Proposal Submitted · In Review</span>
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 mt-2">Proposal Defense Docket</h3>
                      <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">Assigned to: {studentData.supervisor || 'Allocated Supervisor'}</p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-sm sm:text-base font-bold text-amber-900">Under Review</div>
                      <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                        Awaiting Viva Voce Schedule
                      </span>
                    </div>
                  </div>

                  {/* Statutory Criteria Preview */}
                  <div className="mt-3.5 pt-3 border-t border-amber-200/80">
                    <div className="text-[11px] font-bold text-amber-950 uppercase tracking-wider mb-2">
                      Statutory Evaluation Scheme (100 Marks Total)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-amber-900">
                      <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60 font-medium">
                        <span className="font-bold block text-stone-800">Software Design</span> 30 Marks Max
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60 font-medium">
                        <span className="font-bold block text-stone-800">Presentation</span> 20 Marks Max
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60 font-medium">
                        <span className="font-bold block text-stone-800">Project Reports</span> 30 Marks Max
                      </div>
                      <div className="p-2 rounded-lg bg-white/70 border border-amber-200/60 font-medium">
                        <span className="font-bold block text-stone-800">Response to Qs</span> 20 Marks Max
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-1.5 text-[11px] sm:text-xs text-stone-700 bg-white/80 rounded-xl p-3 border border-amber-100">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500 shrink-0">Clearance Docket:</span>
                      <span className="font-mono font-bold text-amber-900 truncate">ATBU-CLR-2026-PROP-PENDING</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500 shrink-0">Date Uploaded:</span>
                      <span className="font-medium text-stone-800">Recent Submission</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-stone-500 shrink-0">Turnitin Similarity:</span>
                      <span className="font-medium text-stone-700">Scheduled for Anti-Plagiarism Scan</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-amber-900 font-medium italic pt-1 border-t border-amber-100 mt-1">
                      &ldquo;Research proposal successfully uploaded. Your supervisor has been notified to evaluate scope, methodology, and recommend viva voce scheduling.&rdquo;
                    </p>
                  </div>

                  <div className="mt-3.5 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadClearance('proposal')}
                      className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      <span>Proposal Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadClearance('internal')}
                      className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      <span>Internal Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadClearance('external')}
                      className="flex-1 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                      <span>External Slip</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 sm:p-5 shadow-xs relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 text-stone-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                      <Clock className="h-3 w-3 text-stone-500 shrink-0" />
                      <span>Pending Proposal</span>
                    </span>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 mt-2">Proposal Defense Clearance</h3>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5">Faculty Viva Voce Committee · Panel A</p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-lg sm:text-xl font-bold text-stone-400">— / 100</div>
                    <span className="inline-block text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                      Awaiting Upload
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-1.5 text-[11px] sm:text-xs text-stone-700 bg-white/80 rounded-xl p-3 border border-stone-200">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-stone-500 shrink-0">Clearance Status:</span>
                    <span className="font-semibold text-stone-700">Pending Project Proposal Upload</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-stone-500 shrink-0">Turnitin Plagiarism:</span>
                    <span className="font-semibold text-stone-500">Unassessed (0%)</span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-600 font-medium italic pt-1 border-t border-stone-200 mt-1">
                    Candidate has not submitted a research proposal. Defense clearance and scoring docket will be scheduled once the project proposal is submitted and reviewed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInitialProjectModalOpen(true)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span>Submit Proposal to Initiate Clearance</span>
                </button>
              </div>
            )}

            {/* CARD 2: Final Defense Clearance (Locked State) */}
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 sm:p-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 text-stone-700 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                    <Lock className="h-3 w-3 text-stone-500 shrink-0" />
                    <span>Locked · Pending</span>
                  </span>
                  <h3 className="text-xs sm:text-sm font-extrabold text-stone-800 mt-2">Final Defense Clearance</h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">Senate External Examiner Board</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-lg sm:text-xl font-bold text-stone-400">— / 100</div>
                  <span className="inline-block text-[10px] font-semibold text-stone-400">Not Evaluated</span>
                </div>
              </div>

              {/* Requirements Checklist to Unlock */}
              <div className="mt-3.5 space-y-2 text-[11px] sm:text-xs text-stone-600 bg-white rounded-xl p-3 border border-stone-200/80">
                <span className="font-bold text-stone-800 block text-[10px] sm:text-[11px] uppercase tracking-wider">
                  Prerequisites to Unlock Clearance:
                </span>
                <div className={`flex items-center gap-2 ${hasProject ? 'text-emerald-700' : 'text-stone-500'}`}>
                  {hasProject ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  )}
                  <span>{hasProject ? 'Proposal Defense Clearance Approved' : 'Submit Project Proposal Draft'}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-500">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                  <span>Complete Chapter 4 Results & Data Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Turnitin Anti-Plagiarism Verification (&lt; 15%)</span>
                </div>
                <div className="flex items-center gap-2 text-stone-400">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>External Examiner Docket Nomination</span>
                </div>
              </div>

              <div className="mt-4 flex items-start sm:items-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-[10px] sm:text-[11px] text-stone-500 font-medium">
                <Lock className="h-4 w-4 text-stone-400 shrink-0 mt-0.5 sm:mt-0" />
                <span>This docket will unlock once supervisor endorses final bound dissertation.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION C: DOCUMENT MANAGEMENT (UPLOADS) */}
      <section className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-6 md:p-7 shadow-xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-stone-100 pb-3.5 sm:pb-4 mb-4 sm:mb-5">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Document Management & Submission Repository</h2>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Submit drafts, ethical approvals, laboratory raw data sheets, and Turnitin similarity reports
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center rounded-xl border border-stone-200 bg-stone-50 p-0.5 sm:p-1 text-xs max-w-full">
              {[
                { id: 'all', label: 'All Files' },
                { id: 'Approved', label: 'Approved' },
                { id: 'Pending', label: 'In Review' },
                { id: 'Corrections', label: 'Needs Action' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDocFilter(tab.id)}
                  className={`rounded-lg px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                    docFilter === tab.id
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Gold + Upload Document Action Button */}
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#CBA358] px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-[#1A1A1A] hover:bg-[#b89146] shadow-xs active:scale-98 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              <span>+ Upload Document</span>
            </button>
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredDocs.map((doc) => {
            const isApproved = doc.status === 'Approved';
            const isPending = doc.status === 'Pending Review' || doc.status === 'Under Review' || doc.status === 'Pending';
            const isCorrection = doc.status === 'Requires Correction' || doc.status === 'Needs Revision';
            const submissionDate = doc.dateSubmitted || doc.uploadDate || '21 Sep 2026';
            const displayTitle = doc.title || doc.name;
            const displayFileName = doc.fileName || doc.name;
            const displayRemarks = doc.authorRemarks || doc.notes;

            return (
              <div
                key={doc.id}
                className="rounded-2xl border border-stone-200 bg-[#FDFBF7] p-3.5 sm:p-5 flex flex-col justify-between hover:border-[#CBA358]/60 hover:shadow-xs transition-all min-w-0"
              >
                <div>
                  {/* Top Bar: Icon, Category, Title, Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-stone-200 text-[#8f6d28] shadow-2xs">
                        <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block truncate">
                          {doc.category || 'Chapter Draft'}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A] truncate" title={displayTitle}>
                          {displayTitle}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] font-bold shrink-0 whitespace-nowrap ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  {/* Submission Metadata: File Name & Visible Date Submitted */}
                  <div className="mt-3 space-y-1.5 border-t border-stone-200/60 pt-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-mono truncate">
                      <Paperclip className="h-3 w-3 text-stone-400 shrink-0" />
                      <span className="truncate">{displayFileName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-600 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                      <span>Date Submitted: <strong className="text-stone-900 font-bold">{submissionDate}</strong></span>
                    </div>
                  </div>

                  {/* Captured Author Revision Remarks */}
                  {displayRemarks && (
                    <div className="mt-3 rounded-xl bg-white p-2.5 border border-stone-200/70 text-[11px] text-stone-700 space-y-0.5">
                      <span className="font-extrabold text-[10px] text-stone-400 uppercase tracking-wider block">
                        Author Revision Remark
                      </span>
                      <p className="text-stone-800 leading-relaxed italic text-[11px]">
                        "{displayRemarks}"
                      </p>
                    </div>
                  )}

                  {/* Supervisor Annotation / Feedback */}
                  {doc.remarks && doc.remarks !== displayRemarks && (
                    <p className="mt-2 text-[10px] sm:text-[11px] text-stone-500 line-clamp-2 bg-stone-50 rounded-lg p-2 border border-stone-200/50 leading-relaxed">
                      <span className="font-bold text-stone-600">Reviewer: </span>
                      {doc.remarks}
                    </p>
                  )}
                </div>

                {/* Footer: Version, Size, and Real Download Trigger */}
                <div className="mt-3.5 sm:mt-4 pt-2.5 sm:pt-3 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="truncate pr-2">
                    <span className="font-mono text-stone-700 font-bold">{doc.version || 'v1.0'}</span> · {doc.size || doc.fileSize || '3.5 MB'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(doc)}
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#8f6d28] hover:text-[#b89146] shrink-0 p-1 rounded-md hover:bg-[#CBA358]/10 transition-colors whitespace-nowrap cursor-pointer"
                    title={`Download ${displayFileName}`}
                  >
                    <Download className="h-3.5 w-3.5 shrink-0" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocs.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center bg-stone-50/50">
            <FileText className="h-9 w-9 text-stone-300 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-stone-800">
              {hasProject ? 'No Documents Match Filter' : 'No Research Documents Uploaded Yet'}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
              {hasProject
                ? 'Try clearing your category filter or click "+ Upload Document" to attach additional draft manuscripts.'
                : 'Upload your initial research proposal draft or chapter documents to establish version control and enable supervisor annotations.'}
            </p>
            <button
              type="button"
              onClick={() => (hasProject ? setIsUploadModalOpen(true) : setIsInitialProjectModalOpen(true))}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358] hover:bg-[#b89146] text-[#1A1A1A] font-bold px-4 py-2 text-xs shadow-xs cursor-pointer transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{hasProject ? 'Upload Document' : 'Upload Research Proposal'}</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION D: SUPERVISION MEETINGS */}
      <section className="rounded-2xl border border-stone-200 bg-white p-3.5 sm:p-6 md:p-7 shadow-xs overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-stone-100 pb-3.5 sm:pb-4 mb-4 sm:mb-5">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Supervision Consultation Log & Agenda</h2>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Documented supervisor office hours, bench demonstrations, and academic guidance records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="flex flex-wrap items-center rounded-xl border border-stone-200 bg-stone-50 p-0.5 sm:p-1 text-xs max-w-full">
              {[
                { id: 'all', label: 'All Sessions' },
                { id: 'upcoming', label: 'Upcoming' },
                { id: 'past', label: 'Past Logs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMeetingFilter(tab.id)}
                  className={`rounded-lg px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold transition-all whitespace-nowrap ${
                    meetingFilter === tab.id
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsMeetingModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-bold text-stone-700 hover:bg-stone-50 shadow-xs active:scale-98 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 text-[#8f6d28] shrink-0" />
              <span>Book Consultation</span>
            </button>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => {
            const isExpanded = expandedMeetingId === meeting.id;
            const isUpcoming = meeting.type === 'Upcoming';

            return (
              <div
                key={meeting.id}
                className={`rounded-2xl border transition-all ${
                  isUpcoming
                    ? 'border-[#CBA358]/50 bg-[#FDFBF7]'
                    : 'border-stone-200/80 bg-stone-50/50'
                }`}
              >
                <div
                  className="p-3.5 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none"
                  onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isUpcoming
                          ? 'bg-[#CBA358] text-[#1A1A1A]'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">{meeting.title}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            isUpcoming
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {meeting.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-stone-500 text-[11px] mt-1">
                        <span className="font-semibold text-stone-700 whitespace-nowrap">{meeting.date} at {meeting.time}</span>
                        <span className="hidden sm:inline">·</span>
                        <span className="flex items-center gap-1 min-w-0">
                          <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                          <span className="truncate">{meeting.venue}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center pt-0.5 sm:pt-0">
                    <span className="text-xs font-bold text-stone-500 hidden md:inline">
                      {isExpanded ? 'Hide Details' : 'View Action Points'}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-stone-200/80 text-stone-600 hover:bg-stone-100 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs border-t border-stone-200/60 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3">
                      <div className="rounded-xl bg-white p-3.5 border border-stone-200/80">
                        <span className="font-bold text-stone-800 uppercase text-[10px] tracking-wider block mb-1">
                          Action Points & Discussion Agenda:
                        </span>
                        <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">{meeting.actionPoints}</p>
                      </div>

                      <div className="rounded-xl bg-white p-3.5 border border-stone-200/80">
                        <span className="font-bold text-[#8f6d28] uppercase text-[10px] tracking-wider block mb-1">
                          Supervisor Feedback & Directives:
                        </span>
                        <p className="text-stone-600 leading-relaxed text-[11px] sm:text-xs">{meeting.feedback}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => triggerToast(`Exported minutes for session on ${meeting.date}.`)}
                        className="font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg border border-stone-200 bg-white shadow-2xs hover:bg-stone-50 transition-colors"
                      >
                        Export Minutes (PDF)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredMeetings.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-stone-200 p-8 text-center bg-stone-50/50 mt-3">
            <Calendar className="h-9 w-9 text-stone-300 mx-auto mb-2.5" />
            <h4 className="text-sm font-bold text-stone-800">
              {hasProject ? 'No Consultation Sessions Found' : 'No Consultation Sessions Logged Yet'}
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-3">
              {hasProject
                ? 'No consultation records match the active filter. Click "Book Consultation" to request an appointment with your supervisor.'
                : isSupervisorAllocated
                ? `Your allocated supervisor (${studentData.supervisor}) will log office hours, methodology reviews, and benchwork meetings here.`
                : 'Consultation agendas and viva preparation notes will appear here once your departmental supervisor is allocated.'}
            </p>
            {hasProject && (
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold px-4 py-2 text-xs shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Book Consultation</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* MODAL 1: Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-stone-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Upload Research Document</h3>
                <p className="text-[11px] sm:text-xs text-stone-500">Attach manuscript revisions, lab data sheets, or certifications</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
              {/* Hidden Native File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.xlsx,.doc,.xls,.txt,.rtf"
                className="hidden"
              />

              <div>
                <label className="block font-bold text-stone-700 mb-1">Document Title / File Name</label>
                <input
                  type="text"
                  value={newDocTitle || ''}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Chapter 5: Discussion & Findings"
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#CBA358]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-stone-700">Target Chapter / Document Category</label>
                  <span className="text-[10px] text-[#8f6d28] font-bold bg-[#FAF4E6] px-1.5 py-0.5 rounded border border-[#CBA358]/30">
                    Write manually
                  </span>
                </div>
                <input
                  type="text"
                  value={newDocCategory || ''}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  placeholder="e.g. Chapter 4: System Implementation & Benchmarks"
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#CBA358]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-stone-400">Quick Suggestions:</span>
                  {['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Proposal Draft', 'Final Dissertation'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewDocCategory(cat)}
                      className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        newDocCategory === cat ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag and Drop Box with Interactive File Attachment */}
              {!selectedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed p-4 sm:p-5 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[#CBA358] bg-[#FAF4E6] scale-[1.01]'
                      : 'border-[#CBA358]/50 bg-[#FDFBF7] hover:border-[#CBA358]'
                  }`}
                >
                  <Upload className="h-7 w-7 sm:h-8 sm:w-8 text-[#CBA358] mx-auto mb-2" />
                  <p className="font-bold text-stone-800 text-xs sm:text-sm">Upload a project chapter</p>
                  <p className="text-[10px] sm:text-[11px] text-stone-400 mt-0.5">Drag & drop your chapter manuscript or browse files (PDF, DOCX up to 25 MB)</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-3 rounded-full border border-stone-300 bg-white px-3 py-1 font-bold text-stone-700 hover:bg-stone-50 text-[11px] shadow-2xs cursor-pointer"
                  >
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/40 p-3.5 sm:p-4 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-stone-900 truncate max-w-[200px]">{selectedFile.name}</span>
                          <span className="text-[10px] rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-semibold shrink-0">
                            Attached Ready
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · {selectedFile.type || 'Document file'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#8f6d28] hover:underline px-2 py-1 rounded cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveSelectedFile}
                        className="text-stone-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 cursor-pointer transition-colors"
                        title="Remove attached file"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-stone-700 mb-1">Author Revision Remarks</label>
                <textarea
                  rows={3}
                  value={newDocNotes || ''}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder="Summarize changes made or specific feedback requested from Dr. Alabi..."
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#CBA358]"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    handleRemoveSelectedFile();
                  }}
                  className="rounded-full border border-stone-200 px-4 py-2 text-stone-600 hover:bg-stone-50 font-medium text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#CBA358] px-5 py-2 font-bold text-[#1A1A1A] hover:bg-[#b89146] shadow-xs active:scale-98 text-xs cursor-pointer"
                >
                  Confirm & Submit Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Book Consultation Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-2xl border border-stone-200 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A]">Schedule Supervision Session</h3>
                <p className="text-[11px] sm:text-xs text-stone-500">Request consultation with Dr. Kolawole O. Alabi</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetingModalOpen(false)}
                className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center shrink-0 ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleMeetingSubmit} className="space-y-3.5 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Proposed Date</label>
                  <input
                    type="date"
                    value={newMeetingDate || ''}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-[#CBA358] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newMeetingTime || ''}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    placeholder="e.g. 11:30 AM"
                    className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-[#CBA358] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Consultation Agenda</label>
                <textarea
                  rows={3}
                  value={newMeetingAgenda || ''}
                  onChange={(e) => setNewMeetingAgenda(e.target.value)}
                  placeholder="Outline key experimental results, statistical charts, or chapter revisions to discuss..."
                  className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#CBA358]"
                  required
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="rounded-full border border-stone-200 px-4 py-2 text-stone-600 hover:bg-stone-50 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[#CBA358] px-5 py-2 font-bold text-[#1A1A1A] hover:bg-[#b89146] shadow-xs active:scale-98 text-xs"
                >
                  Request Consultation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Initial Project & Proposal Upload Modal */}
      <InitialProjectUploadModal
        isOpen={isInitialProjectModalOpen}
        onClose={() => setIsInitialProjectModalOpen(false)}
      />

      {/* MODAL 4: Official Defense Clearance Slip (Template View & PDF Print) */}
      <DefenseClearanceFormModal
        isOpen={isClearanceModalOpen}
        candidate={currentUser}
        candidateMatric={currentUser?.identifier}
        initialStage={clearanceModalStage}
        isReadOnly={true}
        onClose={() => setIsClearanceModalOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
