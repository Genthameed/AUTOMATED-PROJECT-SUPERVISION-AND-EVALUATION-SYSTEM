import React, { useState, useMemo, useEffect } from 'react';
import {
  Users2,
  CalendarDays,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  X,
  Check,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Sliders,
  Send,
  Plus,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  MapPin,
  User,
  GraduationCap,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DownloadReportButton } from '../common/DownloadReportButton';
import { ProjectMilestoneTracker } from '../supervisor/ProjectMilestoneTracker';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { downloadDocumentFile } from '../../utils/documentDownload';

// Circular Progress Ring Helper
const ProgressRing = ({ progress = 0, size = 56, strokeWidth = 5, className = '' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200 dark:text-stone-700/60"
          fill="transparent"
        />
        {/* Active Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#CBA358"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-[11px] font-extrabold font-mono text-[#1A1A1A]">
        {progress}%
      </div>
    </div>
  );
};

export const InternalStaffDashboard = ({ initialTab }) => {
  const { currentRole, setRole, currentUser, accounts, documentSubmissions, showToast: globalToast, setDefenseClearances } = useApp();

  // 1. Top-Level View Toggle ('supervisees' vs 'panels')
  // Default according to currentRole or initialTab prop
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab) return initialTab;
    return currentRole === 'panel_member' ? 'panels' : 'supervisees';
  });

  // Local Toast Notification
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    if (globalToast) globalToast(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // -------------------------------------------------------------
  // 2. MOCK DATA: MY SUPERVISEES (Internal Supervisor Mode)
  // -------------------------------------------------------------
  const DEMO_SUPERVISEES = [
    {
      id: 'std-1',
      name: 'Adama Bashir Muhammad',
      matric: 'ATBU/CSC/2026/042',
      topic: 'Antimicrobial Resistance Profiles of ESBL-Producing Enterobacteriaceae Isolated from Hospital Effluent',
      stage: 'Awaiting Document Review',
      stageBadgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
      progress: 68,
      turnitinIndex: 11,
      clearanceGranted: false,
      lastMeeting: '18 Sep 2026',
      track: 'Clinical & Artificial Intelligence',
      chapters: [
        {
          id: 'chap-1',
          name: 'Chapter 1: Problem Formulation & Research Objectives.pdf',
          chapterLabel: 'Chapter 1',
          version: 'v2.0',
          size: '2.4 MB',
          date: '10 Aug 2026',
          status: 'Approved',
          remarks: 'Theoretical framework clearly defines CTX-M gene scope.',
        },
        {
          id: 'chap-2',
          name: 'Chapter 2: Comprehensive Literature Review on Beta-Lactamases.pdf',
          chapterLabel: 'Chapter 2',
          version: 'v1.8',
          size: '4.8 MB',
          date: '25 Aug 2026',
          status: 'Approved',
          remarks: 'Validated against CLSI 2026 epidemiology guidelines.',
        },
        {
          id: 'chap-3',
          name: 'Chapter 3: Sampling, Polymerase Chain Reaction & Ethical Protocols.pdf',
          chapterLabel: 'Chapter 3',
          version: 'v2.1',
          size: '3.1 MB',
          date: '08 Sep 2026',
          status: 'Approved',
          remarks: 'Biosafety Level-2 containment protocol verified by Lab Chair.',
        },
        {
          id: 'chap-4',
          name: 'Chapter 4: Antibiogram Raw Data & Broth Microdilution MIC Curves.pdf',
          chapterLabel: 'Chapter 4',
          version: 'v1.0',
          size: '5.6 MB',
          date: '19 Sep 2026',
          status: 'Under Review',
          remarks: 'Submitted for supervisor review. Antibiogram zone diameters pending inspection.',
        },
      ],
      milestones: [
        { id: 'm1', title: 'Topic Ratification & Ethical Clearance', completed: true, date: 'June 2026' },
        { id: 'm2', title: 'Primary Isolate Culture & Biochemical Speciation', completed: true, date: 'July 2026' },
        { id: 'm3', title: 'Multiplex PCR Amplification of blaCTX-M Gene', completed: true, date: 'August 2026' },
        { id: 'm4', title: 'Kirby-Bauer Disk Diffusion & MIC Phenotyping', completed: false, date: 'In Progress' },
        { id: 'm5', title: 'Supervisor Proposal Defense Clearance Endorsement', completed: false, date: 'Pending Clearance' },
        { id: 'm6', title: 'Final Viva Voce Examination & Bound Thesis Submission', completed: false, date: 'Target: Nov 2026' },
      ],
    },
    {
      id: 'std-2',
      name: 'Chukwudi Nnamdi Okafor',
      matric: 'ATBU/CSC/2026/051',
      topic: 'Evaluation of Biosurfactant Production and Hydrocarbon Degradation by Indigenous Pseudomonas',
      stage: 'Cleared for Proposal',
      stageBadgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      progress: 82,
      turnitinIndex: 9,
      clearanceGranted: true,
      lastMeeting: '15 Sep 2026',
      track: 'Software Engineering',
      chapters: [
        {
          id: 'chap-c1',
          name: 'Proposal_Document_Chapters_1_to_3_Final.pdf',
          chapterLabel: 'Chapters 1-3',
          version: 'v2.0',
          size: '4.2 MB',
          date: '02 Sep 2026',
          status: 'Approved',
          remarks: 'Approved for oral defense. Experimental controls fully specified.',
        },
        {
          id: 'chap-c2',
          name: 'Surface_Tension_Assay_Laboratory_Sheets.xlsx',
          chapterLabel: 'Bench Data',
          version: 'v1.2',
          size: '1.9 MB',
          date: '12 Sep 2026',
          status: 'Approved',
          remarks: 'Drop-collapse and emulsification index values verified.',
        },
      ],
      milestones: [
        { id: 'm21', title: 'Proposal Topic & Sampling Ratification', completed: true, date: 'May 2026' },
        { id: 'm22', title: 'Isolation of Hydrocarbonoclastic Bacteria', completed: true, date: 'July 2026' },
        { id: 'm23', title: 'Oil-Spreading & Emulsification Index (E24)', completed: true, date: 'August 2026' },
        { id: 'm24', title: 'Proposal Defense Clearance Endorsement', completed: true, date: 'September 2026' },
        { id: 'm25', title: 'Gas Chromatography (GC-FID) Hydrocarbon Depletion', completed: false, date: 'Pending Bench 2' },
        { id: 'm26', title: 'Final Defense & Post-viva Revisions', completed: false, date: 'Scheduled: Oct 2026' },
      ],
    },
    {
      id: 'std-3',
      name: 'Zainab Kabir Usman',
      matric: 'ATBU/CSC/2026/039',
      topic: 'Antimicrobial and Phytochemical Profiling of Medicinal Plant Extracts on Acinetobacter baumannii',
      stage: 'Awaiting Document Review',
      stageBadgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
      progress: 70,
      turnitinIndex: 8,
      clearanceGranted: false,
      lastMeeting: '12 Sep 2026',
      track: 'Cybersecurity',
      chapters: [
        {
          id: 'chap-z1',
          name: 'Chapter_4_Phytochemical_Assay_Results.pdf',
          chapterLabel: 'Chapter 4',
          version: 'v1.1',
          size: '3.9 MB',
          date: '16 Sep 2026',
          status: 'Under Review',
          remarks: 'Soxhlet extraction yield and tannin concentrations submitted for inspection.',
        },
        {
          id: 'chap-z2',
          name: 'Chapters_1_to_3_Proposal_Revisions.pdf',
          chapterLabel: 'Chapters 1-3',
          version: 'v1.4',
          size: '5.1 MB',
          date: '20 Aug 2026',
          status: 'Approved',
          remarks: 'Ethical clearances attached.',
        },
      ],
      milestones: [
        { id: 'm31', title: 'Plant Material Collection & Herbarium Authentication', completed: true, date: 'June 2026' },
        { id: 'm32', title: 'Methanolic & Aqueous Crude Extracts Preparation', completed: true, date: 'July 2026' },
        { id: 'm33', title: 'Phytochemical Screening (Tannins, Flavonoids, Saponins)', completed: true, date: 'August 2026' },
        { id: 'm34', title: 'Synergy Checkerboard Antibiograms with Colistin', completed: false, date: 'In Progress' },
        { id: 'm35', title: 'Proposal Defense Clearance Endorsement', completed: false, date: 'Pending Review' },
      ],
    },
    {
      id: 'std-4',
      name: 'Oluwaseun Daniels',
      matric: 'ATBU/CSC/2026/062',
      topic: 'Metagenomic Assessment of Street-Vended Fermented Dairy Beverages in Urban Retail Hubs',
      stage: 'Revision Required (Turnitin 22%)',
      stageBadgeColor: 'bg-rose-50 text-rose-900 border-rose-300',
      progress: 35,
      turnitinIndex: 22,
      clearanceGranted: false,
      lastMeeting: '28 Aug 2026',
      track: 'Data Science & Distributed Systems',
      chapters: [
        {
          id: 'chap-o1',
          name: 'Chapter_2_Literature_Review_Draft.pdf',
          chapterLabel: 'Chapter 2',
          version: 'v1.0',
          size: '3.4 MB',
          date: '27 Aug 2026',
          status: 'Requires Correction',
          remarks: 'Similarity index (22%) is unacceptable. Re-synthesize sections on lactic acid bacterial ecology.',
        },
      ],
      milestones: [
        { id: 'm41', title: 'Topic Formulation & Market Survey', completed: true, date: 'July 2026' },
        { id: 'm42', title: 'Turnitin Similarity Compliance (<15%)', completed: false, date: 'Revision Overdue' },
        { id: 'm43', title: '16S rRNA High-Throughput Sequencing Protocol', completed: false, date: 'On Hold' },
        { id: 'm44', title: 'Proposal Defense Clearance', completed: false, date: 'Locked' },
      ],
    },
    {
      id: 'std-5',
      name: 'Ibrahim Musa Farouk',
      matric: 'ATBU/CSC/2026/044',
      topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks',
      stage: 'Cleared for Proposal',
      stageBadgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      progress: 92,
      turnitinIndex: 7,
      clearanceGranted: true,
      lastMeeting: '19 Sep 2026',
      track: 'Network Security & Machine Learning',
      chapters: [
        {
          id: 'chap-i1',
          name: 'Complete_Thesis_Manuscript_v2.0.pdf',
          chapterLabel: 'Full Thesis',
          version: 'v2.0',
          size: '8.4 MB',
          date: '14 Sep 2026',
          status: 'Approved',
          remarks: 'Neural network training convergence curves approved. Cleared for viva.',
        },
      ],
      milestones: [
        { id: 'm51', title: 'Sewage Phage Plaque Isolation', completed: true, date: 'June 2026' },
        { id: 'm52', title: 'Host Range Determination & Thermal Stability', completed: true, date: 'July 2026' },
        { id: 'm53', title: 'Crystal Violet Microtiter Biofilm Disruption', completed: true, date: 'August 2026' },
        { id: 'm54', title: 'Defense Clearance & External Examiner Dossier', completed: true, date: 'September 2026' },
      ],
    },
    {
      id: 'std-6',
      name: 'Precious David',
      matric: 'ATBU/CSC/2026/070',
      topic: 'Optimization of Cellulase Production by Aspergillus niger Strains Using Agro-Industrial Waste Substrates',
      stage: 'Awaiting Document Review',
      stageBadgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
      progress: 52,
      turnitinIndex: 12,
      clearanceGranted: false,
      lastMeeting: '08 Sep 2026',
      track: 'Industrial & Applied Computer Science',
      chapters: [
        {
          id: 'chap-p1',
          name: 'Chapter_3_Solid_State_Fermentation_Design.pdf',
          chapterLabel: 'Chapter 3',
          version: 'v1.3',
          size: '2.8 MB',
          date: '07 Sep 2026',
          status: 'Under Review',
          remarks: 'Dinitrosalicylic acid (DNSA) reducing sugar measurement protocols pending approval.',
        },
      ],
      milestones: [
        { id: 'm61', title: 'Fungal Strain Procurement & Subculturing', completed: true, date: 'June 2026' },
        { id: 'm62', title: 'Substrate Delignification Pretreatment', completed: true, date: 'July 2026' },
        { id: 'm63', title: 'Solid-State Fermentation Kinetics', completed: false, date: 'In Progress' },
        { id: 'm64', title: 'Defense Clearance Endorsement', completed: false, date: 'Pending' },
      ],
    },
  ];

  const [supervisees, setSupervisees] = useState(() => {
    if (currentUser?.id === 'usr_sup_01') {
      return DEMO_SUPERVISEES;
    }
    return [];
  });

  useEffect(() => {
    if (!currentUser) return;

    const buildStudentChapters = (stu) => {
      const studentDocs = (documentSubmissions || []).filter(
        d => (d.studentMatric && d.studentMatric === stu.identifier) || (d.studentId && d.studentId === stu.id)
      );

      if (studentDocs.length > 0) {
        return studentDocs.map(d => ({
          id: d.id,
          name: d.fileName || d.title,
          title: d.title,
          fileName: d.fileName || d.title,
          chapterLabel: d.chapter || d.category || 'Chapter Draft',
          version: d.version || 'v1.0',
          size: d.fileSize || '3.5 MB',
          date: d.dateSubmitted || 'Recent',
          status: d.status || 'Under Review',
          remarks: d.supervisorRemarks || d.notes || d.authorRemarks || '',
          authorRemarks: d.authorRemarks || d.notes || '',
          file: d.fileBlob,
          fileBlob: d.fileBlob,
          fileUrl: d.fileUrl,
        }));
      }

      if (stu.hasUploadedProject) {
        return [
          {
            id: `chap-${stu.id}-1`,
            name: `${stu.projectTopic || 'Research_Proposal'}.pdf`,
            fileName: `${stu.projectTopic || 'Research_Proposal'}.pdf`,
            title: stu.projectTopic || 'Research Proposal',
            chapterLabel: 'Research Proposal',
            version: 'v1.0',
            size: '3.8 MB',
            date: 'Recent',
            status: 'Under Review',
            remarks: 'Initial proposal uploaded by student.',
          }
        ];
      }

      return [];
    };

    if (currentUser.id === 'usr_sup_01') {
      const dynamicallyAssigned = accounts
        .filter((a) => a.role === 'student' && (a.assignedSupervisorId === 'usr_sup_01' || a.assignedSupervisorName === currentUser.name))
        .filter((a) => !DEMO_SUPERVISEES.some((d) => d.matric === a.identifier || d.name === a.name))
        .map((a) => {
          const chaps = buildStudentChapters(a);
          return {
            id: a.id,
            name: a.name,
            matric: a.identifier,
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Project Topic & Proposal Upload'),
            stage: a.hasUploadedProject ? (chaps.length > 0 ? 'Document Review' : 'Proposal Review') : 'Awaiting Student Project Upload',
            stageBadgeColor: a.hasUploadedProject ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-stone-50 text-stone-700 border-stone-200',
            progress: a.hasUploadedProject ? 25 : 0,
            turnitinIndex: a.hasUploadedProject ? 11 : 0,
            clearanceGranted: false,
            lastMeeting: 'Not Scheduled Yet',
            track: a.specialization || 'Distributed Systems & AI',
            chapters: chaps,
            milestones: [
              { id: `m-${a.id}-1`, title: 'Topic Ratification & Ethical Clearance', completed: Boolean(a.hasUploadedProject), date: 'Recent' },
              { id: `m-${a.id}-2`, title: 'Proposal Defense Clearance Endorsement', completed: false, date: 'Pending' }
            ]
          };
        });
      setSupervisees([...dynamicallyAssigned, ...DEMO_SUPERVISEES]);
    } else {
      const myAssigned = accounts
        .filter((a) => a.role === 'student' && (a.assignedSupervisorId === currentUser.id || a.assignedSupervisorName === currentUser.name))
        .map((a) => {
          const chaps = buildStudentChapters(a);
          return {
            id: a.id,
            name: a.name,
            matric: a.identifier,
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Project Topic & Proposal Upload'),
            stage: a.hasUploadedProject ? (chaps.length > 0 ? 'Document Review' : 'Proposal Review') : 'Awaiting Student Project Upload',
            stageBadgeColor: a.hasUploadedProject ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-stone-50 text-stone-700 border-stone-200',
            progress: a.hasUploadedProject ? 25 : 0,
            turnitinIndex: a.hasUploadedProject ? 11 : 0,
            clearanceGranted: false,
            lastMeeting: 'Not Scheduled Yet',
            track: a.specialization || 'Distributed Systems & AI',
            chapters: chaps,
            milestones: [
              { id: `m-${a.id}-1`, title: 'Topic Ratification & Ethical Clearance', completed: Boolean(a.hasUploadedProject), date: 'Recent' },
              { id: `m-${a.id}-2`, title: 'Proposal Defense Clearance Endorsement', completed: false, date: 'Pending' }
            ]
          };
        });
      setSupervisees(myAssigned);
    }
  }, [currentUser?.id, currentUser?.name, accounts, documentSubmissions]);

  // Active Supervisee for Modal / Slide-out Action Drawer
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeReviewFeedback, setActiveReviewFeedback] = useState('');

  // Defense Clearance Form Modal state
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceModalStudent, setClearanceModalStudent] = useState(null);
  const [clearanceModalStage, setClearanceModalStage] = useState('internal');

  // Filtering Supervisees
  const [superviseeSearch, setSuperviseeSearch] = useState('');
  const [superviseeFilterStage, setSuperviseeFilterStage] = useState('all');

  const filteredSupervisees = useMemo(() => {
    return supervisees.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(superviseeSearch.toLowerCase()) ||
        s.matric.toLowerCase().includes(superviseeSearch.toLowerCase()) ||
        s.topic.toLowerCase().includes(superviseeSearch.toLowerCase());

      if (!matchesSearch) return false;
      if (superviseeFilterStage === 'cleared') return s.clearanceGranted;
      if (superviseeFilterStage === 'pending') return !s.clearanceGranted;
      return true;
    });
  }, [supervisees, superviseeSearch, superviseeFilterStage]);

  // Handlers for Drawer actions:
  // 1. Approve / Corrections / Reject Document
  const handleDocumentAction = (docId, actionType) => {
    if (!selectedStudent) return;

    let newStatus = 'Approved';
    let actionLabel = 'approved';
    if (actionType === 'corrections') {
      newStatus = 'Requires Correction';
      actionLabel = 'flagged for revisions';
    } else if (actionType === 'reject') {
      newStatus = 'Rejected';
      actionLabel = 'rejected';
    }

    const updatedChapters = selectedStudent.chapters.map((ch) =>
      ch.id === docId
        ? {
            ...ch,
            status: newStatus,
            remarks: activeReviewFeedback.trim() || `Marked as ${newStatus} by supervisor on ${new Date().toLocaleDateString('en-GB')}.`,
          }
        : ch
    );

    const updatedStudent = {
      ...selectedStudent,
      chapters: updatedChapters,
      stage: actionType === 'approve' ? 'Chapter Cleared' : 'Revisions Required',
      stageBadgeColor: actionType === 'approve' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300',
    };

    setSelectedStudent(updatedStudent);
    setSupervisees((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    setActiveReviewFeedback('');
    triggerToast(`Document ${actionLabel} successfully for ${selectedStudent.name}.`);
  };

  // 2. Toggle Milestone Completion
  const handleToggleMilestone = (milestoneId) => {
    if (!selectedStudent) return;

    const updatedMilestones = selectedStudent.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );

    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const recalculatedProgress = Math.min(100, Math.round((completedCount / updatedMilestones.length) * 100));

    const updatedStudent = {
      ...selectedStudent,
      milestones: updatedMilestones,
      progress: recalculatedProgress,
    };

    setSelectedStudent(updatedStudent);
    setSupervisees((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));
    triggerToast(`Milestone status updated · Overall progress calibrated to ${recalculatedProgress}%.`);
  };

  // 3. Toggle Proposal Defense Clearance Switch
  const handleToggleClearance = () => {
    if (!selectedStudent) return;

    const newClearanceState = !selectedStudent.clearanceGranted;
    const updatedStudent = {
      ...selectedStudent,
      clearanceGranted: newClearanceState,
      stage: newClearanceState ? 'Cleared for Proposal' : 'Awaiting Document Review',
      stageBadgeColor: newClearanceState ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-amber-50 text-amber-900 border-amber-300',
    };

    setSelectedStudent(updatedStudent);
    setSupervisees((prev) => prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s)));

    if (newClearanceState) {
      triggerToast(`Proposal Defense Clearance GRANTED for candidate ${selectedStudent.name}.`);
    } else {
      triggerToast(`Defense Clearance REVOKED for ${selectedStudent.name}.`);
    }
  };

  // -------------------------------------------------------------
  // 3. MOCK DATA: DEFENSE PANELS (Panel Member Mode)
  // -------------------------------------------------------------
  const [defenseSessions, setDefenseSessions] = useState([
    {
      id: 'def-01',
      sessionCode: 'DEF-CSC-2026-081',
      title: 'Internal Defense (Panel A)',
      candidateName: 'Adama Bashir Muhammad',
      matric: 'ATBU/CSC/2026/042',
      topic: 'Antimicrobial Resistance Profiles of ESBL-Producing Enterobacteriaceae Isolated from Hospital Effluent',
      date: 'Thursday, Oct 25, 2026',
      time: '10:00 AM - 10:45 AM',
      venue: 'Room B12 · Faculty of Computing',
      panelChair: 'Prof. Sarah N. Ibrahim',
      panelMembers: ['Dr. Kolawole O. Alabi', 'Dr. Victor Adeyemi', 'Dr. Aminu Salisu'],
      status: 'Ready for Scoring',
      evaluated: false,
      score: null,
    },
    {
      id: 'def-02',
      sessionCode: 'DEF-CSC-2026-082',
      title: 'Proposal Defense (Panel B)',
      candidateName: 'Chukwudi Nnamdi Okafor',
      matric: 'ATBU/CSC/2026/051',
      topic: 'Evaluation of Biosurfactant Production and Hydrocarbon Degradation by Indigenous Pseudomonas',
      date: 'Thursday, Oct 25, 2026',
      time: '11:15 AM - 12:00 PM',
      venue: 'Room B12 · Faculty of Computing',
      panelChair: 'Prof. Sarah N. Ibrahim',
      panelMembers: ['Dr. Victor Adeyemi', 'Dr. (Mrs) T. E. Johnson'],
      status: 'Scheduled',
      evaluated: false,
      score: null,
    },
    {
      id: 'def-03',
      sessionCode: 'DEF-CSC-2026-083',
      title: 'Internal Defense (Panel A)',
      candidateName: 'Zainab Kabir Usman',
      matric: 'ATBU/CSC/2026/039',
      topic: 'Antimicrobial and Phytochemical Profiling of Medicinal Plant Extracts on Acinetobacter baumannii',
      date: 'Friday, Oct 26, 2026',
      time: '09:30 AM - 10:15 AM',
      venue: 'Boardroom 102 · Postgraduate Wing',
      panelChair: 'Dr. Victor Adeyemi',
      panelMembers: ['Dr. Kolawole O. Alabi', 'Dr. Aminu Salisu'],
      status: 'Scheduled',
      evaluated: false,
      score: null,
    },
    {
      id: 'def-04',
      sessionCode: 'DEF-CSC-2026-074',
      title: 'Final Viva Voce Examination',
      candidateName: 'Ibrahim Musa Farouk',
      matric: 'ATBU/CSC/2026/044',
      topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks',
      date: 'Completed Oct 18, 2026',
      time: '01:00 PM',
      venue: 'Boardroom 102',
      panelChair: 'Prof. Sarah N. Ibrahim',
      panelMembers: ['Dr. Kolawole O. Alabi', 'Prof. B. E. Bassey (UNILAG External)'],
      status: 'Evaluated',
      evaluated: true,
      score: 88,
    },
  ]);

  // Interactive Scoring Form State
  const [selectedDefenseId, setSelectedDefenseId] = useState('def-01');

  // Statutory Grading Components (100 Marks Total):
  // 1. Software Design & Quality (30 marks)
  // 2. Presentation (20 marks)
  // 3. Project Reports & Documentation (30 marks)
  // 4. Response to Questions (20 marks)
  const [rubricScores, setRubricScores] = useState({
    softwareDesign: 24,       // max 30
    presentation: 16,         // max 20
    projectReports: 23,       // max 30
    responseToQuestions: 15,  // max 20
  });

  const [panelRecommendation, setPanelRecommendation] = useState('Pass with minor revisions (14 days)');
  const [panelRemarks, setPanelRemarks] = useState(
    'Demonstrates commendable mastery of system architecture, clean modular code design, and robust testbed deployment. Ensure formal microservices performance metrics are fully tabulated in Chapter 4.'
  );

  // Auto-calculated Total Score
  const totalScore = useMemo(() => {
    return (
      (Number(rubricScores.softwareDesign) || 0) +
      (Number(rubricScores.presentation) || 0) +
      (Number(rubricScores.projectReports) || 0) +
      (Number(rubricScores.responseToQuestions) || 0)
    );
  }, [rubricScores]);

  // Derived Grade
  const scoreGrade = useMemo(() => {
    if (totalScore >= 70) return { grade: 'A', label: 'Distinction / First Class Standard', color: 'text-emerald-400' };
    if (totalScore >= 60) return { grade: 'B', label: 'Upper Credit / Very Good', color: 'text-blue-400' };
    if (totalScore >= 50) return { grade: 'C', label: 'Credit / Satisfactory', color: 'text-amber-400' };
    if (totalScore >= 45) return { grade: 'D', label: 'Pass', color: 'text-orange-400' };
    return { grade: 'F', label: 'Fail / Re-defense Required', color: 'text-rose-400' };
  }, [totalScore]);

  // Candidate being scored
  const activeDefenseCandidate = useMemo(() => {
    return defenseSessions.find((s) => s.id === selectedDefenseId) || defenseSessions[0];
  }, [defenseSessions, selectedDefenseId]);

  // Handle Rubric input changes with min/max clamps
  const handleScoreChange = (field, value, maxVal) => {
    const num = Math.max(0, Math.min(maxVal, Number(value) || 0));
    setRubricScores((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  // Submit Rubric Evaluation
  const handleSubmitEvaluation = (e) => {
    e.preventDefault();

    setDefenseSessions((prev) =>
      prev.map((s) =>
        s.id === selectedDefenseId
          ? {
              ...s,
              evaluated: true,
              score: totalScore,
              scores: {
                softwareDesign: rubricScores.softwareDesign,
                presentation: rubricScores.presentation,
                projectReports: rubricScores.projectReports,
                responseToQuestions: rubricScores.responseToQuestions,
                totalScore: totalScore,
                letterGrade: scoreGrade.grade,
              },
              status: `Evaluated (${totalScore}/100)`,
            }
          : s
      )
    );

    // Synchronize into student defenseClearances
    if (activeDefenseCandidate?.candidateMatric) {
      setDefenseClearances(prev => prev.map(clr => {
        if (clr.candidateMatric === activeDefenseCandidate.candidateMatric) {
          return {
            ...clr,
            scores: {
              softwareDesign: rubricScores.softwareDesign,
              presentation: rubricScores.presentation,
              projectReports: rubricScores.projectReports,
              responseToQuestions: rubricScores.responseToQuestions,
              totalScore: totalScore,
              letterGrade: scoreGrade.grade,
            },
            comments: panelRemarks || clr.comments,
            updatedAt: new Date().toISOString(),
          };
        }
        return clr;
      }));
    }

    triggerToast(
      `Evaluation score of ${totalScore}/100 (${scoreGrade.grade}) officially logged for ${activeDefenseCandidate?.candidateName || 'Candidate'}.`
    );
  };

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-8 font-sans text-[#1A1A1A] pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-[#1A1A1A] text-white px-4 sm:px-5 py-3 sm:py-3.5 shadow-2xl border border-stone-800 text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 max-w-[92vw]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#CBA358] text-[#1A1A1A] font-extrabold text-[11px]">
            ✓
          </span>
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* TOP-LEVEL LUXURY HEADER WITH VIEW TOGGLE */}
      <section className="rounded-[20px] bg-[#1A1A1A] text-white p-4 sm:p-6 md:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        {/* Subtle decorative gold light glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#CBA358]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
          {/* Row 1: Badges & Live Status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-800 px-3 py-1 text-[11px] sm:text-xs font-semibold text-stone-300 border border-stone-700">
                <BookOpen className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                <span>Department of Computer Science</span>
                <span className="text-stone-500">·</span>
                <span>Faculty of Computing</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>2025/2026 Academic Session</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full bg-stone-800 px-3 py-1 text-stone-300 font-mono text-[11px] border border-stone-700">
                Role: <strong>{activeTab === 'supervisees' ? 'Internal Supervisor' : 'Panel Evaluator'}</strong>
              </span>
            </div>
          </div>

          {/* Row 2: Title & Pill Toggle */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Faculty Academic Supervision & Viva Examination Docket
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                Internal Staff Dashboard
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Seamlessly supervise allocated computer science researchers, annotate submitted chapters, endorse proposal defense clearances, and conduct live rubric evaluations.
              </p>
            </div>

            {/* SLEEK PILL-SHAPED TOGGLE (Dark charcoal and gold active states) */}
            <div className="inline-flex p-1 rounded-full bg-stone-900 border border-stone-800 shadow-inner shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('supervisees');
                  if (currentRole !== 'internal_supervisor') {
                    setRole('internal_supervisor');
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === 'supervisees'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md shadow-[#CBA358]/20 ring-1 ring-[#CBA358]'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Users2 className={`h-4 w-4 ${activeTab === 'supervisees' ? 'text-[#1A1A1A]' : 'text-stone-400'}`} />
                <span>My Supervisees</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === 'supervisees' ? 'bg-[#1A1A1A] text-[#CBA358]' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {supervisees.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('milestones');
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === 'milestones'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md shadow-[#CBA358]/20 ring-1 ring-[#CBA358]'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <BarChart3 className={`h-4 w-4 ${activeTab === 'milestones' ? 'text-[#1A1A1A]' : 'text-stone-400'}`} />
                <span>Milestone Bar Chart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('panels');
                  if (currentRole !== 'panel_member') {
                    setRole('panel_member');
                  }
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  activeTab === 'panels'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-md shadow-[#CBA358]/20 ring-1 ring-[#CBA358]'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <ShieldCheck className={`h-4 w-4 ${activeTab === 'panels' ? 'text-[#1A1A1A]' : 'text-stone-400'}`} />
                <span>Defense Panels</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    activeTab === 'panels' ? 'bg-[#1A1A1A] text-[#CBA358]' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================= */}
      {/* 3. VIEW: MY SUPERVISEES (INTERNAL SUPERVISOR)                 */}
      {/* ============================================================= */}
      {activeTab === 'supervisees' && (
        <div className="space-y-6">
          {/* Controls Bar: Search & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white rounded-[20px] border border-stone-200 p-3.5 sm:p-4 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search candidates by name, matric, or research topic..."
                value={superviseeSearch || ''}
                onChange={(e) => setSuperviseeSearch(e.target.value)}
                className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CBA358]/60 placeholder:text-stone-400 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              {[
                { id: 'all', label: `All Candidates (${supervisees.length})` },
                { id: 'cleared', label: `Proposal Cleared (${supervisees.filter((s) => s.clearanceGranted).length})` },
                { id: 'pending', label: `Pending Clearance (${supervisees.filter((s) => !s.clearanceGranted).length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSuperviseeFilterStage(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                    superviseeFilterStage === tab.id
                      ? 'bg-[#1A1A1A] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ALLOCATED STUDENTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSupervisees.map((student) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="group relative rounded-[20px] border border-stone-200 bg-[#FDFBF7] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[#CBA358] transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar, Matric, Progress Ring */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A1A] text-[#CBA358] font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                        {student.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A] truncate group-hover:text-[#8f6d28] transition-colors">
                          {student.name}
                        </h3>
                        <p className="font-mono text-xs text-stone-500 font-semibold">{student.matric}</p>
                      </div>
                    </div>

                    {/* Progress Ring & Download Report */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div onClick={(e) => e.stopPropagation()}>
                        <DownloadReportButton
                          project={{
                            name: student.name,
                            matric: student.matric,
                            department: 'Computer Science',
                            topic: student.topic,
                            supervisor: 'Dr. Kolawole O. Alabi',
                            progressPercentage: student.progress,
                            status: student.stage,
                          }}
                          milestones={student.milestones}
                          variant="light"
                          size="sm"
                          onDownloaded={(fmt) =>
                            triggerToast(`Milestone report for ${student.name} exported as ${fmt}`)
                          }
                        />
                      </div>
                      <div className="shrink-0" title={`Overall Stage Progress: ${student.progress}%`}>
                        <ProgressRing progress={student.progress} size={46} strokeWidth={4} />
                      </div>
                    </div>
                  </div>

                  {/* Stage Pill */}
                  <div className="mt-3.5 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${student.stageBadgeColor}`}
                    >
                      {student.clearanceGranted ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-amber-600" />
                      )}
                      <span>{student.stage}</span>
                    </span>

                    {student.clearanceGranted && (
                      <span className="rounded-full bg-[#CBA358]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#8f6d28] border border-[#CBA358]/50">
                        Clearance Endorsed
                      </span>
                    )}
                  </div>

                  {/* Topic Title */}
                  <div className="mt-3">
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Research Topic</p>
                    <p className="text-xs sm:text-sm font-semibold text-stone-800 line-clamp-2 mt-0.5 leading-snug">
                      "{student.topic}"
                    </p>
                  </div>
                </div>

                {/* Card Footer: Turnitin Index, Document Queue, Trigger */}
                <div className="mt-5 pt-3.5 border-t border-stone-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium text-stone-500">
                    <span>
                      Turnitin: <strong className={`font-mono ${student.turnitinIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}`}>{student.turnitinIndex}%</strong>
                    </span>
                    <span>·</span>
                    <span>{student.chapters.length} files</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClearanceModalStudent(student);
                        setClearanceModalStage('proposal');
                        setIsClearanceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <FileCheck className="h-3 w-3 text-amber-700" />
                      <span>Proposal Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setClearanceModalStudent(student);
                        setClearanceModalStage('internal');
                        setIsClearanceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 px-2 py-0.5 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <FileCheck className="h-3 w-3 text-blue-700" />
                      <span>Internal Slip</span>
                    </button>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#8f6d28] group-hover:translate-x-1 transition-transform">
                      <span>Dossier</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSupervisees.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-stone-300 p-8 sm:p-12 text-center bg-white">
              {supervisees.length === 0 ? (
                <div className="max-w-md mx-auto py-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 mb-3 shadow-xs">
                    <User className="h-7 w-7 text-amber-800" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">No Supervisees Assigned Yet</h3>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                    You currently have 0 assigned undergraduate students and 0 active projects. Once candidates are allocated to your supervision docket by the Departmental Board, their dossiers, laboratory chapters, and defense clearance controls will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <User className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-stone-700">No candidates match your search filter</p>
                  <p className="text-xs text-stone-500 mt-1">Try refining the student name, matric number, or status tab.</p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. VIEW: MILESTONE TRACKER (CLEAN BAR CHART FORMAT)            */}
      {/* ============================================================= */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <ProjectMilestoneTracker />
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. VIEW: DEFENSE PANELS (PANEL MEMBER)                         */}
      {/* ============================================================= */}
      {activeTab === 'panels' && (
        <div className="space-y-6 sm:space-y-8">
          {/* SECTION: UPCOMING DEFENSE SESSIONS */}
          <div className="rounded-[20px] border border-stone-200 bg-white p-4 sm:p-6 md:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1A1A1A]">Upcoming Defense Examination Schedule</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Statutory oral viva voce sessions assigned to your Departmental Evaluation Panel
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200 self-start sm:self-auto">
                <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                <span>Panel Board Active</span>
              </span>
            </div>

            {/* Sessions Grid (Stackable cards on mobile, clean list on desktop) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {defenseSessions.map((session) => {
                const isSelected = selectedDefenseId === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedDefenseId(session.id)}
                    className={`rounded-[20px] p-4 sm:p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#CBA358] bg-[#FDFBF7] ring-2 ring-[#CBA358]/30 shadow-sm'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div>
                      {/* Session Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 font-mono">
                            {session.sessionCode}
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold text-[#1A1A1A] truncate">
                            {session.title}
                          </h3>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                            session.evaluated
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isSelected
                              ? 'bg-[#CBA358] text-[#1A1A1A]'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          {session.evaluated ? `Score: ${session.score}/100` : session.status}
                        </span>
                      </div>

                      {/* Candidate & Topic */}
                      <div className="mt-3 p-3 rounded-xl bg-white border border-stone-200/70">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span className="text-xs font-extrabold text-stone-900">{session.candidateName}</span>
                          <span className="text-xs font-mono text-stone-500">({session.matric})</span>
                        </div>
                        <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                          "{session.topic}"
                        </p>
                      </div>

                      {/* Session Details */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span>{session.date} · {session.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{session.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Trigger */}
                    <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">
                        Chair: <strong className="text-stone-700">{session.panelChair}</strong>
                      </span>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-[#CBA358]'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        <span>{isSelected ? 'Loaded in Rubric' : 'Select for Evaluation'}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INTERACTIVE RUBRIC SCORING FORM */}
          <section className="rounded-[20px] bg-[#1A1A1A] text-white p-5 sm:p-7 md:p-8 shadow-2xl border border-stone-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5 mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358]/20 px-3 py-1 text-xs font-bold text-[#CBA358] border border-[#CBA358]/40 mb-2">
                  <Award className="h-3.5 w-3.5 text-[#CBA358]" />
                  <span>Statutory Viva Examination Rubric</span>
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-white">
                  Candidate Evaluation: {activeDefenseCandidate.candidateName}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1 font-mono">
                  Matric: {activeDefenseCandidate.matric} · Session: {activeDefenseCandidate.sessionCode} · {activeDefenseCandidate.title}
                </p>
              </div>

              {/* Live Grade Preview */}
              <div className="flex items-center gap-4 bg-stone-900/90 border border-stone-800 p-3 sm:p-4 rounded-2xl shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Calculated Total</div>
                  <div className="text-2xl sm:text-3xl font-black text-[#CBA358] font-mono">
                    {totalScore} <span className="text-sm font-normal text-stone-400">/ 100</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-stone-800" />
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Grade</div>
                  <div className={`text-xl sm:text-2xl font-black ${scoreGrade.color} font-mono`}>
                    {scoreGrade.grade}
                  </div>
                </div>
              </div>
            </div>

            {/* Rubric Criteria Form */}
            <form onSubmit={handleSubmitEvaluation} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Component 1: Software Design & Quality (30) */}
                <div className="rounded-2xl bg-stone-900/60 p-4 sm:p-5 border border-stone-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-white">
                        1. Software Design & Quality (30)
                      </label>
                      <span className="font-mono text-sm font-bold text-[#CBA358]">
                        {rubricScores.softwareDesign} / 30 marks
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      System architectural soundness, modularity, algorithmic efficiency, code readability, and live software testbed execution.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={rubricScores?.softwareDesign ?? 0}
                      onChange={(e) => handleScoreChange('softwareDesign', e.target.value, 30)}
                      className="w-full accent-[#CBA358] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={rubricScores?.softwareDesign ?? 0}
                      onChange={(e) => handleScoreChange('softwareDesign', e.target.value, 30)}
                      className="w-16 rounded-lg bg-stone-800 border border-stone-700 text-center py-1 font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#CBA358]"
                    />
                  </div>
                </div>

                {/* Component 2: Presentation (20) */}
                <div className="rounded-2xl bg-stone-900/60 p-4 sm:p-5 border border-stone-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-white">
                        2. Presentation (20)
                      </label>
                      <span className="font-mono text-sm font-bold text-[#CBA358]">
                        {rubricScores?.presentation ?? 0} / 20 marks
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Viva voce oral presentation delivery, technical slide clarity, confidence, poise, and compliance with the 12-minute time allocation.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={rubricScores?.presentation ?? 0}
                      onChange={(e) => handleScoreChange('presentation', e.target.value, 20)}
                      className="w-full accent-[#CBA358] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={rubricScores?.presentation ?? 0}
                      onChange={(e) => handleScoreChange('presentation', e.target.value, 20)}
                      className="w-16 rounded-lg bg-stone-800 border border-stone-700 text-center py-1 font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#CBA358]"
                    />
                  </div>
                </div>

                {/* Component 3: Project Reports & Documentation (30) */}
                <div className="rounded-2xl bg-stone-900/60 p-4 sm:p-5 border border-stone-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-white">
                        3. Project Reports & Documentation (30)
                      </label>
                      <span className="font-mono text-sm font-bold text-[#CBA358]">
                        {rubricScores?.projectReports ?? 0} / 30 marks
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Comprehensive Chapters 1–5 dissertation manuscript, Turnitin similarity audit (&lt;15%), standard IEEE references, and diagrams.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={rubricScores?.projectReports ?? 0}
                      onChange={(e) => handleScoreChange('projectReports', e.target.value, 30)}
                      className="w-full accent-[#CBA358] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={rubricScores?.projectReports ?? 0}
                      onChange={(e) => handleScoreChange('projectReports', e.target.value, 30)}
                      className="w-16 rounded-lg bg-stone-800 border border-stone-700 text-center py-1 font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#CBA358]"
                    />
                  </div>
                </div>

                {/* Component 4: Response to Questions (20) */}
                <div className="rounded-2xl bg-stone-900/60 p-4 sm:p-5 border border-stone-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs sm:text-sm font-extrabold text-white">
                        4. Response to Questions (20)
                      </label>
                      <span className="font-mono text-sm font-bold text-[#CBA358]">
                        {rubricScores?.responseToQuestions ?? 0} / 20 marks
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Mastery under oral cross-examination by panel members, defense of architectural trade-offs, and computer science theoretical depth.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={rubricScores?.responseToQuestions ?? 0}
                      onChange={(e) => handleScoreChange('responseToQuestions', e.target.value, 20)}
                      className="w-full accent-[#CBA358] cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={rubricScores?.responseToQuestions ?? 0}
                      onChange={(e) => handleScoreChange('responseToQuestions', e.target.value, 20)}
                      className="w-16 rounded-lg bg-stone-800 border border-stone-700 text-center py-1 font-mono text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#CBA358]"
                    />
                  </div>
                </div>
              </div>

              {/* Panel Recommendation & Qualitative Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Panel Statutory Recommendation
                  </label>
                  <select
                    value={panelRecommendation || 'Pass without corrections'}
                    onChange={(e) => setPanelRecommendation(e.target.value)}
                    className="w-full rounded-xl bg-stone-900 border border-stone-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#CBA358]"
                  >
                    <option value="Pass without corrections">Pass without corrections</option>
                    <option value="Pass with minor revisions (14 days)">Pass with minor revisions (14 days)</option>
                    <option value="Major revisions & re-appearance before panel">Major revisions & re-appearance before panel</option>
                    <option value="Fail & Re-defense next semester">Fail & Re-defense next semester</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    Panel Member Examination Remarks & Revisions Mandate
                  </label>
                  <textarea
                    rows={2}
                    value={panelRemarks || ''}
                    onChange={(e) => setPanelRemarks(e.target.value)}
                    className="w-full rounded-xl bg-stone-900 border border-stone-700 p-3 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#CBA358]"
                    placeholder="Enter specific thesis corrections required prior to final departmental sign-off..."
                  />
                </div>
              </div>

              {/* BOTTOM AUTO-CALCULATING BAR & PROMINENT GOLD SUBMIT BUTTON */}
              <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#CBA358]/20 flex items-center justify-center border border-[#CBA358]/40 shrink-0">
                    <Sparkles className="h-5 w-5 text-[#CBA358]" />
                  </div>
                  <div>
                    <div className="text-xs text-stone-400">
                      Total Evaluation Score: <strong className="text-white font-mono text-sm">{totalScore} / 100</strong>
                    </div>
                    <div className="text-xs font-semibold text-stone-300">
                      Standing: <span className={scoreGrade.color}>{scoreGrade.label} ({scoreGrade.grade})</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CBA358] px-8 py-3.5 text-xs sm:text-sm font-black text-[#1A1A1A] hover:bg-[#b89146] shadow-lg shadow-[#CBA358]/20 active:scale-98 transition-all shrink-0 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Evaluation</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. ACTION DRAWER / MODAL (SUPERVISOR STUDENT DOSSIER)         */}
      {/* ============================================================= */}
      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/60 backdrop-blur-xs p-2 sm:p-0 animate-in fade-in duration-150"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="w-full sm:max-w-2xl h-full max-h-[96vh] sm:max-h-screen bg-white shadow-2xl sm:rounded-l-[24px] overflow-hidden flex flex-col animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-[#1A1A1A] text-white p-5 sm:p-6 border-b border-stone-800 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#CBA358]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#CBA358] border border-[#CBA358]/40">
                    Candidate Dossier & Supervision Docket
                  </span>
                  <span className="font-mono text-xs text-stone-400">{selectedStudent.matric}</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-white mt-1.5 truncate">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-stone-300 line-clamp-2 mt-1 font-medium leading-relaxed">
                  "{selectedStudent.topic}"
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <DownloadReportButton
                  project={{
                    name: selectedStudent.name,
                    matric: selectedStudent.matric,
                    department: 'Computer Science',
                    topic: selectedStudent.topic,
                    supervisor: 'Dr. Kolawole O. Alabi',
                    progressPercentage: selectedStudent.progress,
                    status: selectedStudent.status,
                  }}
                  milestones={selectedStudent.milestones}
                  variant="dark"
                  size="sm"
                  onDownloaded={(fmt) =>
                    triggerToast(`Dossier milestone summary downloaded as ${fmt}`)
                  }
                />
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-full p-2 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-[#FDFBF7]">
              {/* METRIC STRIP */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Overall Progress</span>
                  <span className="text-lg font-black text-[#1A1A1A] font-mono">{selectedStudent.progress}%</span>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Turnitin Index</span>
                  <span className={`text-lg font-black font-mono ${selectedStudent.turnitinIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {selectedStudent.turnitinIndex}%
                  </span>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white p-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Defense Clearance</span>
                  <span className={`text-xs font-bold block mt-1 ${selectedStudent.clearanceGranted ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedStudent.clearanceGranted ? 'Granted' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* CLEARANCE SWITCH SECTION (REQUIRED SPEC) */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`h-4 w-4 ${selectedStudent.clearanceGranted ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A]">
                        Proposal Defense Clearance
                      </h4>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                      Statutory endorsement certifying that candidate's laboratory benchwork protocols and proposal drafts meet departmental viva standards.
                    </p>
                  </div>

                  {/* STYLED LUXURY TOGGLE SWITCH */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={selectedStudent.clearanceGranted}
                    onClick={handleToggleClearance}
                    className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      selectedStudent.clearanceGranted ? 'bg-[#CBA358]' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        selectedStudent.clearanceGranted ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500">Official Endorsement Status:</span>
                    <span
                      className={`font-bold ${
                        selectedStudent.clearanceGranted ? 'text-emerald-700 font-extrabold' : 'text-stone-500'
                      }`}
                    >
                      {selectedStudent.clearanceGranted ? '✓ Cleared for Oral Defense Examination' : '○ Pending Supervisor Authorization'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(currentRole === 'internal_supervisor' || currentUser?.role === 'internal_supervisor') ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setClearanceModalStudent(selectedStudent);
                            setClearanceModalStage('proposal');
                            setIsClearanceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Proposal Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClearanceModalStudent(selectedStudent);
                            setClearanceModalStage('internal');
                            setIsClearanceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Internal Slip</span>
                        </button>
                      </>
                    ) : (currentRole === 'external_supervisor' || currentUser?.role === 'external_supervisor') ? (
                      <button
                        type="button"
                        onClick={() => {
                          setClearanceModalStudent(selectedStudent);
                          setClearanceModalStage('external');
                          setIsClearanceModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>External Slip</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setClearanceModalStudent(selectedStudent);
                            setClearanceModalStage('proposal');
                            setIsClearanceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                          <span>Proposal Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClearanceModalStudent(selectedStudent);
                            setClearanceModalStage('internal');
                            setIsClearanceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-900 px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-blue-700" />
                          <span>Internal Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setClearanceModalStudent(selectedStudent);
                            setClearanceModalStage('external');
                            setIsClearanceModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 px-2.5 py-1 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-purple-700" />
                          <span>External Slip</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* TOPIC / DOCUMENT REVIEW SECTION (REQUIRED SPEC) */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A]">
                      Submitted Chapters & Topic Review
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Annotate drafts, inspect raw data sheets, and issue academic decisions
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-400">
                    {selectedStudent.chapters.length} Drafts
                  </span>
                </div>

                {/* Optional Feedback Note Input */}
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Supervisor Feedback / Annotation Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Antimicrobial zone diameters approved; proceed to Chapter 5 conclusions..."
                    value={activeReviewFeedback || ''}
                    onChange={(e) => setActiveReviewFeedback(e.target.value)}
                    className="w-full text-xs rounded-xl border border-stone-200 p-2.5 bg-stone-50/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#CBA358]"
                  />
                </div>

                {/* Chapter List with Download, Gold "Approve", "Request Corrections", "Reject" */}
                <div className="space-y-3">
                  {selectedStudent.chapters.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center bg-stone-50">
                      <FileText className="h-7 w-7 text-stone-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-stone-700">No Documents Uploaded by Candidate Yet</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">The candidate has not submitted any chapter drafts or research documents.</p>
                    </div>
                  ) : (
                    selectedStudent.chapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="rounded-xl border border-stone-200/80 bg-[#FDFBF7] p-3.5 sm:p-4 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <FileText className="h-4 w-4 text-[#8f6d28] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 truncate">{ch.name}</p>
                              <p className="text-[10px] text-stone-500 font-mono mt-0.5">
                                {ch.chapterLabel} · {ch.version} · {ch.size} · Uploaded: {ch.date}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                              ch.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : ch.status === 'Requires Correction'
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {ch.status}
                          </span>
                        </div>

                        {ch.remarks && (
                          <p className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200/60 leading-relaxed">
                            <strong className="text-stone-700">Supervisor Note:</strong> {ch.remarks}
                          </p>
                        )}

                        {/* Action Buttons: Download Document + Gold "Approve", "Request Corrections", "Reject" */}
                        <div className="pt-2 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              downloadDocumentFile(ch, {
                                name: selectedStudent.name,
                                matric: selectedStudent.matric,
                                supervisor: currentUser?.name,
                              });
                              triggerToast(`Downloading ${ch.fileName || ch.name}`);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white hover:bg-stone-50 px-3 py-1 text-[11px] font-bold text-stone-700 shadow-2xs transition-colors cursor-pointer mr-auto"
                            title={`Download ${ch.name}`}
                          >
                            <Download className="h-3 w-3 text-[#8f6d28]" />
                            <span>Download Document</span>
                          </button>

                          <div className="flex items-center gap-1.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleDocumentAction(ch.id, 'reject')}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <ThumbsDown className="h-3 w-3" />
                              <span>Reject</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDocumentAction(ch.id, 'corrections')}
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Request Corrections</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDocumentAction(ch.id, 'approve')}
                              className="inline-flex items-center gap-1 rounded-full bg-[#CBA358] px-3 py-1 text-[11px] font-extrabold text-[#1A1A1A] hover:bg-[#b89146] shadow-xs active:scale-98 transition-all cursor-pointer"
                            >
                              <ThumbsUp className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MILESTONES CHECKLIST SECTION (REQUIRED SPEC) */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-stone-100 pb-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#1A1A1A]">
                      Candidate Research Milestones
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Mark completed benchwork phases to update real-time progress calculations
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#8f6d28] bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                      {selectedStudent.milestones.filter((m) => m.completed).length} / {selectedStudent.milestones.length} Completed
                    </span>
                    <DownloadReportButton
                      project={{
                        name: selectedStudent.name,
                        matric: selectedStudent.matric,
                        department: 'Computer Science',
                        topic: selectedStudent.topic,
                        supervisor: 'Dr. Kolawole O. Alabi',
                        progressPercentage: selectedStudent.progress,
                        status: selectedStudent.status,
                      }}
                      milestones={selectedStudent.milestones}
                      variant="light"
                      size="sm"
                      onDownloaded={(fmt) =>
                        triggerToast(`Milestone progress report downloaded as ${fmt}`)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedStudent.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(m.id)}
                      className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-[#FDFBF7] hover:bg-white hover:border-[#CBA358]/60 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={Boolean(m.completed)}
                          onChange={() => handleToggleMilestone(m.id)}
                          className="h-4 w-4 rounded text-[#CBA358] accent-[#CBA358] cursor-pointer"
                        />
                        <span
                          className={`text-xs font-semibold truncate ${
                            m.completed ? 'text-stone-800 line-through opacity-80' : 'text-stone-900 font-bold'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 font-medium shrink-0 ml-2">
                        {m.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-200 bg-white flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Department of Computer Science · Faculty of Computing
              </span>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-full bg-[#1A1A1A] px-5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Defense Clearance Modal (Proposal, Internal, and External Defense Form) */}
      <DefenseClearanceFormModal
        isOpen={isClearanceModalOpen}
        candidateMatric={clearanceModalStudent?.matric}
        candidate={clearanceModalStudent}
        initialStage={clearanceModalStage}
        onClose={() => setIsClearanceModalOpen(false)}
      />
    </div>
  );
};
