import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileCheck,
  TrendingUp,
  Sparkles,
  FileText,
  Users,
  Database,
  Layers,
  BarChart3,
  Target,
  GraduationCap,
  ShieldAlert,
  LogOut
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, currentView, navigateTo, logout } = useApp();

  const candidateNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'assessments', label: 'Assessments', icon: ClipboardCheck, badge: 'Live' },
    { id: 'results', label: 'My Results', icon: FileCheck, badge: null },
    { id: 'ai-analysis', label: 'AI Diagnosis', icon: Sparkles, badge: 'AI' },
    { id: 'performance', label: 'Skill Benchmarks', icon: TrendingUp, badge: null },
    { id: 'recommendations', label: 'Recommendations', icon: Target, badge: '3' },
    { id: 'final-report', label: 'Job Report', icon: FileText, badge: 'PDF' },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'admin-candidates', label: 'Candidates Roster', icon: Users, badge: '1,248' },
    { id: 'admin-questions', label: 'Question Bank', icon: Database, badge: null },
    { id: 'admin-assessments', label: 'Assessments Wizard', icon: Layers, badge: '4' },
    { id: 'admin-analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'admin-reports', label: 'Placement Reports', icon: FileText, badge: 'CSV' },
  ];

  // Restrict strictly by role
  const navItems = role === 'admin' ? adminNavItems : candidateNavItems;

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
          <div className={`px-3 py-2 border rounded-xl flex items-center justify-between ${
            role === 'admin'
              ? 'bg-slate-900 border-slate-800 text-white'
              : 'bg-brand-50/70 border-brand-100 text-brand-900'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-amber-400' : 'bg-emerald-500'} animate-pulse`} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {role === 'admin' ? 'Recruiter Admin' : 'Student Workspace'}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              role === 'admin' ? 'bg-slate-800 text-slate-300' : 'bg-white text-brand-700 border border-brand-200'
            }`}>
              {role === 'admin' ? 'HR Staff' : 'Student'}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              {role === 'admin' ? 'Management Modules' : 'Candidate Modules'}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id || 
                (item.id === 'assessments' && currentView === 'take-assessment') ||
                (item.id === 'admin-dashboard' && currentView === 'admin-dashboard');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? role === 'admin'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-brand-50 text-brand-700 border border-brand-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? role === 'admin' ? 'text-brand-400' : 'text-brand-600' 
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badge === 'AI' || item.badge === 'Live'
                        ? 'bg-brand-100 text-brand-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Role-Specific Context Card */}
          {role === 'candidate' ? (
            <div className="p-3.5 bg-gradient-to-br from-brand-50 to-slate-50 rounded-2xl border border-brand-100">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h4 className="text-xs font-bold text-slate-900">Job Readiness AI</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                Complete technical mock test to boost your score to 85%+.
              </p>
              <button
                onClick={() => handleNavClick('assessments')}
                className="w-full py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
              >
                Resume Assessment
              </button>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                <h4 className="text-xs font-bold text-white">University Placement</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                1,248 candidates registered across 14 universities.
              </p>
              <button
                onClick={() => handleNavClick('admin-reports')}
                className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Export Placement CSV
              </button>
            </div>
          )}

        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">ReadySetJob RBAC</span>
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
