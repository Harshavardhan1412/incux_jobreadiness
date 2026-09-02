import { Router } from 'express';
import { getAllAssessments, getAssessmentById, createAssessment, updateAssessment, deleteAssessment } from '../controllers/assessments.controller.js';

const router = Router();

router.get('/', getAllAssessments);
router.get('/:id', getAssessmentById);
router.post('/', createAssessment);
router.put('/:id', updateAssessment);
router.delete('/:id', deleteAssessment);

export default router;
