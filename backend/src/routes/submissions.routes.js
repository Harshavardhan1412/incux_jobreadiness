import { Router } from 'express';
import { submitAssessment, getAllSubmissions, getMySubmissions } from '../controllers/submissions.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All submission endpoints require authentication
router.use(authenticateToken);

// Candidate / Admin test attempt submission
router.post('/', submitAssessment);
router.get('/my', getMySubmissions);

// Admin-only view all submissions
router.get('/', requireRole('admin'), getAllSubmissions);

export default router;

