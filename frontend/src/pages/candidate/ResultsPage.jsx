import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  FileText,
  Award,
  ChevronRight,
  BarChart2
} from 'lucide-react';

export const ResultsPage = () => {
  const { latestResult, navigateTo, startAssessment } = useApp();

  useEffect(() => {
    // Launch celebratory confetti when viewing score > 70
    if (latestResult?.score >= 70) {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // silent fail if confetti unavailable
      }
    }
  }, [latestResult]);

  const res = latestResult || {
    score: 78,
    accuracy: 82,
    correctCount: 16,
    incorrectCount: 4,
    timeTaken: '28 min',
    assessmentName: 'Technical Assessment',
    categoryScores: { aptitude: 82, reasoning: 74, technical: 78 },
    topicBreakdown: [
      { topic: 'Arrays & Strings', score: 90 },
      { topic: 'Object-Oriented Programming', score: 80 },
      { topic: 'Data Structures & Trees', score: 72 },
      { topic: 'DBMS & Transactions', score: 65 },
      { topic: 'SQL & Window Functions', score: 58 }
    ],
    strengths: ['Logical reasoning', 'Programming fundamentals', 'Problem solving'],
    weaknesses: ['SQL joins & window queries', 'Quantitative aptitude (Probability)', 'Data structures (Advanced)'],
    recommendedTopics: ['SQL Window Functions', 'Probability & Combinatorics', 'Graph Search Algorithms']
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Assessment Completed Successfully</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {res.assessmentName || 'Technical Assessment'} Result
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Completed on {res.completedAt || 'Aug 30, 2026'} • Detailed metrics and AI diagnostics generated.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => startAssessment('asm-tech-1')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Assessment</span>
          </button>
          <button
            onClick={() => navigateTo('ai-analysis')}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>View AI Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP SCORE OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Score Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{res.score}</span>
              <span className="text-xs text-slate-400 font-semibold">/ 100</span>
            </div>
          </div>
        </div>

        {/* Accuracy Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
            <span className="text-2xl font-black text-slate-900">{res.accuracy}%</span>
          </div>
        </div>

        {/* Correct Count */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Correct</span>
            <span className="text-2xl font-black text-emerald-600">{res.correctCount} Qs</span>
          </div>
        </div>

        {/* Incorrect Count */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Incorrect</span>
            <span className="text-2xl font-black text-rose-600">{res.incorrectCount} Qs</span>
          </div>
        </div>

        {/* Time Taken */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time Taken</span>
            <span className="text-2xl font-black text-slate-900">{res.timeTaken}</span>
          </div>
        </div>

      </div>

      {/* PERFORMANCE BREAKDOWN & TOPIC LEVEL MASTERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module Performance Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Modules</span>
              <h3 className="text-base font-bold text-slate-900">Module Score Breakdown</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">Benchmark: 70%</span>
          </div>

          <div className="space-y-4">
            {/* Aptitude */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">Quantitative Aptitude</span>
                <span className="text-brand-600">{res.categoryScores?.aptitude || 82}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${res.categoryScores?.aptitude || 82}%` }} />
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">Logical Reasoning</span>
                <span className="text-purple-600">{res.categoryScores?.reasoning || 74}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${res.categoryScores?.reasoning || 74}%` }} />
              </div>
            </div>

            {/* Technical */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">Technical & Programming</span>
                <span className="text-emerald-600">{res.categoryScores?.technical || 78}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${res.categoryScores?.technical || 78}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Topic-Level Granular Mastery */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Topics</span>
              <h3 className="text-base font-bold text-slate-900">Topic-Level Performance</h3>
            </div>
            <span className="text-xs font-bold text-brand-600">5 Evaluated</span>
          </div>

          <div className="space-y-3">
            {res.topicBreakdown?.map((item) => {
              const isStrong = item.score >= 80;
              const isAvg = item.score >= 65 && item.score < 80;

              return (
                <div key={item.topic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.topic}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isStrong ? 'bg-emerald-50 text-emerald-700' : isAvg ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.score}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isStrong ? 'bg-emerald-500' : isAvg ? 'bg-blue-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* STRENGTHS, WEAKNESSES & RECOMMENDED TOPICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strengths */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold">Demonstrated Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {res.strengths?.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold">Identified Weaknesses</h3>
          </div>
          <ul className="space-y-2.5">
            {res.weaknesses?.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                <span className="text-amber-500 font-bold">⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Topics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-brand-700">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-bold">Recommended Topics</h3>
          </div>
          <ul className="space-y-2.5">
            {res.recommendedTopics?.map((t, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium leading-relaxed">
                <span className="text-brand-500 font-bold">→</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* BOTTOM CTA BAR */}
      <div className="p-6 bg-gradient-to-r from-brand-900 to-slate-900 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h3 className="text-lg font-bold">Ready for your AI-Powered Readiness Report?</h3>
          <p className="text-xs text-slate-300">Dive into the gap matrix, radar benchmark, and 7-day personalized study schedule.</p>
        </div>
        <button
          onClick={() => navigateTo('ai-analysis')}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch AI Performance Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
