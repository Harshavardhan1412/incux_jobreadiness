import React, { useMemo } from 'react';
import { computeEligibility, mockCompanies } from '../../data/analyticsData';

export default function CompanyEligibility({ student }) {
  const eligibility = useMemo(
    () => computeEligibility(student, mockCompanies),
    [student]
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
    <section id="companies" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Company Eligibility Matrix</h2>
        <div className="flex gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Eligible ({eligible.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Borderline ({borderline.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            Needs Improvement ({notEligible.length})
          </span>
        </div>
      </div>

      {/* Eligible Companies */}
      {eligible.length > 0 && (
        <div>
          <h3 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider mb-3">
            Eligible Companies
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
        <div>
          <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider mb-3">
            Borderline — Small Improvement Needed
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
        <div>
          <h3 className="text-xs font-extrabold text-rose-600 uppercase tracking-wider mb-3">
            Needs Significant Improvement
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
  const { company, matchPercent, gaps } = eligibility;
  const tc = tierColors[company.tier];

  const statusColors = {
    eligible: 'border-emerald-300 ring-emerald-400',
    borderline: 'border-amber-300 ring-amber-400',
    not_eligible: 'border-rose-300 ring-rose-400',
  };

  const matchColors = {
    eligible: 'text-emerald-600',
    borderline: 'text-amber-600',
    not_eligible: 'text-rose-500',
  };

  return (
    <div className={`bg-white rounded-2xl p-5 border ${statusColors[status]} shadow-card hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800">{company.name}</h4>
          <p className="text-xs text-slate-500 font-medium">{company.role}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.badge}`}>
          {tierLabels[company.tier]}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Match</p>
          <p className={`text-lg font-black ${matchColors[status]}`}>{matchPercent}%</p>
        </div>
        <div className="flex-1">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                status === 'eligible' ? 'bg-emerald-500' : status === 'borderline' ? 'bg-amber-500' : 'bg-rose-400'
              }`}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-500">Package</span>
        <span className="font-bold text-slate-700">{company.package}</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-slate-500">Cutoff</span>
        <span className="font-bold text-slate-700">{company.cutoffScore}%</span>
      </div>

      {gaps.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mt-2">
          <p className="text-[10px] font-bold text-slate-600 uppercase mb-1.5">Improvement needed:</p>
          <div className="space-y-1">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">{gap.category}</span>
                <span className="text-rose-600 font-bold">
                  Need +{gap.deficit}% ({gap.current}% → {gap.required}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
