import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import { parseQuestionsFromExcel, downloadExcelQuestionTemplate } from '../../utils/excelParser';
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
  Filter,
  Upload,
  Download,
  Trash2
} from 'lucide-react';

export const AdminAssessmentsPage = () => {
  const { assessments, addAssessment, deleteAssessment, questionBank, addQuestion, addQuestionsBatch, addToast, startAssessment } = useApp();

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

  const handleWizardExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const parsedList = await parseQuestionsFromExcel(
        file,
        newAssessment.category || 'Technical',
        'Assessment Questions'
      );

      if (parsedList.length === 0) {
        addToast('No valid questions found in file', 'error');
        return;
      }

      addQuestionsBatch(parsedList);

      const existingNumIds = questionBank
        .map(item => parseInt(item.id.replace('q-', ''), 10))
        .filter(n => !isNaN(n));
      let currentMax = existingNumIds.length > 0 ? Math.max(...existingNumIds) : 100;

      const importedIds = parsedList.map(q => {
        if (q.id && q.id !== 'q-101') return q.id;
        currentMax += 1;
        return `q-${currentMax}`;
      });

      // Automatically select all imported question IDs for this assessment!
      setNewAssessment(prev => ({
        ...prev,
        selectedQuestionIds: Array.from(new Set([...prev.selectedQuestionIds, ...importedIds]))
      }));
    } catch (err) {
      addToast(err.message || 'Failed to parse Excel file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleAutoSelectRandomQuestions = () => {
    const category = (newAssessment.category || 'Technical').trim();
    const targetCount = Number(newAssessment.totalQuestions) || 10;

    // Deduplicate question bank by ID and statement
    const uniquePoolMap = new Map();
    questionBank.forEach(q => {
      if (q && q.id && q.question) {
        const key = `${q.id}-${q.question.trim().toLowerCase()}`;
        if (!uniquePoolMap.has(key)) {
          uniquePoolMap.set(key, q);
        }
      }
    });
    const cleanBank = Array.from(uniquePoolMap.values());

    const isAllMix = ['All', 'Full Length', 'All Mix', 'All Mix (Combined)'].some(m => m.toLowerCase() === category.toLowerCase());

    let available = [];
    if (isAllMix) {
      available = cleanBank;
    } else {
      available = cleanBank.filter(q => q.category && q.category.trim().toLowerCase() === category.toLowerCase());
    }

    if (available.length === 0) {
      addToast(`No questions available in database for category "${category}". Please upload or add ${category} questions to the bank first.`, 'error');
      return;
    }

    let selectedIds = [];

    if (isAllMix) {
      // Balanced mix across categories (Aptitude, Reasoning, Technical, Verbal)
      const categories = ['Aptitude', 'Reasoning', 'Technical', 'Verbal'];
      const perCat = Math.max(1, Math.floor(targetCount / categories.length));
      const mixPool = [];

      categories.forEach(c => {
        const catQList = cleanBank.filter(q => q.category && q.category.trim().toLowerCase() === c.toLowerCase());
        const shuffledCat = [...catQList].sort(() => 0.5 - Math.random());
        mixPool.push(...shuffledCat.slice(0, perCat));
      });

      if (mixPool.length < targetCount) {
        const remaining = cleanBank.filter(q => !mixPool.some(m => m.id === q.id));
        const shuffledRem = [...remaining].sort(() => 0.5 - Math.random());
        mixPool.push(...shuffledRem.slice(0, targetCount - mixPool.length));
      }

      selectedIds = Array.from(new Set(mixPool.map(q => q.id)));
    } else {
      // Single category Fisher-Yates non-repeating shuffle
      const pool = [...available];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const numToPick = Math.min(targetCount, pool.length);
      selectedIds = Array.from(new Set(pool.slice(0, numToPick).map(q => q.id)));
    }

    setNewAssessment(prev => ({
      ...prev,
      selectedQuestionIds: selectedIds
    }));

    addToast(`Auto-selected ${selectedIds.length} unique, non-repeating ${category} questions from DB!`, 'success');
  };

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
                  title="Preview assessment"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteAssessment(asm.id)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                  title="Delete assessment from database"
                >
                  <Trash2 className="w-4 h-4" />
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
                  placeholder="e.g. Aptitude & Reasoning Speed Assessment"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newAssessment.category}
                    onChange={(e) => setNewAssessment({ ...newAssessment, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold"
                  >
                    <option value="Aptitude">Aptitude Only</option>
                    <option value="Reasoning">Reasoning Only</option>
                    <option value="Technical">Technical Only</option>
                    <option value="Verbal">Verbal Only</option>
                    <option value="All Mix">All Mix (Aptitude + Reasoning + Technical + Verbal)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. of Questions *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newAssessment.totalQuestions}
                    onChange={(e) => setNewAssessment({ ...newAssessment, totalQuestions: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold text-slate-900"
                  />
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
                  placeholder="Evaluates quantitative speed, analytical logic, and problem solving."
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: SELECT QUESTION BANK */}
          {wizardStep === 2 && (() => {
            const activeCategory = newAssessment.category || 'Technical';
            const catQuestionsInDb = activeCategory === 'All' || activeCategory === 'Full Length'
              ? questionBank
              : questionBank.filter(q => q.category.toLowerCase() === activeCategory.toLowerCase());

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">2. Questions Assignment</h3>
                  <span className="font-bold text-brand-600 text-xs bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                    {newAssessment.selectedQuestionIds.length > 0 ? `${newAssessment.selectedQuestionIds.length} Questions Sampled` : 'Automatic Random Mode Active'}
                  </span>
                </div>

                {/* Random Category Selector Card */}
                <div className="p-4 bg-brand-50/60 border border-brand-200 rounded-2xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-brand-900">
                        Category: <span className="bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md">{activeCategory}</span>
                        <span className="ml-2 font-normal text-slate-600">({catQuestionsInDb.length} questions available in DB)</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Test will give <strong>{newAssessment.totalQuestions} questions</strong> randomly from <strong>{activeCategory}</strong> in the database.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoSelectRandomQuestions}
                      className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Auto-Pick {newAssessment.totalQuestions} Random Questions</span>
                    </button>
                  </div>
                </div>

                {/* Excel Upload Banner */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-bold">
                    <Upload className="w-4 h-4 text-brand-600" />
                    <span>Upload Questions from Excel (.xlsx) / CSV</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadExcelQuestionTemplate}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3 h-3 text-brand-600" />
                      <span>Download .xlsx Template</span>
                    </button>
                    <label className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-2xs">
                      <Upload className="w-3 h-3" />
                      <span>Upload Excel File</span>
                      <input type="file" accept=".xlsx, .xls, .csv" onChange={handleWizardExcelUpload} className="hidden" />
                    </label>
                  </div>
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
            );
          })()}

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
