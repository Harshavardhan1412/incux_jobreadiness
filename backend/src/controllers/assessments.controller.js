import { pool } from '../db/pool.js';

// GET /api/assessments
export const getAllAssessments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assessments ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
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
  const { title, category, description, difficulty, durationMinutes, totalQuestions, passingScore } = req.body;
  const id = `asm-${Date.now()}`;
  try {
    const result = await pool.query(
      `INSERT INTO assessments (id, title, category, description, difficulty, duration_minutes, total_questions, passing_score, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, title, category, description, difficulty, durationMinutes, totalQuestions, passingScore, req.user?.id || 'admin']
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
    await pool.query('DELETE FROM assessments WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Assessment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
