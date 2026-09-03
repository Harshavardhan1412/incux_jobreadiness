import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import confetti from 'canvas-confetti';
import {
  ClipboardCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const ResultsPage = () => {
  const { latestResult, navigateTo, startAssessment } = useApp();

  useEffect(() => {
    if (latestResult?.score >= 70) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch {
        // silent fail
      }
    }
  }, [latestResult]);

  const res = latestResult || {
    score: 78,
    accuracy: 82,
    correctCount: 16,
    incorrectCount: 4,
    unansweredCount: 0,
    timeTaken: '28 min',
    assessmentName: 'Technical Assessment',
    completedAt: 'Sep 2, 2026'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            Assessment Completed Successfully
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {res.assessmentName} Result
          </h1>
          <p className="text-xs text-slate-500">
            Completed on {res.completedAt} • Detailed metrics generated.
          </p>

          <div className="flex justify-center">
            <ScoreRing score={res.score} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric label="Accuracy" value={`${res.accuracy}%`} color="text-emerald-600" />
            <Metric label="Correct" value={`${res.correctCount} Qs`} color="text-emerald-600" />
            <Metric label="Incorrect" value={`${res.incorrectCount} Qs`} color="text-rose-600" />
            <Metric label="Time Taken" value={res.timeTaken} color="text-slate-900" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigateTo('home')}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={() => startAssessment('asm-tech-1')}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" />
            Retake Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};

function Metric({ label, value, color }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 text-center">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
      <span className={`text-lg font-black ${color}`}>{value}</span>
    </div>
  );
}