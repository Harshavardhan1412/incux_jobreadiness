import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  ClipboardCheck,
  BarChart3,
  LogOut,
  ArrowRight,
  Clock,
  ShieldCheck,
  Sparkles,
  Lock,
  CheckCircle2,
  Camera
} from 'lucide-react';

export const CandidateHome = () => {
  const { currentUser, assessments, startAssessment, navigateTo, logout, hasCompletedAssessment, addToast } = useApp();

  const startExam = () => {
    startAssessment(assessments[0]?.id || 'asm-tech-1');
  };

  const handleAnalytics = () => {
    if (!hasCompletedAssessment) {
      addToast('Please complete the assessment first to view your analytics.', 'info');
      return;
    }
    navigateTo('analytics');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* NAV */}
      <nav className="bg-white/80 backdrop-blur border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-slate-900 leading-tight tracking-tight">
                  Job Readiness Assessment
                </h1>
                <p className="text-[11px] text-slate-500 font-medium">Incux AI Academy</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs font-semibold text-slate-600">
                Hi, {currentUser?.name || 'Student'} 👋
              </span>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg space-y-5">
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Placement Preparation Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              What would you like to do?
            </h2>
            <p className="text-sm text-slate-500">
              Take an assessment or explore your performance analytics.
            </p>
          </div>

          {/* ASSESSMENT BUTTON */}
          <button
            onClick={startExam}
            className="w-full group text-left bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-glow hover:border-brand-300 transition-all p-6 flex items-center gap-5 active:scale-[0.99]"
          >
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/25 flex-shrink-0">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-brand-700 transition-colors">
                Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Start the job readiness test — Aptitude, Reasoning & Technical.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-400" />
                  25 minutes
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                  20 questions
                </span>
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-brand-400" />
                  Proctored
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </button>

          {/* ANALYTICS BUTTON (below assessment) */}
          <button
            onClick={handleAnalytics}
            className={`w-full group text-left bg-white rounded-2xl border shadow-card transition-all p-6 flex items-center gap-5 ${
              hasCompletedAssessment
                ? 'border-slate-200/90 hover:shadow-glow hover:border-blue-300 active:scale-[0.99]'
                : 'border-slate-200 bg-slate-50/50 opacity-80 cursor-not-allowed'
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
              hasCompletedAssessment
                ? 'bg-blue-600 text-white shadow-blue-600/25'
                : 'bg-slate-300 text-slate-500'
            }`}>
              {hasCompletedAssessment ? <BarChart3 className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Analytics
                {hasCompletedAssessment ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full text-[10px] font-bold">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {hasCompletedAssessment
                  ? 'Score overview, concept analysis, company eligibility & peer comparison.'
                  : 'Complete the assessment first to unlock your performance analytics.'}
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    </div>
  );
};