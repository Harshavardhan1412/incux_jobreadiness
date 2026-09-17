import express from 'express';
import { executeSingleCode, evaluateCodeAgainstTestCases, isLanguageSupported } from '../services/codeExecutionService.js';
import { pool } from '../db/pool.js';
import { authenticateToken, optionalAuthToken } from '../middleware/auth.js';

const router = express.Router();

// Supported Language Metadata & Boilerplate Templates (Input Format Only)
const STARTER_TEMPLATES = {
  python: `# Python 3
import sys

def main():
    # Read input from standard input (stdin)
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    
    # Write your solution below

if __name__ == '__main__':
    main()
`,
  javascript: `// JavaScript (Node.js)
const fs = require('fs');

function main() {
    // Read input from standard input (stdin)
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;

    // Write your solution below

}

main();
`,
  cpp: `// C++ (GCC)
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Read input from standard input (cin)
    // Write your solution below

    return 0;
}
`,
  java: `// Java (OpenJDK)
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        // Read input from standard input (scanner)
        // Write your solution below

        scanner.close();
    }
}
`
};

// GET /api/code/languages
router.get('/languages', (_req, res) => {
  res.json({
    success: true,
    languages: [
      { id: 'python', name: 'Python', version: '3.14.4', template: STARTER_TEMPLATES.python },
      { id: 'javascript', name: 'JavaScript', version: 'Node.js 24.15', template: STARTER_TEMPLATES.javascript },
      { id: 'cpp', name: 'C++', version: 'GCC 14.2.0', template: STARTER_TEMPLATES.cpp },
      { id: 'java', name: 'Java', version: 'OpenJDK 22', template: STARTER_TEMPLATES.java }
    ]
  });
});

// POST /api/code/run (Run against sample test cases or custom input)
router.post('/run', async (req, res) => {
  try {
    const { language, sourceCode, stdin, testCases } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({ error: 'Both language and sourceCode are required.' });
    }

    if (!isLanguageSupported(language)) {
      return res.status(400).json({ error: `Language '${language}' is not supported.` });
    }

    // Case 1: Custom Stdin execution
    if (typeof stdin === 'string' && (!testCases || testCases.length === 0)) {
      const execResult = await executeSingleCode({
        language,
        sourceCode,
        stdin,
        timeoutMs: 4000
      });
      return res.json({
        success: true,
        type: 'custom',
        result: execResult
      });
    }

    // Case 2: Batch sample test cases execution
    const testCasesToRun = Array.isArray(testCases) ? testCases : [];
    const evaluation = await evaluateCodeAgainstTestCases({
      language,
      sourceCode,
      testCases: testCasesToRun,
      includeHiddenDetails: false,
      timeoutMs: 4000
    });

    res.json({
      success: true,
      type: 'test_cases',
      evaluation
    });
  } catch (err) {
    console.error('Error running code:', err);
    res.status(500).json({ error: err.message || 'Failed to execute code' });
  }
});

// POST /api/code/submit (Authoritative evaluation against question's test cases)
router.post('/submit', async (req, res) => {
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

    if (!primaryId || !language || !sourceCode) {
      return res.status(400).json({ error: 'questionId, language, and sourceCode are required.' });
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
      return res.status(400).json({ error: 'No test cases configured for this coding challenge.' });
    }

    // Execute solution code against all test cases (both visible and hidden)
    const evaluation = await evaluateCodeAgainstTestCases({
      language,
      sourceCode,
      testCases,
      includeHiddenDetails: false,
      timeoutMs: 4000
    });

    const marks = marksPerQuestion;
    const earnedMarks = Math.round((evaluation.score / 100) * marks);

    // Compute metrics on visible vs hidden test cases
    const sampleTests = evaluation.testResults.filter(t => !t.isHidden);
    const hiddenTests = evaluation.testResults.filter(t => t.isHidden);
    const samplePassed = sampleTests.filter(t => t.passed).length;
    const hiddenPassed = hiddenTests.filter(t => t.passed).length;

    res.json({
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
    res.status(500).json({ error: err.message || 'Failed to submit code' });
  }
});

export default router;
