import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_CANDIDATE,
  INITIAL_ASSESSMENTS,
  INITIAL_QUESTION_BANK,
  INITIAL_CANDIDATES_LIST,
  INITIAL_ADMIN_KPIS,
  INITIAL_RECOMMENDATIONS
} from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & Role
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rsj_user');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATE;
  });

  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('rsj_role');
    return saved || 'candidate'; // 'candidate' | 'admin' | 'guest'
  });

  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('rsj_view');
    return saved || 'dashboard'; // 'dashboard' | 'assessments' | 'take-assessment' | 'results' | 'ai-analysis' | 'performance' | 'recommendations' | 'final-report' | 'signup' | 'login' | 'admin-login' | 'admin-dashboard' | 'admin-candidates' | 'admin-questions' | 'admin-assessments' | 'admin-analytics' | 'admin-reports'
  });

  // State entities
  const [assessments, setAssessments] = useState(() => {
    const saved = localStorage.getItem('rsj_assessments');
    return saved ? JSON.parse(saved) : INITIAL_ASSESSMENTS;
  });

  const [questionBank, setQuestionBank] = useState(() => {
    const saved = localStorage.getItem('rsj_question_bank');
    return saved ? JSON.parse(saved) : INITIAL_QUESTION_BANK;
  });

  const [candidatesList, setCandidatesList] = useState(() => {
    const saved = localStorage.getItem('rsj_candidates_list');
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATES_LIST;
  });

  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);

  // Active Assessment Session
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(18 * 60 + 42); // 18m 42s default
  const [latestResult, setLatestResult] = useState(() => {
    const saved = localStorage.getItem('rsj_latest_result');
    return saved ? JSON.parse(saved) : {
      score: 78,
      totalMarks: 100,
      accuracy: 82,
      correctCount: 16,
      incorrectCount: 4,
      unansweredCount: 0,
      timeTaken: '28 min',
      completedAt: 'Aug 30, 2026',
      assessmentName: 'Technical Assessment',
      categoryScores: {
        aptitude: 82,
        reasoning: 74,
        technical: 78
      },
      topicBreakdown: [
        { topic: 'Arrays & Strings', score: 90, status: 'Mastered' },
        { topic: 'Object-Oriented Programming (OOP)', score: 80, status: 'Strong' },
        { topic: 'Binary Trees & Graph Traversals', score: 72, status: 'Average' },
        { topic: 'DBMS & Transaction Management', score: 65, status: 'Needs Review' },
        { topic: 'SQL Joins & Window Functions', score: 58, status: 'Weak' }
      ],
      strengths: ['Logical reasoning', 'Programming fundamentals', 'Problem solving'],
      weaknesses: ['SQL joins & window queries', 'Quantitative aptitude (Probability)', 'Data structures (Advanced)'],
      recommendedTopics: ['SQL Window Functions', 'Probability & Combinatorics', 'Graph Search Algorithms']
    };
  });

  // Global Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('rsj_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rsj_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('rsj_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('rsj_assessments', JSON.stringify(assessments));
  }, [assessments]);

  useEffect(() => {
    localStorage.setItem('rsj_question_bank', JSON.stringify(questionBank));
  }, [questionBank]);

  useEffect(() => {
    localStorage.setItem('rsj_candidates_list', JSON.stringify(candidatesList));
  }, [candidatesList]);

  useEffect(() => {
    if (latestResult) {
      localStorage.setItem('rsj_latest_result', JSON.stringify(latestResult));
    }
  }, [latestResult]);

  // Navigation Helper
  const navigateTo = (view, payload = null) => {
    if (view === 'take-assessment' && payload) {
      startAssessment(payload);
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Candidate Actions
  const registerCandidate = (formData) => {
    const newCand = {
      ...INITIAL_CANDIDATE,
      id: `cand-${Date.now()}`,
      name: formData.fullName,
      email: formData.email,
      mobile: formData.mobile,
      college: formData.college,
      degree: formData.degree,
      branch: formData.branch,
      graduationYear: formData.graduationYear,
      experienceLevel: formData.experienceLevel,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(newCand);
    setRole('candidate');
    setCandidatesList(prev => [newCand, ...prev]);
    addToast('Account created successfully! Welcome to ReadySetJob.', 'success');
    setCurrentView('dashboard');
  };

  const loginCandidate = (email) => {
    const existing = candidatesList.find(c => c.email.toLowerCase() === email.toLowerCase()) || INITIAL_CANDIDATE;
    setCurrentUser(existing);
    setRole('candidate');
    addToast(`Logged in as ${existing.name}`, 'success');
    setCurrentView('dashboard');
  };

  const loginAdmin = () => {
    setRole('admin');
    addToast('Logged in as Administrator', 'info');
    setCurrentView('admin-dashboard');
  };

  const logout = () => {
    setRole('guest');
    setCurrentView('login');
    addToast('Logged out successfully', 'info');
  };

  // Start / Submit Assessment
  const startAssessment = (assessmentId) => {
    const asm = assessments.find(a => a.id === assessmentId) || assessments[0];
    setActiveAssessment(asm);
    setAssessmentAnswers({});
    setMarkedForReview([]);
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(asm.durationMinutes * 60);
    setCurrentView('take-assessment');
  };

  const submitAssessment = (answers, timeSpentMin = 28) => {
    // Generate calculated score
    const totalQuestions = questionBank.length;
    let correct = 0;
    questionBank.forEach((q, idx) => {
      if (answers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    // Realistic calculation
    const calculatedScore = Math.min(100, Math.round((correct / totalQuestions) * 100)) || 78;
    const accuracy = Math.round((correct / Math.max(1, Object.keys(answers).length)) * 100) || 82;
    const incorrect = Math.max(0, Object.keys(answers).length - correct);

    const result = {
      score: calculatedScore,
      totalMarks: 100,
      accuracy: accuracy,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: Math.max(0, totalQuestions - Object.keys(answers).length),
      timeTaken: `${timeSpentMin} min`,
      completedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assessmentName: activeAssessment?.title || 'Technical Assessment',
      categoryScores: {
        aptitude: 82,
        reasoning: 74,
        technical: calculatedScore
      },
      topicBreakdown: [
        { topic: 'Arrays & Strings', score: 90, status: 'Mastered' },
        { topic: 'Object-Oriented Programming (OOP)', score: 80, status: 'Strong' },
        { topic: 'Binary Trees & Graph Traversals', score: 72, status: 'Average' },
        { topic: 'DBMS & Transaction Management', score: 65, status: 'Needs Review' },
        { topic: 'SQL Joins & Window Functions', score: 58, status: 'Weak' }
      ],
      strengths: ['Logical reasoning', 'Programming fundamentals', 'Problem solving'],
      weaknesses: ['SQL joins & window queries', 'Quantitative aptitude (Probability)', 'Data structures (Advanced)'],
      recommendedTopics: ['SQL Window Functions', 'Probability & Combinatorics', 'Graph Search Algorithms']
    };

    setLatestResult(result);

    // Update candidate score
    setCurrentUser(prev => ({
      ...prev,
      jobReadinessScore: Math.round((prev.jobReadinessScore + calculatedScore) / 2),
      assessmentsCompleted: prev.assessmentsCompleted + 1
    }));

    // Mark assessment completed
    if (activeAssessment) {
      setAssessments(prev => prev.map(a => a.id === activeAssessment.id ? {
        ...a,
        status: 'Completed',
        progress: 100,
        completedQuestions: a.totalQuestions,
        lastScore: calculatedScore
      } : a));
    }

    addToast('Assessment submitted successfully! AI evaluation ready.', 'success');
    setCurrentView('results');
  };

  // Question Bank CRUD
  const addQuestion = (newQ) => {
    const qWithId = {
      ...newQ,
      id: `q-${Date.now()}`
    };
    setQuestionBank(prev => [qWithId, ...prev]);
    addToast('Question added to Question Bank', 'success');
  };

  const updateQuestion = (updatedQ) => {
    setQuestionBank(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
    addToast('Question updated successfully', 'success');
  };

  const deleteQuestion = (id) => {
    setQuestionBank(prev => prev.filter(q => q.id !== id));
    addToast('Question deleted', 'info');
  };

  // Assessment CRUD
  const addAssessment = (newAsm) => {
    const created = {
      ...newAsm,
      id: `asm-${Date.now()}`,
      status: 'Available',
      progress: 0,
      completedQuestions: 0,
      lastScore: null
    };
    setAssessments(prev => [created, ...prev]);
    addToast(`Assessment "${newAsm.title}" published successfully!`, 'success');
  };

  // Candidate CRUD
  const addCandidate = (candData) => {
    const newCand = {
      ...INITIAL_CANDIDATE,
      id: `cand-${Date.now()}`,
      ...candData,
      registeredAt: new Date().toISOString().split('T')[0]
    };
    setCandidatesList(prev => [newCand, ...prev]);
    addToast(`Candidate ${candData.name} added successfully`, 'success');
  };

  const deleteCandidate = (id) => {
    setCandidatesList(prev => prev.filter(c => c.id !== id));
    addToast('Candidate removed', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        role,
        setRole,
        currentView,
        setCurrentView,
        navigateTo,
        assessments,
        questionBank,
        candidatesList,
        recommendations,
        activeAssessment,
        assessmentAnswers,
        setAssessmentAnswers,
        markedForReview,
        setMarkedForReview,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        timeRemainingSeconds,
        setTimeRemainingSeconds,
        latestResult,
        toasts,
        addToast,
        removeToast,
        registerCandidate,
        loginCandidate,
        loginAdmin,
        logout,
        startAssessment,
        submitAssessment,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addAssessment,
        addCandidate,
        deleteCandidate,
        kpis: INITIAL_ADMIN_KPIS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
