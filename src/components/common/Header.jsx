import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  Search,
  Bell,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Sparkles,
  Award,
  CheckCircle,
  Menu,
  ExternalLink,
  BookOpen,
  BarChart2,
  FileText
} from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  const {
    currentUser,
    role,
    setRole,
    currentView,
    navigateTo,
    logout,
    addToast
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: "AI Analysis Ready",
      desc: "Your Technical Assessment has been evaluated with 94% accuracy.",
      time: "10m ago",
      read: false,
      view: "ai-analysis"
    },
    {
      id: 2,
      title: "New Assessment Available",
      desc: "Full-Stack Mock Exam is now active for 2026 graduates.",
      time: "2h ago",
      read: true,
      view: "assessments"
    },
    {
      id: 3,
      title: "Skill Benchmark Updated",
      desc: "You are in the top 15% for Logical Reasoning.",
      time: "1d ago",
      read: true,
      view: "performance"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();

    if (role === 'admin') {
      if (q.includes('cand') || q.includes('john') || q.includes('sarah')) {
        navigateTo('admin-candidates');
      } else if (q.includes('quest') || q.includes('sql') || q.includes('tree')) {
        navigateTo('admin-questions');
      } else if (q.includes('report') || q.includes('csv')) {
        navigateTo('admin-reports');
      } else {
        navigateTo('admin-dashboard');
      }
    } else {
      if (q.includes('test') || q.includes('tech') || q.includes('apt')) {
        navigateTo('assessments');
      } else if (q.includes('ai') || q.includes('skill')) {
        navigateTo('ai-analysis');
      } else if (q.includes('report')) {
        navigateTo('final-report');
      } else {
        navigateTo('dashboard');
      }
    }
    setSearchQuery('');
    addToast(`Navigated based on search: "${searchQuery}"`, 'info');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => navigateTo(role === 'admin' ? 'admin-dashboard' : 'dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                    ReadySet<span className="text-brand-600">Job</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 rounded tracking-wider uppercase">
                    AI MVP
                  </span>
                </div>
                <span className="text-[10px] text-slate-600 font-medium hidden sm:block">
                  AI-Powered Readiness & Assessments
                </span>
              </div>
            </div>
          </div>

          {/* Center: Quick Global Search */}
          <div className="flex-1 max-w-md hidden sm:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={role === 'admin' ? "Search candidates, questions, tests..." : "Search assessments, skills, reports..."}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 hidden lg:inline-block">
                Press ↵
              </span>
            </form>
          </div>

          {/* Right: Quick Role Switcher Pill, Notifications, User Menu */}
          <div className="flex items-center gap-3">
            
            {/* Quick Demo Switcher Pill */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => {
                  setRole('candidate');
                  navigateTo('dashboard');
                  addToast('Switched to Candidate Portal', 'info');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  role === 'candidate'
                    ? 'bg-white text-brand-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Candidate</span>
              </button>
              <button
                onClick={() => {
                  setRole('admin');
                  navigateTo('admin-dashboard');
                  addToast('Switched to Admin Portal', 'info');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                  role === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden md:inline">Admin HR</span>
              </button>
            </div>

            {/* Notification Drawer Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200/60 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white animate-pulse" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                    <span className="text-[11px] font-semibold text-brand-600 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          navigateTo(n.view);
                          setNotifOpen(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${!n.read ? 'bg-brand-50/30' : ''}`}
                      >
                        <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-800">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
                  {role === 'admin' ? (
                    <Shield className="w-4 h-4 text-brand-400" />
                  ) : (
                    <span>{currentUser?.name ? currentUser.name.charAt(0) : 'J'}</span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                    {role === 'admin' ? 'HR Admin' : currentUser?.name || 'Candidate'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium capitalize">
                    {role === 'admin' ? 'Super Admin' : currentUser?.experienceLevel || 'Fresher'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{role === 'admin' ? 'HR Portal Administrator' : currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{role === 'admin' ? 'admin@readysetjob.com' : currentUser.email}</p>
                  </div>

                  <div className="py-1">
                    {role === 'candidate' ? (
                      <>
                        <button
                          onClick={() => { navigateTo('dashboard'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <BarChart2 className="w-4 h-4 text-slate-400" /> My Dashboard
                        </button>
                        <button
                          onClick={() => { navigateTo('ai-analysis'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <Sparkles className="w-4 h-4 text-brand-500" /> AI Insights & Skills
                        </button>
                        <button
                          onClick={() => { navigateTo('final-report'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <FileText className="w-4 h-4 text-slate-400" /> Job Readiness Report
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { navigateTo('admin-dashboard'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <BarChart2 className="w-4 h-4 text-slate-400" /> Admin Overview
                        </button>
                        <button
                          onClick={() => { navigateTo('admin-candidates'); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                        >
                          <User className="w-4 h-4 text-slate-400" /> Candidates Roster
                        </button>
                      </>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
