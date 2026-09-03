import { useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import ScoreBarChart from '../charts/BarChart';
import { Clock, Timer, Gauge, TrendingUp } from 'lucide-react';

// Map question id -> category (mirrors the question bank categories)
const CATEGORY_MAP = {
  'q-101': 'Technical', 'q-102': 'Technical', 'q-103': 'Technical', 'q-104': 'Technical',
  'q-105': 'Aptitude', 'q-106': 'Reasoning', 'q-107': 'Technical', 'q-108': 'Reasoning',
  'q-109': 'Aptitude', 'q-110': 'Technical', 'q-111': 'Reasoning', 'q-112': 'English',
  'q-113': 'Aptitude', 'q-114': 'Technical', 'q-115': 'Reasoning', 'q-116': 'Aptitude',
  'q-117': 'Technical', 'q-118': 'English', 'q-119': 'Aptitude', 'q-120': 'Technical',
};

export default function QuestionTiming() {
  const { latestResult, questionBank } = useApp();
  const timeLog = latestResult?.questionTimeLog || {};

  const tableRows = useMemo(() => {
    return questionBank.map((q, idx) => {
      const seconds = timeLog[q.id] || 0;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const category = CATEGORY_MAP[q.id] || q.category || 'Other';
      return {
        number: idx + 1,
        question: q.question,
        category,
        seconds,
        display: `${mins}m ${secs}s`,
        answered: !!latestResult && Object.keys(timeLog).length > 0,
      };
    });
  }, [questionBank, timeLog, latestResult]);

  const totalSeconds = useMemo(() => Object.values(timeLog).reduce((s, v) => s + v, 0), [timeLog]);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalSecs = totalSeconds % 60;
  const avgSeconds = tableRows.length ? Math.round(totalSeconds / tableRows.length) : 0;
  const slowest = tableRows.length ? [...tableRows].sort((a, b) => b.seconds - a.seconds)[0] : null;

  // Category average time
  const catTimes = useMemo(() => {
    const cats = {};
    tableRows.forEach((r) => {
      if (!cats[r.category]) cats[r.category] = { sum: 0, count: 0 };
      cats[r.category].sum += r.seconds;
      cats[r.category].count += 1;
    });
    return ['Aptitude', 'Reasoning', 'Technical', 'English'].map((c) =>
      cats[c] && cats[c].count ? Math.round(cats[c].sum / cats[c].count) : 0
    );
  }, [tableRows]);

  const hasData = totalSeconds > 0;

  return (
    <section id="timing" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Question Time Analysis</h2>
        <span className="text-sm text-slate-500">Time spent per question</span>
      </div>

      {!hasData ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-100">
          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            No timing data available yet. Complete the assessment to see how much time you spent on each question.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-2xl p-5 ring-1 ring-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-medium text-slate-600">Total Time Used</p>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                {totalMinutes}m {totalSecs}s
              </p>
              <p className="text-xs text-blue-600 mt-1">Across {tableRows.length} questions</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 ring-1 ring-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-medium text-slate-600">Avg Time / Question</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700">{avgSeconds}s</p>
              <p className="text-xs text-emerald-600 mt-1">Average per question</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 ring-1 ring-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-medium text-slate-600">Slowest Question</p>
              </div>
              <p className="text-xl font-bold text-amber-700 truncate">
                {slowest ? `Q${slowest.number}` : '—'}
              </p>
              <p className="text-xs text-amber-600 mt-1 truncate">
                {slowest ? `${slowest.display} • ${slowest.category}` : '—'}
              </p>
            </div>
          </div>

          {/* Category avg time chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <ScoreBarChart
              title="Average Time per Category"
              labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
              data={catTimes}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']}
            />
          </div>

          {/* Per-question table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Per-Question Time Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Q#</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Question</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">Category</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.number} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-400">{r.number}</td>
                      <td className="py-3 px-4 text-slate-700 max-w-md truncate">{r.question}</td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-mono font-bold ${
                          r.seconds >= 90 ? 'text-rose-600' : r.seconds >= 45 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {r.display}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}