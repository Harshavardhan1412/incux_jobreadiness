import { COLORS } from '../../data/mockData';
import ScoreRadar from '../charts/RadarChart';

export default function ConceptAnalysis({ student }) {
  const latestAttempt = student.examAttempts[student.examAttempts.length - 1];
  if (!latestAttempt) return null;

  const categories = [
    { key: 'aptitude', label: 'Aptitude', color: COLORS.aptitude },
    { key: 'reasoning', label: 'Reasoning', color: COLORS.reasoning },
    { key: 'technical', label: 'Technical', color: COLORS.technical },
    { key: 'english', label: 'English', color: COLORS.english },
  ];

  const allTopics = [];

  categories.forEach((cat) => {
    const catData = latestAttempt.categories[cat.key];
    catData.topics.forEach((topic) => {
      const percent = Math.round((topic.score / topic.maxScore) * 100);
      allTopics.push({
        category: cat.label,
        topic: topic.name,
        score: topic.score,
        maxScore: topic.maxScore,
        percent,
      });
    });
  });

  const strengths = allTopics.filter((t) => t.percent >= 80);
  const weaknesses = allTopics.filter((t) => t.percent < 60).sort((a, b) => a.percent - b.percent);
  const needsWork = allTopics.filter((t) => t.percent >= 60 && t.percent < 80);

  return (
    <section id="concepts" className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">Concept Analysis</h2>

      {/* Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreRadar
          title="Performance Radar"
          labels={categories.map((c) => c.label)}
          datasets={[
            {
              label: 'Your Score',
              data: categories.map(
                (c) => Math.round((latestAttempt.categories[c.key].score / latestAttempt.categories[c.key].maxScore) * 100)
              ),
              color: '#3B82F6',
              filled: true,
            },
            {
              label: 'Target (80%)',
              data: [80, 80, 80, 80],
              color: '#EF4444',
              filled: false,
            },
          ]}
        />

        {/* Category Breakdown Cards */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Category Breakdown</h3>
          {categories.map((cat) => {
            const catData = latestAttempt.categories[cat.key];
            const percent = Math.round((catData.score / catData.maxScore) * 100);
            return (
              <div key={cat.key} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                  <span className="text-sm font-bold" style={{ color: cat.color }}>
                    {catData.score}/{catData.maxScore} ({percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
            Strengths
          </h3>
          {strengths.length > 0 ? (
            <div className="space-y-2">
              {strengths.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-emerald-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.topic}</p>
                    <p className="text-xs text-slate-500">{t.category}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">{t.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-emerald-600 italic">Keep practicing to build strengths!</p>
          )}
        </div>

        {/* Needs Improvement */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
            Needs Work
          </h3>
          {needsWork.length > 0 ? (
            <div className="space-y-2">
              {needsWork.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.topic}</p>
                    <p className="text-xs text-slate-500">{t.category}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{t.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-600">Great job! No topics in this range.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">✗</span>
            Weak Areas
          </h3>
          {weaknesses.length > 0 ? (
            <div className="space-y-2">
              {weaknesses.map((t, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.topic}</p>
                    <p className="text-xs text-slate-500">{t.category}</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{t.percent}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-600">No weak areas detected!</p>
          )}
        </div>
      </div>
    </section>
  );
}