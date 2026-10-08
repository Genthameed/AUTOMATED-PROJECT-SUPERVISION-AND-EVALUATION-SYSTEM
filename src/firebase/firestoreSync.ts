import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, testConnection } from './config';
import {
  UserAccount,
  StudentProjectData,
  DocumentSubmission,
  MeetingRecord,
  DefenseSession,
  ExternalCandidate,
  SenateBroadsheetEntry,
  DefenseClearanceForm
} from '../types';

export interface CloudSyncStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  cloudUser: User | null;
  errorMessage: string | null;
}

// -------------------------------------------------------------
// Google Authentication
// -------------------------------------------------------------
const googleProvider = new GoogleAuthProvider();

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function logoutGoogle(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Google Sign-out failed:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// Cloud Write Helpers (Wrapped with handleFirestoreError)
// -------------------------------------------------------------

/**
 * Recursively strips undefined keys and nested undefined values so Firestore never rejects payloads
 */
function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        clean[key] = sanitizeForFirestore(value);
      }
    }
    return clean as T;
  }
  return obj;
}

export async function cloudSaveAccount(account: UserAccount): Promise<void> {
  const path = `users/${account.id}`;
  try {
    const docRef = doc(db, 'users', account.id);
    const sanitized = sanitizeForFirestore(account);
    await setDoc(docRef, sanitized, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAccountsFromCloud(): Promise<UserAccount[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserAccount[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as UserAccount);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function cloudDeleteAccount(accountId: string): Promise<void> {
  const path = `users/${accountId}`;
  try {
    const docRef = doc(db, 'users', accountId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function cloudSaveProject(project: StudentProjectData): Promise<void> {
  const docId = project.matric ? project.matric.replace(/[^a-zA-Z0-9_-]/g, '_') : 'primary_project';
  const path = `student_projects/${docId}`;
  try {
    const docRef = doc(db, 'student_projects', docId);
    await setDoc(docRef, sanitizeForFirestore(project), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveDocument(submission: DocumentSubmission): Promise<void> {
  const path = `chapter_submissions/${submission.id}`;
  try {
    const docRef = doc(db, 'chapter_submissions', submission.id);
    await setDoc(docRef, sanitizeForFirestore(submission), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveMeeting(meeting: MeetingRecord): Promise<void> {
  const path = `meeting_records/${meeting.id}`;
  try {
    const docRef = doc(db, 'meeting_records', meeting.id);
    await setDoc(docRef, sanitizeForFirestore(meeting), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveDefenseSession(session: DefenseSession): Promise<void> {
  const path = `defense_sessions/${session.id}`;
  try {
    const docRef = doc(db, 'defense_sessions', session.id);
    await setDoc(docRef, sanitizeForFirestore(session), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveExternalCandidate(candidate: ExternalCandidate): Promise<void> {
  const path = `external_candidates/${candidate.id}`;
  try {
    const docRef = doc(db, 'external_candidates', candidate.id);
    await setDoc(docRef, sanitizeForFirestore(candidate), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveSenateBroadsheetEntry(entry: SenateBroadsheetEntry): Promise<void> {
  const path = `senate_broadsheet/${entry.id}`;
  try {
    const docRef = doc(db, 'senate_broadsheet', entry.id);
    await setDoc(docRef, sanitizeForFirestore(entry), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudSaveClearanceForm(form: DefenseClearanceForm): Promise<void> {
  const docId = form.id || `clr_${form.candidateMatric.replace(/[^a-zA-Z0-9_-]/g, '_')}_${form.defenseType}`;
  const path = `defense_clearances/${docId}`;
  try {
    const docRef = doc(db, 'defense_clearances', docId);
    await setDoc(docRef, sanitizeForFirestore({ ...form, id: docId }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function cloudFetchAllClearanceForms(): Promise<DefenseClearanceForm[]> {
  const path = 'defense_clearances';
  try {
    const snap = await getDocs(collection(db, 'defense_clearances'));
    const list: DefenseClearanceForm[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as DefenseClearanceForm);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// -------------------------------------------------------------
// Bulk Cloud Seeding / Migration
// -------------------------------------------------------------
export async function seedInitialDataIfEmpty(initialData: {
  accounts: UserAccount[];
  project: StudentProjectData;
  documents: DocumentSubmission[];
  meetings: MeetingRecord[];
  defenseSessions: DefenseSession[];
  externalCandidates: ExternalCandidate[];
  broadsheet: SenateBroadsheetEntry[];
}): Promise<boolean> {
  try {
    const usersCol = collection(db, 'users');
    const existingUsers = await getDocs(usersCol);

    if (existingUsers.empty) {
      console.log('Seeding initial data into Cloud Firestore...');
      const batch = writeBatch(db);

      // Seed Users
      initialData.accounts.forEach(acc => {
        const ref = doc(db, 'users', acc.id);
        batch.set(ref, sanitizeForFirestore(acc));
      });

      // Seed Student Project
      const projId = initialData.project.matric.replace(/[^a-zA-Z0-9_-]/g, '_');
      batch.set(doc(db, 'student_projects', projId), sanitizeForFirestore(initialData.project));

      // Seed Documents
      initialData.documents.forEach(d => {
        batch.set(doc(db, 'chapter_submissions', d.id), sanitizeForFirestore(d));
      });

      // Seed Meetings
      initialData.meetings.forEach(m => {
        batch.set(doc(db, 'meeting_records', m.id), sanitizeForFirestore(m));
      });

      // Seed Defense Sessions
      initialData.defenseSessions.forEach(s => {
        batch.set(doc(db, 'defense_sessions', s.id), sanitizeForFirestore(s));
      });

      // Seed External Candidates
      initialData.externalCandidates.forEach(c => {
        batch.set(doc(db, 'external_candidates', c.id), sanitizeForFirestore(c));
      });

      // Seed Broadsheet
      initialData.broadsheet.forEach(b => {
        batch.set(doc(db, 'senate_broadsheet', b.id), sanitizeForFirestore(b));
      });

      await batch.commit();
      console.log('Cloud Firestore initialized with department records!');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Initial Firestore seed check skipped or failed:', error);
    return false;
  }
}

// -------------------------------------------------------------
// Real-time Cloud Snapshot Listeners
// -------------------------------------------------------------
export function subscribeToCloudDatabase(handlers: {
  onAccountsUpdate: (accounts: UserAccount[]) => void;
  onProjectUpdate: (project: StudentProjectData) => void;
  onDocumentsUpdate: (docs: DocumentSubmission[]) => void;
  onMeetingsUpdate: (meetings: MeetingRecord[]) => void;
  onDefenseSessionsUpdate: (sessions: DefenseSession[]) => void;
  onExternalCandidatesUpdate: (candidates: ExternalCandidate[]) => void;
  onBroadsheetUpdate: (broadsheet: SenateBroadsheetEntry[]) => void;
  onDefenseClearancesUpdate?: (clearances: DefenseClearanceForm[]) => void;
  onStatusChange: (status: Partial<CloudSyncStatus>) => void;
}): () => void {
  const unsubscribers: Unsubscribe[] = [];

  handlers.onStatusChange({ isConnecting: true, isConnected: false });

  // Test connection first
  testConnection().then((connected) => {
    handlers.onStatusChange({
      isConnected: connected,
      isConnecting: false,
      lastSyncedAt: new Date()
    });
  }).catch((err) => {
    handlers.onStatusChange({
      isConnected: false,
      isConnecting: false,
      errorMessage: err instanceof Error ? err.message : String(err)
    });
  });

  // 1. Users collection listener
  const usersUnsub = onSnapshot(
    collection(db, 'users'),
    (snap) => {
      if (!snap.empty) {
        const users: UserAccount[] = [];
        snap.forEach((docSnap) => {
          users.push(docSnap.data() as UserAccount);
        });
        handlers.onAccountsUpdate(users);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [users]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(usersUnsub);

  // 2. Student Projects listener
  const projectsUnsub = onSnapshot(
    collection(db, 'student_projects'),
    (snap) => {
      if (!snap.empty) {
        // Use first student project for current student view
        const firstDoc = snap.docs[0];
        if (firstDoc) {
          handlers.onProjectUpdate(firstDoc.data() as StudentProjectData);
          handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
        }
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [student_projects]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(projectsUnsub);

  // 3. Chapter Submissions listener
  const docsUnsub = onSnapshot(
    collection(db, 'chapter_submissions'),
    (snap) => {
      if (!snap.empty) {
        const docsList: DocumentSubmission[] = [];
        snap.forEach((docSnap) => {
          docsList.push(docSnap.data() as DocumentSubmission);
        });
        // Sort by chapter title/name
        docsList.sort((a, b) => a.chapter.localeCompare(b.chapter));
        handlers.onDocumentsUpdate(docsList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [chapter_submissions]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(docsUnsub);

  // 4. Meeting Records listener
  const meetingsUnsub = onSnapshot(
    collection(db, 'meeting_records'),
    (snap) => {
      if (!snap.empty) {
        const meetingsList: MeetingRecord[] = [];
        snap.forEach((docSnap) => {
          meetingsList.push(docSnap.data() as MeetingRecord);
        });
        handlers.onMeetingsUpdate(meetingsList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [meeting_records]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(meetingsUnsub);

  // 5. Defense Sessions listener
  const defenseUnsub = onSnapshot(
    collection(db, 'defense_sessions'),
    (snap) => {
      if (!snap.empty) {
        const sessionsList: DefenseSession[] = [];
        snap.forEach((docSnap) => {
          sessionsList.push(docSnap.data() as DefenseSession);
        });
        handlers.onDefenseSessionsUpdate(sessionsList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [defense_sessions]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(defenseUnsub);

  // 6. External Candidates listener
  const externalUnsub = onSnapshot(
    collection(db, 'external_candidates'),
    (snap) => {
      if (!snap.empty) {
        const candList: ExternalCandidate[] = [];
        snap.forEach((docSnap) => {
          candList.push(docSnap.data() as ExternalCandidate);
        });
        handlers.onExternalCandidatesUpdate(candList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [external_candidates]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(externalUnsub);

  // 7. Senate Broadsheet listener
  const broadsheetUnsub = onSnapshot(
    collection(db, 'senate_broadsheet'),
    (snap) => {
      if (!snap.empty) {
        const broadsheetList: SenateBroadsheetEntry[] = [];
        snap.forEach((docSnap) => {
          broadsheetList.push(docSnap.data() as SenateBroadsheetEntry);
        });
        handlers.onBroadsheetUpdate(broadsheetList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [senate_broadsheet]:', error);
      handlers.onStatusChange({
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }
  );
  unsubscribers.push(broadsheetUnsub);

  // 8. Statutory Defense Clearances listener (Proposal, Internal, and External Defense)
  const clearancesUnsub = onSnapshot(
    collection(db, 'defense_clearances'),
    (snap) => {
      if (!snap.empty && handlers.onDefenseClearancesUpdate) {
        const clearancesList: DefenseClearanceForm[] = [];
        snap.forEach((docSnap) => {
          clearancesList.push(docSnap.data() as DefenseClearanceForm);
        });
        handlers.onDefenseClearancesUpdate(clearancesList);
        handlers.onStatusChange({ lastSyncedAt: new Date(), isConnected: true });
      }
    },
    (error) => {
      console.warn('Firestore snapshot notice [defense_clearances]:', error);
    }
  );
  unsubscribers.push(clearancesUnsub);

  // Return teardown function
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
