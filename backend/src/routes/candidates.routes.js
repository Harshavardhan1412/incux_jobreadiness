import { Router } from 'express';
import { 
  getAllCandidates, 
  getCandidateById, 
  updateCandidate, 
  deleteCandidate, 
  getCandidateSubmissions,
  getCompanyEligibilityCriteria,
  updateAcademicMarks
} from '../controllers/candidates.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Company eligibility criteria (public catalog)
router.get('/company-eligibility/criteria', getCompanyEligibilityCriteria);

// All candidate routes below require authentication
router.use(authenticateToken);

// Admin-only roster & deletion
router.get('/', requireRole('admin'), getAllCandidates);
router.delete('/:id', requireRole('admin'), deleteCandidate);

// Candidate details (accessible by profile owner or admin)
router.get('/:id', getCandidateById);
router.put('/:id', updateCandidate);
router.put('/:id/academic-marks', updateAcademicMarks);
router.get('/:id/submissions', getCandidateSubmissions);

export default router;

