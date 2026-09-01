import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../components/common/Modal';
import {
  Database,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Edit2,
  Code2,
  CheckCircle2,
  Tag,
  Clock,
  Award
} from 'lucide-react';

export const AdminQuestionBankPage = () => {
  const { questionBank, addQuestion, updateQuestion, deleteQuestion, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Technical',
    topic: 'Data Structures',
    difficulty: 'Medium',
    type: 'Single Choice',
    question: '',
    codeSnippet: '',
    language: 'javascript',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    explanation: '',
    marks: 4,
    timeLimitSec: 60,
    tags: 'Algorithms, Data Structures'
  });

  const filteredQuestions = useMemo(() => {
    return questionBank.filter(q => {
      const matchSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'All' || q.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
      const matchType = selectedType === 'All' || q.type === selectedType;

      return matchSearch && matchCategory && matchDifficulty && matchType;
    });
  }, [questionBank, searchQuery, selectedCategory, selectedDifficulty, selectedType]);

  const handleCreateQuestion = (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      addToast('Please enter a question description', 'error');
      return;
    }

    const options = formData.type === 'True/False' ? [
      { id: 'A', text: 'True' },
      { id: 'B', text: 'False' }
    ] : [
      { id: 'A', text: formData.optionA || 'Option A' },
      { id: 'B', text: formData.optionB || 'Option B' },
      { id: 'C', text: formData.optionC || 'Option C' },
      { id: 'D', text: formData.optionD || 'Option D' }
    ];

    const newQ = {
      category: formData.category,
      topic: formData.topic,
      difficulty: formData.difficulty,
      type: formData.type,
      question: formData.question,
      codeSnippet: formData.codeSnippet || null,
      language: formData.language,
      options: options,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation || 'Standard conceptual explanation.',
      marks: Number(formData.marks) || 4,
      timeLimitSec: Number(formData.timeLimitSec) || 60,
      tags: formData.tags.split(',').map(t => t.trim())
    };

    addQuestion(newQ);
    setIsAddModalOpen(false);
    setFormData({
      category: 'Technical',
      topic: 'Data Structures',
      difficulty: 'Medium',
      type: 'Single Choice',
      question: '',
      codeSnippet: '',
      language: 'javascript',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      marks: 4,
      timeLimitSec: 60,
      tags: 'Algorithms, Data Structures'
    });
  };

  const handleDuplicate = (q) => {
    const duplicated = {
      ...q,
      question: `[Copy] ${q.question}`
    };
    addQuestion(duplicated);
    addToast('Question duplicated into Question Bank', 'info');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Question Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, author, and curate assessment questions for Aptitude, Reasoning, and Technical tracks.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text, topic, ID..."
              className="w-full pl-10 pr-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Categories</option>
            <option value="Aptitude">Aptitude</option>
            <option value="Reasoning">Reasoning</option>
            <option value="Technical">Technical</option>
          </select>

          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Question Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 text-xs rounded-xl border border-slate-200 outline-none text-slate-700"
          >
            <option value="All">All Question Types</option>
            <option value="Single Choice">Single Choice</option>
            <option value="Code Snippet">Code Snippet</option>
            <option value="True/False">True/False</option>
          </select>

        </div>
      </div>

      {/* QUESTIONS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Question</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Topic</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {q.id}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 truncate">{q.question}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {q.tags?.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 font-medium">#{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800">{q.category}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {q.topic}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {q.type}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewQuestion(q)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 transition-colors"
                        title="Preview question"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(q)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Duplicate question"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteQuestion(q.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD QUESTION MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Question to Bank"
        subtitle="Create structured multiple-choice, coding, or true/false assessment questions"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              >
                <option value="Technical">Technical</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Reasoning">Reasoning</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Topic *</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Binary Search Trees"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Difficulty *</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Question Type *</label>
            <div className="flex gap-2">
              {['Single Choice', 'Code Snippet', 'True/False'].map(t => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                    formData.type === t
                      ? 'bg-brand-50 border-brand-500 text-brand-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Question Statement *</label>
            <textarea
              rows={2}
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="e.g. Which algorithmic paradigm does Dijkstra's shortest path algorithm use?"
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-brand-500 outline-none"
            />
          </div>

          {/* Technical Code Snippet */}
          {formData.type === 'Code Snippet' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700">Code Snippet</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 text-[11px]"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <textarea
                rows={3}
                value={formData.codeSnippet}
                onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                placeholder="// Enter code snippet here"
                className="w-full p-3 bg-slate-900 text-emerald-400 font-mono rounded-xl border border-slate-700 outline-none"
              />
            </div>
          )}

          {/* Options */}
          {formData.type !== 'True/False' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Option A</label>
                <input
                  type="text"
                  value={formData.optionA}
                  onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
                  placeholder="Option A description"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Option B</label>
                <input
                  type="text"
                  value={formData.optionB}
                  onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
                  placeholder="Option B description"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Option C</label>
                <input
                  type="text"
                  value={formData.optionC}
                  onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
                  placeholder="Option C description"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Option D</label>
                <input
                  type="text"
                  value={formData.optionD}
                  onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
                  placeholder="Option D description"
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              Options will be automatically set to: <strong>A. True</strong> and <strong>B. False</strong>
            </div>
          )}

          {/* Correct Answer & Marks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Correct Answer</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none font-bold"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                {formData.type !== 'True/False' && (
                  <>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Marks</label>
              <input
                type="number"
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Time Limit (Sec)</label>
              <input
                type="number"
                value={formData.timeLimitSec}
                onChange={(e) => setFormData({ ...formData, timeLimitSec: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Explanation & Solution</label>
            <textarea
              rows={2}
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explanation shown after test submission"
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Question
            </button>
          </div>
        </form>
      </Modal>

      {/* PREVIEW QUESTION MODAL */}
      {previewQuestion && (
        <Modal
          isOpen={!!previewQuestion}
          onClose={() => setPreviewQuestion(null)}
          title={`Question Preview: ${previewQuestion.id}`}
          subtitle={`${previewQuestion.category} • ${previewQuestion.topic} • ${previewQuestion.difficulty}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm leading-relaxed">{previewQuestion.question}</h3>
              {previewQuestion.codeSnippet && (
                <pre className="mt-3 p-3 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto font-mono text-[11px]">
                  <code>{previewQuestion.codeSnippet}</code>
                </pre>
              )}
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-400 uppercase text-[10px]">Options</span>
              {previewQuestion.options?.map(opt => (
                <div
                  key={opt.id}
                  className={`p-3 rounded-xl border flex items-center gap-3 ${
                    opt.id === previewQuestion.correctAnswer
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-slate-200 flex items-center justify-center text-xs font-bold">
                    {opt.id}
                  </span>
                  <span>{opt.text}</span>
                  {opt.id === previewQuestion.correctAnswer && (
                    <span className="ml-auto text-[10px] uppercase font-bold text-emerald-600">Correct Answer</span>
                  )}
                </div>
              ))}
            </div>

            {previewQuestion.explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <span className="font-bold block text-[10px] uppercase mb-1">Explanation:</span>
                <p>{previewQuestion.explanation}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewQuestion(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
