export type UserRole = 
  | 'student' 
  | 'internal_supervisor' 
  | 'panel_member' 
  | 'external_supervisor' 
  | 'admin';

export interface UserAccount {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  gender?: string;
  email: string;
  password?: string;
  role: UserRole;
  identifier: string; // Matric or Staff ID
  department: string;
  faculty: string;
  avatar: string;
  title?: string;
  specialization?: string;
  projectTopic?: string;
  status?: string;
  level?: string;
  institution?: string;
  panelCode?: string;
  academicRank?: string;
  supervisorQuota?: number;
  phone?: string;
  createdAt: string;
  isActive?: boolean;
  hasUploadedProject?: boolean;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedExternalSupervisorId?: string;
  assignedExternalSupervisorName?: string;
  temporaryPassword?: string;
  mustResetPassword?: boolean;
  passwordResetAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  gender?: string;
  phone?: string;
  academicRank?: string;
  role: UserRole;
  identifier: string; // Matric or Staff ID
  email: string;
  department: string;
  faculty: string;
  avatar: string;
  title?: string;
  specialization?: string;
  projectTopic?: string;
  status?: string;
}

export interface RoleSummaryMetric {
  id: string;
  label: string;
  value: string;
  subtitle: string;
  iconName: string;
  iconBgClass: string;
  iconTextClass: string;
  badge?: string;
  badgeVariant?: 'success' | 'warning' | 'neutral' | 'danger';
  change?: string;
  variant?: 'success' | 'warning' | 'neutral' | 'danger' | 'info';
  sublabel?: string;
}

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  badge?: string;
  badgeVariant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'topic' | 'defense' | 'document' | 'clearance' | 'system';
  priority: 'low' | 'normal' | 'high';
  actionLabel?: string;
  targetView?: string;
}

export interface StudentProjectData {
  matric: string;
  studentName: string;
  department: string;
  topicTitle: string;
  topicStatus: 'Approved' | 'Pending Review' | 'Revision Required' | 'Rejected' | 'Not Submitted';
  hasUploadedProject?: boolean;
  supervisorName: string;
  supervisorStaffId: string;
  coSupervisorName?: string;
  phase: string;
  overallProgressPercent: number;
  problemStatement: string;
  researchObjectives: string[];
  submissionStatus: {
    chapter1: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision';
    chapter2: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision';
    chapter3: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision';
    chapter4: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision';
    chapter5: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision';
  };
  clearance: {
    ethicalApproval: boolean;
    plagiarismRate: number; // e.g., 11%
    supervisorSignOff: boolean;
    departmentalClearance: boolean;
    panelCleared: boolean;
  };
  scores: {
    proposalDefense?: number;
    internalDefense?: number;
    finalDefense?: number;
    grade?: string;
  };
}

export interface MeetingRecord {
  id: string;
  studentMatric: string;
  studentName: string;
  supervisorName: string;
  date: string;
  time: string;
  agenda: string;
  actionItems: string;
  status: 'Completed' | 'Scheduled' | 'Rescheduled';
  mode: 'In-Person (Office 304)' | 'Virtual (Google Meet)' | 'Lab 2' | 'In-Person (Office 214)';
}

export interface DefenseSession {
  id: string;
  sessionCode: string;
  type: 'Proposal Defense' | 'Internal Defense' | 'Final External Defense';
  candidateName: string;
  candidateMatric: string;
  topic: string;
  date: string;
  time: string;
  venue: string;
  panelChair: string;
  members: string[];
  status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Pending Score';
  score?: number;
  scores?: ProjectScoreRubric;
}

export interface DocumentSubmission {
  id: string;
  studentId?: string;
  studentMatric?: string;
  studentName?: string;
  chapter: string;
  title: string;
  version: string;
  dateSubmitted: string;
  status: 'Approved' | 'Under Review' | 'Pending' | 'Needs Revision' | 'Requires Correction' | 'Pending Review';
  fileSize?: string;
  notes?: string;
  authorRemarks?: string;
  supervisorRemarks?: string;
  category?: string;
  fileName?: string;
  fileUrl?: string;
  fileBlob?: Blob | File;
  fileType?: string;
}

export interface StudentMilestone {
  id: string;
  title: string;
  category?: string;
  completed: boolean;
  date?: string;
  weight?: number;
  remarks?: string;
}

export interface SupervisorStudent {
  id?: string;
  matric: string;
  name: string;
  topic: string;
  stage: string;
  progress: number;
  similarityIndex: number;
  status: string;
  lastMeeting: string;
  clearanceStatus: string;
  track?: string;
  milestones?: StudentMilestone[];
}

export interface ExternalCandidate {
  id: string;
  matric: string;
  name: string;
  track: string;
  topic: string;
  abstract: string;
  date: string;
  time: string;
  venue: string;
  supervisor: string;
  internalScore: number | null;
  status: string;
  externalScore: number | null;
  similarityIndex: number;
  pages: number;
  ethicsCode: string;
  labLogbook: string;
  documents: Array<{ name: string; size: string; type: string; date: string }>;
  milestones: Array<{ stage: string; date: string; status: string }>;
  savedScores?: {
    softwareDesign?: number;
    presentation?: number;
    projectReports?: number;
    responseToQuestions?: number;
    originality?: number;
    scientificRigor?: number;
    dissertationQuality?: number;
    vivaDefense?: number;
  };
  savedRecommendation?: string;
  savedComments?: string;
}

export interface SenateBroadsheetEntry {
  id: string;
  matric: string;
  name: string;
  topic: string;
  supervisor: string;
  track?: string;
  supervisorScore: number; // Max 40
  internalScore: number;   // Max 30
  externalScore: number;   // Max 30
  totalScore: number;      // Max 100
  letterGrade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  gradePoint: number;      // 0.0 to 5.0
  classification: 'First Class' | 'Second Class (Upper)' | 'Second Class (Lower)' | 'Third Class' | 'Pass' | 'Fail';
  similarityIndex: number;
  status: 'Recommended for Senate Approval' | 'Subject to Corrections' | 'Awaiting Sign-off' | 'Resit Required';
  remarks?: string;
  endorsedByHOD?: boolean;
  endorsedByExternal?: boolean;
}

export type DefenseStage = 'proposal' | 'internal' | 'external';

export interface DefenseCriterion {
  id: string;
  criterion: string;
  approved: boolean; // true = Yes, false = No
}

export interface ProjectScoreRubric {
  softwareDesign: number;      // Max 30 marks (Software Design & Quality)
  presentation: number;        // Max 20 marks (Presentation)
  projectReports: number;      // Max 30 marks (Project Reports & Documentation)
  responseToQuestions: number; // Max 20 marks (Response to Questions)
  totalScore?: number;         // Max 100 marks
  letterGrade?: string;        // 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface DefenseClearanceForm {
  id: string;
  candidateMatric: string;
  candidateName: string;
  programme: string;
  level: string;
  supervisorName: string;
  supervisorId?: string;
  projectTitle: string;
  defenseType: DefenseStage;
  institutionName?: string;
  facultyName?: string;
  departmentName?: string;
  formTitle?: string;
  criteria: DefenseCriterion[];
  scores?: ProjectScoreRubric;
  recommendation: 'cleared' | 'not_cleared';
  comments: string;
  evaluatorName: string;
  evaluatorRole: string;
  date: string;
  signature: string;
  status: 'Draft' | 'Endorsed' | 'Rejected';
  endorsedAt?: string;
  updatedAt: string;
  createdAt: string;
}


