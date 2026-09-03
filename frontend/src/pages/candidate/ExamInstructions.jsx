import { useApp } from '../../context/AppContext';
import {
  BrainCircuit,
  Clock,
  ListChecks,
  Mic,
  Video,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  X
} from 'lucide-react';

export const ExamInstructions = () => {
  const { activeAssessment, beginProctoring, navigateTo, logout } = useApp();

  const totalQuestions = activeAssessment?.totalQuestions || 20;
  const durationMinutes = activeAssessment?.durationMinutes || 25;

  const rules = [
    'Attempt all questions. There is no negative marking.',
    'You may mark questions for review and return to them later.',
    'Use the question navigator on the right to jump between questions.',
    'The timer starts once you begin the exam and cannot be paused.',
    'Do not refresh or close the browser tab during the exam.',
    'A webcam and microphone are required for remote proctoring verification.'
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {activeAssessment?.title || 'Technical Assessment'}
              </h1>
              <p className="text-[11px] text-slate-500">Exam Instructions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo('home')}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Exit exam"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Intro */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Before You Begin
          </h2>
          <p className="text-sm text-slate-600">
            Please read the instructions carefully. Once you start the exam, the timer begins.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card text-center">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
              <ListChecks className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{totalQuestions}</p>
            <p className="text-xs font-semibold text-slate-500">Total Questions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card text-center">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{durationMinutes} min</p>
            <p className="text-xs font-semibold text-slate-500">Time Limit</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card text-center">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{durationMinutes * 60}</p>
            <p className="text-xs font-semibold text-slate-500">Seconds Total</p>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-sm font-bold text-slate-800">Exam Instructions</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Proctoring Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 leading-relaxed">
            <p className="font-bold">Proctoring Notice</p>
            <p className="mt-1">
              This exam is remotely proctored. You will be asked to grant <strong>camera</strong> and{' '}
              <strong>microphone</strong> access on the next screen. Ensure you are in a quiet room
              with good lighting and a stable internet connection; your answers are saved locally and
              auto-submitted if connectivity drops.
            </p>
          </div>
        </div>

        {/* Proctoring Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Camera Access</p>
              <p className="text-xs text-slate-500 mt-1">
                We will verify your identity and monitor the exam environment through your webcam.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-card flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Microphone Access</p>
              <p className="text-xs text-slate-500 mt-1">
                Audio is monitored to detect any verbal help or disturbances during the exam.
              </p>
            </div>
          </div>
        </div>

        {/* Consent + Start */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By continuing, you agree to the proctoring terms and confirm that you are the registered
              candidate and will complete the assessment without any unauthorized assistance.
            </p>
          </div>
          <button
            onClick={beginProctoring}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white rounded-xl font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Camera & Mic Check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};