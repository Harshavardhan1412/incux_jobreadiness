import { Router } from 'express';
import { 
  submitAssessment, 
  getAllSubmissions, 
  getMySubmissions,
  logProctoringEvent,
  getProctoringEvents
} from '../controllers/submissions.controller.js';
import { authenticateToken, optionalAuthToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All submission and proctoring endpoints require authentication
router.use(authenticateToken);

// Proctoring telemetry logs (authenticated candidates & admin)
router.post('/proctoring-event', logProctoringEvent);
router.get('/proctoring-events/:attemptId', getProctoringEvents);

// Candidate / Admin test attempt submission
router.post('/', submitAssessment);
router.get('/my', getMySubmissions);

// Admin-only view all submissions
router.get('/', requireRole('admin'), getAllSubmissions);

export default router;


