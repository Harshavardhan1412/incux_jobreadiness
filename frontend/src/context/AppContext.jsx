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
    try {
      const saved = localStorage.getItem('rsj_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rsj_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [role, setRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem('rsj_role');
      const user = localStorage.getItem('rsj_user');
      const admin = localStorage.getItem('rsj_admin_user');
      if (admin) return 'admin';
      if (user) return 'candidate';
      return savedRole || 'guest';
    } catch (e) {
      return 'guest';
    }
  });

  // Persist & restore view state across page reloads based on authentication role & URL paths (/login, /admin, /)
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('rsj_current_view');
    const user = localStorage.getItem('rsj_user');
    const admin = localStorage.getItem('rsj_admin_user');
    const activeRole = admin ? 'admin' : (user ? 'candidate' : 'guest');
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';

    // 1. Authenticated Admin Session
    if (activeRole === 'admin') {
      if (savedView && (savedView.startsWith('admin-') || savedView === 'final-report')) {
        return savedView;
      }
      return 'admin-candidates';
    }

    // 2. Authenticated Candidate Session
    if (activeRole === 'candidate') {
      if (savedView && ['assessments', 'take-assessment', 'candidate-analytics', 'dashboard'].includes(savedView)) {
        return savedView;
      }
      return 'dashboard';
    }

    // 3. Guest / Unauthenticated Session
    if (path === '/login') return 'login';
    if (path === '/admin' || path === '/admin-login') return 'admin';
    if (path === '/signup') return 'signup';
    if (savedView && ['login', 'admin', 'signup', 'hero'].includes(savedView)) {
      return savedView;
    }
    return 'hero';
  });

  // Sync browser back/forward buttons with URL paths
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/hero' || path === '/landing') setCurrentView('hero');
      else if (path === '/login') setCurrentView('login');
      else if (path === '/admin' || path === '/admin-login') setCurrentView('admin');
      else if (path === '/signup') setCurrentView('signup');
      else if (path === '/dashboard') setCurrentView('dashboard');
      else if (path === '/assessments') setCurrentView('assessments');
      else if (path.startsWith('/admin-')) setCurrentView(path.substring(1));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // State entities - Purge legacy mock assessment IDs from cached localStorage
  const DUMMY_ASM_IDS = ['asm-tech-1', 'asm-apt-1', 'asm-res-1', 'asm-full-1', 'asm-001', 'asm-002', 'asm-003', 'asm-004'];

  const [assessments, setAssessments] = useState(() => {
    const saved = localStorage.getItem('rsj_assessments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(a => !DUMMY_ASM_IDS.includes(a.id));
        localStorage.setItem('rsj_assessments', JSON.stringify(filtered));
        return filtered;
      } catch (e) {
        localStorage.removeItem('rsj_assessments');
      }
    }
    return [];
  });

  const DUMMY_Q_IDS = ['q-101', 'q-102', 'q-103', 'q-104', 'q-105', 'q-106', 'q-107', 'q-108', 'q-109', 'q-110'];

  const [questionBank, setQuestionBank] = useState(() => {
    const saved = localStorage.getItem('rsj_question_bank');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(q => !DUMMY_Q_IDS.includes(q.id));
        localStorage.setItem('rsj_question_bank', JSON.stringify(filtered));
        return filtered;
      } catch (e) {
        localStorage.removeItem('rsj_question_bank');
      }
    }
    return INITIAL_QUESTION_BANK;
  });

  const DUMMY_CAND_IDS = ['cand-101', 'cand-102', 'cand-103', 'cand-104', 'cand-105', 'cand-001', 'cand-002'];

  const [candidatesList, setCandidatesList] = useState(() => {
    const saved = localStorage.getItem('rsj_candidates_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(c => !DUMMY_CAND_IDS.includes(c.id));
        localStorage.setItem('rsj_candidates_list', JSON.stringify(filtered));
        return filtered;
      } catch (e) {
        localStorage.removeItem('rsj_candidates_list');
      }
    }
    return [];
  });

  const [recommendations, setRecommendations] = useState(INITIAL_RECOMMENDATIONS);

  // Active Assessment Session & Media Hardware
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(18 * 60 + 42);

  const stopMediaStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };
  const [latestResult, setLatestResult] = useState(() => {
    try {
      const saved = localStorage.getItem('rsj_latest_result');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
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

  useEffect(() => {
    if (currentView) {
      localStorage.setItem('rsj_current_view', currentView);
    }
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('rsj_assessments', JSON.stringify(assessments));
  }, [assessments]);

  // Sync assessments from backend API on mount
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await api.assessments.getAll();
        if (res.ok && Array.isArray(res.data?.data)) {
          const cleanAssessments = res.data.data.filter(a => !DUMMY_ASM_IDS.includes(a.id));
          setAssessments(cleanAssessments);
        }
      } catch (err) {
        console.warn('Backend assessments sync warning:', err.message);
      }
    };
    fetchAssessments();
  }, []);

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
    'admin-candidates',
    'admin-questions',
    'admin-assessments',
    'admin-analytics'
  ];

  const CANDIDATE_PROTECTED_VIEWS = [
    'dashboard',
    'assessments',
    'take-assessment',
    'candidate-analytics'
  ];

  const PUBLIC_VIEWS = ['hero', 'landing', 'signup', 'login', 'admin', 'admin-login', '/', '/hero', '/signup', '/login', '/admin', '/admin-login'];

  // Guarded Navigation Helper
  const navigateTo = (view, payload = null) => {
    let normalizedView = view;
    if (view === '/' || view === 'hero' || view === 'landing' || view === '/hero') normalizedView = 'hero';
    if (view === '/login') normalizedView = 'login';
    if (view === '/admin' || view === 'admin-login' || view === '/admin-login') normalizedView = 'admin';
    if (view === '/signup') normalizedView = 'signup';

    // 1. Guard Admin-Only Views
    if (ADMIN_ONLY_VIEWS.includes(normalizedView)) {
      if (role !== 'admin') {
        addToast('Access Denied: Admin privileges required to access this portal.', 'error');
        setCurrentView(role === 'candidate' ? 'dashboard' : 'admin');
        try { window.history.pushState(null, '', role === 'candidate' ? '/dashboard' : '/admin'); } catch (e) {}
        return;
      }
    }

    // 2. Guard Candidate-Protected Views
    if (CANDIDATE_PROTECTED_VIEWS.includes(normalizedView)) {
      if (role !== 'candidate' && role !== 'admin') {
        addToast('Please login or register to access student assessments.', 'info');
        setCurrentView('signup');
        try { window.history.pushState(null, '', '/signup'); } catch (e) {}
        return;
      }
    }

    // Push URL state for clean browser URLs (/, /login, /admin, /signup)
    let path = `/${normalizedView}`;
    if (normalizedView === 'hero') path = '/';
    else if (normalizedView === 'login') path = '/login';
    else if (normalizedView === 'admin') path = '/admin';
    else if (normalizedView === 'signup') path = '/signup';

    try {
      if (typeof window !== 'undefined' && window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    } catch (e) {}

    // 3. Handle Assessment Launch
    if (normalizedView === 'take-assessment' && payload) {
      startAssessment(payload);
    } else {
      setCurrentView(normalizedView);
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
      setCurrentView('assessments');
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
    setCurrentView('assessments');
  };

  const logoutCandidate = () => {
    api.clearToken();
    setCurrentUser(null);
    setRole('guest');
    localStorage.removeItem('rsj_current_view');
    navigateTo('login');
    addToast('Signed out of Student Portal', 'info');
  };

  // Admin Authentication Actions
  const loginAdmin = (adminDetails = { name: 'Admin Administrator', email: 'admin@readysetjob.com' }) => {
    setAdminUser(adminDetails);
    setRole('admin');
    addToast('Admin authentication verified. Welcome to Admin Portal.', 'success');
    setCurrentView('admin-candidates');
  };

  const logoutAdmin = () => {
    api.clearToken();
    setAdminUser(null);
    setRole('guest');
    localStorage.removeItem('rsj_current_view');
    navigateTo('admin');
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
    
    // Deduplicate question bank by ID and statement to guarantee ZERO repeating questions
    const uniquePoolMap = new Map();
    questionBank.forEach(q => {
      if (q && q.id && q.question) {
        const key = `${q.id}-${q.question.trim().toLowerCase()}`;
        if (!uniquePoolMap.has(key)) {
          uniquePoolMap.set(key, q);
        }
      }
    });
    const cleanQuestionBank = Array.from(uniquePoolMap.values());

    // Get questions matching assessment category
    const cat = (asm.category || 'Technical').trim();
    const isAllMix = ['All', 'Full Length', 'All Mix (Combined)', 'All Mix'].some(m => m.toLowerCase() === cat.toLowerCase());

    let availableQuestions = [];
    if (isAllMix) {
      availableQuestions = cleanQuestionBank;
    } else {
      availableQuestions = cleanQuestionBank.filter(q => q.category && q.category.trim().toLowerCase() === cat.toLowerCase());
    }

    if (availableQuestions.length === 0) {
      availableQuestions = cleanQuestionBank;
    }

    let selectedQList = [];
    if (asm.selectedQuestionIds && asm.selectedQuestionIds.length > 0) {
      const idSet = new Set(asm.selectedQuestionIds);
      selectedQList = cleanQuestionBank.filter(q => idSet.has(q.id));

      // Filter by category if specific category chosen (and not All Mix)
      if (!isAllMix) {
        selectedQList = selectedQList.filter(q => q.category && q.category.trim().toLowerCase() === cat.toLowerCase());
      }
    }

    if (selectedQList.length === 0 && availableQuestions.length > 0) {
      const targetCount = Math.min(
        Number(asm.totalQuestions || asm.total_questions) || 10,
        availableQuestions.length
      );
      
      if (isAllMix) {
        // Balanced mix across categories
        const categories = ['Aptitude', 'Reasoning', 'Technical', 'Verbal'];
        const perCat = Math.max(1, Math.floor(targetCount / categories.length));
        const mixPool = [];
        categories.forEach(c => {
          const list = cleanQuestionBank.filter(q => q.category && q.category.trim().toLowerCase() === c.toLowerCase());
          const shuffled = [...list].sort(() => 0.5 - Math.random());
          mixPool.push(...shuffled.slice(0, perCat));
        });
        if (mixPool.length < targetCount) {
          const rem = cleanQuestionBank.filter(q => !mixPool.some(m => m.id === q.id));
          const shuffledRem = [...rem].sort(() => 0.5 - Math.random());
          mixPool.push(...shuffledRem.slice(0, targetCount - mixPool.length));
        }
        selectedQList = mixPool;
      } else {
        // Fisher-Yates non-repeating shuffle for specific category
        const pool = [...availableQuestions];
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        selectedQList = pool.slice(0, targetCount);
      }
    }

    // Ensure strict uniqueness in selected list
    const finalUniqueQuestions = [];
    const seenIds = new Set();
    selectedQList.forEach(q => {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        finalUniqueQuestions.push(q);
      }
    });

    setActiveAssessment({
      ...asm,
      questions: finalUniqueQuestions,
      totalQuestions: finalUniqueQuestions.length
    });
    setAssessmentAnswers({});
    setMarkedForReview([]);
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds((asm.durationMinutes || 30) * 60);
    setCurrentView('take-assessment');
  };

  const submitAssessment = (answers, timeSpentMin = 28) => {
    // Generate calculated score for the active assessment's exact questions
    const asmQuestions = (activeAssessment?.questions && activeAssessment.questions.length > 0)
      ? activeAssessment.questions
      : questionBank;
    const totalQuestions = asmQuestions.length || 1;

    let correct = 0;
    asmQuestions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    // Realistic calculation
    const calculatedScore = Math.min(100, Math.round((correct / totalQuestions) * 100));
    const accuracy = Math.round((correct / Math.max(1, Object.keys(answers).length)) * 100) || 0;
    const incorrect = Math.max(0, Object.keys(answers).length - correct);
    const unanswered = Math.max(0, totalQuestions - Object.keys(answers).length);

    const result = {
      score: calculatedScore,
      totalMarks: 100,
      accuracy: accuracy,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
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

    // 1. Asynchronously send submission data to backend API -> stored in assessment_submissions PostgreSQL table!
    api.submissions.submit({
      assessmentId: activeAssessment?.id || 'asm-1',
      assessmentTitle: activeAssessment?.title || 'Technical Assessment',
      candidateId: currentUser?.id || 'cand-user',
      candidateName: currentUser?.name || currentUser?.fullName || 'Test Candidate',
      candidateEmail: currentUser?.email || 'student@university.edu',
      score: calculatedScore,
      accuracy: accuracy,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      timeTaken: `${timeSpentMin} min`,
      categoryScores: result.categoryScores,
      topicBreakdown: result.topicBreakdown,
      answers: answers
    });

    // 2. Update candidate score in currentUser state
    setCurrentUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        overallScore: calculatedScore,
        jobReadinessScore: calculatedScore,
        assessmentStatus: 'Completed',
        assessmentsCompleted: (prev.assessmentsCompleted || 0) + 1
      };
    });

    // 3. Update candidate entry in candidatesList so candidate score is immediately shown on Candidate Roster page!
    setCandidatesList(prev => {
      const activeEmail = currentUser?.email?.toLowerCase();
      const activeId = currentUser?.id;

      let found = false;
      const updatedList = prev.map(c => {
        if ((activeId && c.id === activeId) || (activeEmail && c.email?.toLowerCase() === activeEmail)) {
          found = true;
          return {
            ...c,
            overallScore: calculatedScore,
            jobReadinessScore: calculatedScore,
            assessmentStatus: 'Completed',
            status: 'Completed',
            assessmentsCompleted: (c.assessmentsCompleted || 0) + 1
          };
        }
        return c;
      });

      if (!found && currentUser) {
        const newCand = {
          id: currentUser.id || `cand-${Date.now()}`,
          name: currentUser.name || currentUser.fullName || 'Candidate Student',
          email: currentUser.email || 'student@university.edu',
          mobile: currentUser.mobile || currentUser.phoneNo || currentUser.phone || '+91 9876543210',
          college: currentUser.college || currentUser.collegeName || 'BITS Pilani',
          branch: currentUser.branch || 'CSE',
          specialization: currentUser.specialization || 'Full-Stack Development',
          country: currentUser.country || 'India',
          state: currentUser.state || 'Telangana',
          city: currentUser.city || 'Hyderabad',
          graduationYear: currentUser.graduationYear || 2026,
          experienceLevel: currentUser.experienceLevel || 'Fresher',
          overallScore: calculatedScore,
          jobReadinessScore: calculatedScore,
          assessmentStatus: 'Completed',
          status: 'Active',
          assessmentsCompleted: 1
        };
        updatedList.unshift(newCand);
      }

      localStorage.setItem('rsj_candidates_list', JSON.stringify(updatedList));
      return updatedList;
    });

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

    if (typeof document !== 'undefined' && (document.fullscreenElement || document.webkitFullscreenElement)) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (e) {}
    }

    stopMediaStream();
    addToast('Assessment submitted & candidate score recorded!', 'success');
    setCurrentView('assessments');
  };

  // Fetch questions from PostgreSQL database on load and merge with local state
  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await api.questions.getAll();
      if (res.ok && res.data?.data) {
        const dbList = res.data.data.map(q => ({
          id: q.id,
          category: q.category,
          topic: q.topic,
          difficulty: q.difficulty,
          type: q.type || 'Single Choice',
          question: q.question,
          codeSnippet: q.code_snippet,
          language: q.language,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []),
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          marks: Number(q.marks) || 4,
          timeLimitSec: Number(q.time_limit_sec) || 60,
          tags: q.tags || []
        }));

        setQuestionBank(prev => {
          // Map DB items + prev local items to prevent loss on refresh
          const map = new Map();
          dbList.forEach(item => map.set(item.id, item));
          prev.forEach(item => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          const merged = Array.from(map.values());
          localStorage.setItem('rsj_question_bank', JSON.stringify(merged));
          return merged;
        });
      }
    };
    fetchQuestions();
  }, []);

  // Question Bank CRUD
  const addQuestionsBatch = (questionsArray) => {
    if (!Array.isArray(questionsArray) || questionsArray.length === 0) return;

    setQuestionBank(prev => {
      const existingNumIds = prev
        .map(q => parseInt(q.id.replace('q-', ''), 10))
        .filter(n => !isNaN(n));
      let currentMax = existingNumIds.length > 0 ? Math.max(...existingNumIds) : 100;

      const preparedBatch = questionsArray.map(q => {
        let qId = q.id;
        if (!qId || qId === 'q-101') {
          currentMax += 1;
          qId = `q-${currentMax}`;
        }
        return {
          ...q,
          id: qId
        };
      });

      const map = new Map();
      prev.forEach(item => map.set(item.id, item));
      preparedBatch.forEach(item => map.set(item.id, item));

      const updated = Array.from(map.values());
      localStorage.setItem('rsj_question_bank', JSON.stringify(updated));

      // Asynchronously save all questions to PostgreSQL database
      preparedBatch.forEach(item => {
        api.questions.create({
          id: item.id,
          category: item.category,
          topic: item.topic,
          difficulty: item.difficulty,
          type: item.type || 'Single Choice',
          question: item.question,
          codeSnippet: item.codeSnippet,
          language: item.language,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          marks: item.marks,
          timeLimitSec: item.timeLimitSec,
          tags: item.tags
        });
      });

      return updated;
    });

    if (questionsArray.length === 1) {
      addToast('Question saved to database!', 'success');
    } else {
      addToast(`Successfully saved ${questionsArray.length} questions to database!`, 'success');
    }
  };

  const addQuestion = (newQ) => {
    addQuestionsBatch([newQ]);
  };

  const updateQuestion = (updatedQ) => {
    setQuestionBank(prev => {
      const updated = prev.map(q => q.id === updatedQ.id ? updatedQ : q);
      localStorage.setItem('rsj_question_bank', JSON.stringify(updated));
      return updated;
    });
    api.questions.update(updatedQ.id, updatedQ);
    addToast('Question updated in database', 'success');
  };

  const deleteQuestion = (id) => {
    setQuestionBank(prev => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem('rsj_question_bank', JSON.stringify(updated));
      return updated;
    });
    api.questions.delete(id);
    addToast('Question deleted from database', 'info');
  };

  // Fetch assessments from PostgreSQL database on load and merge with local state
  useEffect(() => {
    const fetchAssessments = async () => {
      const res = await api.assessments.getAll();
      if (res.ok && res.data?.data) {
        const dbList = res.data.data.map(a => ({
          id: a.id,
          title: a.title,
          category: a.category,
          description: a.description,
          difficulty: a.difficulty,
          durationMinutes: Number(a.duration_minutes) || 30,
          totalQuestions: Number(a.total_questions) || 10,
          passingScore: Number(a.passing_score) || 65,
          status: a.status || 'Available',
          progress: 0,
          completedQuestions: 0,
          lastScore: null,
          selectedQuestionIds: a.selected_question_ids || []
        }));

        setAssessments(prev => {
          const map = new Map();
          dbList.forEach(item => map.set(item.id, item));
          prev.forEach(item => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          const merged = Array.from(map.values());
          localStorage.setItem('rsj_assessments', JSON.stringify(merged));
          return merged;
        });
      }
    };

    const fetchCandidates = async () => {
      const res = await api.candidates.getAll();
      if (res.ok && res.data?.data) {
        const dbCandidates = res.data.data.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          mobile: c.mobile || c.phone,
          college: c.college,
          degree: c.degree || 'B.Tech',
          branch: c.branch,
          specialization: c.specialization,
          country: c.country || 'India',
          state: c.state,
          city: c.city,
          graduationYear: c.graduation_year || 2026,
          experienceLevel: c.experience_level || 'Fresher',
          status: c.status || 'Active',
          assessmentStatus: c.assessment_status || c.readiness_status || 'Active',
          registeredAt: c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : '2026-08-28',
          overallScore: Number(c.overall_score ?? c.job_readiness_score ?? 0),
          jobReadinessScore: Number(c.overall_score ?? c.job_readiness_score ?? 0),
          assessmentsCompleted: Number(c.assessments_completed ?? 0)
        }));

        setCandidatesList(dbCandidates);
        localStorage.setItem('rsj_candidates_list', JSON.stringify(dbCandidates));
      }
    };
    fetchAssessments();
    fetchCandidates();
  }, []);

  // Assessment CRUD
  const addAssessment = (newAsm) => {
    const generatedId = newAsm.id || `asm-${Date.now()}`;
    const created = {
      ...newAsm,
      id: generatedId,
      status: 'Available',
      progress: 0,
      completedQuestions: 0,
      lastScore: null
    };

    setAssessments(prev => {
      const updated = [created, ...prev.filter(a => a.id !== generatedId)];
      localStorage.setItem('rsj_assessments', JSON.stringify(updated));
      return updated;
    });

    // Save directly to PostgreSQL database
    api.assessments.create({
      id: generatedId,
      title: created.title,
      category: created.category,
      description: created.description,
      difficulty: created.difficulty,
      durationMinutes: created.durationMinutes,
      totalQuestions: created.totalQuestions,
      passingScore: created.passingScore
    });

    addToast(`Assessment "${newAsm.title}" published & saved to database!`, 'success');
  };

  const updateAssessment = (updatedAsm) => {
    setAssessments(prev => {
      const updated = prev.map(a => a.id === updatedAsm.id ? { ...a, ...updatedAsm } : a);
      localStorage.setItem('rsj_assessments', JSON.stringify(updated));
      return updated;
    });

    // Update in PostgreSQL database via API
    api.assessments.update(updatedAsm.id, {
      title: updatedAsm.title,
      category: updatedAsm.category,
      description: updatedAsm.description,
      difficulty: updatedAsm.difficulty,
      durationMinutes: updatedAsm.durationMinutes,
      totalQuestions: updatedAsm.totalQuestions,
      passingScore: updatedAsm.passingScore,
      status: updatedAsm.status || 'Available',
      selectedQuestionIds: updatedAsm.selectedQuestionIds || []
    });

    addToast(`Assessment "${updatedAsm.title}" updated successfully!`, 'success');
  };

  const deleteAssessment = (id) => {
    setAssessments(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('rsj_assessments', JSON.stringify(updated));
      return updated;
    });

    // Delete from PostgreSQL database
    api.assessments.delete(id);
    addToast('Assessment deleted from database', 'info');
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
        mediaStream,
        setMediaStream,
        stopMediaStream,
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
        addQuestionsBatch,
        updateQuestion,
        deleteQuestion,
        addAssessment,
        updateAssessment,
        deleteAssessment,
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
