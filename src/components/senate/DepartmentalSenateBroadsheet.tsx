import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SenateBroadsheetEntry } from '../../types';
import {
  Award,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  FileText,
  RefreshCw,
  Stamp,
  ShieldCheck,
  Eye,
  Edit3,
  GraduationCap,
  Building2,
  X,
  FileSpreadsheet,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

export const DepartmentalSenateBroadsheet: React.FC = () => {
  const {
    senateBroadsheet,
    updateBroadsheetScore,
    endorseBroadsheet,
    resetBroadsheetScores,
    currentRole,
    currentProfile,
    showToast
  } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'First Class' | 'Second Class (Upper)' | 'Second Class (Lower)' | 'Third Class' | 'pending_endorsement'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'score_desc' | 'score_asc' | 'matric' | 'name'>('score_desc');
  const [viewMode, setViewMode] = useState<'broadsheet' | 'calibration' | 'statistics'>('broadsheet');

  // Modal for candidate individual result slip
  const [selectedCandidate, setSelectedCandidate] = useState<SenateBroadsheetEntry | null>(null);

  // Quick edit modal or inline calibration state
  const [editingCandidate, setEditingCandidate] = useState<SenateBroadsheetEntry | null>(null);
  const [editSupervisorScore, setEditSupervisorScore] = useState<number>(0);
  const [editInternalScore, setEditInternalScore] = useState<number>(0);
  const [editExternalScore, setEditExternalScore] = useState<number>(0);
  const [editRemarks, setEditRemarks] = useState<string>('');

  // Class Statistics Computation
  const stats = useMemo(() => {
    const total = senateBroadsheet.length;
    if (total === 0) {
      return {
        total: 0,
        avgScore: 0,
        firstClassCount: 0,
        secondUpperCount: 0,
        secondLowerCount: 0,
        thirdClassCount: 0,
        failCount: 0,
        highestScore: 0,
        lowestScore: 0,
        fullyEndorsedCount: 0,
        clearanceRate: 0,
      };
    }

    const totalScoreSum = senateBroadsheet.reduce((acc, c) => acc + c.totalScore, 0);
    const avgScore = Math.round((totalScoreSum / total) * 10) / 10;
    const firstClassCount = senateBroadsheet.filter(c => c.classification === 'First Class').length;
    const secondUpperCount = senateBroadsheet.filter(c => c.classification === 'Second Class (Upper)').length;
    const secondLowerCount = senateBroadsheet.filter(c => c.classification === 'Second Class (Lower)').length;
    const thirdClassCount = senateBroadsheet.filter(c => c.classification === 'Third Class').length;
    const failCount = senateBroadsheet.filter(c => c.classification === 'Fail').length;
    const highestScore = Math.max(...senateBroadsheet.map(c => c.totalScore));
    const lowestScore = Math.min(...senateBroadsheet.map(c => c.totalScore));
    const fullyEndorsedCount = senateBroadsheet.filter(c => c.endorsedByHOD && c.endorsedByExternal).length;
    const passingCount = senateBroadsheet.filter(c => c.totalScore >= 45).length;
    const clearanceRate = Math.round((passingCount / total) * 100);

    return {
      total,
      avgScore,
      firstClassCount,
      secondUpperCount,
      secondLowerCount,
      thirdClassCount,
      failCount,
      highestScore,
      lowestScore,
      fullyEndorsedCount,
      clearanceRate,
    };
  }, [senateBroadsheet]);

  // Filter and sort candidates
  const processedCandidates = useMemo(() => {
    return senateBroadsheet
      .filter((candidate) => {
        // Classification filter
        if (classificationFilter === 'pending_endorsement') {
          if (candidate.endorsedByHOD && candidate.endorsedByExternal) return false;
        } else if (classificationFilter !== 'all') {
          if (candidate.classification !== classificationFilter) return false;
        }

        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          candidate.name.toLowerCase().includes(q) ||
          candidate.matric.toLowerCase().includes(q) ||
          candidate.topic.toLowerCase().includes(q) ||
          candidate.supervisor.toLowerCase().includes(q) ||
          (candidate.track && candidate.track.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') return b.totalScore - a.totalScore;
        if (sortBy === 'score_asc') return a.totalScore - b.totalScore;
        if (sortBy === 'matric') return a.matric.localeCompare(b.matric);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.totalScore - a.totalScore;
      });
  }, [senateBroadsheet, searchQuery, classificationFilter, sortBy]);

  // Open Edit Modal for a Candidate
  const handleOpenEdit = (candidate: SenateBroadsheetEntry) => {
    setEditingCandidate(candidate);
    setEditSupervisorScore(candidate.supervisorScore ?? 0);
    setEditInternalScore(candidate.internalScore ?? 0);
    setEditExternalScore(candidate.externalScore ?? 0);
    setEditRemarks(candidate.remarks || '');
  };

  // Save Score Calibration
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate) return;

    updateBroadsheetScore(editingCandidate.matric, {
      supervisorScore: editSupervisorScore,
      internalScore: editInternalScore,
      externalScore: editExternalScore,
      remarks: editRemarks,
    });

    setEditingCandidate(null);
  };

  // CSV Export for Senate Academic Records
  const handleExportCSV = () => {
    const headers = [
      'S/N',
      'Matriculation Number',
      'Candidate Full Name',
      'Specialization Track',
      'Project Research Topic',
      'Assigned Supervisor',
      'Continuous Assessment (Max 40)',
      'Internal Defense (Max 30)',
      'External Viva (Max 30)',
      'Total Score (100%)',
      'Letter Grade',
      'Grade Point (GP)',
      'Degree Honours Classification',
      'Turnitin Similarity (%)',
      'Senate Moderation Status',
      'HOD Endorsement',
      'External Examiner Endorsement',
      'Examiner Remarks'
    ];

    const rows = processedCandidates.map((c, idx) => [
      idx + 1,
      `"${c.matric}"`,
      `"${c.name}"`,
      `"${c.track || 'General Computer Science'}"`,
      `"${c.topic.replace(/"/g, '""')}"`,
      `"${c.supervisor}"`,
      c.supervisorScore,
      c.internalScore,
      c.externalScore,
      c.totalScore,
      c.letterGrade,
      c.gradePoint.toFixed(1),
      `"${c.classification}"`,
      `${c.similarityIndex}%`,
      `"${c.status}"`,
      c.endorsedByHOD ? 'Signed & Ratified' : 'Pending',
      c.endorsedByExternal ? 'Signed & Moderated' : 'Pending',
      `"${(c.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      'FACULTY OF COMPUTING · DEPARTMENT OF COMPUTER SCIENCE',
      'CONSOLIDATED SENATE DEGREE BROADSHEET (CSC 499: RESEARCH PROJECT & VIVA VOCE)',
      'ACADEMIC SESSION: 2025/2026 · GENERATED: NOVEMBER 2026',
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ATBU_Computer_Science_Senate_Broadsheet_2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Departmental Senate Broadsheet CSV exported successfully.');
  };

  // Check if HOD or External Examiner has endorsed all
  const isAllHODEndorsed = senateBroadsheet.every(c => c.endorsedByHOD);
  const isAllExternalEndorsed = senateBroadsheet.every(c => c.endorsedByExternal);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Official Senate Broadsheet Institutional Header */}
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-stone-100 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <Building2 className="h-4 w-4 text-[#CBA358]" />
              <span>Faculty of Computing · Department of Computer Science</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
              Departmental Senate Broadsheet & Final Grade Computation
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 max-w-3xl leading-relaxed">
              Official statutory broadsheet aggregating Continuous Assessment (40%), Internal Defense (30%), and External Moderator Viva Voce (30%) scores for the award of Bachelor of Science (B.Sc. Hons.) Computer Science degree.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-stone-500 font-medium">
              <span>Course: <strong>CSC 499 (6 Credits)</strong></span>
              <span aria-hidden="true">·</span>
              <span>Session: <strong>2025/2026</strong></span>
              <span aria-hidden="true">·</span>
              <span>Degree in View: <strong>B.Sc. Computer Science</strong></span>
              <span aria-hidden="true">·</span>
              <span>Moderated by: <strong>Prof. Charles U. Eze (UNILAG)</strong></span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-stone-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.print();
                showToast('Preparing Senate Broadsheet docket printout...');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-2 text-xs font-bold text-stone-700 shadow-2xs transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-stone-500" />
              <span>Print Broadsheet</span>
            </button>

            <button
              type="button"
              onClick={resetBroadsheetScores}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-600 transition-colors"
              title="Revert calibrations to default"
            >
              <RefreshCw className="h-3.5 w-3.5 text-stone-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* 2. Key Academic Cohort Metrics (Zero Pill Rule - Clean Typography) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Graduating Cohort
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-stone-900">{stats.total}</span>
              <span className="text-xs text-stone-500">Candidates</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Final Viva Docket
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Class Mean Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-[#CBA358]">{stats.avgScore}%</span>
              <span className="text-xs text-stone-500">Average</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Range: {stats.lowestScore}% - {stats.highestScore}%
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              First Class (A)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-emerald-700">{stats.firstClassCount}</span>
              <span className="text-xs text-stone-500">of {stats.total}</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              &ge; 70.0% (5.0 GP)
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Second Upper (2.1)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-blue-800">{stats.secondUpperCount}</span>
              <span className="text-xs text-stone-500">of {stats.total}</span>
            </div>
            <div className="text-[11px] text-blue-800 font-semibold mt-1">
              60.0% - 69.9% (4.0 GP)
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Second Lower (2.2)
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-amber-700">{stats.secondLowerCount}</span>
              <span className="text-xs text-stone-500">of {stats.total}</span>
            </div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              50.0% - 59.9% (3.0 GP)
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/70">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Senate Clearance
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-emerald-700">{stats.clearanceRate}%</span>
              <span className="text-xs text-stone-500">Passed</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {stats.fullyEndorsedCount} of {stats.total} Dual Endorsed
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Statutory Weighting Legend & Formula Banner */}
      <div className="rounded-2xl bg-stone-900 text-stone-100 p-5 shadow-xs border border-stone-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#CBA358] uppercase tracking-wider">
            <Award className="h-4 w-4" />
            <span>Statutory Senate Weighting & Scoring Formula</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-300">
            <span><strong>Continuous Assessment (40%)</strong>: Literature, Methodology, Benchwork & Draft Chapters</span>
            <span aria-hidden="true" className="text-stone-600">|</span>
            <span><strong>Internal Defense (30%)</strong>: Presentation, Slide Defense & Panel Cross-Exam</span>
            <span aria-hidden="true" className="text-stone-600">|</span>
            <span><strong>External Viva (30%)</strong>: External Moderator Manuscript Viva & Academic Rigor</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-xl bg-stone-800 p-1 border border-stone-700 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('broadsheet')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                viewMode === 'broadsheet' ? 'bg-[#CBA358] text-stone-950 shadow-2xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Broadsheet Roster
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calibration')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                viewMode === 'calibration' ? 'bg-[#CBA358] text-stone-950 shadow-2xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Score Calibration
            </button>
            <button
              type="button"
              onClick={() => setViewMode('statistics')}
              className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                viewMode === 'statistics' ? 'bg-[#CBA358] text-stone-950 shadow-2xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Grade Analytics
            </button>
          </div>
        </div>
      </div>

      {/* 4. Search, Filter & Sorters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-stone-200 shadow-2xs">
        <div className="flex-1 relative min-w-[240px]">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student matric, candidate name, topic or supervisor..."
            className="w-full rounded-xl bg-stone-50 border border-stone-200 pl-9 pr-4 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#CBA358] focus:bg-white transition-all"
          />
        </div>

        {/* Classification Filter Tabs (Buttons allowed for functional filter control) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: `All (${senateBroadsheet.length})` },
            { id: 'First Class', label: `1st Class (${stats.firstClassCount})` },
            { id: 'Second Class (Upper)', label: `2.1 (${stats.secondUpperCount})` },
            { id: 'Second Class (Lower)', label: `2.2 (${stats.secondLowerCount})` },
            { id: 'Third Class', label: `3rd (${stats.thirdClassCount})` },
            { id: 'pending_endorsement', label: 'Pending Sign-off' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setClassificationFilter(tab.id as any)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                classificationFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-stone-500 font-medium">Sort:</span>
          <select
            value={sortBy || 'score_desc'}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#CBA358]"
          >
            <option value="score_desc">Highest Total Score</option>
            <option value="score_asc">Lowest Total Score</option>
            <option value="matric">Matriculation Number</option>
            <option value="name">Candidate Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 5. Main Content: Mode Switcher */}
      {viewMode === 'broadsheet' && (
        <div className="rounded-[24px] border border-stone-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">S/N</th>
                  <th className="py-3.5 px-4 min-w-[200px]">Candidate Details</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Project Topic & Track</th>
                  <th className="py-3.5 px-3 w-28 text-center bg-stone-100/50">
                    <span className="block">CA / Sup.</span>
                    <span className="text-[10px] text-stone-500 font-medium lowercase">max 40%</span>
                  </th>
                  <th className="py-3.5 px-3 w-28 text-center bg-stone-100/50">
                    <span className="block">Internal</span>
                    <span className="text-[10px] text-stone-500 font-medium lowercase">max 30%</span>
                  </th>
                  <th className="py-3.5 px-3 w-28 text-center bg-stone-100/50">
                    <span className="block">External</span>
                    <span className="text-[10px] text-stone-500 font-medium lowercase">max 30%</span>
                  </th>
                  <th className="py-3.5 px-3 w-28 text-center bg-amber-50/50">
                    <span className="block text-stone-900 font-extrabold">Total</span>
                    <span className="text-[10px] text-stone-500 font-medium lowercase">100%</span>
                  </th>
                  <th className="py-3.5 px-3 w-20 text-center">Grade</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Degree Honours</th>
                  <th className="py-3.5 px-3 w-28 text-center">Endorsements</th>
                  <th className="py-3.5 px-4 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/80 font-sans">
                {processedCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-stone-500 text-xs">
                      No candidates match the specified filter or query.
                    </td>
                  </tr>
                ) : (
                  processedCandidates.map((c, idx) => {
                    return (
                      <tr key={c.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-center text-stone-400 font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(c)}
                            className="font-bold text-stone-900 hover:text-[#CBA358] transition-colors text-left block"
                          >
                            {c.name}
                          </button>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                            <span className="font-mono">{c.matric}</span>
                            <span aria-hidden="true">·</span>
                            <span>Turnitin: {c.similarityIndex}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-stone-800 line-clamp-2 leading-relaxed" title={c.topic}>
                            {c.topic}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1">
                            <span>Supervisor: {c.supervisor}</span>
                            {c.track && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-stone-400">{c.track}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center bg-stone-50/40 font-mono font-semibold text-stone-800">
                          {c.supervisorScore}
                        </td>
                        <td className="py-3.5 px-3 text-center bg-stone-50/40 font-mono font-semibold text-stone-800">
                          {c.internalScore}
                        </td>
                        <td className="py-3.5 px-3 text-center bg-stone-50/40 font-mono font-semibold text-stone-800">
                          {c.externalScore}
                        </td>
                        <td className="py-3.5 px-3 text-center bg-amber-50/40 font-mono font-black text-stone-950 text-sm">
                          {c.totalScore}%
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-sm">
                          <span
                            className={
                              c.letterGrade === 'A'
                                ? 'text-emerald-700'
                                : c.letterGrade === 'B'
                                ? 'text-blue-800'
                                : c.letterGrade === 'C'
                                ? 'text-amber-700'
                                : 'text-stone-700'
                            }
                          >
                            {c.letterGrade}
                          </span>
                          <span className="block text-[10px] font-mono text-stone-400 font-normal">
                            {c.gradePoint.toFixed(1)} GP
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-stone-800">
                          <div>{c.classification}</div>
                          <div className="text-[11px] text-stone-400 font-normal mt-0.5">
                            {c.status}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`text-[10px] font-semibold ${
                                c.endorsedByHOD ? 'text-emerald-700' : 'text-stone-400'
                              }`}
                            >
                              {c.endorsedByHOD ? '✓ HOD Signed' : '○ HOD Pending'}
                            </span>
                            <span
                              className={`text-[10px] font-semibold ${
                                c.endorsedByExternal ? 'text-emerald-700' : 'text-stone-400'
                              }`}
                            >
                              {c.endorsedByExternal ? '✓ Ext. Signed' : '○ Ext. Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCandidate(c)}
                              className="rounded-lg border border-stone-200 bg-white hover:bg-stone-50 p-1.5 text-stone-600 transition-colors"
                              title="View Official Result Slip"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {(currentRole === 'admin' || currentRole === 'internal_supervisor' || currentRole === 'external_supervisor') && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(c)}
                                className="rounded-lg border border-stone-200 bg-white hover:bg-stone-50 p-1.5 text-stone-600 transition-colors"
                                title="Calibrate / Adjust Scores"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-[#CBA358]" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode 2: Score Calibration Desk */}
      {viewMode === 'calibration' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  Interactive Mark Calibration & Sensitivity Analysis
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Simulate adjustments to Continuous Assessment (max 40), Internal (max 30), or External (max 30) scores with live recalculation of letter grades and classifications.
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-500">
                {processedCandidates.length} candidate(s) loaded
              </span>
            </div>

            <div className="space-y-4 pt-4">
              {processedCandidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        {candidate.name}
                      </span>
                      <span className="text-xs text-stone-500 ml-2 font-mono">
                        ({candidate.matric})
                      </span>
                      <p className="text-xs text-stone-600 line-clamp-1 mt-0.5">
                        {candidate.topic}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-black text-stone-900 font-mono">
                          {candidate.totalScore}%
                        </span>
                        <div className="text-[11px] font-bold text-stone-600">
                          Grade {candidate.letterGrade} ({candidate.gradePoint.toFixed(1)} GP) · {candidate.classification}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(candidate)}
                        className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3 py-1.5 text-xs font-bold text-stone-700 shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <SlidersHorizontal className="h-3.5 w-3.5 text-[#CBA358]" />
                        <span>Calibrate</span>
                      </button>
                    </div>
                  </div>

                  {/* Sliders Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="rounded-xl bg-white p-3 border border-stone-200/70">
                      <div className="flex justify-between font-medium text-stone-600 text-[11px]">
                        <span>Continuous Assessment</span>
                        <span className="font-bold text-stone-900 font-mono">{candidate.supervisorScore} / 40</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${(candidate.supervisorScore / 40) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-stone-200/70">
                      <div className="flex justify-between font-medium text-stone-600 text-[11px]">
                        <span>Internal Defense</span>
                        <span className="font-bold text-stone-900 font-mono">{candidate.internalScore} / 30</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all"
                          style={{ width: `${(candidate.internalScore / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-stone-200/70">
                      <div className="flex justify-between font-medium text-stone-600 text-[11px]">
                        <span>External Viva Moderation</span>
                        <span className="font-bold text-stone-900 font-mono">{candidate.externalScore} / 30</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-[#CBA358] h-full rounded-full transition-all"
                          style={{ width: `${(candidate.externalScore / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Grade Analytics & Class Distribution */}
      {viewMode === 'statistics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Honours Degree Distribution Visual Bar */}
            <div className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900">
                Departmental Honours Degree Distribution
              </h3>
              <p className="text-xs text-stone-500">
                Breakdown of candidates across statutory degree classifications for the 2025/2026 graduating class.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  {
                    label: 'First Class Honours (A: 70 - 100%)',
                    count: stats.firstClassCount,
                    percent: Math.round((stats.firstClassCount / stats.total) * 100),
                    color: 'bg-emerald-600',
                    textColor: 'text-emerald-800'
                  },
                  {
                    label: 'Second Class Upper (B: 60 - 69%)',
                    count: stats.secondUpperCount,
                    percent: Math.round((stats.secondUpperCount / stats.total) * 100),
                    color: 'bg-blue-600',
                    textColor: 'text-blue-800'
                  },
                  {
                    label: 'Second Class Lower (C: 50 - 59%)',
                    count: stats.secondLowerCount,
                    percent: Math.round((stats.secondLowerCount / stats.total) * 100),
                    color: 'bg-amber-600',
                    textColor: 'text-amber-800'
                  },
                  {
                    label: 'Third Class Honours (D: 45 - 49%)',
                    count: stats.thirdClassCount,
                    percent: Math.round((stats.thirdClassCount / stats.total) * 100),
                    color: 'bg-stone-500',
                    textColor: 'text-stone-700'
                  },
                  {
                    label: 'Fail / Resit Required (F: < 45%)',
                    count: stats.failCount,
                    percent: Math.round((stats.failCount / stats.total) * 100),
                    color: 'bg-rose-600',
                    textColor: 'text-rose-800'
                  }
                ].map((tier, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-stone-700">
                      <span>{tier.label}</span>
                      <span className="font-mono">
                        {tier.count} ({tier.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`${tier.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${tier.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Senate Moderation Checklist */}
            <div className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900">
                Senate Submission & Verification Checklist
              </h3>
              <p className="text-xs text-stone-500">
                Departmental quality assurance criteria required before final Senate transmission.
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-start gap-3 rounded-xl border border-stone-200/80 p-3 bg-stone-50/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Continuous Assessment Marks Certified</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      All laboratory bench books, research proposal defenses, and supervisor chapter rubrics (40%) countersigned.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-stone-200/80 p-3 bg-stone-50/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Turnitin Plagiarism Threshold Audited</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      100% of graduating theses verified below the statutory 15% similarity limit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-stone-200/80 p-3 bg-stone-50/50">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">External Moderator Viva Voce Executed</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      Visiting External Examiner Prof. Charles U. Eze conducted statutory oral viva sessions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-stone-200/80 p-3 bg-stone-50/50">
                  <Stamp className="h-4 w-4 text-[#CBA358] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900">Dual Departmental Endorsement</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      {stats.fullyEndorsedCount} of {stats.total} candidate dossiers dual-signed by Head of Department and Chief External Examiner.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Official Digital Sign-off & Senate Endorsement Section */}
      <div className="rounded-[28px] border border-stone-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
            <Stamp className="h-4 w-4 text-[#CBA358]" />
            <span>Official Senate Endorsement & Verification Seals</span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 mt-1">
            Departmental Board & External Moderator Digital Sign-offs
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Both the Head of Department and Visiting External Moderator must digitally authenticate the broadsheet prior to Senate transmission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* HOD Endorsement Block */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/40 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Internal Departmental Authority
                </span>
                <h4 className="text-sm font-black text-stone-900 mt-0.5">
                  Prof. Sarah N. Ibrahim
                </h4>
                <p className="text-xs text-stone-500">
                  Head, Department of Computer Science · Abubakar Tafawa Balewa University, Bauchi (ATBU)
                </p>
              </div>
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  isAllHODEndorsed ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isAllHODEndorsed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Duly Signed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Signature Pending</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed italic border-l-2 border-stone-300 pl-3">
              "I hereby certify that the Continuous Assessment and Internal Defense scores herein have been examined and approved by the Departmental Board of Examiners."
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                Date: {isAllHODEndorsed ? 'November 14, 2026' : 'Awaiting Sign-off'}
              </span>

              {(currentRole === 'admin' || currentRole === 'panel_member') && (
                <button
                  type="button"
                  onClick={() => endorseBroadsheet('hod')}
                  disabled={isAllHODEndorsed}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                    isAllHODEndorsed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <Stamp className="h-3.5 w-3.5" />
                  <span>{isAllHODEndorsed ? 'HOD Endorsement Ratified' : 'Sign & Endorse Broadsheet'}</span>
                </button>
              )}
            </div>
          </div>

          {/* External Examiner Endorsement Block */}
          <div className="rounded-2xl border border-stone-200/80 bg-stone-50/40 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Visiting External Moderator
                </span>
                <h4 className="text-sm font-black text-stone-900 mt-0.5">
                  Prof. Charles U. Eze
                </h4>
                <p className="text-xs text-stone-500">
                  Visiting Professor of Computer Science · University of Lagos (UNILAG)
                </p>
              </div>
              <span
                className={`text-xs font-bold flex items-center gap-1 ${
                  isAllExternalEndorsed ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isAllExternalEndorsed ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Duly Signed</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Signature Pending</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed italic border-l-2 border-[#CBA358] pl-3">
              "I have thoroughly moderated the final year research dissertations and oral viva defenses. The academic standard conforms to national university benchmarks."
            </p>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                Date: {isAllExternalEndorsed ? 'November 14, 2026' : 'Awaiting Sign-off'}
              </span>

              {(currentRole === 'external_supervisor' || currentRole === 'admin') && (
                <button
                  type="button"
                  onClick={() => endorseBroadsheet('external')}
                  disabled={isAllExternalEndorsed}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-2xs ${
                    isAllExternalEndorsed
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-[#CBA358] hover:bg-[#b58f44] text-stone-950 font-extrabold'
                  }`}
                >
                  <Stamp className="h-3.5 w-3.5" />
                  <span>{isAllExternalEndorsed ? 'External Endorsement Ratified' : 'External Examiner Sign-off'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 7. Modal: Official Student Result Slip Dossier */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-stone-200 bg-white p-5 sm:p-8 shadow-2xl my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 h-8 w-8 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* University Crest & Docket Title */}
            <div className="text-center space-y-1 border-b border-stone-100 pb-5">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-amber-50 text-[#CBA358] mb-1">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Abubakar Tafawa Balewa University, Bauchi (ATBU) · Faculty of Computing
              </h2>
              <h3 className="text-lg font-black text-stone-900">
                Department of Computer Science
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                Official Undergraduate Research Project & Viva Voce Result Slip
              </p>
              <div className="text-[11px] text-stone-400 font-mono pt-0.5">
                Session: 2025/2026 · Course Code: CSC 499 (6 Credits)
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-stone-100">
              <div>
                <span className="text-[11px] text-stone-400 block uppercase font-bold">Candidate Name</span>
                <span className="font-bold text-stone-900 text-sm">{selectedCandidate.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block uppercase font-bold">Matriculation Number</span>
                <span className="font-mono font-bold text-stone-900">{selectedCandidate.matric}</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block uppercase font-bold">Specialization Track</span>
                <span className="font-medium text-stone-800">{selectedCandidate.track || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block uppercase font-bold">Lead Supervisor</span>
                <span className="font-medium text-stone-800">{selectedCandidate.supervisor}</span>
              </div>
            </div>

            {/* Research Topic */}
            <div className="py-4 border-b border-stone-100">
              <span className="text-[11px] text-stone-400 block uppercase font-bold mb-1">Approved Dissertation Topic</span>
              <p className="text-xs text-stone-800 font-medium leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
                {selectedCandidate.topic}
              </p>
            </div>

            {/* Score Breakdown Table */}
            <div className="py-4 space-y-3 border-b border-stone-100">
              <span className="text-[11px] text-stone-400 block uppercase font-bold">Statutory Score Allocation</span>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-bold text-[11px]">
                    <th className="py-2 text-left">Examination Component</th>
                    <th className="py-2 text-center">Maximum Marks</th>
                    <th className="py-2 text-right">Score Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                  <tr>
                    <td className="py-2.5">
                      Continuous Assessment / Supervisor Score (Proposal, Software Design, Implementation)
                    </td>
                    <td className="py-2.5 text-center font-mono">40</td>
                    <td className="py-2.5 text-right font-mono font-bold">{selectedCandidate.supervisorScore}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      Internal Departmental Defense (Oral Slides & Answering Questions)
                    </td>
                    <td className="py-2.5 text-center font-mono">30</td>
                    <td className="py-2.5 text-right font-mono font-bold">{selectedCandidate.internalScore}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5">
                      Visiting External Examiner Viva Voce (Manuscript Moderation & Rigor)
                    </td>
                    <td className="py-2.5 text-center font-mono">30</td>
                    <td className="py-2.5 text-right font-mono font-bold">{selectedCandidate.externalScore}</td>
                  </tr>
                  <tr className="bg-amber-50/50 font-black text-stone-900">
                    <td className="py-3 text-stone-950">
                      Total Computed Composite Score
                    </td>
                    <td className="py-3 text-center font-mono">100</td>
                    <td className="py-3 text-right font-mono text-sm text-[#CBA358]">
                      {selectedCandidate.totalScore}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Computed Senate Classification */}
            <div className="grid grid-cols-3 gap-3 py-4 border-b border-stone-100 text-center">
              <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Letter Grade</span>
                <span className="text-xl font-black text-stone-900">{selectedCandidate.letterGrade}</span>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Grade Point</span>
                <span className="text-xl font-black text-stone-900 font-mono">{selectedCandidate.gradePoint.toFixed(1)} GP</span>
              </div>
              <div className="rounded-xl bg-stone-50 p-3 border border-stone-200/70">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Degree Classification</span>
                <span className="text-xs font-bold text-stone-900 mt-1 block">{selectedCandidate.classification}</span>
              </div>
            </div>

            {/* Turnitin & Examiner Remarks */}
            <div className="py-4 space-y-2 border-b border-stone-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Turnitin Originality Index:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedCandidate.similarityIndex}% (Compliant with &le; 15% threshold)
                </span>
              </div>
              {selectedCandidate.remarks && (
                <div>
                  <span className="text-stone-500 block">Chief Examiner Remarks:</span>
                  <p className="text-stone-700 italic bg-stone-50 p-2.5 rounded-lg border border-stone-200/70 mt-1">
                    "{selectedCandidate.remarks}"
                  </p>
                </div>
              )}
            </div>

            {/* Sign-off Stamps */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-xs">
              <div className="border border-dashed border-stone-300 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Head of Department Sign-off</span>
                <span className="font-bold text-stone-800 block">Prof. Sarah N. Ibrahim</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {selectedCandidate.endorsedByHOD ? '✓ Duly Authenticated' : '○ Pending Sign-off'}
                </span>
              </div>
              <div className="border border-dashed border-stone-300 rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] font-bold text-stone-400 block uppercase">Chief External Moderator</span>
                <span className="font-bold text-stone-800 block">Prof. Charles U. Eze (UNILAG)</span>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  {selectedCandidate.endorsedByExternal ? '✓ Duly Authenticated' : '○ Pending Sign-off'}
                </span>
              </div>
            </div>

            {/* Print Slip Action */}
            <div className="pt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700 transition-colors"
              >
                Close Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  showToast(`Printing result slip for ${selectedCandidate.name}...`);
                }}
                className="rounded-xl bg-[#CBA358] hover:bg-[#b58f44] px-4 py-2 text-xs font-extrabold text-stone-950 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Official Slip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Interactive Score Calibration Editor */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[28px] border border-stone-200 bg-white shadow-2xl my-auto max-h-[calc(100dvh-2rem)] sm:max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-stone-100 flex items-start justify-between gap-4 shrink-0 bg-white">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#CBA358] uppercase tracking-wider">
                  <SlidersHorizontal className="h-4 w-4 shrink-0" />
                  <span>Mark Calibration & Score Sensitivity</span>
                </div>
                <h3 className="text-base font-black text-stone-900 mt-1 truncate">
                  Calibrate Scores for {editingCandidate.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono truncate">
                  {editingCandidate.matric} · {editingCandidate.supervisor}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingCandidate(null)}
                className="h-8 w-8 rounded-full border border-stone-200 bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors shrink-0 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 min-h-0">
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs overscroll-contain">
                {/* Score Input 1: CA / Supervisor (Max 40) */}
                <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-stone-800">
                      Continuous Assessment / Supervisor Score
                    </label>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      {editSupervisorScore} / 40
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={editSupervisorScore ?? 0}
                    onChange={(e) => setEditSupervisorScore(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    Proposal, methodology, benchwork & dissertation chapters (Max 40 marks).
                  </span>
                </div>

                {/* Score Input 2: Internal Defense (Max 30) */}
                <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-stone-800">
                      Internal Departmental Defense Score
                    </label>
                    <span className="font-mono font-bold text-amber-700 text-sm">
                      {editInternalScore} / 30
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={editInternalScore ?? 0}
                    onChange={(e) => setEditInternalScore(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    Oral presentation, slide quality & answering panel questions (Max 30 marks).
                  </span>
                </div>

                {/* Score Input 3: External Viva (Max 30) */}
                <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/70">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-stone-800">
                      Visiting External Moderator Viva Score
                    </label>
                    <span className="font-mono font-bold text-[#CBA358] text-sm">
                      {editExternalScore} / 30
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={editExternalScore ?? 0}
                    onChange={(e) => setEditExternalScore(Number(e.target.value))}
                    className="w-full accent-[#CBA358] cursor-pointer"
                  />
                  <span className="text-[10px] text-stone-500 block">
                    Academic rigor, experimental findings defense & manuscript contribution (Max 30 marks).
                  </span>
                </div>

                {/* Live Computed Total Preview */}
                {(() => {
                  const total = editSupervisorScore + editInternalScore + editExternalScore;
                  const letterGrade = total >= 70 ? 'A' : total >= 60 ? 'B' : total >= 50 ? 'C' : total >= 45 ? 'D' : total >= 40 ? 'E' : 'F';
                  const gp = total >= 70 ? 5.0 : total >= 60 ? 4.0 : total >= 50 ? 3.0 : total >= 45 ? 2.0 : total >= 40 ? 1.0 : 0.0;
                  const classification = total >= 70 ? 'First Class Honours' : total >= 60 ? 'Second Class (Upper)' : total >= 50 ? 'Second Class (Lower)' : total >= 45 ? 'Third Class' : 'Fail';
                  return (
                    <div className="rounded-2xl bg-stone-900 text-white p-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-stone-400 block uppercase">
                          Recalculated Outcome
                        </span>
                        <span className="text-xs font-semibold text-stone-200">
                          Grade {letterGrade} ({gp.toFixed(1)} GP) · {classification}
                        </span>
                      </div>
                      <span className="text-2xl font-black text-[#CBA358] font-mono">
                        {total}%
                      </span>
                    </div>
                  );
                })()}

                {/* Examiner Remarks */}
                <div className="space-y-1">
                  <label className="font-bold text-stone-800">
                    Chief Examiner / Board Comments
                  </label>
                  <textarea
                    value={editRemarks || ''}
                    onChange={(e) => setEditRemarks(e.target.value)}
                    rows={2}
                    placeholder="Enter moderation feedback or correction directives..."
                    className="w-full rounded-xl border border-stone-200 p-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#CBA358]"
                  />
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/90 backdrop-blur-xs flex items-center justify-end gap-2.5 shrink-0 rounded-b-[28px]">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="rounded-xl border border-stone-200 bg-white hover:bg-stone-100 px-4 py-2.5 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 hover:bg-stone-800 px-5 py-2.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Commit Calibrated Scores</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
