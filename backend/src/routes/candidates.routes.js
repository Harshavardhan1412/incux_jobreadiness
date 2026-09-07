import { Router } from 'express';
import { getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidateSubmissions } from '../controllers/candidates.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// All candidate routes require authentication
router.use(authenticateToken);

// Admin-only roster & deletion
router.get('/', requireRole('admin'), getAllCandidates);
router.delete('/:id', requireRole('admin'), deleteCandidate);

// Candidate details (accessible by profile owner or admin)
router.get('/:id', getCandidateById);
router.put('/:id', updateCandidate);
router.get('/:id/submissions', getCandidateSubmissions);

export default router;

