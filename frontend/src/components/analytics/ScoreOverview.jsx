import React from 'react';
import { COLORS, getCategoryPercents } from '../../data/analyticsData';
import ScoreBarChart from './ScoreBarChart';
import ScoreLineChart from './ScoreLineChart';
import ScoreDoughnut from './ScoreDoughnut';

export default function ScoreOverview({ student }) {
  const latestAttempt = student.examAttempts[student.examAttempts.length - 1];
  const prevAttempt = student.examAttempts.length > 1 ? student.examAttempts[student.examAttempts.length - 2] : null;

  const currentPercents = latestAttempt ? getCategoryPercents(latestAttempt) : { aptitude: 0, reasoning: 0, technical: 0, english: 0 };

  const scoreTrend = student.examAttempts.map((att) => ({
    date: new Date(att.date).toLocaleDateString('en-US', { month: 'short' }),
    score: Math.round(
      Object.values(att.categories).reduce((sum, cat) => sum + (cat.score / cat.maxScore) * 100, 0) / 4
    ),
  }));

  const change = prevAttempt
    ? Math.round(
        (Object.values(latestAttempt.categories).reduce((s, c) => s + (c.score / c.maxScore) * 100, 0) / 4) -
        (Object.values(prevAttempt.categories).reduce((s, c) => s + (c.score / c.maxScore) * 100, 0) / 4)
      )
    : 0;

  return (
    <section id="overview" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Score Overview</h2>
        <span className="text-xs font-semibold px-3 py-1 bg-brand-50 text-brand-700 rounded-full border border-brand-100">
          Attempt {student.examAttempts.length} of {student.examAttempts.length}
        </span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Overall Score"
          value={`${student.overallScore}%`}
          change={change}
          color="blue"
        />
        <StatCard
          label="Percentile"
          value={`${student.percentile}th`}
          change={null}
          color="emerald"
        />
        <StatCard
          label="Rank"
          value={`${student.rank}/${student.totalStudents}`}
          change={null}
          color="purple"
        />
        <StatCard
          label="Best Category"
          value={Object.entries(currentPercents).sort((a, b) => b[1] - a[1])[0][0].charAt(0).toUpperCase() + Object.entries(currentPercents).sort((a, b) => b[1] - a[1])[0][0].slice(1)}
          change={null}
          color="amber"
          subtitle={`${Math.max(...Object.values(currentPercents))}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ScoreDoughnut
            title="Category Distribution"
            labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
            data={[
              currentPercents.aptitude,
              currentPercents.reasoning,
              currentPercents.technical,
              currentPercents.english,
            ]}
            colors={[COLORS.aptitude, COLORS.reasoning, COLORS.technical, COLORS.english]}
            centerValue={`${student.overallScore}%`}
            centerLabel="Overall"
          />
        </div>
        <div className="lg:col-span-2">
          <ScoreBarChart
            title="Category-wise Scores"
            labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
            data={[
              currentPercents.aptitude,
              currentPercents.reasoning,
              currentPercents.technical,
              currentPercents.english,
            ]}
            colors={[COLORS.aptitude, COLORS.reasoning, COLORS.technical, COLORS.english]}
          />
        </div>
      </div>

      {/* Score Trend */}
      <ScoreLineChart
        title="Score Trend Across Attempts"
        labels={scoreTrend.map((s) => s.date)}
        datasets={[
          {
            label: 'Overall Score',
            data: scoreTrend.map((s) => s.score),
            color: '#3B82F6',
            filled: true,
          },
        ]}
      />
    </section>
  );
}

function StatCard({ label, value, change, color, subtitle }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50/70', text: 'text-blue-700', ring: 'border-blue-200' },
    emerald: { bg: 'bg-emerald-50/70', text: 'text-emerald-700', ring: 'border-emerald-200' },
    purple: { bg: 'bg-purple-50/70', text: 'text-purple-700', ring: 'border-purple-200' },
    amber: { bg: 'bg-amber-50/70', text: 'text-amber-700', ring: 'border-amber-200' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`${c.bg} rounded-2xl p-5 border ${c.ring} shadow-xs`}>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${c.text}`}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">({subtitle})</p>}
      {change !== null && (
        <p className={`text-xs font-bold mt-2 ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last attempt
        </p>
      )}
    </div>
  );
}
