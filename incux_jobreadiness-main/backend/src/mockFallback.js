export const fallbackAssessments = [
  {
    id: 'asm-demo-1',
    title: 'Technical Readiness Assessment',
    description: 'Baseline assessment for coding and reasoning skills.',
    category: 'Technical',
    difficulty: 'Medium',
    duration_minutes: 30,
    total_questions: 5,
    total_marks: 100,
    passing_score: 65,
    status: 'Active',
    created_at: new Date().toISOString()
  },
  {
    id: 'asm-demo-2',
    title: 'Aptitude Mock Test',
    description: 'Quick aptitude and logical reasoning practice.',
    category: 'Aptitude',
    difficulty: 'Medium',
    duration_minutes: 25,
    total_questions: 5,
    total_marks: 100,
    passing_score: 60,
    status: 'Active',
    created_at: new Date().toISOString()
  }
];

export const fallbackQuestions = [
  {
    id: 'q-demo-1',
    category: 'Technical',
    topic: 'JavaScript Fundamentals',
    difficulty: 'Medium',
    type: 'Multiple Choice',
    question: 'Which JavaScript keyword is used to declare a block-scoped variable?',
    options: ['var', 'let', 'function', 'const'],
    correct_answer: 'B',
    marks: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'q-demo-2',
    category: 'Aptitude',
    topic: 'Percentages',
    difficulty: 'Easy',
    type: 'Multiple Choice',
    question: 'If 20% of a number is 50, what is the number?',
    options: ['200', '250', '300', '400'],
    correct_answer: 'B',
    marks: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'q-demo-3',
    category: 'Reasoning',
    topic: 'Logical Deduction',
    difficulty: 'Medium',
    type: 'Multiple Choice',
    question: 'All engineers are problem solvers. Priya is an engineer. Therefore, Priya is:',
    options: ['A manager', 'A problem solver', 'A designer', 'A student'],
    correct_answer: 'B',
    marks: 1,
    created_at: new Date().toISOString()
  }
];

export const fallbackCandidates = [
  {
    id: 'cand-demo-1',
    name: 'Demo Candidate',
    email: 'demo@incuxai.com',
    mobile: '+91 9876543210',
    college: 'Demo Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2026,
    experience_level: 'Fresher',
    job_readiness_score: 78,
    aptitude_score: 82,
    reasoning_score: 74,
    technical_score: 78,
    verbal_score: 70,
    coding_score: 80,
    assessments_completed: 2,
    tenth_marks: 89,
    twelfth_diploma_marks: 86,
    graduation_percentage: 79.5,
    backlogs: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 'cand-user-1',
    name: 'Vishnu Pera',
    email: 'peravishnu4@gmail.com',
    mobile: '+91 9876543210',
    college: 'Engineering Institute',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduation_year: 2026,
    experience_level: 'Fresher',
    job_readiness_score: 82,
    aptitude_score: 85,
    reasoning_score: 80,
    technical_score: 84,
    verbal_score: 78,
    coding_score: 82,
    assessments_completed: 3,
    tenth_marks: 92,
    twelfth_diploma_marks: 88,
    graduation_percentage: 84.0,
    backlogs: 0,
    created_at: new Date().toISOString()
  }
];

// In-memory store for fallback users
const memoryUsers = new Map([
  ['demo@incuxai.com', {
    id: 'cand-demo-1',
    name: 'Demo Candidate',
    email: 'demo@incuxai.com',
    role: 'candidate',
    candidate: fallbackCandidates[0]
  }],
  ['peravishnu4@gmail.com', {
    id: 'cand-user-1',
    name: 'Vishnu Pera',
    email: 'peravishnu4@gmail.com',
    role: 'candidate',
    candidate: fallbackCandidates[1]
  }],
  ['admin@readysetjob.com', {
    id: 'admin-1',
    name: 'Admin Director',
    email: 'admin@readysetjob.com',
    role: 'admin'
  }],
  ['admin@incuxai.com', {
    id: 'admin-2',
    name: 'Incux Admin',
    email: 'admin@incuxai.com',
    role: 'admin'
  }]
]);

export const findUserByEmail = (email) => {
  if (!email) return null;
  const key = email.trim().toLowerCase();
  return memoryUsers.get(key) || null;
};

export const saveUser = (user) => {
  if (!user || !user.email) return;
  const key = user.email.trim().toLowerCase();
  memoryUsers.set(key, user);
  // Also register candidate profile if candidate
  if (user.role === 'candidate') {
    const existingIdx = fallbackCandidates.findIndex(c => c.email.toLowerCase() === key || c.id === user.id);
    const candObj = user.candidate || user;
    if (existingIdx >= 0) {
      fallbackCandidates[existingIdx] = { ...fallbackCandidates[existingIdx], ...candObj };
    } else {
      fallbackCandidates.unshift(candObj);
    }
  }
};

export const findCandidateById = (id) => {
  if (!id) return null;
  return fallbackCandidates.find(c => c.id === id) || null;
};

// In-memory submissions store
export const fallbackSubmissions = [
  {
    id: 'sub-demo-1',
    assessment_id: 'asm-demo-1',
    assessmentId: 'asm-demo-1',
    assessment_title: 'Technical Readiness Assessment',
    assessmentTitle: 'Technical Readiness Assessment',
    candidate_id: 'cand-demo-1',
    candidateId: 'cand-demo-1',
    candidate_name: 'Demo Candidate',
    candidateName: 'Demo Candidate',
    candidate_email: 'demo@incuxai.com',
    candidateEmail: 'demo@incuxai.com',
    score: 82,
    accuracy: 82,
    correct_count: 4,
    incorrect_count: 1,
    unanswered_count: 0,
    total_questions: 5,
    time_taken: '22 min',
    category_scores: { technical: 84, reasoning: 80, aptitude: 82 },
    topic_breakdown: [
      { topic: 'JavaScript Fundamentals', score: 85, status: 'Mastered' },
      { topic: 'Data Structures', score: 80, status: 'Strong' }
    ],
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'sub-user-1',
    assessment_id: 'asm-demo-1',
    assessmentId: 'asm-demo-1',
    assessment_title: 'Technical Readiness Assessment',
    assessmentTitle: 'Technical Readiness Assessment',
    candidate_id: 'cand-user-1',
    candidateId: 'cand-user-1',
    candidate_name: 'Vishnu Pera',
    candidateName: 'Vishnu Pera',
    candidate_email: 'peravishnu4@gmail.com',
    candidateEmail: 'peravishnu4@gmail.com',
    score: 88,
    accuracy: 88,
    correct_count: 4,
    incorrect_count: 1,
    unanswered_count: 0,
    total_questions: 5,
    time_taken: '20 min',
    category_scores: { technical: 90, reasoning: 85, aptitude: 88 },
    topic_breakdown: [
      { topic: 'JavaScript Fundamentals', score: 95, status: 'Mastered' },
      { topic: 'Data Structures', score: 85, status: 'Strong' }
    ],
    created_at: new Date().toISOString()
  }
];

export const getMySubmissionsFallback = (candId, candEmail) => {
  const normEmail = (candEmail || '').trim().toLowerCase();
  return fallbackSubmissions.filter(s =>
    (candId && s.candidate_id === candId) ||
    (normEmail && (s.candidate_email || '').toLowerCase() === normEmail)
  );
};

export const saveSubmissionFallback = (submission) => {
  fallbackSubmissions.unshift(submission);
};

export const fallbackProctoringEvents = [];

export const saveProctoringEventFallback = (event) => {
  fallbackProctoringEvents.push(event);
};

export const getProctoringEventsFallback = (attemptId) => {
  return fallbackProctoringEvents.filter(e => e.attempt_id === attemptId || e.attemptId === attemptId);
};
