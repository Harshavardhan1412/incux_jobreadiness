import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { MediaPreviewWidget } from '../../components/candidate/MediaPreviewWidget';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Flag,
  RotateCcw,
  CheckSquare,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export const AssessmentPage = () => {
  const {
    activeAssessment,
    mediaStream,
    stopMediaStream,
    questionBank,
    assessmentAnswers,
    setAssessmentAnswers,
    markedForReview,
    setMarkedForReview,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    timeRemainingSeconds,
    setTimeRemainingSeconds,
    submitAssessment,
    navigateTo,
    addToast
  } = useApp();

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [showEnterFullscreenModal, setShowEnterFullscreenModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fullscreenExitCountRef = useRef(0);
  const isSubmittedRef = useRef(false);
  const timerRef = useRef(null);

  // Fullscreen Request Helper
  const requestExamFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setShowEnterFullscreenModal(false);
    setShowFullscreenWarning(false);
  };

  const exitExamFullscreenAndStopMedia = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } catch (e) {}
    }
    stopMediaStream();
  };

  const handleAutoSubmit = (reason) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    exitExamFullscreenAndStopMedia();

    submitAssessment(
      assessmentAnswers,
      Math.max(1, Math.round(((activeAssessment?.durationMinutes * 60 || 1800) - timeRemainingSeconds) / 60))
    );
    navigateTo('assessments');
  };

  const handleSubmit = () => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setShowSubmitModal(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    exitExamFullscreenAndStopMedia();

    submitAssessment(
      assessmentAnswers,
      Math.max(1, Math.round(((activeAssessment?.durationMinutes * 60 || 1800) - timeRemainingSeconds) / 60))
    );
    navigateTo('assessments');
  };

  // Fullscreen, Keydown & Tab Switch Violation Listeners
  useEffect(() => {
    requestExamFullscreen();

    const checkTimer = setTimeout(() => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setShowEnterFullscreenModal(true);
      }
    }, 400);

    const handleFullscreenChange = () => {
      const isFS = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );

      if (!isFS && !isSubmittedRef.current && !showEnterFullscreenModal) {
        if (fullscreenExitCountRef.current === 0) {
          fullscreenExitCountRef.current = 1;
          setShowFullscreenWarning(true);
          if (addToast) addToast('⚠️ Warning: Fullscreen mode exited! Exiting once more will auto-submit your exam.', 'warning');
        } else {
          if (addToast) addToast('🚨 Exam Auto-Submitted due to repeated fullscreen exit violation!', 'error');
          handleAutoSubmit('fullscreen_violation');
        }
      }
    };

    const handleVisibilityChange = () => {
      if ((document.hidden || document.visibilityState === 'hidden') && !isSubmittedRef.current) {
        if (addToast) addToast('🚨 Exam Auto-Submitted due to tab switching violation!', 'error');
        handleAutoSubmit('tab_switch_violation');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (!isSubmittedRef.current) {
          if (fullscreenExitCountRef.current === 0) {
            fullscreenExitCountRef.current = 1;
            setShowFullscreenWarning(true);
            if (addToast) addToast('⚠️ Warning: Escape pressed / Fullscreen exit detected! Exiting once more will auto-submit your exam.', 'warning');
          } else {
            if (addToast) addToast('🚨 Exam Auto-Submitted due to Escape key violation!', 'error');
            handleAutoSubmit('fullscreen_violation');
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(checkTimer);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Live Timer Countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const questions = (activeAssessment?.questions && activeAssessment.questions.length > 0)
    ? activeAssessment.questions
    : questionBank;
  const currentQuestion = questions[currentQuestionIndex] || questions[0];
  const totalQuestions = questions.length;

  const handleSelectOption = (optionId) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleToggleReview = () => {
    if (markedForReview.includes(currentQuestion.id)) {
      setMarkedForReview(prev => prev.filter(id => id !== currentQuestion.id));
    } else {
      setMarkedForReview(prev => [...prev, currentQuestion.id]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const answeredCount = Object.keys(assessmentAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const reviewCount = markedForReview.length;

  const isMarked = markedForReview.includes(currentQuestion?.id);
  const selectedOption = assessmentAnswers[currentQuestion?.id];

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      
      {/* DISTRACTION-FREE TOPBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Title & Assessment Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {activeAssessment?.title || 'Technical Assessment'}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                  <span>•</span>
                  <span className="font-semibold text-brand-600">{currentQuestion?.category} / {currentQuestion?.topic}</span>
                </div>
              </div>
            </div>

            {/* Live Countdown Timer & Submit Button */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold shadow-2xs ${
                timeRemainingSeconds < 300
                  ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <Clock className="w-4 h-4 text-slate-500" />
                <span>{formatTime(timeRemainingSeconds)}</span>
              </div>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Submit Assessment
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MAIN QUESTION CARD (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
              
              {/* Question Meta Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 bg-brand-50 text-brand-700 border border-brand-200 rounded-lg text-xs font-bold">
                    Question {currentQuestionIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {currentQuestion?.type || 'Single Choice'}
                  </span>
                  <span className="text-xs text-slate-400">• {currentQuestion?.marks || 4} Marks</span>
                </div>

                <button
                  onClick={handleToggleReview}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isMarked
                      ? 'bg-amber-50 border-amber-300 text-amber-700 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Flag className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  <span>{isMarked ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQuestion?.question}
                </h2>

                {/* Code Snippet if applicable */}
                {currentQuestion?.codeSnippet && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900 text-slate-100 my-4 shadow-md font-mono text-xs sm:text-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-[11px] text-slate-400">
                      <span className="capitalize">{currentQuestion.language || 'javascript'}</span>
                      <button
                        onClick={() => handleCopyCode(currentQuestion.codeSnippet)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 overflow-x-auto leading-relaxed text-emerald-300">
                      <code>{currentQuestion.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQuestion?.options?.map((opt) => {
                  const isSelected = selectedOption === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-500 text-brand-950 shadow-xs ring-1 ring-brand-500'
                          : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-600'
                      }`}>
                        {opt.id}
                      </div>
                      <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* ACTION BAR: Previous, Next, Clear Selection */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => {
                  setAssessmentAnswers(prev => {
                    const copy = { ...prev };
                    delete copy[currentQuestion.id];
                    return copy;
                  });
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear Selection
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestionIndex === totalQuestions - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDEBAR: CAMERA PREVIEW & QUESTION PALETTE (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Live Camera & Mic Status Widget */}
            {mediaStream && (
              <div className="flex justify-end lg:justify-start">
                <MediaPreviewWidget stream={mediaStream} />
              </div>
            )}

            {/* Question Palette Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Question Navigator</h3>
                <p className="text-xs text-slate-500 mt-0.5">Click any number to jump directly to the question.</p>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-slate-200" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-amber-400" />
                  <span>Marked ({reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded ring-2 ring-brand-500 bg-white" />
                  <span>Current</span>
                </div>
              </div>

              {/* Question Number Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAns = !!assessmentAnswers[q.id];
                  const isRev = markedForReview.includes(q.id);
                  const isCur = idx === currentQuestionIndex;

                  let bgClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';

                  if (isRev) {
                    bgClass = 'bg-amber-400 text-amber-950 font-bold';
                  } else if (isAns) {
                    bgClass = 'bg-emerald-500 text-white font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center transition-all relative ${bgClass} ${
                        isCur ? 'ring-2 ring-brand-600 ring-offset-2 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                      {isRev && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full ring-1 ring-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Summary Metrics */}
              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Total Questions:</span>
                  <strong className="text-slate-800">{totalQuestions}</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Total Time:</span>
                  <strong className="text-slate-800">{activeAssessment?.durationMinutes || 30} mins</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Passing Mark:</span>
                  <strong className="text-slate-800">{activeAssessment?.passingScore || 65}%</strong>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit & View AI Analysis</span>
              </button>

            </div>
          </div>

        </div>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Confirm Assessment Submission"
        subtitle="Review your responses before finalizing AI evaluation"
      >
        <div className="space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to finish and submit the <strong>{activeAssessment?.title || 'Technical Assessment'}</strong>? Once submitted, your answers will be locked and processed by the AI evaluation engine.
          </p>

          {/* Submission Summary Table */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Answered</span>
              <span className="text-lg font-bold text-emerald-600">{answeredCount}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Unanswered</span>
              <span className="text-lg font-bold text-slate-700">{unansweredCount}</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">Marked Review</span>
              <span className="text-lg font-bold text-amber-600">{reviewCount}</span>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>You still have {unansweredCount} unanswered questions. You can go back to answer them or submit now.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Resume Assessment
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Submit</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* FULLSCREEN REQUIRED ENTER MODAL */}
      <Modal
        isOpen={showEnterFullscreenModal}
        onClose={() => {}}
        title="🔒 Full-Screen Exam Environment Required"
        subtitle="Anti-cheating & proctoring controls active"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl flex items-start gap-3">
            <BrainCircuit className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-brand-900 text-sm">Exam Environment Rules</h4>
              <p className="text-slate-600 mt-1">
                To guarantee test integrity, this exam requires full-screen mode.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-700 font-semibold">
                <li>Exiting full screen will issue a final warning. Exiting twice auto-submits the test.</li>
                <li>Switching tabs or minimizing the browser will immediately auto-submit the exam.</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={requestExamFullscreen}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enter Full Screen & Start Exam</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* FULLSCREEN EXIT WARNING MODAL (1ST VIOLATION) */}
      <Modal
        isOpen={showFullscreenWarning}
        onClose={() => {}}
        title="⚠️ WARNING: Fullscreen Mode Exited!"
        subtitle="First proctoring violation warning"
      >
        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="font-bold text-rose-900 text-sm">Proctoring Violation Warning!</h4>
              <p className="text-rose-700 mt-1 font-medium">
                You exited full-screen mode during an active assessment.
              </p>
              <div className="mt-3 p-3 bg-white/80 border border-rose-200 rounded-xl font-bold text-rose-800">
                🚨 CRITICAL: Exiting full screen one more time will immediately auto-submit your test and grade your current answers!
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={requestExamFullscreen}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Re-Enter Full Screen & Resume Exam</span>
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
