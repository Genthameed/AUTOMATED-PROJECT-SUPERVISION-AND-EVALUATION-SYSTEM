import React, { useState } from 'react';
import { 
  GraduationCap, 
  FileCheck2, 
  Download, 
  ShieldCheck, 
  Send, 
  Award, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Building,
  UserCheck,
  FlaskConical
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AdminAndExternalDashboard } from './AdminAndExternalDashboard';
import { downloadDocumentFile } from '../../utils/documentDownload';

export const ExternalViews: React.FC = () => {
  const { activeView, showToast, setActiveView } = useApp();

  const [selectedCandidate, setSelectedCandidate] = useState('CSC/2021/0445');
  const [scoreOriginality, setScoreOriginality] = useState<number>(24);
  const [scoreRigor, setScoreRigor] = useState<number>(24);
  const [scoreDissertation, setScoreDissertation] = useState<number>(23);
  const [scoreViva, setScoreViva] = useState<number>(25);
  const [externalRecommendation, setExternalRecommendation] = useState('Award B.Sc. Degree with First Class Honours');
  const [externalReport, setExternalReport] = useState('The dissertation demonstrates exemplary scholarly contribution in lightweight deep learning intrusion detection models and sub-millisecond edge packet classification.');

  const totalScore = scoreOriginality + scoreRigor + scoreDissertation + scoreViva;

  const handleExternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`External Examiner Viva Score (${totalScore}/100) signed and transmitted to Dean of Computing & HOD Computer Science.`);
  };

  // 1. EXTERNAL OVERVIEW, ASSIGNED DEFENSES & FINAL SCORING
  // Renders bespoke luxury External Supervisor Dashboard with dedicated student detail and grading views
  if (activeView === 'overview' || activeView === 'assigned_defenses' || activeView === 'final_scoring') {
    return <AdminAndExternalDashboard initialRole="external_supervisor" />;
  }

  // 2. ASSIGNED DEFENSES
  if (activeView === 'assigned_defenses') {
    const externalCandidates = [
      { matric: 'CSC/2021/0445', name: 'Ibrahim Musa Farouk', topic: 'Design and Implementation of High-Throughput Intrusion Detection System Using Deep Neural Networks', supervisor: 'Dr. K. O. Alabi', similarity: '8.4%', size: '14.2 MB' },
      { matric: 'CSC/2021/0482', name: 'Amina Bello', topic: 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures', supervisor: 'Dr. K. O. Alabi', similarity: '11.2%', size: '18.1 MB' },
      { matric: 'CSC/2021/0390', name: 'Zainab Kabir Usman', topic: 'Hardware-Accelerated Cryptographic Primitives for Ultra-Low Latency Embedded Systems', supervisor: 'Dr. V. Adeyemi', similarity: '9.8%', size: '12.5 MB' },
      { matric: 'CSC/2021/0512', name: 'Suleiman Danjuma', topic: 'Automated Vulnerability Detection in Smart Contracts Using Static Analysis and Machine Learning', supervisor: 'Dr. A. Salisu', similarity: '13.1%', size: '16.0 MB' },
    ];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Assigned Final Year Computer Science Project Reports</h2>
              <p className="text-xs text-slate-500">Download complete dissertations, raw assay spectrophotometry datasets, and similarity slips</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800">
              4 of 8 Ready for Viva
            </span>
          </div>

          <div className="space-y-4">
            {externalCandidates.map((cand) => (
              <div key={cand.matric} className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{cand.name}</h3>
                      <span className="font-mono text-xs text-slate-400">({cand.matric})</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                        Turnitin: {cand.similarity}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 mt-1">
                      {cand.topic}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Supervisor: {cand.supervisor} · Size: {cand.size}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        downloadDocumentFile({
                          name: `${cand.name.replace(/\s+/g, '_')}_Dissertation.pdf`,
                          fileName: `${cand.name.replace(/\s+/g, '_')}_Dissertation.pdf`,
                          title: cand.topic,
                          category: 'Final Year Dissertation',
                          fileSize: cand.size,
                        }, {
                          name: cand.name,
                          matric: cand.matric,
                          supervisor: cand.supervisor,
                        });
                        showToast(`Downloaded dissertation PDF for ${cand.name}`);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 text-purple-700" />
                      <span>Download Thesis</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCandidate(cand.matric);
                        setActiveView('final_scoring_form');
                      }}
                      className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
                    >
                      Score Viva
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. FINAL DEFENSE SCORING FORM
  if (activeView === 'final_scoring_form') {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-700 border border-blue-200 uppercase">
                Senate Form CSC/EX-04
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-1.5">External Examiner Final Viva Voce Assessment</h2>
              <p className="text-xs text-slate-500">Degree of Bachelor of Science in Computer Science Examination</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-semibold block">External Viva Score</span>
              <span className="text-2xl font-black text-blue-600">{totalScore}</span>
              <span className="text-xs text-slate-400"> / 100</span>
            </div>
          </div>

          <form onSubmit={handleExternalSubmit} className="mt-5 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Under Assessment</label>
              <select
                value={selectedCandidate || ''}
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="CSC/2021/0445">Ibrahim Musa Farouk (CSC/2021/0445) - Deep Learning Intrusion Detection</option>
                <option value="CSC/2021/0482">Amina Bello (CSC/2021/0482) - Microservices Anomaly Detection</option>
                <option value="CSC/2021/0390">Zainab Kabir Usman (CSC/2021/0390) - Cryptographic Primitives Hardware</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-900">1. Originality & Novel Contribution to Computer Science (25 Marks)</h4>
                  <span className="font-mono text-sm font-extrabold text-blue-600">{scoreOriginality ?? 0} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={scoreOriginality ?? 0}
                  onChange={(e) => setScoreOriginality(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-900">2. Technical Rigor, Experimental Replicates & Controls (25 Marks)</h4>
                  <span className="font-mono text-sm font-extrabold text-blue-600">{scoreRigor ?? 0} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={scoreRigor ?? 0}
                  onChange={(e) => setScoreRigor(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-900">3. Dissertation Presentation, Biosafety Compliance & CLSI Citation (25 Marks)</h4>
                  <span className="font-mono text-sm font-extrabold text-blue-600">{scoreDissertation ?? 0} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={scoreDissertation ?? 0}
                  onChange={(e) => setScoreDissertation(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="rounded-2xl border border-slate-200/80 p-4.5 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-slate-900">4. Candidate Viva Voce Oral Defense & Computer Science Mastery (25 Marks)</h4>
                  <span className="font-mono text-sm font-extrabold text-blue-600">{scoreViva ?? 0} / 25</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={scoreViva ?? 0}
                  onChange={(e) => setScoreViva(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senate Degree Recommendation</label>
                <select
                  value={externalRecommendation || ''}
                  onChange={(e) => setExternalRecommendation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="Award B.Sc. Degree with First Class Honours">Award B.Sc. Degree with First Class Honours (Distinction)</option>
                  <option value="Award B.Sc. Degree with Second Class Upper">Award B.Sc. Degree with Second Class Upper Division</option>
                  <option value="Award Subject to Minor Typographical Corrections">Award Subject to Minor Typographical Corrections (2 weeks)</option>
                  <option value="Re-submit for External Moderation">Re-submit for External Moderation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">External Examiner Official Viva Report</label>
                <textarea
                  value={externalReport || ''}
                  onChange={(e) => setExternalReport(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs active:scale-98"
              >
                <Send className="h-4 w-4" />
                <span>Submit Final External Moderation ({totalScore} / 100)</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
