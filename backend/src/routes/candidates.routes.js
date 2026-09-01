import { Router } from 'express';
import { getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidateSubmissions } from '../controllers/candidates.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Admin can see all; candidates can only see themselves (enforced by controller)
router.get('/', authenticateToken, requireRole('admin'), getAllCandidates);
router.get('/:id', authenticateToken, getCandidateById);
router.put('/:id', authenticateToken, updateCandidate);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteCandidate);
router.get('/:id/submissions', authenticateToken, getCandidateSubmissions);

export default router;
