import { Router } from 'express';
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questions.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticateToken, getAllQuestions);
router.post('/', authenticateToken, requireRole('admin'), createQuestion);
router.put('/:id', authenticateToken, requireRole('admin'), updateQuestion);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteQuestion);

export default router;
