import React, { useState } from 'react';
import { 
  CalendarDays, 
  FileSpreadsheet, 
  CheckSquare, 
  History, 
  Clock, 
  MapPin, 
  Award, 
  User, 
  CheckCircle2, 
  Sliders, 
  Send,
  Download,
  AlertCircle,
  FlaskConical,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InternalStaffDashboard } from './InternalStaffDashboard';
import { DefenseClearanceFormModal } from '../clearance/DefenseClearanceFormModal';
import { DefenseStage } from '../../types';

export const PanelViews: React.FC = () => {
  const { 
    activeView, 
    defenseSessions, 
    scoreCandidate, 
    showToast,
    setActiveView 
  } = useApp();

  // Defense Clearance Modal state
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [clearanceStage, setClearanceStage] = useState<DefenseStage>('proposal');
  const [clearanceTargetMatric, setClearanceTargetMatric] = useState<string | null>(null);

  // Scoring rubric state for Defense
  const [selectedCandidate, setSelectedCandidate] = useState('DEF-CSC-2026-083');
  const [scoreSoftwareDesign, setScoreSoftwareDesign] = useState<number>(24);
  const [scorePresentation, setScorePresentation] = useState<number>(16);
  const [scoreProjectReports, setScoreProjectReports] = useState<number>(23);
  const [scoreResponseToQuestions, setScoreResponseToQuestions] = useState<number>(15);
  const [recommendation, setRecommendation] = useState('Pass with minor corrections');
  const [remarks, setRemarks] = useState('Strong computer science and software engineering foundation. Solid architecture, modular design, and robust algorithm performance.');

  // Total calculated dynamically
  const totalScore = (Number(scoreSoftwareDesign) || 0) + (Number(scorePresentation) || 0) + (Number(scoreProjectReports) || 0) + (Number(scoreResponseToQuestions) || 0);

  const renderClearanceModal = () => (
    <DefenseClearanceFormModal
      isOpen={isClearanceModalOpen}
      candidateMatric={clearanceTargetMatric || undefined}
      initialStage={clearanceStage}
      onClose={() => {
        setIsClearanceModalOpen(false);
        setClearanceTargetMatric(null);
      }}
    />
  );

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = defenseSessions.find(s => s.sessionCode === selectedCandidate || s.id === selectedCandidate);
    if (session) {
      scoreCandidate(session.id, totalScore);
    } else {
      showToast(`Evaluation score (${totalScore}/100) recorded for ${selectedCandidate}.`);
    }
  };

  // 1. PANEL OVERVIEW
  if (activeView === 'overview') {
    return <InternalStaffDashboard initialTab="panels" />;
  }

  // 2. DEFENSE SCHEDULE
  if (activeView === 'defense_schedule') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Panel A Examination Hearing Timetable</h2>
              <p className="text-xs text-slate-500">Official scheduled defense appearances for 2025/2026 Session · Department of Computer Science</p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Defense timetable schedule exported to PDF.')}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Timetable</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {defenseSessions.map((sess) => (
              <div key={sess.id} className="py-4 hover:bg-slate-50/50 rounded-2xl px-3 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600">{sess.sessionCode}</span>
                      <span className="font-bold text-sm text-slate-900">{sess.candidateName}</span>
                      <span className="font-mono text-xs text-slate-400">({sess.candidateMatric})</span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {sess.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium mt-1">
                      {sess.topic}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {sess.date} at {sess.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {sess.venue}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setClearanceTargetMatric(sess.candidateMatric);
                        const sType = sess.type.toLowerCase();
                        setClearanceStage(sType.includes('internal') ? 'internal' : sType.includes('external') ? 'external' : 'proposal');
                        setIsClearanceModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-bold shadow-2xs active:scale-98 transition-all cursor-pointer"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-amber-700" />
                      <span>Clearance Slip</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCandidate(sess.sessionCode);
                        setActiveView('proposal_scoring');
                      }}
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                    >
                      Open Rubric
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {renderClearanceModal()}
      </div>
    );
  }

  // 3. PROPOSAL DEFENSE SCORING & RUBRIC
  if (activeView === 'rubric_scoring' || activeView === 'proposal_scoring') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                Official Senate Rubric
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">Proposal Defense Evaluation Form</h2>
              <p className="text-xs text-slate-500">Department of Computer Science · Examination Panel A</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const currSession = defenseSessions.find(s => s.sessionCode === selectedCandidate || s.id === selectedCandidate);
                  setClearanceTargetMatric(currSession?.candidateMatric || null);
                  setClearanceStage('proposal');
                  setIsClearanceModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-1.5 text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-700" />
                <span>Clearance Slip (Official Template)</span>
              </button>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold block">Composite Score</span>
                <span className={`text-2xl font-black ${totalScore >= 70 ? 'text-emerald-700' : totalScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {totalScore}
                </span>
                <span className="text-xs text-slate-400"> / 100</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleScoreSubmit} className="mt-5 space-y-6">
            {/* Candidate Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Candidate Docket</label>
              <select
                value={selectedCandidate || ''}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {defenseSessions.map(s => (
                  <option key={s.sessionCode} value={s.sessionCode}>
                    {s.candidateName} ({s.candidateMatric}) - {s.topic.substring(0, 65)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Rubric Item 1 */}
            <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">1. Software Design & Quality (Max 30 Marks)</h4>
                  <p className="text-[11px] text-slate-500">Architectural soundness, code quality, software testbed execution, algorithms and scalability</p>
                </div>
                <span className="font-mono text-sm font-extrabold text-blue-600">{scoreSoftwareDesign ?? 0} / 30</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={scoreSoftwareDesign ?? 0}
                onChange={(e) => setScoreSoftwareDesign(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rubric Item 2 */}
            <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">2. Presentation (Max 20 Marks)</h4>
                  <p className="text-[11px] text-slate-500">Viva voce oral presentation, slide clarity, technical poise, and adherence to time allocation</p>
                </div>
                <span className="font-mono text-sm font-extrabold text-blue-600">{scorePresentation ?? 0} / 20</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={scorePresentation ?? 0}
                onChange={(e) => setScorePresentation(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rubric Item 3 */}
            <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">3. Project Reports & Documentation (Max 30 Marks)</h4>
                  <p className="text-[11px] text-slate-500">Dissertation manuscript (Chapters 1–5), Turnitin similarity compliance (&lt;15%), and IEEE format citations</p>
                </div>
                <span className="font-mono text-sm font-extrabold text-blue-600">{scoreProjectReports ?? 0} / 30</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={scoreProjectReports ?? 0}
                onChange={(e) => setScoreProjectReports(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rubric Item 4 */}
            <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">4. Response to Questions (Max 20 Marks)</h4>
                  <p className="text-[11px] text-slate-500">Defense inquiry handling, mastery of computer science fundamentals, and technical justification</p>
                </div>
                <span className="font-mono text-sm font-extrabold text-blue-600">{scoreResponseToQuestions ?? 0} / 20</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                value={scoreResponseToQuestions ?? 0}
                onChange={(e) => setScoreResponseToQuestions(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Recommendation & Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Panel Recommendation</label>
                <select
                  value={recommendation || ''}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Pass without corrections">Pass without corrections</option>
                  <option value="Pass with minor corrections">Pass with minor corrections (2 weeks)</option>
                  <option value="Pass with major corrections">Pass with major corrections (4 weeks)</option>
                  <option value="Re-defense required">Re-defense required before board</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Panel Confidential Remarks</label>
                <input
                  type="text"
                  value={remarks || ''}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  placeholder="Specific points candidate must modify in thesis..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
              >
                <Send className="h-4 w-4" />
                <span>Submit Official Evaluation ({totalScore} / 100)</span>
              </button>
            </div>
          </form>
        </div>
        {renderClearanceModal()}
      </div>
    );
  }

  // 4. INTERNAL DEFENSE SCORING
  if (activeView === 'internal_scoring') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Laboratory Assay & Culture Demonstration Scoring</h2>
              <p className="text-xs text-slate-500">Live evaluation of microbial cultures, zone inhibition plates, and spectrophotometric replicates</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              Active Examination Mode
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Candidate <strong>Amina Bello (CSC/2021/0482)</strong> is demonstrating disk diffusion zone inhibition results 
            and minimum inhibitory concentration (MIC) spectrophotometry against 12 clinical ESBL-producing Enterobacteriaceae isolates.
          </p>

          <div className="space-y-3">
            {[
              { rubric: 'Culture Purity, Gram-Staining & Morphological Verification', max: 35, current: 33 },
              { rubric: 'Antibiogram Disk Diffusion Zone Inhibition & CLSI Measurement', max: 35, current: 31 },
              { rubric: 'Statistical Validity, Standard Deviation & Biosafety Compliance', max: 30, current: 28 },
            ].map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.rubric}</h4>
                  <span className="text-[11px] text-slate-500">Standardized Departmental Viva criteria</span>
                </div>
                <span className="font-mono font-extrabold text-blue-600 text-sm">{item.current} / {item.max}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                scoreCandidate('def_01', 92);
                showToast('Internal Defense Benchwork Score (92/100) signed off by Panel Chair.');
              }}
              className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
            >
              Sign-off Laboratory Score (92/100)
            </button>
          </div>
        </div>
        {renderClearanceModal()}
      </div>
    );
  }

  // 5. EVALUATION HISTORY
  if (activeView === 'evaluation_history') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">Historical Panel Scoring Archive</h2>
          <p className="text-xs text-slate-500 mb-4">Ratified evaluations submitted by Panel A for 2025/2026 Session</p>

          <div className="divide-y divide-slate-100">
            {[
              { name: 'Ibrahim Musa Farouk', matric: 'CSC/2021/0445', type: 'Proposal Defense', score: 88, grade: 'A', remarks: 'Exceptional presentation and lytic phage titer optimization protocols.' },
              { name: 'Amina Bello', matric: 'CSC/2021/0482', type: 'Proposal Defense', score: 86.5, grade: 'A', remarks: 'Rigorous biosafety precautions and clear selection of multi-drug resistant clinical isolates.' },
              { name: 'Zainab Kabir Usman', matric: 'CSC/2021/0390', type: 'Proposal Defense', score: 81, grade: 'A-', remarks: 'Promising preliminary zone inhibition data against Acinetobacter.' },
            ].map((hist, idx) => (
              <div key={idx} className="py-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-900">{hist.name} ({hist.matric})</p>
                  <p className="text-[11px] text-slate-500">{hist.type} · Grade {hist.grade}</p>
                  <p className="text-[11px] text-slate-600 italic mt-0.5">"{hist.remarks}"</p>
                </div>
                <span className="text-base font-extrabold text-slate-900">{hist.score} / 100</span>
              </div>
            ))}
          </div>
        </div>
        {renderClearanceModal()}
      </div>
    );
  }

  return <InternalStaffDashboard initialTab="panels" />;
};
