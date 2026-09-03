import { useState, useMemo } from 'react';
import { mockColleges, mockCollegeStudents } from '../../data/collegeData';
import ScoreOverview from './ScoreOverview';
import ConceptAnalysis from './ConceptAnalysis';
import CompanyEligibility from './CompanyEligibility';
import ImprovementRoadmap from './ImprovementRoadmap';
import PeerComparison from './PeerComparison';
import CollegeReport from './CollegeReport';
import ScoreDoughnut from '../charts/DoughnutChart';
import ScoreBarChart from '../charts/BarChart';
import { COLORS } from '../../data/mockData';

export default function CollegeManagement() {
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const selectedCollege = mockColleges.find((c) => c.id === selectedCollegeId);
  const students = useMemo(
    () => mockCollegeStudents.filter((s) => s.collegeId === selectedCollegeId),
    [selectedCollegeId]
  );

  const sortedStudents = [...students].sort(
    (a, b) => b.data.overallScore - a.data.overallScore
  );

  const collegeAvg = students.length
    ? Math.round(students.reduce((s, st) => s + st.data.overallScore, 0) / students.length)
    : 0;

  const collegeTopper = sortedStudents.length ? sortedStudents[0].data.overallScore : 0;

  const categoryAverages = ['aptitude', 'reasoning', 'technical', 'english'].map((cat) => {
    const avg = students.length
      ? Math.round(
          students.reduce((sum, st) => {
            const attempt = st.data.examAttempts[st.data.examAttempts.length - 1];
            if (!attempt) return sum;
            const c = attempt.categories[cat];
            return sum + (c.score / c.maxScore) * 100;
          }, 0) / students.length
        )
      : 0;
    return avg;
  });

  const reset = () => {
    setSelectedCollegeId('');
    setSelectedStudent(null);
  };

  if (selectedStudent) {
    return (
      <section id="management" className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h2>
            <p className="text-sm text-slate-500">{selectedStudent.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">{selectedCollege?.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              ← Back to Students
            </button>
          </div>
        </div>

        <hr className="border-slate-200" />
        <ScoreOverview student={selectedStudent.data} />
        <hr className="border-slate-200" />
        <ConceptAnalysis student={selectedStudent.data} />
        <hr className="border-slate-200" />
        <CompanyEligibility student={selectedStudent.data} />
        <hr className="border-slate-200" />
        <ImprovementRoadmap student={selectedStudent.data} />
        <hr className="border-slate-200" />
        <PeerComparison student={selectedStudent.data} />
      </section>
    );
  }

  return (
    <section id="management" className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">College Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View student exam results and analytics for college management
          </p>
        </div>
        {selectedCollege && (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* College Dropdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Select College
        </label>
        <select
          value={selectedCollegeId}
          onChange={(e) => {
            setSelectedCollegeId(e.target.value);
            setSelectedStudent(null);
          }}
          className="w-full md:w-96 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
        >
          <option value="">-- Choose a college --</option>
          {mockColleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.location})
            </option>
          ))}
        </select>
      </div>

      {!selectedCollege ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <p className="text-4xl mb-3">🏫</p>
          <p className="text-slate-500">
            Select a college from the dropdown above to see its students' exam results.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* College Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-2xl p-5 ring-1 ring-blue-200">
              <p className="text-sm font-medium text-slate-500">Students Appeared</p>
              <p className="text-3xl font-bold text-blue-700">{students.length}</p>
              <p className="text-xs text-blue-600 mt-1">{selectedCollege.name}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 ring-1 ring-emerald-200">
              <p className="text-sm font-medium text-slate-500">College Average</p>
              <p className="text-3xl font-bold text-emerald-700">{collegeAvg}%</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-5 ring-1 ring-purple-200">
              <p className="text-sm font-medium text-slate-500">College Topper</p>
              <p className="text-3xl font-bold text-purple-700">{collegeTopper}%</p>
              {sortedStudents[0] && (
                <p className="text-xs text-purple-600 mt-1">{sortedStudents[0].name}</p>
              )}
            </div>
          </div>

          {/* College-level charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScoreDoughnut
              title="Category-wise College Average"
              labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
              data={categoryAverages}
              colors={[COLORS.aptitude, COLORS.reasoning, COLORS.technical, COLORS.english]}
            />
            <ScoreBarChart
              title="College Average by Category"
              labels={['Aptitude', 'Reasoning', 'Technical', 'English']}
              data={categoryAverages}
              colors={[COLORS.aptitude, COLORS.reasoning, COLORS.technical, COLORS.english]}
            />
          </div>

          {/* College Summary Report */}
          <CollegeReport
            college={selectedCollege}
            students={students}
            sortedStudents={sortedStudents}
            collegeAvg={collegeAvg}
            collegeTopper={collegeTopper}
            categoryAverages={categoryAverages}
          />

          {/* Student List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Students Results — {selectedCollege.name}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Student Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600 hidden md:table-cell">Email</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600 hidden sm:table-cell">Percentile</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">Status</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-600">View</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((st, idx) => (
                    <tr
                      key={st.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(st)}
                    >
                      <td className="py-3 px-4 font-medium text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-blue-700 hover:underline">
                        {st.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 hidden md:table-cell">{st.email}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold ${
                            st.data.overallScore >= 75
                              ? 'bg-emerald-100 text-emerald-700'
                              : st.data.overallScore >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {st.data.overallScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-500 hidden sm:table-cell">
                        {st.data.percentile}th
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            st.data.overallScore >= 75
                              ? 'bg-emerald-50 text-emerald-600'
                              : st.data.overallScore >= 60
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {st.data.overallScore >= 75
                            ? 'Strong'
                            : st.data.overallScore >= 60
                            ? 'Average'
                            : 'Needs Help'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                          Analytics →
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sortedStudents.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No students found for this college.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}