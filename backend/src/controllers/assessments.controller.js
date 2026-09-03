import { pool } from '../db/pool.js';
import crypto from 'crypto';

let assessmentsCache = null;
let lastAssessmentsFetch = 0;
const CACHE_TTL_MS = 3000;

export const clearAssessmentsCache = () => {
  assessmentsCache = null;
  lastAssessmentsFetch = 0;
};

// GET /api/assessments
export const getAllAssessments = async (req, res) => {
  try {
    const now = Date.now();
    if (assessmentsCache && (now - lastAssessmentsFetch < CACHE_TTL_MS)) {
      return res.json(assessmentsCache);
    }

    const result = await pool.query('SELECT * FROM assessments ORDER BY created_at DESC');
    const responsePayload = { success: true, data: result.rows };

    assessmentsCache = responsePayload;
    lastAssessmentsFetch = now;

    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/assessments/:id
export const getAssessmentById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessments WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assessment not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/assessments  (admin only)
export const createAssessment = async (req, res) => {
  const { id: customId, title, category, description, difficulty, durationMinutes, totalQuestions, passingScore } = req.body;
  const id = customId || `asm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  try {
    clearAssessmentsCache();
    const result = await pool.query(
      `INSERT INTO assessments (id, title, category, description, difficulty, duration_minutes, total_questions, passing_score, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         difficulty = EXCLUDED.difficulty,
         duration_minutes = EXCLUDED.duration_minutes,
         total_questions = EXCLUDED.total_questions,
         passing_score = EXCLUDED.passing_score,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, title, category || 'Technical', description || null, difficulty || 'Medium', Number(durationMinutes) || 30, Number(totalQuestions) || 10, Number(passingScore) || 65, req.user?.id || 'admin']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/assessments/:id
export const updateAssessment = async (req, res) => {
  const { title, category, description, difficulty, durationMinutes, totalQuestions, passingScore, status } = req.body;
  try {
    clearAssessmentsCache();
    const result = await pool.query(
      `UPDATE assessments SET title=$1, category=$2, description=$3, difficulty=$4,
       duration_minutes=$5, total_questions=$6, passing_score=$7, status=$8 WHERE id=$9 RETURNING *`,
      [title, category, description, difficulty, durationMinutes, totalQuestions, passingScore, status, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/assessments/:id
export const deleteAssessment = async (req, res) => {
  try {
    clearAssessmentsCache();
    await pool.query('DELETE FROM assessments WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Assessment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
