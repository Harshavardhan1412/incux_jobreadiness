import { Router } from 'express';
import { getAllCandidates, getCandidateById, updateCandidate, deleteCandidate, getCandidateSubmissions } from '../controllers/candidates.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Admin can see all candidates from PostgreSQL database
router.get('/', getAllCandidates);
router.get('/:id', getCandidateById);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);
router.get('/:id/submissions', getCandidateSubmissions);

export default router;
