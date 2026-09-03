import { useMemo } from 'react';
import ScoreBarChart from '../charts/BarChart';
import ScoreDoughnut from '../charts/DoughnutChart';
import { COLORS } from '../../data/mockData';
import {
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Printer
} from 'lucide-react';

export default function CollegeReport({ college, students, sortedStudents, collegeAvg, collegeTopper, categoryAverages }) {
  const strong = useMemo(
    () => students.filter((s) => s.data.overallScore >= 75).length,
    [students]
  );
  const average = useMemo(
    () => students.filter((s) => s.data.overallScore >= 60 && s.data.overallScore < 75).length,
    [students]
  );
  const needsHelp = useMemo(
    () => students.filter((s) => s.data.overallScore < 60).length,
    [students]
  );
  const passRate = students.length ? Math.round((strong + average) / students.length * 100) : 0;

  const readinessLevel =
    collegeAvg >= 75 ? 'Placement Ready' : collegeAvg >= 60 ? 'Moderate Readiness' : 'Needs Intervention';
  const readinessColor =
    collegeAvg >= 75
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : collegeAvg >= 60
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-600 border-red-200';

  const top3 = sortedStudents.slice(0, 3);

  const catLabels = ['Aptitude', 'Reasoning', 'Technical', 'English'];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" id="college-report">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold">College Summary Report</h3>
            </div>
            <p className="text-sm text-slate-300">
              {college.name} — {college.location}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Executive Summary Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Users className="w-4 h-4 text-blue-500" />}
            label="Students Assessed"
            value={students.length}
            sub={`${college.studentCount} enrolled`}
            bg="bg-blue-50"
          />
          <SummaryCard
            icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
            label="College Average"
            value={`${collegeAvg}%`}
            sub={readinessLevel}
            bg="bg-emerald-50"
          />
          <SummaryCard
            icon={<Award className="w-4 h-4 text-purple-500" />}
            label="Top Score"
            value={`${collegeTopper}%`}
            sub={top3[0]?.name || '—'}
            bg="bg-purple-50"
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-4 h-4 text-amber-500" />}
            label="Placement Readiness"
            value={`${passRate}%`}
            sub={`${strong + average} of ${students.length} students ready`}
            bg="bg-amber-50"
          />
        </div>

        {/* Readiness Verdict */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${readinessColor}`}>
          {collegeAvg >= 60 ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-bold">{readinessLevel}</p>
            <p className="text-xs opacity-80">
              {collegeAvg >= 75
                ? `${college.name} students demonstrate strong placement readiness across all categories.`
                : collegeAvg >= 60
                ? `${college.name} shows moderate readiness. Focus areas identified for improvement.`
                : `${college.name} requires targeted intervention. Detailed improvement plan recommended.`}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700">Student Distribution</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <ScoreDoughnut
                title="Performance Distribution"
                labels={['Strong (≥75%)', 'Average (60–74%)', 'Needs Help (<60%)']}
                data={[strong, average, needsHelp]}
                colors={['#10B981', '#F59E0B', '#EF4444']}
              />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700">Category-wise College Average</h4>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <ScoreBarChart
                title="Average by Category"
                labels={catLabels}
                data={categoryAverages}
                colors={[COLORS.aptitude, COLORS.reasoning, COLORS.technical, COLORS.english]}
              />
            </div>
          </div>
        </div>

        {/* Summary Table */}
        <div>
          <h4 className="text-sm font-bold text-slate-700 mb-3">Category Summary</h4>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-2.5 px-4 font-semibold text-slate-600">Category</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-600">Avg Score</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-600">Max</th>
                  <th className="text-center py-2.5 px-4 font-semibold text-slate-600">Performance</th>
                </tr>
              </thead>
              <tbody>
                {catLabels.map((label, i) => (
                  <tr key={label} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-700">{label}</td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">{categoryAverages[i]}%</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">100%</td>
                    <td className="py-2.5 px-4">
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            categoryAverages[i] >= 75
                              ? 'bg-emerald-500'
                              : categoryAverages[i] >= 60
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${categoryAverages[i]}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 3 Performers */}
        {top3.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-700 mb-3">Top Performers</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map((st, i) => (
                <div
                  key={st.id}
                  className={`p-4 rounded-xl border ${
                    i === 0
                      ? 'bg-amber-50 border-amber-200'
                      : i === 1
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="text-xs font-bold text-slate-500">Rank #{i + 1}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                  <p className="text-xs text-slate-500">{st.email}</p>
                  <p className={`text-lg font-black mt-1 ${
                    i === 0 ? 'text-amber-700' : i === 1 ? 'text-slate-700' : 'text-orange-700'
                  }`}>
                    {st.data.overallScore}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, sub, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 ring-1 ring-black/5`}>
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs font-semibold text-slate-600">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}