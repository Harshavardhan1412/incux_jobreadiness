import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  BookOpen,
  Award,
  ChevronRight,
  BrainCircuit,
  Target,
  FileText
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const CandidateDashboard = () => {
  const {
    currentUser,
    assessments,
    startAssessment,
    navigateTo,
    recommendations
  } = useApp();

  // Performance Trend Line Chart Data
  const trendData = {
    labels: ['Assessment 1', 'Assessment 2', 'Assessment 3', 'Assessment 4 (Latest)'],
    datasets: [
      {
        label: 'Job Readiness Score (%)',
        data: [62, 69, 74, 78],
        borderColor: '#0e8ce6',
        backgroundColor: 'rgba(14, 140, 230, 0.08)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0e8ce6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Score: ${context.parsed.y}%`
        }
      }
    },
    scales: {
      y: {
        min: 40,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: {
          stepSize: 15,
          font: { size: 11, family: 'Inter' },
          color: '#64748b',
          callback: (val) => `${val}%`
        }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter' }, color: '#64748b' }
      }
    }
  };

  const inProgressAssessment = assessments.find(a => a.status === 'In Progress') || assessments[0];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-lg">
        {/* Subtle Decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-brand-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>AI Evaluation Active • Class of {currentUser?.graduationYear || '2026'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name || 'Candidate'}!
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Continue your journey toward becoming job-ready. Take assessments, evaluate your gap matrix, and review your verified AI report.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('ai-analysis')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/15 flex items-center gap-2 shadow-xs"
            >
              <BrainCircuit className="w-4 h-4 text-brand-400" />
              <span>View AI Insights</span>
            </button>
            <button
              onClick={() => navigateTo('final-report')}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/30 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Job Readiness Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* TOP SECTION: Overall Score & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Overall Job Readiness Score Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Metric</span>
              <h3 className="text-base font-bold text-slate-900">Job Readiness Score</h3>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              {currentUser?.readinessStatus || 'Good Progress'}
            </span>
          </div>

          <div className="py-2">
            <ScoreRing score={currentUser?.jobReadinessScore || 78} maxScore={100} size={180} />
          </div>

          {/* Subscore Breakdown */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-600 block uppercase">Aptitude</span>
              <span className="text-lg font-extrabold text-slate-900">{currentUser?.aptitudeScore || 82}%</span>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${currentUser?.aptitudeScore || 82}%` }} />
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-600 block uppercase">Reasoning</span>
              <span className="text-lg font-extrabold text-slate-900">{currentUser?.reasoningScore || 74}%</span>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${currentUser?.reasoningScore || 74}%` }} />
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-semibold text-slate-600 block uppercase">Technical</span>
              <span className="text-lg font-extrabold text-slate-900">{currentUser?.technicalScore || 78}%</span>
              <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentUser?.technicalScore || 78}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Continue Assessment Active Card & Assessment Suite */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Continue Assessment Hero Card */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Resume Ongoing Test
                </span>
                <h3 className="text-xl font-bold">{inProgressAssessment.title}</h3>
                <div className="flex items-center gap-4 text-xs text-brand-100 pt-1">
                  <span>Progress: <strong className="text-white">{inProgressAssessment.progress}%</strong></span>
                  <span>•</span>
                  <span>{inProgressAssessment.completedQuestions} / {inProgressAssessment.totalQuestions} completed</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Est. {inProgressAssessment.estimatedTimeMin} min
                  </span>
                </div>
              </div>

              <button
                onClick={() => startAssessment(inProgressAssessment.id)}
                className="self-start sm:self-center px-5 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-2 group flex-shrink-0"
              >
                <span>Continue Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-black/20 h-2 rounded-full mt-5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${inProgressAssessment.progress}%` }}
              />
            </div>
          </div>

          {/* Performance Summary Line Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Score History</span>
                <h3 className="text-sm font-bold text-slate-900">Performance Growth Over Recent Tests</h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +16% Growth
              </span>
            </div>
            <div className="h-44 w-full">
              <Line data={trendData} options={trendOptions} />
            </div>
          </div>

        </div>

      </div>

      {/* ASSESSMENT CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Assessment Suite</h3>
            <p className="text-xs text-slate-500">Benchmark your skills across core engineering and reasoning dimensions.</p>
          </div>
          <button
            onClick={() => navigateTo('assessments')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
          >
            View All Tests <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {assessments.slice(0, 3).map((asm) => {
            const isCompleted = asm.status === 'Completed';
            const isInProgress = asm.status === 'In Progress';

            return (
              <div
                key={asm.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 flex flex-col justify-between hover:border-brand-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                      {asm.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}>
                      {isCompleted ? `Score: ${asm.lastScore}%` : asm.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {asm.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asm.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 my-4 p-2.5 bg-slate-50 rounded-xl text-center text-[11px]">
                    <div>
                      <span className="text-slate-600 block">Difficulty</span>
                      <strong className="text-slate-800">{asm.difficulty}</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Questions</span>
                      <strong className="text-slate-800">{asm.totalQuestions} Qs</strong>
                    </div>
                    <div>
                      <span className="text-slate-600 block">Duration</span>
                      <strong className="text-slate-800">{asm.durationMinutes}m</strong>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigateTo('results')}
                        className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Result</span>
                      </button>
                      <button
                        onClick={() => startAssessment(asm.id)}
                        className="py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        title="Retake test"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : isInProgress ? (
                    <button
                      onClick={() => startAssessment(asm.id)}
                      className="w-full py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Continue</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startAssessment(asm.id)}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Assessment</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SKILL ANALYSIS & AI CAREER INSIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Skill Analysis Progress Bars */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</span>
            <h3 className="text-base font-bold text-slate-900">Skill Proficiency Matrix</h3>
          </div>

          {/* Strong Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strong Areas
            </h4>
            <div className="space-y-3">
              {currentUser?.strongAreas?.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-emerald-800">{item.mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Needs Improvement
            </h4>
            <div className="space-y-3">
              {currentUser?.needsImprovement?.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.name}</span>
                    <span className="text-amber-800">{item.mastery}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.mastery}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Career Insight & Recommendations */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* AI Insight Card */}
          <div className="bg-gradient-to-br from-brand-900 to-slate-900 text-white rounded-2xl p-6 shadow-card space-y-4 border border-brand-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">AI Career Insight</h4>
                  <span className="text-[10px] text-brand-300">Generated for {currentUser?.branch || 'CS & Engineering'}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-brand-500/20 border border-brand-400/30 text-brand-300 rounded text-[10px] font-bold">
                GPT-4o Engine
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-white/5 p-4 rounded-xl border border-white/10">
              "{currentUser?.aiInsights?.summary || 'You demonstrate strong logical reasoning and programming fundamentals. Your biggest improvement opportunity is quantitative aptitude and SQL. Improving these areas could significantly increase your overall job-readiness score.'}"
            </p>

            <button
              onClick={() => navigateTo('ai-analysis')}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
            >
              <span>View Detailed AI Performance Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actionable Recommendations List */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Next Steps</span>
                <h3 className="text-sm font-bold text-slate-900">Recommended Actions</h3>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
                4 Active Tasks
              </span>
            </div>

            <div className="space-y-2.5">
              {recommendations.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-brand-200 bg-slate-50/60 hover:bg-brand-50/20 transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rec.skill}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/80 rounded text-slate-700">
                        {rec.currentLevel} → {rec.targetLevel}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                      {rec.action}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (rec.category === 'Assessment') {
                        startAssessment('asm-full-1');
                      } else {
                        navigateTo('ai-analysis');
                      }
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-brand-600 hover:text-white text-brand-700 border border-brand-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex-shrink-0"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
