import express from 'express';
import {
  executeSingleCode,
  executeSingleCodeWithCache,
  evaluateCodeAgainstTestCases,
  isLanguageSupported,
  LANGUAGE_CONFIG
} from '../services/codeExecutionService.js';
import {
  addSubmissionJob,
  getSubmissionJob,
  subscribeJobEvents
} from '../queues/submissionQueue.js';
import { pool } from '../db/pool.js';
import { optionalAuthToken } from '../middleware/auth.js';

const router = express.Router();

// Supported Language Metadata & Starter Boilerplates
const STARTER_TEMPLATES = {
  python: `# Python 3
import sys

def solve():
    # Read input from standard input (stdin)
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Write your solution logic below


if __name__ == '__main__':
    solve()
`,
  javascript: `// JavaScript (Node.js)
const fs = require('fs');

function solve() {
    // Read input from standard input (stdin)
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    // Write your solution logic below

}

solve();
`,
  cpp: `// C++ (GCC)
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input and write your solution logic below

    return 0;
}
`,
  java: `// Java (OpenJDK)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Read input and write your solution logic below

        scanner.close();
    }
}
`,
  c: `// C (GCC)
#include <stdio.h>
#include <stdlib.h>

int main() {
    // Read input and write your solution logic below

    return 0;
}
`,
  typescript: `// TypeScript
import * as fs from 'fs';

function solve(): void {
    const input: string = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    // Write your solution logic below

}

solve();
`
};

// ── In-Flight Execution Rate Limiting & Cooldown Protection ───────────────
const inFlightExecutions = new Set();
const lastExecutionTimes = new Map();
const executionAuditLogs = []; // In-memory telemetry log for run attempts

const getClientKey = (req) => {
  const candId = req.user?.id || req.body?.candidateId || req.body?.attemptId;
  if (candId) return String(candId);
  return req.ip || req.headers['x-forwarded-for'] || 'anonymous';
};

// GET /api/code/languages & GET /code/languages
router.get('/languages', (_req, res) => {
  const languages = Object.keys(LANGUAGE_CONFIG).map((key) => {
    const conf = LANGUAGE_CONFIG[key];
    return {
      id: conf.id,
      name: conf.name,
      version: conf.version,
      template: STARTER_TEMPLATES[key] || ''
    };
  });

  res.json({
    success: true,
    languages
  });
});

// GET /api/code/runs/logs (Recent audit logs)
router.get('/runs/logs', optionalAuthToken, (req, res) => {
  const key = getClientKey(req);
  const userLogs = executionAuditLogs
    .filter(log => !req.user?.role !== 'admin' ? log.clientKey === key : true)
    .slice(-50);
  res.json({ success: true, logs: userLogs });
});

// POST /api/code/run & POST /code/run
router.post('/run', optionalAuthToken, async (req, res) => {
  const clientKey = getClientKey(req);

  // 1. Check in-flight lock: Max 1 active run per candidate at a time
  if (inFlightExecutions.has(clientKey)) {
    return res.status(429).json({
      success: false,
      error: 'An execution is already in progress. Please wait for it to complete.',
      status: 'Busy'
    });
  }

  // 2. Cooldown check: 1-second cooldown between requests
  const now = Date.now();
  const lastTime = lastExecutionTimes.get(clientKey) || 0;
  if (now - lastTime < 1000) {
    return res.status(429).json({
      success: false,
      error: 'Please wait a moment before running code again.',
      status: 'Rate Limited'
    });
  }

  inFlightExecutions.add(clientKey);

  try {
    const {
      language,
      sourceCode,
      stdin,
      testCases,
      attemptId,
      questionId
    } = req.body;

    if (!language || typeof sourceCode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Both language and sourceCode are required.'
      });
    }

    if (!isLanguageSupported(language)) {
      return res.status(400).json({
        success: false,
        error: `Language '${language}' is not supported.`
      });
    }

    // Case 1: Custom stdin execution or direct test
    if (typeof stdin === 'string' && (!testCases || testCases.length === 0)) {
      const execResult = await executeSingleCodeWithCache({
        language,
        sourceCode,
        stdin,
        timeoutMs: 8000
      });

      // Log attempt telemetry
      const logEntry = {
        id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        clientKey,
        attemptId: attemptId || null,
        questionId: questionId || null,
        language,
        status: execResult.status,
        executionTimeMs: execResult.executionTimeMs,
        timestamp: new Date().toISOString()
      };
      executionAuditLogs.push(logEntry);
      if (executionAuditLogs.length > 500) executionAuditLogs.shift();

      return res.json({
        success: execResult.status !== 'Service Unavailable',
        type: 'custom',
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        exitCode: execResult.exitCode,
        executionTimeMs: execResult.executionTimeMs,
        timedOut: execResult.timedOut,
        status: execResult.status,
        result: execResult
      });
    }

    // Case 2: Batch sample test cases execution
    const testCasesToRun = Array.isArray(testCases) && testCases.length > 0
      ? testCases
      : [{ id: 1, input: stdin || '', expectedOutput: '' }];

    const evaluation = await evaluateCodeAgainstTestCases({
      language,
      sourceCode,
      testCases: testCasesToRun,
      includeHiddenDetails: false,
      timeoutMs: 8000
    });

    // Extract primary stdout/stderr from first test result for normalized envelope
    const firstResult = evaluation.testResults?.[0] || {};
    const stdout = firstResult.stdout || '';
    const stderr = firstResult.stderr || (evaluation.verdict !== 'Accepted' ? evaluation.verdict : '');

    // Log attempt telemetry
    const logEntry = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      clientKey,
      attemptId: attemptId || null,
      questionId: questionId || null,
      language,
      status: evaluation.verdict,
      executionTimeMs: firstResult.timeMs || 0,
      timestamp: new Date().toISOString()
    };
    executionAuditLogs.push(logEntry);
    if (executionAuditLogs.length > 500) executionAuditLogs.shift();

    return res.json({
      success: evaluation.verdict !== 'Service Unavailable',
      type: 'test_cases',
      stdout,
      stderr,
      exitCode: evaluation.passed ? 0 : 1,
      executionTimeMs: firstResult.timeMs || 0,
      timedOut: evaluation.verdict === 'Time Limit Exceeded',
      status: evaluation.verdict,
      evaluation
    });
  } catch (err) {
    console.error('Error in /code/run:', err);
    return res.status(500).json({
      success: false,
      error: 'Code execution service is temporarily unavailable — you can still write and submit your code, it will be evaluated shortly.',
      stdout: '',
      stderr: err.message,
      exitCode: 1,
      executionTimeMs: 0,
      timedOut: false,
      status: 'Service Unavailable'
    });
  } finally {
    inFlightExecutions.delete(clientKey);
    lastExecutionTimes.set(clientKey, Date.now());
  }
});

// POST /api/code/submit & POST /code/submit (Asynchronous submission via BullMQ / Queue)
router.post('/submit', optionalAuthToken, async (req, res) => {
  const clientKey = getClientKey(req);

  if (inFlightExecutions.has(clientKey)) {
    return res.status(429).json({
      success: false,
      error: 'A submission or execution is already in progress. Please wait.'
    });
  }

  inFlightExecutions.add(clientKey);

  try {
    const {
      questionId,
      question_id,
      assessmentQuestionId,
      language,
      sourceCode,
      testCases: clientTestCases
    } = req.body;

    const primaryId = questionId || question_id || assessmentQuestionId;
    const secondaryId = question_id || questionId || assessmentQuestionId;

    if (!primaryId || !language || typeof sourceCode !== 'string') {
      inFlightExecutions.delete(clientKey);
      return res.status(400).json({
        success: false,
        error: 'questionId, language, and sourceCode are required.'
      });
    }

    // Enqueue submission job asynchronously (Stage 3 Scaling)
    const job = await addSubmissionJob({
      questionId: primaryId,
      question_id: secondaryId,
      assessmentQuestionId: req.body.assessmentQuestionId,
      language,
      sourceCode,
      testCases: clientTestCases,
      clientKey
    });

    // Respond immediately with HTTP 202 Accepted to keep gateway threads completely free
    return res.status(202).json({
      success: true,
      queued: true,
      jobId: job.id,
      status: 'queued',
      streamUrl: `/api/code/submissions/${job.id}/stream`,
      statusUrl: `/api/code/submissions/${job.id}/status`,
      message: 'Submission enqueued for asynchronous evaluation.'
    });
  } catch (err) {
    console.error('Error submitting code to queue:', err);
    return res.status(500).json({
      success: false,
      error: 'Code execution queue is temporarily unavailable. Please retry.'
    });
  } finally {
    inFlightExecutions.delete(clientKey);
    lastExecutionTimes.set(clientKey, Date.now());
  }
});

// GET /api/code/submissions/:jobId/stream (Real-time SSE status streaming)
router.get('/submissions/:jobId/stream', async (req, res) => {
  const { jobId } = req.params;
  const job = await getSubmissionJob(jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Submission job not found.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  // If already finished, emit terminal event immediately
  if (job.status === 'completed') {
    res.write(`data: ${JSON.stringify({ status: 'completed', progress: 100, result: job.result })}\n\n`);
    return res.end();
  }
  if (job.status === 'failed') {
    res.write(`data: ${JSON.stringify({ status: 'failed', error: job.error })}\n\n`);
    return res.end();
  }

  // Initial state notification
  res.write(`data: ${JSON.stringify({ status: job.status, progress: job.progress || 0 })}\n\n`);

  const unsubscribe = subscribeJobEvents(jobId, {
    onProgress: (prog) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ status: 'evaluating', ...prog })}\n\n`);
      }
    },
    onCompleted: (result) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ status: 'completed', progress: 100, result })}\n\n`);
        res.end();
      }
    },
    onFailed: (error) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ status: 'failed', error })}\n\n`);
        res.end();
      }
    }
  });

  req.on('close', () => {
    unsubscribe();
  });
});

// GET /api/code/submissions/:jobId/status (REST polling fallback endpoint)
router.get('/submissions/:jobId/status', async (req, res) => {
  const { jobId } = req.params;
  const job = await getSubmissionJob(jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Submission job not found.' });
  }

  res.json({
    success: true,
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error
  });
});

export default router;
