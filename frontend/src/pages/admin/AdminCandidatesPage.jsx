import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  FileText,
  Mail,
  User
} from 'lucide-react';

export const AdminCandidatesPage = () => {
  const { candidatesList, deleteCandidate, addToast, navigateTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedReadiness, setSelectedReadiness] = useState('All');
  const [viewCandidate, setViewCandidate] = useState(null);

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.college && c.college.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCollege = selectedCollege === 'All' || c.college === selectedCollege;
      const matchYear = selectedYear === 'All' || String(c.graduationYear || c.graduation_year) === String(selectedYear);
      const matchStatus = selectedStatus === 'All' || c.assessmentStatus === selectedStatus;
      const matchReadiness = selectedReadiness === 'All' || c.readiness === selectedReadiness;

      return matchSearch && matchCollege && matchYear && matchStatus && matchReadiness;
    });
  }, [candidatesList, searchQuery, selectedCollege, selectedYear, selectedStatus, selectedReadiness]);

  const handleDownloadCSV = () => {
    if (!filteredCandidates || filteredCandidates.length === 0) {
      addToast('No candidate records available to export.', 'warning');
      return;
    }

    const headers = ['Candidate ID', 'Name', 'Email', 'Mobile', 'College', 'Branch', 'Specialization', 'City', 'State', 'Country', 'Graduation Year', 'Experience Level', 'Overall Score (%)', 'Status'];
    const rows = filteredCandidates.map(c => [
      `"${c.id || ''}"`,
      `"${c.name || c.fullName || ''}"`,
      `"${c.email || ''}"`,
      `"${c.mobile || c.phoneNo || c.phone || ''}"`,
      `"${c.college || c.collegeName || ''}"`,
      `"${c.branch || ''}"`,
      `"${c.specialization || ''}"`,
      `"${c.city || ''}"`,
      `"${c.state || ''}"`,
      `"${c.country || 'India'}"`,
      `"${c.graduationYear || c.graduation_year || ''}"`,
      `"${c.experienceLevel || c.experience_level || ''}"`,
      `"${c.overallScore ?? c.jobReadinessScore ?? c.job_readiness_score ?? 0}"`,
      `"${c.assessmentStatus || c.status || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Candidate_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredCandidates.length} candidate record(s) to CSV.`, 'success');
  };

  const uniqueColleges = Array.from(new Set(candidatesList.map(c => c.college || c.collegeName).filter(Boolean)));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Directory
            </h1>
            <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 text-xs font-bold rounded-full">
              {filteredCandidates.length} {filteredCandidates.length === 1 ? 'Candidate' : 'Candidates'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and inspect candidate scores and profiles across all assessment tracks.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Candidate Directory (CSV)</span>
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate by name, email, mobile, college, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700 font-medium"
            >
              <option value="All">All Institutions</option>
              {uniqueColleges.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700 font-medium"
            >
              <option value="All">All Grad Years</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>

        </div>
      </div>

      {/* CANDIDATES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Name & Email</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Branch & Specialization</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Grad Year & Exp</th>
                <th className="py-3.5 px-4">Overall Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{cand.name || cand.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{cand.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {cand.mobile || cand.phoneNo || cand.phone || '+91 9876543210'}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {cand.college || cand.collegeName || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{cand.branch || 'CSE'}</div>
                    <div className="text-[10px] text-slate-400">{cand.specialization || 'Full-Stack Development'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{cand.city || 'Hyderabad'}, {cand.state || 'Telangana'}</div>
                    <div className="text-[10px] text-slate-400">{cand.country || 'India'}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{cand.graduationYear || cand.graduation_year || 2026}</div>
                    <div className="text-[10px] text-slate-400">{cand.experienceLevel || cand.experience_level || 'Fresher'}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-black text-brand-600 text-sm">{cand.overallScore ?? cand.jobReadinessScore ?? cand.job_readiness_score ?? 0}%</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      (cand.assessmentStatus || cand.status) === 'Completed' || (cand.assessmentStatus || cand.status) === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : (cand.assessmentStatus || cand.status) === 'In Progress'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cand.assessmentStatus || cand.status || 'Active'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewCandidate(cand)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors"
                        title="View Full Candidate Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          deleteCandidate(cand.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                        title="Delete candidate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW CANDIDATE PROFILE MODAL */}
      {viewCandidate && (
        <Modal
          isOpen={!!viewCandidate}
          onClose={() => setViewCandidate(null)}
          title={`Candidate Profile: ${viewCandidate.name || viewCandidate.fullName}`}
          subtitle={`Enrolled Signup Data • ID: ${viewCandidate.id}`}
        >
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Full Name</span>
                <strong className="text-slate-900 text-sm">{viewCandidate.name || viewCandidate.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Email Address</span>
                <strong className="text-slate-900 font-mono">{viewCandidate.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Mobile Number</span>
                <strong className="text-slate-900 font-mono">{viewCandidate.mobile || viewCandidate.phoneNo || viewCandidate.phone || '+91 9876543210'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">College / Institution</span>
                <strong className="text-slate-900">{viewCandidate.college || viewCandidate.collegeName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Branch & Specialization</span>
                <strong className="text-slate-900">{viewCandidate.branch || 'CSE'} ({viewCandidate.specialization || 'Full-Stack'})</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Location</span>
                <strong className="text-slate-900">{viewCandidate.city || 'Hyderabad'}, {viewCandidate.state || 'Telangana'}, {viewCandidate.country || 'India'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Graduation Year</span>
                <strong className="text-slate-900">{viewCandidate.graduationYear || viewCandidate.graduation_year || 2026}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Experience Level</span>
                <strong className="text-slate-900">{viewCandidate.experienceLevel || viewCandidate.experience_level || 'Fresher'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Job Readiness Score</span>
                <span className="px-2 py-0.5 bg-brand-100 text-brand-800 rounded font-bold text-xs">
                  {viewCandidate.overallScore ?? viewCandidate.jobReadinessScore ?? viewCandidate.job_readiness_score ?? 0}%
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewCandidate(null);
                  navigateTo('final-report');
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold"
              >
                View Full Score Card Report
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
