import express from 'express';
import {
  executeSingleCode,
  evaluateCodeAgainstTestCases,
  isLanguageSupported,
  LANGUAGE_CONFIG
} from '../services/codeExecutionService.js';
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
      const execResult = await executeSingleCode({
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

// POST /api/code/submit & POST /code/submit (Authoritative evaluation against question's test cases)
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
      return res.status(400).json({
        success: false,
        error: 'questionId, language, and sourceCode are required.'
      });
    }

    // 1. Fetch authoritative test cases from questions table
    let qRes = await pool.query(
      `SELECT id, type, question, options, test_cases, marks, time_limit_sec
       FROM questions
       WHERE id = $1 OR id = $2`,
      [primaryId, secondaryId]
    );

    let question = qRes.rows[0];

    // 2. If not found directly, check assessment_questions table
    if (!question) {
      const aqRes = await pool.query(
        `SELECT aq.id, aq.question_id, q.type, q.question, aq.options,
                COALESCE(aq.test_cases, q.test_cases) as test_cases,
                aq.marks, q.time_limit_sec
         FROM assessment_questions aq
         LEFT JOIN questions q ON aq.question_id = q.id
         WHERE aq.id = $1 OR aq.question_id = $1 OR aq.id = $2 OR aq.question_id = $2`,
        [primaryId, secondaryId]
      );
      if (aqRes.rows.length > 0) {
        question = aqRes.rows[0];
      }
    }

    let testCases = [];
    let marksPerQuestion = 10;

    if (question) {
      marksPerQuestion = Number(question.marks) > 0 ? Number(question.marks) : 10;
      if (Array.isArray(question.test_cases)) {
        testCases = question.test_cases;
      } else if (typeof question.test_cases === 'string') {
        try { testCases = JSON.parse(question.test_cases); } catch (e) {}
      } else if (Array.isArray(question.options) && question.type === 'Coding') {
        testCases = question.options;
      }
    }

    // 3. Fallback to client-provided test cases if database query yielded no test cases
    if ((!testCases || testCases.length === 0) && Array.isArray(clientTestCases) && clientTestCases.length > 0) {
      testCases = clientTestCases;
    }

    if (!testCases || testCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No test cases configured for this coding challenge.'
      });
    }

    // Execute solution code against all test cases in remote sandbox
    const evaluation = await evaluateCodeAgainstTestCases({
      language,
      sourceCode,
      testCases,
      includeHiddenDetails: false,
      timeoutMs: 8000
    });

    const marks = marksPerQuestion;
    const earnedMarks = Math.round((evaluation.score / 100) * marks);

    const sampleTests = evaluation.testResults.filter(t => !t.isHidden);
    const hiddenTests = evaluation.testResults.filter(t => t.isHidden);
    const samplePassed = sampleTests.filter(t => t.passed).length;
    const hiddenPassed = hiddenTests.filter(t => t.passed).length;

    return res.json({
      success: true,
      questionId: primaryId,
      language,
      earnedMarks,
      maxMarks: marks,
      summary: {
        totalTests: testCases.length,
        passedTests: evaluation.passedTests,
        sampleTotal: sampleTests.length,
        samplePassed,
        hiddenTotal: hiddenTests.length,
        hiddenPassed,
        allHiddenPassed: hiddenTests.length === 0 || hiddenPassed === hiddenTests.length
      },
      evaluation
    });
  } catch (err) {
    console.error('Error submitting code:', err);
    return res.status(500).json({
      success: false,
      error: 'Code execution service is temporarily unavailable — you can still write and submit your code, it will be evaluated shortly.'
    });
  } finally {
    inFlightExecutions.delete(clientKey);
    lastExecutionTimes.set(clientKey, Date.now());
  }
});

export default router;
