import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Award,
  Filter,
  Calendar,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AdminAnalyticsPage = () => {
  const { kpis } = useApp();

  const [dateFilter, setDateFilter] = useState('Last 30 Days');
  const [collegeFilter, setCollegeFilter] = useState('All');
  const [assessmentFilter, setAssessmentFilter] = useState('All');

  // Chart 1: Score Distribution
  const distributionData = {
    labels: ['< 50% (Needs Training)', '50-65% (Developing)', '66-80% (Job Ready)', '80%+ (High Achiever)'],
    datasets: [
      {
        label: 'Candidates Count',
        data: [142, 324, 498, 284],
        backgroundColor: [
          'rgba(239, 68, 68, 0.75)',
          'rgba(245, 158, 11, 0.75)',
          'rgba(14, 140, 230, 0.75)',
          'rgba(16, 185, 129, 0.75)'
        ],
        borderRadius: 8
      }
    ]
  };

  // Chart 2: Category Performance
  const categoryData = {
    labels: ['Quantitative Aptitude', 'Logical Reasoning', 'Technical Engineering'],
    datasets: [
      {
        label: 'Average Score (%)',
        data: [72, 76, 68],
        backgroundColor: ['#0e8ce6', '#8b5cf6', '#10b981'],
        borderRadius: 8
      }
    ]
  };

  // Chart 3: Candidate Performance Trend
  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Average Platform Score',
        data: [65, 67, 69, 71, 72, 75],
        borderColor: '#0e8ce6',
        backgroundColor: 'rgba(14, 140, 230, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0e8ce6'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header & Multi-Dimensional Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment & Readiness Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time score distribution, module averages, candidate benchmarks, and weakest topics.
          </p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs outline-none"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Current Semester">Current Semester</option>
            <option value="All Time">All Time</option>
          </select>

          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs outline-none"
          >
            <option value="All">All Universities</option>
            <option value="ABC">ABC Univ of Tech</option>
            <option value="NIT">National Institute of Tech</option>
            <option value="MIT">MIT College of Engg</option>
          </select>
        </div>
      </div>

      {/* TOP 4 KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidates Tested</span>
            <span className="text-2xl font-black text-slate-900">1,248</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <span className="text-2xl font-black text-slate-900">72%</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assessment Pass Rate</span>
            <span className="text-2xl font-black text-emerald-600">78.4%</span>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Readiness Rate</span>
            <span className="text-2xl font-black text-purple-600">54.8%</span>
          </div>
        </div>
      </div>

      {/* CHARTS: SCORE DISTRIBUTION & CATEGORY PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cohort Spread</span>
              <h3 className="text-base font-bold text-slate-900">Score Distribution Across All Candidates</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">1,248 Candidates</span>
          </div>

          <div className="h-64 w-full">
            <Bar data={distributionData} options={chartOptions} />
          </div>
        </div>

        {/* Category Performance */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Category Mastery</span>
              <h3 className="text-base font-bold text-slate-900">Average Score By Module</h3>
            </div>
            <span className="text-xs font-bold text-brand-600">3 Core Tracks</span>
          </div>

          <div className="h-64 w-full">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>

      </div>

      {/* WEAKEST TOPICS ANALYSIS & TREND OVER TIME */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Weakest Topics Matrix */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Platform-Wide Weakest Topics</h3>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              High Failure Rate
            </span>
          </div>

          <div className="space-y-3">
            {kpis.weakestTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.topic}</h4>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">Avg Candidate Score: {item.avgScore}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-rose-600">{item.failureRate}</span>
                  <span className="text-[10px] text-slate-400 block">Failure Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Performance Trend */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Progression</span>
              <h3 className="text-base font-bold text-slate-900">Average Platform Score Growth</h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              +10% in 6 Weeks
            </span>
          </div>

          <div className="h-56 w-full">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

      </div>

    </div>
  );
};
