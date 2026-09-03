import { pool } from '../db/pool.js';
import crypto from 'crypto';

// POST /api/submissions
export const submitAssessment = async (req, res) => {
  const {
    assessmentId,
    assessmentTitle,
    candidateId: bodyCandId,
    candidateName,
    candidateEmail,
    score,
    accuracy,
    correctCount,
    incorrectCount,
    unansweredCount,
    timeTaken,
    categoryScores,
    topicBreakdown,
    answers
  } = req.body;

  const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const candidateId = req.user?.id || bodyCandId || 'cand-user';
  const email = req.user?.email || candidateEmail || null;
  const name = req.user?.name || candidateName || 'Candidate Student';

  try {
    // 1. Insert into assessment_submissions table
    const result = await pool.query(
      `INSERT INTO assessment_submissions 
       (id, candidate_id, candidate_name, candidate_email, assessment_id, assessment_title, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        id,
        candidateId,
        name,
        email,
        assessmentId || 'asm-1',
        assessmentTitle || 'Technical Assessment',
        Number(score) || 0,
        Number(accuracy) || 0,
        Number(correctCount) || 0,
        Number(incorrectCount) || 0,
        Number(unansweredCount) || 0,
        timeTaken || '28 min',
        JSON.stringify(categoryScores || {}),
        JSON.stringify(topicBreakdown || []),
        JSON.stringify(answers || {})
      ]
    );

    // Also insert into legacy submissions table for backwards compatibility
    await pool.query(
      `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, candidateId, assessmentId || 'asm-1', Number(score) || 0, Number(accuracy) || 0,
        Number(correctCount) || 0, Number(incorrectCount) || 0, Number(unansweredCount) || 0,
        timeTaken || '28 min', JSON.stringify(categoryScores || {}), JSON.stringify(topicBreakdown || []),
        JSON.stringify(answers || {})
      ]
    );

    // 2. Update candidate overall score and status in candidates table
    const readinessStatus = Number(score) >= 65 ? 'Job Ready' : 'In Progress';

    await pool.query(
      `UPDATE candidates SET
         job_readiness_score = $1,
         readiness_level = $2,
         readiness_status = 'Completed',
         assessments_completed = COALESCE(assessments_completed, 0) + 1
       WHERE id = $3 OR LOWER(email) = LOWER($4)`,
      [Number(score) || 0, readinessStatus, candidateId, email || '']
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Submission controller error:', err.message);
    res.status(500).json({ error: err.message });
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
