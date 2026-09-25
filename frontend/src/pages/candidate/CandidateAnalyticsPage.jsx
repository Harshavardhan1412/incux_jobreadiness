import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import ScoreOverview from '../../components/analytics/ScoreOverview';
import ConceptAnalysis from '../../components/analytics/ConceptAnalysis';
import CompanyEligibility from '../../components/analytics/CompanyEligibility';
import ImprovementRoadmap from '../../components/analytics/ImprovementRoadmap';
import { ScoreRing } from '../../components/common/ScoreRing';
import confetti from 'canvas-confetti';
import { mockStudent } from '../../data/analyticsData';
import { AssessmentReportModal } from '../../components/candidate/AssessmentReportModal';
import {
  Award,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ClipboardCheck,
  TrendingUp,
  Layers,
  BookOpen,
  Download,
  Code2
} from 'lucide-react';

export default function CandidateAnalyticsPage() {
  const { currentUser, setCurrentUser, latestResult, setLatestResult, startAssessment, addToast } = useApp();
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('results');

  // Auto-refresh authoritative scores from DB on mount
  useEffect(() => {
    let mounted = true;
    const fetchFreshData = async () => {
      try {
        const [meRes, subRes] = await Promise.all([
          api.auth.me().catch(() => null),
          api.submissions.my().catch(() => null)
        ]);
        if (mounted && meRes?.ok && meRes.data?.candidate) {
          const freshCand = meRes.data.candidate;
          if (setCurrentUser) setCurrentUser(freshCand);
          try {
            localStorage.setItem('rsj_user', JSON.stringify(freshCand));
          } catch (e) {}
        }
        const subList = Array.isArray(subRes?.data?.data)
          ? subRes.data.data
          : (Array.isArray(subRes?.data) ? subRes.data : []);
        if (mounted && subRes?.ok && subList.length > 0) {
          setAllSubmissions(subList);
          const latest = subList[0];
          const catScores = typeof latest.category_scores === 'string' ? JSON.parse(latest.category_scores) : (latest.category_scores || {});
          const topicBreakdown = typeof latest.topic_breakdown === 'string' ? JSON.parse(latest.topic_breakdown) : (latest.topic_breakdown || []);
          const mapped = {
            score: Number(latest.score ?? 0),
            totalMarks: Number(latest.total_marks ?? 100),
            obtainedMarks: Number(latest.obtained_marks ?? latest.score ?? 0),
            accuracy: Number(latest.accuracy ?? latest.score ?? 0),
            correctCount: Number(latest.correct_count ?? 0),
            incorrectCount: Number(latest.incorrect_count ?? 0),
            unansweredCount: Number(latest.unanswered_count ?? 0),
            timeTaken: latest.time_taken || '28 min',
            completedAt: new Date(latest.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            assessmentName: latest.assessment_title || 'Technical Assessment',
            assessmentId: latest.assessment_id,
            categoryScores: catScores,
            topicBreakdown: topicBreakdown,
            sectionsTested: typeof latest.sections_tested === 'string' ? JSON.parse(latest.sections_tested) : (latest.sections_tested || undefined)
          };
          if (setLatestResult) setLatestResult(mapped);
          try {
            localStorage.setItem('rsj_latest_result', JSON.stringify(mapped));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('CandidateAnalyticsPage auto-refresh warning:', err);
      }
    };
    fetchFreshData();
    return () => { mounted = false; };
  }, [setCurrentUser, setLatestResult]);

  useEffect(() => {
    // Launch celebratory confetti if score >= 60
    try {
      const s = latestResult?.score ?? currentUser?.jobReadinessScore ?? 75;
      if (s >= 60) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e) { }
  }, [latestResult, currentUser]);

  // Parse all submissions into structured result objects
  const parsedSubmissions = React.useMemo(() => {
    return (allSubmissions || []).map((sub) => {
      const catScores = typeof sub.category_scores === 'string'
        ? JSON.parse(sub.category_scores)
        : (sub.category_scores || {});
      const topicBreakdown = typeof sub.topic_breakdown === 'string'
        ? JSON.parse(sub.topic_breakdown)
        : (sub.topic_breakdown || []);
      const sectionsTested = typeof sub.sections_tested === 'string'
        ? JSON.parse(sub.sections_tested)
        : (sub.sections_tested || {});

      return {
        id: sub.id,
        assessmentId: sub.assessment_id,
        assessmentName: sub.assessment_title || sub.title || 'Technical Assessment',
        category: sub.category || 'General',
        score: Number(sub.score ?? 0),
        obtainedMarks: Number(sub.obtained_marks ?? sub.score ?? 0),
        totalMarks: Number(sub.total_marks ?? 100),
        accuracy: Number(sub.accuracy ?? sub.score ?? 0),
        correctCount: Number(sub.correct_count ?? 0),
        incorrectCount: Number(sub.incorrect_count ?? 0),
        unansweredCount: Number(sub.unanswered_count ?? 0),
        totalQuestions: (Number(sub.correct_count ?? 0) + Number(sub.incorrect_count ?? 0) + Number(sub.unanswered_count ?? 0)) || 20,
        timeTaken: sub.time_taken || '25 min',
        completedAt: new Date(sub.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        rawCreatedAt: sub.created_at,
        categoryScores: catScores,
        topicBreakdown: topicBreakdown,
        sectionsTested: sectionsTested,
      };
    });
  }, [allSubmissions]);

  // Aggregate composite metrics across ALL written submissions
  const aggregatedData = React.useMemo(() => {
    if (parsedSubmissions.length === 0) return null;

    const compositeCategoryScores = {
      aptitude: Number(currentUser?.aptitudeScore ?? currentUser?.aptitude_score ?? 0),
      reasoning: Number(currentUser?.reasoningScore ?? currentUser?.reasoning_score ?? 0),
      technical: Number(currentUser?.technicalScore ?? currentUser?.technical_score ?? 0),
      verbal: Number(currentUser?.verbalScore ?? currentUser?.verbal_score ?? 0),
      coding: Number(currentUser?.codingScore ?? currentUser?.coding_score ?? 0),
    };

    const compositeSectionsTested = {
      aptitude: Boolean(currentUser?.aptitudeScore || currentUser?.aptitude_score),
      reasoning: Boolean(currentUser?.reasoningScore || currentUser?.reasoning_score),
      technical: Boolean(currentUser?.technicalScore || currentUser?.technical_score),
      verbal: Boolean(currentUser?.verbalScore || currentUser?.verbal_score),
      coding: Boolean(currentUser?.codingScore || currentUser?.coding_score),
    };

    const allTopicsMap = new Map();
    let totalObtainedMarks = 0;
    let totalPossibleMarks = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnanswered = 0;

    const getVal = (cs, catKey) => {
      if (!cs || typeof cs !== 'object') return undefined;
      const target = catKey.toLowerCase();
      for (const [k, v] of Object.entries(cs)) {
        if (k.toLowerCase() === target) return v;
      }
      if (target === 'verbal' || target === 'english') {
        for (const [k, v] of Object.entries(cs)) {
          if (k.toLowerCase() === 'english' || k.toLowerCase() === 'verbal') return v;
        }
      }
      return undefined;
    };

    parsedSubmissions.forEach((sub) => {
      const cs = sub.categoryScores || {};

      ['aptitude', 'reasoning', 'technical', 'verbal', 'coding'].forEach((cat) => {
        const val = getVal(cs, cat);
        if (val !== undefined && val !== null && val !== '') {
          const numVal = Number(val);
          compositeCategoryScores[cat] = Math.max(compositeCategoryScores[cat], numVal);
          compositeSectionsTested[cat] = true;
        }
      });

      if (sub.sectionsTested) {
        Object.keys(sub.sectionsTested).forEach((sec) => {
          if (sub.sectionsTested[sec]) compositeSectionsTested[sec] = true;
        });
      }

      totalObtainedMarks += sub.obtainedMarks;
      totalPossibleMarks += sub.totalMarks;
      totalCorrect += sub.correctCount;
      totalIncorrect += sub.incorrectCount;
      totalUnanswered += sub.unansweredCount;

      (sub.topicBreakdown || []).forEach((t) => {
        if (!t.topic) return;
        const existing = allTopicsMap.get(t.topic);
        if (!existing || (t.score ?? 0) > (existing.score ?? 0)) {
          allTopicsMap.set(t.topic, t);
        }
      });
    });

    const testedCategories = Object.keys(compositeCategoryScores).filter(cat => compositeSectionsTested[cat]);
    let compositeScore = 0;
    if (testedCategories.length > 0) {
      const sum = testedCategories.reduce((acc, cat) => acc + compositeCategoryScores[cat], 0);
      compositeScore = Math.round(sum / testedCategories.length);
    } else {
      compositeScore = Number(currentUser?.jobReadinessScore ?? currentUser?.job_readiness_score ?? (totalPossibleMarks > 0 ? Math.round((totalObtainedMarks / totalPossibleMarks) * 100) : 0));
    }

    return {
      compositeScore,
      compositeCategoryScores,
      compositeSectionsTested,
      allTopics: Array.from(allTopicsMap.values()),
      totalSubmissions: parsedSubmissions.length,
      totalObtainedMarks,
      totalPossibleMarks,
      totalCorrect,
      totalIncorrect,
      totalUnanswered,
    };
  }, [parsedSubmissions, currentUser]);

  // Build dynamic candidate analytics profile from ALL assessment submissions
  const studentData = React.useMemo(() => {
    const defaultData = { ...mockStudent };
    const name = currentUser?.name || mockStudent.name;
    const email = currentUser?.email || mockStudent.email;

    const tenthMarks = currentUser?.tenthMarks ?? currentUser?.tenth_marks ?? 0;
    const twelfthDiplomaMarks = currentUser?.twelfthDiplomaMarks ?? currentUser?.twelfth_diploma_marks ?? 0;
    const graduationPercentage = currentUser?.graduationPercentage ?? currentUser?.graduation_percentage ?? 0;
    const backlogs = currentUser?.backlogs ?? 0;

    const overallScore = aggregatedData?.compositeScore ?? Number(currentUser?.jobReadinessScore ?? currentUser?.job_readiness_score ?? defaultData.overallScore);
    const percentile = Math.min(99, Math.max(15, Math.round(overallScore * 0.95 + 10)));
    const totalStudents = 280;
    const rank = Math.max(1, Math.round(totalStudents * (1 - percentile / 100)));

    const categoryScores = aggregatedData?.compositeCategoryScores ?? {
      aptitude: Number(currentUser?.aptitudeScore ?? currentUser?.aptitude_score ?? defaultData.categoryScores.aptitude),
      reasoning: Number(currentUser?.reasoningScore ?? currentUser?.reasoning_score ?? defaultData.categoryScores.reasoning),
      technical: Number(currentUser?.technicalScore ?? currentUser?.technical_score ?? defaultData.categoryScores.technical),
      verbal: Number(currentUser?.verbalScore ?? currentUser?.verbal_score ?? defaultData.categoryScores.verbal),
      coding: Number(currentUser?.codingScore ?? currentUser?.coding_score ?? defaultData.categoryScores.coding),
    };

    const sectionsTested = aggregatedData?.compositeSectionsTested ?? {
      aptitude: true, reasoning: true, technical: true, verbal: true, coding: true
    };

    const getVal = (cs, catKey) => {
      if (!cs || typeof cs !== 'object') return undefined;
      const target = catKey.toLowerCase();
      for (const [k, v] of Object.entries(cs)) {
        if (k.toLowerCase() === target) return v;
      }
      if (target === 'verbal' || target === 'english') {
        for (const [k, v] of Object.entries(cs)) {
          if (k.toLowerCase() === 'english' || k.toLowerCase() === 'verbal') return v;
        }
      }
      return undefined;
    };

    // Populate real attempt history for Score Trend, Concept Analysis, and Roadmap
    const realAttempts = parsedSubmissions.length > 0
      ? parsedSubmissions.slice().reverse().map((sub, idx) => {
          const cs = sub.categoryScores || {};
          const subTopics = Array.isArray(sub.topicBreakdown) ? sub.topicBreakdown : [];

          const getCatTopics = (catKey) => {
            const lowerCat = catKey.toLowerCase();
            return subTopics
              .filter(t => {
                const tCat = (t.category || '').toLowerCase();
                if (!tCat) return lowerCat === (sub.category || 'general').toLowerCase();
                return tCat === lowerCat || (lowerCat === 'verbal' && tCat === 'english') || (lowerCat === 'english' && tCat === 'verbal');
              })
              .map(t => ({
                name: t.topic || t.name || 'Topic',
                score: Number(t.obtainedMarks ?? t.score ?? 0),
                maxScore: Number(t.totalMarks ?? t.maxScore ?? 100)
              }));
          };

          const aptPct = Number(getVal(cs, 'aptitude') ?? categoryScores.aptitude ?? 0);
          const reaPct = Number(getVal(cs, 'reasoning') ?? categoryScores.reasoning ?? 0);
          const techPct = Number(getVal(cs, 'technical') ?? categoryScores.technical ?? 0);
          const verbPct = Number(getVal(cs, 'verbal') ?? getVal(cs, 'english') ?? categoryScores.verbal ?? 0);
          const codePct = Number(getVal(cs, 'coding') ?? categoryScores.coding ?? 0);

          return {
            id: sub.id || `ATT-${idx + 1}`,
            date: sub.rawCreatedAt ? sub.rawCreatedAt.split('T')[0] : sub.completedAt,
            title: sub.assessmentName,
            totalScore: sub.score,
            categories: {
              aptitude: { score: Math.round((aptPct / 100) * 25), maxScore: 25, topics: getCatTopics('aptitude') },
              reasoning: { score: Math.round((reaPct / 100) * 25), maxScore: 25, topics: getCatTopics('reasoning') },
              technical: { score: Math.round((techPct / 100) * 25), maxScore: 25, topics: getCatTopics('technical') },
              english: { score: Math.round((verbPct / 100) * 25), maxScore: 25, topics: getCatTopics('verbal') },
              verbal: { score: Math.round((verbPct / 100) * 25), maxScore: 25, topics: getCatTopics('verbal') },
              coding: { score: Math.round((codePct / 100) * 25), maxScore: 25, topics: getCatTopics('coding') },
            }
          };
        })
      : defaultData.examAttempts;

    return {
      ...defaultData,
      name,
      email,
      tenthMarks,
      twelfthDiplomaMarks,
      graduationPercentage,
      backlogs,
      overallScore,
      jobReadinessScore: overallScore,
      categoryScores,
      sectionsTested,
      percentile,
      rank,
      examAttempts: realAttempts,
    };
  }, [currentUser, parsedSubmissions, aggregatedData]);

  // Determine currently active result for Test Results & Summary section
  const activeResult = React.useMemo(() => {
    if (selectedSubmissionId === 'all' && aggregatedData && parsedSubmissions.length > 0) {
      return {
        score: aggregatedData.compositeScore,
        totalMarks: aggregatedData.totalPossibleMarks || 100,
        obtainedMarks: aggregatedData.totalObtainedMarks || 0,
        accuracy: Math.round((aggregatedData.totalCorrect / Math.max(1, aggregatedData.totalCorrect + aggregatedData.totalIncorrect)) * 100),
        correctCount: aggregatedData.totalCorrect,
        incorrectCount: aggregatedData.totalIncorrect,
        unansweredCount: aggregatedData.totalUnanswered,
        totalQuestions: (aggregatedData.totalCorrect + aggregatedData.totalIncorrect + aggregatedData.totalUnanswered) || 20,
        timeTaken: 'Combined',
        completedAt: `${parsedSubmissions.length} Assessments Written`,
        assessmentName: `Combined Composite Readiness (${parsedSubmissions.length} Assessments)`,
        categoryScores: aggregatedData.compositeCategoryScores,
        topicBreakdown: aggregatedData.allTopics,
        sectionsTested: aggregatedData.compositeSectionsTested,
        isCombined: true
      };
    }
    const found = parsedSubmissions.find(s => s.id === selectedSubmissionId);
    return found || latestResult;
  }, [selectedSubmissionId, aggregatedData, parsedSubmissions, latestResult]);

  const sectionRefs = {
    results: useRef(null),
    overview: useRef(null),
    concepts: useRef(null),
    companies: useRef(null),
    roadmap: useRef(null),
  };

  const handleNavigate = (section) => {
    setActiveSection(section);
    sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabs = [
    ...(activeResult ? [{ id: 'results', label: 'Test Results & Summary' }] : []),
    { id: 'overview', label: 'Score Overview' },
    { id: 'concepts', label: 'Concept Analysis' },
    { id: 'companies', label: 'Company Eligibility' },
    { id: 'roadmap', label: 'Improvement Roadmap' },
  ];

  const getStatusBadge = (s) => {
    if (s >= 85) return { label: 'Highly Job Ready', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    if (s >= 70) return { label: 'Job Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    if (s >= 50) return { label: 'Developing Competency', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { label: 'Needs Training', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const statusBadge = getStatusBadge(studentData.overallScore);

  return (
    <div className="space-y-8">

      {/* Sticky Tab Sub-Header */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-1.5 shadow-subtle flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigate(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSection === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">

        {/* ASSESSMENT RESULTS & MULTI-ASSESSMENT SELECTOR */}
        {activeResult && (
          <section ref={sectionRefs.results} className="space-y-6">
            {/* Assessment Header Card & Selector */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{activeResult.isCombined ? 'Multi-Assessment Composite View' : 'Assessment Completed & Verified'}</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeResult.assessmentName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {parsedSubmissions.length > 1 && (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 pl-2">View Scorecard:</span>
                    <select
                      value={selectedSubmissionId}
                      onChange={(e) => setSelectedSubmissionId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer"
                    >
                      <option value="all">🌟 Combined Composite Scorecard ({parsedSubmissions.length} Tests)</option>
                      {parsedSubmissions.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          📝 {sub.assessmentName} — {sub.score}% ({sub.completedAt})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics (5 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Score */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Score</span>
                  <span className="text-2xl font-black text-slate-900">{activeResult.score}%</span>
                  <span className="block text-xs font-semibold text-slate-600">
                    {activeResult.obtainedMarks !== undefined && activeResult.totalMarks !== undefined
                      ? `${activeResult.obtainedMarks} / ${activeResult.totalMarks} Marks`
                      : `${activeResult.correctCount} / ${activeResult.totalQuestions} Qs`}
                  </span>
                </div>
              </div>

              {/* Accuracy */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Accuracy</span>
                  <span className="text-2xl font-black text-slate-900">{activeResult.accuracy}%</span>
                  <span className="block text-[11px] text-slate-400 font-medium">Attempted accuracy</span>
                </div>
              </div>

              {/* Correct */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Correct</span>
                  <span className="text-2xl font-black text-emerald-600">{activeResult.correctCount} Qs</span>
                  <span className="block text-[11px] text-slate-400 font-medium">Out of {activeResult.totalQuestions || 20}</span>
                </div>
              </div>

              {/* Incorrect */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Incorrect</span>
                  <span className="text-2xl font-black text-rose-600">{activeResult.incorrectCount} Qs</span>
                  <span className="block text-[11px] text-slate-400 font-medium">{activeResult.unansweredCount || 0} unanswered</span>
                </div>
              </div>

              {/* Time Taken */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Time Taken</span>
                  <span className="text-2xl font-black text-slate-900">{activeResult.timeTaken}</span>
                  <span className="block text-[11px] text-slate-400 font-medium">{activeResult.completedAt}</span>
                </div>
              </div>
            </div>

            {/* Performance Ring & Section Scores */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Readiness Ring & Section Breakdown */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Score</span>
                    <h3 className="text-base font-bold text-slate-900">Job Readiness Score</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                </div>

                <div className="py-2 flex justify-center">
                  <ScoreRing score={activeResult.score} maxScore={100} size={180} />
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Section Score Breakdown</h4>

                  {/* Aptitude */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Aptitude</span>
                      <span className="text-blue-600">{(activeResult?.categoryScores?.aptitude ?? studentData.categoryScores?.aptitude ?? 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeResult?.categoryScores?.aptitude ?? studentData.categoryScores?.aptitude ?? 0)}%` }} />
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Reasoning</span>
                      <span className="text-emerald-600">{(activeResult?.categoryScores?.reasoning ?? studentData.categoryScores?.reasoning ?? 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeResult?.categoryScores?.reasoning ?? studentData.categoryScores?.reasoning ?? 0)}%` }} />
                    </div>
                  </div>

                  {/* Technical */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Technical</span>
                      <span className="text-amber-600">{(activeResult?.categoryScores?.technical ?? studentData.categoryScores?.technical ?? 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeResult?.categoryScores?.technical ?? studentData.categoryScores?.technical ?? 0)}%` }} />
                    </div>
                  </div>

                  {/* Verbal */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">Verbal</span>
                      <span className="text-purple-600">{(activeResult?.categoryScores?.verbal ?? activeResult?.categoryScores?.english ?? studentData.categoryScores?.verbal ?? 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeResult?.categoryScores?.verbal ?? activeResult?.categoryScores?.english ?? studentData.categoryScores?.verbal ?? 0)}%` }} />
                    </div>
                  </div>

                  {/* Coding */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Coding</span>
                      </span>
                      <span className="text-indigo-600">{(activeResult?.categoryScores?.coding ?? studentData.categoryScores?.coding ?? 0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${(activeResult?.categoryScores?.coding ?? studentData.categoryScores?.coding ?? 0)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Topic-Level Performance from Assessment */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exam Concepts</span>
                    <h3 className="text-base font-bold text-slate-900">Topic-Level Performance</h3>
                  </div>
                  <span className="text-xs font-bold text-brand-600 px-2.5 py-1 bg-brand-50 rounded-lg border border-brand-200">
                    {activeResult.topicBreakdown?.length || 0} Topics Included
                  </span>
                </div>

                <div className="space-y-3 pt-2 max-h-[440px] overflow-y-auto pr-1">
                  {activeResult.topicBreakdown?.map((item) => {
                    const sc = item.score ?? 0;
                    const isMastered = sc >= 85;
                    const isStrong = sc >= 70 && sc < 85;
                    const isAverage = sc >= 50 && sc < 70;

                    return (
                      <div key={item.topic} className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2 hover:border-brand-200 transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{item.topic}</span>
                              {item.category && (
                                <span className="text-[9px] font-semibold px-2 py-0.2 rounded bg-slate-200/60 text-slate-600 uppercase">
                                  {item.category}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              {item.obtainedMarks !== undefined && item.totalMarks !== undefined
                                ? `Marks: ${item.obtainedMarks} / ${item.totalMarks}`
                                : `Questions: ${item.correctCount || 0} / ${item.totalQuestions || 1}`}
                              {item.totalQuestions ? ` • ${item.correctCount || 0}/${item.totalQuestions} Qs Correct` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isMastered
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isStrong
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : isAverage
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              {item.status || (isMastered ? 'Mastered' : isStrong ? 'Strong' : isAverage ? 'Average' : 'Needs Review')}
                            </span>
                            <span className="text-sm font-black text-slate-900 min-w-[36px] text-right">{sc}%</span>
                          </div>
                        </div>

                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isMastered
                              ? 'bg-emerald-500'
                              : isStrong
                                ? 'bg-blue-500'
                                : isAverage
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            style={{ width: `${Math.min(100, Math.max(0, sc))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <hr className="border-slate-200/80" />
          </section>
        )}

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
      </div>

      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 font-medium">
        IncuxAI Candidate Analytics Portal • ReadySetJob Platform
      </footer>

      {/* Downloadable Official Candidate Assessment Report Modal */}
      <AssessmentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        candidate={currentUser}
        result={latestResult || {
          score: studentData.overallScore,
          totalMarks: 100,
          obtainedMarks: studentData.overallScore,
          accuracy: studentData.overallScore,
          correctCount: Math.round((studentData.overallScore / 100) * 20),
          incorrectCount: 20 - Math.round((studentData.overallScore / 100) * 20),
          unansweredCount: 0,
          totalQuestions: 20,
          timeTaken: '28 min',
          completedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          assessmentName: 'Comprehensive Job Readiness Assessment',
          categoryScores: studentData.categoryScores,
          topicBreakdown: studentData.examAttempts?.[studentData.examAttempts.length - 1]?.categories?.technical?.topics || []
        }}
        studentData={studentData}
        addToast={addToast}
      />
    </div>
  );
}
