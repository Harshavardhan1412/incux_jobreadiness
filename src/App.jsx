import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';

// Candidate Pages
import { SignupPage } from './pages/candidate/SignupPage';
import { LoginPage } from './pages/candidate/LoginPage';
import { CandidateDashboard } from './pages/candidate/CandidateDashboard';
import { AssessmentsListPage } from './pages/candidate/AssessmentsListPage';
import { AssessmentPage } from './pages/candidate/AssessmentPage';
import { ResultsPage } from './pages/candidate/ResultsPage';
import { AIAnalysisPage } from './pages/candidate/AIAnalysisPage';
import { FinalReportPage } from './pages/candidate/FinalReportPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCandidatesPage } from './pages/admin/AdminCandidatesPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';

import { Sparkles, Shield, User, Compass } from 'lucide-react';

function AppContent() {
  const { currentView, role, navigateTo, setRole } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDemoNav, setShowDemoNav] = useState(false);

  // Full-screen non-sidebar views
  if (currentView === 'signup') return <><SignupPage /><ToastContainer /></>;
  if (currentView === 'login') return <><LoginPage /><ToastContainer /></>;
  if (currentView === 'admin-login') return <><AdminLoginPage /><ToastContainer /></>;
  if (currentView === 'take-assessment') return <><AssessmentPage /><ToastContainer /></>;

  const renderMainContent = () => {
    switch (currentView) {
      // Candidate Routes
      case 'dashboard':
        return <CandidateDashboard />;
      case 'assessments':
        return <AssessmentsListPage />;
      case 'results':
        return <ResultsPage />;
      case 'ai-analysis':
      case 'performance':
      case 'recommendations':
        return <AIAnalysisPage />;
      case 'final-report':
        return <FinalReportPage />;

      // Admin Routes
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-candidates':
        return <AdminCandidatesPage />;
      case 'admin-questions':
        return <AdminQuestionBankPage />;
      case 'admin-assessments':
        return <AdminAssessmentsPage />;
      case 'admin-analytics':
        return <AdminAnalyticsPage />;
      case 'admin-reports':
        return <AdminReportsPage />;

      default:
        return role === 'admin' ? <AdminDashboard /> : <CandidateDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Universal Sticky Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Container with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderMainContent()}
        </main>
      </div>

      {/* Global Action Toasts */}
      <ToastContainer />

      {/* FLOATING QUICK DEMO NAVIGATOR PILL */}
      <div className="no-print fixed bottom-5 left-5 z-50">
        <div className="relative">
          <button
            onClick={() => setShowDemoNav(!showDemoNav)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full shadow-xl backdrop-blur-md border border-slate-700 text-xs font-bold transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4 text-brand-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>MVP Quick Jumps</span>
          </button>

          {showDemoNav && (
            <div className="absolute bottom-12 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase">Quick Jump Directory</span>
                <span className="text-[10px] text-slate-400 font-semibold">1-Click Test</span>
              </div>

              {/* Candidate Flows */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block px-2">
                  Candidate Flow
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('signup'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    1. Signup
                  </button>
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('dashboard'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    2. Dashboard
                  </button>
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('assessments'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    3. Tests
                  </button>
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('results'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    4. Results
                  </button>
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('ai-analysis'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    5. AI Analysis
                  </button>
                  <button
                    onClick={() => { setRole('candidate'); navigateTo('final-report'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    6. Final Report
                  </button>
                </div>
              </div>

              {/* Admin Flows */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block px-2">
                  Admin & HR Flow
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-dashboard'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    1. Overview
                  </button>
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-candidates'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    2. Candidates
                  </button>
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-questions'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    3. Questions
                  </button>
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-assessments'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    4. Wizard
                  </button>
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-analytics'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    5. Analytics
                  </button>
                  <button
                    onClick={() => { setRole('admin'); navigateTo('admin-reports'); setShowDemoNav(false); }}
                    className="p-1.5 text-left rounded-lg hover:bg-slate-100 text-slate-700"
                  >
                    6. Reports
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default function App() {
  return <AppContent />;
}
