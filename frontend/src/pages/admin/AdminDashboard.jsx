import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  UserCheck,
  CheckCircle2,
  TrendingUp,
  Award,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Plus,
  FileText,
  Building,
  GraduationCap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Database,
  BarChart3
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
import { Line } from 'react-chartjs-2';

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

export const AdminDashboard = () => {
  const {
    candidatesList,
    kpis,
    navigateTo,
    deleteCandidate,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedReadiness, setSelectedReadiness] = useState('All');
  const [sortField, setSortField] = useState('overallScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewCandidate, setViewCandidate] = useState(null);

  const itemsPerPage = 5;

  // Performance Trend Chart Data
  const trendData = {
    labels: ['May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Current Batch'],
    datasets: [
      {
        label: 'Average Candidate Score (%)',
        data: [64, 68, 70, 72, 75],
        borderColor: '#0e8ce6',
        backgroundColor: 'rgba(14, 140, 230, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#0e8ce6',
        pointRadius: 4,
        pointHoverRadius: 6
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
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        min: 50,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: { callback: (v) => `${v}%`, font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  // Filter and Sort Candidates
  const filteredCandidates = useMemo(() => {
    return candidatesList.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.college.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCollege = selectedCollege === 'All' || c.college === selectedCollege;
      const matchesReadiness = selectedReadiness === 'All' || c.readiness === selectedReadiness;

      return matchesSearch && matchesCollege && matchesReadiness;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [candidatesList, searchQuery, selectedCollege, selectedReadiness, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const uniqueColleges = Array.from(new Set(candidatesList.map(c => c.college)));

  return (
    <div className="space-y-8 pb-16">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor candidate assessments, college benchmarks, and platform performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('admin-questions')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Question Bank</span>
          </button>
          <button
            onClick={() => navigateTo('admin-assessments')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        </div>
      </div>

      {/* TOP 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Candidates */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Candidates</span>
            <span className="text-2xl font-black text-slate-900">{kpis.totalCandidates.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">Across 14 Universities</span>
          </div>
        </div>

        {/* Active Candidates */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Candidates</span>
            <span className="text-2xl font-black text-emerald-600">{kpis.activeCandidates.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-700 font-medium block">71% Active Rate</span>
          </div>
        </div>

        {/* Assessments Completed */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tests</span>
            <span className="text-2xl font-black text-purple-600">{kpis.assessmentsCompleted.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">3 Modules / Test</span>
          </div>
        </div>

        {/* Average Score */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Score</span>
            <span className="text-2xl font-black text-slate-900">{kpis.averageScore}%</span>
            <span className="text-[10px] text-emerald-700 font-medium block">+4.2% This Month</span>
          </div>
        </div>

        {/* Job Ready Candidates */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Ready Candidates</span>
            <span className="text-2xl font-black text-brand-600">{kpis.jobReadyCandidates.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 block">54.8% Placement Ready</span>
          </div>
        </div>

      </div>

      {/* CANDIDATE PERFORMANCE CHART & CATEGORY PERFORMANCE CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Candidate Performance Over Time */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Analytics</span>
              <h3 className="text-base font-bold text-slate-900">Average Candidate Score Over Time</h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Positive Growth Trend
            </span>
          </div>

          <div className="h-56 w-full">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        {/* Assessment Category Performance Cards */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Module Breakdown</span>
            <h3 className="text-base font-bold text-slate-900">Assessment Performance By Category</h3>
          </div>

          <div className="space-y-4">
            {/* Aptitude */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-800">Aptitude (Quantitative)</span>
                <span className="text-brand-600">Average: {kpis.categoryAverages.aptitude}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${kpis.categoryAverages.aptitude}%` }} />
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-800">Reasoning (Logical & Analytical)</span>
                <span className="text-purple-600">Average: {kpis.categoryAverages.reasoning}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${kpis.categoryAverages.reasoning}%` }} />
              </div>
            </div>

            {/* Technical */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-800">Technical (DSA, SQL, OOP)</span>
                <span className="text-emerald-600">Average: {kpis.categoryAverages.technical}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${kpis.categoryAverages.technical}%` }} />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigateTo('admin-analytics')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Deep Dive Analytics</span>
          </button>
        </div>

      </div>

      {/* CANDIDATE ROSTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
        
        {/* Table Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Candidate Directory</h3>
            <p className="text-xs text-slate-500">Live roster of candidate assessment scores and job readiness classifications.</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search name, email, college..."
                className="pl-9 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-brand-500 outline-none w-56"
              />
            </div>

            <select
              value={selectedCollege}
              onChange={(e) => { setSelectedCollege(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
            >
              <option value="All">All Colleges</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={selectedReadiness}
              onChange={(e) => { setSelectedReadiness(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
            >
              <option value="All">All Readiness</option>
              <option value="Highly Ready">Highly Ready</option>
              <option value="Job Ready">Job Ready</option>
              <option value="Developing">Developing</option>
              <option value="Needs Training">Needs Training</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Candidate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">College / University</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 cursor-pointer" onClick={() => toggleSort('overallScore')}>
                  <div className="flex items-center gap-1">
                    <span>Overall Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Readiness Level</th>
                <th className="py-3 px-4">Last Assessment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {paginatedCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{cand.name}</div>
                    <div className="text-[11px] text-slate-400">{cand.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-800">{cand.college}</div>
                    <div className="text-[11px] text-slate-400">{cand.branch} ({cand.graduationYear})</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cand.assessmentStatus === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : cand.assessmentStatus === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cand.assessmentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-sm">{cand.overallScore}%</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                      cand.readiness === 'Highly Ready'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : cand.readiness === 'Job Ready'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : cand.readiness === 'Developing'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {cand.readiness}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {cand.lastAssessment}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setViewCandidate(cand)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCandidates.length)} of {filteredCandidates.length} candidates
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* CANDIDATE PROFILE MODAL */}
      {viewCandidate && (
        <Modal
          isOpen={!!viewCandidate}
          onClose={() => setViewCandidate(null)}
          title={`Candidate Profile: ${viewCandidate.name}`}
          subtitle={`Verified Job Readiness Profile • ID: ${viewCandidate.id}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            
            {/* Top Overview Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Email</span>
                <strong className="text-slate-900">{viewCandidate.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">College</span>
                <strong className="text-slate-900">{viewCandidate.college}</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Branch / Year</span>
                <strong className="text-slate-900">{viewCandidate.branch} ({viewCandidate.graduationYear})</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Overall Readiness</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{viewCandidate.readiness}</span>
              </div>
            </div>

            {/* Assessment Scores */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Module Scores</h4>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                  <span className="text-slate-500 block">Aptitude</span>
                  <span className="text-lg font-black text-brand-700">{viewCandidate.aptitude || 82}%</span>
                </div>
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                  <span className="text-slate-500 block">Reasoning</span>
                  <span className="text-lg font-black text-purple-700">{viewCandidate.reasoning || 74}%</span>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 block">Technical</span>
                  <span className="text-lg font-black text-emerald-700">{viewCandidate.technical || 78}%</span>
                </div>
              </div>
            </div>

            {/* AI Insights & Recommendations */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-brand-400 font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI Automated Placement Verdict</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Candidate exhibits top tier analytical reasoning and solid core programming aptitude. Placement readiness is verified for standard corporate software hiring drives.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  deleteCandidate(viewCandidate.id);
                  setViewCandidate(null);
                }}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Remove Candidate
              </button>

              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Close
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
