// Client-side API service — connects React frontend to Express/PostgreSQL backend
// Reads VITE_API_URL from frontend/.env (defaults to /api via Vite proxy in dev)

const BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Auth helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('rsj_token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

async function request(method, path, body) {
  const cleanPath = path.startsWith('/api/') ? path.slice(4) : (path.startsWith('/') ? path : `/${path}`);
  try {
    const res = await fetch(`${BASE}${cleanPath}`, {
      method,
      headers: authHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || data.message || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      return { ok: true, ...data, data, status: res.status };
    }
    return { ok: true, data, status: res.status };
  } catch (err) {
    console.warn(`[API] ${method} ${path} failed:`, err.message);
    return { ok: false, success: false, error: err.message, status: err.status || 500, data: err.data };
  }
}

// ─── API client ──────────────────────────────────────────────────────────────
export const api = {
  health: () => request('GET', '/health'),

  // Generic HTTP convenience helpers
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),

  code: {
    run: (body) => request('POST', '/code/run', body),
    submit: (body) => request('POST', '/code/submit', body),
    getLanguages: () => request('GET', '/code/languages'),
  },

  auth: {
    register: (body) => request('POST', '/auth/register', body),
    login: (body) => request('POST', '/auth/login', body),
    adminLogin: (body) => request('POST', '/auth/admin/login', body),
    me: () => request('GET', '/auth/me'),
  },

  candidates: {
    getAll: () => request('GET', '/candidates'),
    getById: (id) => request('GET', `/candidates/${id}`),
    update: (id, body) => request('PUT', `/candidates/${id}`, body),
    updateAcademicMarks: (id, body) => request('PUT', `/candidates/${id}/academic-marks`, body),
    getCompanyEligibilityCriteria: () => request('GET', '/candidates/company-eligibility/criteria'),
    delete: (id) => request('DELETE', `/candidates/${id}`),
    submissions: (id) => request('GET', `/candidates/${id}/submissions`),
    resetAttempt: (id, assessmentId) => request('POST', `/candidates/${id}/reset-attempt`, { assessmentId }),
  },

  assessments: {
    getAll: () => request('GET', '/assessments'),
    getById: (id) => request('GET', `/assessments/${id}`),
    create: (body) => request('POST', '/assessments', body),
    update: (id, body) => request('PUT', `/assessments/${id}`, body),
    delete: (id) => request('DELETE', `/assessments/${id}`),
    getQuestions: (id) => request('GET', `/assessments/${id}/questions`),
    addQuestions: (id, body) => request('POST', `/assessments/${id}/questions`, body),
    removeQuestion: (id, questionId) => request('DELETE', `/assessments/${id}/questions/${questionId}`),
  },

  questions: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/questions${qs ? '?' + qs : ''}`);
    },
    create: (body) => request('POST', '/questions', body),
    update: (id, body) => request('PUT', `/questions/${id}`, body),
    delete: (id) => request('DELETE', `/questions/${id}`),
  },

  submissions: {
    submit: (body) => request('POST', '/submissions', body),
    my: () => request('GET', '/submissions/my'),
    logProctoringEvent: (body) => request('POST', '/submissions/proctoring-event', body),
    getProctoringEvents: (attemptId) => request('GET', `/submissions/proctoring-events/${encodeURIComponent(attemptId)}`),
  },

  admin: {
    stats: () => request('GET', '/admin/stats'),
    analytics: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request('GET', `/admin/analytics${qs ? '?' + qs : ''}`);
    },
    reports: () => request('GET', '/admin/reports'),
  },

  // Save JWT token after login
  saveToken: (token) => localStorage.setItem('rsj_token', token),
  clearToken: () => localStorage.removeItem('rsj_token'),
};

export default api;
