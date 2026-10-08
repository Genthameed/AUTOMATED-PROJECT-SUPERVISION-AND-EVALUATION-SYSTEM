import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, UserProfile, UserAccount, NotificationItem, StudentProjectData, MeetingRecord, DefenseSession, DocumentSubmission, SupervisorStudent, ExternalCandidate, SenateBroadsheetEntry, DefenseClearanceForm, DefenseStage } from '../types';
import { ROLE_PROFILES, DEFAULT_ACCOUNTS, INITIAL_NOTIFICATIONS, MOCK_STUDENT_PROJECT, EMPTY_STUDENT_PROJECT, MOCK_MEETINGS, MOCK_DEFENSE_SESSIONS, MOCK_SUPERVISOR_STUDENTS, MOCK_DOCUMENT_SUBMISSIONS, DEFAULT_EXTERNAL_CANDIDATES, DEFAULT_SENATE_BROADSHEET } from '../data/mockData';
import { ROLE_ICONIC_AVATARS, normalizeIconicAvatar } from '../utils/iconicAvatars';
import {
  cloudSaveAccount,
  cloudDeleteAccount,
  cloudSaveProject,
  cloudSaveDocument,
  cloudSaveMeeting,
  cloudSaveDefenseSession,
  cloudSaveExternalCandidate,
  cloudSaveSenateBroadsheetEntry,
  cloudSaveClearanceForm,
  cloudFetchAllClearanceForms,
  subscribeToCloudDatabase,
  seedInitialDataIfEmpty,
  loginWithGoogle,
  logoutGoogle,
  fetchAccountsFromCloud,
  CloudSyncStatus
} from '../firebase/firestoreSync';

const ACCOUNTS_STORAGE_KEY = 'MCB_PROJECT_ACCOUNTS_V2';
const ACTIVE_USER_STORAGE_KEY = 'MCB_ACTIVE_USER_V2';
const DEFENSE_CLEARANCES_STORAGE_KEY = 'MCB_DEFENSE_CLEARANCES_V2';

export const DEFAULT_DEFENSE_CLEARANCES: DefenseClearanceForm[] = [
  {
    id: 'clr_20_55777U_1_proposal',
    candidateMatric: '20/55777U/1',
    candidateName: 'Mariya Isa',
    programme: 'B.Sc Computer Science',
    level: '400 Level',
    supervisorName: 'Dr. Ismail Zahradeen Yakubu',
    supervisorId: 'usr_sup_ismail',
    projectTitle: 'Smart Industrial Environmental Theft Monitoring System Standard Cost Estimate',
    defenseType: 'proposal',
    institutionName: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
    facultyName: 'FACULTY OF COMPUTING',
    departmentName: 'DEPARTMENT OF COMPUTER SCIENCE',
    formTitle: 'FINAL YEAR PROJECT PROPOSAL DEFENSE CLEARANCE FORM',
    criteria: [
      { id: 'crit_proposal_1', criterion: 'Title approved', approved: true },
      { id: 'crit_proposal_2', criterion: 'Template followed', approved: true },
      { id: 'crit_proposal_3', criterion: 'Introduction satisfactory', approved: true },
      { id: 'crit_proposal_4', criterion: 'Background adequate', approved: true },
      { id: 'crit_proposal_5', criterion: 'Problem statement clear', approved: true },
      { id: 'crit_proposal_6', criterion: 'Motivation appropriate', approved: true },
      { id: 'crit_proposal_7', criterion: 'Objectives clear', approved: true },
      { id: 'crit_proposal_8', criterion: 'Scope defined', approved: true },
      { id: 'crit_proposal_9', criterion: 'Methodology sound', approved: true },
      { id: 'crit_proposal_10', criterion: 'Literature adequate', approved: true },
      { id: 'crit_proposal_11', criterion: 'References correct', approved: true },
      { id: 'crit_proposal_12', criterion: 'Formatting satisfactory', approved: true },
      { id: 'crit_proposal_13', criterion: 'Suitable for defense', approved: true },
    ],
    scores: {
      softwareDesign: 24,
      presentation: 16,
      projectReports: 23,
      responseToQuestions: 15,
      totalScore: 78,
      letterGrade: 'A'
    },
    recommendation: 'cleared',
    comments: 'Satisfactory. Candidate has articulated project objectives with exceptional clarity.',
    evaluatorName: 'Dr. Ismail Zahradeen Yakubu',
    evaluatorRole: 'Internal Project Supervisor',
    date: '23 August 2026',
    signature: 'Dr. Ismail Zahradeen Yakubu',
    status: 'Endorsed',
    endorsedAt: '2026-08-23T10:30:00Z',
    updatedAt: '2026-08-23T10:30:00Z',
    createdAt: '2026-08-23T10:30:00Z',
  },
  {
    id: 'clr_20_55777U_1_internal',
    candidateMatric: '20/55777U/1',
    candidateName: 'Mariya Isa',
    programme: 'B.Sc Computer Science',
    level: '400 Level',
    supervisorName: 'Dr. Ismail Zahradeen Yakubu',
    supervisorId: 'usr_sup_ismail',
    projectTitle: 'Smart Industrial Environmental Theft Monitoring System Standard Cost Estimate',
    defenseType: 'internal',
    institutionName: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
    facultyName: 'FACULTY OF COMPUTING',
    departmentName: 'DEPARTMENT OF COMPUTER SCIENCE',
    formTitle: 'FINAL YEAR PROJECT INTERNAL DEFENSE CLEARANCE FORM',
    criteria: [
      { id: 'crit_internal_1', criterion: 'Proposal defense corrections effected', approved: true },
      { id: 'crit_internal_2', criterion: 'Template & dissertation guideline followed', approved: true },
      { id: 'crit_internal_3', criterion: 'Chapter 1-3 methodology & experimental design implemented', approved: true },
      { id: 'crit_internal_4', criterion: 'Laboratory benchwork / system implementation verified', approved: true },
      { id: 'crit_internal_5', criterion: 'Results & empirical data analysis sound', approved: true },
      { id: 'crit_internal_6', criterion: 'Similarity index (Turnitin) within threshold (<15%)', approved: true },
      { id: 'crit_internal_7', criterion: 'Discussion aligns with research objectives', approved: true },
      { id: 'crit_internal_8', criterion: 'Ethical and biosafety clearances verified', approved: true },
      { id: 'crit_internal_9', criterion: 'References & bibliography formatted correctly', approved: true },
      { id: 'crit_internal_10', criterion: 'Presentation slides and viva preparedness adequate', approved: true },
      { id: 'crit_internal_11', criterion: 'Formatting & binding guidelines satisfied', approved: true },
      { id: 'crit_internal_12', criterion: 'Suitable for defense', approved: true },
    ],
    scores: {
      softwareDesign: 26,
      presentation: 17,
      projectReports: 25,
      responseToQuestions: 16,
      totalScore: 84,
      letterGrade: 'A'
    },
    recommendation: 'cleared',
    comments: 'Satisfactory. System implementation verified and benchmark performance matches design specifications.',
    evaluatorName: 'Dr. Ismail Zahradeen Yakubu',
    evaluatorRole: 'Internal Project Supervisor',
    date: '15 September 2026',
    signature: 'Dr. Ismail Zahradeen Yakubu',
    status: 'Endorsed',
    endorsedAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-15T11:00:00Z',
    createdAt: '2026-09-15T11:00:00Z',
  },
  {
    id: 'clr_20_55777U_1_external',
    candidateMatric: '20/55777U/1',
    candidateName: 'Mariya Isa',
    programme: 'B.Sc Computer Science',
    level: '400 Level',
    supervisorName: 'Dr. Ismail Zahradeen Yakubu',
    supervisorId: 'usr_sup_ismail',
    projectTitle: 'Smart Industrial Environmental Theft Monitoring System Standard Cost Estimate',
    defenseType: 'external',
    institutionName: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
    facultyName: 'FACULTY OF COMPUTING',
    departmentName: 'DEPARTMENT OF COMPUTER SCIENCE',
    formTitle: 'FINAL YEAR PROJECT EXTERNAL DEFENSE CLEARANCE / ASSESSMENT FORM',
    criteria: [
      { id: 'crit_external_1', criterion: 'Internal defense panel corrections incorporated', approved: true },
      { id: 'crit_external_2', criterion: 'Complete thesis dissertation manuscript submitted', approved: true },
      { id: 'crit_external_3', criterion: 'Scientific & research originality demonstrated', approved: true },
      { id: 'crit_external_4', criterion: 'Research contribution to field established', approved: true },
      { id: 'crit_external_5', criterion: 'Methodology and analytical data reproducibility verified', approved: true },
      { id: 'crit_external_6', criterion: 'Turnitin plagiarism compliance certificate attached', approved: true },
      { id: 'crit_external_7', criterion: 'Oral viva defense presentation poise satisfactory', approved: true },
      { id: 'crit_external_8', criterion: 'Candidate defended questions & critiques convincingly', approved: true },
      { id: 'crit_external_9', criterion: 'Laboratory logbook & source code repository endorsed', approved: true },
      { id: 'crit_external_10', criterion: 'References, citations & appendices verified', approved: true },
      { id: 'crit_external_11', criterion: 'Formatting and university bindery standards met', approved: true },
      { id: 'crit_external_12', criterion: 'Suitable for defense', approved: true },
    ],
    scores: {
      softwareDesign: 27,
      presentation: 18,
      projectReports: 26,
      responseToQuestions: 17,
      totalScore: 88,
      letterGrade: 'A'
    },
    recommendation: 'cleared',
    comments: 'Candidate demonstrated commendable defense and defended the empirical cost estimation algorithm with high competence.',
    evaluatorName: 'Prof. Charles U. Eze',
    evaluatorRole: 'External Examiner',
    date: '28 October 2026',
    signature: 'Prof. Charles U. Eze',
    status: 'Endorsed',
    endorsedAt: '2026-10-28T14:15:00Z',
    updatedAt: '2026-10-28T14:15:00Z',
    createdAt: '2026-10-28T14:15:00Z',
  }
];

export interface AdminOnboardInput {
  name: string;
  role: UserRole;
  identifier?: string; // Matric or Staff ID
  email?: string;
  projectTopic: string;
  department?: string;
  faculty?: string;
  isActive?: boolean;
  assignedSupervisorId?: string;
  assignedSupervisorName?: string;
  assignedExternalSupervisorId?: string;
  assignedExternalSupervisorName?: string;
  institution?: string;
  specialization?: string;
  password?: string;
  temporaryPassword?: string;
  mustResetPassword?: boolean;
}

interface AppContextType {
  currentUser: UserAccount | null;
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  login: (identifierOrEmail: string, password: string, role?: UserRole) => { success: boolean; isPending?: boolean; mustResetPassword?: boolean; message: string; user?: UserAccount };
  register: (accountData: Omit<UserAccount, 'id' | 'createdAt'>) => { success: boolean; isPending?: boolean; message: string; user?: UserAccount };
  logout: () => void;
  toggleUserStatus: (userId: string, newStatus?: boolean, reason?: string) => { success: boolean; message: string };
  activateUser: (userId: string) => { success: boolean; message: string };
  deleteUser: (userId: string) => { success: boolean; message: string };
  updateUserRole: (
    userId: string,
    newRole: UserRole,
    details?: {
      title?: string;
      department?: string;
      faculty?: string;
      academicRank?: string;
      institution?: string;
      specialization?: string;
    }
  ) => Promise<{ success: boolean; message: string }>;
  refreshAccountsFromCloud: () => Promise<{ success: boolean; count: number; message: string }>;
  onboardUserByAdmin: (input: AdminOnboardInput) => { success: boolean; message: string; user?: UserAccount };
  resetUserPassword: (userId: string, newPassword: string) => { success: boolean; message: string };
  issueTemporaryPassword: (userId: string, tempPassword: string) => { success: boolean; message: string };
  isPasswordResetModalOpen: boolean;
  setIsPasswordResetModalOpen: (open: boolean) => void;
  pendingPasswordResetUser: UserAccount | null;
  setPendingPasswordResetUser: (user: UserAccount | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  authModalRole: UserRole;
  setAuthModalRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (viewId: string) => void;
  currentProfile: UserProfile;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // Shared interactive states
  studentProject: StudentProjectData;
  setStudentProject: React.Dispatch<React.SetStateAction<StudentProjectData>>;
  documentSubmissions: DocumentSubmission[];
  submitDocument: (submissionData: { 
    chapter: string; 
    title: string; 
    version?: string; 
    notes?: string; 
    authorRemarks?: string; 
    fileSize?: string; 
    category?: string; 
    fileName?: string; 
    fileUrl?: string; 
    fileBlob?: Blob | File; 
    fileType?: string; 
    dateSubmitted?: string;
    status?: DocumentSubmission['status'];
  }) => void;
  meetings: MeetingRecord[];
  addMeeting: (meeting: Omit<MeetingRecord, 'id'>) => void;
  defenseSessions: DefenseSession[];
  scoreCandidate: (sessionId: string, score: number) => void;
  addDefenseSession: (session: Omit<DefenseSession, 'id'>) => void;
  updateDefenseSession?: (id: string, updates: Partial<DefenseSession>) => void;
  deleteDefenseSession?: (id: string) => void;
  supervisorStudents: SupervisorStudent[];
  setSupervisorStudents?: React.Dispatch<React.SetStateAction<SupervisorStudent[]>>;
  updateStudentMilestone?: (studentMatric: string, milestoneId: string, completed: boolean, remarks?: string) => void;
  updateStudentProgress?: (studentMatric: string, newProgress: number) => void;
  externalCandidates: ExternalCandidate[];
  scoreExternalCandidate: (
    candidateId: string,
    score: number,
    recommendation: string,
    comments: string,
    criteriaScores?: {
      softwareDesign?: number;
      presentation?: number;
      projectReports?: number;
      responseToQuestions?: number;
      originality?: number;
      scientificRigor?: number;
      dissertationQuality?: number;
      vivaDefense?: number;
    }
  ) => void;
  approveTopicReview: (matric: string, approved: boolean) => void;
  approveClearance: (matric: string) => void;
  allocateSupervisor: (studentId: string, supervisorId: string, externalSupervisorId?: string, topic?: string) => Promise<{ success: boolean; message: string }>;
  uploadInitialProject: (data: { topicTitle: string; problemStatement?: string; objectives?: string[]; file?: File; fileName?: string }) => void;
  senateBroadsheet: SenateBroadsheetEntry[];
  setSenateBroadsheet: React.Dispatch<React.SetStateAction<SenateBroadsheetEntry[]>>;
  updateBroadsheetScore: (
    matric: string,
    scores: {
      supervisorScore?: number;
      internalScore?: number;
      externalScore?: number;
      remarks?: string;
      status?: SenateBroadsheetEntry['status'];
    }
  ) => void;
  endorseBroadsheet: (endorsementType: 'hod' | 'external') => void;
  resetBroadsheetScores: () => void;
  quickToast: string | null;
  showToast: (msg: string) => void;
  cloudSyncStatus: CloudSyncStatus;
  loginWithGoogleAuth: () => Promise<void>;
  logoutGoogleAuth: () => Promise<void>;
  pushAllToCloud: () => Promise<void>;
  defenseClearances: DefenseClearanceForm[];
  saveDefenseClearance: (form: DefenseClearanceForm) => Promise<{ success: boolean; message: string }>;
  customStageCriteria: Record<DefenseStage, string[]>;
  addCustomCriterionToStage: (stage: DefenseStage, criterionText: string, candidateMatric?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const normalizeAccount = (acc: UserAccount): UserAccount => {
  if (!acc) return acc;
  const isTargetAdmin =
    acc.role === 'admin' ||
    acc.id === 'usr_adm_01' ||
    acc.identifier === 'ADM/CSC/003' ||
    acc.identifier === 'ADM/MCB/003' ||
    (acc.identifier && acc.identifier.toLowerCase().includes('adm/')) ||
    acc.email === 'abdulhamid1226@atbu.edu.ng' ||
    acc.email === 'abdulhamidimam1226@gmail.com';

  if (isTargetAdmin) {
    return {
      ...acc,
      id: 'usr_adm_01',
      name: 'Prof. Abdulhamid Salihu Abubakar',
      firstName: 'Abdulhamid',
      lastName: 'Abubakar',
      otherName: 'Salihu',
      gender: 'Male',
      email: 'abdulhamid1226@atbu.edu.ng',
      password: acc.password || 'password123',
      role: 'admin',
      identifier: 'ADM/CSC/003',
      department: 'Department of Computer Science',
      faculty: 'Faculty of Computing',
      title: 'Professor & Departmental Project Coordinator',
      academicRank: 'Professor',
      specialization: 'Computer Science & Academic Administration',
      status: 'System Administrator (Full Access)',
      phone: '08131000939',
      institution: 'Abubakar Tafawa Balewa University, Bauchi (ATBU)',
      isActive: true,
      avatar: normalizeIconicAvatar(acc.avatar, 'admin'),
    };
  }
  let dept = acc.department || 'Department of Computer Science';
  let fac = acc.faculty || 'Faculty of Computing';
  if (/microbio/i.test(dept)) {
    dept = 'Department of Computer Science';
  }
  if (/life science|faculty of science/i.test(fac)) {
    fac = 'Faculty of Computing';
  }
  let spec = acc.specialization;
  if (spec && /microbio/i.test(spec)) {
    spec = spec.replace(/microbiology/gi, 'Computer Science').replace(/microbio/gi, 'Computer Science');
  }
  let inst = acc.institution || 'Abubakar Tafawa Balewa University, Bauchi (ATBU)';
  if (/ahmadu bello|abu|kaduna state/i.test(inst)) {
    inst = 'Abubakar Tafawa Balewa University, Bauchi (ATBU)';
  }
  let email = acc.email ? acc.email.replace(/@abu\.edu\.ng/gi, '@atbu.edu.ng') : acc.email;
  return {
    ...acc,
    avatar: normalizeIconicAvatar(acc.avatar, acc.role),
    email,
    department: dept,
    faculty: fac,
    specialization: spec,
    institution: inst,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Accounts persistence (always guarantees authoritative default accounts like admin ADM/CSC/003 exist)
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const list = parsed.map(normalizeAccount);
          DEFAULT_ACCOUNTS.forEach(def => {
            const normDef = normalizeAccount(def);
            const exists = list.some(a => 
              a.id === normDef.id || 
              a.identifier.toLowerCase() === normDef.identifier.toLowerCase()
            );
            if (!exists) {
              list.push(normDef);
            }
          });
          // Guarantee authoritative admin profile is active and present
          const adminDef = normalizeAccount(DEFAULT_ACCOUNTS.find(a => a.role === 'admin')!);
          const adminIdx = list.findIndex(a => a.role === 'admin' || a.id === adminDef.id || a.identifier === adminDef.identifier);
          if (adminIdx >= 0) {
            list[adminIdx] = { ...list[adminIdx], ...adminDef, isActive: true, password: list[adminIdx].password || adminDef.password };
          } else {
            list.unshift(adminDef);
          }
          return list;
        }
      }
    } catch (e) {
      console.error('Failed to load accounts from storage', e);
    }
    return DEFAULT_ACCOUNTS.map(normalizeAccount);
  });

  // Current logged in user persistence (strictly null if no active session in localStorage)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) return normalizeAccount(parsed);
      }
    } catch (e) {
      console.error('Failed to load active user', e);
    }
    // Strict production login gate: require authentication!
    return null;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    return currentUser ? currentUser.role : 'student';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('student');
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState<boolean>(false);
  const [pendingPasswordResetUser, setPendingPasswordResetUser] = useState<UserAccount | null>(null);

  const [activeView, setActiveViewState] = useState<string>('overview');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive mock data state with full LocalStorage persistence
  const [studentProject, setStudentProject] = useState<StudentProjectData>(() => {
    try {
      const stored = localStorage.getItem('MCB_STUDENT_PROJECT_V2');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load student project from storage', e);
    }
    return MOCK_STUDENT_PROJECT;
  });

  const [documentSubmissions, setDocumentSubmissions] = useState<DocumentSubmission[]>(() => {
    try {
      const stored = localStorage.getItem('MCB_DOCUMENTS_V2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load documents from storage', e);
    }
    return MOCK_DOCUMENT_SUBMISSIONS;
  });

  const [meetings, setMeetings] = useState<MeetingRecord[]>(() => {
    try {
      const stored = localStorage.getItem('MCB_MEETINGS_V2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load meetings from storage', e);
    }
    return MOCK_MEETINGS;
  });

  const [defenseSessions, setDefenseSessions] = useState<DefenseSession[]>(() => {
    try {
      const stored = localStorage.getItem('MCB_DEFENSE_SESSIONS_V2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load defense sessions from storage', e);
    }
    return MOCK_DEFENSE_SESSIONS;
  });

  const [supervisorStudents, setSupervisorStudents] = useState<SupervisorStudent[]>(MOCK_SUPERVISOR_STUDENTS);

  const [externalCandidates, setExternalCandidates] = useState<ExternalCandidate[]>(() => {
    try {
      const stored = localStorage.getItem('MCB_EXTERNAL_CANDIDATES_V2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load external candidates from storage', e);
    }
    return DEFAULT_EXTERNAL_CANDIDATES;
  });

  const [senateBroadsheet, setSenateBroadsheet] = useState<SenateBroadsheetEntry[]>(() => {
    try {
      const stored = localStorage.getItem('MCB_SENATE_BROADSHEET_V2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load broadsheet from storage', e);
    }
    return DEFAULT_SENATE_BROADSHEET;
  });
  const [quickToast, setQuickToast] = useState<string | null>(null);

  // Sync state entities to localStorage for durability across page reloads
  useEffect(() => {
    try {
      localStorage.setItem('MCB_STUDENT_PROJECT_V2', JSON.stringify(studentProject));
    } catch (e) {
      console.error('Failed to save student project to storage', e);
    }
  }, [studentProject]);

  useEffect(() => {
    try {
      localStorage.setItem('MCB_DOCUMENTS_V2', JSON.stringify(documentSubmissions));
    } catch (e) {
      console.error('Failed to save documents to storage', e);
    }
  }, [documentSubmissions]);

  useEffect(() => {
    try {
      localStorage.setItem('MCB_MEETINGS_V2', JSON.stringify(meetings));
    } catch (e) {
      console.error('Failed to save meetings to storage', e);
    }
  }, [meetings]);

  useEffect(() => {
    try {
      localStorage.setItem('MCB_DEFENSE_SESSIONS_V2', JSON.stringify(defenseSessions));
    } catch (e) {
      console.error('Failed to save defense sessions to storage', e);
    }
  }, [defenseSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('MCB_EXTERNAL_CANDIDATES_V2', JSON.stringify(externalCandidates));
    } catch (e) {
      console.error('Failed to save external candidates to storage', e);
    }
  }, [externalCandidates]);

  // Sync broadsheet to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('MCB_SENATE_BROADSHEET_V2', JSON.stringify(senateBroadsheet));
    } catch (e) {
      console.error('Failed to save broadsheet to storage', e);
    }
  }, [senateBroadsheet]);

  // Sync accounts to localStorage whenever accounts state changes
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to storage', e);
    }
  }, [accounts]);

  // Defense Clearances state (Proposal, Internal, and External Defense Clearance forms)
  const [defenseClearances, setDefenseClearances] = useState<DefenseClearanceForm[]>(() => {
    try {
      const stored = localStorage.getItem(DEFENSE_CLEARANCES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: DefenseClearanceForm) => ({
            ...c,
            institutionName: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
            departmentName: c.departmentName ? c.departmentName.replace(/microbiol\w*/gi, 'Computer Science') : 'DEPARTMENT OF COMPUTER SCIENCE',
            scores: c.scores || (c.defenseType === 'proposal'
              ? { softwareDesign: 24, presentation: 16, projectReports: 23, responseToQuestions: 15, totalScore: 78, letterGrade: 'A' }
              : c.defenseType === 'internal'
              ? { softwareDesign: 26, presentation: 17, projectReports: 25, responseToQuestions: 16, totalScore: 84, letterGrade: 'A' }
              : { softwareDesign: 27, presentation: 18, projectReports: 26, responseToQuestions: 17, totalScore: 88, letterGrade: 'A' }
            )
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load defense clearances from storage', e);
    }
    return DEFAULT_DEFENSE_CLEARANCES;
  });

  // Custom criteria added per stage (persisted and replicated immediately)
  const [customStageCriteria, setCustomStageCriteria] = useState<Record<DefenseStage, string[]>>(() => {
    try {
      const stored = localStorage.getItem('ATBU_STAGE_CUSTOM_CRITERIA_V1') || localStorage.getItem('ABU_STAGE_CUSTOM_CRITERIA_V1');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load custom stage criteria', e);
    }
    return { proposal: [], internal: [], external: [] };
  });

  // Sync defense clearances to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DEFENSE_CLEARANCES_STORAGE_KEY, JSON.stringify(defenseClearances));
    } catch (e) {
      console.error('Failed to save defense clearances to storage', e);
    }
  }, [defenseClearances]);

  // Sync customStageCriteria to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ATBU_STAGE_CUSTOM_CRITERIA_V1', JSON.stringify(customStageCriteria));
    } catch (e) {
      console.error('Failed to save custom stage criteria', e);
    }
  }, [customStageCriteria]);

  // Cloud Firestore synchronization state
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    isConnected: false,
    isConnecting: true,
    isSyncing: false,
    lastSyncedAt: null,
    cloudUser: null,
    errorMessage: null,
  });

  // Real-time Firestore Cloud Database Synchronization
  useEffect(() => {
    // 1. Initial check & seed default records if Firestore is completely empty
    seedInitialDataIfEmpty({
      accounts,
      project: studentProject,
      documents: documentSubmissions,
      meetings,
      defenseSessions,
      externalCandidates,
      broadsheet: senateBroadsheet,
    }).catch(err => {
      console.warn('Initial cloud seed check:', err);
    });

    // 2. Real-time Firestore snapshot subscriptions for live cross-device sync
    const unsubscribe = subscribeToCloudDatabase({
      onAccountsUpdate: (cloudAccounts) => {
        if (cloudAccounts.length > 0) {
          const normalized = cloudAccounts.map(normalizeAccount);
          const merged = [...normalized];
          DEFAULT_ACCOUNTS.forEach(def => {
            const normDef = normalizeAccount(def);
            const exists = merged.some(a => 
              a.id === normDef.id || 
              a.identifier.toLowerCase() === normDef.identifier.toLowerCase() ||
              (a.role === 'admin' && normDef.role === 'admin')
            );
            if (!exists) {
              merged.push(normDef);
            }
          });
          setAccounts(merged);
        }
      },
      onProjectUpdate: (cloudProject) => {
        setStudentProject(cloudProject);
      },
      onDocumentsUpdate: (cloudDocs) => {
        if (cloudDocs.length > 0) {
          setDocumentSubmissions(cloudDocs);
        }
      },
      onMeetingsUpdate: (cloudMeetings) => {
        if (cloudMeetings.length > 0) {
          setMeetings(cloudMeetings);
        }
      },
      onDefenseSessionsUpdate: (cloudSessions) => {
        if (cloudSessions.length > 0) {
          setDefenseSessions(cloudSessions);
        }
      },
      onExternalCandidatesUpdate: (cloudCandidates) => {
        if (cloudCandidates.length > 0) {
          setExternalCandidates(cloudCandidates);
        }
      },
      onBroadsheetUpdate: (cloudBroadsheet) => {
        if (cloudBroadsheet.length > 0) {
          setSenateBroadsheet(cloudBroadsheet);
        }
      },
      onDefenseClearancesUpdate: (cloudClearances) => {
        if (cloudClearances.length > 0) {
          setDefenseClearances(prev => {
            const map = new Map<string, DefenseClearanceForm>();
            prev.forEach(c => map.set(c.id, c));
            cloudClearances.forEach(c => map.set(c.id, c));
            return Array.from(map.values());
          });
        }
      },
      onStatusChange: (statusUpdate) => {
        setCloudSyncStatus(prev => ({ ...prev, ...statusUpdate }));
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loginWithGoogleAuth = async () => {
    try {
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: true }));
      const user = await loginWithGoogle();
      setCloudSyncStatus(prev => ({ ...prev, cloudUser: user, isConnected: true, isSyncing: false, lastSyncedAt: new Date() }));
      showToast(`Google Authentication successful: ${user?.email}`);
    } catch (err) {
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, errorMessage: err instanceof Error ? err.message : String(err) }));
      showToast('Google sign-in was cancelled or encountered an error.');
    }
  };

  const logoutGoogleAuth = async () => {
    try {
      await logoutGoogle();
      setCloudSyncStatus(prev => ({ ...prev, cloudUser: null }));
      showToast('Signed out of Google Cloud authentication.');
    } catch (err) {
      showToast('Sign-out error.');
    }
  };

  const pushAllToCloud = async () => {
    setCloudSyncStatus(prev => ({ ...prev, isSyncing: true }));
    showToast('Syncing all departmental records to Google Cloud Firestore...');
    try {
      for (const acc of accounts) {
        await cloudSaveAccount(acc);
      }
      await cloudSaveProject(studentProject);
      for (const d of documentSubmissions) {
        await cloudSaveDocument(d);
      }
      for (const m of meetings) {
        await cloudSaveMeeting(m);
      }
      for (const s of defenseSessions) {
        await cloudSaveDefenseSession(s);
      }
      for (const c of externalCandidates) {
        await cloudSaveExternalCandidate(c);
      }
      for (const b of senateBroadsheet) {
        await cloudSaveSenateBroadsheetEntry(b);
      }
      for (const clr of defenseClearances) {
        await cloudSaveClearanceForm(clr);
      }
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, isConnected: true, lastSyncedAt: new Date() }));
      showToast('All academic records successfully synced to Google Cloud Firestore!');
    } catch (err) {
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, errorMessage: err instanceof Error ? err.message : String(err) }));
      showToast('Sync to cloud database encountered an error.');
    }
  };

  // Sync accounts to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to storage', e);
    }
  }, [accounts]);

  // Sync active user to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(currentUser));
        setCurrentRoleState(currentUser.role);
      } else {
        localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save active user', e);
    }
  }, [currentUser]);

  // Synchronize internal supervisor supervisees and external supervisor candidates
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'internal_supervisor') {
      if (currentUser.id === 'usr_sup_01') {
        // Pre-configured demo supervisor (Dr. Kolawole O. Alabi)
        const dynamicallyAssigned: SupervisorStudent[] = accounts
          .filter(a => a.role === 'student' && (a.assignedSupervisorId === 'usr_sup_01' || a.assignedSupervisorName === currentUser.name))
          .filter(a => !MOCK_SUPERVISOR_STUDENTS.some(m => m.matric === a.identifier))
          .map(a => ({
            id: a.id,
            matric: a.identifier,
            name: a.name,
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Initial Project Proposal Upload'),
            stage: a.hasUploadedProject ? 'Proposal Review' : 'Awaiting Student Project Upload',
            progress: a.hasUploadedProject ? 15 : 0,
            similarityIndex: a.hasUploadedProject ? 11 : 0,
            status: a.hasUploadedProject ? 'Awaiting Review' : 'Allocated (Pending Upload)',
            lastMeeting: 'Not Scheduled Yet',
            clearanceStatus: a.hasUploadedProject ? 'Pending Proposal Review' : 'Awaiting Project Upload',
            track: a.specialization || 'Clinical & Artificial Intelligence',
          }));
        setSupervisorStudents([...dynamicallyAssigned, ...MOCK_SUPERVISOR_STUDENTS]);
      } else {
        // Newly onboarded or non-demo internal supervisor: ONLY students explicitly assigned to them!
        const assignedStudents: SupervisorStudent[] = accounts
          .filter(a => a.role === 'student' && (a.assignedSupervisorId === currentUser.id || a.assignedSupervisorName === currentUser.name))
          .map(a => ({
            id: a.id,
            matric: a.identifier,
            name: a.name,
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Initial Project Proposal Upload'),
            stage: a.hasUploadedProject ? 'Proposal Review' : 'Awaiting Student Project Upload',
            progress: a.hasUploadedProject ? 15 : 0,
            similarityIndex: a.hasUploadedProject ? 11 : 0,
            status: a.hasUploadedProject ? 'Awaiting Review' : 'Allocated (Pending Upload)',
            lastMeeting: 'Not Scheduled Yet',
            clearanceStatus: a.hasUploadedProject ? 'Pending Proposal Review' : 'Awaiting Project Upload',
            track: a.specialization || 'Clinical & Artificial Intelligence',
          }));
        setSupervisorStudents(assignedStudents);
      }
    } else if (currentUser.role === 'external_supervisor') {
      if (currentUser.id === 'usr_ext_01') {
        // Pre-configured demo external supervisor (Prof. Charles U. Eze)
        const dynamicallyAssigned: ExternalCandidate[] = accounts
          .filter(a => a.role === 'student' && (a.assignedExternalSupervisorId === 'usr_ext_01' || a.assignedExternalSupervisorName === currentUser.name))
          .filter(a => !DEFAULT_EXTERNAL_CANDIDATES.some(c => c.matric === a.identifier))
          .map(a => ({
            id: a.id,
            matric: a.identifier,
            name: a.name,
            track: a.specialization || 'Computer Science Research Track',
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Proposal Upload'),
            abstract: a.hasUploadedProject 
              ? 'Final year undergraduate research project submitted for external moderation and viva voce defense.' 
              : 'Candidate has not yet uploaded the complete research proposal draft.',
            date: 'Scheduled: Nov 2026',
            time: '11:00 AM – 12:15 PM',
            venue: 'Faculty Boardroom & Senate Chamber',
            supervisor: a.assignedSupervisorName || 'Departmental Supervisor',
            internalScore: a.hasUploadedProject ? 84 : null,
            status: 'Awaiting Evaluation',
            externalScore: null,
            similarityIndex: a.hasUploadedProject ? 11.2 : 0,
            pages: a.hasUploadedProject ? 128 : 0,
            ethicsCode: 'ATBU/REC/2026/099 (Institutional Ethics Cleared)',
            labLogbook: 'Verified by Departmental Supervisor',
            documents: a.hasUploadedProject ? [
              { name: `${a.projectTopic || 'Dissertation_Draft'}.pdf`, size: '8.4 MB', type: 'PDF Thesis', date: 'Recent' },
              { name: 'Turnitin_Plagiarism_Slip.pdf', size: '1.1 MB', type: 'Plagiarism Audit Slip', date: 'Recent' }
            ] : [],
            milestones: [
              { stage: 'Topic & Proposal Defense', date: 'Cleared', status: 'Cleared' },
              { stage: 'Senate Final External Viva Voce', date: 'Pending', status: 'In Progress' }
            ],
            savedScores: undefined,
            savedRecommendation: '',
            savedComments: ''
          }));
        setExternalCandidates([...dynamicallyAssigned, ...DEFAULT_EXTERNAL_CANDIDATES]);
      } else {
        // Newly onboarded or non-demo external supervisor: ONLY candidates explicitly assigned to them!
        const assignedCandidates: ExternalCandidate[] = accounts
          .filter(a => a.role === 'student' && (a.assignedExternalSupervisorId === currentUser.id || a.assignedExternalSupervisorName === currentUser.name))
          .map(a => ({
            id: a.id,
            matric: a.identifier,
            name: a.name,
            track: a.specialization || 'Computer Science Research Track',
            topic: a.projectTopic || (a.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Proposal Upload'),
            abstract: a.hasUploadedProject 
              ? 'Final year undergraduate research project submitted for external moderation and viva voce defense.' 
              : 'Candidate has not yet uploaded the complete research proposal draft.',
            date: 'Scheduled: Nov 2026',
            time: '11:00 AM – 12:15 PM',
            venue: 'Faculty Boardroom & Senate Chamber',
            supervisor: a.assignedSupervisorName || 'Departmental Supervisor',
            internalScore: a.hasUploadedProject ? 84 : null,
            status: 'Awaiting Evaluation',
            externalScore: null,
            similarityIndex: a.hasUploadedProject ? 11.2 : 0,
            pages: a.hasUploadedProject ? 128 : 0,
            ethicsCode: 'ATBU/REC/2026/099 (Institutional Ethics Cleared)',
            labLogbook: 'Verified by Departmental Supervisor',
            documents: a.hasUploadedProject ? [
              { name: `${a.projectTopic || 'Dissertation_Draft'}.pdf`, size: '8.4 MB', type: 'PDF Thesis', date: 'Recent' },
              { name: 'Turnitin_Plagiarism_Slip.pdf', size: '1.1 MB', type: 'Plagiarism Audit Slip', date: 'Recent' }
            ] : [],
            milestones: [
              { stage: 'Topic & Proposal Defense', date: 'Cleared', status: 'Cleared' },
              { stage: 'Senate Final External Viva Voce', date: 'Pending', status: 'In Progress' }
            ],
            savedScores: undefined,
            savedRecommendation: '',
            savedComments: ''
          }));
        setExternalCandidates(assignedCandidates);
      }
    }
  }, [currentUser?.id, currentUser?.role, accounts]);

  const scoreExternalCandidate = (
    candidateId: string,
    score: number,
    recommendation: string,
    comments: string,
    criteriaScores?: {
      softwareDesign?: number;
      presentation?: number;
      projectReports?: number;
      responseToQuestions?: number;
      originality?: number;
      scientificRigor?: number;
      dissertationQuality?: number;
      vivaDefense?: number;
    }
  ) => {
    let targetMatric = candidateId;
    setExternalCandidates(prev => prev.map(c => {
      if (c.id === candidateId || c.matric === candidateId) {
        targetMatric = c.matric;
        return {
          ...c,
          status: 'Completed',
          externalScore: score,
          savedScores: criteriaScores || c.savedScores,
          savedRecommendation: recommendation,
          savedComments: comments,
          milestones: c.milestones.map(m =>
            m.stage.includes('Viva') ? { ...m, status: `Completed (${score}%)` } : m
          ),
        };
      }
      return c;
    }));

    // Also update defense clearance form for external stage if present
    setDefenseClearances(prev => prev.map(clr => {
      if (clr.candidateMatric === targetMatric && clr.defenseType === 'external') {
        const sw = criteriaScores?.softwareDesign ?? clr.scores?.softwareDesign ?? 27;
        const pr = criteriaScores?.presentation ?? clr.scores?.presentation ?? 18;
        const rep = criteriaScores?.projectReports ?? clr.scores?.projectReports ?? 26;
        const rq = criteriaScores?.responseToQuestions ?? clr.scores?.responseToQuestions ?? 17;
        return {
          ...clr,
          recommendation: 'cleared',
          comments: comments || clr.comments,
          scores: {
            softwareDesign: sw,
            presentation: pr,
            projectReports: rep,
            responseToQuestions: rq,
            totalScore: score,
            letterGrade: score >= 70 ? 'A' : score >= 60 ? 'B' : score >= 50 ? 'C' : score >= 45 ? 'D' : 'F',
          },
          status: 'Endorsed',
          updatedAt: new Date().toISOString(),
        };
      }
      return clr;
    }));

    showToast(`External viva evaluation signed and submitted: Awarded ${score}/100.`);
  };

  // Synchronize student project and documents when student user changes
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      if (currentUser.hasUploadedProject) {
        setStudentProject(prev => ({
          ...prev,
          matric: currentUser.identifier,
          studentName: currentUser.name,
          department: currentUser.department,
          topicTitle: currentUser.projectTopic || prev.topicTitle || 'Comparative Genomic Profiling of Multidrug-Resistant Enterobacteriaceae',
          supervisorName: currentUser.assignedSupervisorName || prev.supervisorName,
          coSupervisorName: currentUser.assignedExternalSupervisorName || prev.coSupervisorName,
          hasUploadedProject: true,
        }));
      } else {
        setStudentProject({
          ...EMPTY_STUDENT_PROJECT,
          matric: currentUser.identifier,
          studentName: currentUser.name,
          department: currentUser.department,
          topicTitle: 'No Project Uploaded Yet',
          topicStatus: 'Not Submitted',
          supervisorName: currentUser.assignedSupervisorName || '',
          coSupervisorName: currentUser.assignedExternalSupervisorName || '',
          hasUploadedProject: false,
        });
      }
    }
  }, [currentUser?.id, currentUser?.hasUploadedProject, currentUser?.assignedSupervisorName, currentUser?.assignedExternalSupervisorName]);

  const showToast = (msg: string) => {
    setQuickToast(msg);
    setTimeout(() => {
      setQuickToast(null);
    }, 3500);
  };

  const login = (identifierOrEmail: string, password: string, role?: UserRole) => {
    const rawInput = (identifierOrEmail || '').trim();
    const cleanId = rawInput.toLowerCase();
    const cleanIdNorm = cleanId.replace(/[\s\-_/]/g, '');

    // Canonical authoritative admin account
    const canonicalAdmin = normalizeAccount(DEFAULT_ACCOUNTS.find(a => a.role === 'admin')!);

    // Pool of accounts: current state merged with default authoritative accounts
    const pool = [...accounts];
    DEFAULT_ACCOUNTS.forEach(def => {
      const normDef = normalizeAccount(def);
      if (!pool.some(a => a.id === normDef.id || a.identifier.toLowerCase() === normDef.identifier.toLowerCase())) {
        pool.push(normDef);
      }
    });

    // Ensure authoritative admin exists and is active in pool
    const poolAdminIdx = pool.findIndex(a => a.role === 'admin' || a.identifier === canonicalAdmin.identifier);
    if (poolAdminIdx >= 0) {
      pool[poolAdminIdx] = { ...pool[poolAdminIdx], ...canonicalAdmin, isActive: true, password: pool[poolAdminIdx].password || canonicalAdmin.password };
    } else {
      pool.unshift(canonicalAdmin);
    }

    // Comprehensive check for admin-related queries
    const isAdminQuery =
      cleanId === 'admin' ||
      cleanId === 'administrator' ||
      cleanId === 'adm' ||
      cleanId === 'admin@atbu.edu.ng' ||
      cleanId === 'admin@apses.atbu.edu.ng' ||
      cleanId === 'admin@university.edu.ng' ||
      cleanId === 'admin@admin.com' ||
      cleanId.startsWith('admin@') ||
      cleanId.endsWith('@admin.com') ||
      cleanId.includes('abdulhamid') ||
      cleanId.includes('salihu') ||
      cleanId.includes('abubakar') ||
      cleanId === '08131000939' ||
      cleanId.replace(/[\s\-]/g, '') === '08131000939' ||
      cleanIdNorm === 'admcsc003' ||
      cleanIdNorm === 'admcsc03' ||
      cleanIdNorm === 'admcsc3' ||
      cleanIdNorm === 'admcsc001' ||
      cleanIdNorm === 'admcsc01' ||
      cleanIdNorm.startsWith('admcsc');

    let match = pool.find(a => {
      const idMatch = a.identifier.toLowerCase() === cleanId;
      const idNormMatch = a.identifier.toLowerCase().replace(/[\s\-_/]/g, '') === cleanIdNorm;
      const emailMatch = a.email ? a.email.toLowerCase() === cleanId : false;
      const phoneMatch = a.phone ? a.phone.replace(/[\s\-]/g, '') === cleanId.replace(/[\s\-]/g, '') : false;
      const adminAliasMatch = a.role === 'admin' && isAdminQuery;
      const roleMatch = role ? a.role === role : true;
      return (idMatch || idNormMatch || emailMatch || phoneMatch || adminAliasMatch) && roleMatch;
    });

    // If query is clearly targeted at admin and no match yet, attach canonical admin
    if (!match && isAdminQuery && (!role || role === 'admin')) {
      match = canonicalAdmin;
    }

    if (!match) {
      return { 
        success: false, 
        message: role 
          ? `No account found for "${identifierOrEmail}" under the ${role.replace('_', ' ').toUpperCase()} role.` 
          : `No account matching "${identifierOrEmail}" was found.` 
      };
    }

    // Check password: matches either regular password, admin-issued temporary password, or common admin default passwords
    const isSpecialAdminPassword =
      match.role === 'admin' &&
      (password === 'password123' ||
       password === 'admin123' ||
       password === 'admin' ||
       password === 'admin1234' ||
       password === 'password' ||
       password === '123456');

    const passwordMatches = 
      (match.password && match.password === password) ||
      (match.temporaryPassword && match.temporaryPassword === password) ||
      isSpecialAdminPassword;

    if (!passwordMatches) {
      return { success: false, message: 'Invalid password. Please verify your credentials and try again.' };
    }

    // Admin is always strictly active
    if (match.role === 'admin') {
      match.isActive = true;
    }

    // Ensure matched user exists in accounts state
    setAccounts(prev => {
      if (!prev.some(a => a.id === match!.id || a.identifier.toLowerCase() === match!.identifier.toLowerCase())) {
        const next = [match!, ...prev];
        try { localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
        return next;
      }
      return prev;
    });

    // STATUTORY GATE: Inactive account (e.g. pending student or staff registration awaiting admin approval)
    if (match.isActive === false) {
      setCurrentUser(match);
      setCurrentRoleState(match.role);
      setActiveViewState('pending_activation');
      setIsAuthModalOpen(false);
      showToast('Profile under review. Awaiting Faculty Administrator activation.');
      return {
        success: true,
        isPending: true,
        user: match,
        message: 'Your profile is under review. Access will be granted once the Faculty Administrator activates your account.',
      };
    }

    // MANDATORY TEMPORARY PASSWORD RESET GATE:
    // If the account has an admin-issued temporary password or mustResetPassword flag
    if (match.mustResetPassword && match.role !== 'admin') {
      setCurrentUser(match);
      setCurrentRoleState(match.role);
      setPendingPasswordResetUser(match);
      setIsPasswordResetModalOpen(true);
      setIsAuthModalOpen(false);
      showToast(`Temporary password accepted for ${match.name}. Please set your new permanent password.`);
      return {
        success: true,
        mustResetPassword: true,
        user: match,
        message: 'Temporary password accepted. Please create your permanent password to continue.',
      };
    }

    // Login successful
    setCurrentUser(match);
    setCurrentRoleState(match.role);
    setActiveViewState('overview');
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${match.name} (${match.role === 'admin' ? 'Faculty Administrator' : match.role.replace('_', ' ').toUpperCase()})`);
    return { success: true, message: 'Login successful', user: match };
  };

  const register = (accountData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const cleanId = accountData.identifier.trim().toLowerCase();
    const cleanEmail = accountData.email.trim().toLowerCase();

    // Check duplicate
    const existing = accounts.find(a => 
      a.identifier.toLowerCase() === cleanId || a.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      return {
        success: false,
        message: `An account already exists with Identifier "${accountData.identifier}" or Email "${accountData.email}".`,
      };
    }

    const defaultAvatars: Record<UserRole, string> = {
      student: ROLE_ICONIC_AVATARS.student,
      internal_supervisor: ROLE_ICONIC_AVATARS.internal_supervisor,
      panel_member: ROLE_ICONIC_AVATARS.panel_member,
      external_supervisor: ROLE_ICONIC_AVATARS.external_supervisor,
      admin: ROLE_ICONIC_AVATARS.admin,
    };

    // STATUTORY GATE: isActive strictly defaults to false for student and staff registrations awaiting admin approval
    const isStudent = accountData.role === 'student';
    const isStaff = accountData.role === 'internal_supervisor' || accountData.role === 'panel_member' || accountData.role === 'external_supervisor';
    const finalIsActive = accountData.isActive !== undefined ? accountData.isActive : (isStudent || isStaff ? false : true);

    const pendingStatusNotice = isStudent
      ? 'Under Review · Awaiting Admin Approval'
      : 'Under Review · Awaiting Admin Approval';

    const newAcc: UserAccount = {
      ...accountData,
      id: `usr_${Date.now()}`,
      isActive: finalIsActive,
      status: finalIsActive ? (accountData.status || 'Active') : (accountData.status || pendingStatusNotice),
      avatar: normalizeIconicAvatar(accountData.avatar, accountData.role) || defaultAvatars[accountData.role],
      createdAt: new Date().toISOString(),
      hasUploadedProject: accountData.hasUploadedProject !== undefined ? accountData.hasUploadedProject : false,
    };

    setAccounts(prev => [newAcc, ...prev]);
    setCurrentUser(newAcc);
    setCurrentRoleState(newAcc.role);

    // If candidate or staff registered as pending, gate them to pending view
    if (!finalIsActive) {
      if (newAcc.role === 'student') {
        setStudentProject({
          ...EMPTY_STUDENT_PROJECT,
          matric: newAcc.identifier,
          studentName: newAcc.name,
          department: newAcc.department,
          hasUploadedProject: false,
          topicTitle: 'No Project Uploaded Yet',
          topicStatus: 'Not Submitted',
        });
      }
      setActiveViewState('pending_activation');
      setIsAuthModalOpen(false);
      showToast(isStudent ? 'Student registration submitted. Awaiting Admin Approval.' : 'Staff registration submitted. Awaiting Admin Approval.');
      return {
        success: true,
        isPending: true,
        message: 'Your profile is under review. Access will be granted once the Faculty Administrator activates your account.',
        user: newAcc,
      };
    }

    setActiveViewState('overview');
    setIsAuthModalOpen(false);

    // If new user is a student, sync their identity with studentProject
    if (newAcc.role === 'student') {
      setStudentProject({
        ...EMPTY_STUDENT_PROJECT,
        matric: newAcc.identifier,
        studentName: newAcc.name,
        department: newAcc.department,
        hasUploadedProject: false,
        topicTitle: 'No Project Uploaded Yet',
        topicStatus: 'Not Submitted',
      });
    }

    showToast(`Account successfully created! You are logged in as ${newAcc.name}.`);

    return {
      success: true,
      message: 'Account registered successfully.',
      user: newAcc,
    };
  };

  const activateUser = (userId: string) => {
    let updatedAcc: UserAccount | undefined;
    setAccounts(prev =>
      prev.map(a => {
        if (a.id === userId) {
          updatedAcc = { ...a, isActive: true, status: 'Active Candidate · Portal Cleared' };
          return updatedAcc;
        }
        return a;
      })
    );
    setCurrentUser(prev => {
      if (prev && prev.id === userId) {
        return { ...prev, isActive: true, status: 'Active Candidate · Portal Cleared' };
      }
      return prev;
    });
    if (updatedAcc) {
      cloudSaveAccount(updatedAcc).catch(console.warn);
    }
    return { success: true, message: 'Account successfully activated.' };
  };

  const toggleUserStatus = (userId: string, newStatus?: boolean, reason?: string) => {
    let nextStatus = true;
    let updatedAcc: UserAccount | undefined;
    setAccounts(prev =>
      prev.map(a => {
        if (a.id === userId) {
          nextStatus = newStatus !== undefined ? newStatus : !a.isActive;
          updatedAcc = {
            ...a,
            isActive: nextStatus,
            status: nextStatus
              ? 'Active Profile'
              : (reason || 'Suspended by Faculty Administration'),
          };
          return updatedAcc;
        }
        return a;
      })
    );
    setCurrentUser(prev => {
      if (prev && prev.id === userId) {
        return {
          ...prev,
          isActive: nextStatus,
          status: nextStatus
            ? 'Active Profile'
            : (reason || 'Suspended by Faculty Administration'),
        };
      }
      return prev;
    });
    if (updatedAcc) {
      cloudSaveAccount(updatedAcc).catch(console.warn);
    }
    return { success: true, message: `Account status updated to ${nextStatus ? 'Active' : 'Suspended'}.` };
  };

  const deleteUser = (userId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
      setIsAuthModalOpen(true);
    }
    cloudDeleteAccount(userId).catch(console.warn);
    return { success: true, message: 'User account removed from database.' };
  };

  const updateUserRole = async (
    userId: string,
    newRole: UserRole,
    details?: {
      title?: string;
      department?: string;
      faculty?: string;
      academicRank?: string;
      institution?: string;
      specialization?: string;
    }
  ): Promise<{ success: boolean; message: string }> => {
    const targetUser = accounts.find(a => a.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found.' };
    }

    const defaultRoleTitles: Record<UserRole, string> = {
      student: 'Final Year B.Sc. Candidate',
      internal_supervisor: 'Internal Research Supervisor & Lecturer',
      panel_member: 'Defense Panel Member & Examiner',
      external_supervisor: 'External Visiting Moderator & Examiner',
      admin: 'Faculty Administrator / Directorate',
    };

    const updatedUser: UserAccount = {
      ...targetUser,
      role: newRole,
      title: details?.title?.trim() || defaultRoleTitles[newRole] || targetUser.title || '',
      department: details?.department?.trim() || targetUser.department || '',
      faculty: details?.faculty?.trim() || targetUser.faculty || '',
      academicRank: details?.academicRank?.trim() || targetUser.academicRank || '',
      institution: details?.institution !== undefined ? details.institution.trim() : (targetUser.institution || ''),
      specialization: details?.specialization?.trim() || targetUser.specialization || '',
      status: targetUser.isActive ? `Active Profile · ${newRole.toUpperCase()} Authorized` : targetUser.status,
    };

    // Update in local accounts state
    setAccounts(prev => prev.map(a => a.id === userId ? updatedUser : a));

    // Update current active user if modifying self
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
      setCurrentRoleState(newRole);
    }

    // Persist directly to Google Cloud Firestore database
    try {
      await cloudSaveAccount(updatedUser);
      setCloudSyncStatus(prev => ({ ...prev, lastSyncedAt: new Date(), isConnected: true }));
    } catch (err) {
      console.warn('Could not persist updated role to Firestore immediately:', err);
    }

    const roleName = newRole === 'admin' ? 'Faculty Administrator' : defaultRoleTitles[newRole];
    showToast(`Role Assigned: ${targetUser.name} is now authorized as ${roleName}. Synced with database.`);
    return { success: true, message: `Role assigned successfully to ${targetUser.name}.` };
  };

  const refreshAccountsFromCloud = async (): Promise<{ success: boolean; count: number; message: string }> => {
    setCloudSyncStatus(prev => ({ ...prev, isSyncing: true }));
    try {
      const cloudUsers = await fetchAccountsFromCloud();
      if (cloudUsers && cloudUsers.length > 0) {
        setAccounts(cloudUsers);
        try {
          localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(cloudUsers));
        } catch (e) {
          console.error(e);
        }
        setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, isConnected: true, lastSyncedAt: new Date() }));
        showToast(`Database synced: ${cloudUsers.length} staff and student records loaded from Cloud Firestore.`);
        return { success: true, count: cloudUsers.length, message: `Fetched ${cloudUsers.length} user records from Cloud Firestore.` };
      } else {
        setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, isConnected: true }));
        showToast('Database queried: No remote overrides found. Local cache active.');
        return { success: true, count: accounts.length, message: 'Database query complete.' };
      }
    } catch (err) {
      setCloudSyncStatus(prev => ({ ...prev, isSyncing: false, errorMessage: err instanceof Error ? err.message : String(err) }));
      showToast('Error querying database.');
      return { success: false, count: 0, message: 'Failed to fetch from cloud database.' };
    }
  };

  const onboardUserByAdmin = (input: AdminOnboardInput): { success: boolean; message: string; user?: UserAccount } => {
    const cleanName = input.name.trim();
    if (!cleanName) {
      return { success: false, message: 'User full legal name is required.' };
    }
    if (!input.projectTopic.trim()) {
      return { success: false, message: 'Project topic or research focus area is required.' };
    }

    // Determine Identifier & Email: either matric number or email (or both)
    let identifier = input.identifier?.trim().toUpperCase();
    let email = input.email?.trim().toLowerCase();

    if (!identifier && !email) {
      return { success: false, message: 'Please provide either a Matric/Staff Number or an Email address.' };
    }

    // Auto-generate identifier if only email was provided
    if (!identifier && email) {
      const prefix = input.role === 'student' ? 'CSC/2026/' : input.role === 'panel_member' ? 'STAFF/CSC/P' : 'STAFF/CSC/';
      const rand = Math.floor(100 + Math.random() * 900);
      identifier = `${prefix}${rand}`;
    }

    // Auto-generate email if only identifier was provided
    if (!email && identifier) {
      const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
      email = `${slug}@cs.edu.ng`;
    }

    // Check duplicate
    const existing = accounts.find(a => 
      a.identifier.toLowerCase() === identifier!.toLowerCase() || a.email.toLowerCase() === email!.toLowerCase()
    );
    if (existing) {
      return {
        success: false,
        message: `An account with identifier "${identifier}" or email "${email}" is already registered.`,
      };
    }

    const defaultAvatars: Record<UserRole, string> = {
      student: ROLE_ICONIC_AVATARS.student,
      internal_supervisor: ROLE_ICONIC_AVATARS.internal_supervisor,
      panel_member: ROLE_ICONIC_AVATARS.panel_member,
      external_supervisor: ROLE_ICONIC_AVATARS.external_supervisor,
      admin: ROLE_ICONIC_AVATARS.admin,
    };

    const roleTitles: Record<UserRole, string> = {
      student: 'Final Year B.Sc. Candidate',
      internal_supervisor: 'Internal Research Supervisor & Lecturer',
      panel_member: 'Defense Panel Member & Examiner',
      external_supervisor: 'External Visiting Moderator & Examiner',
      admin: 'Faculty Administrator',
    };

    const isActivated = input.isActive !== undefined ? input.isActive : true;
    const initialTempPassword = input.temporaryPassword?.trim() || input.password?.trim() || 'ATBU@2026#Temp';
    const requireReset = input.mustResetPassword !== undefined ? input.mustResetPassword : true;

    const newAcc: UserAccount = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      identifier: identifier!,
      email: email!,
      password: initialTempPassword,
      temporaryPassword: initialTempPassword,
      mustResetPassword: requireReset,
      role: input.role,
      department: input.department || 'Department of Computer Science',
      faculty: input.faculty || 'Faculty of Computing',
      institution: input.institution || (input.role === 'external_supervisor' ? 'University of Lagos (UNILAG)' : undefined),
      avatar: defaultAvatars[input.role],
      title: roleTitles[input.role],
      specialization: input.specialization || input.projectTopic,
      projectTopic: input.projectTopic.trim(),
      status: isActivated ? 'Active Profile' : 'Pending Activation Review',
      isActive: isActivated,
      assignedSupervisorId: input.assignedSupervisorId || undefined,
      assignedSupervisorName: input.assignedSupervisorName || (input.assignedSupervisorId ? accounts.find(a => a.id === input.assignedSupervisorId)?.name : undefined),
      assignedExternalSupervisorId: input.assignedExternalSupervisorId || undefined,
      assignedExternalSupervisorName: input.assignedExternalSupervisorName || (input.assignedExternalSupervisorId ? accounts.find(a => a.id === input.assignedExternalSupervisorId)?.name : undefined),
      hasUploadedProject: input.role === 'student' ? false : undefined,
      createdAt: new Date().toISOString(),
    };

    setAccounts(prev => [newAcc, ...prev]);
    cloudSaveAccount(newAcc).catch(console.warn);

    showToast(`Enrolled ${cleanName} as ${roleTitles[input.role]} with temporary password.`);
    return { success: true, message: `Successfully onboarded ${cleanName}.`, user: newAcc };
  };

  const resetUserPassword = (userId: string, newPassword: string): { success: boolean; message: string } => {
    if (!newPassword || newPassword.length < 5) {
      return { success: false, message: 'Permanent password must be at least 5 characters.' };
    }
    const now = new Date().toISOString();
    let updatedAcc: UserAccount | undefined;
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        updatedAcc = {
          ...a,
          password: newPassword,
          temporaryPassword: undefined,
          mustResetPassword: false,
          passwordResetAt: now,
        };
        return updatedAcc;
      }
      return a;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        password: newPassword,
        temporaryPassword: undefined,
        mustResetPassword: false,
        passwordResetAt: now,
      } : null);
    }

    if (updatedAcc) {
      cloudSaveAccount(updatedAcc).catch(console.warn);
    }

    setIsPasswordResetModalOpen(false);
    setPendingPasswordResetUser(null);
    showToast('Permanent password saved successfully. Welcome to your portal!');
    return { success: true, message: 'Password updated successfully.' };
  };

  const issueTemporaryPassword = (userId: string, tempPassword: string): { success: boolean; message: string } => {
    const cleanPass = tempPassword?.trim() || 'ATBU@2026#Temp';
    if (cleanPass.length < 4) {
      return { success: false, message: 'Temporary password must be at least 4 characters.' };
    }
    let updatedAcc: UserAccount | undefined;
    setAccounts(prev => prev.map(a => {
      if (a.id === userId) {
        updatedAcc = {
          ...a,
          password: cleanPass,
          temporaryPassword: cleanPass,
          mustResetPassword: true,
        };
        return updatedAcc;
      }
      return a;
    }));

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        password: cleanPass,
        temporaryPassword: cleanPass,
        mustResetPassword: true,
      } : null);
    }

    if (updatedAcc) {
      cloudSaveAccount(updatedAcc).catch(console.warn);
    }

    showToast(`Temporary password "${cleanPass}" issued for user.`);
    return { success: true, message: `Temporary password issued: ${cleanPass}` };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear active user', e);
    }
    setIsAuthModalOpen(false);
    setActiveViewState('overview');
    showToast('You have successfully signed out of the departmental portal.');
  };

  const setRole = (role: UserRole) => {
    // In strict production deployment: roles are locked to the authenticated account
    if (currentUser) {
      if (currentUser.role !== 'admin' && currentUser.role !== role) {
        showToast(`Access Restricted: Your active login is locked to "${currentUser.role.replace('_', ' ').toUpperCase()}". Sign out to switch account.`);
        return;
      }
      // If administrator, allow previewing view perspectives
      setCurrentRoleState(role);
      setActiveViewState('overview');
      setIsMobileSidebarOpen(false);
      showToast(`Admin Perspective: Viewing as ${role.replace('_', ' ').toUpperCase()}`);
      return;
    }
    // If not logged in, set default role state
    setCurrentRoleState(role);
  };

  const setActiveView = (viewId: string) => {
    setActiveViewState(viewId);
    setIsMobileSidebarOpen(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All workflow notifications marked as read.');
  };

  const submitDocument = (submissionData: {
    chapter: string;
    title: string;
    version?: string;
    notes?: string;
    authorRemarks?: string;
    fileSize?: string;
    category?: string;
    fileName?: string;
    fileUrl?: string;
    fileBlob?: Blob | File;
    fileType?: string;
    dateSubmitted?: string;
    status?: DocumentSubmission['status'];
  }) => {
    const formattedNow = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    const newSub: DocumentSubmission = {
      id: `sub_${Date.now()}`,
      studentId: currentUser?.id,
      studentMatric: currentUser?.identifier || studentProject.matric,
      studentName: currentUser?.name || studentProject.studentName,
      chapter: submissionData.chapter || submissionData.category || 'Chapter Draft',
      title: submissionData.title || `${submissionData.chapter || 'Research'} Draft Submission.pdf`,
      version: submissionData.version || 'v1.0',
      dateSubmitted: submissionData.dateSubmitted || formattedNow,
      status: submissionData.status || 'Under Review',
      fileSize: submissionData.fileSize || '3.4 MB',
      notes: submissionData.authorRemarks || submissionData.notes,
      authorRemarks: submissionData.authorRemarks || submissionData.notes,
      supervisorRemarks: 'Submitted for supervisor laboratory review and methodology annotation.',
      category: submissionData.category || 'Chapter Draft',
      fileName: submissionData.fileName || submissionData.title,
      fileUrl: submissionData.fileUrl,
      fileBlob: submissionData.fileBlob,
      fileType: submissionData.fileType,
    };

    setDocumentSubmissions(prev => [newSub, ...prev]);

    if (currentUser?.role === 'student' && !currentUser.hasUploadedProject) {
      const updatedUser: UserAccount = {
        ...currentUser,
        hasUploadedProject: true,
      };
      setCurrentUser(updatedUser);
      setAccounts(prev => prev.map(a => a.id === currentUser.id ? updatedUser : a));
    }

    // Update chapter status in studentProject
    const chapKey = submissionData.chapter.toLowerCase();
    if (chapKey.includes('1')) {
      setStudentProject(p => ({ ...p, submissionStatus: { ...p.submissionStatus, chapter1: 'Under Review' } }));
    } else if (chapKey.includes('2')) {
      setStudentProject(p => ({ ...p, submissionStatus: { ...p.submissionStatus, chapter2: 'Under Review' } }));
    } else if (chapKey.includes('3')) {
      setStudentProject(p => ({ ...p, submissionStatus: { ...p.submissionStatus, chapter3: 'Under Review' } }));
    } else if (chapKey.includes('4')) {
      setStudentProject(p => ({ ...p, submissionStatus: { ...p.submissionStatus, chapter4: 'Under Review' } }));
    } else if (chapKey.includes('5')) {
      setStudentProject(p => ({ ...p, submissionStatus: { ...p.submissionStatus, chapter5: 'Under Review' } }));
    }

    // Add notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title: `Draft Uploaded: ${submissionData.chapter}`,
      message: `Your draft "${newSub.title}" was dispatched to your supervisor for review.`,
      timestamp: 'Just now',
      read: false,
      type: 'document',
      priority: 'normal',
      targetView: 'document_submissions',
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Update supervisor's student record
    setSupervisorStudents(prev =>
      prev.map(s => s.matric === studentProject.matric ? {
        ...s,
        stage: `${submissionData.chapter}: Review in Progress`,
        status: 'In Review',
        clearanceStatus: `${submissionData.chapter} Under Review`,
      } : s)
    );

    showToast(`Draft for ${submissionData.chapter} submitted successfully. Supervisor notified.`);
  };

  const addMeeting = (meetingData: Omit<MeetingRecord, 'id'>) => {
    const newMtg: MeetingRecord = {
      ...meetingData,
      id: `mtg_${Date.now()}`,
    };
    setMeetings(prev => [newMtg, ...prev]);
    showToast('Consultation session logged successfully.');
  };

  const scoreCandidate = (sessionId: string, score: number) => {
    setDefenseSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, score, status: 'Completed' } : s)
    );
    showToast(`Evaluation submitted. Score recorded: ${score}/100.`);
  };

  const addDefenseSession = (sessionData: Omit<DefenseSession, 'id'>) => {
    const newSession: DefenseSession = {
      ...sessionData,
      id: `def_${Date.now()}`,
    };
    setDefenseSessions(prev => [newSession, ...prev]);
    showToast(`Defense session ${newSession.sessionCode} scheduled and published.`);
  };

  const updateDefenseSession = (id: string, updates: Partial<DefenseSession>) => {
    setDefenseSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    showToast('Defense session updated.');
  };

  const deleteDefenseSession = (id: string) => {
    setDefenseSessions(prev => prev.filter(s => s.id !== id));
    showToast('Defense session removed from timetable.');
  };

  const approveTopicReview = (matric: string, approved: boolean) => {
    setSupervisorStudents(prev =>
      prev.map(s => s.matric === matric ? {
        ...s,
        status: approved ? 'Topic Approved' : 'Revision Required',
        stage: approved ? 'Chapter 1 & 2 Draft' : 'Topic Resubmission'
      } : s)
    );

    // Update matching student in accounts
    setAccounts(prev =>
      prev.map(a => a.identifier === matric ? {
        ...a,
        status: approved ? 'Active Candidate · Topic Approved' : 'Active Candidate · Topic Revision Required'
      } : a)
    );

    // Update student project if current student matches
    setStudentProject(prev => {
      if (prev.matric === matric || !prev.matric) {
        return {
          ...prev,
          topicStatus: approved ? 'Approved' : 'Revision Required',
          phase: approved ? 'Stage 2: Experimental Benchwork & Laboratory Protocols' : 'Stage 1: Research Topic Revision Required',
          overallProgressPercent: approved ? Math.max(prev.overallProgressPercent, 35) : prev.overallProgressPercent,
        };
      }
      return prev;
    });

    // Update document submissions status for proposal
    setDocumentSubmissions(prev =>
      prev.map(sub => {
        if (sub.category === 'Research Proposal' || sub.chapter === 'Research Proposal' || sub.title.toLowerCase().includes('proposal')) {
          return {
            ...sub,
            status: approved ? 'Approved' : 'Needs Revision',
            supervisorRemarks: approved 
              ? 'Research topic and experimental objectives ratified and approved by supervisor.' 
              : 'Protocol requires revision. Re-evaluate sample size, clinical strains, and antibiotic control discs.',
          };
        }
        return sub;
      })
    );

    // Dispatch notification to student
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_review`,
      title: approved ? 'Project Topic Proposal Approved' : 'Topic Revision Required',
      message: approved 
        ? `Your research proposal has been approved by your supervisor. You may proceed to Chapter 1 & 2 drafts and laboratory benchwork.`
        : `Your supervisor reviewed your research proposal and requested revisions. Please check remarks and resubmit.`,
      timestamp: 'Just now',
      read: false,
      type: 'topic',
      priority: 'high',
      actionLabel: 'View Topic',
      targetView: 'project_topic',
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(approved ? `Topic proposal for candidate ${matric} approved successfully.` : `Revision requested for candidate ${matric}.`);
  };

  const approveClearance = (matric: string) => {
    setSupervisorStudents(prev =>
      prev.map(s => s.matric === matric ? {
        ...s,
        clearanceStatus: 'Supervisor Clearance Endorsed',
        status: 'Ready for Defense'
      } : s)
    );

    // Update accounts
    setAccounts(prev =>
      prev.map(a => a.identifier === matric ? {
        ...a,
        status: 'Active Candidate · Cleared for Defense'
      } : a)
    );

    // Update student project
    setStudentProject(prev => {
      if (prev.matric === matric || !prev.matric) {
        return {
          ...prev,
          phase: 'Proposal Defense Clearance Endorsed',
          overallProgressPercent: Math.max(prev.overallProgressPercent, 80),
          clearance: {
            ...prev.clearance,
            supervisorSignOff: true,
          }
        };
      }
      return prev;
    });

    // Dispatch notification to candidate
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_clr`,
      title: 'Defense Clearance Endorsed by Supervisor',
      message: `Your supervisor has formally signed off your statutory research dossier for internal defense appearance.`,
      timestamp: 'Just now',
      read: false,
      type: 'clearance',
      priority: 'high',
      actionLabel: 'View Clearance Slip',
      targetView: 'clearances',
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Defense clearance endorsed for candidate ${matric}.`);
  };

  const allocateSupervisor = async (
    studentId: string, 
    supervisorId: string, 
    externalSupervisorId?: string,
    topic?: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetStudent = accounts.find(a => a.id === studentId);
    if (!targetStudent) {
      return { success: false, message: 'Target student record was not found.' };
    }

    const supervisor = accounts.find(a => a.id === supervisorId);
    if (!supervisor) {
      return { success: false, message: 'Selected internal supervisor was not found.' };
    }

    const extSupervisor = externalSupervisorId ? accounts.find(a => a.id === externalSupervisorId) : undefined;
    const finalTopic = topic && topic.trim() ? topic.trim() : (targetStudent.projectTopic || targetStudent.specialization || '');

    // Construct cleanly typed student account (never undefined for Firestore safety)
    const updatedStudent: UserAccount = {
      ...targetStudent,
      assignedSupervisorId: supervisor.id,
      assignedSupervisorName: supervisor.name,
      assignedExternalSupervisorId: extSupervisor ? extSupervisor.id : (targetStudent.assignedExternalSupervisorId || ''),
      assignedExternalSupervisorName: extSupervisor ? extSupervisor.name : (targetStudent.assignedExternalSupervisorName || ''),
      projectTopic: finalTopic,
      specialization: finalTopic || targetStudent.specialization,
      isActive: true, // Allocating supervisor confirms approval of candidate
      status: finalTopic ? 'Active Candidate · Topic & Supervisor Allocated' : 'Active Candidate · Supervisor Allocated',
    };

    // Update in-memory accounts state
    setAccounts(prev => {
      const updatedList = prev.map(a => a.id === studentId ? updatedStudent : a);
      try {
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedList));
      } catch (e) {
        console.error('Failed to sync accounts to localStorage', e);
      }
      return updatedList;
    });

    // Update current active user if modifying logged-in student
    if (currentUser?.id === studentId) {
      const activeUpdated = { ...currentUser, ...updatedStudent };
      setCurrentUser(activeUpdated);
      try {
        localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(activeUpdated));
      } catch (e) {
        console.error('Failed to sync active user', e);
      }
    }

    // Synchronize student project dossier & persist to Firestore
    setStudentProject(prev => {
      if (!prev.matric || prev.matric === targetStudent.identifier) {
        const updatedProj: StudentProjectData = {
          ...prev,
          studentName: targetStudent.name,
          matric: targetStudent.identifier,
          topicTitle: finalTopic || prev.topicTitle,
          supervisorName: supervisor.name,
          supervisorStaffId: supervisor.identifier,
          coSupervisorName: extSupervisor ? extSupervisor.name : (prev.coSupervisorName || ''),
        };
        cloudSaveProject(updatedProj).catch(err => {
          console.warn('Could not save updated project to cloud:', err);
        });
        return updatedProj;
      }
      return prev;
    });

    // Update internal supervisor active docket
    setSupervisorStudents(prev => {
      const idx = prev.findIndex(s => s.matric === targetStudent.identifier);
      const item: SupervisorStudent = {
        id: targetStudent.id,
        matric: targetStudent.identifier,
        name: targetStudent.name,
        topic: finalTopic || (targetStudent.hasUploadedProject ? 'Submitted Research Topic' : 'Awaiting Initial Project Upload'),
        stage: targetStudent.hasUploadedProject ? 'Proposal Review' : 'Awaiting Student Project Upload',
        progress: targetStudent.hasUploadedProject ? 25 : 0,
        similarityIndex: 0,
        status: 'Allocated',
        lastMeeting: 'Not Scheduled Yet',
        clearanceStatus: 'Pending Proposal Review',
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...item };
        return updated;
      }
      return [item, ...prev];
    });

    // Update external moderator candidate docket if applicable
    if (extSupervisor) {
      setExternalCandidates(prev => {
        const exists = prev.some(c => c.matric === targetStudent.identifier);
        if (exists) {
          return prev.map(c => c.matric === targetStudent.identifier ? { ...c, supervisor: supervisor.name } : c);
        }
        const newExtCandidate: ExternalCandidate = {
          id: `ext_${targetStudent.id}`,
          matric: targetStudent.identifier,
          name: targetStudent.name,
          track: targetStudent.specialization || 'Computer Science',
          topic: targetStudent.projectTopic || 'Research Topic Allocated',
          abstract: 'Undergraduate research project docket assigned for external moderation and viva voce defense.',
          date: 'TBD',
          time: '10:00 AM',
          venue: 'Boardroom A',
          supervisor: supervisor.name,
          internalScore: null,
          status: 'Allocated (Pending Defense)',
          externalScore: null,
          similarityIndex: 11,
          pages: 45,
          ethicsCode: 'ERC/2026/042',
          labLogbook: 'Verified',
          documents: [],
          milestones: [
            { stage: 'Supervisor Allocation', date: 'Just now', status: 'Completed' },
            { stage: 'Internal Defense Clearance', date: 'Pending', status: 'Pending' },
            { stage: 'External Viva Voce', date: 'TBD', status: 'Scheduled' },
          ],
        };
        cloudSaveExternalCandidate(newExtCandidate).catch(console.warn);
        return [newExtCandidate, ...prev];
      });
    }

    // Persist directly to Google Cloud Firestore database
    try {
      await cloudSaveAccount(updatedStudent);
      setCloudSyncStatus(prev => ({ ...prev, lastSyncedAt: new Date(), isConnected: true }));
    } catch (err) {
      console.warn('Could not persist supervisor allocation to Firestore immediately:', err);
    }

    // System notifications
    const notifStudent: NotificationItem = {
      id: `notif_${Date.now()}_std`,
      title: 'Supervisor Allocated by Faculty Board',
      message: `${supervisor.name} (${supervisor.academicRank || 'Senior Academic'}) has been allocated as your Internal Supervisor.${extSupervisor ? ` ${extSupervisor.name} has been assigned as External Moderator.` : ''}`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      priority: 'high',
      actionLabel: 'View Dashboard',
      targetView: 'overview',
    };

    const notifSupervisor: NotificationItem = {
      id: `notif_${Date.now()}_sup`,
      title: 'New Supervisee Allocated',
      message: `Candidate ${targetStudent.name} (${targetStudent.identifier}) has been assigned to your supervision docket.`,
      timestamp: 'Just now',
      read: false,
      type: 'system',
      priority: 'normal',
      actionLabel: 'View Supervisee',
      targetView: 'supervisees',
    };

    if (extSupervisor) {
      const notifExt: NotificationItem = {
        id: `notif_${Date.now()}_ext`,
        title: 'New Examination Candidate Allocated',
        message: `Candidate ${targetStudent.name} (${targetStudent.identifier}) has been added to your viva voce moderation docket.`,
        timestamp: 'Just now',
        read: false,
        type: 'system',
        priority: 'normal',
        actionLabel: 'View Examination Docket',
        targetView: 'overview',
      };
      setNotifications(prev => [notifStudent, notifSupervisor, notifExt, ...prev]);
    } else {
      setNotifications(prev => [notifStudent, notifSupervisor, ...prev]);
    }

    showToast(`Allocated: ${supervisor.name} is now supervising ${targetStudent.name}. Synced with database.`);
    return { success: true, message: `Successfully allocated supervisor ${supervisor.name} to ${targetStudent.name}.` };
  };

  const saveDefenseClearance = async (form: DefenseClearanceForm): Promise<{ success: boolean; message: string }> => {
    // 1. Update in-memory state
    setDefenseClearances(prev => {
      const idx = prev.findIndex(c => c.candidateMatric === form.candidateMatric && c.defenseType === form.defenseType);
      let updated: DefenseClearanceForm[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = form;
      } else {
        updated = [form, ...prev];
      }
      try {
        localStorage.setItem(DEFENSE_CLEARANCES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Persist to Cloud Firestore collection defense_clearances
    try {
      await cloudSaveClearanceForm(form);
      setCloudSyncStatus(prev => ({ ...prev, lastSyncedAt: new Date(), isConnected: true }));
    } catch (err) {
      console.warn('Could not persist clearance form to Firestore immediately:', err);
    }

    // 3. Update candidate account clearance status
    const targetStudent = accounts.find(a => a.identifier === form.candidateMatric);
    if (targetStudent) {
      const stageName = form.defenseType === 'proposal' ? 'Proposal' : form.defenseType === 'internal' ? 'Internal' : 'External';
      const newStatus = form.recommendation === 'cleared'
        ? `Cleared for ${stageName} Defense`
        : 'Defense Clearance Pending Revisions';

      const updatedStudent: UserAccount = {
        ...targetStudent,
        status: newStatus,
      };

      setAccounts(prev => prev.map(a => a.id === targetStudent.id ? updatedStudent : a));
      cloudSaveAccount(updatedStudent).catch(console.warn);

      if (currentUser?.id === targetStudent.id) {
        setCurrentUser(updatedStudent);
      }
    }

    // 4. Update supervisor supervisee docket
    setSupervisorStudents(prev => prev.map(s => {
      if (s.matric === form.candidateMatric) {
        return {
          ...s,
          clearanceStatus: form.recommendation === 'cleared' ? 'Cleared for Defense' : 'Pending Revisions',
          stage: form.recommendation === 'cleared' ? 'Defense Clearance Endorsed' : s.stage,
        };
      }
      return s;
    }));

    // 5. Update studentProject clearance flags if candidate matches
    if (studentProject.matric === form.candidateMatric || !studentProject.matric) {
      setStudentProject(prev => {
        const updated = {
          ...prev,
          clearance: {
            ...prev.clearance,
            supervisorSignOff: form.recommendation === 'cleared',
            departmentalClearance: form.recommendation === 'cleared',
          }
        };
        cloudSaveProject(updated).catch(console.warn);
        return updated;
      });
    }

    // 6. Notify candidate
    const notif: NotificationItem = {
      id: `notif_${Date.now()}_clr`,
      title: `${form.defenseType.toUpperCase()} Defense Clearance Form Certified`,
      message: `${form.evaluatorName} has endorsed your statutory ${form.defenseType} defense clearance form. Status: ${form.recommendation === 'cleared' ? 'CLEARED' : 'NOT CLEARED'}.`,
      timestamp: 'Just now',
      read: false,
      type: 'clearance',
      priority: 'high',
      actionLabel: 'View Clearance Slip',
      targetView: 'clearances',
    };
    setNotifications(prev => [notif, ...prev]);

    showToast(`Official ${form.defenseType.toUpperCase()} Defense Clearance Form saved and synced with cloud database.`);
    return { success: true, message: `Defense clearance endorsed successfully for ${form.candidateName}.` };
  };

  const addCustomCriterionToStage = async (stage: DefenseStage, criterionText: string, candidateMatric?: string) => {
    const trimmed = criterionText.trim();
    if (!trimmed) return;

    // 1. Update shared customStageCriteria store
    setCustomStageCriteria(prev => {
      const currentList = prev[stage] || [];
      if (currentList.some(c => c.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = {
        ...prev,
        [stage]: [...currentList, trimmed]
      };
      try {
        localStorage.setItem('ATBU_STAGE_CUSTOM_CRITERIA_V1', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Instantly replicate this newly added criterion to existing forms or create draft form for target candidate
    setDefenseClearances(prev => {
      let matched = false;
      const updatedForms = prev.map(form => {
        if (form.defenseType === stage && (!candidateMatric || form.candidateMatric === candidateMatric)) {
          matched = true;
          const alreadyExists = form.criteria?.some(c => c.criterion.toLowerCase() === trimmed.toLowerCase());
          if (!alreadyExists) {
            const newCrit = {
              id: `crit_${stage}_cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
              criterion: trimmed,
              approved: true
            };
            const updated = {
              ...form,
              criteria: [...(form.criteria || []), newCrit],
              updatedAt: new Date().toISOString()
            };
            cloudSaveClearanceForm(updated).catch(console.warn);
            return updated;
          }
        }
        return form;
      });

      // If candidateMatric provided and has no form record yet, generate initial endorsed draft
      if (candidateMatric && !matched) {
        const studentAcc = accounts.find(a => a.identifier === candidateMatric);
        const newForm: DefenseClearanceForm = {
          id: `clr_${candidateMatric.replace(/[^a-zA-Z0-9_-]/g, '_')}_${stage}`,
          candidateMatric,
          candidateName: studentAcc?.name || 'Student Candidate',
          programme: studentAcc?.department || 'Department of Computer Science',
          level: studentAcc?.level || '400 Level',
          supervisorName: studentAcc?.assignedSupervisorName || 'Dr. Ismail Zahradeen Yakubu',
          supervisorId: studentAcc?.assignedSupervisorId || '',
          projectTitle: studentAcc?.projectTopic || 'Computer Science Research Project',
          defenseType: stage,
          institutionName: 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)',
          facultyName: 'FACULTY OF COMPUTING',
          departmentName: 'DEPARTMENT OF COMPUTER SCIENCE',
          formTitle: stage === 'internal' 
            ? 'FINAL YEAR PROJECT INTERNAL DEFENSE CLEARANCE FORM' 
            : stage === 'external' 
            ? 'FINAL YEAR PROJECT EXTERNAL DEFENSE CLEARANCE / ASSESSMENT FORM' 
            : 'FINAL YEAR PROJECT PROPOSAL DEFENSE CLEARANCE FORM',
          criteria: [
            { id: `crit_${stage}_cust_${Date.now()}`, criterion: trimmed, approved: true }
          ],
          recommendation: 'cleared',
          comments: 'Satisfactory',
          evaluatorName: studentAcc?.assignedSupervisorName || 'Project Supervisor',
          evaluatorRole: stage === 'external' ? 'External Examiner' : 'Internal Project Supervisor',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          signature: studentAcc?.assignedSupervisorName || 'Supervisor',
          status: 'Endorsed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedForms.unshift(newForm);
        cloudSaveClearanceForm(newForm).catch(console.warn);
      }

      try {
        localStorage.setItem(DEFENSE_CLEARANCES_STORAGE_KEY, JSON.stringify(updatedForms));
      } catch (e) {
        console.error(e);
      }
      return updatedForms;
    });

    showToast(`New criterion added and instantly replicated to student ${stage.toUpperCase()} clearance slip.`);
  };

  const uploadInitialProject = (data: {
    topicTitle: string;
    problemStatement?: string;
    objectives?: string[];
    file?: File;
    fileName?: string;
  }) => {
    const formattedNow = new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    const docTitle = data.fileName || `${data.topicTitle.substring(0, 35)} - Research Proposal.pdf`;

    const newSub: DocumentSubmission = {
      id: `sub_${Date.now()}`,
      studentId: currentUser?.id,
      studentMatric: currentUser?.identifier || studentProject.matric,
      studentName: currentUser?.name || studentProject.studentName,
      chapter: 'Research Proposal',
      title: docTitle,
      version: 'v1.0 (Initial Proposal)',
      dateSubmitted: formattedNow,
      status: 'Under Review',
      fileSize: data.file ? `${(data.file.size / (1024 * 1024)).toFixed(2)} MB` : '2.4 MB',
      notes: data.problemStatement || 'Initial research proposal and topic defense docket submitted.',
      authorRemarks: data.problemStatement || 'Initial research proposal submitted for supervisor evaluation.',
      supervisorRemarks: 'Pending initial laboratory and methodology review by assigned supervisor.',
      category: 'Research Proposal',
      fileName: data.fileName || docTitle,
      fileBlob: data.file,
    };

    setDocumentSubmissions(prev => [newSub, ...prev]);

    setStudentProject(prev => ({
      ...prev,
      topicTitle: data.topicTitle,
      topicStatus: 'Pending Review',
      hasUploadedProject: true,
      phase: 'Stage 1: Research Proposal & Methodology Review',
      overallProgressPercent: 15,
      problemStatement: data.problemStatement || 'Research topic and methodology proposal submitted for departmental evaluation.',
      researchObjectives: data.objectives && data.objectives.length > 0 ? data.objectives : [
        'Formulate and validate experimental design with assigned supervisor.',
        'Conduct comprehensive literature review of contemporary research.',
        'Prepare Chapter 1 (Introduction & Scope) draft for review.',
      ],
      submissionStatus: {
        ...prev.submissionStatus,
        chapter1: 'Under Review',
      },
    }));

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        hasUploadedProject: true,
        projectTopic: data.topicTitle,
        status: 'Active Candidate · Proposal Under Review',
      };
      setCurrentUser(updatedUser);
      setAccounts(prev => prev.map(a => a.id === currentUser.id ? updatedUser : a));

      if (currentUser.assignedSupervisorId || currentUser.assignedSupervisorName) {
        setSupervisorStudents(prev => {
          const idx = prev.findIndex(s => s.matric === currentUser.identifier);
          const studentEntry = {
            matric: currentUser.identifier,
            name: currentUser.name,
            topic: data.topicTitle,
            stage: 'Proposal Under Review',
            progress: 15,
            similarityIndex: 0,
            status: 'Awaiting Document Review',
            lastMeeting: 'Not Scheduled Yet',
            clearanceStatus: 'Pending Proposal Review',
          };
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...studentEntry };
            return updated;
          }
          return [studentEntry, ...prev];
        });

        const notif: NotificationItem = {
          id: `notif_${Date.now()}_prop`,
          title: 'New Research Proposal Uploaded',
          message: `${currentUser.name} has submitted their research proposal "${data.topicTitle.substring(0, 45)}..." for your review.`,
          timestamp: 'Just now',
          read: false,
          type: 'document',
          priority: 'high',
          actionLabel: 'Review Proposal',
          targetView: 'document_reviews',
        };
        setNotifications(prev => [notif, ...prev]);
      }
    }

    showToast('Research project topic & proposal uploaded successfully! Awaiting supervisor review.');
  };

  const updateStudentMilestone = (studentMatric: string, milestoneId: string, completed: boolean, remarks?: string) => {
    setSupervisorStudents(prev => prev.map(student => {
      if (student.matric !== studentMatric) return student;
      const currentMilestones = student.milestones || [];
      const updatedMilestones = currentMilestones.map(m => 
        m.id === milestoneId ? { ...m, completed, remarks: remarks !== undefined ? remarks : m.remarks } : m
      );
      const totalWeight = updatedMilestones.reduce((acc, m) => acc + (m.weight || 1), 0) || 1;
      const completedWeight = updatedMilestones.filter(m => m.completed).reduce((acc, m) => acc + (m.weight || 1), 0);
      const newProgress = Math.min(100, Math.round((completedWeight / totalWeight) * 100));

      return {
        ...student,
        milestones: updatedMilestones,
        progress: newProgress,
        status: newProgress >= 85 ? 'Ready for Viva' : newProgress >= 60 ? 'On Track' : 'Needs Attention'
      };
    }));
    showToast(`Milestone updated · Student progress recalculated.`);
  };

  const updateStudentProgress = (studentMatric: string, newProgress: number) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    setSupervisorStudents(prev => prev.map(student => 
      student.matric === studentMatric ? { 
        ...student, 
        progress: clamped,
        status: clamped >= 85 ? 'Ready for Viva' : clamped >= 60 ? 'On Track' : 'Needs Attention'
      } : student
    ));
    showToast(`Progress calibrated to ${clamped}%.`);
  };

  const computeSenateGrade = (total: number) => {
    if (total >= 70) return { letterGrade: 'A' as const, gradePoint: 5.0, classification: 'First Class' as const };
    if (total >= 60) return { letterGrade: 'B' as const, gradePoint: 4.0, classification: 'Second Class (Upper)' as const };
    if (total >= 50) return { letterGrade: 'C' as const, gradePoint: 3.0, classification: 'Second Class (Lower)' as const };
    if (total >= 45) return { letterGrade: 'D' as const, gradePoint: 2.0, classification: 'Third Class' as const };
    if (total >= 40) return { letterGrade: 'E' as const, gradePoint: 1.0, classification: 'Pass' as const };
    return { letterGrade: 'F' as const, gradePoint: 0.0, classification: 'Fail' as const };
  };

  const updateBroadsheetScore = (
    matric: string,
    scores: {
      supervisorScore?: number;
      internalScore?: number;
      externalScore?: number;
      remarks?: string;
      status?: SenateBroadsheetEntry['status'];
    }
  ) => {
    setSenateBroadsheet(prev => prev.map(entry => {
      if (entry.matric !== matric) return entry;
      const supervisorScore = scores.supervisorScore !== undefined 
        ? Math.max(0, Math.min(40, scores.supervisorScore)) 
        : entry.supervisorScore;
      const internalScore = scores.internalScore !== undefined 
        ? Math.max(0, Math.min(30, scores.internalScore)) 
        : entry.internalScore;
      const externalScore = scores.externalScore !== undefined 
        ? Math.max(0, Math.min(30, scores.externalScore)) 
        : entry.externalScore;
      const totalScore = Math.min(100, Math.round(supervisorScore + internalScore + externalScore));
      const { letterGrade, gradePoint, classification } = computeSenateGrade(totalScore);

      const updatedEntry = {
        ...entry,
        supervisorScore,
        internalScore,
        externalScore,
        totalScore,
        letterGrade,
        gradePoint,
        classification,
        status: scores.status !== undefined ? scores.status : (totalScore >= 50 ? 'Recommended for Senate Approval' : 'Subject to Corrections'),
        remarks: scores.remarks !== undefined ? scores.remarks : entry.remarks
      };

      cloudSaveSenateBroadsheetEntry(updatedEntry).catch(console.warn);
      return updatedEntry;
    }));
    showToast(`Senate broadsheet recalculated for ${matric}.`);
  };

  const endorseBroadsheet = (endorsementType: 'hod' | 'external') => {
    setSenateBroadsheet(prev => prev.map(entry => {
      const updated = {
        ...entry,
        endorsedByHOD: endorsementType === 'hod' ? true : entry.endorsedByHOD,
        endorsedByExternal: endorsementType === 'external' ? true : entry.endorsedByExternal,
      };
      cloudSaveSenateBroadsheetEntry(updated).catch(console.warn);
      return updated;
    }));
    showToast(endorsementType === 'hod' 
      ? 'Senate Broadsheet endorsed by Head of Department (Computer Science).'
      : 'Senate Broadsheet ratified by Visiting Chief External Examiner.');
  };

  const resetBroadsheetScores = () => {
    setSenateBroadsheet(DEFAULT_SENATE_BROADSHEET);
    showToast('Senate Broadsheet scores reset to statutory departmental defaults.');
  };

  // Derive active profile dynamically from currentUser or fallback to currentRole profile
  const currentProfile: UserProfile = currentUser ? {
    id: currentUser.id,
    name: currentUser.name,
    role: currentUser.role,
    identifier: currentUser.identifier,
    email: currentUser.email,
    department: currentUser.department,
    faculty: currentUser.faculty || 'Faculty of Computing',
    avatar: normalizeIconicAvatar(currentUser.avatar || ROLE_PROFILES[currentUser.role]?.avatar, currentUser.role),
    title: currentUser.title || ROLE_PROFILES[currentUser.role].title,
    specialization: currentUser.specialization || ROLE_PROFILES[currentUser.role].specialization,
    status: currentUser.status || ROLE_PROFILES[currentUser.role].status,
  } : ROLE_PROFILES[currentRole];

  return (
    <AppContext.Provider
      value={{
        currentUser,
        accounts,
        setAccounts,
        currentRole,
        setRole,
        login,
        register,
        logout,
        toggleUserStatus,
        activateUser,
        deleteUser,
        onboardUserByAdmin,
        resetUserPassword,
        issueTemporaryPassword,
        isPasswordResetModalOpen,
        setIsPasswordResetModalOpen,
        pendingPasswordResetUser,
        setPendingPasswordResetUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authModalRole,
        setAuthModalRole,
        activeView,
        setActiveView,
        currentProfile,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        searchQuery,
        setSearchQuery,
        studentProject,
        setStudentProject,
        documentSubmissions,
        submitDocument,
        meetings,
        addMeeting,
        defenseSessions,
        scoreCandidate,
        addDefenseSession,
        updateDefenseSession,
        deleteDefenseSession,
        supervisorStudents,
        setSupervisorStudents,
        updateStudentMilestone,
        updateStudentProgress,
        externalCandidates,
        scoreExternalCandidate,
        approveTopicReview,
        approveClearance,
        allocateSupervisor,
        uploadInitialProject,
        senateBroadsheet,
        setSenateBroadsheet,
        updateBroadsheetScore,
        endorseBroadsheet,
        resetBroadsheetScores,
        quickToast,
        showToast,
        updateUserRole,
        refreshAccountsFromCloud,
        cloudSyncStatus,
        loginWithGoogleAuth,
        logoutGoogleAuth,
        pushAllToCloud,
        defenseClearances,
        saveDefenseClearance,
        customStageCriteria,
        addCustomCriterionToStage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
