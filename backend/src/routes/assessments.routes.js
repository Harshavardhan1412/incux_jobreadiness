import { Router } from 'express';
import { getAllAssessments, getAssessmentById, createAssessment, updateAssessment, deleteAssessment } from '../controllers/assessments.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticateToken, getAllAssessments);
router.get('/:id', authenticateToken, getAssessmentById);
router.post('/', authenticateToken, requireRole('admin'), createAssessment);
router.put('/:id', authenticateToken, requireRole('admin'), updateAssessment);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteAssessment);

export default router;
