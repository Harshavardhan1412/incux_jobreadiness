import { Router } from 'express';
import { register, loginCandidate, loginAdmin, getMe } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, loginCandidate);
router.post('/admin/login', loginLimiter, loginAdmin);
router.get('/me', authenticateToken, getMe);

export default router;
