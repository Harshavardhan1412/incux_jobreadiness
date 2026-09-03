import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/Toast';

// Public / Candidate Pages
import { SignupPage } from './pages/candidate/SignupPage';
import { LoginPage } from './pages/candidate/LoginPage';
import { CandidateHome } from './pages/candidate/CandidateHome';
import { AssessmentPage } from './pages/candidate/AssessmentPage';
import { ExamInstructions } from './pages/candidate/ExamInstructions';
import { ExamProctoring } from './pages/candidate/ExamProctoring';
import { ResultsPage } from './pages/candidate/ResultsPage';

// Analytics Portal Pages
import AnalyticsPage from './analytics/pages/AnalyticsPage';
import CollegeManagementPage from './analytics/pages/CollegeManagementPage';

import CandidateAnalyticsPage from './pages/candidate/CandidateAnalyticsPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminCandidatesPage } from './pages/admin/AdminCandidatesPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

<<<<<<< HEAD
=======
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
            onClick={() => navigateTo('admin')}
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

>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89
function AppContent() {
  const { currentView, role } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

<<<<<<< HEAD
  // 1. PUBLIC AUTH VIEWS (standalone)
  if (currentView === 'signup') return <><SignupPage /><ToastContainer /></>;
  if (currentView === 'login') return <><LoginPage /><ToastContainer /></>;
  if (currentView === 'admin-login') return <><AdminLoginPage /><ToastContainer /></>;

  // 2. CANDIDATE VIEWS (standalone, no sidebar shell)
  if (currentView === 'exam-instructions') return <><ExamInstructions /><ToastContainer /></>;
  if (currentView === 'exam-proctoring') return <><ExamProctoring /><ToastContainer /></>;
  if (currentView === 'take-assessment') return <><AssessmentPage /><ToastContainer /></>;
  if (currentView === 'results') return <><ResultsPage /><ToastContainer /></>;
  if (currentView === 'analytics') return <><AnalyticsPage /><ToastContainer /></>;
  if (currentView === 'college-management') return <><CollegeManagementPage /><ToastContainer /></>;

  // 3. ADMIN VIEWS (Header + Sidebar shell, strictly guarded)
  if (role === 'admin' && currentView.startsWith('admin-')) {
    const renderAdminContent = () => {
      switch (currentView) {
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'admin-candidates':
          return <AdminCandidatesPage />;
=======
  const safeView = (currentView && typeof currentView === 'string')
    ? currentView
    : (role === 'admin' ? 'admin-candidates' : (role === 'candidate' ? 'dashboard' : 'hero'));

  // 1. PUBLIC GUEST AUTH & LANDING VIEWS (Only when NOT logged in)
  if (role !== 'candidate' && role !== 'admin') {
    if (safeView === 'login' || safeView === '/login') return <><LoginPage /><ToastContainer /></>;
    if (safeView === 'admin' || safeView === '/admin' || safeView === 'admin-login' || safeView === '/admin-login') return <><AdminLoginPage /><ToastContainer /></>;
    if (safeView === 'signup' || safeView === '/signup') return <><SignupPage /><ToastContainer /></>;
    return <><JobReadinessHero /><ToastContainer /></>;
  }

  // 2. DISTRACTION-FREE ASSESSMENT RUNNER (For active logged in attempt)
  if (safeView === 'take-assessment') {
    return <><AssessmentPage /><ToastContainer /></>;
  }

  // 3. ROLE-BASED AUTHENTICATED PORTAL RENDERER
  const renderMainContent = () => {
    // Admin Portal Module Routes
    if (role === 'admin') {
      switch (safeView) {
>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89
        case 'admin-questions':
          return <AdminQuestionBankPage />;
        case 'admin-assessments':
          return <AdminAssessmentsPage />;
        case 'admin-analytics':
          return <AdminAnalyticsPage />;
<<<<<<< HEAD
=======
        case 'admin-candidates':
>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89
        default:
          return <AdminCandidatesPage />;
      }
    };

<<<<<<< HEAD
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
=======
    // Candidate / Student Portal Module Routes
    switch (safeView) {
      case 'assessments':
        return <AssessmentsListPage />;
      case 'candidate-analytics':
        return <CandidateAnalyticsPage />;
      case 'dashboard':
      default:
        return <CandidateDashboard />;
    }
  };
>>>>>>> 91e3ed14ab7ce4d3431d3f09dbe89f040f565b89

          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            {renderAdminContent()}
          </main>
        </div>

        <ToastContainer />
      </div>
    );
  }

  // 4. FALLBACK: candidate home for logged-in users, signup otherwise
  if (role === 'candidate') return <><CandidateHome /><ToastContainer /></>;
  return <><SignupPage /><ToastContainer /></>;
}

export default function App() {
  return <AppContent />;
}