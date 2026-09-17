import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

// Login rate limiter: Burst allowance to prevent socket exhaustion and brute-force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || (isDev ? '250' : '50'), 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many login attempts from this IP. Please try again later.',
      message: 'Too many login attempts from this IP. Please try again later.',
    });
  },
});

// Register rate limiter: Stricter limit on account creation
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX || (isDev ? '100' : '20'), 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many accounts created from this IP. Please try again later.',
      message: 'Too many accounts created from this IP. Please try again later.',
    });
  },
});
