import { Router } from 'express';
import { submitAssessment, getMySubmissions } from '../controllers/submissions.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.post('/', authenticateToken, requireRole('candidate'), submitAssessment);
router.get('/my', authenticateToken, requireRole('candidate'), getMySubmissions);

export default router;
