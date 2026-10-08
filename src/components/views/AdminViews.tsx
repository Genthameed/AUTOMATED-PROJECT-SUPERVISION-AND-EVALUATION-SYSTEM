import React, { useState } from 'react';
import { 
  FolderGit2, 
  UserCheck, 
  Split, 
  CalendarRange, 
  BarChart3, 
  ShieldAlert, 
  Search, 
  Download, 
  Plus, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Building2,
  Lock,
  Layers,
  FlaskConical,
  Award,
  Users,
  UserPlus,
  X,
  Edit3,
  Trash2,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  Send,
  Check,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminAndExternalDashboard } from './AdminAndExternalDashboard';
import { UserAccessManagement } from '../admin/UserAccessManagement';
import { SupervisorAllocationModal } from '../admin/SupervisorAllocationModal';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { DepartmentalSenateBroadsheet } from '../senate/DepartmentalSenateBroadsheet';
import { UserAccount } from '../../types';

export const AdminViews: React.FC = () => {
  const { 
    activeView, 
    showToast, 
    setActiveView,
    accounts,
    defenseSessions,
    addDefenseSession,
    updateDefenseSession,
    deleteDefenseSession
  } = useApp();

  const [studentSearch, setStudentSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [allocationTargetStudent, setAllocationTargetStudent] = useState<UserAccount | null>(null);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceModalStudent, setClearanceModalStudent] = useState<UserAccount | null>(null);
  const [clearanceModalMatric, setClearanceModalMatric] = useState<string | null>(null);

  // Defense session scheduling modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Candidate selection state
  const [candidateMatric, setCandidateMatric] = useState('CSC/2021/0482');
  const [isCustomCandidate, setIsCustomCandidate] = useState(false);
  const [customCandidateName, setCustomCandidateName] = useState('');
  const [customCandidateMatric, setCustomCandidateMatric] = useState('');
  const [candidateTopic, setCandidateTopic] = useState('Antibiogram of ESBL Enterobacteriaceae');
  const [defenseType, setDefenseType] = useState<'Proposal Defense' | 'Internal Defense' | 'Final External Defense'>('Internal Defense');

  // Venue / Hall (Manual Entry + Quick Presets)
  const [hallVenue, setHallVenue] = useState('Computing Boardroom 102');
  const [hallDetails, setHallDetails] = useState('Main Science Complex · Room 102');

  // Examiners Committee (Manual Entry + Quick Presets)
  const [panelChair, setPanelChair] = useState('Prof. Sarah N. Ibrahim (HOD / Chair)');
  const [examinersList, setExaminersList] = useState<string[]>([
    'Dr. Kolawole O. Alabi (Supervisor)',
    'Dr. Victor Adeyemi (Internal Examiner)'
  ]);
  const [newExaminerName, setNewExaminerName] = useState('');
  const [newExaminerRole, setNewExaminerRole] = useState('Internal Examiner');

  // Date & Time
  const [defenseDate, setDefenseDate] = useState('2026-10-15');
  const [defenseTime, setDefenseTime] = useState('10:00 AM');

  // Panel Constitution Modal State (for Panel Allocations view)
  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [newPanelName, setNewPanelName] = useState('');
  const [newPanelChair, setNewPanelChair] = useState('');
  const [newPanelVenue, setNewPanelVenue] = useState('');
  const [newPanelExaminers, setNewPanelExaminers] = useState<string[]>([]);
  const [panelExaminerInput, setPanelExaminerInput] = useState('');
  const [panelExaminerRole, setPanelExaminerRole] = useState('Internal Examiner');

  const students = [
    { matric: 'CSC/2021/0482', name: 'Amina Bello', dept: 'Artificial Intelligence', supervisor: 'Dr. K. O. Alabi', topic: 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures', clearance: 'Cleared', similarity: 11.2 },
    { matric: 'CSC/2021/0511', name: 'Chukwudi Nnamdi', dept: 'Software Engineering', supervisor: 'Dr. K. O. Alabi', topic: 'Design and Formal Verification of Fault-Tolerant Distributed Consensus Protocols', clearance: 'In-Review', similarity: 14.0 },
    { matric: 'CSC/2021/0390', name: 'Zainab Kabir Usman', dept: 'Cybersecurity', supervisor: 'Dr. V. Adeyemi', topic: 'Hardware-Accelerated Cryptographic Primitives for Ultra-Low Latency Embedded Systems', clearance: 'Cleared', similarity: 9.8 },
    { matric: 'CSC/2021/0445', name: 'Ibrahim Musa Farouk', dept: 'Network Security & Machine Learning', supervisor: 'Dr. A. Salisu', topic: 'Design and Implementation of High-Throughput Intrusion Detection System', clearance: 'Cleared', similarity: 8.4 },
    { matric: 'CSC/2021/0308', name: 'Blessing Okon', dept: 'Data Science & Distributed Systems', supervisor: 'Prof. S. Ibrahim', topic: 'Scalable Distributed Microservice Orchestration for Real-Time Sensor Telemetry Processing', clearance: 'In-Review', similarity: 12.5 },
  ];

  const supervisors = [
    { id: 'STAFF/CSC/042', name: 'Dr. Kolawole O. Alabi', rank: 'Senior Lecturer', dept: 'Artificial Intelligence', assigned: 6, quota: 8, status: 'Active' },
    { id: 'STAFF/CSC/019', name: 'Dr. Victor Adeyemi', rank: 'Associate Professor', dept: 'Cybersecurity', assigned: 7, quota: 8, status: 'Active' },
    { id: 'STAFF/CSC/008', name: 'Prof. Sarah N. Ibrahim', rank: 'Professor & HOD', dept: 'Computer Systems & Architecture', assigned: 5, quota: 6, status: 'Active' },
    { id: 'STAFF/CSC/033', name: 'Dr. Aminu Salisu', rank: 'Senior Lecturer', dept: 'Software Engineering', assigned: 6, quota: 8, status: 'Active' },
  ];

  const initialPanels = [
    { id: 'P-A', name: 'Defense Panel A', chair: 'Prof. Sarah N. Ibrahim', members: 'Dr. K. O. Alabi, Dr. V. Adeyemi', venue: 'Computing Boardroom (Room 102)', candidatesCount: 14 },
    { id: 'P-B', name: 'Defense Panel B', chair: 'Prof. U. G. Musa', members: 'Dr. A. Salisu, Dr. T. E. Johnson', venue: 'Postgraduate Seminar Room 1', candidatesCount: 12 },
    { id: 'P-C', name: 'Defense Panel C', chair: 'Dr. Victor Adeyemi', members: 'Dr. B. K. Balogun, Dr. C. O. Eze', venue: 'Computer Systems Lab Suite', candidatesCount: 15 },
  ];

  const [panelsList, setPanelsList] = useState(initialPanels);

  const registeredStudentCandidates = [
    ...accounts.filter(a => a.role === 'student').map(a => ({
      matric: a.identifier,
      name: a.name,
      dept: a.department || 'Computer Science',
      supervisor: a.assignedSupervisorName || 'Assigned Supervisor',
      topic: a.projectTopic || 'Software Architecture and Computational Systems Project',
      clearance: 'Cleared',
      similarity: 11.2,
    })),
    ...students.filter(s => !accounts.some(a => a.identifier === s.matric))
  ];

  // Helper to add examiner manually
  const handleAddExaminer = () => {
    if (!newExaminerName.trim()) {
      showToast('Please type the examiner name and title.');
      return;
    }
    const formatted = `${newExaminerName.trim()} (${newExaminerRole})`;
    if (examinersList.some(e => e.toLowerCase().includes(newExaminerName.trim().toLowerCase()))) {
      showToast('This examiner is already appointed to this panel.');
      return;
    }
    setExaminersList(prev => [...prev, formatted]);
    showToast(`Added examiner: ${newExaminerName.trim()}`);
    setNewExaminerName('');
  };

  const handleQuickAddExaminer = (nameWithTitle: string, defaultRole: string = 'Internal Examiner') => {
    const formatted = `${nameWithTitle} (${defaultRole})`;
    if (examinersList.some(e => e.includes(nameWithTitle))) {
      showToast(`${nameWithTitle} is already in the committee.`);
      return;
    }
    setExaminersList(prev => [...prev, formatted]);
    showToast(`Added ${nameWithTitle} to panel.`);
  };

  const handleRemoveExaminer = (index: number) => {
    setExaminersList(prev => prev.filter((_, i) => i !== index));
  };

  const handleCandidateChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomCandidate(true);
      setCandidateMatric('CUSTOM');
    } else {
      setIsCustomCandidate(false);
      setCandidateMatric(val);
      const foundCandidate = registeredStudentCandidates.find(s => s.matric === val);
      if (foundCandidate && foundCandidate.topic) {
        setCandidateTopic(foundCandidate.topic);
      }
    }
  };

  const handleOpenCreateSession = () => {
    setEditingSessionId(null);
    setIsCustomCandidate(false);
    setCandidateMatric('CSC/2021/0482');
    setCandidateTopic('Antibiogram of ESBL Enterobacteriaceae');
    setDefenseType('Internal Defense');
    setHallVenue('Computing Boardroom 102');
    setHallDetails('Main Science Complex · Room 102');
    setPanelChair('Prof. Sarah N. Ibrahim (HOD / Chair)');
    setExaminersList([
      'Dr. Kolawole O. Alabi (Supervisor)',
      'Dr. Victor Adeyemi (Internal Examiner)'
    ]);
    setDefenseDate('2026-10-15');
    setDefenseTime('10:00 AM');
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditSession = (session: any) => {
    setEditingSessionId(session.id);
    setIsCustomCandidate(false);
    setCandidateMatric(session.candidateMatric || session.matric || 'CSC/2021/0482');
    setCandidateTopic(session.topic || '');
    setDefenseType(session.type || 'Internal Defense');
    setHallVenue(session.venue || session.room || 'Computing Boardroom 102');
    setHallDetails('');
    setPanelChair(session.panelChair || 'Prof. Sarah N. Ibrahim (HOD / Chair)');
    setExaminersList(
      Array.isArray(session.members) 
        ? session.members 
        : typeof session.members === 'string' 
          ? session.members.split(',').map((s: string) => s.trim()) 
          : ['Dr. Kolawole O. Alabi (Internal Examiner)']
    );
    setDefenseDate(session.date || '2026-10-15');
    setDefenseTime(session.time || '10:00 AM');
    setIsScheduleModalOpen(true);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hallVenue.trim()) {
      showToast('Please enter the defense hall or venue manually for accuracy.');
      return;
    }

    if (examinersList.length === 0 && !panelChair.trim()) {
      showToast('Please add at least one examiner or panel chair.');
      return;
    }

    const finalCandidateName = isCustomCandidate
      ? (customCandidateName.trim() || 'Candidate')
      : (registeredStudentCandidates.find(c => c.matric === candidateMatric)?.name || 'Candidate');

    const finalMatric = isCustomCandidate
      ? (customCandidateMatric.trim() || 'CSC/2026/000')
      : candidateMatric;

    const fullVenue = hallDetails.trim() ? `${hallVenue.trim()} (${hallDetails.trim()})` : hallVenue.trim();
    const finalMembers = examinersList.length > 0 ? examinersList : [panelChair.trim()];

    if (editingSessionId && updateDefenseSession) {
      updateDefenseSession(editingSessionId, {
        candidateName: finalCandidateName,
        candidateMatric: finalMatric,
        topic: candidateTopic,
        type: defenseType,
        venue: fullVenue,
        panelChair: panelChair.trim(),
        members: finalMembers,
        date: defenseDate,
        time: defenseTime,
      });
      showToast(`Defense session updated: ${finalCandidateName} at ${hallVenue}.`);
    } else {
      const sessionCode = `DEF-CSC-2026-${Math.floor(100 + Math.random() * 900)}`;
      addDefenseSession({
        sessionCode,
        type: defenseType,
        candidateName: finalCandidateName,
        candidateMatric: finalMatric,
        topic: candidateTopic,
        date: defenseDate,
        time: defenseTime,
        venue: fullVenue,
        panelChair: panelChair.trim() || 'Prof. Sarah N. Ibrahim',
        members: finalMembers,
        status: 'Scheduled',
      });
      showToast(`Defense session published for ${finalCandidateName} at ${hallVenue} with ${finalMembers.length} examiners.`);
    }

    setIsScheduleModalOpen(false);
    setEditingSessionId(null);
  };

  const auditLogs = [
    { actor: 'Prof. Sarah N. Ibrahim', role: 'Head of Department', timestamp: '2026-10-15 14:32:10 UTC', action: 'Approved final defense timetable and venue allocation for Panel A (Boardroom 102).' },
    { actor: 'Dr. Kolawole O. Alabi', role: 'Internal Supervisor', timestamp: '2026-10-15 11:20:05 UTC', action: 'Cleared Chapter 5 corrections for candidate Amina Bello (CSC/2021/0482).' },
    { actor: 'Prof. Charles U. Eze', role: 'Visiting External Examiner', timestamp: '2026-10-14 16:45:22 UTC', action: 'Submitted external viva voce score dossier and signed recommendation for candidate Ibrahim Musa Farouk.' },
    { actor: 'Admin Departmental Desk', role: 'System Admin', timestamp: '2026-10-14 09:12:00 UTC', action: 'Onboarded external supervisor Dr. Aminu Salisu and configured oral examination panel allocations.' },
    { actor: 'Dr. Victor Adeyemi', role: 'Internal Examiner', timestamp: '2026-10-13 15:08:44 UTC', action: 'Confirmed attendance and venue inspection for Computer Systems Lab Suite.' }
  ];

  // Helper for constituting new panel
  const handleConstitutePanelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPanelName.trim() || !newPanelVenue.trim()) {
      showToast('Please specify Panel Name and Hall/Venue.');
      return;
    }
    const newPanel = {
      id: `P-${Date.now()}`,
      name: newPanelName.trim(),
      chair: newPanelChair.trim() || 'Prof. Sarah N. Ibrahim',
      members: newPanelExaminers.length > 0 ? newPanelExaminers.join(', ') : 'Dr. Kolawole O. Alabi, Dr. Victor Adeyemi',
      venue: newPanelVenue.trim(),
      candidatesCount: 0,
    };
    setPanelsList(prev => [...prev, newPanel]);
    showToast(`Constituted ${newPanel.name} at ${newPanel.venue} with examiners appointed.`);
    setIsPanelModalOpen(false);
    setNewPanelName('');
    setNewPanelChair('');
    setNewPanelVenue('');
    setNewPanelExaminers([]);
  };

  // 1. ADMIN OVERVIEW (Renders bespoke luxury Admin Dashboard)
  if (activeView === 'overview') {
    return <AdminAndExternalDashboard initialRole="admin" />;
  }

  // MASTER USER ACCESS & ACTIVATION TABLE
  if (activeView === 'user_access') {
    return <UserAccessManagement />;
  }

  // DEPARTMENTAL SENATE BROADSHEET & FINAL GRADE COMPUTATION
  if (activeView === 'senate_broadsheet' || activeView === 'broadsheet') {
    return <DepartmentalSenateBroadsheet />;
  }

  // 2. STUDENT RECORDS
  if (activeView === 'students' || activeView === 'student_records') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Computer Science Student Research Roster</h2>
              <p className="text-xs text-slate-500">Filter and audit registered undergraduate project candidates across laboratory units</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch || ''}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search matric, name..."
                  className="rounded-full border border-slate-200 pl-8 pr-3.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="button"
                onClick={() => showToast('Exported complete 248 Student Records to CSV.')}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-3.5">Matric & Name</th>
                  <th className="py-3 px-3.5">Specialization</th>
                  <th className="py-3 px-3.5">Assigned Supervisor</th>
                  <th className="py-3 px-3.5">Plagiarism Rate</th>
                  <th className="py-3 px-3.5">Clearance</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registeredStudentCandidates
                  .filter(st => {
                    const matchesSearch = st.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                                          st.matric.toLowerCase().includes(studentSearch.toLowerCase());
                    const matchesDept = deptFilter === 'All' || st.dept === deptFilter;
                    return matchesSearch && matchesDept;
                  })
                  .map((st) => {
                    const studentAcc = accounts.find(a => a.identifier === st.matric || a.name === st.name);
                    const assignedSup = studentAcc?.assignedSupervisorName || st.supervisor;
                    return (
                      <tr key={st.matric} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3.5">
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{st.matric}</p>
                        </td>
                        <td className="py-3 px-3.5 font-medium">{st.dept}</td>
                        <td className="py-3 px-3.5 font-medium text-slate-800">
                          {assignedSup ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                              <UserCheck className="w-3 h-3 text-amber-700" />
                              <span>{assignedSup}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">Awaiting Allocation</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-emerald-700">{st.similarity}%</td>
                        <td className="py-3 px-3.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            st.clearance === 'Cleared' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {st.clearance}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {studentAcc && (
                              <button
                                type="button"
                                onClick={() => setAllocationTargetStudent(studentAcc)}
                                title="Allocate or reassign research supervisor"
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-1 text-[11px] font-bold cursor-pointer transition-colors"
                              >
                                <UserCheck className="w-3 h-3 text-amber-700" />
                                <span>{studentAcc.assignedSupervisorName ? 'Re-allocate' : 'Allocate'}</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setClearanceModalStudent(studentAcc || null);
                                setClearanceModalMatric(st.matric);
                                setIsClearanceModalOpen(true);
                              }}
                              title="Open Official Defense Clearance Slip"
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 px-2 py-1 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                            >
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              <span>Clearance</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => showToast(`Opened dossier for ${st.name}`)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 ml-1"
                            >
                              View Dossier
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Supervisor Allocation Modal in Student Records view */}
        <SupervisorAllocationModal
          isOpen={!!allocationTargetStudent}
          student={allocationTargetStudent}
          onClose={() => setAllocationTargetStudent(null)}
          onSuccess={() => setAllocationTargetStudent(null)}
        />

        {/* Defense Clearance Slip Modal in Student Records view */}
        <DefenseClearanceFormModal
          isOpen={isClearanceModalOpen}
          candidate={clearanceModalStudent}
          candidateMatric={clearanceModalMatric || undefined}
          onClose={() => {
            setIsClearanceModalOpen(false);
            setClearanceModalStudent(null);
            setClearanceModalMatric(null);
          }}
        />
      </div>
    );
  }

  // 3. SUPERVISOR MANAGEMENT
  if (activeView === 'supervisor_management') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Computer Science Supervisor Quota Allocation</h2>
              <p className="text-xs text-slate-500">Manage research bench supervision workloads across departmental academic staff</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Dispatched automated supervisor workload rebalancer.')}
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
            >
              Rebalance Workload
            </button>
          </div>

          <div className="space-y-3">
            {supervisors.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{s.name}</h3>
                    <span className="font-mono text-[11px] text-slate-400">({s.id})</span>
                    <span className="text-[11px] text-slate-500">· {s.rank}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{s.dept}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{s.assigned} / {s.quota}</span>
                    <span className="text-[11px] text-slate-400 block">Assigned Candidates</span>
                  </div>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${(s.assigned / s.quota) * 100}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Adjusted quota parameters for ${s.name}.`)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Adjust Quota
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 4. PANEL ALLOCATIONS
  if (activeView === 'panel_allocations') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Departmental Defense Panels Constitution</h2>
              <p className="text-xs text-slate-500">Appoint panel chairs and assign examiners to defense halls manually for 2025/2026 sessions</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPanelModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Constitute New Panel</span>
            </button>
          </div>

          <div className="space-y-4">
            {panelsList.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4.5 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="h-4 w-4 text-blue-600" />
                    <span>{p.name}</span>
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800">
                    {p.candidatesCount} Docket Candidates
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Panel Chair:</strong> {p.chair}</p>
                  <p><strong>Appointed Examiners:</strong> {p.members}</p>
                  <p className="flex items-center gap-1.5 text-slate-700">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    <strong>Allocated Hall / Venue:</strong> {p.venue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Constitute Panel Modal */}
        {isPanelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Constitute Defense Panel</h3>
                  <p className="text-xs text-slate-500">Add custom examiners and designate examination hall manually</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPanelModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleConstitutePanelSubmit} className="space-y-4 text-xs overflow-y-auto pr-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Panel Name & Category</label>
                  <input
                    type="text"
                    value={newPanelName || ''}
                    onChange={(e) => setNewPanelName(e.target.value)}
                    placeholder="e.g. Defense Panel D (Distributed Computing & AI)"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Allocated Defense Hall / Venue (Manual Entry)
                  </label>
                  <input
                    type="text"
                    value={newPanelVenue || ''}
                    onChange={(e) => setNewPanelVenue(e.target.value)}
                    placeholder="e.g. Computing Boardroom 102, Hall 3B, Lecture Theater A"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    required
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-semibold self-center">Quick Presets:</span>
                    {[
                      'Computing Boardroom 102',
                      'PG Seminar Room 1',
                      'Distributed Systems & Cloud Suite',
                      'Lecture Theater B',
                      'Senate Chamber'
                    ].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setNewPanelVenue(h)}
                        className="rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 text-[10px] text-slate-600 transition-colors"
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Panel Chair / Lead Examiner</label>
                  <input
                    type="text"
                    value={newPanelChair || ''}
                    onChange={(e) => setNewPanelChair(e.target.value)}
                    placeholder="e.g. Prof. Sarah N. Ibrahim (HOD / Chair)"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">
                      Appointed Examiners ({newPanelExaminers.length})
                    </label>
                  </div>
                  {newPanelExaminers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {newPanelExaminers.map((ex, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] text-blue-800 font-medium"
                        >
                          <Award className="h-3 w-3 text-blue-600" />
                          <span>{ex}</span>
                          <button
                            type="button"
                            onClick={() => setNewPanelExaminers(prev => prev.filter((_, i) => i !== idx))}
                            className="text-blue-500 hover:text-rose-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={panelExaminerInput || ''}
                      onChange={(e) => setPanelExaminerInput(e.target.value)}
                      placeholder="Add examiner manually (e.g. Dr. Aminu Salisu)"
                      className="flex-1 rounded-xl border border-slate-200 p-2 text-xs focus:border-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!panelExaminerInput.trim()) return;
                        setNewPanelExaminers(prev => [...prev, panelExaminerInput.trim()]);
                        setPanelExaminerInput('');
                      }}
                      className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPanelModalOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs text-xs"
                  >
                    Constitute Panel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. DEFENSE SCHEDULING
  if (activeView === 'scheduling' || activeView === 'defense_scheduling') {
    // Merge context defenseSessions with default records for a comprehensive docket
    const allDefenseSessions = [
      ...defenseSessions,
      ...(defenseSessions.length === 0 ? [
        {
          id: 'def_01',
          sessionCode: 'DEF-CSC-2026-081',
          type: 'Internal Defense' as const,
          candidateName: 'Amina Bello',
          candidateMatric: 'CSC/2021/0482',
          topic: 'Comparative Genomic Profiling of Multidrug-Resistant ESBL-Producing Enterobacteriaceae',
          date: '2026-10-15',
          time: '10:00 AM',
          venue: 'Computing Boardroom 102',
          panelChair: 'Prof. Sarah N. Ibrahim',
          members: ['Dr. Kolawole O. Alabi (Supervisor)', 'Dr. Victor Adeyemi (Internal Examiner)', 'Dr. Aminu Salisu (Internal Examiner)'],
          status: 'Scheduled' as const,
        },
        {
          id: 'def_02',
          sessionCode: 'DEF-CSC-2026-082',
          type: 'Internal Defense' as const,
          candidateName: 'Zainab Kabir Usman',
          candidateMatric: 'CSC/2021/0390',
          topic: 'Antimicrobial and Phytochemical Profiling of Medicinal Plants on Acinetobacter',
          date: '2026-10-15',
          time: '11:15 AM',
          venue: 'Computing Boardroom 102',
          panelChair: 'Prof. Sarah N. Ibrahim',
          members: ['Dr. Victor Adeyemi (Internal Examiner)', 'Dr. B. K. Balogun (Internal Examiner)'],
          status: 'Scheduled' as const,
        },
        {
          id: 'def_03',
          sessionCode: 'DEF-CSC-2026-095',
          type: 'Proposal Defense' as const,
          candidateName: 'Ibrahim Musa Farouk',
          candidateMatric: 'CSC/2021/0445',
          topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks',
          date: '2026-10-16',
          time: '09:00 AM',
          venue: 'Computer Systems Lab Suite',
          panelChair: 'Dr. Victor Adeyemi',
          members: ['Dr. Aminu Salisu (Internal Examiner)', 'Prof. Charles U. Eze (External Examiner - UNILAG)'],
          status: 'Scheduled' as const,
        },
      ] : [])
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Master Defense Timetable Scheduling</h2>
              <p className="text-xs text-slate-500">Plan dates, designate exact examination halls, and manually appoint oral defense examiners</p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreateSession}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule New Session</span>
            </button>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 mb-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <div className="text-xs text-emerald-900">
              <strong>Timetable Conflict Detector: </strong> All scheduled defense panels have verified examination halls and no chamber collisions or overlapping examiner bookings.
            </div>
          </div>

          <div className="space-y-3.5">
            {allDefenseSessions.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 sm:p-5 text-xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {item.sessionCode}
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {item.candidateName}
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        ({item.candidateMatric})
                      </span>
                      <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {item.topic}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSession(item)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-blue-600" />
                      <span>Edit Venue/Examiners</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Official summons dispatched to candidate & examiners for ${item.sessionCode}.`)}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
                    >
                      <Send className="h-3 w-3" />
                      <span>Dispatch Notice</span>
                    </button>
                    {deleteDefenseSession && (
                      <button
                        type="button"
                        onClick={() => deleteDefenseSession(item.id)}
                        className="rounded-full p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Venue and Timing Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div className="flex items-start gap-2 bg-white/80 rounded-xl p-2.5 border border-slate-200/60">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned Examination Hall / Venue
                      </span>
                      <strong className="text-slate-900 font-extrabold text-xs">
                        {item.venue}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 bg-white/80 rounded-xl p-2.5 border border-slate-200/60">
                    <Calendar className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Date & Scheduled Time
                      </span>
                      <strong className="text-slate-900 font-extrabold text-xs">
                        {item.date} at {item.time}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Examiners Committee Roster */}
                <div className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <Award className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Lead Examiner / Panel Chair:</span>
                    <span className="text-blue-900 font-extrabold">{item.panelChair}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="font-bold text-slate-700">Appointed Examiners:</span>
                    {Array.isArray(item.members) && item.members.length > 0 ? (
                      item.members.map((member, mIdx) => (
                        <span
                          key={mIdx}
                          className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-800 shadow-2xs"
                        >
                          <UserCheck className="h-3 w-3 text-blue-600" />
                          <span>{member}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Chief Examiner as sole moderator</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Schedule Defense Appearance with Manual Examiner & Hall Addition */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[92vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingSessionId ? 'Edit Defense Appearance, Hall & Examiners' : 'Schedule Defense Appearance'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manually specify examination hall, venue details, panel chair, and oral defense examiners.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
                {/* 1. Candidate Selection */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800">
                      Undergraduate Candidate
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {registeredStudentCandidates.length} Active Candidates Available
                    </span>
                  </div>

                  {!isCustomCandidate ? (
                    <div>
                      <select
                        value={candidateMatric || ''}
                        onChange={(e) => handleCandidateChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-blue-600 focus:outline-none"
                      >
                        {registeredStudentCandidates.map((c) => (
                          <option key={c.matric} value={c.matric}>
                            {c.name} ({c.matric}) – {c.dept}
                          </option>
                        ))}
                        <option value="custom">➕ Enter Custom / Unlisted Candidate...</option>
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Candidate Full Name</label>
                          <input
                            type="text"
                            value={customCandidateName || ''}
                            onChange={(e) => setCustomCandidateName(e.target.value)}
                            placeholder="e.g. Maryam Danjuma"
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-blue-600 focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Matriculation Number</label>
                          <input
                            type="text"
                            value={customCandidateMatric || ''}
                            onChange={(e) => setCustomCandidateMatric(e.target.value)}
                            placeholder="e.g. CSC/2021/0999"
                            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-blue-600 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCandidate(false);
                          setCandidateMatric('CSC/2021/0482');
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        ← Back to registered roster list
                      </button>
                    </div>
                  )}

                  {/* Defense Stage */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Defense Stage</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'Proposal Defense', label: 'Proposal Defense' },
                        { key: 'Internal Defense', label: 'Internal Defense' },
                        { key: 'Final External Defense', label: 'Final External' },
                      ].map(stage => (
                        <button
                          key={stage.key}
                          type="button"
                          onClick={() => setDefenseType(stage.key as any)}
                          className={`rounded-xl py-1.5 px-2 text-center text-[11px] font-bold border transition-colors ${
                            defenseType === stage.key
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Research Project Topic</label>
                    <input
                      type="text"
                      value={candidateTopic || ''}
                      onChange={(e) => setCandidateTopic(e.target.value)}
                      placeholder="e.g. Isolation & Genomic Characterization..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 2. MANUAL HALL / VENUE ENTRY */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span>Defense Hall / Venue (Manual Entry)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Accurate Location
                    </span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={hallVenue || ''}
                      onChange={(e) => setHallVenue(e.target.value)}
                      placeholder="Type defense hall / venue manually (e.g. Computing Boardroom 102, Hall 3B)"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Quick-select venue presets that immediately populate the manual text input */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      Quick Suggestions (Click to fill or edit):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Computing Boardroom 102',
                        'Postgraduate Seminar Room 1',
                        'Distributed Systems & Cloud Computing Lab Suite',
                        'Faculty Lecture Theater A',
                        'Senate Conference Hall',
                        'Software Systems Annex Hall 3'
                      ].map((presetHall) => (
                        <button
                          key={presetHall}
                          type="button"
                          onClick={() => setHallVenue(presetHall)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                            hallVenue === presetHall
                              ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {presetHall}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Hall / Room Details */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                      Additional Room Notes / Wing (Optional)
                    </label>
                    <input
                      type="text"
                      value={hallDetails || ''}
                      onChange={(e) => setHallDetails(e.target.value)}
                      placeholder="e.g. 1st Floor, Main Faculty of Computing Wing"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 3. APPOINT EXAMINERS COMMITTEE (MANUAL ENTRY) */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-800 flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span>Appoint Panel Examiners (Manual Entry)</span>
                    </label>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {examinersList.length} Appointed
                    </span>
                  </div>

                  {/* Panel Chair / Chief Examiner */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Lead Examiner / Panel Chair
                    </label>
                    <input
                      type="text"
                      value={panelChair || ''}
                      onChange={(e) => setPanelChair(e.target.value)}
                      placeholder="Type lead examiner name & title manually"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium focus:border-blue-600 focus:outline-none"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 self-center">Presets:</span>
                      {[
                        'Prof. Sarah N. Ibrahim (HOD / Chair)',
                        'Prof. Charles U. Eze (Visiting External)',
                        'Dr. Victor Adeyemi (Associate Professor)',
                        'Dr. Aminu Salisu (Senior Lecturer)'
                      ].map(ch => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => setPanelChair(ch)}
                          className="rounded-lg bg-white border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {ch.split('(')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currently Appointed Examiners List */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Appointed Examiners Committee Members
                    </label>
                    {examinersList.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic bg-white p-2.5 rounded-xl border border-dashed border-slate-200 text-center">
                        No additional examiners appointed yet. Use the field below to add examiners manually.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {examinersList.map((ex, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-300 px-2.5 py-1 text-xs text-slate-800 shadow-2xs"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            <span className="font-semibold">{ex}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExaminer(idx)}
                              className="text-slate-400 hover:text-rose-600 p-0.5 ml-1 transition-colors"
                              title="Remove examiner"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Manual Add Examiner Form */}
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Add New Examiner Manually:
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newExaminerName || ''}
                        onChange={(e) => setNewExaminerName(e.target.value)}
                        placeholder="Examiner name & title (e.g. Dr. Aminu Salisu)"
                        className="flex-1 rounded-xl border border-slate-200 p-2 text-xs focus:border-blue-600 focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddExaminer();
                          }
                        }}
                      />
                      <select
                        value={newExaminerRole || ''}
                        onChange={(e) => setNewExaminerRole(e.target.value)}
                        className="rounded-xl border border-slate-200 p-2 text-xs bg-slate-50 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="Internal Examiner">Internal Examiner</option>
                        <option value="External Examiner">External Examiner</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Panel Moderator">Panel Moderator</option>
                        <option value="Reader">Reader</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddExaminer}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-2xs shrink-0"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Add Examiner</span>
                      </button>
                    </div>

                    {/* Quick-add faculty member chips */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                        Quick Add Departmental Faculty:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Dr. Kolawole O. Alabi', role: 'Supervisor' },
                          { name: 'Dr. Victor Adeyemi', role: 'Internal Examiner' },
                          { name: 'Dr. Aminu Salisu', role: 'Internal Examiner' },
                          { name: 'Prof. Charles U. Eze', role: 'External Examiner (UNILAG)' },
                          { name: 'Dr. (Mrs) T. E. Johnson', role: 'Internal Examiner' },
                          { name: 'Dr. B. K. Balogun', role: 'Panel Reader' },
                        ].map(fac => (
                          <button
                            key={fac.name}
                            type="button"
                            onClick={() => handleQuickAddExaminer(fac.name, fac.role)}
                            className="rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-2 py-0.5 text-[10px] text-slate-700 font-medium transition-colors"
                          >
                            + {fac.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Date & Time Slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Defense Date</label>
                    <input
                      type="date"
                      value={defenseDate || ''}
                      onChange={(e) => setDefenseDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-blue-600 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={defenseTime || ''}
                      onChange={(e) => setDefenseTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:border-blue-600 focus:outline-none"
                      required
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['09:00 AM', '10:00 AM', '11:15 AM', '01:30 PM', '02:30 PM'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDefenseTime(slot)}
                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                            defenseTime === slot ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200">
                  <div className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">Venue:</span> {hallVenue || 'Not selected'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(false)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-md active:scale-98 text-xs transition-colors"
                    >
                      {editingSessionId ? 'Save Changes' : 'Confirm & Publish'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 6. SYSTEM REPORTS
  if (activeView === 'system_reports') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Computer Science Academic Performance & Supervision Reports</h2>
              <p className="text-xs text-slate-500">Comprehensive project statistics for Senate Committee on Academic Standards</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Generated Official Senate Project Dossier (PDF).')}
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Senate Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4.5">
              <h3 className="text-xs font-extrabold text-slate-900 mb-3">Topic Clearance by Computing Specialization</h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Artificial Intelligence & Machine Learning', count: 88, pct: 96 },
                  { name: 'Distributed Systems & Cloud Computing', count: 62, pct: 94 },
                  { name: 'Cybersecurity & Cryptography', count: 54, pct: 92 },
                  { name: 'Data Engineering & Analytics', count: 44, pct: 95 },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-slate-600">{d.name} ({d.count})</span>
                    <span className="font-bold text-slate-900">{d.pct}% Approved</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4.5">
              <h3 className="text-xs font-extrabold text-slate-900 mb-3">Turnitin Plagiarism Compliance</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-emerald-700 font-semibold">Under 15% (Fully Compliant):</span>
                  <span className="font-bold text-slate-900">238 Candidates (96%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-amber-700 font-semibold">15% - 20% (Minor Revisions):</span>
                  <span className="font-bold text-slate-900">8 Candidates (3%)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-rose-700 font-semibold">Above 20% (Flagged):</span>
                  <span className="font-bold text-slate-900">2 Candidates (1%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. AUDIT LOGS
  if (activeView === 'audit_logs') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Immutable System Audit Trail</h2>
              <p className="text-xs text-slate-500">Cryptographically verifiable actions and evaluation ledger records</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Compliance Verified</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3.5 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-slate-900">{log.actor} · <span className="text-blue-600 font-medium">{log.role}</span></span>
                  <span className="font-mono text-[11px] text-slate-400">{log.timestamp}</span>
                </div>
                <p className="text-slate-600">{log.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <AdminAndExternalDashboard />;
};
