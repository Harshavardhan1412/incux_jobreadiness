import React, { useMemo, useState, useEffect } from 'react';
import { computeEligibility, standardCompanyEligibilityCriteria } from '../../data/analyticsData';
import api from '../../services/api';
import { CheckCircle2, XCircle, AlertTriangle, Building2, GraduationCap, Award, HelpCircle, Code2 } from 'lucide-react';

import accentureLogo from '../../assets/accenture.png';
import capgeminiLogo from '../../assets/capgemini.png';
import cognizantLogo from '../../assets/Cognizant.png';
import deloitteLogo from '../../assets/Deloitte.png';
import hclLogo from '../../assets/hcl.png';
import ibmLogo from '../../assets/ibm.png';
import infosysLogo from '../../assets/infosys.png';
import ltiLogo from '../../assets/ltiMindtree.png';
import tcsLogo from '../../assets/tcs.png';
import techMahindraLogo from '../../assets/tech mahindra.png';
import wiproLogo from '../../assets/wipro.png';

const COMPANY_LOGO_MAP = {
  tcs: { logo: tcsLogo, bg: 'bg-white p-1.5', style: 'brightness-105 contrast-110 w-full h-full object-contain' },
  accenture: { logo: accentureLogo, bg: 'bg-[#0F172A] p-2', style: 'brightness-125 contrast-125 scale-105 w-full h-full object-contain' },
  capgemini: { logo: capgeminiLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  cognizant: { logo: cognizantLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  infosys: { logo: infosysLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  wipro: { logo: wiproLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  deloitte: { logo: deloitteLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  hcl: { logo: hclLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  ibm: { logo: ibmLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  lti: { logo: ltiLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
  techmahindra: { logo: techMahindraLogo, bg: 'bg-white p-1.5', style: 'contrast-110 w-full h-full object-contain' },
};

const getCompanyLogoInfo = (companyName = '') => {
  const key = String(companyName).toLowerCase().replace(/[^a-z]/g, '');
  if (key.includes('tcs') || key.includes('tata')) return COMPANY_LOGO_MAP.tcs;
  if (key.includes('accenture')) return COMPANY_LOGO_MAP.accenture;
  if (key.includes('capgemini')) return COMPANY_LOGO_MAP.capgemini;
  if (key.includes('cognizant')) return COMPANY_LOGO_MAP.cognizant;
  if (key.includes('infosys')) return COMPANY_LOGO_MAP.infosys;
  if (key.includes('wipro')) return COMPANY_LOGO_MAP.wipro;
  if (key.includes('deloitte')) return COMPANY_LOGO_MAP.deloitte;
  if (key.includes('hcl')) return COMPANY_LOGO_MAP.hcl;
  if (key.includes('ibm')) return COMPANY_LOGO_MAP.ibm;
  if (key.includes('lti') || key.includes('mindtree')) return COMPANY_LOGO_MAP.lti;
  if (key.includes('techmahindra') || key.includes('mahindra')) return COMPANY_LOGO_MAP.techmahindra;
  return { logo: null, bg: 'bg-slate-100', style: '' };
};

export default function CompanyEligibility({ student }) {
  const [criteriaList, setCriteriaList] = useState(standardCompanyEligibilityCriteria);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCriteria() {
      try {
        setLoading(true);
        const res = await api.candidates.getCompanyEligibilityCriteria();
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : null);
        if (mounted && res.ok && list && list.length > 0) {
          setCriteriaList(list);
        }
      } catch (err) {
        console.warn('Using standard fallback criteria:', err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadCriteria();
    return () => { mounted = false; };
  }, []);

  const eligibility = useMemo(
    () => computeEligibility(student, criteriaList),
    [student, criteriaList]
  );

  const eligible = eligibility.filter((e) => e.eligible);
  const borderline = eligibility.filter((e) => e.borderline);
  const notEligible = eligibility.filter((e) => !e.eligible && !e.borderline);

  const tierColors = {
    dream: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
    super_dream: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
    regular: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-600' },
  };

  const tierLabels = { dream: 'Dream Company', super_dream: 'Super Dream', regular: 'Regular' };

  return (
    <section id="companies" className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            Company Eligibility Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Matched against 10th, 12th/Diploma, current Graduation percentage, backlogs, and standardized assessment test cutoffs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Eligible ({eligible.length})
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Borderline ({borderline.length})
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Needs Improvement ({notEligible.length})
          </span>
        </div>
      </div>

      {/* Candidate Academic & Assessment Baseline Profile Summary Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-slate-600" />
          <span className="font-bold text-slate-700">Candidate Profile Baseline:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-slate-600">
          <div>
            <span className="text-slate-400">10th: </span>
            <span className="font-bold text-slate-800">{student?.tenthMarks ? `${student.tenthMarks}%` : 'N/A'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400">12th: </span>
            <span className="font-bold text-slate-800">{student?.twelfthDiplomaMarks ? `${student.twelfthDiplomaMarks}%` : 'N/A'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400">Grad: </span>
            <span className="font-bold text-slate-800">{student?.graduationPercentage ? `${student.graduationPercentage}%` : 'N/A'}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400">Backlogs: </span>
            <span className="font-bold text-slate-800">{student?.backlogs ?? 0}</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200 font-bold">
            <Code2 className="w-3 h-3 text-indigo-600" />
            <span>Coding: {student?.categoryScores?.coding ?? student?.codingScore ?? 0}%</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div>
            <span className="text-slate-400">Readiness: </span>
            <span className="font-bold text-brand-600">{student?.overallScore ?? student?.jobReadinessScore ?? 0}%</span>
          </div>
        </div>
      </div>

      {/* Eligible Companies */}
      {eligible.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Eligible Companies ({eligible.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligible.map((e) => (
              <CompanyCard key={e.company.id} eligibility={e} tierColors={tierColors} tierLabels={tierLabels} status="eligible" />
            ))}
          </div>
        </div>
      )}

      {/* Borderline Companies */}
      {borderline.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Borderline — Small Target Deficit ({borderline.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {borderline.map((e) => (
              <CompanyCard key={e.company.id} eligibility={e} tierColors={tierColors} tierLabels={tierLabels} status="borderline" />
            ))}
          </div>
        </div>
      )}

      {/* Not Eligible */}
      {notEligible.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-500" />
            Needs Preparation / Criteria Not Met ({notEligible.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notEligible.map((e) => (
              <CompanyCard key={e.company.id} eligibility={e} tierColors={tierColors} tierLabels={tierLabels} status="not_eligible" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function CompanyCard({ eligibility, tierColors, tierLabels, status }) {
  const { company, matchPercent, gaps, academicStatus, assessmentStatus, candidateValues } = eligibility;
  const logoInfo = getCompanyLogoInfo(company.name);

  const statusColors = {
    eligible: 'border-emerald-300 ring-emerald-400/20 bg-white',
    borderline: 'border-amber-300 ring-amber-400/20 bg-white',
    not_eligible: 'border-slate-200/90 bg-white hover:border-slate-300',
  };

  const matchColors = {
    eligible: 'text-emerald-600',
    borderline: 'text-amber-600',
    not_eligible: 'text-rose-500',
  };

  const statusBadges = {
    eligible: matchPercent >= 85
      ? { label: 'Highly Eligible', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
      : { label: 'Eligible', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    borderline: { label: 'Borderline', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    not_eligible: { label: 'Needs Prep', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  };

  const currentBadge = statusBadges[status] || statusBadges.not_eligible;

  return (
    <div className={`rounded-3xl p-5 sm:p-6 border ${statusColors[status]} shadow-subtle hover:shadow-card transition-all flex flex-col justify-between relative bg-white`}>
      
      {/* Best Match Ribbon if top match */}
      {matchPercent >= 85 && (
        <div className="absolute -top-3 left-5 bg-brand-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
          <span>⭐ Best Match</span>
        </div>
      )}

      <div>
        {/* Company Header & Logo */}
        <div className="flex items-start justify-between gap-3 mb-4 pt-1">
          <div className="flex items-center gap-3">
            {/* Logo Box */}
            <div className={`w-14 h-14 sm:w-16 sm:h-16 ${logoInfo.bg} rounded-2xl border border-slate-200/90 shadow-sm p-2 flex items-center justify-center shrink-0 overflow-hidden`}>
              {logoInfo.logo ? (
                <img
                  src={logoInfo.logo}
                  alt={company.name}
                  className={`max-h-full max-w-full object-contain ${logoInfo.style}`}
                />
              ) : (
                <Building2 className="w-7 h-7 text-slate-400" />
              )}
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">{company.name}</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{company.role}</p>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${currentBadge.color}`}>
            <CheckCircle2 className="w-3 h-3" />
            <span>{currentBadge.label}</span>
          </span>
        </div>

        {/* Match Percentage & Package Box */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-black ${matchColors[status]}`}>{matchPercent}%</span>
              <span className="text-xs font-bold text-slate-500">Match</span>
            </div>
          </div>

          <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Package</span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-900">{company.package}</span>
          </div>
        </div>

        {/* Academic Requirements vs Candidate Status */}
        <div className="mb-3 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Academic Requirements</div>
          <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-600 font-medium">10th ≥ {company.academics?.tenth}%</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{candidateValues?.tenth ? `${candidateValues.tenth}%` : 'N/A'}</span>
                {academicStatus?.tenthPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-600 font-medium">12th ≥ {company.academics?.twelfth}%</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{candidateValues?.twelfth ? `${candidateValues.twelfth}%` : 'N/A'}</span>
                {academicStatus?.twelfthPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-600 font-medium">Graduation ≥ {company.academics?.graduation}%</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{candidateValues?.graduation ? `${candidateValues.graduation}%` : 'N/A'}</span>
                {academicStatus?.gradPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-slate-600 font-medium">No Backlogs</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{candidateValues?.backlogs ?? 0}</span>
                {academicStatus?.backlogsPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-500" />}
              </div>
            </div>
          </div>
        </div>

        {/* Exam Assessment Cutoffs & Candidate Scores */}
        <div className="mb-3 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assessment Cutoffs & Scores</div>
          <div className="grid grid-cols-5 gap-1 text-[10px] text-center bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div className={`p-1 rounded-lg ${assessmentStatus?.aptPassed ? 'bg-emerald-50/80 text-emerald-800' : 'bg-rose-50/80 text-rose-800'}`}>
              <span className="text-slate-500 block text-[9px] font-semibold">Aptitude</span>
              <span className="font-extrabold">{candidateValues?.aptitude ?? 0}%</span>
              <span className="block text-[8px] text-slate-400">(≥{company.cutoffs?.aptitude}%)</span>
            </div>
            <div className={`p-1 rounded-lg ${assessmentStatus?.reasonPassed ? 'bg-emerald-50/80 text-emerald-800' : 'bg-rose-50/80 text-rose-800'}`}>
              <span className="text-slate-500 block text-[9px] font-semibold">Reasoning</span>
              <span className="font-extrabold">{candidateValues?.reasoning ?? 0}%</span>
              <span className="block text-[8px] text-slate-400">(≥{company.cutoffs?.reasoning}%)</span>
            </div>
            <div className={`p-1 rounded-lg ${assessmentStatus?.techPassed ? 'bg-emerald-50/80 text-emerald-800' : 'bg-rose-50/80 text-rose-800'}`}>
              <span className="text-slate-500 block text-[9px] font-semibold">Technical</span>
              <span className="font-extrabold">{candidateValues?.technical ?? 0}%</span>
              <span className="block text-[8px] text-slate-400">(≥{company.cutoffs?.technical}%)</span>
            </div>
            <div className={`p-1 rounded-lg ${assessmentStatus?.verbPassed ? 'bg-emerald-50/80 text-emerald-800' : 'bg-rose-50/80 text-rose-800'}`}>
              <span className="text-slate-500 block text-[9px] font-semibold">Verbal</span>
              <span className="font-extrabold">{candidateValues?.verbal ?? 0}%</span>
              <span className="block text-[8px] text-slate-400">(≥{company.cutoffs?.verbal}%)</span>
            </div>
            <div className={`p-1 rounded-lg ${assessmentStatus?.codePassed ? 'bg-indigo-50/90 text-indigo-900 border border-indigo-200' : 'bg-rose-50/80 text-rose-800'}`}>
              <span className="text-indigo-600 block text-[9px] font-extrabold flex items-center justify-center gap-0.5">
                <Code2 className="w-2.5 h-2.5 text-indigo-500" />
                <span>Coding</span>
              </span>
              <span className="font-black text-xs text-indigo-700">{candidateValues?.coding ?? 0}%</span>
              <span className="block text-[8px] text-indigo-400 font-semibold">(≥{company.cutoffs?.coding}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Banner */}
      {gaps.length === 0 ? (
        <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200/80 text-xs font-bold text-emerald-800 flex items-center justify-between mt-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>You meet all eligibility criteria!</span>
          </span>
          <span className="text-brand-600 text-xs font-bold hover:underline cursor-pointer">View Details →</span>
        </div>
      ) : (
        <div className="bg-rose-50/70 rounded-xl p-2.5 border border-rose-100 text-xs mt-2">
          <div className="font-bold text-rose-700 flex items-center gap-1 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>Criteria Gaps:</span>
          </div>
          <div className="space-y-0.5 text-[11px] text-rose-600 font-medium">
            {gaps.slice(0, 2).map((g, i) => (
              <div key={i} className="truncate">• {g.category}: Need +{g.deficit}%</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
