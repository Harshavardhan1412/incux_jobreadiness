import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeviceCheckModal } from '../../components/candidate/DeviceCheckModal';
import { AcademicMarksModal } from '../../components/candidate/AcademicMarksModal';
import {
  ClipboardCheck,
  Clock,
  Award,
  Play,
  RotateCcw,
  Eye,
  Filter,
  Sparkles,
  ChevronRight,
  BookOpen,
  BarChart2,
  CheckCircle2
} from 'lucide-react';

export const AssessmentsListPage = () => {
  const { assessments, startAssessment, setMediaStream, navigateTo, addToast, isAssessmentCompleted, candidateSubmissions } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [targetAsm, setTargetAsm] = useState(null);
  const [isAcademicModalOpen, setIsAcademicModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const handleStartAttempt = (asm) => {
    const userSub = (candidateSubmissions || []).find(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === String(asm.id).trim().toLowerCase());
    const isCompleted = !!userSub || isAssessmentCompleted?.(asm.id) || asm.status === 'Completed';
    if (isCompleted) {
      addToast('You have already completed this assessment. Candidates are permitted to take each assessment only once.', 'warning');
      navigateTo('candidate-analytics');
      return;
    }
    setTargetAsm(asm);
    setIsAcademicModalOpen(true);
  };

  const handleAcademicMarksVerified = () => {
    setIsAcademicModalOpen(false);
    setIsDeviceModalOpen(true);
  };

  const handleDeviceVerified = (stream) => {
    setMediaStream(stream);
    setIsDeviceModalOpen(false);
    if (targetAsm) {
      const userSub = (candidateSubmissions || []).find(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === String(targetAsm.id).trim().toLowerCase());
      const isCompleted = !!userSub || isAssessmentCompleted?.(targetAsm.id) || targetAsm.status === 'Completed';
      if (isCompleted) {
        addToast('You have already completed this assessment. Candidates are permitted to take each assessment only once.', 'warning');
        navigateTo('candidate-analytics');
        return;
      }
      startAssessment(targetAsm.id);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    return selectedCategory === 'All' || a.category === selectedCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-full text-xs font-bold mb-2">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Job Readiness Assessment Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessments & Mock Tests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete all three modules (Aptitude, Reasoning, Technical) to generate your verified Job Readiness Report.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {['All', 'Coding', 'Technical', 'Aptitude', 'Reasoning'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ASSESSMENT CARDS GRID */}
      {filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-12 text-center max-w-md mx-auto my-8 space-y-3">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Assessments Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no active assessments published. Check back soon or contact your portal administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((asm) => {
          const userSub = (candidateSubmissions || []).find(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === String(asm.id).trim().toLowerCase());
          const isCompleted = !!userSub || isAssessmentCompleted?.(asm.id) || asm.status === 'Completed';
          const isInProgress = !isCompleted && asm.status === 'In Progress';
          const displayScore = userSub?.score ?? asm.lastScore ?? asm.score ?? 0;

          return (
            <div
              key={asm.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {asm.category}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isInProgress
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}>
                    {isCompleted ? `Completed • ${displayScore}%` : isInProgress ? 'In Progress' : 'Available'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {asm.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {asm.description}
                </p>

                {/* Progress bar if in progress */}
                {isInProgress && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Progress</span>
                      <span>{asm.progress}% ({asm.completedQuestions}/{asm.totalQuestions})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${asm.progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 my-4 p-2.5 bg-slate-50 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Difficulty</span>
                    <strong className="text-slate-800">{asm.difficulty}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Questions</span>
                    <strong className="text-slate-800">{asm.totalQuestions} Qs</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                    <strong className="text-slate-800">{asm.durationMinutes}m</strong>
                  </div>
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateTo('candidate-analytics')}
                      className="flex-1 py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>View Analysis</span>
                    </button>
                    <div
                      className="py-2.5 px-3 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 cursor-not-allowed select-none"
                      title="Single Attempt Policy: This exam has already been submitted and cannot be retaken."
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">Completed</span>
                    </div>
                  </div>
                ) : isInProgress ? (
                  <button
                    onClick={() => handleStartAttempt(asm)}
                    className="w-full py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Continue Assessment</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartAttempt(asm)}
                    className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Assessment</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Academic Marks Verification Modal */}
      <AcademicMarksModal
        isOpen={isAcademicModalOpen}
        onClose={() => setIsAcademicModalOpen(false)}
        onProceed={handleAcademicMarksVerified}
        assessmentTitle={targetAsm?.title}
      />

      {/* Hardware Device Check Modal */}
      <DeviceCheckModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        onProceed={handleDeviceVerified}
        assessmentTitle={targetAsm?.title}
      />

    </div>
  );
};
