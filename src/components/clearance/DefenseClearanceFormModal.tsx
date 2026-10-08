import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Building2, 
  Calendar, 
  User, 
  BookOpen,
  Plus,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DefenseClearanceForm, DefenseStage, DefenseCriterion, UserAccount } from '../../types';

interface DefenseClearanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: UserAccount | null;
  candidateMatric?: string;
  initialStage?: DefenseStage;
  isReadOnly?: boolean;
}

// -------------------------------------------------------------
// Default Criteria per Defense Phase (Standard Statutory Rubrics)
// -------------------------------------------------------------
const PROPOSAL_CRITERIA_LIST = [
  'Title approved',
  'Template followed',
  'Introduction satisfactory',
  'Background adequate',
  'Problem statement clear',
  'Motivation appropriate',
  'Objectives clear',
  'Scope defined',
  'Methodology sound',
  'Literature adequate',
  'References correct',
  'Formatting satisfactory',
  'Suitable for defense',
];

const INTERNAL_CRITERIA_LIST = [
  'Proposal defense corrections effected',
  'Template & dissertation guideline followed',
  'Chapter 1-3 methodology & experimental design implemented',
  'Laboratory benchwork / system implementation verified',
  'Results & empirical data analysis sound',
  'Similarity index (Turnitin) within threshold (<15%)',
  'Discussion aligns with research objectives',
  'Ethical and biosafety clearances verified',
  'References & bibliography formatted correctly',
  'Presentation slides and viva preparedness adequate',
  'Formatting & binding guidelines satisfied',
  'Suitable for defense',
];

const EXTERNAL_CRITERIA_LIST = [
  'Internal defense panel corrections incorporated',
  'Complete thesis dissertation manuscript submitted',
  'Scientific & research originality demonstrated',
  'Research contribution to field established',
  'Methodology and analytical data reproducibility verified',
  'Turnitin plagiarism compliance certificate attached',
  'Oral viva defense presentation poise satisfactory',
  'Candidate defended questions & critiques convincingly',
  'Laboratory logbook & source code repository endorsed',
  'References, citations & appendices verified',
  'Formatting and university bindery standards met',
  'Suitable for defense',
];

export const DefenseClearanceFormModal: React.FC<DefenseClearanceFormModalProps> = ({
  isOpen,
  onClose,
  candidate,
  candidateMatric,
  initialStage = 'proposal',
  isReadOnly = false,
}) => {
  const { 
    currentUser, 
    currentRole,
    accounts, 
    studentProject, 
    defenseClearances, 
    saveDefenseClearance, 
    showToast,
    customStageCriteria,
    addCustomCriterionToStage,
  } = useApp();

  const isInternalSupervisor = currentRole === 'internal_supervisor' || currentUser?.role === 'internal_supervisor';
  const isExternalSupervisor = currentRole === 'external_supervisor' || currentUser?.role === 'external_supervisor';

  const defaultStage = initialStage || (isExternalSupervisor ? 'external' : 'proposal');
  const [activeStage, setActiveStage] = useState<DefenseStage>(defaultStage);
  const [selectedMatric, setSelectedMatric] = useState<string>(
    candidateMatric || candidate?.identifier || (currentUser?.role === 'student' ? currentUser.identifier || '' : '')
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [newCriterionText, setNewCriterionText] = useState<string>('');
  const [isAddingCriterion, setIsAddingCriterion] = useState<boolean>(false);

  // Sync stage and candidate when modal opens or props change
  useEffect(() => {
    if (initialStage) {
      setActiveStage(initialStage);
    } else if (isExternalSupervisor) {
      setActiveStage('external');
    } else {
      setActiveStage('proposal');
    }

    if (candidateMatric) {
      setSelectedMatric(candidateMatric);
    } else if (candidate?.identifier) {
      setSelectedMatric(candidate.identifier);
    } else if (currentUser?.role === 'student' && currentUser.identifier) {
      setSelectedMatric(currentUser.identifier);
    }
  }, [initialStage, candidateMatric, candidate, currentUser, isOpen, isInternalSupervisor, isExternalSupervisor]);

  // Student accounts list for evaluator dropdown
  const studentAccounts = accounts.filter(a => a.role === 'student');

  // Identify target candidate account
  const targetAccount = accounts.find(a => a.identifier === selectedMatric || a.id === selectedMatric) ||
    candidate ||
    (currentUser?.role === 'student' ? currentUser : null) ||
    accounts.find(a => a.role === 'student') ||
    currentUser;

  const targetMatric = targetAccount?.identifier || selectedMatric || '20/55777U/1';
  const targetName = targetAccount?.name || 'Mariya Isa';
  const targetProgramme = targetAccount?.department || 'Department of Computer Science';
  const targetLevel = targetAccount?.level || '400 Level';
  const targetSupervisor = targetAccount?.assignedSupervisorName || 'Dr. Ismail Zahradeen Yakubu';
  const targetTitle = targetAccount?.projectTopic || studentProject?.topicTitle || 'Smart Industrial Environmental Theft Monitoring System Standard Cost Estimate';
  const targetFaculty = targetAccount?.faculty || 'FACULTY OF COMPUTING';
  const targetInstitution = 'ABUBAKAR TAFAWA BALEWA UNIVERSITY, BAUCHI (ATBU)';
  const targetDept = targetAccount?.department || 'DEPARTMENT OF COMPUTER SCIENCE';

  // Build criteria list helper including dynamically added criteria
  const getCriteriaListForStage = (stage: DefenseStage): DefenseCriterion[] => {
    let rawList = PROPOSAL_CRITERIA_LIST;
    if (stage === 'internal') rawList = INTERNAL_CRITERIA_LIST;
    if (stage === 'external') rawList = EXTERNAL_CRITERIA_LIST;

    const customItems = customStageCriteria?.[stage] || [];
    const combined = [...rawList];
    customItems.forEach(item => {
      if (!combined.some(c => c.toLowerCase() === item.toLowerCase())) {
        combined.push(item);
      }
    });

    return combined.map((c, idx) => ({
      id: `crit_${stage}_${idx + 1}`,
      criterion: c,
      approved: true, // Default to Yes as in formal clearance slips
    }));
  };

  const getFormTitleForStage = (stage: DefenseStage): string => {
    switch (stage) {
      case 'proposal':
        return 'FINAL YEAR PROJECT PROPOSAL DEFENSE CLEARANCE FORM';
      case 'internal':
        return 'FINAL YEAR PROJECT INTERNAL DEFENSE CLEARANCE FORM';
      case 'external':
        return 'FINAL YEAR PROJECT EXTERNAL DEFENSE CLEARANCE / ASSESSMENT FORM';
    }
  };

  // Form states
  const [criteria, setCriteria] = useState<DefenseCriterion[]>(() => getCriteriaListForStage(initialStage));
  const [recommendation, setRecommendation] = useState<'cleared' | 'not_cleared'>('cleared');
  const [comments, setComments] = useState<string>('Satisfactory');
  const [supervisorNameInput, setSupervisorNameInput] = useState<string>(targetSupervisor);
  const [dateInput, setDateInput] = useState<string>('23 August 2026');
  const [signatureInput, setSignatureInput] = useState<string>(targetSupervisor);

  // Statutory Project Scoring Rubric Components
  // Software Design & Quality (30 marks), Presentation (20 marks), Project Reports & Documentation (30 marks), Response to Questions (20 marks)
  const [softwareDesignScore, setSoftwareDesignScore] = useState<number>(24);
  const [presentationScore, setPresentationScore] = useState<number>(16);
  const [projectReportsScore, setProjectReportsScore] = useState<number>(23);
  const [responseToQuestionsScore, setResponseToQuestionsScore] = useState<number>(15);

  // Composite Total Score & Letter Grade
  const totalCompositeScore = Math.min(100, Math.max(0, 
    (Number(softwareDesignScore) || 0) + 
    (Number(presentationScore) || 0) + 
    (Number(projectReportsScore) || 0) + 
    (Number(responseToQuestionsScore) || 0)
  ));

  const compositeGrade = useMemo(() => {
    if (totalCompositeScore >= 70) return { grade: 'A', text: 'First Class (Distinction)', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (totalCompositeScore >= 60) return { grade: 'B', text: 'Second Class Upper (Very Good)', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (totalCompositeScore >= 50) return { grade: 'C', text: 'Second Class Lower (Good)', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    if (totalCompositeScore >= 45) return { grade: 'D', text: 'Third Class (Pass)', color: 'text-stone-700 bg-stone-100 border-stone-300' };
    return { grade: 'F', text: 'Fail (Revisions Required)', color: 'text-rose-700 bg-rose-50 border-rose-300' };
  }, [totalCompositeScore]);

  // Load existing clearance from state or initialize
  useEffect(() => {
    if (!isOpen) return;

    const existing = defenseClearances.find(
      c => c.candidateMatric === targetMatric && c.defenseType === activeStage
    );

    if (existing) {
      setCriteria(existing.criteria);
      setRecommendation(existing.recommendation);
      setComments(existing.comments || 'Satisfactory');
      setSupervisorNameInput(existing.evaluatorName || targetSupervisor);
      setDateInput(existing.date || '23 August 2026');
      setSignatureInput(existing.signature || existing.evaluatorName || targetSupervisor);

      if (existing.scores) {
        setSoftwareDesignScore(existing.scores.softwareDesign ?? (activeStage === 'external' ? 27 : activeStage === 'internal' ? 26 : 24));
        setPresentationScore(existing.scores.presentation ?? (activeStage === 'external' ? 18 : activeStage === 'internal' ? 17 : 16));
        setProjectReportsScore(existing.scores.projectReports ?? (activeStage === 'external' ? 26 : activeStage === 'internal' ? 25 : 23));
        setResponseToQuestionsScore(existing.scores.responseToQuestions ?? (activeStage === 'external' ? 17 : activeStage === 'internal' ? 16 : 15));
      } else {
        setSoftwareDesignScore(activeStage === 'external' ? 27 : activeStage === 'internal' ? 26 : 24);
        setPresentationScore(activeStage === 'external' ? 18 : activeStage === 'internal' ? 17 : 16);
        setProjectReportsScore(activeStage === 'external' ? 26 : activeStage === 'internal' ? 25 : 23);
        setResponseToQuestionsScore(activeStage === 'external' ? 17 : activeStage === 'internal' ? 16 : 15);
      }
    } else {
      setCriteria(getCriteriaListForStage(activeStage));
      setRecommendation('cleared');
      setComments('Satisfactory');
      const defaultEvaluator = activeStage === 'external' ? 'Prof. Charles U. Eze' : targetSupervisor;
      setSupervisorNameInput(defaultEvaluator);
      setDateInput(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
      setSignatureInput(currentUser?.name || defaultEvaluator);

      setSoftwareDesignScore(activeStage === 'external' ? 27 : activeStage === 'internal' ? 26 : 24);
      setPresentationScore(activeStage === 'external' ? 18 : activeStage === 'internal' ? 17 : 16);
      setProjectReportsScore(activeStage === 'external' ? 26 : activeStage === 'internal' ? 25 : 23);
      setResponseToQuestionsScore(activeStage === 'external' ? 17 : activeStage === 'internal' ? 16 : 15);
    }
  }, [isOpen, activeStage, targetMatric, defenseClearances]);

  if (!isOpen) return null;

  // Toggle single criterion Yes / No
  const handleToggleCriterion = (id: string, isApproved: boolean) => {
    if (isReadOnly) return;
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, approved: isApproved } : c));
  };

  // Mark all Yes / No helpers
  const handleMarkAll = (approved: boolean) => {
    if (isReadOnly) return;
    setCriteria(prev => prev.map(c => ({ ...c, approved })));
    if (approved) {
      setRecommendation('cleared');
      setComments('Satisfactory. All criteria met and candidate is fully cleared.');
    } else {
      setRecommendation('not_cleared');
      setComments('Requires revisions before authorization.');
    }
  };

  const handleResetCriteria = () => {
    if (isReadOnly) return;
    setCriteria(getCriteriaListForStage(activeStage));
    setRecommendation('cleared');
    setComments('Satisfactory');
  };

  const handleAddCustomCriterion = async () => {
    if (!newCriterionText.trim() || isReadOnly) return;
    const trimmed = newCriterionText.trim();
    const newCrit: DefenseCriterion = {
      id: `crit_${activeStage}_custom_${Date.now()}`,
      criterion: trimmed,
      approved: true,
    };
    setCriteria(prev => [...prev, newCrit]);
    setNewCriterionText('');
    setIsAddingCriterion(false);

    // Instantly replicate new criterion to the student's slip and persistent criteria store
    if (addCustomCriterionToStage) {
      await addCustomCriterionToStage(activeStage, trimmed, targetMatric);
    }
  };

  const handleRemoveCriterion = (id: string) => {
    if (isReadOnly) return;
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleSetToday = () => {
    if (isReadOnly) return;
    setDateInput(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  };

  // Submit / Save form to Firestore
  const handleSaveForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const docId = `clr_${targetMatric.replace(/[^a-zA-Z0-9_-]/g, '_')}_${activeStage}`;
    const formRecord: DefenseClearanceForm = {
      id: docId,
      candidateMatric: targetMatric,
      candidateName: targetName,
      programme: targetProgramme,
      level: targetLevel,
      supervisorName: supervisorNameInput || targetSupervisor,
      supervisorId: targetAccount?.assignedSupervisorId || '',
      projectTitle: targetTitle,
      defenseType: activeStage,
      institutionName: targetInstitution,
      facultyName: targetFaculty,
      departmentName: targetDept,
      formTitle: getFormTitleForStage(activeStage),
      criteria,
      scores: {
        softwareDesign: Number(softwareDesignScore) || 0,
        presentation: Number(presentationScore) || 0,
        projectReports: Number(projectReportsScore) || 0,
        responseToQuestions: Number(responseToQuestionsScore) || 0,
        totalScore: totalCompositeScore,
        letterGrade: compositeGrade.grade,
      },
      recommendation,
      comments: comments.trim() || 'Satisfactory',
      evaluatorName: supervisorNameInput || targetSupervisor,
      evaluatorRole: activeStage === 'external' ? 'External Examiner' : 'Internal Project Supervisor',
      date: dateInput,
      signature: signatureInput,
      status: recommendation === 'cleared' ? 'Endorsed' : 'Rejected',
      endorsedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await saveDefenseClearance(formRecord);
      if (res.success) {
        showToast(`Official ${activeStage.toUpperCase()} Defense Clearance Form saved and synced with cloud database.`);
        onClose();
      } else {
        showToast(res.message || 'Could not save clearance form.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving clearance form to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      {/* Outer Modal Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-300 my-auto max-h-[96vh] flex flex-col overflow-hidden">
        
        {/* ========================================================= */}
        {/* TOP MODAL TOOLBAR (Non-printable)                         */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1A1A1A] text-white px-4 sm:px-6 py-3 border-b border-stone-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#CBA358] text-[#1A1A1A] shrink-0">
              <FileCheck className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
                Official Defense Clearance Form
              </h2>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                {targetName} · <span className="font-mono text-stone-300">{targetMatric}</span>
              </p>
            </div>
          </div>

          {/* Defense Phase Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <div className="inline-flex p-1 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-bold shrink-0">
              <button
                type="button"
                onClick={() => setActiveStage('proposal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeStage === 'proposal'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Proposal Defense Slip
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('internal')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeStage === 'internal'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Internal Defense Slip
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('external')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeStage === 'external'
                    ? 'bg-[#CBA358] text-[#1A1A1A] shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                External Defense Slip
              </button>
            </div>

            {/* Print & Close */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button
                type="button"
                onClick={handlePrint}
                title="Print official clearance slip or export to PDF"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-700 px-3 py-1.5 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-[#CBA358]" />
                <span className="hidden sm:inline">Print / PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="h-8 w-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EVALUATOR CONTROLS BAR (Non-printable)                    */}
        {/* ========================================================= */}
        {!isReadOnly && (
          <div className="bg-stone-50 border-b border-stone-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs text-stone-700 shrink-0 print:hidden">
            {/* Student Switcher for Staff / Admin */}
            {currentUser?.role !== 'student' && studentAccounts.length > 1 ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-600 text-[11px] uppercase tracking-wider">Candidate:</span>
                <select
                  value={selectedMatric || ''}
                  onChange={(e) => setSelectedMatric(e.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 focus:outline-none focus:border-black cursor-pointer max-w-[220px] sm:max-w-xs truncate"
                >
                  {studentAccounts.map(stu => (
                    <option key={stu.id} value={stu.identifier || stu.id}>
                      {stu.name} ({stu.identifier})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <Sparkles className="h-3.5 w-3.5 text-[#CBA358]" />
                <span>Statutory Examination Rubric for <strong className="text-stone-800">{activeStage.toUpperCase()}</strong> Defense</span>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => handleMarkAll(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 cursor-pointer transition-all active:scale-95"
              >
                <Check className="h-3 w-3" />
                <span>Mark All Yes</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkAll(false)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 hover:text-rose-950 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-300 cursor-pointer transition-all active:scale-95"
              >
                <X className="h-3 w-3" />
                <span>Mark All No</span>
              </button>

              <button
                type="button"
                onClick={handleResetCriteria}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 hover:text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-300 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddingCriterion(!isAddingCriterion)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="h-3 w-3 text-amber-700" />
                <span>+ Add Criterion</span>
              </button>
            </div>
          </div>
        )}

        {/* Add custom criterion expandable input */}
        {isAddingCriterion && !isReadOnly && (
          <div className="bg-amber-50/70 border-b border-amber-200 px-4 sm:px-6 py-2.5 flex items-center gap-2 print:hidden animate-in fade-in duration-150">
            <input
              type="text"
              value={newCriterionText || ''}
              onChange={(e) => setNewCriterionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomCriterion();
                }
              }}
              placeholder="Type new assessment criterion (e.g. Statistical replicate analysis verified)..."
              className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-amber-600"
            />
            <button
              type="button"
              onClick={handleAddCustomCriterion}
              className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-amber-700 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCriterion(false)}
              className="rounded-lg bg-stone-200 px-2.5 py-1.5 text-xs text-stone-600 hover:bg-stone-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCROLLABLE DOCUMENT CONTAINER (Official Paper Template)   */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-6 md:p-8 bg-stone-100/70">
          
          {/* Printable Document Sheet matching the exact official template */}
          <div 
            id="defense-clearance-document"
            className="mx-auto max-w-3xl bg-white p-4 sm:p-8 md:p-10 shadow-lg border border-stone-300 text-black font-sans print:shadow-none print:border-none print:p-0 print:m-0"
            style={{ minHeight: '900px' }}
          >
            {/* ========================================================= */}
            {/* INSTITUTIONAL HEADER BOX (Matching Exact Template Frame)   */}
            {/* ========================================================= */}
            <div className="border-2 border-black p-3 sm:p-4 text-center mb-5 sm:mb-6">
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-wider uppercase leading-tight text-black">
                {targetInstitution}
              </h1>
              <h2 className="text-[11px] sm:text-xs md:text-sm font-extrabold uppercase mt-0.5 tracking-wide text-black">
                {targetFaculty}
              </h2>
              <h3 className="text-[10px] sm:text-[11px] md:text-xs font-bold uppercase mt-0.5 tracking-wide text-stone-800">
                {targetDept}
              </h3>
              <div className="mt-2 pt-1.5 border-t border-black">
                <h4 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-wider text-black">
                  {getFormTitleForStage(activeStage)}
                </h4>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION A — STUDENT INFORMATION                           */}
            {/* ========================================================= */}
            <div className="mb-5 sm:mb-6">
              <div className="border-b border-black pb-1 mb-2.5">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  SECTION A — STUDENT INFORMATION
                </h5>
              </div>

              <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
                {/* Row 1: Student Name & Matric No */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-baseline">
                  <div className="sm:col-span-7 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-28 shrink-0 text-black">Student Name:</span>
                    <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 truncate">
                      {targetName}
                    </span>
                  </div>
                  <div className="sm:col-span-5 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-24 sm:w-20 shrink-0 text-black">Matric No.:</span>
                    <span className="flex-1 font-mono font-medium text-black border-b border-stone-400 pb-0.5 px-1">
                      {targetMatric}
                    </span>
                  </div>
                </div>

                {/* Row 2: Programme & Level */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-baseline">
                  <div className="sm:col-span-7 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-28 shrink-0 text-black">Programme:</span>
                    <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 truncate">
                      {targetProgramme}
                    </span>
                  </div>
                  <div className="sm:col-span-5 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-24 sm:w-20 shrink-0 text-black">Level:</span>
                    <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1">
                      {targetLevel}
                    </span>
                  </div>
                </div>

                {/* Row 3: Supervisor */}
                <div className="flex flex-wrap sm:flex-nowrap items-baseline">
                  <span className="font-bold w-28 shrink-0 text-black">Supervisor:</span>
                  <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1">
                    {targetSupervisor}
                  </span>
                </div>

                {/* Row 4: Project Title */}
                <div className="flex flex-wrap sm:flex-nowrap items-baseline pt-0.5">
                  <span className="font-bold w-28 shrink-0 text-black self-start">Project Title:</span>
                  <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 leading-snug">
                    {targetTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION B — ASSESSMENT CRITERIA                           */}
            {/* ========================================================= */}
            <div className="mb-5 sm:mb-6">
              <div className="border-b border-black pb-1 mb-2">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  {activeStage === 'external' ? "SECTION B — EXAMINER'S ASSESSMENT CRITERIA" : "SECTION B — SUPERVISOR'S ASSESSMENT CRITERIA"}
                </h5>
              </div>

              {/* Table conforming exactly to the user's template */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-[13px] border-collapse min-w-[300px]">
                  <thead>
                    <tr className="border-b border-stone-800">
                      <th className="py-2 font-bold text-black text-left w-auto">
                        Criterion
                      </th>
                      <th className="py-2 font-bold text-black text-center w-16 sm:w-20">
                        Yes
                      </th>
                      <th className="py-2 font-bold text-black text-center w-16 sm:w-20">
                        No
                      </th>
                      {!isReadOnly && (
                        <th className="py-2 text-center w-8 print:hidden"></th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {criteria.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-2 pr-2 font-medium text-black leading-tight">
                          {item.criterion}
                        </td>
                        
                        {/* YES CHECKBOX COLUMN */}
                        <td className="py-2 text-center align-middle">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleToggleCriterion(item.id, true)}
                            className={`inline-flex items-center justify-center h-6 w-6 sm:h-5 sm:w-5 rounded-xs border transition-colors cursor-pointer ${
                              item.approved
                                ? 'border-black bg-black text-white font-bold'
                                : 'border-stone-400 bg-white hover:border-black'
                            }`}
                            title="Mark as Yes"
                          >
                            {item.approved && <span className="text-[11px] leading-none font-bold">✓</span>}
                          </button>
                        </td>

                        {/* NO CHECKBOX COLUMN */}
                        <td className="py-2 text-center align-middle">
                          <button
                            type="button"
                            disabled={isReadOnly}
                            onClick={() => handleToggleCriterion(item.id, false)}
                            className={`inline-flex items-center justify-center h-6 w-6 sm:h-5 sm:w-5 rounded-xs border transition-colors cursor-pointer ${
                              !item.approved
                                ? 'border-black bg-black text-white font-bold'
                                : 'border-stone-400 bg-white hover:border-black'
                            }`}
                            title="Mark as No"
                          >
                            {!item.approved && <span className="text-[11px] leading-none font-bold">✓</span>}
                          </button>
                        </td>

                        {/* Delete custom item button */}
                        {!isReadOnly && (
                          <td className="py-2 text-center align-middle print:hidden">
                            {item.id.includes('custom') && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCriterion(item.id)}
                                className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                                title="Remove criterion"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION C — STATUTORY PROJECT SCORING & EVALUATION (100 MARKS) */}
            {/* ========================================================= */}
            <div className="mb-5 sm:mb-6">
              <div className="border-b border-black pb-1 mb-2.5 flex items-center justify-between">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  SECTION C — STATUTORY PROJECT SCORING & EVALUATION (100 MARKS)
                </h5>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-black">
                    Total: <strong className="font-mono text-sm">{totalCompositeScore} / 100</strong>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${compositeGrade.color}`}>
                    Grade: {compositeGrade.grade}
                  </span>
                </div>
              </div>

              {/* Table / Score Breakdown */}
              <div className="border border-black overflow-hidden mb-3">
                <table className="w-full text-left text-xs sm:text-[13px] border-collapse">
                  <thead>
                    <tr className="border-b border-black bg-stone-100 font-bold text-black">
                      <th className="py-1.5 px-3">Evaluation Component</th>
                      <th className="py-1.5 px-3 text-center w-24">Max Marks</th>
                      <th className="py-1.5 px-3 text-center w-32">Awarded Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-300">
                    {/* Component 1 */}
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-2 px-3">
                        <div className="font-bold text-black">1. Software Design & Quality</div>
                        <div className="text-[11px] text-stone-600">Architectural soundness, code quality, software testbed execution, algorithms</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-stone-700">30</td>
                      <td className="py-2 px-3 text-center">
                        {isReadOnly ? (
                          <span className="font-mono font-bold text-black text-sm">{softwareDesignScore}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={softwareDesignScore}
                              onChange={(e) => setSoftwareDesignScore(Math.min(30, Math.max(0, Number(e.target.value))))}
                              className="w-16 rounded border border-stone-400 bg-white px-2 py-1 text-center font-mono font-bold text-black text-xs focus:border-black focus:outline-none"
                            />
                            <span className="text-[11px] text-stone-500">/ 30</span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Component 2 */}
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-2 px-3">
                        <div className="font-bold text-black">2. Presentation</div>
                        <div className="text-[11px] text-stone-600">Viva voce oral presentation, slide clarity, poise, time management</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-stone-700">20</td>
                      <td className="py-2 px-3 text-center">
                        {isReadOnly ? (
                          <span className="font-mono font-bold text-black text-sm">{presentationScore}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={presentationScore}
                              onChange={(e) => setPresentationScore(Math.min(20, Math.max(0, Number(e.target.value))))}
                              className="w-16 rounded border border-stone-400 bg-white px-2 py-1 text-center font-mono font-bold text-black text-xs focus:border-black focus:outline-none"
                            />
                            <span className="text-[11px] text-stone-500">/ 20</span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Component 3 */}
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-2 px-3">
                        <div className="font-bold text-black">3. Project Reports & Documentation</div>
                        <div className="text-[11px] text-stone-600">Chapters 1–5 dissertation manuscript, Turnitin similarity compliance (&lt;15%), citations</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-stone-700">30</td>
                      <td className="py-2 px-3 text-center">
                        {isReadOnly ? (
                          <span className="font-mono font-bold text-black text-sm">{projectReportsScore}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="30"
                              value={projectReportsScore}
                              onChange={(e) => setProjectReportsScore(Math.min(30, Math.max(0, Number(e.target.value))))}
                              className="w-16 rounded border border-stone-400 bg-white px-2 py-1 text-center font-mono font-bold text-black text-xs focus:border-black focus:outline-none"
                            />
                            <span className="text-[11px] text-stone-500">/ 30</span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Component 4 */}
                    <tr className="hover:bg-stone-50/60">
                      <td className="py-2 px-3">
                        <div className="font-bold text-black">4. Response to Questions</div>
                        <div className="text-[11px] text-stone-600">Defense inquiry handling, mastery of computer science fundamentals, justification</div>
                      </td>
                      <td className="py-2 px-3 text-center font-bold text-stone-700">20</td>
                      <td className="py-2 px-3 text-center">
                        {isReadOnly ? (
                          <span className="font-mono font-bold text-black text-sm">{responseToQuestionsScore}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              value={responseToQuestionsScore}
                              onChange={(e) => setResponseToQuestionsScore(Math.min(20, Math.max(0, Number(e.target.value))))}
                              className="w-16 rounded border border-stone-400 bg-white px-2 py-1 text-center font-mono font-bold text-black text-xs focus:border-black focus:outline-none"
                            />
                            <span className="text-[11px] text-stone-500">/ 20</span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Total composite row */}
                    <tr className="bg-stone-50 font-bold border-t border-black">
                      <td className="py-2 px-3 text-black font-extrabold uppercase">
                        Composite Total Evaluation Score
                      </td>
                      <td className="py-2 px-3 text-center font-extrabold text-black">100</td>
                      <td className="py-2 px-3 text-center">
                        <span className="font-mono font-black text-base text-black">{totalCompositeScore} / 100</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION D — RECOMMENDATION                                */}
            {/* ========================================================= */}
            <div className="mb-5 sm:mb-6">
              <div className="border-b border-black pb-1 mb-2.5">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  SECTION D — RECOMMENDATION
                </h5>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-10 text-xs sm:text-[13px] pt-1">
                {/* Cleared Checkbox with whole card clickable */}
                <div 
                  onClick={() => !isReadOnly && setRecommendation('cleared')}
                  className="flex items-center gap-2.5 cursor-pointer select-none py-1.5 px-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center h-5 w-5 rounded-xs border transition-colors ${
                      recommendation === 'cleared'
                        ? 'border-black bg-black text-white font-bold'
                        : 'border-stone-400 bg-white hover:border-black'
                    }`}
                  >
                    {recommendation === 'cleared' && <span className="text-[11px] leading-none font-bold">✓</span>}
                  </div>
                  <span className="font-semibold text-black">
                    {activeStage === 'proposal' && 'Cleared for Proposal Defense'}
                    {activeStage === 'internal' && 'Cleared for Internal Defense'}
                    {activeStage === 'external' && 'Cleared for External Viva Voce & Degree Award'}
                  </span>
                </div>

                {/* Not Cleared Checkbox with whole card clickable */}
                <div 
                  onClick={() => !isReadOnly && setRecommendation('not_cleared')}
                  className="flex items-center gap-2.5 cursor-pointer select-none py-1.5 px-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <div
                    className={`flex items-center justify-center h-5 w-5 rounded-xs border transition-colors ${
                      recommendation === 'not_cleared'
                        ? 'border-black bg-black text-white font-bold'
                        : 'border-stone-400 bg-white hover:border-black'
                    }`}
                  >
                    {recommendation === 'not_cleared' && <span className="text-[11px] leading-none font-bold">✓</span>}
                  </div>
                  <span className="font-semibold text-black">
                    Not Cleared (Requires Revisions)
                  </span>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* SECTION E — COMMENTS                                      */}
            {/* ========================================================= */}
            <div className="mb-5 sm:mb-6">
              <div className="border-b border-black pb-1 mb-2">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  SECTION E — COMMENTS
                </h5>
              </div>

              {isReadOnly ? (
                <div className="text-xs sm:text-[13px] text-black py-1 min-h-[40px] border-b border-stone-300">
                  {comments || 'Satisfactory'}
                </div>
              ) : (
                <textarea
                  rows={2}
                  value={comments || ''}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter supervisor's qualitative comments, recommendations, or defense notes..."
                  className="w-full text-xs sm:text-[13px] text-black bg-transparent border-b border-stone-400 focus:outline-none focus:border-black p-1 resize-none font-sans"
                />
              )}
              {/* Ruled aesthetic lines matching official paper form */}
              <div className="border-b border-stone-300 h-4 print:block"></div>
            </div>

            {/* ========================================================= */}
            {/* SECTION F — CERTIFICATION                                 */}
            {/* ========================================================= */}
            <div className="mb-6 sm:mb-8">
              <div className="border-b border-black pb-1 mb-3">
                <h5 className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-black">
                  SECTION F — CERTIFICATION
                </h5>
              </div>

              <div className="space-y-4 text-xs sm:text-[13px]">
                {/* Supervisor & Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 items-baseline">
                  <div className="sm:col-span-7 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-28 shrink-0 text-black">
                      {activeStage === 'external' ? 'Examiner:' : 'Supervisor:'}
                    </span>
                    {isReadOnly ? (
                      <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 truncate">
                        {supervisorNameInput || ''}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={supervisorNameInput || ''}
                        onChange={(e) => setSupervisorNameInput(e.target.value)}
                        className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 focus:outline-none focus:border-black bg-transparent"
                      />
                    )}
                  </div>

                  <div className="sm:col-span-5 flex flex-wrap sm:flex-nowrap items-baseline">
                    <span className="font-bold w-16 shrink-0 text-black">Date:</span>
                    {isReadOnly ? (
                      <span className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1">
                        {dateInput || ''}
                      </span>
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5">
                        <input
                          type="text"
                          value={dateInput || ''}
                          onChange={(e) => setDateInput(e.target.value)}
                          className="flex-1 font-medium text-black border-b border-stone-400 pb-0.5 px-1 focus:outline-none focus:border-black bg-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleSetToday}
                          className="text-[10px] text-stone-500 hover:text-black font-semibold uppercase px-1.5 py-0.5 bg-stone-100 rounded border border-stone-300 print:hidden cursor-pointer"
                        >
                          Today
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Signature row */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 pt-1">
                  <span className="font-bold w-28 shrink-0 text-black">Signature:</span>
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] border-b border-black pb-1">
                      {isReadOnly ? (
                        <span className="font-serif italic text-base sm:text-lg text-black font-semibold">
                          {signatureInput || supervisorNameInput || ''}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={signatureInput || ''}
                          onChange={(e) => setSignatureInput(e.target.value)}
                          className="w-full font-serif italic text-base sm:text-lg text-black font-semibold bg-transparent focus:outline-none"
                          placeholder="Type or endorse signature"
                        />
                      )}
                    </div>

                    {/* Official Electronic Verification Stamp */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500 bg-emerald-50 text-[10px] text-emerald-800 font-bold shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Digitally Verified & Endorsed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* OFFICIAL FOOTER WATERMARK                                 */}
            {/* ========================================================= */}
            <div className="pt-6 border-t border-stone-300 text-center text-[10px] text-stone-500 leading-tight">
              <p className="font-bold">APSES — {targetInstitution}</p>
              <p className="mt-0.5">{targetFaculty} · {targetDept}</p>
              <p className="mt-0.5 text-stone-400">Generated: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR (Non-printable)                         */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 sm:px-6 py-3.5 border-t border-stone-200 shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-stone-700">Cloud Sync:</span>
            <span className="hidden sm:inline">Persisted to Firestore collection <code className="bg-stone-100 px-1 py-0.5 rounded text-[11px]">defense_clearances</code></span>
            <span className="sm:hidden text-[11px]">Firestore Connected</span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors"
            >
              Close
            </button>

            {!isReadOnly && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveForm}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold shadow-xs cursor-pointer active:scale-98 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4" />
                    <span>Save & Endorse Clearance</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
