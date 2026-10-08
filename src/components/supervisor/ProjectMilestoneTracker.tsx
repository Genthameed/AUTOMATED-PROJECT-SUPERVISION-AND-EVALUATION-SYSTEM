import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Users2, 
  Check, 
  ChevronRight, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Award, 
  Plus, 
  Download, 
  Printer, 
  Info,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Flame,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SupervisorStudent, StudentMilestone } from '../../types';

interface ProjectMilestoneTrackerProps {
  onSelectStudentForReview?: (studentMatric: string) => void;
  onScheduleMeetingWithStudent?: (studentMatric: string) => void;
}

export const ProjectMilestoneTracker: React.FC<ProjectMilestoneTrackerProps> = ({
  onSelectStudentForReview,
  onScheduleMeetingWithStudent
}) => {
  const { 
    supervisorStudents, 
    updateStudentMilestone, 
    updateStudentProgress, 
    approveClearance, 
    showToast,
    setActiveView
  } = useApp();

  // Local Controls State
  const [chartViewMode, setChartViewMode] = useState<'horizontal' | 'distribution'>('horizontal');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'On Track' | 'Needs Attention' | 'Ready for Viva'>('All');
  const [sortBy, setSortBy] = useState<'progress_desc' | 'progress_asc' | 'name' | 'similarity'>('progress_desc');
  const [selectedStudentMatric, setSelectedStudentMatric] = useState<string>(() => {
    return supervisorStudents[0]?.matric || '';
  });

  // Milestone edit state inside drawer/details
  const [newRemarkText, setNewRemarkText] = useState('');
  const [activeEditingMilestoneId, setActiveEditingMilestoneId] = useState<string | null>(null);

  // Filtered and Sorted Students
  const processedStudents = useMemo(() => {
    return supervisorStudents
      .filter((student) => {
        const matchesSearch = 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.matric.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (student.track && student.track.toLowerCase().includes(searchQuery.toLowerCase()));

        let matchesStatus = true;
        if (statusFilter === 'On Track') {
          matchesStatus = student.progress >= 55 && student.status !== 'Needs Attention';
        } else if (statusFilter === 'Needs Attention') {
          matchesStatus = student.status === 'Needs Attention' || student.progress < 50;
        } else if (statusFilter === 'Ready for Viva') {
          matchesStatus = student.progress >= 85 || student.status === 'Ready for Viva';
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'progress_desc') return b.progress - a.progress;
        if (sortBy === 'progress_asc') return a.progress - b.progress;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'similarity') return b.similarityIndex - a.similarityIndex;
        return 0;
      });
  }, [supervisorStudents, searchQuery, statusFilter, sortBy]);

  // Selected student details
  const currentSelectedStudent = useMemo(() => {
    return supervisorStudents.find(s => s.matric === selectedStudentMatric) || processedStudents[0] || supervisorStudents[0];
  }, [supervisorStudents, selectedStudentMatric, processedStudents]);

  // Milestone stages for cohort distribution bar chart
  const standardMilestoneStages = [
    { key: 'm1', label: '1. Topic Approval', fullTitle: 'Topic Ratification & Synopsis Defense', targetPct: 15 },
    { key: 'm2', label: '2. Lit Review & Protocol', fullTitle: 'Literature Review & Ethical Protocol Sign-off', targetPct: 35 },
    { key: 'm3', label: '3. Sampling & Culture', fullTitle: 'Clinical / Environmental Isolate Sampling', targetPct: 55 },
    { key: 'm4', label: '4. Benchwork & Assays', fullTitle: 'Laboratory Assays & PCR/MIC Analysis', targetPct: 70 },
    { key: 'm5', label: '5. Internal Clearance', fullTitle: 'Internal Defense Clearance & Similarity Audit', targetPct: 85 },
    { key: 'm6', label: '6. Viva Voce Ready', fullTitle: 'Final External Viva Voce & Thesis Submission', targetPct: 100 },
  ];

  // Cohort distribution analytics
  const stageCompletionCounts = useMemo(() => {
    return standardMilestoneStages.map(stage => {
      const count = supervisorStudents.filter(student => {
        const matchingMilestone = student.milestones?.find(m => 
          m.id === stage.key || m.title.toLowerCase().includes(stage.label.toLowerCase().slice(3))
        );
        if (matchingMilestone) return matchingMilestone.completed;
        return student.progress >= stage.targetPct;
      }).length;

      const percentage = supervisorStudents.length > 0 
        ? Math.round((count / supervisorStudents.length) * 100) 
        : 0;

      return {
        ...stage,
        completedCount: count,
        total: supervisorStudents.length,
        percentage
      };
    });
  }, [supervisorStudents]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = supervisorStudents.length;
    if (total === 0) return { total: 0, avgProgress: 0, clearedCount: 0, attentionCount: 0 };
    const avg = Math.round(supervisorStudents.reduce((acc, s) => acc + s.progress, 0) / total);
    const cleared = supervisorStudents.filter(s => s.progress >= 70).length;
    const attention = supervisorStudents.filter(s => s.status === 'Needs Attention' || s.progress < 50).length;
    return { total, avgProgress: avg, clearedCount: cleared, attentionCount: attention };
  }, [supervisorStudents]);

  // Progress bar color gradient utility
  const getProgressBarColor = (pct: number, isNeedsAttention: boolean) => {
    if (isNeedsAttention) return 'bg-rose-500';
    if (pct >= 85) return 'bg-[#CBA358]'; // Gold / Distinction
    if (pct >= 70) return 'bg-emerald-600'; // Emerald / Defense cleared
    if (pct >= 50) return 'bg-blue-600'; // Blue / Benchwork
    return 'bg-amber-500'; // Amber / Early stages
  };

  const getProgressBandLabel = (pct: number) => {
    if (pct >= 85) return 'Viva Voce Ready';
    if (pct >= 70) return 'Internal Defense Ready';
    if (pct >= 50) return 'Benchwork & Analysis';
    if (pct >= 25) return 'Methodology & Protocol';
    return 'Proposal & Inception';
  };

  // Toggle milestone completion
  const handleToggle = (milestoneId: string, currentStatus: boolean) => {
    if (!currentSelectedStudent) return;
    if (updateStudentMilestone) {
      updateStudentMilestone(currentSelectedStudent.matric, milestoneId, !currentStatus);
    } else {
      showToast(`Milestone status updated for ${currentSelectedStudent.name}`);
    }
  };

  // Save supervisor directive / remark for milestone
  const handleSaveRemark = (milestoneId: string) => {
    if (!currentSelectedStudent) return;
    if (!newRemarkText.trim()) return;

    if (updateStudentMilestone) {
      const milestone = currentSelectedStudent.milestones?.find(m => m.id === milestoneId);
      updateStudentMilestone(
        currentSelectedStudent.matric, 
        milestoneId, 
        milestone ? milestone.completed : false, 
        newRemarkText.trim()
      );
    }
    showToast(`Remark saved for milestone: ${newRemarkText.substring(0, 30)}...`);
    setActiveEditingMilestoneId(null);
    setNewRemarkText('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Summary KPIs Banner */}
      <div className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#CBA358]">
                <BarChart3 className="h-4 w-4 text-[#CBA358]" />
                Supervisory Project Analytics
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mt-1">
              Student Project Milestone & Progress Tracker
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Visualize dissertation milestones, calibrated progress percentages, and viva eligibility gates across all allocated candidates.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartViewMode('horizontal')}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  chartViewMode === 'horizontal'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Supervisee Progress Bars
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode('distribution')}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  chartViewMode === 'distribution'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cohort Milestone Columns
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                window.print();
                showToast('Preparing academic milestone audit print docket...');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 px-3.5 py-1.5 text-xs font-bold text-stone-700 shadow-2xs"
            >
              <Printer className="h-3.5 w-3.5 text-stone-500" />
              <span>Print Roster</span>
            </button>
          </div>
        </div>

        {/* 4 Clean Metric Summary Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Allocated Supervisees
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-stone-900">{summaryMetrics.total}</span>
              <span className="text-xs text-stone-500 font-medium">B.Sc. Candidates</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
              <span>Department of Computer Science</span>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Cohort Average Progress
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-[#CBA358]">{summaryMetrics.avgProgress}%</span>
              <span className="text-xs text-stone-500 font-medium">overall completion</span>
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-[#CBA358] h-full rounded-full transition-all duration-500" 
                style={{ width: `${summaryMetrics.avgProgress}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Cleared / Defense Ready
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-700">{summaryMetrics.clearedCount}</span>
              <span className="text-xs text-stone-500 font-medium">of {summaryMetrics.total} students</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              Passed 70% threshold gate
            </div>
          </div>

          <div className="rounded-2xl bg-stone-50/80 p-4 border border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Attention Required
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-600">{summaryMetrics.attentionCount}</span>
              <span className="text-xs text-stone-500 font-medium">candidates</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Similarity flags or bench lag
            </div>
          </div>
        </div>

        {summaryMetrics.total === 0 && (
          <div className="mt-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900">Zero Candidates Allocated (Newly Onboarded Supervisor)</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your supervisory docket currently has 0 assigned undergraduate students. Once the Departmental Project Coordinator or Faculty Admin allocates candidates to you, their dissertation milestones and progress percentage bars will populate here automatically.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Interactive Search, Filter & Sorters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-stone-200 shadow-2xs">
        <div className="flex-1 relative min-w-[220px]">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, matric, or research topic..."
            className="w-full rounded-xl bg-stone-50 border border-stone-200 pl-9 pr-4 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#CBA358] focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Filters */}
          <div className="inline-flex p-0.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-semibold">
            {(['All', 'On Track', 'Needs Attention', 'Ready for Viva'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`rounded-lg px-2.5 py-1 text-xs transition-all ${
                  statusFilter === tab
                    ? 'bg-white text-stone-900 font-bold shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={sortBy || 'progress_desc'}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-stone-200 bg-white px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#CBA358]"
            >
              <option value="progress_desc">Highest Progress (%)</option>
              <option value="progress_asc">Lowest Progress (%)</option>
              <option value="name">Candidate Name (A-Z)</option>
              <option value="similarity">Similarity Index (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Chart Display Section */}
      {chartViewMode === 'horizontal' ? (
        /* HORIZONTAL PROGRESS BAR CHART ROSTER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main Bar Chart Column (8 cols) */}
          <div className="lg:col-span-8 rounded-[24px] border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Student Progress Percentage Bar Chart
                </h3>
                <p className="text-xs text-stone-500">
                  Click any student bar to inspect granular laboratory milestones, turnitin indices, and enter supervisor directives.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-blue-600 inline-block" />
                  <span>&lt; 70% Benchwork</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600 inline-block" />
                  <span>&ge; 70% Internal Ready</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#CBA358] inline-block" />
                  <span>&ge; 85% Viva Ready</span>
                </span>
              </div>
            </div>

            {/* Percentage Scale Axis Indicators */}
            <div className="pl-44 sm:pl-56 pr-14 text-[10px] font-mono font-bold text-stone-400 flex justify-between select-none pt-1">
              <span>0%</span>
              <span className="hidden sm:inline">25% (Methodology)</span>
              <span>50% (Proposal Gate)</span>
              <span className="hidden sm:inline">75% (Internal Ready)</span>
              <span>100% (Viva)</span>
            </div>

            {/* Student Bars List */}
            <div className="space-y-3.5 pt-1">
              {processedStudents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center text-xs text-stone-500">
                  {summaryMetrics.total === 0
                    ? 'No supervisees currently assigned to your docket. Newly onboarded supervisors start with 0 students until allocated by Departmental Admin.'
                    : 'No candidates match the specified filter or search query.'}
                </div>
              ) : (
                processedStudents.map((student) => {
                  const isSelected = selectedStudentMatric === student.matric;
                  const isNeedsAttention = student.status === 'Needs Attention' || student.similarityIndex > 15;
                  const completedMilestones = student.milestones?.filter(m => m.completed).length || 0;
                  const totalMilestones = student.milestones?.length || 6;
                  const barColor = getProgressBarColor(student.progress, isNeedsAttention);

                  return (
                    <div
                      key={student.matric}
                      onClick={() => setSelectedStudentMatric(student.matric)}
                      className={`group cursor-pointer rounded-2xl p-3.5 transition-all border ${
                        isSelected
                          ? 'border-[#CBA358] bg-[#CBA358]/5 shadow-sm'
                          : 'border-stone-200/80 bg-stone-50/40 hover:bg-stone-50 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {/* Student Name & Matric Info Label (Fixed Width on Desktop) */}
                        <div className="w-full sm:w-52 shrink-0 space-y-0.5">
                          <div className="flex items-center justify-between sm:justify-start gap-1.5">
                            <span className="text-xs font-bold text-stone-900 group-hover:text-blue-700 transition-colors">
                              {student.name}
                            </span>
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#CBA358]" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                            <span className="font-mono">{student.matric}</span>
                            <span>·</span>
                            <span>{completedMilestones}/{totalMilestones} done</span>
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-1 italic">
                            {student.topic}
                          </p>
                        </div>

                        {/* Bar Graphic & Percentage */}
                        <div className="flex-1 flex items-center gap-3">
                          {/* Relative Bar Track */}
                          <div className="relative flex-1 bg-stone-200/70 h-7 rounded-xl overflow-hidden p-0.5 flex items-center">
                            {/* Target threshold guidelines */}
                            <div className="absolute left-[50%] top-0 bottom-0 w-[1px] bg-stone-300 z-0" title="50% Proposal Clearance Gate" />
                            <div className="absolute left-[75%] top-0 bottom-0 w-[1px] bg-stone-300 z-0" title="75% Internal Defense Gate" />

                            {/* Active Bar Fill */}
                            <div
                              className={`h-full rounded-lg ${barColor} transition-all duration-700 flex items-center justify-end pr-2 text-white font-mono text-[11px] font-extrabold z-10 shadow-xs`}
                              style={{ width: `${Math.max(8, student.progress)}%` }}
                            >
                              {student.progress >= 20 && (
                                <span>{student.progress}%</span>
                              )}
                            </div>

                            {/* Label inside if bar is too small */}
                            {student.progress < 20 && (
                              <span className="ml-2 font-mono text-[11px] font-extrabold text-stone-700 z-10">
                                {student.progress}%
                              </span>
                            )}
                          </div>

                          {/* Numerical Percentage Badge / Suffix */}
                          <div className="w-14 shrink-0 text-right">
                            <span className={`font-mono text-sm font-black ${
                              isNeedsAttention ? 'text-rose-600' : 'text-stone-900'
                            }`}>
                              {student.progress}%
                            </span>
                            <span className="block text-[10px] text-stone-400 uppercase tracking-tighter">
                              {student.similarityIndex > 15 ? 'Turnitin Flag' : student.progress >= 75 ? 'Cleared' : 'In Flight'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sub-bar Stage Text */}
                      <div className="mt-2 pt-2 border-t border-stone-200/50 flex flex-wrap items-center justify-between text-[11px] text-stone-500">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-700">{student.stage}</span>
                          <span>·</span>
                          <span>Track: {student.track || 'Computer Science'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>Similarity: <strong className={student.similarityIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}>{student.similarityIndex}%</strong></span>
                          <span>Last Meeting: <strong className="text-stone-700">{student.lastMeeting}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right / Selected Student Detail & Milestone Checklist (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {currentSelectedStudent ? (
              <div className="rounded-[24px] border border-stone-200 bg-white p-5 shadow-xs space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#CBA358] uppercase tracking-wider">
                      Candidate Dossier
                    </span>
                    <span className={`text-[10px] font-extrabold rounded-md px-2 py-0.5 ${
                      currentSelectedStudent.status === 'Needs Attention'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {currentSelectedStudent.status}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-stone-900 mt-1">
                    {currentSelectedStudent.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="font-mono">{currentSelectedStudent.matric}</span>
                    <span>·</span>
                    <span>{currentSelectedStudent.track || 'Computer Science'}</span>
                  </div>
                  <p className="text-xs text-stone-700 font-medium mt-1 leading-relaxed">
                    {currentSelectedStudent.topic}
                  </p>
                </div>

                {/* Progress Gauge & Stats */}
                <div className="rounded-2xl bg-stone-50 p-3.5 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">Calibrated Progress</span>
                    <span className="font-mono text-base font-extrabold text-[#CBA358]">
                      {currentSelectedStudent.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressBarColor(currentSelectedStudent.progress, currentSelectedStudent.status === 'Needs Attention')} transition-all duration-500`}
                      style={{ width: `${currentSelectedStudent.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-stone-500 pt-1">
                    <span>Gate: <strong>{getProgressBandLabel(currentSelectedStudent.progress)}</strong></span>
                    <span>Turnitin: <strong className={currentSelectedStudent.similarityIndex > 15 ? 'text-rose-600' : 'text-emerald-700'}>{currentSelectedStudent.similarityIndex}%</strong></span>
                  </div>
                </div>

                {/* Granular Milestones Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">
                      Academic Milestone Milestones
                    </h4>
                    <span className="text-[11px] font-bold text-stone-500">
                      {currentSelectedStudent.milestones?.filter(m => m.completed).length || 0} of {currentSelectedStudent.milestones?.length || 0}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {currentSelectedStudent.milestones && currentSelectedStudent.milestones.length > 0 ? (
                      currentSelectedStudent.milestones.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-xl border p-3 text-xs transition-all ${
                            m.completed
                              ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                              : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggle(m.id, m.completed)}
                              className={`mt-0.5 h-4 w-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                m.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-stone-300 bg-white hover:border-stone-400'
                              }`}
                              title={m.completed ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {m.completed && <Check className="h-3 w-3 stroke-[3]" />}
                            </button>

                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-bold ${m.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                                  {m.title}
                                </span>
                                {m.weight && (
                                  <span className="font-mono text-[10px] text-stone-400">
                                    +{m.weight}%
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                <span>{m.category || 'Milestone'}</span>
                                <span>·</span>
                                <span>{m.date || 'Scheduled'}</span>
                              </div>

                              {m.remarks && (
                                <p className="text-[11px] text-stone-600 bg-white/80 rounded-md p-1.5 border border-stone-200/60 mt-1 italic">
                                  "{m.remarks}"
                                </p>
                              )}

                              {/* Inline Remark Edit toggle */}
                              {activeEditingMilestoneId === m.id ? (
                                <div className="pt-1.5 space-y-1.5">
                                  <input
                                    type="text"
                                    value={newRemarkText || ''}
                                    onChange={(e) => setNewRemarkText(e.target.value)}
                                    placeholder="Type supervisor directive or laboratory feedback..."
                                    className="w-full rounded-lg border border-stone-300 px-2 py-1 text-xs text-stone-800 focus:outline-none focus:border-[#CBA358]"
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setActiveEditingMilestoneId(null)}
                                      className="rounded-md px-2 py-0.5 text-[10px] text-stone-500 hover:text-stone-800"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveRemark(m.id)}
                                      className="rounded-md bg-[#CBA358] text-[#1A1A1A] font-bold px-2.5 py-0.5 text-[10px] shadow-2xs"
                                    >
                                      Save Directive
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveEditingMilestoneId(m.id);
                                    setNewRemarkText(m.remarks || '');
                                  }}
                                  className="text-[10px] text-blue-700 hover:underline font-medium block pt-0.5"
                                >
                                  + {m.remarks ? 'Update supervisor note' : 'Add supervisor note'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic p-3">No specific milestones configured for this candidate.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Supervisee */}
                <div className="border-t border-stone-100 pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveClearance(currentSelectedStudent.matric);
                      showToast(`Defense clearance endorsed for ${currentSelectedStudent.name}`);
                    }}
                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Endorse Defense Clearance</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('document_reviews');
                        showToast(`Opening draft submissions for ${currentSelectedStudent.name}`);
                      }}
                      className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold py-2 shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="h-3.5 w-3.5 text-stone-500" />
                      <span>View Drafts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveView('meetings');
                        showToast(`Booking consultation docket for ${currentSelectedStudent.name}`);
                      }}
                      className="rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold py-2 shadow-2xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="h-3.5 w-3.5 text-stone-500" />
                      <span>Log Meeting</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[24px] border border-stone-200 bg-white p-6 text-center text-xs text-stone-500">
                {summaryMetrics.total === 0
                  ? 'No candidates allocated yet. Once candidates are assigned to your supervision docket, their milestone dossiers will be displayed here.'
                  : 'Select a student from the bar chart to view milestone details.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* COHORT MILESTONE DISTRIBUTION (VERTICAL COLUMN CHART) */
        <div className="rounded-[24px] border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-stone-900">
                Cohort Milestone Completion Velocity (Vertical Bar Chart)
              </h3>
              <p className="text-xs text-stone-500">
                Vertical bar distribution showing cohort clearance rates at each statutory dissertation benchmark.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600">
                Total Candidates: <strong className="text-stone-900">{supervisorStudents.length}</strong>
              </span>
            </div>
          </div>

          {/* Vertical Bar Chart Container */}
          <div className="relative pt-6 pb-2">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-12 pt-6">
              {[100, 75, 50, 25, 0].map(pct => (
                <div key={pct} className="flex items-center gap-2 w-full text-[10px] font-mono text-stone-400">
                  <span className="w-8 text-right">{pct}%</span>
                  <div className="h-[1px] bg-stone-100 flex-1" />
                </div>
              ))}
            </div>

            {/* Bars Grid */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pl-10 h-64 items-end">
              {stageCompletionCounts.map((stage) => {
                const barHeightPct = Math.max(8, stage.percentage);
                const isHighCompletion = stage.percentage >= 70;
                const isModerate = stage.percentage >= 40;

                return (
                  <div key={stage.key} className="flex flex-col items-center h-full justify-end group">
                    {/* Top percentage & count value label */}
                    <div className="mb-2 text-center">
                      <span className="block text-xs font-mono font-extrabold text-stone-900">
                        {stage.percentage}%
                      </span>
                      <span className="block text-[10px] text-stone-500 font-medium">
                        {stage.completedCount}/{stage.total} students
                      </span>
                    </div>

                    {/* The Vertical Bar Graphic */}
                    <div className="w-14 sm:w-16 bg-stone-100 rounded-t-xl overflow-hidden flex flex-col justify-end p-1 border border-stone-200">
                      <div
                        className={`w-full rounded-lg transition-all duration-700 ${
                          isHighCompletion 
                            ? 'bg-emerald-600' 
                            : isModerate 
                              ? 'bg-[#CBA358]' 
                              : 'bg-blue-600'
                        } shadow-xs group-hover:brightness-110 flex items-center justify-center`}
                        style={{ height: `${barHeightPct}%` }}
                      >
                        {stage.percentage >= 30 && (
                          <span className="text-[10px] font-mono text-white font-bold rotate-0">
                            {stage.completedCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Label (X-Axis) */}
                    <div className="mt-3 text-center px-1">
                      <span className="block text-xs font-extrabold text-stone-900 line-clamp-1">
                        {stage.label}
                      </span>
                      <span className="block text-[10px] text-stone-500 leading-tight line-clamp-2 mt-0.5">
                        {stage.fullTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Qualitative Stage Insights */}
          <div className="rounded-2xl bg-stone-50 p-4 border border-stone-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Synopsis & Topic Clearance (100%)</span>
              </span>
              <p className="text-stone-600">
                All 6 allocated candidates have satisfied the initial departmental topic ratification criteria and literature scope.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[#CBA358]" />
                <span>Active Laboratory Benchwork</span>
              </span>
              <p className="text-stone-600">
                4 candidates are actively generating data in BSL-2 suites (gel electrophoresis, MIC disc diffusions, and GC-MS).
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-stone-900 block flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600" />
                <span>Viva Voce Readiness</span>
              </span>
              <p className="text-stone-600">
                Candidate Ibrahim Musa Farouk has reached 92% completion and is fully cleared for the upcoming visiting external defense session.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
