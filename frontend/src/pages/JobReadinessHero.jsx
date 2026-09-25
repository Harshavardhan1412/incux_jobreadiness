import React from 'react';
import { useApp } from '../context/AppContext';
import incuxaiLogoImg from '../assets/incuxai_logo.png';
import incuxaiHeroPoster from '../assets/incuxai_hero_poster.jpg';

import accentureLogo from '../assets/accenture.png';
import capgeminiLogo from '../assets/capgemini.png';
import cognizantLogo from '../assets/Cognizant.png';
import deloitteLogo from '../assets/Deloitte.png';
import hclLogo from '../assets/hcl.png';
import ibmLogo from '../assets/ibm.png';
import infosysLogo from '../assets/infosys.png';
import ltiLogo from '../assets/ltiMindtree.png';
import tcsLogo from '../assets/tcs.png';
import techMahindraLogo from '../assets/tech mahindra.png';
import wiproLogo from '../assets/wipro.png';

import {
  ArrowRight,
  GraduationCap,
  Zap,
  BarChart3,
  FileText,
  Target,
  TrendingUp,
  BrainCircuit,
  CheckCircle2
} from 'lucide-react';

// Company list for bottom marquee (moving from left to right)
const MARQUEE_COMPANIES = [
  {
    name: 'Google',
    isSvg: true,
    renderSvg: () => (
      <div className="flex items-center gap-1.5 font-bold text-lg text-slate-800">
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        <span className="tracking-tight text-slate-900 font-extrabold text-xl">Google</span>
      </div>
    )
  },
  {
    name: 'Microsoft',
    isSvg: true,
    renderSvg: () => (
      <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
        <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
          <div className="bg-[#F25022] rounded-xs" />
          <div className="bg-[#7FBA00] rounded-xs" />
          <div className="bg-[#00A4EF] rounded-xs" />
          <div className="bg-[#FFB900] rounded-xs" />
        </div>
        <span className="tracking-tight text-slate-700 font-bold text-lg">Microsoft</span>
      </div>
    )
  },
  {
    name: 'Amazon',
    isSvg: true,
    renderSvg: () => (
      <div className="flex items-center gap-1 font-black text-xl text-slate-900 tracking-tight">
        <span>amazon</span>
      </div>
    )
  },
  { name: 'TCS', logo: tcsLogo, bg: 'bg-white p-1' },
  { name: 'Infosys', logo: infosysLogo, bg: 'bg-white p-1' },
  { name: 'Wipro', logo: wiproLogo, bg: 'bg-white p-1' },
  { name: 'Deloitte', logo: deloitteLogo, bg: 'bg-white p-1' },
  { name: 'Accenture', logo: accentureLogo, bg: 'bg-[#0F172A] p-1.5 rounded-lg' },
  { name: 'Capgemini', logo: capgeminiLogo, bg: 'bg-white p-1' },
  { name: 'Cognizant', logo: cognizantLogo, bg: 'bg-white p-1' },
  { name: 'IBM', logo: ibmLogo, bg: 'bg-white p-1' },
  { name: 'HCLTech', logo: hclLogo, bg: 'bg-white p-1' },
  { name: 'LTIMindtree', logo: ltiLogo, bg: 'bg-white p-1' },
];

export const JobReadinessHero = () => {
  const { navigateTo } = useApp();

  const handleGetStarted = () => {
    navigateTo('signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4FD] via-[#F8FAFC] to-white font-sans text-slate-900 flex flex-col justify-between overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Keyframe animation styles for Marquee moving from LEFT TO RIGHT */}
      <style>{`
        @keyframes marqueeLeftToRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee-ltr {
          display: flex;
          width: max-content;
          animation: marqueeLeftToRight 28s linear infinite;
        }
        .animate-marquee-ltr:hover {
          animation-play-state: paused;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: floatSlow 6s ease-in-out infinite 1.5s;
        }
      `}</style>

      {/* 1. TOP NAVBAR */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between relative z-20">
        
        {/* Left Side: Brand Logo & Title */}
        <div
          onClick={() => navigateTo('hero')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src={incuxaiLogoImg} alt="IncuxAI Logo" className="w-8 h-8 object-cover rounded-xl" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">IncuxAI</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 tracking-wider">Job Readiness Platform</p>
          </div>
        </div>

        {/* Right Side: Get Started CTA Button */}
        <button
          onClick={handleGetStarted}
          className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#2563EB]/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* 2. HERO MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 lg:py-12 my-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Ambient Background Glows */}
        <div className="absolute -top-12 left-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/15 to-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/10 to-blue-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* LEFT COLUMN — HEADLINE, DESCRIPTION & CTA */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 pr-0 lg:pr-4">
          
          {/* AI Pill Tag */}
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-widest uppercase shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              AI-POWERED JOB READINESS
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            Know where you stand. <br />
            Know what to improve. <br />
            <span className="bg-gradient-to-r from-[#2563EB] via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Get job ready.
            </span>
          </h1>

          {/* Subtext Paragraph */}
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
            IncuxAI diagnoses your skill gaps, helps you practice with role-based assessments, and turns your results into a clear preparation roadmap.
          </p>

          {/* Big CTA Button */}
          <div className="pt-1">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-2xl font-bold text-base flex items-center gap-3 shadow-xl shadow-[#2563EB]/30 hover:shadow-blue-600/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature Badges Bar */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200/80">
            {/* Feature 1 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 backdrop-blur-xs border border-slate-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Free skill assessment</h4>
                <p className="text-[11px] text-slate-500 leading-tight">No card required</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 backdrop-blur-xs border border-slate-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Personalized insights</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Know your weak areas</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/60 backdrop-blur-xs border border-slate-200/60 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">Clear preparation roadmap</h4>
                <p className="text-[11px] text-slate-500 leading-tight">Get job ready faster</p>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — 3D READINESS CARD & FLOATING ANNOTATIONS */}
        <div className="lg:col-span-6 relative flex items-center justify-center select-none pt-6 lg:pt-0">
          
          {/* Handwriting Doodle Annotation 1 (Top) */}
          <div className="absolute -top-6 left-12 sm:left-24 z-20 hidden sm:flex flex-col items-start pointer-events-none">
            <span className="font-handwriting font-bold text-slate-600 text-sm sm:text-base -rotate-6 transform leading-tight">
              Better <br /> Skills <br /> Brighter <br /> Future
            </span>
            <svg className="w-10 h-10 text-slate-500 ml-6 -mt-1" fill="none" viewBox="0 0 40 40">
              <path d="M5 5 C 15 25, 25 28, 35 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M 28 35 L 35 35 L 33 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Floating Skill Gap Analysis Card (Top Left) */}
          <div className="absolute top-8 -left-4 sm:left-2 z-30 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xl shadow-slate-200/60 flex items-center gap-3 max-w-[210px] animate-float-slow">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Skill Gap Analysis</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Identify what to improve</p>
            </div>
          </div>

          {/* MAIN READINESS CARD */}
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 relative z-10 transition-transform duration-300 hover:scale-[1.01]">
            
            {/* Header: Your Readiness & Month Progress Badge */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your Readiness</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Overall Score</p>
              </div>

              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>↑ 12% than last month</span>
              </div>
            </div>

            {/* Circular Circular Ring Readiness Gauge */}
            <div className="flex justify-center my-6 relative">
              <div className="relative w-44 h-44 flex items-center justify-center">
                
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background Gray Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="8"
                  />
                  {/* Active Gradient Blue Ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#blueGaugeGradient)"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="55.2" // ~78%
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="blueGaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#2563EB" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Score Text inside Circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">78%</span>
                  <span className="text-xs font-bold text-slate-500 mt-0.5">Job Ready</span>
                </div>
              </div>
            </div>

            {/* 4 Category Score Bars */}
            <div className="space-y-3.5 pt-2">
              {/* Aptitude */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Aptitude</span>
                  <span className="text-slate-900 font-bold">82%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              {/* Technical */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Technical</span>
                  <span className="text-slate-900 font-bold">76%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '76%' }} />
                </div>
              </div>

              {/* Coding */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Coding</span>
                  <span className="text-slate-900 font-bold">71%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '71%' }} />
                </div>
              </div>

              {/* Communication */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Communication</span>
                  <span className="text-slate-900 font-bold">84%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>
            </div>

          </div>

          {/* Floating Personalized Roadmap Card (Bottom Right) */}
          <div className="absolute -bottom-4 -right-4 sm:right-0 z-30 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xl shadow-slate-200/60 flex items-center gap-3 max-w-[210px] animate-float-delayed">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Personalized Roadmap</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">Step by step guidance</p>
            </div>
          </div>

          {/* Handwriting Doodle Annotation 2 (Right) */}
          <div className="absolute right-[-20px] top-1/2 z-20 hidden xl:flex flex-col items-start pointer-events-none">
            <svg className="w-12 h-8 text-slate-500 -ml-8 rotate-180" fill="none" viewBox="0 0 40 40">
              <path d="M5 5 C 15 25, 25 28, 35 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
              <path d="M 28 35 L 35 35 L 33 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-handwriting font-bold text-slate-600 text-sm rotate-6 transform leading-tight max-w-[120px]">
              Your Next Job is Closer Than You Think
            </span>
          </div>

        </div>

      </main>

      {/* 3. BOTTOM COMPANY LOGOS MARQUEE (MOVING SMOOTHLY FROM LEFT TO RIGHT) */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-6">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            TRUSTED BY STUDENTS PREPARING FOR LEADING COMPANIES
          </p>
        </div>

        {/* Continuous Left-to-Right Moving Marquee Track */}
        <div className="relative w-full overflow-hidden flex items-center">
          {/* Left & Right Gradient Shadows for Seamless Blur Effect */}
          <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Marquee Track Moving LEFT TO RIGHT */}
          <div className="animate-marquee-ltr flex items-center gap-12 sm:gap-16">
            
            {/* Array duplicated 2x for seamless infinite left-to-right loop */}
            {[...MARQUEE_COMPANIES, ...MARQUEE_COMPANIES].map((comp, idx) => (
              <div
                key={`${comp.name}-${idx}`}
                className="flex items-center justify-center shrink-0 grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer"
              >
                {comp.isSvg ? (
                  comp.renderSvg()
                ) : (
                  <div className={`h-10 px-3 rounded-xl flex items-center justify-center ${comp.bg || 'bg-white'}`}>
                    <img
                      src={comp.logo}
                      alt={comp.name}
                      className="max-h-8 max-w-[120px] object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Rights Note */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© {new Date().getFullYear()} IncuxAI. All rights reserved.</span>
          <span>Job Readiness Engine & Verification Platform</span>
        </div>
      </footer>

    </div>
  );
};
