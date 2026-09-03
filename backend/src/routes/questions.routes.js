import { Router } from 'express';
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion } from '../controllers/questions.controller.js';

const router = Router();

router.get('/', getAllQuestions);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
