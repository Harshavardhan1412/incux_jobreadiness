process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '128';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import { testConnection, closePool } from './db/pool.js';
import { initSchema } from './db/schema.js';

import { apiLimiter, loginLimiter, registerLimiter, submissionLimiter } from './middleware/rateLimiter.js';


import authRoutes from './routes/auth.routes.js';
import candidatesRoutes from './routes/candidates.routes.js';
import assessmentsRoutes from './routes/assessments.routes.js';
import questionsRoutes from './routes/questions.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import adminRoutes from './routes/admin.routes.js';
import codeRoutes from './routes/code.routes.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0';

// ─── Security: Defensive HTTP Headers (Helmet) ──────────────────────────────
app.use(helmet());

// ─── Security: Hardened CORS Policy ─────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests with no origin (curl, mobile apps, health checks)
    if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security policy'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Required for reading HttpOnly refresh token cookies

// ─── Security: Rate Limiting (DoS & Brute-Force Protection) ──────────────────
// All limiters are defined in rateLimiter.js and use Redis when available
// so they work correctly across multiple Node.js instances.
app.use('/api', apiLimiter);
app.use('/api/submissions', submissionLimiter);

// ─── Performance: Request Duration Logger & Timeout Protection ───────────────
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || '25000', 10);

app.use((req, res, next) => {
  const start = Date.now();

  // Set response timeout header / handler
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ success: false, error: 'Gateway timeout. Request took too long to process.' });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => {
    clearTimeout(timer);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[SLOW REQ] ${req.method} ${req.originalUrl} - ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  const dbOk = await testConnection().catch(() => false);
  res.json({
    status: 'online',
    service: 'ReadySetJob API',
    version: '1.0.0',
    database: dbOk ? 'connected ✅' : 'offline ❌',
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/code', codeRoutes);
app.use('/code', codeRoutes);

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'API endpoint not found.' }));

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Startup ─────────────────────────────────────────────────────────────────
const server = app.listen(PORT, HOST, async () => {
  console.log(`\n🚀  ReadySetJob Backend API  →  http://${HOST}:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  const connected = await testConnection();
  if (connected) {
    await initSchema();
    console.log('\n📡  API Routes ready.');
  } else {
    console.warn('\n⚠️  Running without database. Check DATABASE_URL in backend/.env\n');
  }
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);

  server.close(async (err) => {
    if (err) {
      console.error('Error closing HTTP server:', err.message);
    } else {
      console.log('✅ HTTP server closed. No longer accepting new connections.');
    }

    await closePool();
    console.log('👋 Process exiting cleanly.\n');
    process.exit(err ? 1 : 0);
  });

  // Force shutdown after 10 seconds if connections fail to close
  setTimeout(() => {
    console.error('⚠️ Forced shutdown after 10s timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception intercepted:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection intercepted:', reason);
});

export default app;
