import React, { useState, useMemo } from 'react';
import {
  Shield,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  Send,
  Download,
  Search,
  Filter,
  Users,
  ChevronRight,
  Layers,
  Sparkles,
  UserCheck,
  Check,
  X,
  Plus,
  BarChart3,
  CalendarDays,
  FileCheck,
  FileCheck2,
  RefreshCw,
  Eye,
  Settings,
  AlertTriangle,
  Building2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  FileSpreadsheet,
  Printer,
  BookOpen,
  Microscope,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DownloadReportButton } from '../common/DownloadReportButton';
import { downloadDocumentFile } from '../../utils/documentDownload';
import { AdminOnboardingModal } from '../admin/AdminOnboardingModal';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { DefenseStage } from '../../types';

interface AdminAndExternalDashboardProps {
  initialRole?: string;
}

export const AdminAndExternalDashboard: React.FC<AdminAndExternalDashboardProps> = ({ initialRole }) => {
  const { 
    currentRole, 
    currentUser, 
    externalCandidates, 
    scoreExternalCandidate, 
    activeView, 
    setActiveView, 
    showToast,
    addDefenseSession,
    accounts
  } = useApp();

  // Determine active view mode: based on currentRole or initialRole prop
  const effectiveRole = initialRole || currentRole;
  const isExternal = effectiveRole === 'external_supervisor';

  // -------------------------------------------------------------
  // STATE: External Supervisor Dashboard
  // -------------------------------------------------------------
  const [evaluatingCandidateId, setEvaluatingCandidateId] = useState<string | null>(null);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceTargetCandidate, setClearanceTargetCandidate] = useState<any>(null);
  const [clearanceModalStage, setClearanceModalStage] = useState<DefenseStage>('external');
  const [externalScores, setExternalScores] = useState({
    softwareDesign: 27, // max 30 (Software Design & Quality)
    presentation: 18,   // max 20 (Presentation)
    projectReports: 26, // max 30 (Project Reports & Documentation)
    responseToQuestions: 17 // max 20 (Response to Questions)
  });
  const [externalRecommendation, setExternalRecommendation] = useState('First Class Honours (Distinction)');
  const [externalComments, setExternalComments] = useState(
    'The candidate demonstrated formidable scientific depth during oral interrogation. The system architecture performance analysis, low-latency microservice benchmarks, and formal invariants are rigorously executed and meet statutory benchmark criteria for publication.'
  );

  // External Supervisor Assigned Candidates with rich dossier metadata
  const _UNUSED_DEFAULT_CANDIDATES = [
    {
      id: 'EXT-01',
      matric: 'CSC/2021/0445',
      name: 'Ibrahim Musa Farouk',
      track: 'Network Security & Machine Learning Track',
      topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks',
      abstract: 'This research investigation designed and evaluated a high-throughput, low-latency network intrusion detection system utilizing lightweight deep neural networks trained on modern attack vectors in enterprise networks across Abubakar Tafawa Balewa University, Bauchi (ATBU). The proposed architecture demonstrated 98.4% precision with sub-millisecond inference latency, confirming robust suitability for real-time edge security deployment.',
      date: 'Thursday, Nov 12, 2026',
      time: '10:00 AM – 11:15 AM',
      venue: 'Faculty Boardroom & Senate Chamber (Room 204)',
      supervisor: 'Dr. Aminu Salisu',
      internalScore: 88,
      status: 'Awaiting Evaluation',
      externalScore: null as number | null,
      similarityIndex: 8.4,
      pages: 142,
      ethicsCode: 'ATBU/REC/2026/089 (Institutional Research Ethics Cleared)',
      labLogbook: 'Duly verified and countersigned by Lead Systems Technologist & Lead Supervisor',
      documents: [
        { name: 'Final_Dissertation_CSC_2021_0445.pdf', size: '14.2 MB', type: 'PDF Thesis (Chapters 1-5)', date: 'Nov 04, 2026' },
        { name: 'Deep_Learning_Inference_Benchmarks.xlsx', size: '3.8 MB', type: 'Raw Systems Dataset', date: 'Nov 02, 2026' },
        { name: 'Turnitin_Digital_Similarity_Receipt.pdf', size: '1.2 MB', type: 'Plagiarism Audit Slip', date: 'Nov 01, 2026' }
      ],
      milestones: [
        { stage: 'Topic & Proposal Defense', date: 'Aug 15, 2026', status: 'Cleared (85%)' },
        { stage: 'Model Benchmarking & Experimental Verification', date: 'Oct 02, 2026', status: 'Cleared (Verified)' },
        { stage: 'Internal Departmental Pre-Defense', date: 'Oct 28, 2026', status: 'Cleared (88%)' },
        { stage: 'Senate Final External Viva Voce', date: 'Nov 12, 2026', status: 'In Progress' }
      ],
      savedScores: undefined as { originality: number; scientificRigor: number; dissertationQuality: number; vivaDefense: number; } | undefined,
      savedRecommendation: '',
      savedComments: ''
    },
    {
      id: 'EXT-02',
      matric: 'CSC/2021/0482',
      name: 'Amina Bello',
      track: 'Artificial Intelligence Track',
      topic: 'Antibiogram and Molecular Detection of blaCTX-M and blaNDM-1 Genes in Extended-Spectrum Beta-Lactamase Enterobacteriaceae',
      abstract: 'A prospective computational surveillance was executed to characterize the antibiogram and detect carbapenemase and extended-spectrum beta-lactamase genes (blaCTX-M, blaNDM-1) among uropathogenic clinical isolates of Klebsiella pneumoniae and Escherichia coli. Multiplex PCR amplification identified blaCTX-M in 64.2% and blaNDM-1 in 18.5% of isolates. Resistance exceeded 85% for third-generation cephalosporins, whereas colistin and tigecycline retained >94% in vitro susceptibility.',
      date: 'Thursday, Nov 12, 2026',
      time: '11:30 AM – 12:45 PM',
      venue: 'Faculty Boardroom & Senate Chamber (Room 204)',
      supervisor: 'Dr. Kolawole O. Alabi',
      internalScore: 89.5,
      status: 'Awaiting Evaluation',
      externalScore: null as number | null,
      similarityIndex: 11.2,
      pages: 168,
      ethicsCode: 'ATBU/REC/2026/092 (Institutional Bio-Ethics Cleared)',
      labLogbook: 'Certified with verified Agarose Gel Electrophoresis bands',
      documents: [
        { name: 'Dissertation_Full_Text_CSC_2021_0482.pdf', size: '18.1 MB', type: 'PDF Thesis (Chapters 1-5)', date: 'Nov 03, 2026' },
        { name: 'Gel_Doc_Imaging_PCR_Bands.xlsx', size: '4.2 MB', type: 'Raw Lab Assay Dataset', date: 'Oct 29, 2026' },
        { name: 'Turnitin_Originality_Report.pdf', size: '1.4 MB', type: 'Plagiarism Audit Slip', date: 'Nov 01, 2026' }
      ],
      milestones: [
        { stage: 'Topic & Proposal Defense', date: 'Aug 15, 2026', status: 'Cleared (86%)' },
        { stage: 'Wet-Lab Benchwork & Bioassay Replication', date: 'Oct 04, 2026', status: 'Cleared (Verified)' },
        { stage: 'Internal Departmental Pre-Defense', date: 'Oct 29, 2026', status: 'Cleared (89.5%)' },
        { stage: 'Senate Final External Viva Voce', date: 'Nov 12, 2026', status: 'Scheduled' }
      ],
      savedScores: undefined as { originality: number; scientificRigor: number; dissertationQuality: number; vivaDefense: number; } | undefined,
      savedRecommendation: '',
      savedComments: ''
    },
    {
      id: 'EXT-03',
      matric: 'CSC/2021/0390',
      name: 'Zainab Kabir Usman',
      track: 'Cybersecurity Track',
      topic: 'Phytochemical Fractionation, HPLC Fingerprinting, and Synergistic Antibacterial Efficacy of Vernonia amygdalina and Zingiber officinale',
      abstract: 'Crude methanolic and sub-fractionated extracts of Vernonia amygdalina leaves and Zingiber officinale rhizomes were investigated for antibacterial efficacy against multidrug-resistant clinical pathogens. HPLC chromatographic fingerprinting revealed high concentrations of vernodalin and [6]-gingerol. Checkerboard microdilution assays demonstrated potent synergistic bactericidal activity against Pseudomonas aeruginosa with Fractional Inhibitory Concentration Indices (FICI) < 0.5.',
      date: 'Friday, Nov 13, 2026',
      time: '09:00 AM – 10:15 AM',
      venue: 'Computer Science Complex (Room 102)',
      supervisor: 'Dr. Victor Adeyemi',
      internalScore: 84,
      status: 'Awaiting Evaluation',
      externalScore: null as number | null,
      similarityIndex: 9.8,
      pages: 135,
      ethicsCode: 'ATBU/REC/2026/077 (Institutional Bio-Ethics Cleared)',
      labLogbook: 'Certified with validated HPLC chromatograms on file',
      documents: [
        { name: 'Dissertation_Final_CSC_2021_0390.pdf', size: '12.5 MB', type: 'PDF Thesis (Chapters 1-5)', date: 'Nov 04, 2026' },
        { name: 'HPLC_Fractionation_Spectra.xlsx', size: '5.1 MB', type: 'Raw Lab Assay Dataset', date: 'Oct 27, 2026' },
        { name: 'Turnitin_Originality_Report.pdf', size: '1.0 MB', type: 'Plagiarism Audit Slip', date: 'Oct 31, 2026' }
      ],
      milestones: [
        { stage: 'Topic & Proposal Defense', date: 'Aug 16, 2026', status: 'Cleared (82%)' },
        { stage: 'Wet-Lab Benchwork & Bioassay Replication', date: 'Oct 01, 2026', status: 'Cleared (Verified)' },
        { stage: 'Internal Departmental Pre-Defense', date: 'Oct 28, 2026', status: 'Cleared (84%)' },
        { stage: 'Senate Final External Viva Voce', date: 'Nov 13, 2026', status: 'Scheduled' }
      ],
      savedScores: undefined as { originality: number; scientificRigor: number; dissertationQuality: number; vivaDefense: number; } | undefined,
      savedRecommendation: '',
      savedComments: ''
    },
    {
      id: 'EXT-04',
      matric: 'CSC/2021/0511',
      name: 'Chukwudi Nnamdi Okafor',
      track: 'Software Engineering Track',
      topic: 'Genomic Profiling and Hydrocarbon Degradation Kinetics of Hydrocarbonoclastic Pseudomonas aeruginosa in Artisanal Refining Brackish Soils',
      abstract: 'Hydrocarbonoclastic bacteria were isolated from crude-oil contaminated mangrove sediments to model bioremediation degradation kinetics. Gas Chromatography-Flame Ionization Detection (GC-FID) demonstrated 88.4% degradation of C10-C28 aliphatic hydrocarbons over 21 days by Pseudomonas aeruginosa strain KA-4. Monod kinetic modeling revealed maximum specific growth rate (mu_max) of 0.042 h^-1, establishing viable bioremediation parameters in hypersaline conditions.',
      date: 'Friday, Nov 13, 2026',
      time: '10:30 AM – 11:45 AM',
      venue: 'Computer Science Complex (Room 102)',
      supervisor: 'Dr. Kolawole O. Alabi',
      internalScore: 82,
      status: 'Completed',
      externalScore: 92,
      similarityIndex: 14.0,
      pages: 154,
      ethicsCode: 'ATBU/REC/2026/068 (Institutional Bio-Ethics Cleared)',
      labLogbook: 'GC-FID calibration peaks certified by Departmental Instrumentation Lab',
      documents: [
        { name: 'Dissertation_Final_CSC_2021_0511.pdf', size: '16.0 MB', type: 'PDF Thesis (Chapters 1-5)', date: 'Oct 30, 2026' },
        { name: 'GC_FID_Kinetics_Dataset.xlsx', size: '6.4 MB', type: 'Raw Lab Assay Dataset', date: 'Oct 25, 2026' },
        { name: 'Turnitin_Originality_Report.pdf', size: '1.3 MB', type: 'Plagiarism Audit Slip', date: 'Oct 29, 2026' }
      ],
      milestones: [
        { stage: 'Topic & Proposal Defense', date: 'Aug 16, 2026', status: 'Cleared (80%)' },
        { stage: 'Wet-Lab Benchwork & Bioassay Replication', date: 'Sep 30, 2026', status: 'Cleared (Verified)' },
        { stage: 'Internal Departmental Pre-Defense', date: 'Oct 27, 2026', status: 'Cleared (82%)' },
        { stage: 'Senate Final External Viva Voce', date: 'Nov 13, 2026', status: 'Completed (92%)' }
      ],
      savedScores: {
        softwareDesign: 28,
        presentation: 18,
        projectReports: 28,
        responseToQuestions: 18
      },
      savedRecommendation: 'First Class Honours (Distinction)',
      savedComments: 'Impressive demonstration of distributed systems verification and formal proofs. Recommended for Senate commendation.'
    }
  ];

  const evaluatingCandidate = useMemo(() => {
    return externalCandidates.find(c => c.id === evaluatingCandidateId) || null;
  }, [externalCandidates, evaluatingCandidateId]);

  const handleOpenCandidateEvaluation = (candidateId: string) => {
    const cand = externalCandidates.find(c => c.id === candidateId);
    if (cand) {
      if (cand.savedScores) {
        setExternalScores({
          softwareDesign: cand.savedScores.softwareDesign ?? 27,
          presentation: cand.savedScores.presentation ?? 18,
          projectReports: cand.savedScores.projectReports ?? 26,
          responseToQuestions: cand.savedScores.responseToQuestions ?? 17
        });
      } else if (cand.status === 'Completed' && cand.externalScore) {
        setExternalScores({
          softwareDesign: 28,
          presentation: 18,
          projectReports: 28,
          responseToQuestions: Math.max(0, cand.externalScore - 74)
        });
      } else {
        setExternalScores({
          softwareDesign: 27,
          presentation: 18,
          projectReports: 26,
          responseToQuestions: 17
        });
      }
      if (cand.savedRecommendation) {
        setExternalRecommendation(cand.savedRecommendation);
      } else {
        setExternalRecommendation('First Class Honours (Distinction)');
      }
      if (cand.savedComments) {
        setExternalComments(cand.savedComments);
      } else {
        setExternalComments(
          'The candidate demonstrated formidable engineering mastery during the viva voce examination. Software design architecture, performance metrics, and documentation conform strictly to statutory university standards.'
        );
      }
    }
    setEvaluatingCandidateId(candidateId);
  };

  // Live Auto-Calculating External Total Score
  const totalExternalScore = useMemo(() => {
    return (
      (Number(externalScores.softwareDesign) || 0) +
      (Number(externalScores.presentation) || 0) +
      (Number(externalScores.projectReports) || 0) +
      (Number(externalScores.responseToQuestions) || 0)
    );
  }, [externalScores]);

  // Statutory External Grade Letter
  const statutoryGrade = useMemo(() => {
    if (totalExternalScore >= 70) return { grade: 'A', text: 'First Class Honours (Excellent)', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
    if (totalExternalScore >= 60) return { grade: 'B', text: 'Second Class Upper (Very Good)', color: 'text-[#CBA358]', border: 'border-[#CBA358]/30', bg: 'bg-[#CBA358]/10' };
    if (totalExternalScore >= 50) return { grade: 'C', text: 'Second Class Lower (Good)', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
    if (totalExternalScore >= 45) return { grade: 'D', text: 'Third Class (Pass)', color: 'text-stone-400', border: 'border-stone-500/30', bg: 'bg-stone-500/10' };
    return { grade: 'F', text: 'Fail / Mandatory Resubmission', color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' };
  }, [totalExternalScore]);

  const handleExternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingCandidate) return;

    scoreExternalCandidate(
      evaluatingCandidate.id,
      totalExternalScore,
      externalRecommendation,
      externalComments,
      externalScores
    );
    showToast(`Final External Evaluation signed & submitted for ${evaluatingCandidate.name} (${totalExternalScore}/100 - Grade ${statutoryGrade.grade})`);
  };

  // -------------------------------------------------------------
  // STATE: Administrator Dashboard
  // -------------------------------------------------------------
  const [adminActiveTab, setAdminActiveTab] = useState('overview'); // 'overview' | 'scheduling' | 'overrides' | 'master_scores'
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Admin Scheduling State
  const [scheduleStage, setScheduleStage] = useState('proposal'); // 'proposal' | 'internal' | 'external'
  const [scheduleStudent, setScheduleStudent] = useState('Amina Bello (CSC/2021/0482)');
  const [scheduleDate, setScheduleDate] = useState('2026-10-24');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleVenue, setScheduleVenue] = useState('Computing Seminar Boardroom 102');
  const [schedulePanelLead, setSchedulePanelLead] = useState('Prof. Sarah N. Ibrahim (HOD / Chair)');
  const [scheduleExaminersList, setScheduleExaminersList] = useState<string[]>([
    'Dr. Kolawole O. Alabi (Internal Examiner)',
    'Dr. Victor Adeyemi (Internal Examiner)'
  ]);
  const [scheduleNewExaminerName, setScheduleNewExaminerName] = useState('');
  const [scheduleNewExaminerRole, setScheduleNewExaminerRole] = useState('Internal Examiner');

  const handleAddScheduleExaminer = () => {
    if (!scheduleNewExaminerName.trim()) {
      showToast('Please type the examiner name and title.');
      return;
    }
    const formatted = `${scheduleNewExaminerName.trim()} (${scheduleNewExaminerRole})`;
    if (scheduleExaminersList.some(e => e.toLowerCase().includes(scheduleNewExaminerName.trim().toLowerCase()))) {
      showToast('This examiner is already appointed to this panel.');
      return;
    }
    setScheduleExaminersList(prev => [...prev, formatted]);
    showToast(`Appointed examiner: ${scheduleNewExaminerName.trim()}`);
    setScheduleNewExaminerName('');
  };

  const handleRemoveScheduleExaminer = (index: number) => {
    setScheduleExaminersList(prev => prev.filter((_, i) => i !== index));
  };

  const [scheduledSessionsList, setScheduledSessionsList] = useState([
    {
      id: 'SCHED-101',
      stage: 'Proposal Defense',
      studentName: 'Amina Bello',
      matric: 'CSC/2021/0482',
      topic: 'Antibiogram and Molecular Detection of blaCTX-M in ESBL Enterobacteriaceae',
      date: 'Oct 24, 2026',
      time: '10:00 AM',
      venue: 'Computing Boardroom 102',
      panelLead: 'Prof. Sarah N. Ibrahim',
      examiners: ['Dr. Kolawole O. Alabi (Supervisor)', 'Dr. Victor Adeyemi (Internal Examiner)'],
      status: 'Published'
    },
    {
      id: 'SCHED-102',
      stage: 'Internal Defense',
      studentName: 'Chukwudi Nnamdi Okafor',
      matric: 'CSC/2021/0511',
      topic: 'Genomic Profiling of Hydrocarbonoclastic Pseudomonas in Artisanal Refining Brackish Soils',
      date: 'Oct 28, 2026',
      time: '02:00 PM',
      venue: 'Seminar Suite B',
      panelLead: 'Dr. Victor Adeyemi',
      examiners: ['Dr. Aminu Salisu (Internal Examiner)', 'Dr. T. E. Johnson (Internal Examiner)'],
      status: 'Published'
    },
    {
      id: 'SCHED-103',
      stage: 'External Viva',
      studentName: 'Ibrahim Musa Farouk',
      matric: 'CSC/2021/0445',
      topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks',
      date: 'Nov 12, 2026',
      time: '10:00 AM',
      venue: 'Senate Chambers Room 204',
      panelLead: 'Prof. Charles U. Eze (Visiting External)',
      examiners: ['Prof. Charles U. Eze (External)', 'Dr. Aminu Salisu (Internal Examiner)'],
      status: 'Confirmed'
    }
  ]);

  const handlePublishSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleVenue.trim()) {
      showToast('Please specify the examination hall/venue manually.');
      return;
    }

    const studentNamePart = scheduleStudent.split('(')[0].trim();
    const matricPart = scheduleStudent.includes('(') ? scheduleStudent.split('(')[1].replace(')', '').trim() : 'CSC/2021/TEMP';
    const stageName = scheduleStage === 'proposal' ? 'Proposal Defense' : scheduleStage === 'internal' ? 'Internal Defense' : 'External Viva';
    const finalExaminers = scheduleExaminersList.length > 0 ? scheduleExaminersList : [schedulePanelLead];

    const newSession = {
      id: `SCHED-${Date.now().toString().slice(-4)}`,
      stage: stageName,
      studentName: studentNamePart,
      matric: matricPart,
      topic: 'System Architecture Design & Implementation Benchmarks',
      date: scheduleDate,
      time: scheduleTime,
      venue: scheduleVenue.trim(),
      panelLead: schedulePanelLead.trim(),
      examiners: finalExaminers,
      status: 'Published'
    };

    setScheduledSessionsList([newSession, ...scheduledSessionsList]);

    if (addDefenseSession) {
      addDefenseSession({
        sessionCode: `DEF-CSC-2026-${Math.floor(100 + Math.random() * 900)}`,
        type: stageName as any,
        candidateName: studentNamePart,
        candidateMatric: matricPart,
        topic: 'System Architecture Design & Implementation Benchmarks',
        date: scheduleDate,
        time: scheduleTime,
        venue: scheduleVenue.trim(),
        panelChair: schedulePanelLead.trim(),
        members: finalExaminers,
        status: 'Scheduled'
      });
    }

    showToast(`Defense session published at ${scheduleVenue} with ${finalExaminers.length} appointed examiners.`);
  };

  // Admin Overrides & Exceptions State
  const [overrideItems, setOverrideItems] = useState([
    {
      id: 'OVR-1',
      studentName: 'Oluwaseun Daniels',
      matric: 'CSC/2021/0622',
      issueType: 'Similarity Index Breach (22.4%)',
      details: 'Turnitin similarity index flagged at 22.4% on Chapter 2 (Literature Review). Standard threshold is <15%. Candidate submitted revised citations from peer-reviewed journals.',
      submittedBy: 'Dr. K. O. Alabi (Internal Supervisor)',
      date: 'Sep 19, 2026',
      status: 'Pending'
    },
    {
      id: 'OVR-2',
      studentName: 'Blessing Okon',
      matric: 'CSC/2021/0308',
      issueType: 'Lab Biosafety & Specimen Sourcing Waiver',
      details: 'Field sampling protocol requires collection of fermented artisanal yogurt isolates beyond 200km radius. Ethical clearance and biosafety escort waiver requested.',
      submittedBy: 'Prof. Sarah N. Ibrahim (HOD)',
      date: 'Sep 18, 2026',
      status: 'Pending'
    },
    {
      id: 'OVR-3',
      studentName: 'Faruk Danjuma',
      matric: 'CSC/2021/0719',
      issueType: 'Defense Docket Late Registration',
      details: 'Candidate completed benchwork validation 48 hours after statutory portal closure due to delayed PCR primer shipments from South Africa.',
      submittedBy: 'Dr. Aminu Salisu (Supervisor)',
      date: 'Sep 17, 2026',
      status: 'Pending'
    }
  ]);

  const handleOverrideDecision = (id: string, decision: string) => {
    setOverrideItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: decision } : item
      )
    );
    showToast(`Administrative Override ${decision}: Case #${id} updated.`);
  };

  // Admin Master Scores List
  const [masterScoreSearch, setMasterScoreSearch] = useState('');
  const [masterScoreStageFilter, setMasterScoreStageFilter] = useState('All');

  const masterScoresData = [
    {
      matric: 'CSC/2021/0482',
      name: 'Amina Bello',
      supervisor: 'Dr. K. O. Alabi',
      proposalScore: 84.5,
      internalScore: 89.5,
      externalScore: 92.0,
      totalWeighted: 89.6,
      finalGrade: 'A',
      status: 'Passed Distinction'
    },
    {
      matric: 'CSC/2021/0445',
      name: 'Ibrahim Musa Farouk',
      supervisor: 'Dr. A. Salisu',
      proposalScore: 82.0,
      internalScore: 88.0,
      externalScore: 94.0,
      totalWeighted: 89.2,
      finalGrade: 'A',
      status: 'Passed Distinction'
    },
    {
      matric: 'CSC/2021/0390',
      name: 'Zainab Kabir Usman',
      supervisor: 'Dr. V. Adeyemi',
      proposalScore: 80.5,
      internalScore: 84.0,
      externalScore: 86.5,
      totalWeighted: 84.1,
      finalGrade: 'A',
      status: 'Passed First Class'
    },
    {
      matric: 'CSC/2021/0511',
      name: 'Chukwudi Nnamdi Okafor',
      supervisor: 'Dr. K. O. Alabi',
      proposalScore: 78.0,
      internalScore: 82.0,
      externalScore: 88.0,
      totalWeighted: 83.4,
      finalGrade: 'A',
      status: 'Passed First Class'
    },
    {
      matric: 'CSC/2021/0308',
      name: 'Blessing Okon',
      supervisor: 'Prof. S. Ibrahim',
      proposalScore: 76.5,
      internalScore: 79.0,
      externalScore: null,
      totalWeighted: 78.0,
      finalGrade: 'B',
      status: 'Awaiting External'
    },
    {
      matric: 'CSC/2021/0622',
      name: 'Oluwaseun Daniels',
      supervisor: 'Dr. K. O. Alabi',
      proposalScore: 71.0,
      internalScore: 68.5,
      externalScore: null,
      totalWeighted: 69.8,
      finalGrade: 'B',
      status: 'Corrections Required'
    }
  ];

  const filteredMasterScores = useMemo(() => {
    return masterScoresData.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(masterScoreSearch.toLowerCase()) ||
        item.matric.toLowerCase().includes(masterScoreSearch.toLowerCase()) ||
        item.supervisor.toLowerCase().includes(masterScoreSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (masterScoreStageFilter === 'Graduated') return item.externalScore !== null;
      if (masterScoreStageFilter === 'Pending') return item.externalScore === null;
      return true;
    });
  }, [masterScoreSearch, masterScoreStageFilter]);

  // =============================================================
  // RENDER VIEW 1: EXTERNAL SUPERVISOR DASHBOARD
  // =============================================================
  if (isExternal) {
    // -----------------------------------------------------------
    // SUB-VIEW 1B: DEDICATED STUDENT DETAIL & EXAMINER EVALUATION PAGE
    // (Rendered when an external supervisor clicks on a student card)
    // -----------------------------------------------------------
    if (evaluatingCandidate) {
      return (
        <div className="space-y-6 sm:space-y-8 pb-12">
          {/* Top Navigation & Breadcrumbs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-stone-200/80 rounded-[18px] p-3 sm:p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEvaluatingCandidateId(null)}
                className="inline-flex items-center gap-2 rounded-xl bg-stone-100 hover:bg-[#CBA358] hover:text-[#1A1A1A] text-stone-700 px-3.5 py-2 text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Candidates Docket</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400">
                <span>/</span>
                <span className="font-semibold text-stone-600">{evaluatingCandidate.name}</span>
                <span className="font-mono text-[11px] text-stone-400">({evaluatingCandidate.matric})</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {evaluatingCandidate.status === 'Completed' ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Evaluation Certified ({evaluatingCandidate.externalScore}/100)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Awaiting Final Viva Evaluation</span>
                </span>
              )}

              <DownloadReportButton
                project={{
                  name: evaluatingCandidate.name,
                  matric: evaluatingCandidate.matric,
                  topic: evaluatingCandidate.topic,
                  department: 'Department of Computer Science',
                  supervisor: evaluatingCandidate.supervisor,
                  status: evaluatingCandidate.status,
                  progressPercentage: evaluatingCandidate.status === 'Completed' ? 100 : 85,
                  session: '2025/2026'
                }}
                milestones={evaluatingCandidate.milestones.map((m, i) => ({
                  id: i + 1,
                  title: m.stage,
                  status: m.status,
                  completed: m.status.includes('Cleared'),
                  date: m.date,
                  badge: m.status,
                  details: `Date: ${m.date} - ${m.status}`
                }))}
                variant="outline"
                size="sm"
                onDownloaded={(fmt) => showToast(`Downloaded ${evaluatingCandidate.name}'s milestone report as ${fmt}.`)}
              />

              <button
                type="button"
                onClick={() => {
                  setClearanceTargetCandidate({
                    name: evaluatingCandidate.name,
                    identifier: evaluatingCandidate.matric,
                    matric: evaluatingCandidate.matric,
                    projectTopic: evaluatingCandidate.topic,
                    assignedSupervisorName: evaluatingCandidate.supervisor,
                    department: 'Department of Computer Science',
                    faculty: 'Faculty of Computing',
                    institution: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
                  });
                  setClearanceModalStage('proposal');
                  setIsClearanceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>Proposal Defense Slip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setClearanceTargetCandidate({
                    name: evaluatingCandidate.name,
                    identifier: evaluatingCandidate.matric,
                    matric: evaluatingCandidate.matric,
                    projectTopic: evaluatingCandidate.topic,
                    assignedSupervisorName: evaluatingCandidate.supervisor,
                    department: 'Department of Computer Science',
                    faculty: 'Faculty of Computing',
                    institution: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
                  });
                  setClearanceModalStage('external');
                  setIsClearanceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <FileCheck className="h-3.5 w-3.5 text-purple-700" />
                <span>External Clearance Slip (Print / PDF)</span>
              </button>
            </div>
          </div>

          {/* Student Overview Hero Card (Luxury Obsidian & Gold) */}
          <div className="rounded-[22px] bg-gradient-to-br from-[#1c1c20] via-[#141417] to-[#0d0d0f] p-5 sm:p-7 md:p-8 text-white shadow-2xl border border-white/[0.08] ring-1 ring-white/[0.04] relative overflow-hidden">
            {/* Ambient Golden Radial Blur */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-[#CBA358]/14 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 w-60 h-60 bg-blue-500/[0.05] rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Header metadata chips */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/[0.08] border border-white/[0.12] px-3 py-1 text-xs font-mono font-bold text-[#CBA358]">
                    {evaluatingCandidate.matric}
                  </span>
                  <span className="rounded-full bg-[#CBA358]/15 border border-[#CBA358]/30 px-3 py-1 text-xs font-bold text-[#CBA358]">
                    {evaluatingCandidate.track}
                  </span>
                  <span className="rounded-full bg-white/[0.05] border border-white/[0.08] px-3 py-1 text-xs text-stone-300 font-medium">
                    {evaluatingCandidate.pages} Pages Thesis
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Turnitin Similarity: {evaluatingCandidate.similarityIndex}% (Cleared)</span>
                </div>
              </div>

              {/* Student Name and Dissertation Topic */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-11 w-11 rounded-full bg-[#CBA358]/20 border border-[#CBA358]/40 flex items-center justify-center font-black text-[#CBA358] text-base shrink-0 shadow-inner">
                    {evaluatingCandidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-snug">
                      {evaluatingCandidate.name}
                    </h1>
                    <p className="text-xs text-stone-400">
                      B.Sc. Computer Science Candidate · 2025/2026 Academic Session
                    </p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-stone-200 font-medium leading-relaxed mt-3 max-w-4xl bg-white/[0.03] p-3.5 rounded-xl border border-white/[0.06]">
                  <strong className="text-[#CBA358]">Research Topic:</strong> {evaluatingCandidate.topic}
                </p>
              </div>

              {/* 4-Item Context Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-white/[0.08] text-xs">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-0.5">Internal Supervisor</span>
                  <strong className="text-white block truncate">{evaluatingCandidate.supervisor}</strong>
                  <span className="text-[11px] text-emerald-400 font-semibold">Pre-Defense: {evaluatingCandidate.internalScore}%</span>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-0.5">Viva Voce Date</span>
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <Calendar className="h-3.5 w-3.5 text-[#CBA358]" />
                    <strong className="text-white">{evaluatingCandidate.date}</strong>
                  </div>
                  <span className="text-[11px] text-stone-400">{evaluatingCandidate.time}</span>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.05] sm:col-span-2 lg:col-span-2">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 block mb-0.5">Examination Venue</span>
                  <div className="flex items-center gap-1.5 text-stone-200">
                    <MapPin className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                    <strong className="text-white truncate">{evaluatingCandidate.venue}</strong>
                  </div>
                  <span className="text-[11px] text-stone-400">Board of Examiners & Visiting External Moderator</span>
                </div>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN WORKFLOW LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* LEFT COLUMN: CANDIDATE DOSSIER, BENCHWORK & DOCUMENTS (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Scientific Abstract Card */}
              <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div className="h-7 w-7 rounded-lg bg-[#CBA358]/10 text-[#CBA358] flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A1A1A]">Scientific Abstract & Scope</h3>
                    <p className="text-[11px] text-stone-500">Methodological summary and laboratory findings</p>
                  </div>
                </div>

                <div className="text-xs text-stone-600 leading-relaxed space-y-2.5 font-normal">
                  <p>{evaluatingCandidate.abstract}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Deep Neural Networks</span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Intrusion Detection</span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Packet Processing</span>
                  <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">Sub-Millisecond Inference</span>
                </div>
              </div>

              {/* 2. Statutory Compliance & Quality Verification */}
              <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200/90 shadow-xs">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1A1A1A]">Statutory Compliance Clearance</h3>
                    <p className="text-[11px] text-stone-500">Institutional quality & ethics certifications</p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <div>
                      <span className="font-bold text-stone-800 block">Turnitin Similarity Audit</span>
                      <span className="text-[11px] text-stone-500">NUC Statutory Threshold &lt; 15%</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-xs">
                      {evaluatingCandidate.similarityIndex}% (Passed)
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <div>
                      <span className="font-bold text-stone-800 block">Bio-Ethics Clearance</span>
                      <span className="text-[11px] text-stone-500">{evaluatingCandidate.ethicsCode}</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[10px]">
                      Approved
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <div>
                      <span className="font-bold text-stone-800 block">Wet-Lab Benchwork Logbook</span>
                      <span className="text-[11px] text-stone-500">{evaluatingCandidate.labLogbook}</span>
                    </div>
                    <span className="font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[10px]">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                    <div>
                      <span className="font-bold text-stone-800 block">Departmental Internal Score</span>
                      <span className="text-[11px] text-stone-500">Recommended by {evaluatingCandidate.supervisor}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900 bg-[#CBA358]/20 px-2 py-0.5 rounded text-xs">
                      {evaluatingCandidate.internalScore}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Submitted Dissertation Documents & Raw Datasets */}
              <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200/90 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1A1A1A]">Submitted Dissertation Files</h3>
                      <p className="text-[11px] text-stone-500">Official manuscript and raw spectrophotometry data</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-stone-500">{evaluatingCandidate.documents.length} Files</span>
                </div>

                <div className="space-y-2.5">
                  {evaluatingCandidate.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/70 hover:bg-stone-100/80 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-stone-600 shrink-0 shadow-2xs">
                          {doc.name.endsWith('.xlsx') ? (
                            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <FileCheck2 className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-800 truncate">{doc.name}</p>
                          <p className="text-[10px] text-stone-500">{doc.type} · {doc.size} · Uploaded {doc.date}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          downloadDocumentFile({
                            name: doc.name,
                            fileName: doc.name,
                            title: doc.name,
                            category: doc.type,
                            fileSize: doc.size,
                            dateSubmitted: doc.date,
                            notes: `Dossier archive copy for candidate ${evaluatingCandidate.name}`,
                          }, {
                            name: evaluatingCandidate.name,
                            matric: evaluatingCandidate.matric,
                            supervisor: evaluatingCandidate.supervisor,
                          });
                          showToast(`Downloaded dossier copy of ${doc.name}`);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8f6d28] hover:text-[#b89146] bg-white border border-stone-200 px-2.5 py-1.5 rounded-lg shadow-2xs shrink-0 active:scale-95 transition-all cursor-pointer hover:bg-[#CBA358]/10"
                        title={`Download ${doc.name}`}
                      >
                        <Download className="h-3 w-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Statutory Milestone Trajectory */}
              <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200/90 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-[#1A1A1A]">Statutory Milestone Trajectory</h3>
                      <p className="text-[11px] text-stone-500">Stage gates cleared prior to external viva voce</p>
                    </div>
                  </div>
                  <DownloadReportButton
                    project={{
                      name: evaluatingCandidate.name,
                      matric: evaluatingCandidate.matric,
                      topic: evaluatingCandidate.topic,
                      department: 'Department of Computer Science',
                      supervisor: evaluatingCandidate.supervisor,
                      status: evaluatingCandidate.status,
                      progressPercentage: evaluatingCandidate.status === 'Completed' ? 100 : 85,
                      session: '2025/2026'
                    }}
                    milestones={evaluatingCandidate.milestones.map((m, i) => ({
                      id: i + 1,
                      title: m.stage,
                      status: m.status,
                      completed: m.status.includes('Cleared'),
                      date: m.date,
                      badge: m.status,
                      details: `Date: ${m.date} - ${m.status}`
                    }))}
                    variant="outline"
                    size="sm"
                    onDownloaded={(fmt) => showToast(`Exported ${evaluatingCandidate.name}'s milestone report as ${fmt}.`)}
                  />
                </div>

                <div className="space-y-3">
                  {evaluatingCandidate.milestones.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${idx === 3 ? 'bg-[#CBA358] animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="font-semibold text-stone-800">{m.stage}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          idx === 3 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                        }`}>
                          {m.status}
                        </span>
                        <span className="text-[10px] text-stone-400 block">{m.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: EXTERNAL EXAMINER STATUTORY EVALUATION FORM (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-[22px] bg-[#1A1A1A] p-6 sm:p-7 md:p-8 text-white shadow-2xl border border-stone-800 sticky top-4">
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358]/20 px-3 py-1 text-xs font-semibold text-[#CBA358] border border-[#CBA358]/30 mb-2">
                      <Sliders className="h-3.5 w-3.5" />
                      <span>Statutory NUC Viva Voce Rubric</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Examiner Evaluation Form
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Grading Candidate: <strong className="text-white">{evaluatingCandidate.name}</strong> ({evaluatingCandidate.matric})
                    </p>
                  </div>

                  {/* Running Total Score Box */}
                  <div className="flex items-center gap-3 bg-stone-900/90 rounded-[18px] p-3.5 border border-stone-800 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Score</span>
                      <div className="text-2xl sm:text-3xl font-black text-[#CBA358] font-mono leading-none mt-0.5">
                        {totalExternalScore}
                        <span className="text-xs font-bold text-stone-500">/100</span>
                      </div>
                    </div>
                    <div className="h-8 w-px bg-stone-800" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Classification</span>
                      <div className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md mt-0.5 border ${statutoryGrade.border} ${statutoryGrade.bg} ${statutoryGrade.color}`}>
                        Grade {statutoryGrade.grade}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certified Notice if already submitted */}
                {evaluatingCandidate.status === 'Completed' && (
                  <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Final Evaluation Certified: Awarded <strong>{evaluatingCandidate.externalScore}/100</strong> (Grade {statutoryGrade.grade}).
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-1 rounded">Transmitted to Senate</span>
                  </div>
                )}

                {/* The 4 Rubric Criteria */}
                <form onSubmit={handleExternalSubmit} className="mt-6 space-y-5">
                  <div className="space-y-4">
                    {/* Criterion 1 */}
                    <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90 hover:border-stone-700 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-stone-200">
                          1. Software Design & Quality
                        </label>
                        <span className="text-xs font-mono font-bold text-[#CBA358]">
                          {externalScores?.softwareDesign ?? 0} / 30 marks
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                        Architectural soundness, modular code quality, algorithmic correctness, scalability, and live software testbed execution.
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={externalScores?.softwareDesign ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, softwareDesign: Number(e.target.value) })}
                          className="flex-1 accent-[#CBA358] h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={externalScores?.softwareDesign ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, softwareDesign: Math.min(30, Math.max(0, Number(e.target.value))) })}
                          className="w-16 rounded-xl bg-stone-800 border border-stone-700 px-2 py-1 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#CBA358]"
                        />
                      </div>
                    </div>

                    {/* Criterion 2 */}
                    <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90 hover:border-stone-700 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-stone-200">
                          2. Presentation
                        </label>
                        <span className="text-xs font-mono font-bold text-[#CBA358]">
                          {externalScores?.presentation ?? 0} / 20 marks
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                        Viva voce oral defense delivery, visual slide clarity, professional poise, articulation, and adherence to time allocation.
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={externalScores?.presentation ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, presentation: Number(e.target.value) })}
                          className="flex-1 accent-[#CBA358] h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={externalScores?.presentation ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, presentation: Math.min(20, Math.max(0, Number(e.target.value))) })}
                          className="w-16 rounded-xl bg-stone-800 border border-stone-700 px-2 py-1 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#CBA358]"
                        />
                      </div>
                    </div>

                    {/* Criterion 3 */}
                    <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90 hover:border-stone-700 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-stone-200">
                          3. Project Reports & Documentation
                        </label>
                        <span className="text-xs font-mono font-bold text-[#CBA358]">
                          {externalScores?.projectReports ?? 0} / 30 marks
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                        Dissertation composition (Chapters 1–5), Turnitin similarity index compliance (&lt;15%), standard IEEE references, and software documentation.
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={externalScores?.projectReports ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, projectReports: Number(e.target.value) })}
                          className="flex-1 accent-[#CBA358] h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={externalScores?.projectReports ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, projectReports: Math.min(30, Math.max(0, Number(e.target.value))) })}
                          className="w-16 rounded-xl bg-stone-800 border border-stone-700 px-2 py-1 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#CBA358]"
                        />
                      </div>
                    </div>

                    {/* Criterion 4 */}
                    <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90 hover:border-stone-700 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-extrabold text-stone-200">
                          4. Response to Questions
                        </label>
                        <span className="text-xs font-mono font-bold text-[#CBA358]">
                          {externalScores?.responseToQuestions ?? 0} / 20 marks
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mb-3 leading-relaxed">
                        Candidate mastery during oral cross-examination by examiner panel, handling of technical queries, and sound defense of computational methodology.
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={externalScores?.responseToQuestions ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, responseToQuestions: Number(e.target.value) })}
                          className="flex-1 accent-[#CBA358] h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={externalScores?.responseToQuestions ?? 0}
                          onChange={(e) => setExternalScores({ ...externalScores, responseToQuestions: Math.min(20, Math.max(0, Number(e.target.value))) })}
                          className="w-16 rounded-xl bg-stone-800 border border-stone-700 px-2 py-1 text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-[#CBA358]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Statutory Senate Recommendation */}
                  <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90">
                    <label className="block text-xs font-extrabold text-stone-200 mb-1.5">
                      Statutory Recommendation to University Senate
                    </label>
                    <select
                      value={externalRecommendation || 'First Class Honours (Distinction)'}
                      onChange={(e) => setExternalRecommendation(e.target.value)}
                      className="w-full rounded-xl bg-stone-800 border border-stone-700 px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-[#CBA358]"
                    >
                      <option value="First Class Honours (Distinction)">Award B.Sc. Computer Science with First Class Honours (Distinction)</option>
                      <option value="Second Class Honours (Upper Division)">Award B.Sc. Computer Science with Second Class Honours (Upper Division)</option>
                      <option value="Second Class Honours (Lower Division)">Award B.Sc. Computer Science with Second Class Honours (Lower Division)</option>
                      <option value="Minor Revisions Required within 14 Days">Accept Subject to Minor Revisions (Typographical & Graph Calibrations)</option>
                      <option value="Major Revisions and Re-Defense">Reject – Major Methodological Deficiencies Requiring Benchwork Re-run</option>
                    </select>
                  </div>

                  {/* External Examiner Comments */}
                  <div className="rounded-[16px] bg-stone-900/90 p-4.5 border border-stone-800/90">
                    <label className="block text-xs font-extrabold text-stone-200 mb-1">
                      External Examiner Moderation Remarks & Confidential Feedback
                    </label>
                    <p className="text-[11px] text-stone-400 mb-2">
                      Official statutory evaluation text entered into University Senate records.
                    </p>
                    <textarea
                      rows={4}
                      value={externalComments || ''}
                      onChange={(e) => setExternalComments(e.target.value)}
                      className="w-full rounded-xl bg-stone-800 border border-stone-700 p-3 text-xs text-stone-200 focus:outline-none focus:border-[#CBA358] placeholder-stone-500 leading-relaxed font-sans"
                      placeholder="Enter detailed critique of laboratory benchwork, discussion depth, and candidate's oral defense..."
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-stone-800">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <Shield className="h-4 w-4 text-[#CBA358] shrink-0" />
                      <span>Digitally signed · {currentUser?.name || 'Prof. Charles U. Eze'} ({currentUser?.institution || 'Visiting External Examiner'})</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setEvaluatingCandidateId(null)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-700 bg-stone-800/80 hover:bg-stone-700 px-5 py-3 text-xs font-bold text-stone-300 transition-all active:scale-98"
                      >
                        <span>Cancel</span>
                      </button>

                      <button
                        type="submit"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full bg-[#CBA358] hover:bg-[#b99247] px-7 py-3 text-xs font-bold text-[#1A1A1A] transition-all shadow-md active:scale-98"
                      >
                        <Award className="h-4 w-4" />
                        <span>{evaluatingCandidate.status === 'Completed' ? 'Update Final Grade' : `Submit Final Evaluation (${totalExternalScore}/100)`}</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // -----------------------------------------------------------
    // SUB-VIEW 1A: ASSIGNED CANDIDATES DOCKET (MAIN LISTING VIEW)
    // -----------------------------------------------------------
    return (
      <div className="space-y-6 sm:space-y-8 pb-12">
        {/* Modern Luxury Obsidian & Gold Hero Card */}
        <div className="rounded-[22px] bg-gradient-to-br from-[#1c1c20] via-[#141417] to-[#0d0d0f] p-4.5 sm:p-6 md:p-8 text-white shadow-2xl border border-white/[0.08] ring-1 ring-white/[0.04] relative overflow-hidden">
          {/* Subtle Ambient Golden Radial Lighting */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#CBA358]/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 -mb-16 w-60 h-60 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Micro Grid Texture */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
            {/* Main Information Column */}
            <div className="flex-1 min-w-0">
              {/* Modern Frosted Badge with Live Pulse */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.1] px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-stone-200 shadow-xs mb-3 sm:mb-3.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CBA358] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CBA358]"></span>
                </span>
                <Award className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
                <span className="truncate">Senate-Appointed External Moderation Board</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                Final Viva Voce & Thesis Moderation
              </h1>

              {/* Responsive Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-stone-300">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-stone-200">
                  <span className="text-[#CBA358] font-bold">Visiting Examiner:</span>
                  <strong className="text-white">{currentUser?.name || 'Prof. Charles U. Eze'}</strong>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-stone-300">
                  <Building2 className="h-3 w-3 text-[#CBA358] shrink-0" />
                  <span className="truncate">Dept. of Computer Science</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  Viva Chamber Active
                </span>
              </div>
            </div>

            {/* Quick Responsive Stat Cards */}
            <div className="w-full lg:w-auto grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 lg:pt-0">
              <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-md p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 group shadow-inner">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 truncate">
                    Assigned
                  </span>
                  <div className="h-6 w-6 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-[#CBA358] shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
                    {externalCandidates.length}
                  </span>
                  <span className="text-[10px] font-bold text-stone-400 truncate">
                    Defenses
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1.5 truncate">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {externalCandidates.filter(c => c.status === 'Completed').length} of {externalCandidates.length} Graded
                  </span>
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-[#CBA358]/25 bg-[#CBA358]/[0.05] hover:bg-[#CBA358]/[0.08] backdrop-blur-md p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 group shadow-inner">
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#CBA358] truncate">
                    Benchmark
                  </span>
                  <div className="h-6 w-6 rounded-lg bg-[#CBA358]/15 border border-[#CBA358]/30 flex items-center justify-center text-[#CBA358] shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#CBA358] font-mono tracking-tight">
                    100
                  </span>
                  <span className="text-[10px] font-bold text-[#CBA358]/80 truncate">
                    Pts Scale
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium mt-1.5 truncate">
                  <span className="truncate">NUC Standard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION A: ASSIGNED DEFENSES GRID */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1A1A1A]">
                Assigned Candidates Docket
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Click any student card below to open their complete academic dossier, laboratory data, and access the statutory examiner grading form.
              </p>
            </div>
            <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              {externalCandidates.length} Active Sessions
            </span>
          </div>

          {externalCandidates.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-stone-300 bg-white p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 mb-3 shadow-xs">
                  <Award className="h-7 w-7 text-amber-800" />
                </div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">No Examination Candidates Assigned Yet</h3>
                <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
                  You currently have 0 assigned undergraduate candidates and 0 active projects for external viva voce moderation. Once students are allocated to your external examination docket by the Departmental Administration, their dissertations, plagiarism receipts, and viva scoring rubrics will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {externalCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => handleOpenCandidateEvaluation(candidate.id)}
                className="group relative rounded-[20px] p-5 sm:p-6 transition-all duration-200 cursor-pointer border bg-white border-stone-200 hover:border-[#CBA358] hover:shadow-md active:scale-[0.995]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-mono font-bold text-stone-700">
                        {candidate.matric}
                      </span>
                      <span className="rounded-full bg-[#CBA358]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#CBA358] border border-[#CBA358]/20">
                        {candidate.track}
                      </span>
                      {candidate.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          Scored ({candidate.externalScore}/100)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3" />
                          Awaiting Evaluation
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-extrabold text-[#1A1A1A] group-hover:text-[#CBA358] transition-colors truncate">
                      {candidate.name}
                    </h3>
                  </div>

                  <div className="h-8 w-8 rounded-full bg-stone-100 group-hover:bg-[#CBA358] text-stone-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>

                <p className="text-xs text-stone-600 mt-2.5 line-clamp-2 leading-relaxed font-medium">
                  {candidate.topic}
                </p>

                <div className="mt-4 pt-3.5 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{candidate.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span>{candidate.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2">
                    <MapPin className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{candidate.venue}</span>
                  </div>
                </div>

                {/* Benchmark badges */}
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-stone-500 pt-2.5 border-t border-stone-100/60">
                  <span>Supervisor: <strong className="text-stone-700">{candidate.supervisor}</strong></span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Similarity: {candidate.similarityIndex}%
                  </span>
                </div>

                {/* Action footer button */}
                <div className="mt-3.5 pt-3 border-t border-dashed border-stone-200/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setClearanceTargetCandidate({
                        name: candidate.name,
                        identifier: candidate.matric,
                        matric: candidate.matric,
                        projectTopic: candidate.topic,
                        assignedSupervisorName: candidate.supervisor,
                        department: 'Department of Computer Science',
                        faculty: 'Faculty of Computing',
                        institution: 'Abubakar Tafawa Balewa University, Bauchi (ATBU)',
                      });
                      setClearanceModalStage('external');
                      setIsClearanceModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-300/80 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <FileCheck className="h-3 w-3 text-purple-700" />
                    <span>External Slip</span>
                  </button>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#CBA358] group-hover:underline">
                    {candidate.status === 'Completed' ? 'View Graded Dossier' : 'Open Dossier & Grade'} →
                  </span>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER VIEW 2: ADMINISTRATOR DASHBOARD
  // =============================================================
  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Modern Luxury Obsidian & Gold Hero Card */}
      <div className="rounded-[22px] bg-gradient-to-br from-[#1c1c20] via-[#141417] to-[#0d0d0f] p-4.5 sm:p-6 md:p-8 text-white shadow-2xl border border-white/[0.08] ring-1 ring-white/[0.04] relative overflow-hidden">
        {/* Subtle Ambient Golden Radial Lighting */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-[#CBA358]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-16 w-60 h-60 bg-blue-500/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Micro Grid Background Accent */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          {/* Main Information Column */}
          <div className="flex-1 min-w-0">
            {/* Modern Frosted Badge with Live Pulse */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.1] px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-md text-[11px] sm:text-xs font-semibold text-stone-200 shadow-xs mb-3 sm:mb-3.5">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CBA358] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CBA358]"></span>
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
              <span className="truncate">Departmental Administration & Examination Registry</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
              System Administration & Oversight
            </h1>

            {/* Responsive Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-2.5 sm:mt-3 text-[11px] sm:text-xs text-stone-300">
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-stone-200">
                <Calendar className="h-3 w-3 text-[#CBA358] shrink-0" />
                <span>Session <strong className="text-white font-mono">2025/2026</strong></span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-stone-200">
                <Building2 className="h-3 w-3 text-[#CBA358] shrink-0" />
                <span className="truncate">Dept. of Computer Science</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 text-stone-400">
                <GraduationCap className="h-3 w-3 text-stone-400 shrink-0" />
                <span>Faculty of Computing</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Active Term
              </span>
            </div>
          </div>

          {/* Quick Responsive Stat Cards - Perfectly Sized 2-Col Grid on Mobile, Flex on Desktop */}
          <div className="w-full lg:w-auto grid grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 lg:pt-0">
            {/* Metric 1: Total Undergraduates */}
            <div className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur-md p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 group shadow-inner">
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-400 truncate">
                  Total Undergraduates
                </span>
                <div className="h-6 w-6 rounded-lg bg-stone-800/80 border border-stone-700/60 flex items-center justify-center text-[#CBA358] shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-mono tracking-tight">
                  48
                </span>
                <span className="text-[10px] font-bold text-stone-400 truncate">
                  Enrolled
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium mt-1.5 truncate">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                <span className="truncate">Roster Verified</span>
              </div>
            </div>

            {/* Metric 2: Faculty Quota */}
            <div className="min-w-0 rounded-2xl border border-[#CBA358]/25 bg-[#CBA358]/[0.05] hover:bg-[#CBA358]/[0.08] backdrop-blur-md p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 group shadow-inner">
              <div className="flex items-center justify-between gap-1.5 mb-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#CBA358] truncate">
                  Faculty Quota
                </span>
                <div className="h-6 w-6 rounded-lg bg-[#CBA358]/15 border border-[#CBA358]/30 flex items-center justify-center text-[#CBA358] shrink-0 group-hover:scale-105 transition-transform">
                  <UserCheck className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#CBA358] font-mono tracking-tight">
                  1 : 8
                </span>
                <span className="text-[10px] font-bold text-[#CBA358]/80 truncate">
                  Ratio
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-400 font-medium mt-1.5 truncate">
                <span className="truncate">8 Supervisees/Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADMIN LUXURY PILL / TAB NAVIGATION & ONBOARDING ACTION */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-[18px] bg-white p-1.5 border border-stone-200 shadow-xs max-w-full overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setAdminActiveTab('overview')}
            className={`flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
              adminActiveTab === 'overview'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>System Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveTab('scheduling')}
            className={`flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
              adminActiveTab === 'scheduling'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Defense Scheduling & Allocations</span>
            <span className="rounded-full bg-[#CBA358] text-[#1A1A1A] text-[10px] px-2 py-0.2 font-black">
              {scheduledSessionsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveTab('overrides')}
            className={`flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
              adminActiveTab === 'overrides'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Exceptions & Overrides</span>
            {overrideItems.filter(i => i.status === 'Pending').length > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-[10px] px-2 py-0.2 font-black">
                {overrideItems.filter(i => i.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAdminActiveTab('master_scores')}
            className={`flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-xs font-extrabold transition-all whitespace-nowrap ${
              adminActiveTab === 'master_scores'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Master Score Overview</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('user_access')}
            className="inline-flex items-center gap-2 rounded-[16px] border border-[#CBA358]/50 bg-[#FAF6ED] hover:bg-[#F3ECE0] text-[#1A1A1A] px-3.5 py-2.5 text-xs sm:text-sm font-extrabold shadow-2xs transition-all cursor-pointer"
            title="Assign staff roles, delegate Admin rights, and manage database permissions"
          >
            <Shield className="h-4 w-4 text-[#CBA358]" />
            <span>Assign Roles & Access</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOnboardingModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-[16px] bg-[#CBA358] hover:bg-[#b88e3e] active:scale-[0.98] text-[#1A1A1A] px-4 py-2.5 text-xs sm:text-sm font-extrabold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4 stroke-[2.5]" />
            <span>+ Onboard Faculty User</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {adminActiveTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Metric 1 */}
            <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Total Active Projects</span>
                <div className="h-9 w-9 rounded-[12px] bg-stone-100 flex items-center justify-center text-stone-700">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-[#1A1A1A] tracking-tight">48</p>
                <p className="text-[11px] text-stone-500 mt-1">4 academic specialization tracks</p>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Pending Topic Approvals</span>
                <div className="h-9 w-9 rounded-[12px] bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-amber-600 tracking-tight">5</p>
                <p className="text-[11px] text-stone-500 mt-1">Awaiting HOD & supervisor sign-off</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Upcoming Defenses</span>
                <div className="h-9 w-9 rounded-[12px] bg-[#CBA358]/10 flex items-center justify-center text-[#CBA358] border border-[#CBA358]/30">
                  <CalendarDays className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-[#CBA358] tracking-tight">12</p>
                <p className="text-[11px] text-stone-500 mt-1">Scheduled across Panels A, B, & External</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="rounded-[20px] bg-white p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">Similarity Compliance</span>
                <div className="h-9 w-9 rounded-[12px] bg-emerald-50 flex items-center justify-center text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-emerald-700 tracking-tight">94%</p>
                <p className="text-[11px] text-stone-500 mt-1">Turnitin indices under &lt;15% statutory threshold</p>
              </div>
            </div>
          </div>

          {/* Quick Audit & System Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Department Progress Distribution */}
            <div className="lg:col-span-2 rounded-[20px] bg-white p-6 border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#1A1A1A]">Project Stage Progression</h3>
                  <p className="text-xs text-stone-500">Cohort distribution across statutory milestones</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
                  2025/2026 Set
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-stone-700">Topic Formulation & Proposal Stage</span>
                    <span className="text-stone-900">14 Candidates (29%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '29%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-stone-700">Software Architecture Design & Prototype Implementation</span>
                    <span className="text-stone-900">20 Candidates (42%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-[#CBA358] rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-stone-700">Internal Defense & Dissertation Review</span>
                    <span className="text-stone-900">10 Candidates (21%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '21%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-stone-700">External Moderation & Viva Voce Cleared</span>
                    <span className="text-stone-900">4 Candidates (8%)</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Supervision Allocations */}
            <div className="rounded-[20px] bg-white p-6 border border-stone-200 shadow-xs">
              <h3 className="text-base font-extrabold text-[#1A1A1A] mb-1">Supervisor Quota Health</h3>
              <p className="text-xs text-stone-500 mb-4">Allocations relative to max ceiling (8)</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div>
                    <p className="font-extrabold text-stone-900">Dr. Kolawole O. Alabi</p>
                    <p className="text-[11px] text-stone-500">Artificial Intelligence</p>
                  </div>
                  <span className="font-mono font-bold text-stone-700 bg-white px-2 py-1 rounded-md border border-stone-200">
                    6 / 8
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div>
                    <p className="font-extrabold text-stone-900">Dr. Victor Adeyemi</p>
                    <p className="text-[11px] text-stone-500">Pharmaceutical Micro.</p>
                  </div>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    7 / 8
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div>
                    <p className="font-extrabold text-stone-900">Prof. Sarah N. Ibrahim</p>
                    <p className="text-[11px] text-stone-500">HOD / Computer Systems Architecture</p>
                  </div>
                  <span className="font-mono font-bold text-stone-700 bg-white px-2 py-1 rounded-md border border-stone-200">
                    5 / 6
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs">
                  <div>
                    <p className="font-extrabold text-stone-900">Dr. Aminu Salisu</p>
                    <p className="text-[11px] text-stone-500">Environmental Micro.</p>
                  </div>
                  <span className="font-mono font-bold text-stone-700 bg-white px-2 py-1 rounded-md border border-stone-200">
                    6 / 8
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEFENSE SCHEDULING & ALLOCATIONS */}
      {adminActiveTab === 'scheduling' && (
        <div className="space-y-6">
          {/* Scheduling Form (Dark-Themed Luxury Card) */}
          <div className="rounded-[20px] bg-[#1A1A1A] p-6 sm:p-8 text-white shadow-xl border border-stone-800">
            <div className="border-b border-stone-800 pb-5 mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358]/20 px-3 py-1 text-xs font-semibold text-[#CBA358] border border-[#CBA358]/30">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Defense Timetable & Panel Allocation Manager</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                Configure & Publish Defense Schedule
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Schedule statutory oral defenses across Proposal, Internal, and External Viva Voce stages with panel appointments.
              </p>
            </div>

            <form onSubmit={handlePublishSchedule} className="space-y-6">
              {/* Defense Stage Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
                  Select Defense Stage
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'proposal', label: 'Proposal Defense', sub: 'Protocol & Problem Statement' },
                    { key: 'internal', label: 'Internal Defense', sub: 'Benchwork & Chapters 1-5' },
                    { key: 'external', label: 'External Viva Voce', sub: 'Senate Final Moderation' }
                  ].map(stage => (
                    <button
                      key={stage.key}
                      type="button"
                      onClick={() => setScheduleStage(stage.key)}
                      className={`rounded-[16px] p-4 text-left transition-all border ${
                        scheduleStage === stage.key
                          ? 'bg-[#CBA358] text-[#1A1A1A] border-[#CBA358] shadow-md font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{stage.label}</p>
                      <p className={`text-[10px] mt-0.5 ${scheduleStage === stage.key ? 'text-stone-900/80' : 'text-stone-500'}`}>
                        {stage.sub}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Candidate Selection */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-stone-200 mb-1.5">
                    Select Undergraduate Candidate
                  </label>
                  <select
                    value={scheduleStudent || 'Amina Bello (CSC/2021/0482)'}
                    onChange={(e) => setScheduleStudent(e.target.value)}
                    className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                  >
                    <option value="Amina Bello (CSC/2021/0482)">Amina Bello (CSC/2021/0482) – Artificial Intelligence</option>
                    <option value="Chukwudi Nnamdi Okafor (CSC/2021/0511)">Chukwudi Nnamdi Okafor (CSC/2021/0511) – Software Engineering</option>
                    <option value="Ibrahim Musa Farouk (CSC/2021/0445)">Ibrahim Musa Farouk (CSC/2021/0445) – Network Security & ML</option>
                    <option value="Zainab Kabir Usman (CSC/2021/0390)">Zainab Kabir Usman (CSC/2021/0390) – Cybersecurity</option>
                    <option value="Blessing Okon (CSC/2021/0308)">Blessing Okon (CSC/2021/0308) – Data Science & Distributed Systems</option>
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-200 mb-1.5">
                    Defense Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate || ''}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                    required
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-xs font-extrabold text-stone-200 mb-1.5">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={scheduleTime || ''}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    placeholder="e.g. 10:00 AM – 11:30 AM"
                    className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                    required
                  />
                </div>

                {/* Venue (Manual Entry) */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-extrabold text-stone-200">
                      Defense Hall / Venue (Manual Entry)
                    </label>
                    <span className="text-[10px] text-[#CBA358] font-bold">Physical or Virtual</span>
                  </div>
                  <input
                    type="text"
                    value={scheduleVenue || ''}
                    onChange={(e) => setScheduleVenue(e.target.value)}
                    placeholder="Type defense hall/venue manually (e.g. Computing Boardroom 102, Hall 3B)"
                    className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-stone-400 font-semibold self-center">Presets:</span>
                    {[
                      'Computing Boardroom 102',
                      'Postgraduate Seminar Room 1',
                      'Distributed Systems & Cloud Computing Lab Suite',
                      'Faculty Lecture Theater A',
                      'Senate Conference Hall'
                    ].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setScheduleVenue(h)}
                        className={`rounded-lg px-2 py-0.5 text-[10px] transition-colors ${
                          scheduleVenue === h
                            ? 'bg-[#CBA358] text-[#1A1A1A] font-bold'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Panel Chair / Lead Examiner (Manual Entry) */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-extrabold text-stone-200 mb-1.5">
                    Panel Chair / Lead Examiner (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={schedulePanelLead || ''}
                    onChange={(e) => setSchedulePanelLead(e.target.value)}
                    placeholder="Type lead examiner name & title manually"
                    className="w-full rounded-xl bg-stone-800 border border-stone-700 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-stone-400 font-semibold self-center">Presets:</span>
                    {[
                      'Prof. Sarah N. Ibrahim (HOD / Chair)',
                      'Prof. Charles U. Eze (Visiting External)',
                      'Dr. Victor Adeyemi (Associate Professor)',
                      'Dr. Aminu Salisu (Senior Lecturer)'
                    ].map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setSchedulePanelLead(ch)}
                        className={`rounded-lg px-2 py-0.5 text-[10px] transition-colors ${
                          schedulePanelLead === ch
                            ? 'bg-[#CBA358] text-[#1A1A1A] font-bold'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                      >
                        {ch.split('(')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appoint Committee Examiners (Manual Entry) */}
                <div className="lg:col-span-3 rounded-2xl bg-stone-900/90 border border-stone-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#CBA358] uppercase tracking-wider block">
                        Appoint Defense Panel Examiners (Manual Entry)
                      </span>
                      <p className="text-[11px] text-stone-400">
                        Add internal or external examiners to this candidate's oral examination roster.
                      </p>
                    </div>
                    <span className="rounded-full bg-stone-800 border border-stone-700 px-2.5 py-0.5 text-[11px] font-bold text-stone-200">
                      {scheduleExaminersList.length} Appointed
                    </span>
                  </div>

                  {/* Examiners List */}
                  {scheduleExaminersList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {scheduleExaminersList.map((examiner, exIdx) => (
                        <span
                          key={exIdx}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-stone-800 border border-stone-700 px-3 py-1 text-xs text-white"
                        >
                          <Award className="h-3.5 w-3.5 text-[#CBA358]" />
                          <span>{examiner}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveScheduleExaminer(exIdx)}
                            className="text-stone-400 hover:text-rose-400 ml-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-500 italic">No additional examiners added yet.</p>
                  )}

                  {/* Manual Examiner Add Row */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <input
                      type="text"
                      value={scheduleNewExaminerName || ''}
                      onChange={(e) => setScheduleNewExaminerName(e.target.value)}
                      placeholder="Type examiner name & title manually (e.g. Dr. Aminu Salisu)"
                      className="flex-1 rounded-xl bg-stone-800 border border-stone-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CBA358]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddScheduleExaminer();
                        }
                      }}
                    />
                    <select
                      value={scheduleNewExaminerRole || 'Internal Examiner'}
                      onChange={(e) => setScheduleNewExaminerRole(e.target.value)}
                      className="rounded-xl bg-stone-800 border border-stone-700 px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-[#CBA358]"
                    >
                      <option value="Internal Examiner">Internal Examiner</option>
                      <option value="External Examiner">External Examiner</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Moderator">Moderator</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddScheduleExaminer}
                      className="rounded-xl bg-[#CBA358] hover:bg-[#b99247] px-4 py-2 text-xs font-bold text-[#1A1A1A] transition-all shadow-md shrink-0"
                    >
                      + Add Examiner
                    </button>
                  </div>

                  {/* Quick Suggestions */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-stone-500 font-semibold self-center">Faculty Shortcuts:</span>
                    {[
                      { name: 'Dr. Kolawole O. Alabi', role: 'Supervisor' },
                      { name: 'Dr. Victor Adeyemi', role: 'Internal Examiner' },
                      { name: 'Dr. Aminu Salisu', role: 'Internal Examiner' },
                      { name: 'Prof. Charles U. Eze', role: 'External Examiner (UNILAG)' },
                      { name: 'Dr. (Mrs) T. E. Johnson', role: 'Internal Examiner' },
                    ].map(f => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => {
                          const formatted = `${f.name} (${f.role})`;
                          if (!scheduleExaminersList.includes(formatted)) {
                            setScheduleExaminersList(prev => [...prev, formatted]);
                          }
                        }}
                        className="rounded-lg bg-stone-800/80 hover:bg-stone-700 px-2 py-0.5 text-[10px] text-stone-300 transition-colors"
                      >
                        + {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="lg:col-span-3 flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#CBA358] hover:bg-[#b99247] px-8 py-3 text-xs font-bold text-[#1A1A1A] transition-all shadow-md active:scale-98"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>Publish Defense Schedule</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Published Defense Sessions Docket */}
          <div className="rounded-[20px] bg-white p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Published Defense Docket</h3>
                <p className="text-xs text-stone-500">Live roster of all approved examination sessions across departments</p>
              </div>
              <span className="text-xs font-bold text-stone-500">
                {scheduledSessionsList.length} Sessions Active
              </span>
            </div>

            <div className="space-y-3.5">
              {scheduledSessionsList.map((session) => (
                <div
                  key={session.id}
                  className="rounded-[16px] p-5 border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#1A1A1A] text-white text-[10px] font-extrabold px-2.5 py-0.5">
                          {session.stage}
                        </span>
                        <span className="text-sm font-bold text-stone-900">{session.studentName}</span>
                        <span className="text-[11px] font-mono text-stone-500">({session.matric})</span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium line-clamp-1">{session.topic}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold px-2.5 py-0.5">
                        {session.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast(`Notified Panel Lead & Supervisee for ${session.id}`)}
                        className="rounded-full bg-white border border-stone-200 px-3 py-1 text-xs font-bold text-stone-700 hover:bg-stone-100 shadow-2xs"
                      >
                        Notify
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60 text-xs">
                    <div className="flex items-center gap-2 text-stone-700">
                      <MapPin className="h-4 w-4 text-[#CBA358] shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Defense Venue / Hall</span>
                        <strong className="text-stone-900">{session.venue}</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-stone-700">
                      <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Date & Time</span>
                        <strong className="text-stone-900">{session.date} at {session.time}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Appointed Committee */}
                  <div className="bg-white rounded-xl p-3 border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-800">
                      <Award className="h-3.5 w-3.5 text-[#CBA358]" />
                      <span>Panel Lead:</span>
                      <span className="text-blue-900">{session.panelLead}</span>
                    </div>
                    {session.examiners && session.examiners.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
                        <span className="text-stone-500 font-semibold">Examiners:</span>
                        {session.examiners.map((ex, exI) => (
                          <span key={exI} className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-700 text-[10px] font-medium border border-stone-200">
                            {ex}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXCEPTION & OVERRIDE MANAGEMENT */}
      {adminActiveTab === 'overrides' && (
        <div className="space-y-6">
          <div className="rounded-[20px] bg-white p-6 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Exception & Clearance Override Queue</h3>
                <p className="text-xs text-stone-500">
                  Review and arbitrate departmental clearance bottlenecks, similarity index threshold appeals, and biosafety protocols.
                </p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-800 border border-amber-200">
                {overrideItems.filter(i => i.status === 'Pending').length} Pending Requests
              </span>
            </div>

            <div className="space-y-4">
              {overrideItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[18px] p-5 border border-stone-200 bg-white hover:border-stone-300 transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-200">
                          {item.issueType}
                        </span>
                        <h4 className="text-sm font-extrabold text-[#1A1A1A]">{item.studentName}</h4>
                        <span className="text-xs font-mono text-stone-400">({item.matric})</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed mt-1">
                        {item.details}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-2">
                        Forwarded by: <strong className="text-stone-700">{item.submittedBy}</strong> · {item.date}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      {item.status === 'Pending' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOverrideDecision(item.id, 'Approved')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition-colors shadow-xs active:scale-98"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve Waiver</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOverrideDecision(item.id, 'Rejected')}
                            className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 hover:bg-stone-200 px-4 py-2 text-xs font-bold text-stone-700 transition-colors active:scale-98"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {item.status} by Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MASTER SCORE OVERVIEW */}
      {adminActiveTab === 'master_scores' && (
        <div className="space-y-6">
          <div className="rounded-[20px] bg-white p-6 border border-stone-200 shadow-xs">
            {/* Header & Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-extrabold text-[#1A1A1A]">Consolidated Master Scores Registry</h3>
                <p className="text-xs text-stone-500">
                  Senate-approved cumulative scoring across Proposal (20%), Internal (30%), and External Viva Voce (50%)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={masterScoreSearch || ''}
                    onChange={(e) => setMasterScoreSearch(e.target.value)}
                    placeholder="Search candidate, matric, supervisor..."
                    className="rounded-full bg-stone-50 border border-stone-200 pl-8 pr-4 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#CBA358]"
                  />
                </div>

                <select
                  value={masterScoreStageFilter || 'All'}
                  onChange={(e) => setMasterScoreStageFilter(e.target.value)}
                  className="rounded-full bg-stone-50 border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-700 focus:outline-none focus:border-[#CBA358]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Graduated">Fully Moderated (External Scored)</option>
                  <option value="Pending">Pending External Viva</option>
                </select>

                <DownloadReportButton
                  project={{
                    name: 'Computer Science Undergraduate Project Master Scores',
                    department: 'Department of Computer Science',
                    institution: 'University Academic Registry',
                    session: '2025/2026',
                    status: 'Senate Moderation in Progress'
                  }}
                  milestones={filteredMasterScores.map((row, i) => ({
                    id: row.matric,
                    title: `${row.name} (${row.matric})`,
                    status: row.status,
                    completed: row.externalScore !== null,
                    badge: `Grade ${row.finalGrade}`,
                    details: `Weighted: ${row.totalWeighted}% (Proposal: ${row.proposalScore}%, Internal: ${row.internalScore}%, External: ${row.externalScore ?? 'Pending'}) · Supervisor: ${row.supervisor}`
                  }))}
                  variant="dark"
                  size="sm"
                  onDownloaded={(fmt) => showToast(`Exported Departmental Master Scores as ${fmt}.`)}
                />

                <button
                  type="button"
                  onClick={() => setActiveView('senate_broadsheet')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#CBA358] hover:bg-[#b58f44] px-3.5 py-1.5 text-xs font-black text-stone-950 shadow-2xs transition-all active:scale-95"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Senate Broadsheet</span>
                </button>
              </div>
            </div>

            {/* Statutory Scoring Rubric Components Card */}
            <div className="mb-6 rounded-2xl border border-stone-200 bg-[#FAF8F5] p-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#CBA358]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                    Statutory Project Scoring System (100 Marks Benchmark)
                  </h4>
                </div>
                <span className="text-[11px] font-mono font-bold text-stone-600 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                  Senate Regulation · NUC Benchmark
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-stone-500">1. Software Design & Quality</div>
                  <div className="text-base font-black text-blue-700 mt-0.5">30 Marks</div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Architecture, algorithm efficiency, code quality, testbed</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-stone-500">2. Presentation</div>
                  <div className="text-base font-black text-emerald-700 mt-0.5">20 Marks</div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Oral delivery, visual slide clarity, defense poise, timing</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-stone-500">3. Project Reports & Docs</div>
                  <div className="text-base font-black text-purple-700 mt-0.5">30 Marks</div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Dissertation chapters 1–5, Turnitin &lt;15%, IEEE citations</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-stone-500">4. Response to Questions</div>
                  <div className="text-base font-black text-amber-700 mt-0.5">20 Marks</div>
                  <p className="text-[10px] text-stone-400 mt-0.5">Viva voce inquiry handling, CS fundamentals mastery</p>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-[11px] uppercase font-bold text-stone-500 border-y border-stone-200">
                  <tr>
                    <th className="py-3 px-3">Candidate & Matric</th>
                    <th className="py-3 px-3">Internal Supervisor</th>
                    <th className="py-3 px-3 text-center">Proposal (20%)</th>
                    <th className="py-3 px-3 text-center">Internal (30%)</th>
                    <th className="py-3 px-3 text-center">External Viva (50%)</th>
                    <th className="py-3 px-3 text-center">Weighted Score</th>
                    <th className="py-3 px-3 text-center">Grade</th>
                    <th className="py-3 px-3 text-right">Actions / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMasterScores.map((row) => (
                    <tr key={row.matric} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-extrabold text-[#1A1A1A]">{row.name}</p>
                        <p className="font-mono text-[11px] text-stone-400">{row.matric}</p>
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-700">
                        {row.supervisor}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-800">
                        {row.proposalScore}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-stone-800">
                        {row.internalScore}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold">
                        {row.externalScore !== null ? (
                          <span className="text-[#CBA358]">{row.externalScore}</span>
                        ) : (
                          <span className="text-stone-300 font-normal italic">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-black text-[#1A1A1A] text-sm">
                        {row.totalWeighted}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-black ${
                          row.finalGrade === 'A' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-[#CBA358]/10 text-[#CBA358] border border-[#CBA358]/30'
                        }`}>
                          {row.finalGrade}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setClearanceTargetCandidate({
                                name: row.name,
                                identifier: row.matric,
                                matric: row.matric,
                                assignedSupervisorName: row.supervisor,
                                department: 'Department of Computer Science',
                                faculty: 'Faculty of Computing',
                                institution: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)'
                              });
                              setClearanceModalStage('proposal');
                              setIsClearanceModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer shadow-2xs"
                            title="Inspect Proposal Defense Slip and Rubric Scores"
                          >
                            <FileCheck className="h-3 w-3 text-amber-700" />
                            <span>Proposal Slip</span>
                          </button>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            row.status.includes('Passed')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {row.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile-Friendly Stacked Cards */}
            <div className="md:hidden space-y-3">
              {filteredMasterScores.map((row) => (
                <div key={row.matric} className="rounded-[16px] border border-stone-200 p-4 bg-stone-50/40 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-[#1A1A1A]">{row.name}</p>
                      <p className="font-mono text-xs text-stone-400">{row.matric}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      row.status.includes('Passed')
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {row.status}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500">
                    Supervisor: <strong className="text-stone-700">{row.supervisor}</strong>
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-stone-200">
                    <div className="rounded-lg bg-white p-2 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Proposal</span>
                      <span className="font-mono font-bold text-stone-800">{row.proposalScore}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">Internal</span>
                      <span className="font-mono font-bold text-stone-800">{row.internalScore}</span>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold">External</span>
                      <span className="font-mono font-bold text-[#CBA358]">
                        {row.externalScore !== null ? row.externalScore : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-bold text-stone-600">Weighted Total:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#1A1A1A]">{row.totalWeighted}</span>
                      <span className="rounded-md bg-emerald-50 text-emerald-800 px-2 py-0.5 font-black text-xs border border-emerald-200">
                        {row.finalGrade}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Admin Onboarding Modal */}
      <AdminOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />

      {/* Official Statutory Defense Clearance Modal (Proposal, Internal, and External Defense) */}
      <DefenseClearanceFormModal
        isOpen={isClearanceModalOpen}
        candidate={clearanceTargetCandidate}
        candidateMatric={clearanceTargetCandidate?.matric || clearanceTargetCandidate?.identifier}
        initialStage={clearanceModalStage}
        onClose={() => {
          setIsClearanceModalOpen(false);
          setClearanceTargetCandidate(null);
        }}
      />
    </div>
  );
};
