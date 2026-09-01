import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  Search,
  Filter,
  Plus,
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
  const { candidatesList, addCandidate, deleteCandidate, addToast, navigateTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedReadiness, setSelectedReadiness] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewCandidate, setViewCandidate] = useState(null);

  // New Candidate Form State
  const [newCandForm, setNewCandForm] = useState({
    name: '',
    email: '',
    college: 'ABC University of Technology',
    branch: 'Computer Science & Engineering',
    graduationYear: '2026',
    assessmentStatus: 'Pending',
    overallScore: 75,
    readiness: 'Job Ready'
  });

  const filteredCandidates = useMemo(() => {
    return candidatesList.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.college.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCollege = selectedCollege === 'All' || c.college === selectedCollege;
      const matchYear = selectedYear === 'All' || c.graduationYear === selectedYear;
      const matchStatus = selectedStatus === 'All' || c.assessmentStatus === selectedStatus;
      const matchReadiness = selectedReadiness === 'All' || c.readiness === selectedReadiness;

      return matchSearch && matchCollege && matchYear && matchStatus && matchReadiness;
    });
  }, [candidatesList, searchQuery, selectedCollege, selectedYear, selectedStatus, selectedReadiness]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCandForm.name || !newCandForm.email) {
      addToast('Name and Email are required', 'error');
      return;
    }
    addCandidate({
      ...newCandForm,
      lastAssessment: 'Just now',
      aptitude: 76,
      reasoning: 74,
      technical: 75
    });
    setIsAddModalOpen(false);
    setNewCandForm({
      name: '',
      email: '',
      college: 'ABC University of Technology',
      branch: 'Computer Science & Engineering',
      graduationYear: '2026',
      assessmentStatus: 'Pending',
      overallScore: 75,
      readiness: 'Job Ready'
    });
  };

  const uniqueColleges = Array.from(new Set(candidatesList.map(c => c.college)));

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and inspect detailed profiles of candidates enrolled across all assessment tracks.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* SEARCH AND MULTI-FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name, email, or college..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          {/* College Filter */}
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Colleges</option>
            {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Graduation Year */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Grad Years</option>
            <option value="2026">2026 (Final Year)</option>
            <option value="2025">2025 (Graduated)</option>
            <option value="2024">2024</option>
          </select>

          {/* Readiness Level */}
          <select
            value={selectedReadiness}
            onChange={(e) => setSelectedReadiness(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Readiness Levels</option>
            <option value="Highly Ready">Highly Ready</option>
            <option value="Job Ready">Job Ready</option>
            <option value="Developing">Developing</option>
            <option value="Needs Training">Needs Training</option>
          </select>

        </div>
      </div>

      {/* CANDIDATES TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Name & Email</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Branch</th>
                <th className="py-3.5 px-4">Grad Year</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCandidates.map((cand) => (
                <tr key={cand.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{cand.name}</div>
                    <div className="text-[11px] text-slate-400">{cand.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {cand.college}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {cand.branch}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {cand.graduationYear}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 text-sm">{cand.overallScore}%</span>
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
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setViewCandidate(cand)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors"
                        title="View Profile"
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

      {/* ADD CANDIDATE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Candidate"
        subtitle="Register candidate into the assessment platform"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={newCandForm.name}
              onChange={(e) => setNewCandForm({ ...newCandForm, name: e.target.value })}
              placeholder="e.g. David Miller"
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={newCandForm.email}
              onChange={(e) => setNewCandForm({ ...newCandForm, email: e.target.value })}
              placeholder="david@university.edu"
              className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">College</label>
              <input
                type="text"
                value={newCandForm.college}
                onChange={(e) => setNewCandForm({ ...newCandForm, college: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch</label>
              <input
                type="text"
                value={newCandForm.branch}
                onChange={(e) => setNewCandForm({ ...newCandForm, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
              <select
                value={newCandForm.graduationYear}
                onChange={(e) => setNewCandForm({ ...newCandForm, graduationYear: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              >
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Readiness Level</label>
              <select
                value={newCandForm.readiness}
                onChange={(e) => setNewCandForm({ ...newCandForm, readiness: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              >
                <option value="Job Ready">Job Ready</option>
                <option value="Highly Ready">Highly Ready</option>
                <option value="Developing">Developing</option>
                <option value="Needs Training">Needs Training</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs"
            >
              Add Candidate
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW CANDIDATE PROFILE MODAL */}
      {viewCandidate && (
        <Modal
          isOpen={!!viewCandidate}
          onClose={() => setViewCandidate(null)}
          title={`Candidate Profile: ${viewCandidate.name}`}
          subtitle={`Verified Job Readiness Profile • ID: ${viewCandidate.id}`}
        >
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Email</span>
                <strong className="text-slate-900">{viewCandidate.email}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">College</span>
                <strong className="text-slate-900">{viewCandidate.college}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Branch & Year</span>
                <strong className="text-slate-900">{viewCandidate.branch} ({viewCandidate.graduationYear})</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">Readiness</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{viewCandidate.readiness}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Verified Academic Documents</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">10th Certificate</span>
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {viewCandidate.tenthCertificate || '10th_marksheet_verified.pdf'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Verified</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">12th Certificate</span>
                    <span className="text-xs font-semibold text-slate-800 truncate block">
                      {viewCandidate.twelfthCertificate || '12th_certificate_verified.pdf'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded shrink-0">Verified</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Assessment History</h4>
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block">Comprehensive Readiness Mock</strong>
                  <span className="text-[11px] text-slate-500">Evaluated on {viewCandidate.lastAssessment || 'Aug 30, 2026'}</span>
                </div>
                <span className="text-sm font-black text-brand-600">{viewCandidate.overallScore}% Score</span>
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
                View Full Final Report
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
