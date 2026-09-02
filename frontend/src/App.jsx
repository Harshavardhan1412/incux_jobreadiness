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

import { FinalReportPage } from './pages/candidate/FinalReportPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminCandidatesPage } from './pages/admin/AdminCandidatesPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

function AccessDenied({ message = "You do not have permission to view this portal area.", requiredRole = "admin" }) {
  const { navigateTo } = useApp();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Access Restricted</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
        {message}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateTo('dashboard')}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          Return to Student Dashboard
        </button>
        {requiredRole === 'admin' && (
          <button
            onClick={() => navigateTo('admin-login')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
}

import { JobReadinessHero } from './pages/JobReadinessHero';

function AppContent() {
  const { currentView, role, navigateTo } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const safeView = (currentView && typeof currentView === 'string')
    ? currentView
    : (role === 'admin' ? 'admin-candidates' : (role === 'candidate' ? 'dashboard' : 'signup'));

  // 1. PUBLIC AUTH VIEWS (Only for guests/unauthenticated users)
  if (role !== 'candidate' && role !== 'admin') {
    if (safeView === 'login') return <><LoginPage /><ToastContainer /></>;
    if (safeView === 'admin-login') return <><AdminLoginPage /><ToastContainer /></>;
    return <><SignupPage /><ToastContainer /></>;
  }

  // 2. DISTRACTION-FREE ASSESSMENT RUNNER (Guarded)
  if (safeView === 'take-assessment') {
    if (role !== 'candidate' && role !== 'admin') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <AccessDenied message="Please sign in to take assessments." requiredRole="candidate" />
          <ToastContainer />
        </div>
      );
    }
    return <><AssessmentPage /><ToastContainer /></>;
  }

  // 3. ROLE-BASED ROUTE GUARD RENDERER
  const renderMainContent = () => {
    // Admin Module Routes (Strictly Guarded for role === 'admin')
    if (safeView.startsWith('admin-')) {
      if (role !== 'admin') {
        return <AccessDenied message="Admin authentication required to access recruiter and management modules." requiredRole="admin" />;
      }

      switch (safeView) {
        case 'admin-candidates':
          return <AdminCandidatesPage />;
        case 'admin-questions':
          return <AdminQuestionBankPage />;
        case 'admin-assessments':
          return <AdminAssessmentsPage />;
        case 'admin-analytics':
          return <AdminAnalyticsPage />;

        default:
          return <AdminCandidatesPage />;
      }
    }

    // Candidate / Student Routes (Guarded for candidate or admin review)
    if (role !== 'candidate' && role !== 'admin') {
      return <SignupPage />;
    }

    switch (safeView) {
      case 'dashboard':
        return <CandidateDashboard />;
      case 'assessments':
        return <AssessmentsListPage />;
      case 'final-report':
        return <FinalReportPage />;
      default:
        return <CandidateDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      
      {/* Universal Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Layout Container with Role-Restricted Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderMainContent()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return <AppContent />;
}
