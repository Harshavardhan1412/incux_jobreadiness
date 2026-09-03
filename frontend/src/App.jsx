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

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCandidatesPage } from './pages/admin/AdminCandidatesPage';
import { AdminQuestionBankPage } from './pages/admin/AdminQuestionBankPage';
import { AdminAssessmentsPage } from './pages/admin/AdminAssessmentsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

function AppContent() {
  const { currentView, role } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        case 'admin-questions':
          return <AdminQuestionBankPage />;
        case 'admin-assessments':
          return <AdminAssessmentsPage />;
        case 'admin-analytics':
          return <AdminAnalyticsPage />;
        default:
          return <AdminDashboard />;
      }
    };

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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