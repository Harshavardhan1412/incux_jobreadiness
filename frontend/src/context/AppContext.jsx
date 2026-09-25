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
import { isCodingQuestion } from '../utils/questionUtils';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & Role: 'candidate' | 'admin' | 'guest'
  // VULN-004 fix: Do NOT read access token from localStorage.
  // User objects (non-secret metadata) may still be stored in localStorage for UX purposes.
  // The actual access token lives in memory only; session is rehydrated via HttpOnly cookie on mount.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Clean up any stale rsj_token that may have been saved by a previous version
      localStorage.removeItem('rsj_token');
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
      const admin = localStorage.getItem('rsj_admin_user');
      const user = localStorage.getItem('rsj_user');
      const savedRole = localStorage.getItem('rsj_role');
      // Optimistically restore role from saved metadata (validateSession will correct this if invalid)
      if (admin || savedRole === 'admin') return 'admin';
      if (user || savedRole === 'candidate') return 'candidate';
      return 'guest';
    } catch (e) {
      return 'guest';
    }
  });

  // Persist & restore view state across page reloads based on authentication role & URL paths (/login, /admin, /)
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('rsj_current_view');
    const user = localStorage.getItem('rsj_user');
    const admin = localStorage.getItem('rsj_admin_user');
    const savedRole = localStorage.getItem('rsj_role');
    // Use saved role metadata (not access token) to infer initial role for view routing
    // validateSession will correct the actual auth state after mount
    const activeRole = (admin || savedRole === 'admin') ? 'admin' : (user || savedRole === 'candidate' ? 'candidate' : 'guest');
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';

    // 1. Direct Public Open Paths
    if (path === '/' || path === '/hero' || path === '/landing') {
      return 'hero';
    }
    if (path === '/login') {
      return 'login';
    }
    if (path === '/admin' || path === '/admin-login') {
      return 'admin';
    }
    if (path === '/signup') {
      return 'signup';
    }

    // 2. Candidate Protected Routes (Must sign in first!)
    if (path === '/candidate-analytics' || path === '/results' || path === '/dashboard' || path === '/assessments') {
      if (activeRole === 'guest') {
        try {
          localStorage.setItem('rsj_post_login_redirect', path === '/results' ? 'candidate-analytics' : path.substring(1));
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.replaceState(null, '', '/login');
          }
        } catch (e) {}
        return 'login';
      }
      return path === '/results' ? 'candidate-analytics' : path.substring(1);
    }

    // 3. Admin Protected Routes (Must sign in as admin first!)
    if (path.startsWith('/admin-')) {
      if (activeRole !== 'admin') {
        try {
          if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
            window.history.replaceState(null, '', '/admin');
          }
        } catch (e) {}
        return 'admin';
      }
      return path.substring(1);
    }

    // 4. Saved view fallback for authenticated roles
    if (activeRole === 'admin') {
      if (savedView && savedView.startsWith('admin-')) {
        return savedView;
      }
      return 'admin-candidates';
    }

    if (activeRole === 'candidate') {
      if (savedView === 'results') return 'candidate-analytics';
      if (savedView && ['assessments', 'take-assessment', 'candidate-analytics', 'dashboard'].includes(savedView)) {
        return savedView;
      }
      return 'dashboard';
    }

    // 5. Guest fallback
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
      else if (path === '/candidate-analytics' || path === '/results') setCurrentView('candidate-analytics');
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
        const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.data) ? parsed.data : []);
        const filtered = list.filter(c => !DUMMY_CAND_IDS.includes(c?.id));
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

  const sanitizeResultScores = (res) => {
    if (!res || typeof res !== 'object') return res;
    const catScores = { ...(res.categoryScores || {}) };
    const topics = Array.isArray(res.topicBreakdown) ? res.topicBreakdown : [];
    const hasCodingTopic = topics.some(t => {
      const cat = (t.category || '').toLowerCase().trim();
      const top = (t.topic || '').toLowerCase().trim();
      return cat.includes('code') || cat.includes('prog') || (cat === '' && top.includes('code'));
    });
    const codingTested = res.sectionsTested ? Boolean(res.sectionsTested.coding) : hasCodingTopic;
    if (!codingTested && catScores.coding !== undefined) {
      catScores.coding = 0;
    }
    return {
      ...res,
      categoryScores: catScores,
      sectionsTested: res.sectionsTested || {
        aptitude: Boolean(catScores.aptitude),
        reasoning: Boolean(catScores.reasoning),
        technical: Boolean(catScores.technical),
        verbal: Boolean(catScores.verbal || catScores.english),
        coding: codingTested
      }
    };
  };

  const [latestResult, setLatestResult] = useState(() => {
    try {
      const saved = localStorage.getItem('rsj_latest_result');
      if (saved) return sanitizeResultScores(JSON.parse(saved));
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

  const [candidateSubmissions, setCandidateSubmissions] = useState(() => {
    try {
      const saved = localStorage.getItem('rsj_candidate_submissions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const isAssessmentCompleted = (asmId) => {
    if (!asmId) return false;
    const targetId = String(asmId).trim().toLowerCase();
    return (candidateSubmissions || []).some(
      s => {
        const subAsmId = String(s.assessment_id || s.assessmentId || '').trim().toLowerCase();
        return subAsmId === targetId;
      }
    );
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rsj_candidate_submissions', JSON.stringify(candidateSubmissions));
    } catch (e) {}
  }, [candidateSubmissions]);

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

  // Validate and rehydrate session on startup using HttpOnly refresh cookie
  // VULN-004 fix: Do NOT read access token from localStorage — use /auth/refresh via HttpOnly cookie
  useEffect(() => {
    const validateSession = async () => {
      try {
        // Step 1: Rehydrate access token via refresh cookie (no localStorage read)
        await api.auth.refresh();

        // Step 2: Fetch the current user's profile with the fresh token
        const res = await api.auth.me();
        if (res.ok && res.data) {
          if (res.data.role === 'candidate' && res.data.candidate) {
            setCurrentUser(res.data.candidate);
            setRole('candidate');
            // Synchronize candidate submissions from DB
            try {
              const subRes = await api.submissions.my();
              const subList = Array.isArray(subRes?.data?.data)
                ? subRes.data.data
                : (Array.isArray(subRes?.data) ? subRes.data : []);
              if (subRes.ok && Array.isArray(subList)) {
                setCandidateSubmissions(subList);
                if (subList.length > 0) {
                  const latest = subList[0];
                  const mappedResult = sanitizeResultScores({
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
                    categoryScores: typeof latest.category_scores === 'string' ? JSON.parse(latest.category_scores) : (latest.category_scores || {}),
                    topicBreakdown: typeof latest.topic_breakdown === 'string' ? JSON.parse(latest.topic_breakdown) : (latest.topic_breakdown || []),
                  });
                  setLatestResult(mappedResult);
                  try {
                    localStorage.setItem('rsj_latest_result', JSON.stringify(mappedResult));
                  } catch (e) {}
                }
              }
            } catch (subErr) {
              console.warn('Could not sync latest candidate submission:', subErr.message);
            }
          } else if (res.data.role === 'admin' && res.data.user) {
            setAdminUser(res.data.user);
            setRole('admin');
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token is definitively expired or invalid
          api.clearToken();
          setCurrentUser(null);
          setAdminUser(null);
          setRole('guest');
          try {
            localStorage.removeItem('rsj_user');
            localStorage.removeItem('rsj_admin_user');
            localStorage.removeItem('rsj_role');
          } catch (e) {}
        }
      } catch (err) {
        // Refresh failed (no cookie or expired) — user is not logged in
        api.clearToken();
        setCurrentUser(null);
        setAdminUser(null);
        setRole('guest');
        console.info('No active session:', err.message);
      }
    };
    validateSession();
  }, []);

  // Continuously ensure candidate submissions and profile are synced with PostgreSQL database
  useEffect(() => {
    let isMounted = true;
    const syncSubmissions = async () => {
      if (currentUser && role === 'candidate') {
        try {
          // VULN-004: token is now in memory only — api.auth.me() uses the in-memory token automatically
          const meRes = await api.auth.me();
          if (isMounted && meRes?.ok && meRes.data?.candidate) {
            const freshCand = meRes.data.candidate;
            setCurrentUser(freshCand);
            try {
              localStorage.setItem('rsj_user', JSON.stringify(freshCand));
            } catch (e) {}
          }

          const subRes = await api.submissions.my();
          const subList = Array.isArray(subRes?.data?.data)
            ? subRes.data.data
            : (Array.isArray(subRes?.data) ? subRes.data : []);
          if (isMounted && subRes.ok && Array.isArray(subList)) {
            setCandidateSubmissions(subList);
            if (subList.length > 0) {
              const latest = subList[0];
              const mappedResult = sanitizeResultScores({
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
                categoryScores: typeof latest.category_scores === 'string' ? JSON.parse(latest.category_scores) : (latest.category_scores || {}),
                topicBreakdown: typeof latest.topic_breakdown === 'string' ? JSON.parse(latest.topic_breakdown) : (latest.topic_breakdown || []),
              });
              setLatestResult(mappedResult);
              try {
                localStorage.setItem('rsj_latest_result', JSON.stringify(mappedResult));
              } catch (e) {}
            }
          }
        } catch (e) {}
      }
    };
    syncSubmissions();
    return () => { isMounted = false; };
  }, [currentUser?.id, currentUser?.email, role]);

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
    'candidate-analytics',
  ];

  const PUBLIC_VIEWS = [
    'hero', 'landing', 'signup', 'login', 'admin', 'admin-login',
    '/', '/hero', '/signup', '/login', '/admin', '/admin-login'
  ];

  // Guarded Navigation Helper
  const navigateTo = (view, payload = null) => {
    let normalizedView = view;
    if (view === 'results' || view === '/results') normalizedView = 'candidate-analytics';
    if (view === '/' || view === 'hero' || view === 'landing' || view === '/hero') normalizedView = 'hero';
    if (view === '/login') normalizedView = 'login';
    if (view === '/admin' || view === 'admin-login' || view === '/admin-login') normalizedView = 'admin';
    if (view === '/signup') normalizedView = 'signup';

    // 1. Guard Admin-Only Views
    if (ADMIN_ONLY_VIEWS.includes(normalizedView)) {
      if (role !== 'admin') {
        addToast('Admin sign in required to access management controls.', 'info');
        setCurrentView('admin');
        try { window.history.pushState(null, '', '/admin'); } catch (e) {}
        return;
      }
    }

    // 2. Guard Candidate-Protected Views
    if (CANDIDATE_PROTECTED_VIEWS.includes(normalizedView)) {
      if (role !== 'candidate' && role !== 'admin') {
        addToast('Please sign in to access candidate analytics.', 'info');
        try {
          localStorage.setItem('rsj_post_login_redirect', normalizedView);
        } catch (e) {}
        setCurrentView('login');
        try { window.history.pushState(null, '', '/login'); } catch (e) {}
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

  const loginCandidate = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (!res.ok) {
        const errMsg = res.error || 'Invalid email or password.';
        addToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      if (res.data?.token) {
        api.saveToken(res.data.token);
      }

      const cand = res.data?.candidate || { email, name: email.split('@')[0] };
      setCurrentUser(cand);
      setRole('candidate');
      try {
        const subRes = await api.submissions.my();
        const subList = Array.isArray(subRes?.data?.data)
          ? subRes.data.data
          : (Array.isArray(subRes?.data) ? subRes.data : []);
        if (subRes.ok && Array.isArray(subList)) {
          setCandidateSubmissions(subList);
          if (subList.length > 0) {
            const latest = subList[0];
            const mappedResult = sanitizeResultScores({
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
              categoryScores: typeof latest.category_scores === 'string' ? JSON.parse(latest.category_scores) : (latest.category_scores || {}),
              topicBreakdown: typeof latest.topic_breakdown === 'string' ? JSON.parse(latest.topic_breakdown) : (latest.topic_breakdown || []),
            });
            setLatestResult(mappedResult);
            try {
              localStorage.setItem('rsj_latest_result', JSON.stringify(mappedResult));
            } catch (e) {}
          }
        }
      } catch (e) {}
      addToast(`Welcome back, ${cand.name || 'Candidate'}! Logged into Student Portal.`, 'success');
      const redirectTarget = localStorage.getItem('rsj_post_login_redirect');
      if (redirectTarget) {
        localStorage.removeItem('rsj_post_login_redirect');
        setCurrentView(redirectTarget);
        try { window.history.pushState(null, '', `/${redirectTarget}`); } catch (e) {}
      } else {
        setCurrentView('assessments');
      }
      return { success: true };
    } catch (err) {
      console.error('Candidate login error:', err);
      const msg = err.message || 'Login failed.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logoutCandidate = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.warn('Backend candidate logout notice:', e.message);
    }
    api.clearToken();
    setCurrentUser(null);
    setRole('guest');
    setCandidateSubmissions([]);
    try {
      localStorage.removeItem('rsj_user');
      localStorage.removeItem('rsj_role');
      localStorage.removeItem('rsj_candidate_submissions');
      localStorage.removeItem('rsj_current_view');
      localStorage.removeItem('rsj_latest_result');
      localStorage.removeItem('rsj_post_login_redirect');
    } catch (e) {}
    setCurrentView('login');
    try {
      if (typeof window !== 'undefined') window.history.pushState(null, '', '/login');
    } catch (e) {}
    addToast('Signed out of Student Portal', 'info');
  };

  // Admin Authentication Actions
  const loginAdmin = async (email, password) => {
    try {
      const res = await api.auth.adminLogin({ email, password });
      if (!res.ok) {
        const errMsg = res.error || 'Invalid admin credentials.';
        addToast(errMsg, 'error');
        return { success: false, error: errMsg };
      }

      if (res.data?.token) {
        api.saveToken(res.data.token);
      }

      const admin = res.data?.admin || { email, role: 'admin' };
      setAdminUser(admin);
      setRole('admin');
      addToast(`Welcome, Admin! Access granted to Recruiter Console.`, 'success');
      setCurrentView('admin-candidates');
      return { success: true };
    } catch (err) {
      console.error('Admin login error:', err);
      const msg = err.message || 'Admin login failed.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logoutAdmin = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.warn('Backend admin logout notice:', e.message);
    }
    api.clearToken();
    setAdminUser(null);
    setRole('guest');
    try {
      localStorage.removeItem('rsj_admin_user');
      localStorage.removeItem('rsj_role');
      localStorage.removeItem('rsj_current_view');
    } catch (e) {}
    setCurrentView('admin');
    try {
      if (typeof window !== 'undefined') window.history.pushState(null, '', '/admin');
    } catch (e) {}
    addToast('Signed out of Recruiter Console', 'info');
  };

  const logout = async () => {
    if (role === 'admin') {
      await logoutAdmin();
    } else {
      await logoutCandidate();
    }
  };

  // Start / Submit Assessment
  const startAssessment = async (assessmentId) => {
    const asm = assessments.find(a => a.id === assessmentId) || assessments[0];
    const targetId = asm?.id || assessmentId;

    // Single Attempt Enforcement: Candidates can write each exam only once!
    if (isAssessmentCompleted(targetId)) {
      addToast('You have already completed this assessment. Candidates are permitted to take each assessment only once.', 'warning');
      navigateTo('candidate-analytics');
      return;
    }

    // Try fetching authoritative assessment questions from backend first (without answer keys)
    let loadedFromApi = [];
    if (targetId) {
      try {
        const qRes = await api.assessments.getQuestions(targetId);
        if (qRes.ok && Array.isArray(qRes.data?.data) && qRes.data.data.length > 0) {
          loadedFromApi = qRes.data.data.map(q => ({
            id: q.question_id || q.id,
            category: q.category,
            topic: q.topic,
            difficulty: q.difficulty,
            type: q.type || 'Single Choice',
            question: q.question,
            codeSnippet: q.code_snippet,
            language: q.language,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []),
            test_cases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases) : (q.test_cases || []),
            starter_templates: typeof q.starter_templates === 'string' ? JSON.parse(q.starter_templates) : (q.starter_templates || null),
            constraints: q.constraints,
            marks: Number(q.marks) > 0 ? Number(q.marks) : 1,
            timeLimitSec: Number(q.time_limit_sec) || 60,
            tags: q.tags || []
          }));
        }
      } catch (err) {
        // Fallback to local pool below
      }
    }

    let finalUniqueQuestions = [];

    if (loadedFromApi.length > 0) {
      finalUniqueQuestions = loadedFromApi;
    } else {
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
      const isCodingCat = cat.toLowerCase() === 'coding';

      let availableQuestions = [];
      if (isCodingCat) {
        availableQuestions = cleanQuestionBank.filter(isCodingQuestion);
      } else if (isAllMix) {
        // All Mix: strictly non-coding objective MCQs across all 4 pillars
        availableQuestions = cleanQuestionBank.filter(q => !isCodingQuestion(q));
      } else {
        // Sectional MCQ assessment: strictly only questions matching this category and NOT coding
        availableQuestions = cleanQuestionBank.filter(q => q.category && q.category.trim().toLowerCase() === cat.toLowerCase() && !isCodingQuestion(q));
      }

      if (availableQuestions.length === 0) {
        availableQuestions = isCodingCat
          ? cleanQuestionBank.filter(isCodingQuestion)
          : cleanQuestionBank.filter(q => !isCodingQuestion(q));
      }

      let selectedQList = [];
      if (asm.selectedQuestionIds && asm.selectedQuestionIds.length > 0) {
        const idSet = new Set(asm.selectedQuestionIds);
        selectedQList = cleanQuestionBank.filter(q => idSet.has(q.id));
        // Strictly enforce track isolation on pre-selected question IDs
        if (isCodingCat) {
          selectedQList = selectedQList.filter(isCodingQuestion);
        } else {
          // Both Sectional and All Mix strictly exclude coding questions
          selectedQList = selectedQList.filter(q => !isCodingQuestion(q));
        }
      }

      if (selectedQList.length === 0 && availableQuestions.length > 0) {
        const targetCount = Math.min(
          Number(asm.totalQuestions || asm.total_questions) || 5,
          availableQuestions.length
        );
        
        if (isAllMix) {
          // Balanced mix across categories
          const categories = ['Aptitude', 'Reasoning', 'Technical', 'Verbal'];
          const perCat = Math.max(1, Math.floor(targetCount / categories.length));
          const mixPool = [];
          categories.forEach(c => {
            const list = cleanQuestionBank.filter(q => q.category && q.category.trim().toLowerCase() === c.toLowerCase() && !isCodingQuestion(q));
            const shuffled = [...list].sort(() => 0.5 - Math.random());
            mixPool.push(...shuffled.slice(0, perCat));
          });
          if (mixPool.length < targetCount) {
            const rem = cleanQuestionBank.filter(q => !mixPool.some(m => m.id === q.id) && !isCodingQuestion(q));
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
      const seenIds = new Set();
      selectedQList.forEach(q => {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          finalUniqueQuestions.push(q);
        }
      });
    }

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

  const submitAssessment = async (answers, timeSpentMin = 28, metadata = {}) => {
    // Generate calculated score for the active assessment's exact questions
    const asmQuestions = (activeAssessment?.questions && activeAssessment.questions.length > 0)
      ? activeAssessment.questions
      : questionBank;
    const totalQuestions = asmQuestions.length || 1;

    let totalPossibleMarks = 0;
    let totalObtainedMarks = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const categoryStats = {};
    const topicStats = {};

    asmQuestions.forEach((q) => {
      const qMarks = Number(q.marks) > 0 ? Number(q.marks) : 1;
      const userAns = answers[q.id];
      const isCoding = isCodingQuestion(q) || String(q.type || '').toLowerCase() === 'coding' || (typeof userAns === 'object' && userAns !== null);
      const cat = isCoding ? 'Coding' : (q.category || 'Technical').trim();
      const top = (q.topic || 'General').trim();
      const correctAns = (q.correctAnswer || '').trim().toUpperCase();

      totalPossibleMarks += qMarks;

      if (!categoryStats[cat]) {
        categoryStats[cat] = { totalMarks: 0, obtainedMarks: 0, totalQuestions: 0, correctCount: 0 };
      }
      categoryStats[cat].totalMarks += qMarks;
      categoryStats[cat].totalQuestions += 1;

      if (!topicStats[top]) {
        topicStats[top] = {
          topic: top,
          category: cat,
          totalMarks: 0,
          obtainedMarks: 0,
          totalQuestions: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0
        };
      }
      topicStats[top].totalMarks += qMarks;
      topicStats[top].totalQuestions += 1;

      const hasAnswered = isCoding || (userAns !== undefined && userAns !== null && String(userAns).trim() !== '');

      if (hasAnswered) {
        if (isCoding) {
          const scorePct = Number(userAns?.score ?? (userAns?.passedTests && userAns?.totalTests ? (userAns.passedTests / userAns.totalTests) * 100 : 0));
          const earned = Math.round((scorePct / 100) * qMarks);
          totalObtainedMarks += earned;
          categoryStats[cat].obtainedMarks += earned;
          topicStats[top].obtainedMarks += earned;

          if (scorePct >= 60) {
            correct += 1;
            categoryStats[cat].correctCount += 1;
            topicStats[top].correctCount += 1;
          } else {
            incorrect += 1;
            topicStats[top].incorrectCount += 1;
          }
        } else {
          const isCorrect = String(userAns).trim().toUpperCase() === correctAns;
          if (isCorrect) {
            correct += 1;
            totalObtainedMarks += qMarks;

            categoryStats[cat].correctCount += 1;
            categoryStats[cat].obtainedMarks += qMarks;

            topicStats[top].correctCount += 1;
            topicStats[top].obtainedMarks += qMarks;
          } else {
            incorrect += 1;
            topicStats[top].incorrectCount += 1;
          }
        }
      } else {
        unanswered += 1;
        topicStats[top].unansweredCount += 1;
      }
    });

    const attemptedCount = correct + incorrect;
    let calculatedScore = totalPossibleMarks > 0
      ? Math.min(100, Math.max(0, Math.round((totalObtainedMarks / totalPossibleMarks) * 100)))
      : 0;
    let accuracy = attemptedCount > 0 ? Math.round((correct / attemptedCount) * 100) : 0;

    // Helper function to normalize category to one of the standard sections
    const normalizeSection = (rawCat) => {
      const c = (rawCat || '').toLowerCase().trim();
      if (c.includes('code') || c.includes('prog')) return 'coding';
      if (c.includes('apt') || c.includes('quant') || c.includes('math')) return 'aptitude';
      if (c.includes('reason') || c.includes('logic')) return 'reasoning';
      if (c.includes('verbal') || c.includes('eng')) return 'verbal';
      if (c.includes('tech')) return 'technical';
      return c || 'technical';
    };

    // Build dynamic category scores based on marks with section normalization
    const categoryScores = {
      aptitude: 0,
      reasoning: 0,
      technical: 0,
      verbal: 0,
      coding: 0,
    };

    const normalizedCategoryStats = {
      aptitude: { totalMarks: 0, obtainedMarks: 0 },
      reasoning: { totalMarks: 0, obtainedMarks: 0 },
      technical: { totalMarks: 0, obtainedMarks: 0 },
      verbal: { totalMarks: 0, obtainedMarks: 0 },
      coding: { totalMarks: 0, obtainedMarks: 0 },
    };

    Object.keys(categoryStats).forEach(cat => {
      const stat = categoryStats[cat];
      const normalizedKey = normalizeSection(cat);
      if (!normalizedCategoryStats[normalizedKey]) {
        normalizedCategoryStats[normalizedKey] = { totalMarks: 0, obtainedMarks: 0 };
      }
      normalizedCategoryStats[normalizedKey].totalMarks += stat.totalMarks;
      normalizedCategoryStats[normalizedKey].obtainedMarks += stat.obtainedMarks;
    });

    Object.keys(normalizedCategoryStats).forEach(sec => {
      const stat = normalizedCategoryStats[sec];
      if (stat.totalMarks > 0) {
        categoryScores[sec] = Math.round((stat.obtainedMarks / stat.totalMarks) * 100);
      } else {
        categoryScores[sec] = 0;
      }
    });

    const sectionsTested = {
      aptitude: normalizedCategoryStats.aptitude.totalMarks > 0,
      reasoning: normalizedCategoryStats.reasoning.totalMarks > 0,
      technical: normalizedCategoryStats.technical.totalMarks > 0,
      verbal: normalizedCategoryStats.verbal.totalMarks > 0,
      coding: normalizedCategoryStats.coding.totalMarks > 0,
    };

    // Build dynamic topic breakdown with marks and accuracy
    let topicBreakdown = Object.keys(topicStats).map(topic => {
      const stat = topicStats[topic];
      const topicScore = stat.totalMarks > 0
        ? Math.round((stat.obtainedMarks / stat.totalMarks) * 100)
        : 0;
      let status = 'Needs Review';
      if (topicScore >= 85) status = 'Mastered';
      else if (topicScore >= 70) status = 'Strong';
      else if (topicScore >= 50) status = 'Average';
      else status = 'Weak';

      return {
        topic: stat.topic,
        category: stat.category,
        score: topicScore,
        obtainedMarks: stat.obtainedMarks,
        totalMarks: stat.totalMarks,
        correctCount: stat.correctCount,
        incorrectCount: stat.incorrectCount,
        unansweredCount: stat.unansweredCount,
        totalQuestions: stat.totalQuestions,
        status
      };
    });

    if (topicBreakdown.length === 0) {
      topicBreakdown = [
        {
          topic: 'Core Technical Concepts',
          category: 'Technical',
          score: calculatedScore,
          obtainedMarks: totalObtainedMarks,
          totalMarks: totalPossibleMarks || 10,
          correctCount: correct,
          incorrectCount: incorrect,
          unansweredCount: unanswered,
          totalQuestions,
          status: calculatedScore >= 70 ? 'Strong' : 'Average'
        }
      ];
    }

    // 1. Send submission data to backend API -> calculated authoritatively on PostgreSQL backend!
    const submissionRes = await api.submissions.submit({
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
      totalQuestions,
      obtainedMarks: totalObtainedMarks,
      totalMarks: totalPossibleMarks,
      timeTaken: `${timeSpentMin} min`,
      categoryScores,
      topicBreakdown,
      questionIds: asmQuestions.map(q => q.id),
      answers: answers,
      proctoringViolations: Number(metadata.proctoringViolations || 0),
      autoSubmitted: Boolean(metadata.autoSubmitted),
      autoSubmitReason: metadata.autoSubmitReason || null
    });

    // Check if backend rejected because already submitted
    if (!submissionRes.ok && (submissionRes.status === 403 || submissionRes.data?.alreadySubmitted)) {
      const targetAsmId = activeAssessment?.id || 'asm-1';
      const existingSub = {
        assessment_id: targetAsmId,
        assessmentId: targetAsmId,
        status: 'Completed',
        score: submissionRes.data?.submission?.score ?? calculatedScore ?? 0,
        created_at: new Date().toISOString()
      };
      setCandidateSubmissions(prev => [
        existingSub,
        ...prev.filter(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() !== String(targetAsmId).trim().toLowerCase())
      ]);
      setActiveAssessment(null);
      setAssessmentAnswers({});
      setCurrentQuestionIndex(0);
      setMarkedForReview([]);
      stopMediaStream();
      addToast(submissionRes.error || 'This assessment has already been submitted and recorded.', 'info');
      navigateTo('candidate-analytics');
      return;
    }

    // If backend returned authoritative evaluation, synchronize frontend state with DB
    const dbData = submissionRes?.data?.data || submissionRes?.data;
    if (submissionRes?.ok && dbData && typeof dbData === 'object') {
      const dbAsmId = dbData.assessment_id || dbData.assessmentId || activeAssessment?.id || 'asm-1';
      setCandidateSubmissions(prev => [
        { ...dbData, assessment_id: dbAsmId, assessmentId: dbAsmId },
        ...prev.filter(s => s.id !== dbData.id && String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() !== String(dbAsmId).trim().toLowerCase())
      ]);
      if (typeof dbData.score === 'number') calculatedScore = dbData.score;
      if (typeof dbData.accuracy === 'number') accuracy = dbData.accuracy;
      if (typeof dbData.correct_count === 'number') correct = dbData.correct_count;
      if (typeof dbData.incorrect_count === 'number') incorrect = dbData.incorrect_count;
      if (typeof dbData.unanswered_count === 'number') unanswered = dbData.unanswered_count;
      if (typeof dbData.obtained_marks === 'number') totalObtainedMarks = dbData.obtained_marks;
      else if (typeof dbData.correct_count === 'number') totalObtainedMarks = dbData.correct_count;
      if (typeof dbData.total_marks === 'number') totalPossibleMarks = dbData.total_marks;

      if (dbData.topic_breakdown) {
        try {
          topicBreakdown = typeof dbData.topic_breakdown === 'string'
            ? JSON.parse(dbData.topic_breakdown)
            : dbData.topic_breakdown;
        } catch (e) {}
      }
      if (dbData.category_scores) {
        try {
          const dbCat = typeof dbData.category_scores === 'string'
            ? JSON.parse(dbData.category_scores)
            : dbData.category_scores;
          Object.assign(categoryScores, dbCat);
        } catch (e) {}
      }
    }

    const strongTopics = (topicBreakdown || []).filter(t => (t.score ?? 0) >= 70).map(t => `${t.topic} (${t.score}% - ${t.obtainedMarks ?? t.correctCount ?? 0}/${t.totalMarks ?? t.totalQuestions ?? 0} marks)`);
    const weakTopics = (topicBreakdown || []).filter(t => (t.score ?? 0) < 70).map(t => `${t.topic} (${t.score}% - ${t.obtainedMarks ?? t.correctCount ?? 0}/${t.totalMarks ?? t.totalQuestions ?? 0} marks)`);

    const dynamicStrengths = strongTopics.length > 0 ? strongTopics : ['Question attempt consistency', 'Basic problem understanding'];
    const dynamicWeaknesses = weakTopics.length > 0 ? weakTopics : ['Speed & time management under exam pressure'];
    const dynamicRecommendations = weakTopics.length > 0
      ? (topicBreakdown || []).filter(t => (t.score ?? 0) < 70).map(t => `Practice topic questions in ${t.topic} (currently scored ${t.obtainedMarks ?? t.correctCount ?? 0}/${t.totalMarks ?? t.totalQuestions ?? 0} marks)`)
      : ['Continue practicing mock exams to maintain 100% mastery'];

    const result = {
      score: calculatedScore,
      totalMarks: totalPossibleMarks,
      obtainedMarks: totalObtainedMarks,
      accuracy: accuracy,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      totalQuestions,
      timeTaken: `${timeSpentMin} min`,
      completedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assessmentId: activeAssessment?.id || 'asm-1',
      assessmentName: activeAssessment?.title || 'Assessment',
      categoryScores,
      sectionsTested,
      topicBreakdown,
      strengths: dynamicStrengths,
      weaknesses: dynamicWeaknesses,
      recommendedTopics: dynamicRecommendations
    };

    setLatestResult(result);
    try {
      localStorage.setItem('rsj_latest_result', JSON.stringify(result));
    } catch (e) {}

    // 2. Update candidate score in currentUser state
    setCurrentUser(prev => {
      if (!prev) return null;
      const updatedUser = {
        ...prev,
        overallScore: calculatedScore,
        jobReadinessScore: calculatedScore,
        aptitudeScore: sectionsTested.aptitude ? categoryScores.aptitude : (prev.aptitudeScore ?? 0),
        reasoningScore: sectionsTested.reasoning ? categoryScores.reasoning : (prev.reasoningScore ?? 0),
        technicalScore: sectionsTested.technical ? categoryScores.technical : (prev.technicalScore ?? 0),
        verbalScore: sectionsTested.verbal ? (categoryScores.verbal ?? categoryScores.english ?? 0) : (prev.verbalScore ?? 0),
        codingScore: sectionsTested.coding ? categoryScores.coding : (prev.codingScore ?? 0),
        assessmentStatus: 'Completed',
        assessmentsCompleted: (prev.assessmentsCompleted || 0) + 1
      };
      try {
        localStorage.setItem('rsj_user', JSON.stringify(updatedUser));
      } catch (e) {}
      return updatedUser;
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
    const currentAsmId = activeAssessment?.id || 'asm-1';
    if (activeAssessment) {
      setAssessments(prev => {
        const updated = prev.map(a => a.id === activeAssessment.id ? {
          ...a,
          status: 'Completed',
          progress: 100,
          completedQuestions: a.totalQuestions,
          lastScore: calculatedScore
        } : a);
        localStorage.setItem('rsj_assessments', JSON.stringify(updated));
        return updated;
      });
    }

    // Ensure candidateSubmissions has this assessment marked Completed
    setCandidateSubmissions(prev => {
      const exists = prev.some(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === String(currentAsmId).trim().toLowerCase());
      if (!exists) {
        return [
          {
            assessment_id: currentAsmId,
            assessmentId: currentAsmId,
            status: 'Completed',
            score: calculatedScore,
            created_at: new Date().toISOString()
          },
          ...prev
        ];
      }
      return prev.map(s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === String(currentAsmId).trim().toLowerCase() ? { ...s, status: 'Completed', score: calculatedScore } : s);
    });

    if (typeof document !== 'undefined' && (document.fullscreenElement || document.webkitFullscreenElement)) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (e) {}
    }

    // CLOSE CURRENT EXAM SESSION
    setActiveAssessment(null);
    setAssessmentAnswers({});
    setCurrentQuestionIndex(0);
    setMarkedForReview([]);
    stopMediaStream();

    // Check for remaining uncompleted assessments to auto-redirect
    const currentIdStr = String(currentAsmId).trim().toLowerCase();
    const updatedSubmissions = (candidateSubmissions || []).concat([
      { assessment_id: currentAsmId, assessmentId: currentAsmId, status: 'Completed', score: calculatedScore }
    ]);

    const remainingAssessments = (assessments || []).filter(a => {
      const aId = String(a.id || '').trim().toLowerCase();
      if (aId === currentIdStr) return false;
      const alreadyDone = updatedSubmissions.some(
        s => String(s.assessment_id || s.assessmentId || '').trim().toLowerCase() === aId &&
        (s.status === 'Completed' || s.score !== undefined)
      );
      return !alreadyDone && a.status !== 'Completed';
    });

    if (remainingAssessments.length > 0) {
      const nextAsm = remainingAssessments[0];
      const nextTitle = nextAsm.title || nextAsm.assessmentTitle || 'Next Assessment';
      addToast(`Assessment submitted! Transitioning to next assessment: "${nextTitle}"...`, 'info');
      setTimeout(() => {
        startAssessment(nextAsm.id);
      }, 600);
      return { ok: true, redirectedToNext: true, nextAssessment: nextAsm, submissionRes };
    } else {
      addToast('All assessments submitted successfully! Viewing candidate analytics.', 'success');
      setCurrentView('candidate-analytics');
      try {
        window.history.pushState(null, '', '/candidate-analytics');
      } catch (e) {}
      return { ok: true, redirectedToNext: false, submissionRes };
    }
  };

  // Fetch questions from PostgreSQL database on load for admin role and merge with local state
  useEffect(() => {
    const fetchQuestions = async () => {
      // Only administrators are permitted to query the full question bank
      if (role !== 'admin' && !adminUser) return;
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
          test_cases: typeof q.test_cases === 'string' ? JSON.parse(q.test_cases) : (q.test_cases || []),
          starter_templates: typeof q.starter_templates === 'string' ? JSON.parse(q.starter_templates) : (q.starter_templates || null),
          constraints: q.constraints,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          marks: Number(q.marks) > 0 ? Number(q.marks) : 1,
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
  }, [role, adminUser]);

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
          tags: item.tags,
          testCases: item.testCases || item.test_cases,
          starterTemplates: item.starterTemplates || item.starter_templates,
          constraints: item.constraints
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
          totalQuestions: (Array.isArray(a.selected_question_ids) && a.selected_question_ids.length > 0)
            ? a.selected_question_ids.length
            : (Number(a.total_questions) || 5),
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
          aptitudeScore: Number(c.aptitude_score ?? 0),
          reasoningScore: Number(c.reasoning_score ?? 0),
          technicalScore: Number(c.technical_score ?? 0),
          verbalScore: Number(c.verbal_score ?? 0),
          codingScore: Number(c.coding_score ?? 0),
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
      passingScore: created.passingScore,
      selectedQuestionIds: created.selectedQuestionIds || []
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

  const deleteCandidate = async (id) => {
    try {
      const res = await api.candidates.delete(id);
      if (res && res.ok) {
        setCandidatesList(prev => {
          const updated = prev.filter(c => c.id !== id);
          try {
            localStorage.setItem('rsj_candidates_list', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        addToast('Candidate deleted successfully from database', 'success');
      } else {
        addToast(res?.error || 'Failed to delete candidate from database', 'error');
      }
    } catch (err) {
      console.error('Error deleting candidate:', err);
      addToast('Failed to delete candidate from database', 'error');
    }
  };

  const resetCandidateAttempt = async (id, target = 'all') => {
    try {
      const payload = typeof target === 'object' && target !== null 
        ? target 
        : { targetType: target, assessmentId: target };
      const res = await api.candidates.resetAttempt(id, payload);
      if (res && res.ok) {
        // Refresh candidates list from DB if possible
        try {
          const candRes = await api.candidates.getAll();
          const rawList = Array.isArray(candRes?.data?.data)
            ? candRes.data.data
            : (Array.isArray(candRes?.data) ? candRes.data : []);
          if (candRes && candRes.ok && Array.isArray(rawList)) {
            const dbCandidates = rawList.map(c => ({
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
              aptitudeScore: Number(c.aptitude_score ?? 0),
              reasoningScore: Number(c.reasoning_score ?? 0),
              technicalScore: Number(c.technical_score ?? 0),
              verbalScore: Number(c.verbal_score ?? 0),
              codingScore: Number(c.coding_score ?? 0),
              assessmentsCompleted: Number(c.assessments_completed ?? 0)
            }));
            setCandidatesList(dbCandidates);
            try {
              localStorage.setItem('rsj_candidates_list', JSON.stringify(dbCandidates));
            } catch (e) {}
          }
        } catch (e) {
          console.warn('Failed to refresh candidate list after attempt reset:', e.message);
        }

        // If the reset candidate is the currently logged-in candidate, refresh their submissions and status
        if (currentUser && (currentUser.id === id || currentUser.email === id)) {
          try {
            const [meRes, subRes] = await Promise.all([
              api.auth.me().catch(() => null),
              api.submissions.my().catch(() => null)
            ]);
            if (meRes?.ok && meRes.data?.candidate) {
              const freshCand = meRes.data.candidate;
              setCurrentUser(freshCand);
              try {
                localStorage.setItem('rsj_user', JSON.stringify(freshCand));
              } catch (e) {}
            }
            const subList = Array.isArray(subRes?.data?.data)
              ? subRes.data.data
              : (Array.isArray(subRes?.data) ? subRes.data : []);
            if (subRes && subRes.ok) {
              setCandidateSubmissions(subList);
              if (subList.length === 0) {
                setLatestResult(null);
                try {
                  localStorage.removeItem('rsj_latest_result');
                } catch (e) {}
              } else {
                const latest = subList[0];
                const catScores = typeof latest.category_scores === 'string' ? JSON.parse(latest.category_scores) : (latest.category_scores || {});
                const topicBreakdown = typeof latest.topic_breakdown === 'string' ? JSON.parse(latest.topic_breakdown) : (latest.topic_breakdown || []);
                const mappedResult = sanitizeResultScores({
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
                });
                setLatestResult(mappedResult);
                try {
                  localStorage.setItem('rsj_latest_result', JSON.stringify(mappedResult));
                } catch (e) {}
              }
            }
          } catch (e) {}
        }

        // Also update assessments state
        const targetStr = String(payload.targetType || payload.assessmentId || target || 'all').toLowerCase();
        setAssessments(prev => prev.map(a => {
          const isCoding = (a.category || '').toLowerCase().includes('cod') || (a.title || '').toLowerCase().includes('cod');
          if (targetStr === 'all') return { ...a, status: 'Active', progress: 0, completedQuestions: 0 };
          if (targetStr === 'coding' && isCoding) return { ...a, status: 'Active', progress: 0, completedQuestions: 0 };
          if ((targetStr === 'technical' || targetStr === 'other' || targetStr === 'mcq') && !isCoding) return { ...a, status: 'Active', progress: 0, completedQuestions: 0 };
          if (String(a.id).toLowerCase() === targetStr) return { ...a, status: 'Active', progress: 0, completedQuestions: 0 };
          return a;
        }));

        addToast(res.message || 'Assessment attempt reset successfully. The candidate can now retake the assessment.', 'success');
        return { success: true, data: res };
      } else {
        const errorMsg = res?.error || 'Failed to reset assessment attempt';
        addToast(errorMsg, 'error');
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error resetting candidate attempt:', err);
      const errorMsg = err.message || 'Failed to reset assessment attempt';
      addToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
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
        setLatestResult,
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
        resetCandidateAttempt,
        candidateSubmissions,
        setCandidateSubmissions,
        isAssessmentCompleted,
        kpis: INITIAL_ADMIN_KPIS
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
