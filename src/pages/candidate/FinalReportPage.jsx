import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ScoreRing } from '../../components/common/ScoreRing';
import {
  BrainCircuit,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  Building,
  GraduationCap,
  ShieldCheck,
  QrCode,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const FinalReportPage = () => {
  const { currentUser, addToast } = useApp();
  const reportRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
    addToast('Opening print dialog to save as PDF', 'info');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Verified report link copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Official Credential</span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Verified Job Readiness Report
          </h1>
          <p className="text-xs text-slate-500">Official verifiable performance scorecard for recruiters & university placement cells.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* VERIFIABLE REPORT DOCUMENT CONTAINER */}
      <div 
        ref={reportRef}
        className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 max-w-4xl mx-auto space-y-8 text-slate-800"
      >
        
        {/* REPORT HEADER */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">ReadySet<span className="text-brand-600">Job</span></span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Job Readiness & Assessment Platform</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase pt-2">
              Job Readiness Report
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Report ID: RSJ-2026-CAND-8942 • Verification Hash: #9e4a8b1c
            </p>
          </div>

          <div className="sm:text-right space-y-1 bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Assessment Date</span>
            <span className="text-sm font-bold text-slate-900 block">Aug 30, 2026</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3 h-3" /> Verified Certificate
            </span>
          </div>
        </div>

        {/* CANDIDATE PROFILE SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Candidate Name</span>
            <strong className="text-slate-900 text-sm">{currentUser?.name || 'John Doe'}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Institution</span>
            <strong className="text-slate-900">{currentUser?.college || 'ABC University of Technology'}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Degree / Branch</span>
            <strong className="text-slate-900">{currentUser?.degree || 'B.Tech'} - {currentUser?.branch || 'CSE'}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Batch / Exp</span>
            <strong className="text-slate-900">{currentUser?.graduationYear || '2026'} ({currentUser?.experienceLevel || 'Fresher'})</strong>
          </div>
        </div>

        {/* OVERALL SCORE & READINESS LEVEL */}
        <div className="p-6 rounded-2xl border-2 border-brand-500 bg-brand-50/20 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-brand-100 pb-4 md:pb-0 md:pr-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-brand-600">{currentUser?.jobReadinessScore || 78}</span>
              <span className="text-lg text-slate-400 font-bold">/ 100</span>
            </div>
            <span className="mt-2 px-3 py-1 bg-brand-600 text-white rounded-full text-xs font-bold shadow-xs">
              86th Percentile
            </span>
          </div>

          <div className="md:col-span-8 space-y-2">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block">
              Readiness Level
            </span>
            <h3 className="text-xl font-bold text-slate-900">
              Job Ready — With Improvement Areas
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The candidate demonstrates above-average problem-solving velocity and strong object-oriented programming foundation, suitable for entry-level Software Development Engineer (SDE-1) roles.
            </p>
          </div>
        </div>

        {/* MODULE-WISE PERFORMANCE SCORES */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            1. Module-Wise Performance
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Quantitative Aptitude</span>
                <span className="text-brand-600">{currentUser?.aptitudeScore || 82}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-500 h-full rounded-full" style={{ width: `${currentUser?.aptitudeScore || 82}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Arithmetic, Ratios, Speed Math</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Logical Reasoning</span>
                <span className="text-purple-600">{currentUser?.reasoningScore || 74}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${currentUser?.reasoningScore || 74}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Deductive Logic, Patterns, Puzzles</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">Technical Skills</span>
                <span className="text-emerald-600">{currentUser?.technicalScore || 78}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${currentUser?.technicalScore || 78}%` }} />
              </div>
              <span className="text-[10px] text-slate-500 block">Data Structures, SQL, OOP</span>
            </div>
          </div>
        </div>

        {/* STRENGTHS & SKILL GAPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Strengths
            </h4>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span> Logical deduction & pattern puzzles</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span> Core Array and String algorithms</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span> Object-Oriented Design Principles</li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 font-bold">✓</span> Clean code syntax & time complexity analysis</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3 text-xs">
            <h4 className="font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Identified Skill Gaps
            </h4>
            <ul className="space-y-1.5 text-slate-700">
              <li className="flex items-start gap-2"><span className="text-amber-600 font-bold">⚠</span> Complex SQL joins, window functions (ROW_NUMBER)</li>
              <li className="flex items-start gap-2"><span className="text-amber-600 font-bold">⚠</span> Quantitative probability & combinatorics</li>
              <li className="flex items-start gap-2"><span className="text-amber-600 font-bold">⚠</span> Graph traversal algorithms (BFS/DFS)</li>
            </ul>
          </div>
        </div>

        {/* AI ASSESSMENT VERDICT */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-brand-300 font-bold uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Assessment & Next Steps Recommendation</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            "Candidate demonstrates strong problem-solving acumen. Focus on SQL joins and Quantitative Aptitude over the next 7 days will push job readiness to the 90th percentile, positioning the candidate in the top bracket for technical hiring drives."
          </p>
        </div>

        {/* FOOTER & VERIFICATION SEAL */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
              <QrCode className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Scan to Verify Authenticity</p>
              <p className="text-[10px] text-slate-400">https://readysetjob.com/verify/RSJ-8942</p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="font-bold text-slate-800">ReadySetJob AI Assessment Authority</p>
            <p className="text-[10px] text-slate-400">ISO 27001 Certified • Automated Cryptographic Seal</p>
          </div>
        </div>

      </div>

    </div>
  );
};
