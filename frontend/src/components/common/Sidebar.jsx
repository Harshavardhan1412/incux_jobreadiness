import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Database,
  Layers,
  BarChart3,
  Sparkles,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, currentView, navigateTo, logout, candidatesList } = useApp();

<<<<<<< HEAD
=======
  const candidateNavItems = [
    { id: 'assessments', label: 'Assessments & Tests', icon: ClipboardCheck, badge: 'Live' },
    { id: 'candidate-analytics', label: 'Candidate Analytics', icon: BarChart3, badge: 'AI' }
  ];

>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89
  const adminNavItems = [
    { id: 'admin-candidates', label: 'Candidates Roster', icon: Users, badge: candidatesList ? candidatesList.length.toString() : '0' },
    { id: 'admin-questions', label: 'Question Bank', icon: Database, badge: null },
    { id: 'admin-assessments', label: 'Assessments Wizard', icon: Layers, badge: '4' },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3, badge: null },
  ];

  // Only admins render this sidebar
  const navItems = role === 'admin' ? adminNavItems : [];

  const handleNavClick = (id) => {
    navigateTo(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">

          {/* Role Status Tag */}
          <div className="px-3 py-2 border rounded-xl flex items-center justify-between bg-slate-900 border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Recruiter Admin</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              HR Staff
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Management Modules
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
<<<<<<< HEAD
              const isActive = currentView === item.id;
=======
              const isActive = currentView === item.id || 
                (item.id === 'assessments' && currentView === 'take-assessment');
>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

<<<<<<< HEAD
          {/* Admin Context Card */}
          <div className="p-3.5 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <h4 className="text-xs font-bold text-white">Job Readiness Suite</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              Monitor batch performance, question banks, and placement readiness.
            </p>
            <button
              onClick={() => handleNavClick('admin-assessments')}
              className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              Manage Assessments
            </button>
          </div>
=======

>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89

        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            ReadySetJob RBAC
          </span>
          <button
            onClick={logout}
            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};