import React from 'react';
import {
  Activity,
  CalendarClock,
  ShieldCheck,
  Award,
  Users2,
  FileCheck,
  Stamp,
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  GraduationCap,
  FileText,
  FolderGit2,
  UserCheck,
  Split,
  ShieldAlert,
  Plus,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_SUMMARY_CONFIGS } from '../../data/mockData';
import { RoleSummaryMetric } from '../../types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity,
  CalendarClock,
  ShieldCheck,
  Award,
  Users2,
  FileCheck,
  Stamp,
  CalendarDays,
  FileCheck2,
  CheckCircle2,
  GraduationCap,
  FileText,
  FolderGit2,
  UserCheck,
  Split,
  ShieldAlert,
  FileSpreadsheet,
};

export const RoleOverviewHeader: React.FC = () => {
  const { currentRole, currentProfile, setActiveView } = useApp();
  const summaryConfig = ROLE_SUMMARY_CONFIGS[currentRole];

  if (!summaryConfig) return null;

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-200/80';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border border-amber-200/80';
      case 'danger':
        return 'bg-rose-50 text-rose-800 border border-rose-200/80';
      case 'info':
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200/80';
    }
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'student':
        return 'Computer Science Undergraduate Research';
      case 'internal_supervisor':
        return 'Departmental Faculty Supervision';
      case 'panel_member':
        return 'Computing Defense Board · Panel A';
      case 'external_supervisor':
        return 'Visiting External Moderation (UNILAG)';
      case 'admin':
        return 'Departmental Academic Directorate';
      default:
        return 'Department of Computer Science';
    }
  };

  return (
    <div className="space-y-5 mb-8">
      {/* Editorial Welcome Banner: Deep Blue with Crisp Accents */}
      <div className="relative overflow-hidden rounded-2xl bg-blue-900 p-6 sm:p-7 text-white shadow-sm border border-blue-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200 border border-blue-400/30">
              <Cpu className="h-3.5 w-3.5" />
              <span>{getRoleBadge()}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {currentProfile.title || currentProfile.name}
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {summaryConfig.greetingSubtext || 'Automated dissertation research tracking, software project milestones verification, and viva voce rubric scoring.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-blue-200/70">
              <span className="font-mono text-blue-200 font-medium">
                ID: {currentProfile.identifier}
              </span>
              <span>•</span>
              <span>Dept. of Computer Science</span>
              <span>•</span>
              <span className="text-blue-200/90">2025/2026 Academic Session</span>
            </div>
          </div>

          {/* Primary Action Button: Pure White with Blue Text */}
          <div className="shrink-0">
            <button
              id={`overview-primary-action-${currentRole}`}
              type="button"
              onClick={() => {
                if (summaryConfig.greetingAction.targetView) {
                  setActiveView(summaryConfig.greetingAction.targetView);
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs sm:text-sm font-bold text-blue-900 shadow-sm hover:bg-slate-100 active:scale-98 transition-all duration-150"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>{summaryConfig.greetingAction.label}</span>
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Subtle Decorative Pattern Background */}
        <div className="absolute right-0 top-0 bottom-0 pointer-events-none opacity-5 flex items-center pr-8">
          <Cpu className="h-56 w-56 text-white" />
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryConfig.metrics.map((metric: RoleSummaryMetric, index: number) => {
          const Icon = ICON_MAP[metric.iconName] || Activity;
          const isPercent = metric.value.includes('%');
          const numericPercent = isPercent ? parseInt(metric.value, 10) : null;

          return (
            <div
              key={index}
              id={`metric-card-${index}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-150 hover:border-blue-500/60 hover:shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {metric.label}
                    </span>
                  </div>

                  {(metric.change || metric.badge) && (
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-tight uppercase whitespace-nowrap ${getBadgeClasses(
                        metric.variant || metric.badgeVariant
                      )}`}
                    >
                      {metric.change || metric.badge}
                    </span>
                  )}
                </div>

                {/* Bold Editorial Metric Number */}
                <div className="mt-4">
                  <p className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {metric.value}
                  </p>
                </div>

                {/* Percentage progress bar if applicable */}
                {numericPercent !== null && (
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, numericPercent))}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate">{metric.sublabel || metric.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
