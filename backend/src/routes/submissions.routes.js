import { Router } from 'express';
import { submitAssessment, getAllSubmissions, getMySubmissions } from '../controllers/submissions.controller.js';
import { optionalAuthToken } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuthToken, submitAssessment);
router.get('/', optionalAuthToken, getAllSubmissions);
router.get('/my', optionalAuthToken, getMySubmissions);

export default router;
