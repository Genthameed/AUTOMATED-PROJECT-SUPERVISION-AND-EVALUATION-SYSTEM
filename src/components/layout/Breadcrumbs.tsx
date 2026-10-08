import React from 'react';
import { ChevronRight, Home, Shield, GraduationCap, UserCheck, Users, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ROLE_NAV_ITEMS } from '../../data/mockData';

export const Breadcrumbs: React.FC = () => {
  const { currentRole, activeView, setActiveView } = useApp();

  const roleNameMap: Record<string, string> = {
    student: 'Student Portal',
    internal_supervisor: 'Internal Supervisor',
    panel_member: 'Panel Member',
    external_supervisor: 'External Supervisor',
    admin: 'Administrator',
  };

  const navItems = ROLE_NAV_ITEMS[currentRole] || [];
  const currentNavItem = navItems.find(item => item.id === activeView);
  const currentNavLabel = currentNavItem ? currentNavItem.label : 'Overview';

  return (
    <nav className="flex items-center text-xs font-medium text-slate-500 mb-3 overflow-hidden" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 sm:gap-2">
        <li className="inline-flex items-center">
          <button
            type="button"
            onClick={() => setActiveView('overview')}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <Home className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Faculty Portal</span>
          </button>
        </li>

        <li>
          <div className="flex items-center">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0 mx-0.5 sm:mx-1" />
            <span className="text-slate-500 hover:text-slate-800 transition-colors cursor-default font-medium truncate max-w-[120px] sm:max-w-none">
              {roleNameMap[currentRole]}
            </span>
          </div>
        </li>

        <li aria-current="page">
          <div className="flex items-center">
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0 mx-0.5 sm:mx-1" />
            <span className="font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">
              {currentNavLabel}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
};
