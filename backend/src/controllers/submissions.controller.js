import { pool } from '../db/pool.js';
import crypto from 'crypto';
import { evaluateSubmission } from '../services/evaluationService.js';

// POST /api/submissions
export const submitAssessment = async (req, res) => {
  const {
    assessmentId,
    assessmentTitle,
    candidateId: bodyCandId,
    candidateName,
    candidateEmail,
    score: clientScore,
    accuracy: clientAccuracy,
    correctCount: clientCorrectCount,
    incorrectCount: clientIncorrectCount,
    unansweredCount: clientUnansweredCount,
    totalQuestions: clientTotalQuestions,
    timeTaken,
    categoryScores: clientCategoryScores,
    topicBreakdown: clientTopicBreakdown,
    questionIds,
    answers
  } = req.body;

  const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const candidateId = req.user?.id || bodyCandId || 'cand-user';
  const email = req.user?.email || candidateEmail || null;
  const name = req.user?.name || candidateName || 'Candidate Student';
  const asmId = assessmentId || 'asm-1';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Authoritative Backend Scoring
    // Calculate deterministic scores using stored answer keys in PostgreSQL
    const evaluation = await evaluateSubmission({
      assessmentId: asmId,
      answers: answers || {},
      questionIds: questionIds || [],
      totalQuestions: clientTotalQuestions,
      dbClient: client,
    });

    const finalScore = evaluation.score;
    const finalAccuracy = evaluation.accuracy;
    const finalCorrectCount = evaluation.correctCount;
    const finalIncorrectCount = evaluation.incorrectCount;
    const finalUnansweredCount = evaluation.unansweredCount;
    const finalCategoryScores = clientCategoryScores || evaluation.categoryScores;
    const finalTopicBreakdown = (clientTopicBreakdown && clientTopicBreakdown.length > 0)
      ? clientTopicBreakdown
      : evaluation.topicBreakdown;

    // 2. Check for existing submission by candidate for this assessment
    const existingSubmission = await client.query(
      `SELECT id, score, accuracy, created_at FROM assessment_submissions 
       WHERE candidate_id = $1 AND assessment_id = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [candidateId, asmId]
    );

    if (existingSubmission.rows.length > 0) {
      const timeDiff = Date.now() - new Date(existingSubmission.rows[0].created_at).getTime();
      // If submitted within 2 seconds, treat as idempotent duplicate submission
      if (timeDiff < 2000) {
        await client.query('COMMIT');
        return res.status(200).json({
          success: true,
          message: 'Idempotent submission received.',
          data: existingSubmission.rows[0],
        });
      }

      // Candidate is retaking - update with new score
      const updateResult = await client.query(
        `UPDATE assessment_submissions SET
           score = $1, accuracy = $2, correct_count = $3, incorrect_count = $4,
           unanswered_count = $5, time_taken = $6, category_scores = $7,
           topic_breakdown = $8, answers = $9, created_at = CURRENT_TIMESTAMP
         WHERE id = $10
         RETURNING *`,
        [
          finalScore,
          finalAccuracy,
          finalCorrectCount,
          finalIncorrectCount,
          finalUnansweredCount,
          timeTaken || '28 min',
          JSON.stringify(finalCategoryScores),
          JSON.stringify(finalTopicBreakdown),
          JSON.stringify(answers || {}),
          existingSubmission.rows[0].id
        ]
      );

      const readinessStatus = finalScore >= 65 ? 'Job Ready' : 'In Progress';
      await client.query(
        `UPDATE candidates SET
           job_readiness_score = $1,
           readiness_level = $2,
           readiness_status = 'Completed',
           assessments_completed = COALESCE(assessments_completed, 0) + 1
         WHERE id = $3 OR LOWER(email) = LOWER($4)`,
        [finalScore, readinessStatus, candidateId, email || '']
      );

      await client.query('COMMIT');
      return res.status(200).json({ success: true, data: updateResult.rows[0] });
    }

    // 3. Insert into assessment_submissions table
    const result = await client.query(
      `INSERT INTO assessment_submissions 
       (id, candidate_id, candidate_name, candidate_email, assessment_id, assessment_title, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        id,
        candidateId,
        name,
        email,
        asmId,
        assessmentTitle || 'Technical Assessment',
        finalScore,
        finalAccuracy,
        finalCorrectCount,
        finalIncorrectCount,
        finalUnansweredCount,
        timeTaken || '28 min',
        JSON.stringify(finalCategoryScores),
        JSON.stringify(finalTopicBreakdown),
        JSON.stringify(answers || {})
      ]
    );

    // 4. Also insert into legacy submissions table for backwards compatibility
    await client.query(
      `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, candidateId, asmId, finalScore, finalAccuracy,
        finalCorrectCount, finalIncorrectCount, finalUnansweredCount,
        timeTaken || '28 min', JSON.stringify(finalCategoryScores), JSON.stringify(finalTopicBreakdown),
        JSON.stringify(answers || {})
      ]
    );

    // 5. Update candidate overall score and status in candidates table
    const readinessStatus = finalScore >= 65 ? 'Job Ready' : 'In Progress';

    await client.query(
      `UPDATE candidates SET
         job_readiness_score = $1,
         readiness_level = $2,
         readiness_status = 'Completed',
         assessments_completed = COALESCE(assessments_completed, 0) + 1
       WHERE id = $3 OR LOWER(email) = LOWER($4)`,
      [finalScore, readinessStatus, candidateId, email || '']
    );

    await client.query('COMMIT');

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Assessment has already been submitted by this candidate.',
        message: 'Assessment has already been submitted by this candidate.',
      });
    }
    console.error('Submission controller error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
};

// GET /api/submissions  (admin view of all submissions)
export const getAllSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name as candidate_name, c.email as candidate_email, c.college
       FROM assessment_submissions s
       LEFT JOIN candidates c ON s.candidate_id = c.id OR LOWER(s.candidate_email) = LOWER(c.email)
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/submissions/my  (candidate's own submissions)
export const getMySubmissions = async (req, res) => {
  try {
    const candId = req.user?.id || '';
    const candEmail = req.user?.email || '';
    const result = await pool.query(
      `SELECT s.*, a.title as assessment_title, a.category
       FROM assessment_submissions s
       LEFT JOIN assessments a ON s.assessment_id = a.id
       WHERE s.candidate_id = $1 OR LOWER(s.candidate_email) = LOWER($2)
       ORDER BY s.created_at DESC`,
      [candId, candEmail]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
