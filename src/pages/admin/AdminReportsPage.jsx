import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  FileText,
  Download,
  Printer,
  Eye,
  FileSpreadsheet,
  Building,
  CheckCircle2,
  Users,
  Target,
  Sparkles
} from 'lucide-react';

export const AdminReportsPage = () => {
  const { candidatesList, kpis, addToast } = useApp();
  const [activeReportModal, setActiveReportModal] = useState(null);

  const reportsList = [
    {
      id: 'rep-cand',
      title: 'Candidate Performance Report',
      description: 'Comprehensive roster of individual candidate test scores, percentiles, and job readiness status.',
      type: 'Candidate Roster',
      updated: 'Today, 10:45 AM',
      recordCount: '1,248 Candidates'
    },
    {
      id: 'rep-asm',
      title: 'Assessment Performance Report',
      description: 'Module-wise metrics, average completion times, question difficulty indices, and pass rates.',
      type: 'Module Analysis',
      updated: 'Yesterday',
      recordCount: '4 Active Assessments'
    },
    {
      id: 'rep-col',
      title: 'College-Wise Placement Readiness Report',
      description: 'Comparative university performance, department rankings, and hiring batch statistics.',
      type: 'Institutional Benchmark',
      updated: 'Aug 29, 2026',
      recordCount: '14 Universities'
    },
    {
      id: 'rep-gap',
      title: 'Skill Gap & Curriculum Diagnosis Report',
      description: 'Aggregated topic-level skill deficits (SQL, Graph Theory, Probability) to inform college training programs.',
      type: 'AI Diagnosis',
      updated: 'Aug 28, 2026',
      recordCount: '24 Skill Areas'
    },
    {
      id: 'rep-all',
      title: 'Overall Platform Executive Summary',
      description: 'High-level executive report summarizing candidate test volume, readiness velocity, and recruiting pipeline.',
      type: 'Executive KPI',
      updated: 'Weekly Auto-Gen',
      recordCount: 'All Modules'
    }
  ];

  const handleExportCSV = (report) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (report.id === 'rep-cand') {
      csvContent += 'Candidate ID,Name,Email,College,Branch,Grad Year,Score,Readiness\n';
      candidatesList.forEach(c => {
        csvContent += `${c.id},"${c.name}",${c.email},"${c.college}","${c.branch}",${c.graduationYear},${c.overallScore}%,${c.readiness}\n`;
      });
    } else {
      csvContent += 'Metric,Value,Benchmark,Status\n';
      csvContent += 'Total Tested,1248,1000,Above Target\n';
      csvContent += 'Average Score,72%,70%,Optimal\n';
      csvContent += 'Job Ready Candidates,684,500,Satisfied\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${report.id}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported "${report.title}" as CSV`, 'success');
  };

  const handleExportPDF = (report) => {
    window.print();
    addToast(`Generated printable PDF for "${report.title}"`, 'info');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reports & Placement Data Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate and export verifiable institutional summaries, skill gap matrices, and candidate CSVs.
          </p>
        </div>
      </div>

      {/* REPORTS CATALOG */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep) => (
          <div
            key={rep.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 uppercase">
                  {rep.type}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {rep.updated}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {rep.description}
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-4 text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Coverage:</span>
                <strong className="text-slate-900">{rep.recordCount}</strong>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setActiveReportModal(rep)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>View Report</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV(rep)}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-emerald-200"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportPDF(rep)}
                  className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-brand-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REPORT PREVIEW MODAL */}
      {activeReportModal && (
        <Modal
          isOpen={!!activeReportModal}
          onClose={() => setActiveReportModal(null)}
          title={activeReportModal.title}
          subtitle={`Generated on ${new Date().toLocaleDateString()} • Verified Institutional Summary`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5 text-xs">
            
            {/* KPI Header Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Total Candidates</span>
                <strong className="text-slate-900 text-base">{kpis.totalCandidates}</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Average Score</span>
                <strong className="text-slate-900 text-base">{kpis.averageScore}%</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Job Ready</span>
                <strong className="text-brand-600 text-base">{kpis.jobReadyCandidates}</strong>
              </div>
            </div>

            {/* Candidate Sample Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-[10px] text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Candidate</th>
                    <th className="p-2.5">College</th>
                    <th className="p-2.5">Score</th>
                    <th className="p-2.5">Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidatesList.slice(0, 4).map(c => (
                    <tr key={c.id}>
                      <td className="p-2.5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-2.5 text-slate-600">{c.college}</td>
                      <td className="p-2.5 font-bold text-brand-600">{c.overallScore}%</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          {c.readiness}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveReportModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleExportCSV(activeReportModal)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full CSV</span>
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
