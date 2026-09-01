import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Target,
  BrainCircuit,
  Compass,
  Calendar,
  Layers,
  FileText,
  Award,
  Zap,
  BookOpen
} from 'lucide-react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export const AIAnalysisPage = () => {
  const { currentUser, navigateTo } = useApp();

  // Radar Chart for Multi-Dimensional Readiness
  const radarData = {
    labels: [
      'Problem Solving',
      'Quantitative Aptitude',
      'Logical Reasoning',
      'Code Quality & OOP',
      'Speed & Efficiency',
      'Database & SQL'
    ],
    datasets: [
      {
        label: `${currentUser?.name || 'Candidate'} Score`,
        data: [85, 58, 88, 80, 75, 54],
        backgroundColor: 'rgba(14, 140, 230, 0.25)',
        borderColor: '#0e8ce6',
        pointBackgroundColor: '#0e8ce6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#0e8ce6',
        borderWidth: 2
      },
      {
        label: 'Industry Hiring Benchmark',
        data: [75, 75, 75, 75, 75, 80],
        backgroundColor: 'rgba(148, 163, 184, 0.15)',
        borderColor: '#94a3b8',
        borderDash: [4, 4],
        pointBackgroundColor: '#94a3b8',
        pointBorderColor: '#fff',
        borderWidth: 1.5
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter' },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      r: {
        angleLines: { color: '#e2e8f0' },
        grid: { color: '#f1f5f9' },
        pointLabels: {
          font: { size: 11, weight: 'bold', family: 'Inter' },
          color: '#334155'
        },
        suggestedMin: 30,
        suggestedMax: 100,
        ticks: { stepSize: 20, display: false }
      }
    }
  };

  // Skill Gaps Table Data
  const skillGaps = currentUser?.aiInsights?.skillGaps || [
    { skill: 'SQL Joins & Window Functions', candidateLevel: '54%', requiredLevel: '80%', gap: '-26%', priority: 'High' },
    { skill: 'Quantitative Aptitude (Probability)', candidateLevel: '58%', requiredLevel: '75%', gap: '-17%', priority: 'High' },
    { skill: 'Graph Algorithms (BFS/DFS)', candidateLevel: '60%', requiredLevel: '75%', gap: '-15%', priority: 'Medium' },
    { skill: 'System Architecture Basics', candidateLevel: '68%', requiredLevel: '75%', gap: '-7%', priority: 'Low' }
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-400/30 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Diagnostic Engine v2.4</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Performance & Career Readiness Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Comprehensive AI-generated diagnostic report for <strong>{currentUser?.name || 'John Doe'}</strong> ({currentUser?.college || 'ABC University of Technology'}).
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-200 block">Overall Job Readiness</span>
              <span className="text-2xl font-black text-white">{currentUser?.jobReadinessScore || 78} <span className="text-xs font-normal text-slate-300">/ 100</span></span>
            </div>
            <div className="w-2.5 h-10 bg-brand-400 rounded-full" />
            <button
              onClick={() => navigateTo('final-report')}
              className="px-4 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Final Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1 & 2: MULTI-DIMENSIONAL RADAR & OVERALL READINESS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Dimension Analysis</span>
              <h3 className="text-base font-bold text-slate-900">Job Readiness Radar vs Industry Benchmark</h3>
            </div>
            <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
              6 Core Dimensions
            </span>
          </div>

          <div className="h-72 w-full my-2">
            <Radar data={radarData} options={radarOptions} />
          </div>

          <p className="text-[11px] text-slate-500 text-center border-t border-slate-100 pt-3">
            Comparison against average benchmarks of hired fresh graduates in Tier-1 software companies.
          </p>
        </div>

        {/* Career Readiness Status Card & KPI Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                <h3 className="text-base font-bold text-slate-900">Career Readiness Verdict</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold rounded-full">
                Job Ready
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Placement Probability</span>
                <span className="font-bold text-emerald-800">86% (High)</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '86%' }} />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Recommended Role:</span>
                <strong className="text-slate-900">Software Development Engineer I</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                <span>Target Salary Band:</span>
                <strong className="text-slate-900">$65k - $85k / ₹8 - ₹14 LPA</strong>
              </div>
              <div className="flex justify-between py-1.5 text-slate-600">
                <span>Estimated Prep Needed:</span>
                <strong className="text-brand-600">7 - 10 Days Intensive</strong>
              </div>
            </div>
          </div>

          {/* AI Prescriptive Recommendation Box */}
          <div className="bg-gradient-to-br from-brand-50 to-blue-50/60 rounded-2xl border border-brand-200/80 p-6 space-y-3">
            <div className="flex items-center gap-2 text-brand-900">
              <Zap className="w-5 h-5 text-brand-600" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider">AI Prescriptive Action Plan</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              "{currentUser?.aiInsights?.prescriptivePlan || 'Focus on SQL joins, aggregation, and window functions for the next 7 days. Complete 3 quantitative aptitude practice sets and retake the technical assessment.'}"
            </p>
          </div>

        </div>

      </div>

      {/* SECTION 3 & 4: STRENGTHS & WEAKNESSES DEEP DIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strengths Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Demonstrated Core Strengths</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Top 20th Percentile
            </span>
          </div>

          <div className="space-y-3">
            {(currentUser?.aiInsights?.strengths || []).map((s, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{s}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Consistent accuracy and optimal algorithmic problem solving during timed tests.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Priority Improvement Areas</h3>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {(currentUser?.aiInsights?.weaknesses || []).map((w, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  !
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{w}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Below target threshold; dedicated module practice will yield quick score boosts.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 5: SKILL GAP MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</span>
            <h3 className="text-base font-bold text-slate-900">Skill Gap Matrix vs Industry Requirement</h3>
          </div>
          <span className="text-xs text-slate-500">Benchmark: Tier-1 Graduate Entry Level</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Candidate Level</th>
                <th className="py-3 px-4">Target Benchmark</th>
                <th className="py-3 px-4">Skill Gap</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {skillGaps.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-brand-600" />
                    <span>{item.skill}</span>
                  </td>
                  <td className="py-3.5 px-4">{item.candidateLevel}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.requiredLevel}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-rose-600 font-bold">{item.gap}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {item.priority} Priority
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigateTo('assessments')}
                      className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-all border border-brand-200"
                    >
                      Practice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 6: 7-DAY AI LEARNING ROADMAP */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Recommended 7-Day Precision Roadmap</h3>
              <p className="text-xs text-slate-500">Curated sequence designed to close the identified skill gaps.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Day 1 of 7
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-brand-50/50 border border-brand-200 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-600 text-white rounded">Days 1 - 2</span>
            <h4 className="text-xs font-bold text-slate-900">SQL Mastery & Joins</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Review INNER, LEFT, FULL OUTER joins, aggregation clauses, and window functions (ROW_NUMBER, RANK).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-700 text-white rounded">Days 3 - 4</span>
            <h4 className="text-xs font-bold text-slate-900">Probability & Speed Math</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Solve 25 quantitative aptitude problem sets covering permutations, combinations, and conditional probability.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-700 text-white rounded">Days 5 - 6</span>
            <h4 className="text-xs font-bold text-slate-900">Graph Traversals & Trees</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Implement standard BFS, DFS, and Binary Search Tree operations in code editor.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded">Day 7</span>
            <h4 className="text-xs font-bold text-slate-900">Full Mock Simulation</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Retake the Full-Stack Job Readiness assessment to achieve a target score of 88%+.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
