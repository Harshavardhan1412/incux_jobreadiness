import { Router } from 'express';
import { register, loginCandidate, loginAdmin, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', loginCandidate);
router.post('/admin/login', loginAdmin);
router.get('/me', authenticateToken, getMe);

export default router;
