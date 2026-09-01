import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Layers,
  Plus,
  Play,
  Edit2,
  Eye,
  Archive,
  CheckCircle2,
  Clock,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Sparkles,
  BookOpen,
  Filter
} from 'lucide-react';

export const AdminAssessmentsPage = () => {
  const { assessments, addAssessment, questionBank, addToast, startAssessment } = useApp();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [previewAsm, setPreviewAsm] = useState(null);

  // Wizard state
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    category: 'Technical',
    description: '',
    difficulty: 'Medium',
    durationMinutes: 30,
    passingScore: 65,
    selectedQuestionIds: ['q-101', 'q-102', 'q-103', 'q-104'],
    totalQuestions: 20,
    tags: ['DSA', 'Algorithms']
  });

  const steps = [
    { num: 1, name: 'Details' },
    { num: 2, name: 'Question Bank' },
    { num: 3, name: 'Configure' },
    { num: 4, name: 'Duration' },
    { num: 5, name: 'Passing Score' },
    { num: 6, name: 'Preview' },
    { num: 7, name: 'Publish' }
  ];

  const handleToggleQuestionSelection = (id) => {
    if (newAssessment.selectedQuestionIds.includes(id)) {
      setNewAssessment(prev => ({
        ...prev,
        selectedQuestionIds: prev.selectedQuestionIds.filter(qId => qId !== id)
      }));
    } else {
      setNewAssessment(prev => ({
        ...prev,
        selectedQuestionIds: [...prev.selectedQuestionIds, id]
      }));
    }
  };

  const handleFinishPublish = () => {
    if (!newAssessment.title.trim()) {
      addToast('Please enter an assessment title', 'error');
      setWizardStep(1);
      return;
    }

    addAssessment({
      ...newAssessment,
      totalQuestions: Math.max(newAssessment.selectedQuestionIds.length, 15),
      estimatedTimeMin: newAssessment.durationMinutes
    });

    setIsWizardOpen(false);
    setWizardStep(1);
    setNewAssessment({
      title: '',
      category: 'Technical',
      description: '',
      difficulty: 'Medium',
      durationMinutes: 30,
      passingScore: 65,
      selectedQuestionIds: ['q-101', 'q-102'],
      totalQuestions: 20,
      tags: ['DSA', 'Algorithms']
    });
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessments Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Design, schedule, and publish standardized assessments with multi-step authoring.
          </p>
        </div>

        <button
          onClick={() => {
            setWizardStep(1);
            setIsWizardOpen(true);
          }}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assessment Wizard</span>
        </button>
      </div>

      {/* ASSESSMENT CATALOG CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((asm) => (
          <div
            key={asm.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  {asm.category}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {asm.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{asm.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {asm.description}
              </p>

              <div className="grid grid-cols-3 gap-2 my-4 p-3 bg-slate-50 rounded-xl text-center text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Questions</span>
                  <strong className="text-slate-800">{asm.totalQuestions} Qs</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Duration</span>
                  <strong className="text-slate-800">{asm.durationMinutes} min</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Difficulty</span>
                  <strong className="text-slate-800">{asm.difficulty}</strong>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPreviewAsm(asm)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => addToast(`Assessment "${asm.title}" archived`, 'info')}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Archive"
                >
                  <Archive className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => startAssessment(asm.id)}
                className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-brand-200"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Live</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 7-STEP CREATE ASSESSMENT WIZARD MODAL */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="Assessment Authoring Wizard"
        subtitle={`Step ${wizardStep} of 7: ${steps[wizardStep - 1].name}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6 text-xs">
          
          {/* Wizard Step Progress Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 overflow-x-auto gap-2">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  wizardStep === s.num
                    ? 'text-brand-600 font-bold'
                    : wizardStep > s.num
                    ? 'text-emerald-600 font-medium'
                    : 'text-slate-400'
                }`}
                onClick={() => setWizardStep(s.num)}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  wizardStep === s.num
                    ? 'bg-brand-600 text-white'
                    : wizardStep > s.num
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {wizardStep > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline text-[11px]">{s.name}</span>
              </div>
            ))}
          </div>

          {/* STEP 1: ASSESSMENT DETAILS */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">1. Assessment Basic Details</h3>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assessment Title *</label>
                <input
                  type="text"
                  value={newAssessment.title}
                  onChange={(e) => setNewAssessment({ ...newAssessment, title: e.target.value })}
                  placeholder="e.g. Backend Engineering Job Readiness Test"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newAssessment.category}
                    onChange={(e) => setNewAssessment({ ...newAssessment, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Reasoning">Reasoning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Difficulty</label>
                  <select
                    value={newAssessment.difficulty}
                    onChange={(e) => setNewAssessment({ ...newAssessment, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newAssessment.description}
                  onChange={(e) => setNewAssessment({ ...newAssessment, description: e.target.value })}
                  placeholder="Evaluates Core Data Structures, Algorithms, SQL, and OOP proficiency."
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: SELECT QUESTION BANK */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">2. Select Questions from Bank</h3>
                <span className="font-bold text-brand-600">
                  {newAssessment.selectedQuestionIds.length} Questions Selected
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 divide-y divide-slate-100 pr-1">
                {questionBank.map((q) => {
                  const isSelected = newAssessment.selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleToggleQuestionSelection(q.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-brand-50/80 border-brand-400'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 line-clamp-1">{q.question}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span className="font-semibold text-brand-600">{q.category}</span>
                          <span>•</span>
                          <span>{q.topic}</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-brand-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {isSelected ? '✓' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CONFIGURE QUESTIONS */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">3. Configure Question Weightage</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span>Shuffle question order randomly for each candidate:</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Allow candidate to mark questions for review:</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-600" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Enable live code sandbox runner for coding questions:</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-brand-600" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SET DURATION */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">4. Set Assessment Duration</h3>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Time Limit (Minutes)</label>
                <input
                  type="number"
                  value={newAssessment.durationMinutes}
                  onChange={(e) => setNewAssessment({ ...newAssessment, durationMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Candidates will see a live countdown clock during testing.</span>
              </div>
            </div>
          )}

          {/* STEP 5: SET PASSING SCORE */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">5. Set Passing Score & Grading</h3>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Passing Benchmark Percentage (%)</label>
                <input
                  type="number"
                  value={newAssessment.passingScore}
                  onChange={(e) => setNewAssessment({ ...newAssessment, passingScore: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Candidates achieving above this score are flagged as "Job Ready".</span>
              </div>
            </div>
          )}

          {/* STEP 6: PREVIEW */}
          {wizardStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">6. Review Assessment Specification</h3>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Title:</span>
                  <strong className="text-slate-900">{newAssessment.title || 'Untitled Assessment'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <strong className="text-slate-900">{newAssessment.category}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Questions:</span>
                  <strong className="text-brand-600">{newAssessment.selectedQuestionIds.length} Qs</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration:</span>
                  <strong className="text-slate-900">{newAssessment.durationMinutes} Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Passing Score:</span>
                  <strong className="text-slate-900">{newAssessment.passingScore}%</strong>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: PUBLISH */}
          {wizardStep === 7 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Ready to Publish!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Clicking Publish will immediately make this assessment live for all enrolled students and candidates.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold disabled:opacity-30 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {wizardStep < 7 ? (
              <button
                type="button"
                onClick={() => setWizardStep(prev => prev + 1)}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishPublish}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20"
              >
                Publish Assessment
              </button>
            )}
          </div>

        </div>
      </Modal>

      {/* PREVIEW ASSESSMENT MODAL */}
      {previewAsm && (
        <Modal
          isOpen={!!previewAsm}
          onClose={() => setPreviewAsm(null)}
          title={`Assessment Preview: ${previewAsm.title}`}
          subtitle={`${previewAsm.category} • ${previewAsm.difficulty} • ${previewAsm.durationMinutes} min`}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">{previewAsm.description}</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Questions</span>
                <strong className="text-slate-900 text-sm">{previewAsm.totalQuestions}</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Time Limit</span>
                <strong className="text-slate-900 text-sm">{previewAsm.durationMinutes} min</strong>
              </div>
              <div>
                <span className="text-slate-400 block uppercase font-semibold text-[10px]">Passing Score</span>
                <strong className="text-slate-900 text-sm">{previewAsm.passingScore}%</strong>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewAsm(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewAsm(null);
                  startAssessment(previewAsm.id);
                }}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs"
              >
                Launch Live Simulation
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
