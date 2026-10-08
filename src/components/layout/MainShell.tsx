import React from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from './Breadcrumbs';
import { RoleOverviewHeader } from './RoleOverviewHeader';
import { StudentViews } from '../views/StudentViews';
import { SupervisorViews } from '../views/SupervisorViews';
import { PanelViews } from '../views/PanelViews';
import { ExternalViews } from '../views/ExternalViews';
import { AdminViews } from '../views/AdminViews';
import { DepartmentalSenateBroadsheet } from '../senate/DepartmentalSenateBroadsheet';
import { PendingActivation } from '../auth/PendingActivation';
import { ROLE_NAV_ITEMS } from '../../data/mockData';
import { 
  Check, 
  Dna,
  Calendar, 
  Sparkles
} from 'lucide-react';

export const MainShell: React.FC = () => {
  const { currentRole, activeView, currentProfile, currentUser, quickToast } = useApp();

  const currentNavs = ROLE_NAV_ITEMS[currentRole] || [];
  const currentNav = currentNavs.find(n => n.id === activeView);
  const pageTitle = currentNav ? currentNav.label : 'Overview';

  // Subtitle generator based on active role & view
  const getPageSubtitle = () => {
    switch (currentRole) {
      case 'student':
        return `Candidate ${currentProfile.name} · B.Sc. Computer Science Project Portal`;
      case 'internal_supervisor':
        return `Supervisor ${currentProfile.name} · Department of Computer Science`;
      case 'panel_member':
        return `Panel Member ${currentProfile.name} · Computing Defense Board`;
      case 'external_supervisor':
        return `Visiting External Examiner ${currentProfile.name} · University of Lagos`;
      case 'admin':
        return `Administrator ${currentProfile.name} · Department of Computer Science Academic Office`;
      default:
        return 'Department of Computer Science Portal';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-[#F4F5F7] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Dynamic Breadcrumbs */}
        <Breadcrumbs />

        {/* If Overview, render the rich Editorial Welcome Banner & 4 KPI cards (Student, Internal Staff, External Supervisor, and Admin have dedicated bespoke luxury dashboards) */}
        {activeView === 'overview' && currentRole !== 'student' && currentRole !== 'internal_supervisor' && currentRole !== 'panel_member' && currentRole !== 'external_supervisor' && currentRole !== 'admin' ? (
          <RoleOverviewHeader />
        ) : activeView !== 'overview' ? (
          /* Page Header for specific feature views */
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
                  {pageTitle}
                </h1>
                {currentNav?.badge && (
                  <span className="rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                    {currentNav.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs md:text-sm text-slate-500">
                {getPageSubtitle()}
              </p>
            </div>

            {/* Quick context info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-slate-700 font-semibold shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Session: <strong>2025/2026</strong></span>
              </span>
            </div>
          </div>
        ) : null}

        {/* Role Views Render Dispatcher */}
        <div className="transition-all duration-150">
          {((currentUser && currentUser.isActive === false) || activeView === 'pending_activation') ? (
            <PendingActivation />
          ) : activeView === 'senate_broadsheet' ? (
            <DepartmentalSenateBroadsheet />
          ) : (
            <>
              {currentRole === 'student' && <StudentViews />}
              {currentRole === 'internal_supervisor' && <SupervisorViews />}
              {currentRole === 'panel_member' && <PanelViews />}
              {currentRole === 'external_supervisor' && <ExternalViews />}
              {currentRole === 'admin' && <AdminViews />}
            </>
          )}
        </div>
      </div>

      {/* Floating System Toast */}
      {quickToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </div>
          <span>{quickToast}</span>
        </div>
      )}
    </main>
  );
};
