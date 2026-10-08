import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileText, Code, Check } from 'lucide-react';

export interface MilestoneItem {
  id: string | number;
  title: string;
  completed?: boolean;
  status?: string;
  date?: string;
  badge?: string;
  details?: string;
  detail?: string;
}

export interface ProjectMetadata {
  name?: string;
  matric?: string;
  department?: string;
  institution?: string;
  topic?: string;
  supervisor?: string;
  supervisorRank?: string;
  status?: string;
  progressPercentage?: number;
  level?: string;
  session?: string;
}

interface DownloadReportButtonProps {
  project?: ProjectMetadata;
  milestones?: MilestoneItem[];
  variant?: 'light' | 'dark' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  onDownloaded?: (format: 'CSV' | 'JSON') => void;
}

export const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
  project = {},
  milestones = [],
  variant = 'light',
  size = 'sm',
  className = '',
  onDownloaded
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentlyDownloaded, setRecentlyDownloaded] = useState<'CSV' | 'JSON' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sanitizeText = (val: any) => {
    if (val === undefined || val === null) return '';
    return String(val).replace(/"/g, '""');
  };

  const getMilestoneStatus = (m: MilestoneItem): string => {
    if (m.completed !== undefined) {
      return m.completed ? 'Completed' : 'Pending';
    }
    return m.status || 'Pending';
  };

  // CSV Generation & Download
  const handleDownloadCSV = () => {
    const safeMatric = (project.matric || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Project_Milestones_Report_${safeMatric}.csv`;

    const lines: string[] = [
      '=============================================================',
      'AUTOMATED PROJECT SUPERVISION & EVALUATION SYSTEM',
      'ACADEMIC RESEARCH PROJECT MILESTONE PROGRESSION REPORT',
      '=============================================================',
      `Generated At,"${new Date().toLocaleString()}"`,
      `Candidate Name,"${sanitizeText(project.name || 'Adama Bashir Muhammad')}"`,
      `Matriculation Number,"${sanitizeText(project.matric || 'ATBU/CSC/2026/042')}"`,
      `Department,"${sanitizeText(project.department || 'Computer Science')}"`,
      `Academic Session,"${sanitizeText(project.session || '2025/2026 Academic Year')}"`,
      `Research Topic,"${sanitizeText(project.topic || 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures')}"`,
      `Lead Supervisor,"${sanitizeText(project.supervisor || 'Dr. Kolawole O. Alabi')}"`,
      `Overall Completion,"${project.progressPercentage ?? 35}%"`,
      `Current Status,"${sanitizeText(project.status || 'Active')}"`,
      '',
      '=============================================================',
      'STATUTORY MILESTONES SUMMARY BREAKDOWN',
      '=============================================================',
      'Milestone ID,Stage Title,Status,Verification Badge,Scheduled / Cleared Date,Official Notes & Scope'
    ];

    milestones.forEach((m) => {
      const id = sanitizeText(m.id);
      const title = sanitizeText(m.title);
      const status = sanitizeText(getMilestoneStatus(m));
      const badge = sanitizeText(m.badge || '');
      const date = sanitizeText(m.date || '');
      const details = sanitizeText(m.details || m.detail || '');

      lines.push(`"${id}","${title}","${status}","${badge}","${date}","${details}"`);
    });

    const csvContent = lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setRecentlyDownloaded('CSV');
    setIsOpen(false);
    onDownloaded?.('CSV');
    setTimeout(() => setRecentlyDownloaded(null), 3000);
  };

  // JSON Generation & Download
  const handleDownloadJSON = () => {
    const safeMatric = (project.matric || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Project_Milestones_Report_${safeMatric}.json`;

    const total = milestones.length;
    const completedCount = milestones.filter((m) => {
      if (m.completed !== undefined) return m.completed;
      return m.status?.toLowerCase() === 'completed';
    }).length;

    const reportData = {
      system: 'Automated Project Supervision and Evaluation System',
      reportType: 'Project Milestones Progression Report',
      generatedAt: new Date().toISOString(),
      metadata: {
        candidateName: project.name || 'Adama Bashir Muhammad',
        matricNumber: project.matric || 'ATBU/CSC/2026/042',
        level: project.level || '400 Level (Finalist)',
        department: project.department || 'Computer Science',
        institution: project.institution || 'Abubakar Tafawa Balewa University, Bauchi (ATBU)',
        session: project.session || '2025/2026 Academic Year',
        researchTopic: project.topic || 'Automated Anomaly Detection and Performance Optimization in Distributed Microservice Architectures',
        leadSupervisor: project.supervisor || 'Dr. Kolawole O. Alabi',
        supervisorRank: project.supervisorRank || 'Senior Lecturer · Distributed Systems & Cloud Computing',
        overallProgressPercentage: project.progressPercentage ?? 35,
        academicStatus: project.status || 'Proposal Defense - Cleared',
      },
      milestoneAudit: {
        totalMilestones: total,
        completedMilestones: completedCount,
        pendingMilestones: total - completedCount,
        completionRatePercentage: total > 0 ? Math.round((completedCount / total) * 100) : 0,
      },
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        status: getMilestoneStatus(m),
        clearedOrScheduledDate: m.date || null,
        verificationBadge: m.badge || null,
        scopeDetails: m.details || m.detail || null,
      })),
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setRecentlyDownloaded('JSON');
    setIsOpen(false);
    onDownloaded?.('JSON');
    setTimeout(() => setRecentlyDownloaded(null), 3000);
  };

  // Button styling variants
  let buttonClasses = '';
  if (variant === 'dark') {
    buttonClasses =
      'bg-white/[0.08] hover:bg-white/[0.15] text-stone-100 border border-white/[0.15] hover:border-[#CBA358]/50 shadow-xs';
  } else if (variant === 'outline') {
    buttonClasses =
      'bg-transparent hover:bg-stone-50 text-stone-700 border border-stone-300 hover:border-[#CBA358] shadow-xs';
  } else {
    buttonClasses =
      'bg-[#FDFBF7] hover:bg-[#CBA358]/15 text-[#1A1A1A] border border-stone-200 hover:border-[#CBA358]/50 shadow-xs';
  }

  const paddingClasses =
    size === 'sm' ? 'px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs' : 'px-3.5 py-2 text-sm';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        type="button"
        id="download-report-button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 sm:gap-2 font-bold rounded-xl transition-all duration-150 cursor-pointer select-none active:scale-[0.98] ${buttonClasses} ${paddingClasses}`}
        title="Download project milestones report as CSV or JSON"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {recentlyDownloaded ? (
          <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50" />
        ) : (
          <Download className="h-3.5 w-3.5 text-[#CBA358] shrink-0" />
        )}
        <span className="whitespace-nowrap">
          {recentlyDownloaded ? `Downloaded ${recentlyDownloaded}` : 'Download Report'}
        </span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 opacity-60 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Modern Format Selector Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-60 sm:w-64 rounded-2xl bg-white border border-stone-200/90 shadow-2xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 focus:outline-none ring-1 ring-black/5">
          <div className="px-3 py-2 border-b border-stone-100">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Export Milestones Summary
            </p>
            <p className="text-[11px] text-stone-600 font-medium truncate">
              {project.topic ? `"${project.topic}"` : 'Project Milestones Audit'}
            </p>
          </div>

          <div className="space-y-1 p-1">
            {/* CSV Export Option */}
            <button
              type="button"
              id="download-report-csv"
              onClick={handleDownloadCSV}
              className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#FDFBF7] hover:border-[#CBA358]/40 border border-transparent transition-all group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-emerald-500/20">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-emerald-700">
                    Download as CSV
                  </span>
                  <span className="text-[9px] font-mono font-extrabold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                    .csv
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  Spreadsheet format suitable for Excel, Numbers, and Google Sheets
                </p>
              </div>
            </button>

            {/* JSON Export Option */}
            <button
              type="button"
              id="download-report-json"
              onClick={handleDownloadJSON}
              className="w-full text-left flex items-start gap-2.5 p-2 rounded-xl hover:bg-[#FDFBF7] hover:border-[#CBA358]/40 border border-transparent transition-all group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-[#CBA358]/15 text-[#8f6d28] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-[#CBA358]/30">
                <Code className="h-4 w-4 text-[#8f6d28]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1A1A] group-hover:text-[#8f6d28]">
                    Download as JSON
                  </span>
                  <span className="text-[9px] font-mono font-extrabold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                    .json
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 leading-tight mt-0.5">
                  Structured schema for registry APIs, archiving, and programmatic audit
                </p>
              </div>
            </button>
          </div>

          <div className="px-3 py-1.5 bg-stone-50 rounded-xl border-t border-stone-100 text-[10px] text-stone-400 flex items-center justify-between">
            <span>Includes {milestones.length} milestone items</span>
            <span className="font-mono text-[9px] text-[#CBA358] font-bold">Official Registry</span>
          </div>
        </div>
      )}
    </div>
  );
};
