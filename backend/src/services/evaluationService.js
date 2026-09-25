import { pool } from '../db/pool.js';
import { getSubmissionJob } from '../queues/submissionQueue.js';
import { evaluateCodeAgainstTestCases } from './codeExecutionService.js';

/**
 * Deterministic Authoritative Evaluation Service
 * Evaluates candidate exam answers against PostgreSQL question answer keys.
 * Formula: Math.round((correctCount / totalQuestions) * 100)
 */

export const calculateDeterministicScore = (obtainedMarks, totalMarks) => {
  const total = Math.max(1, totalMarks || 1);
  return Math.min(100, Math.max(0, Math.round((obtainedMarks / total) * 100)));
};

export const evaluateSubmission = async ({
  assessmentId,
  answers = {},
  questionIds = [],
  totalQuestions: expectedTotalQuestions,
  dbClient = pool,
}) => {
  const answerEntries = typeof answers === 'object' && answers !== null ? answers : {};
  const answeredQuestionIds = Object.keys(answerEntries);

  // Combine provided questionIds and answeredQuestionIds into a unified unique set
  const allQuestionIds = Array.from(new Set([
    ...(Array.isArray(questionIds) ? questionIds : []),
    ...answeredQuestionIds
  ]));

  let assessmentQuestions = [];
  let assessmentMeta = null;

  // 1. Fetch assessment metadata if assessmentId is provided
  if (assessmentId) {
    try {
      const asmRes = await dbClient.query(
        'SELECT id, title, total_questions, passing_score, total_marks FROM assessments WHERE id = $1',
        [assessmentId]
      );
      if (asmRes.rows.length > 0) {
        assessmentMeta = asmRes.rows[0];
      }
    } catch (err) {
      console.warn('Could not query assessments:', err.message);
    }
  }

  // 2. Fetch authoritative question details using all question IDs from assessment_questions or questions table
  if (allQuestionIds.length > 0) {
    try {
      if (assessmentId) {
        const aqRes = await dbClient.query(
          `SELECT aq.question_id as id, aq.correct_answer, aq.marks, aq.category, aq.topic, q.type,
                  COALESCE(aq.test_cases, q.test_cases) as test_cases, q.language
           FROM assessment_questions aq
           LEFT JOIN questions q ON aq.question_id = q.id
           WHERE aq.assessment_id = $1 AND aq.question_id = ANY($2::varchar[])`,
          [assessmentId, allQuestionIds]
        );
        if (aqRes.rows.length > 0) {
          assessmentQuestions = aqRes.rows;
        }
      }

      // If not in assessment_questions or partial, fetch from questions table
      if (assessmentQuestions.length < allQuestionIds.length) {
        const foundIds = new Set(assessmentQuestions.map(q => q.id));
        const missingIds = allQuestionIds.filter(id => !foundIds.has(id));
        const qRes = await dbClient.query(
          `SELECT id, correct_answer, marks, category, topic, type, test_cases, language
           FROM questions
           WHERE id = ANY($1::varchar[])`,
          [missingIds]
        );
        assessmentQuestions = [...assessmentQuestions, ...qRes.rows];
      }
    } catch (err) {
      console.error('Error fetching questions from DB:', err.message);
    }
  }

  // Build lookup map of authoritative questions: id -> question data
  const questionMap = new Map();
  assessmentQuestions.forEach((q) => {
    questionMap.set(q.id, {
      id: q.id,
      correctAnswer: (q.correct_answer || '').trim().toUpperCase(),
      category: (q.category || 'General').trim(),
      topic: (q.topic || 'General').trim(),
      type: q.type,
      marks: Number(q.marks) > 0 ? Number(q.marks) : 1,
      test_cases: q.test_cases,
      language: q.language
    });
  });

  let totalPossibleMarks = 0;
  let totalObtainedMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const categoryStats = {};
  const topicStats = {};

  if (questionMap.size > 0) {
    for (const [qId, q] of questionMap.entries()) {
      const qMarks = q.marks;
      const qTopic = q.topic || 'General';

      const userAnswer = answerEntries[qId];
      const isCodingAnswer = typeof userAnswer === 'object' && userAnswer !== null && (userAnswer.code !== undefined || userAnswer.score !== undefined);

      const qType = String(q.type || '').toLowerCase();
      const qCat = String(q.category || '').toLowerCase();
      const qIdStr = String(q.id || '').toLowerCase();
      const hasTC = (Array.isArray(q.test_cases) && q.test_cases.length > 0) ||
        (Array.isArray(q.testCases) && q.testCases.length > 0) ||
        (typeof q.test_cases === 'string' && q.test_cases.trim() !== '' && q.test_cases !== '[]' && q.test_cases !== 'null') ||
        (typeof q.testCases === 'string' && q.testCases.trim() !== '' && q.testCases !== '[]' && q.testCases !== 'null');
      const isCodingQ = isCodingAnswer || qType === 'coding' || qCat === 'coding' || qIdStr.startsWith('code-') || hasTC;

      const effectiveCategory = isCodingQ ? 'Coding' : (q.category || 'Technical');

      totalPossibleMarks += qMarks;

      if (!categoryStats[effectiveCategory]) {
        categoryStats[effectiveCategory] = { totalMarks: 0, obtainedMarks: 0, totalQuestions: 0, correctCount: 0 };
      }
      categoryStats[effectiveCategory].totalMarks += qMarks;
      categoryStats[effectiveCategory].totalQuestions += 1;

      if (!topicStats[qTopic]) {
        topicStats[qTopic] = {
          topic: qTopic,
          category: effectiveCategory,
          totalMarks: 0,
          obtainedMarks: 0,
          totalQuestions: 0,
          correctCount: 0,
          incorrectCount: 0,
          unansweredCount: 0,
        };
      }
      topicStats[qTopic].totalMarks += qMarks;
      topicStats[qTopic].totalQuestions += 1;

      const hasAnswered = isCodingAnswer || (userAnswer !== undefined && userAnswer !== null && String(userAnswer).trim() !== '');

      if (hasAnswered) {
        if (isCodingAnswer) {
          let codingScorePct = 0;

          // 1. Authoritative verification via completed queue jobId
          const jobId = userAnswer.jobId || userAnswer.submissionId;
          if (jobId) {
            try {
              const job = await getSubmissionJob(String(jobId));
              if (job && (job.status === 'completed' || job.result?.evaluation)) {
                codingScorePct = Number(job.result?.evaluation?.score ?? 0);
              }
            } catch (err) {
              console.warn(`Could not verify coding submission job ${jobId}:`, err.message);
            }
          }

          // 2. If no valid jobId was found, but source code is present, authoritatively execute against test cases
          if (codingScorePct === 0 && typeof userAnswer.code === 'string' && userAnswer.code.trim().length > 0) {
            let tc = q.test_cases;
            if (typeof tc === 'string') {
              try { tc = JSON.parse(tc); } catch { tc = []; }
            }
            if (Array.isArray(tc) && tc.length > 0) {
              try {
                const evalRes = await evaluateCodeAgainstTestCases({
                  language: userAnswer.language || q.language || 'python',
                  sourceCode: userAnswer.code,
                  testCases: tc,
                  includeHiddenDetails: false,
                  timeoutMs: 6000
                });
                if (evalRes && typeof evalRes.score === 'number') {
                  codingScorePct = evalRes.score;
                }
              } catch (evalErr) {
                console.warn(`Authoritative evaluation fallback error for ${qId}:`, evalErr.message);
              }
            }
          }

          // Compute earned marks based on verified coding score percentage
          const earned = Math.round((codingScorePct / 100) * qMarks);
          totalObtainedMarks += earned;
          categoryStats[effectiveCategory].obtainedMarks += earned;
          topicStats[qTopic].obtainedMarks += earned;

          if (codingScorePct >= 60) {
            correctCount += 1;
            categoryStats[effectiveCategory].correctCount += 1;
            topicStats[qTopic].correctCount += 1;
          } else {
            incorrectCount += 1;
            topicStats[qTopic].incorrectCount += 1;
          }
        } else {
          const isCorrect = String(userAnswer).trim().toUpperCase() === q.correctAnswer;
          if (isCorrect) {
            correctCount += 1;
            totalObtainedMarks += qMarks;

            categoryStats[effectiveCategory].correctCount += 1;
            categoryStats[effectiveCategory].obtainedMarks += qMarks;

            topicStats[qTopic].correctCount += 1;
            topicStats[qTopic].obtainedMarks += qMarks;
          } else {
            incorrectCount += 1;
            topicStats[qTopic].incorrectCount += 1;
          }
        }
      } else {
        unansweredCount += 1;
        topicStats[qTopic].unansweredCount += 1;
      }
    }
  } else {
    // Fallback if questions table had no matching IDs
    answeredQuestionIds.forEach((qId) => {
      totalPossibleMarks += 1;
      if (answerEntries[qId]) {
        incorrectCount += 1;
      }
    });
  }

  const totalQuestions = Math.max(
    1,
    Number(expectedTotalQuestions) ||
      assessmentMeta?.total_questions ||
      questionMap.size ||
      answeredQuestionIds.length ||
      1
  );

  const attemptedCount = correctCount + incorrectCount;
  if (questionMap.size === 0) {
    unansweredCount = Math.max(0, totalQuestions - attemptedCount);
  }

  // Accurate overall score based on marks obtained vs total marks
  const score = calculateDeterministicScore(totalObtainedMarks, totalPossibleMarks);
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  // Helper function to normalize category to one of the 5 standard sections
  const normalizeSection = (rawCat) => {
    const c = (rawCat || '').toLowerCase().trim();
    if (c.includes('code') || c.includes('prog')) return 'coding';
    if (c.includes('apt') || c.includes('quant') || c.includes('math')) return 'aptitude';
    if (c.includes('reason') || c.includes('logic')) return 'reasoning';
    if (c.includes('verbal') || c.includes('eng')) return 'verbal';
    if (c.includes('tech')) return 'technical';
    return c || 'technical';
  };

  // Build category scores based on marks with section normalization
  const categoryScores = {
    aptitude: 0,
    reasoning: 0,
    technical: 0,
    verbal: 0,
    coding: 0,
  };

  // Intermediate accumulator for normalized sections
  const normalizedCategoryStats = {
    aptitude: { totalMarks: 0, obtainedMarks: 0 },
    reasoning: { totalMarks: 0, obtainedMarks: 0 },
    technical: { totalMarks: 0, obtainedMarks: 0 },
    verbal: { totalMarks: 0, obtainedMarks: 0 },
    coding: { totalMarks: 0, obtainedMarks: 0 },
  };

  Object.keys(categoryStats).forEach((cat) => {
    const s = categoryStats[cat];
    const normalizedKey = normalizeSection(cat);
    if (!normalizedCategoryStats[normalizedKey]) {
      normalizedCategoryStats[normalizedKey] = { totalMarks: 0, obtainedMarks: 0 };
    }
    normalizedCategoryStats[normalizedKey].totalMarks += s.totalMarks;
    normalizedCategoryStats[normalizedKey].obtainedMarks += s.obtainedMarks;
  });

  Object.keys(normalizedCategoryStats).forEach((sec) => {
    const s = normalizedCategoryStats[sec];
    if (s.totalMarks > 0) {
      categoryScores[sec] = Math.round((s.obtainedMarks / s.totalMarks) * 100);
    } else {
      categoryScores[sec] = 0;
    }
  });

  // Track which sections were actually tested in this assessment
  const sectionsTested = {
    aptitude: normalizedCategoryStats.aptitude.totalMarks > 0,
    reasoning: normalizedCategoryStats.reasoning.totalMarks > 0,
    technical: normalizedCategoryStats.technical.totalMarks > 0,
    verbal: normalizedCategoryStats.verbal.totalMarks > 0,
    coding: normalizedCategoryStats.coding.totalMarks > 0,
  };

  // Build topic breakdown with accurate topic marks & performance
  const topicBreakdown = Object.keys(topicStats).map((topic) => {
    const s = topicStats[topic];
    const topicScore = s.totalMarks > 0 ? Math.round((s.obtainedMarks / s.totalMarks) * 100) : 0;
    let status = 'Needs Review';
    if (topicScore >= 85) status = 'Mastered';
    else if (topicScore >= 70) status = 'Strong';
    else if (topicScore >= 50) status = 'Average';
    else status = 'Weak';

    const attempted = s.correctCount + s.incorrectCount;

    return {
      topic: s.topic,
      category: s.category,
      score: topicScore,
      obtainedMarks: s.obtainedMarks,
      totalMarks: s.totalMarks,
      correctCount: s.correctCount,
      incorrectCount: s.incorrectCount,
      unansweredCount: s.unansweredCount,
      totalQuestions: s.totalQuestions,
      accuracy: attempted > 0 ? Math.round((s.correctCount / attempted) * 100) : 0,
      status,
    };
  });

  return {
    score,
    accuracy,
    obtainedMarks: totalObtainedMarks,
    totalMarks: totalPossibleMarks,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalQuestions,
    categoryScores,
    sectionsTested,
    topicBreakdown,
  };
};
