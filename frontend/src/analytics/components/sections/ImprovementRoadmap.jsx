import { useMemo } from 'react';
import { computeImprovements, mockCompanies, COLORS } from '../../data/mockData';
import GroupedBarChart from '../charts/GroupedBarChart';

export default function ImprovementRoadmap({ student }) {
  const improvements = useMemo(() => computeImprovements(student), [student]);
  const latestAttempt = student.examAttempts[student.examAttempts.length - 1];
  if (!latestAttempt) return null;

  const dreamCompanies = mockCompanies.filter((c) => c.tier === 'dream' || c.tier === 'super_dream');
  const lowestDream = dreamCompanies.reduce(
    (min, c) => (c.cutoffScore < min.cutoffScore ? c : min),
    dreamCompanies[0]
  );

  const highPriority = improvements.filter((a) => a.priority === 'high');
  const mediumPriority = improvements.filter((a) => a.priority === 'medium');
  const totalHours = improvements.reduce((sum, a) => sum + a.estimatedHours, 0);

  const categoryKeys = ['aptitude', 'reasoning', 'technical', 'english'];
  const currentPercents = categoryKeys.map((k) =>
    Math.round((latestAttempt.categories[k].score / latestAttempt.categories[k].maxScore) * 100)
  );
  const targetPercents = categoryKeys.map((k) => lowestDream?.categories[k] ?? 80);

  return (
    <section id="roadmap" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Improvement Roadmap</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-90">High Priority Topics</p>
          <p className="text-3xl font-bold mt-1">{highPriority.length}</p>
          <p className="text-sm opacity-75 mt-1">Need immediate attention</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-90">Medium Priority</p>
          <p className="text-3xl font-bold mt-1">{mediumPriority.length}</p>
          <p className="text-sm opacity-75 mt-1">Moderate improvement needed</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
          <p className="text-sm font-medium opacity-90">Est. Study Hours</p>
          <p className="text-3xl font-bold mt-1">{totalHours}h</p>
          <p className="text-sm opacity-75 mt-1">To reach dream company level</p>
        </div>
      </div>

      {/* Current vs Target Chart */}
      {lowestDream && (
        <GroupedBarChart
          title={`Current Score vs ${lowestDream.name} Requirement`}
          labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
          datasets={[
            { label: 'Your Score', data: currentPercents, color: COLORS.aptitude },
            { label: `${lowestDream.name} Cutoff`, data: targetPercents, color: '#EF4444' },
          ]}
        />
      )}

      {/* Topic-wise Priority List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Priority-wise Study Plan</h3>

        {highPriority.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              High Priority — Start Here
            </h4>
            <div className="space-y-2">
              {highPriority.map((item, i) => (
                <TopicRow key={i} item={item} bgColor="bg-red-50" borderColor="border-red-100" />
              ))}
            </div>
          </div>
        )}

        {mediumPriority.length > 0 && (
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Medium Priority
            </h4>
            <div className="space-y-2">
              {mediumPriority.map((item, i) => (
                <TopicRow key={i} item={item} bgColor="bg-amber-50" borderColor="border-amber-100" />
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Low Priority — Review
          </h4>
          <div className="space-y-2">
            {improvements
              .filter((a) => a.priority === 'low')
              .slice(0, 5)
              .map((item, i) => (
                <TopicRow key={i} item={item} bgColor="bg-emerald-50" borderColor="border-emerald-100" />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TopicRow({ item, bgColor, borderColor }) {
  const percent = Math.round((item.currentScore / item.maxScore) * 100);

  return (
    <div className={`flex items-center justify-between ${bgColor} rounded-xl px-4 py-3 border ${borderColor}`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm font-bold text-slate-600 shadow-sm">
          {percent}%
        </div>
        <div>
          <p className="text-sm font-medium text-slate-700">{item.topic}</p>
          <p className="text-xs text-slate-500">{item.category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-700">{item.estimatedHours}h needed</p>
        <p className="text-xs text-slate-500">{item.currentScore}/{item.maxScore}</p>
      </div>
    </div>
  );
}