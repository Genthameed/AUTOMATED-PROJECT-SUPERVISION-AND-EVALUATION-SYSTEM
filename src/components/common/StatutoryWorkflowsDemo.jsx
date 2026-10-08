/**
 * =============================================================================
 * Automated Project Supervision and Evaluation System (APSES)
 * Statutory Action Workflow & Integration Hub (StatutoryWorkflowsDemo.jsx)
 * 
 * Demonstrates the interactive execution of:
 * 1. Lab Technologist Benchwork Certification (handleCertifyBenchwork -> Green toast)
 * 2. HOD Master Score Gazette Release (handlePublishScores -> Senate Gold toast)
 * 3. Gateway Guard (handleScheduleDefense -> Stark Red Error toast on >15% Turnitin)
 * 4. DocumentUploader (PDF & Gel Micrographs with #CBA358 Gold Progress & Turnitin Audit)
 * =============================================================================
 */

import React, { useState } from 'react';
import {
  FlaskConical,
  Award,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  Calendar,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  BookOpen,
  FileSpreadsheet
} from 'lucide-react';
import { DocumentUploader } from './DocumentUploader';
import {
  handleCertifyBenchwork,
  handlePublishScores,
  handleScheduleDefense,
  toastManager
} from '../../services/statutoryActions';
import {
  useStudentDashboard,
  useLabLogbook,
  useScoreRollup
} from '../../services/apiHooks';

export function StatutoryWorkflowsDemo() {
  const [selectedStudentId] = useState('usr-student-adama');
  const [selectedProjectId] = useState('proj-adama-001');

  // React custom hooks
  const {
    data: dashboardData,
    isLoading: isDashLoading,
    refetch: refetchDashboard,
  } = useStudentDashboard(selectedStudentId);

  const {
    data: logbookData,
    isLoading: isLogbookLoading,
    refetch: refetchLogbook,
  } = useLabLogbook(selectedProjectId);

  const {
    data: scoreData,
    isLoading: isScoreLoading,
    refetch: refetchScores,
  } = useScoreRollup(selectedStudentId);

  // Local action pending state
  const [isCertifying, setIsCertifying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState('uploader'); // 'uploader' | 'technologist' | 'hod_gazette' | 'defense_guard'

  // ---------------------------------------------------------------------------
  // 1. Lab Technologist Action: handleCertifyBenchwork
  // ---------------------------------------------------------------------------
  const onCertifyClick = async () => {
    setIsCertifying(true);
    try {
      const entryIds = logbookData?.entries?.map((e) => e.id) || ['log-001', 'log-002'];
      await handleCertifyBenchwork({
        logbookEntryIds: entryIds,
        technologistId: 'usr-tech-danladi',
        technologistRemarks: 'Microservice benchmark latency curves, system testbed traces, and invariant proofs authenticated on computing rig.',
        onSuccess: () => {
          refetchLogbook();
          refetchDashboard();
        },
      });
    } catch (err) {
      console.error('Certification error caught:', err);
    } finally {
      setIsCertifying(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. HOD / Panel Chair Action: handlePublishScores
  // ---------------------------------------------------------------------------
  const onPublishClick = async () => {
    setIsPublishing(true);
    try {
      await handlePublishScores({
        projectId: selectedProjectId,
        actingUser: {
          id: 'usr-hod-bello',
          role: 'HEAD_OF_DEPARTMENT',
          name: 'Dr. Amina Bello (HOD)',
        },
        senateResolutionCode: 'SENATE/RES/2026/CSC-0445',
        onSuccess: () => {
          refetchScores();
        },
      });
    } catch (err) {
      console.error('Publishing error caught:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 3. Statutory Defense Guard Action: handleScheduleDefense (Demonstrates Stark Red Error)
  // ---------------------------------------------------------------------------
  const onTestDefenseBlockedClick = async () => {
    setIsScheduling(true);
    try {
      // Intentionally attempts to schedule a student with Turnitin > 15% or unmet gate
      await handleScheduleDefense({
        studentId: 'usr-student-flagged', // Candidate with 24.5% Turnitin breach
        defenseType: 'EXTERNAL_VIVA_VOCE',
        actingUser: {
          id: 'usr-hod-bello',
          role: 'HEAD_OF_DEPARTMENT',
          name: 'Dr. Amina Bello (HOD)',
        },
        onError: (err) => {
          console.warn('Statutory defense block intercepted as expected:', err.message);
        },
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const onTestDefenseClearedClick = async () => {
    setIsScheduling(true);
    try {
      await handleScheduleDefense({
        studentId: selectedStudentId,
        defenseType: 'PROPOSAL',
        actingUser: {
          id: 'usr-hod-bello',
          role: 'HEAD_OF_DEPARTMENT',
          name: 'Dr. Amina Bello (HOD)',
        },
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner in Cream / Charcoal / Gold */}
      <div className="rounded-2xl border border-[#E5E2DA] bg-[#FDFBF7] p-6 shadow-xs text-[#1A1A1A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EAE7DE]">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#FAF5EB] border border-[#EADBBD] text-[#8C6B28] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#CBA358]" />
              Computer Science Academic Integrity & Gateway Controller
            </div>
            <h2 className="text-xl font-extrabold text-[#1A1A1A] tracking-tight">
              Statutory Project Supervision & Evaluation Integration Layer
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Active Candidate: <strong>Adama Bello</strong> (Matric: CSC/2021/0445) • Current Gate:{' '}
              <span className="font-mono text-[#8C6B28] font-bold">
                {dashboardData?.currentGate || 'BENCHWORK_COMPLETION'}
              </span>
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#EFECE4] p-1.5 rounded-xl border border-[#E2DDD3]">
            <button
              type="button"
              onClick={() => setActiveTab('uploader')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'uploader'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Document & Assay Vault
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('technologist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'technologist'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lab Technologist Desk
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('hod_gazette')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'hod_gazette'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              HOD Score Gazette
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('defense_guard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'defense_guard'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Gateway Guard (Plagiarism Test)
            </button>
          </div>
        </div>

        {/* Tab 1: Secure Document & Software Artifact Uploader */}
        {activeTab === 'uploader' && (
          <div className="mt-6 space-y-4">
            <DocumentUploader
              projectId={selectedProjectId}
              studentMatric="CSC/2021/0445"
              onUploadSuccess={() => {
                refetchDashboard();
                refetchLogbook();
              }}
            />
          </div>
        )}

        {/* Tab 2: Laboratory Technologist Benchwork Certification */}
        {activeTab === 'technologist' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#DFDAD0] bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    Wet-Lab Benchwork Certification Service
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Chief Laboratory Technologist: <strong>Mallam Ibrahim Danladi</strong> (Role: LAB_TECHNOLOGIST)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onCertifyClick}
                  disabled={isCertifying}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs"
                >
                  {isCertifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Authenticating Assays...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Certify Wet-Lab Benchwork
                    </>
                  )}
                </button>
              </div>

              {/* Logbook Entries Display */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-600 px-1">
                  <span>Candidate Logbook Assays ({logbookData?.totalEntries || 3} recorded)</span>
                  <span className="font-bold text-emerald-700">
                    {logbookData?.certifiedCount || 2} / {logbookData?.totalEntries || 3} Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span>Double-Layer Agar Plaque Assay</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                        CERTIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Plaque titer: 2.8 × 10⁸ PFU/mL against MDR K. pneumoniae (Strain ATCC 700603).
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">
                      Signed off by Chief Technologist Danladi
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span>Bacterial Growth Curve & Spectrophotometry</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px]">
                        CERTIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      OD600 spectrophotometric absorbance monitored at 30-minute intervals for 8 hours.
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">
                      Signed off by Chief Technologist Danladi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: HOD Master Score Gazette */}
        {activeTab === 'hod_gazette' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#DFDAD0] bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#CBA358]" />
                    Master Score Broadsheet Rollup (20 / 20 / 20 / 40 Formula)
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Authorized Signatory: <strong>Dr. Amina Bello</strong> (Head of Department)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onPublishClick}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-bold hover:bg-stone-800 disabled:opacity-50 transition-all shadow-xs"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#CBA358]" />
                      Ratifying with Senate...
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-[#CBA358]" />
                      Publish Master Scores (Senate Gazette)
                    </>
                  )}
                </button>
              </div>

              {/* Statutory Weighting Grid */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Proposal Defense (20%)</span>
                  <div className="text-base font-extrabold text-[#1A1A1A] mt-1">88.0%</div>
                  <span className="text-[11px] text-[#8C6B28] font-bold">17.6 / 20 pts</span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Benchwork Log (20%)</span>
                  <div className="text-base font-extrabold text-[#1A1A1A] mt-1">94.0%</div>
                  <span className="text-[11px] text-[#8C6B28] font-bold">18.8 / 20 pts</span>
                </div>

                <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/70">
                  <span className="text-[10px] uppercase font-bold text-stone-500">Internal Pre-Viva (20%)</span>
                  <div className="text-base font-extrabold text-[#1A1A1A] mt-1">86.0%</div>
                  <span className="text-[11px] text-[#8C6B28] font-bold">17.2 / 20 pts</span>
                </div>

                <div className="p-3 rounded-xl border border-[#EADBBD] bg-[#FAF5EB]">
                  <span className="text-[10px] uppercase font-bold text-[#8C6B28]">External Viva Voce (40%)</span>
                  <div className="text-base font-extrabold text-[#1A1A1A] mt-1">91.0%</div>
                  <span className="text-[11px] text-[#8C6B28] font-bold">36.4 / 40 pts</span>
                </div>
              </div>

              {/* Composite Total Banner */}
              <div className="mt-4 rounded-xl bg-[#FAF5EB] p-4 border border-[#EADBBD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-stone-700">Final Weighted Composite:</span>
                  <span className="text-lg font-black text-[#1A1A1A] ml-2">90.0%</span>
                  <span className="ml-2 text-stone-500">
                    ({scoreData?.rollup?.degreeClass || 'First Class Honours (Distinction)'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#1A1A1A] text-white font-bold text-[11px]">
                    Status: {scoreData?.rollup?.isPublished ? 'PUBLISHED TO SENATE' : 'LOCKED (PENDING HOD)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Statutory Gateway Guard (Turnitin > 15% Stark Red Error Demo) */}
        {activeTab === 'defense_guard' && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-[#DFDAD0] bg-white p-5 shadow-xs">
              <div className="pb-3 border-b border-stone-100">
                <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Statutory Clearance Gateway Guard & Plagiarism Enforcement
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Protects against "gate jumping" and enforces university similarity ceiling (&lt; 15.0%)
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breached Candidate Test Box */}
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">Flagged Candidate Test</span>
                    <span className="px-2 py-0.5 rounded bg-rose-200 text-rose-800 text-[10px] font-bold">
                      24.5% Turnitin Similarity
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Attempts to schedule an <strong>External Senate Viva Voce</strong> for candidate Adama Bello while Turnitin similarity is at 24.5% (exceeding the 15% threshold).
                  </p>
                  <button
                    type="button"
                    onClick={onTestDefenseBlockedClick}
                    disabled={isScheduling}
                    className="w-full py-2 px-3 rounded-lg bg-[#1A1A1A] border border-rose-600 text-rose-400 text-xs font-bold hover:bg-stone-900 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
                    <span>Test Statutory Defense Block (Expect Stark Red Toast)</span>
                  </button>
                </div>

                {/* Validated Candidate Test Box */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Cleared Prerequisite Test</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                      Proposal Defense
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Schedules a valid <strong>Proposal Defense</strong> where prerequisite bioethics and initial topic clearances have been verified.
                  </p>
                  <button
                    type="button"
                    onClick={onTestDefenseClearedClick}
                    disabled={isScheduling}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Test Valid Scheduling (Expect Green Toast)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
