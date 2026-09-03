import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ScoreOverview from '../../components/analytics/ScoreOverview';
import ConceptAnalysis from '../../components/analytics/ConceptAnalysis';
import CompanyEligibility from '../../components/analytics/CompanyEligibility';
import ImprovementRoadmap from '../../components/analytics/ImprovementRoadmap';
import PeerComparison from '../../components/analytics/PeerComparison';
import { mockStudent } from '../../data/analyticsData';

export default function CandidateAnalyticsPage() {
  const { currentUser } = useApp();
  const [activeSection, setActiveSection] = useState('overview');

  const studentData = {
    ...mockStudent,
    name: currentUser?.name || mockStudent.name,
    email: currentUser?.email || mockStudent.email,
  };

  const sectionRefs = {
    overview: useRef(null),
    concepts: useRef(null),
    companies: useRef(null),
    roadmap: useRef(null),
    peers: useRef(null),
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabs = [
    { id: 'overview', label: 'Score Overview' },
    { id: 'concepts', label: 'Concept Analysis' },
    { id: 'companies', label: 'Company Eligibility' },
    { id: 'roadmap', label: 'Improvement Roadmap' },
    { id: 'peers', label: 'Peer Comparison' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 border border-brand-400/30 rounded-full text-brand-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
            AI Student Analytics Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Candidate Analytics & Performance Hub
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Detailed performance breakdown across aptitude, reasoning, technical skills, company eligibility cutoffs, and personalized study roadmaps.
          </p>
        </div>
      </div>

      {/* Sticky Tab Sub-Header */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-subtle flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleNavigate(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">
        <section ref={sectionRefs.overview}>
          <ScoreOverview student={studentData} />
        </section>

        <hr className="border-slate-200/80" />

        <section ref={sectionRefs.concepts}>
          <ConceptAnalysis student={studentData} />
        </section>

        <hr className="border-slate-200/80" />

        <section ref={sectionRefs.companies}>
          <CompanyEligibility student={studentData} />
        </section>

        <hr className="border-slate-200/80" />

        <section ref={sectionRefs.roadmap}>
          <ImprovementRoadmap student={studentData} />
        </section>

        <hr className="border-slate-200/80" />

        <section ref={sectionRefs.peers}>
          <PeerComparison student={studentData} />
        </section>
      </div>

      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 font-medium">
        IncuxAI Candidate Analytics Portal • ReadySetJob Platform
      </footer>
    </div>
  );
}
