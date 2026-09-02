import { pool } from '../db/pool.js';
import crypto from 'crypto';

// POST /api/submissions
export const submitAssessment = async (req, res) => {
  const { assessmentId, score, accuracy, correctCount, incorrectCount, unansweredCount, timeTaken, categoryScores, topicBreakdown, answers } = req.body;
  const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const candidateId = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [id, candidateId, assessmentId, score, accuracy, correctCount, incorrectCount, unansweredCount, timeTaken,
       JSON.stringify(categoryScores), JSON.stringify(topicBreakdown), JSON.stringify(answers)]
    );
    // Update candidate overall scores
    await pool.query(
      `UPDATE candidates SET
         job_readiness_score = $1,
         assessments_completed = assessments_completed + 1
       WHERE id = $2`,
      [score, candidateId]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/submissions/my  (candidate's own submissions)
export const getMySubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, a.title as assessment_title, a.category
       FROM submissions s
       LEFT JOIN assessments a ON s.assessment_id = a.id
       WHERE s.candidate_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
