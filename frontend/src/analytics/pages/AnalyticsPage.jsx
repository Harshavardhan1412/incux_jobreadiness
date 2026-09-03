import { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import ScoreOverview from '../components/sections/ScoreOverview';
import ConceptAnalysis from '../components/sections/ConceptAnalysis';
import CompanyEligibility from '../components/sections/CompanyEligibility';
import ImprovementRoadmap from '../components/sections/ImprovementRoadmap';
import PeerComparison from '../components/sections/PeerComparison';
import QuestionTiming from '../components/sections/QuestionTiming';
import { mockStudent } from '../data/mockData';
import { BrainCircuit, ArrowLeft } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'concepts', label: 'Concepts' },
  { id: 'companies', label: 'Companies' },
  { id: 'timing', label: 'Timing' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'peers', label: 'Peers' },
];

export default function AnalyticsPage() {
  const { navigateTo } = useApp();
  const [activeSection, setActiveSection] = useState('overview');

  const sectionRefs = {
    overview: useRef(null),
    concepts: useRef(null),
    companies: useRef(null),
    timing: useRef(null),
    roadmap: useRef(null),
    peers: useRef(null),
  };

  const handleNavigate = (section) => {
    if (section === 'management') {
      navigateTo('college-management');
      return;
    }
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('home')}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Back to home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  {mockStudent.name}'s Analytics
                </h1>
                <p className="text-[11px] text-slate-500">IncuxAI Academy Analytics Portal</p>
              </div>
            </div>

            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleNavigate(s.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === s.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <section ref={sectionRefs.overview}>
          <ScoreOverview student={mockStudent} />
        </section>

        <hr className="border-slate-200" />

        <section ref={sectionRefs.concepts}>
          <ConceptAnalysis student={mockStudent} />
        </section>

        <hr className="border-slate-200" />

        <section ref={sectionRefs.companies}>
          <CompanyEligibility student={mockStudent} />
        </section>

        <hr className="border-slate-200" />

        <section ref={sectionRefs.timing}>
          <QuestionTiming />
        </section>

        <hr className="border-slate-200" />

        <section ref={sectionRefs.roadmap}>
          <ImprovementRoadmap student={mockStudent} />
        </section>

        <hr className="border-slate-200" />

        <section ref={sectionRefs.peers}>
          <PeerComparison student={mockStudent} />
        </section>

        {/* College Management Entry Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => handleNavigate('management')}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.02] transition-all"
          >
            <span className="text-2xl">🏫</span>
            <span className="text-left">
              <span className="block">College Management</span>
              <span className="block text-xs font-normal opacity-80">
                View results & analytics of all students
              </span>
            </span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        <footer className="text-center py-8 text-sm text-slate-400">
          IncuxAI Academy Analytics Portal
        </footer>
      </main>
    </div>
  );
}