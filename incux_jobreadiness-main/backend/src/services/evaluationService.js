import { pool } from '../db/pool.js';

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
          `SELECT question_id as id, correct_answer, marks, category, topic
           FROM assessment_questions
           WHERE assessment_id = $1 AND question_id = ANY($2::varchar[])`,
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
          `SELECT id, correct_answer, marks, category, topic
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
      marks: Number(q.marks) > 0 ? Number(q.marks) : 1,
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
    questionMap.forEach((q, qId) => {
      const qMarks = q.marks;
      const qTopic = q.topic;
      const qCategory = q.category;

      totalPossibleMarks += qMarks;

      if (!categoryStats[qCategory]) {
        categoryStats[qCategory] = { totalMarks: 0, obtainedMarks: 0, totalQuestions: 0, correctCount: 0 };
      }
      categoryStats[qCategory].totalMarks += qMarks;
      categoryStats[qCategory].totalQuestions += 1;

      if (!topicStats[qTopic]) {
        topicStats[qTopic] = {
          topic: qTopic,
          category: qCategory,
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

      const userAnswer = answerEntries[qId];
      const isCodingAnswer = typeof userAnswer === 'object' && userAnswer !== null && (userAnswer.code !== undefined || userAnswer.score !== undefined);
      const hasAnswered = isCodingAnswer || (userAnswer !== undefined && userAnswer !== null && String(userAnswer).trim() !== '');

      if (hasAnswered) {
        if (isCodingAnswer) {
          const codingScorePct = Number(userAnswer.score ?? 0);
          const earned = Math.round((codingScorePct / 100) * qMarks);
          totalObtainedMarks += earned;
          categoryStats[qCategory].obtainedMarks += earned;
          topicStats[qTopic].obtainedMarks += earned;

          if (codingScorePct >= 60) {
            correctCount += 1;
            categoryStats[qCategory].correctCount += 1;
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

            categoryStats[qCategory].correctCount += 1;
            categoryStats[qCategory].obtainedMarks += qMarks;

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
    });
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

  // Helper function to normalize category to one of the 4 standard sections
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

  if (categoryStats['Coding'] && categoryStats['Coding'].totalMarks > 0) {
    categoryScores.coding = Math.round((categoryStats['Coding'].obtainedMarks / categoryStats['Coding'].totalMarks) * 100);
  } else if (categoryScores.technical > 0) {
    categoryScores.coding = categoryScores.technical;
  }

  // Build topic breakdown with accurate topic marks & performance
  const topicBreakdown = Object.keys(topicStats).map((topic) => {
    const s = topicStats[topic];
    const topicScore = s.totalMarks > 0 ? Math.round((s.obtainedMarks / s.totalMarks) * 100) : 0;
    let status = 'Needs Review';
    if (topicScore >= 85) status = 'Mastered';
    else if (topicScore >= 70) status = 'Strong';
    else if (topicScore >= 50) status = 'Average';
    else status = 'Weak';

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
    categoryScores: Object.keys(categoryScores).length > 0 ? categoryScores : { technical: score },
    topicBreakdown,
  };
};
