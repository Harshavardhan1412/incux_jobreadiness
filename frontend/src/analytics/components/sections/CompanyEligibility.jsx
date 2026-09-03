import { useMemo } from 'react';
import { computeEligibility, mockCompanies } from '../../data/mockData';

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Company Eligibility</h2>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Eligible ({eligible.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Borderline ({borderline.length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Not Eligible ({notEligible.length})
          </span>
        </div>
      </div>

      {eligible.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
            Eligible Companies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligible.map((e) => (
              <CompanyCard key={e.company.id} eligibility={e} tierColors={tierColors} tierLabels={tierLabels} status="eligible" />
            ))}
          </div>
        </div>
      )}

      {borderline.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-3">
            Borderline - Small Improvement Needed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {borderline.map((e) => (
              <CompanyCard key={e.company.id} eligibility={e} tierColors={tierColors} tierLabels={tierLabels} status="borderline" />
            ))}
          </div>
        </div>
      )}

      {notEligible.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
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
    eligible: 'ring-emerald-400',
    borderline: 'ring-amber-400',
    not_eligible: 'ring-red-400',
  };

  const matchColors = {
    eligible: 'text-emerald-600',
    borderline: 'text-amber-600',
    not_eligible: 'text-red-500',
  };

  return (
    <div className={`bg-white rounded-2xl p-5 border ${tc.border} shadow-sm ring-2 ${statusColors[status]} ring-opacity-50 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-base font-bold text-slate-800">{company.name}</h4>
          <p className="text-sm text-slate-500">{company.role}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tc.badge}`}>
          {tierLabels[company.tier]}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-500">Match</p>
          <p className={`text-xl font-bold ${matchColors[status]}`}>{matchPercent}%</p>
        </div>
        <div className="flex-1">
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                status === 'eligible' ? 'bg-emerald-500' : status === 'borderline' ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-slate-500">Package</span>
        <span className="font-semibold text-slate-700">{company.package}</span>
      </div>
      <div className="flex items-center justify-between text-sm mb-3">
        <span className="text-slate-500">Cutoff</span>
        <span className="font-semibold text-slate-700">{company.cutoffScore}%</span>
      </div>

      {gaps.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-3 mt-2">
          <p className="text-xs font-semibold text-slate-600 mb-2">Improvement needed:</p>
          <div className="space-y-1.5">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{gap.category}</span>
                <span className="text-red-500 font-medium">
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