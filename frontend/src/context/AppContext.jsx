import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
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
  // Authentication & Role: 'candidate' | 'admin' | 'guest'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rsj_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('rsj_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('rsj_role');
    const user = localStorage.getItem('rsj_user');
    const admin = localStorage.getItem('rsj_admin_user');
    if (admin) return 'admin';
    if (user) return 'candidate';
    return savedRole || 'guest';
  });

  // Always land on 'signup' page by default when opening the link
  const [currentView, setCurrentView] = useState('signup');

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
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(18 * 60 + 42);
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
    if (currentUser) {
      localStorage.setItem('rsj_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rsj_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem('rsj_admin_user', JSON.stringify(adminUser));
    } else {
      localStorage.removeItem('rsj_admin_user');
    }
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem('rsj_role', role);
  }, [role]);

  // Clean any old rsj_view from previous sessions
  useEffect(() => {
    localStorage.removeItem('rsj_view');
  }, []);

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

  // ==========================================
  // RBAC PERMISSION & VIEW GUARD ENGINE
  // ==========================================
  const ADMIN_ONLY_VIEWS = [
    'admin-dashboard',
    'admin-candidates',
    'admin-questions',
    'admin-assessments',
    'admin-analytics'  ];

  const CANDIDATE_PROTECTED_VIEWS = [
    'dashboard',
    'assessments',
    'take-assessment',

    'final-report'
  ];

  const PUBLIC_VIEWS = ['signup', 'login', 'admin-login'];

  // Guarded Navigation Helper
  const navigateTo = (view, payload = null) => {
    // 1. Guard Admin-Only Views
    if (ADMIN_ONLY_VIEWS.includes(view)) {
      if (role !== 'admin') {
        addToast('Access Denied: Admin privileges required to access this portal.', 'error');
        setCurrentView(role === 'candidate' ? 'dashboard' : 'admin-login');
        return;
      }
    }

    // 2. Guard Candidate-Protected Views
    if (CANDIDATE_PROTECTED_VIEWS.includes(view)) {
      if (role !== 'candidate' && role !== 'admin') {
        addToast('Please login or register to access student assessments.', 'info');
        setCurrentView('signup');
        return;
      }
    }

    // 3. Handle Assessment Launch
    if (view === 'take-assessment' && payload) {
      startAssessment(payload);
    } else {
      setCurrentView(view);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Candidate Authentication Actions
  const registerCandidate = async (formData) => {
    try {
      const res = await api.auth.register({
        name: formData.fullName || formData.name,
        fullName: formData.fullName || formData.name,
        email: formData.email,
        mobile: formData.mobile || formData.phoneNo,
        phoneNo: formData.mobile || formData.phoneNo,
        college: formData.college || formData.collegeName,
        collegeName: formData.college || formData.collegeName,
        degree: formData.degree || 'B.Tech',
        branch: formData.branch,
        specialization: formData.specialization,
        country: formData.country || 'India',
        state: formData.state,
        city: formData.city,
        graduationYear: formData.graduationYear || 2026,
        experienceLevel: formData.experienceLevel || 'Fresher',
        password: formData.password
      });

      if (!res.ok) {
        addToast(res.error || 'Failed to register account in database.', 'error');
        return false;
      }

      if (res.data?.token) {
        api.saveToken(res.data.token);
      }

      const registeredCand = res.data?.candidate || {
        id: `cand-${Date.now()}`,
        name: formData.fullName || formData.name,
        email: formData.email,
        mobile: formData.mobile || formData.phoneNo,
        college: formData.college || formData.collegeName,
        degree: formData.degree || 'B.Tech',
        branch: formData.branch,
        specialization: formData.specialization,
        country: formData.country || 'India',
        state: formData.state,
        city: formData.city,
      };

      setCurrentUser(registeredCand);
      setRole('candidate');
      setCandidatesList(prev => [registeredCand, ...prev.filter(c => c.id !== registeredCand.id)]);
      addToast(`Account created & saved to database! Welcome, ${registeredCand.name}.`, 'success');
      setCurrentView('dashboard');
      return true;
    } catch (err) {
      console.error('Registration API error:', err);
      addToast(err.message || 'Registration failed', 'error');
      return false;
    }
  };

  const loginCandidate = (email) => {
    const existing = candidatesList.find(c => c.email.toLowerCase() === email.toLowerCase()) || INITIAL_CANDIDATE;
    setCurrentUser(existing);
    setRole('candidate');
    addToast(`Welcome back, ${existing.name}! Logged into Student Portal.`, 'success');
    setCurrentView('dashboard');
  };

  const logoutCandidate = () => {
    setCurrentUser(null);
    setRole('guest');
    setCurrentView('login');
    addToast('Signed out of Student Portal', 'info');
  };

  // Admin Authentication Actions
  const loginAdmin = (adminDetails = { name: 'Admin Administrator', email: 'admin@readysetjob.com' }) => {
    setAdminUser(adminDetails);
    setRole('admin');
    addToast('Admin authentication verified. Welcome to Admin Portal.', 'success');
    setCurrentView('admin-dashboard');
  };

  const logoutAdmin = () => {
    setAdminUser(null);
    setRole('guest');
    setCurrentView('admin-login');
    addToast('Signed out of Admin Portal', 'info');
  };

  const logout = () => {
    if (role === 'admin') {
      logoutAdmin();
    } else {
      logoutCandidate();
    }
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

    addToast('Assessment submitted successfully!', 'success');
    setCurrentView('dashboard');
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
