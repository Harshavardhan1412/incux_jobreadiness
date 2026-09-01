import { pool } from '../db/pool.js';

// GET /api/candidates
export const getAllCandidates = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/candidates/:id
export const getCandidateById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM candidates WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/candidates/:id
export const updateCandidate = async (req, res) => {
  const { name, mobile, college, degree, branch, graduationYear, experienceLevel } = req.body;
  try {
    const result = await pool.query(
      `UPDATE candidates SET name=$1, mobile=$2, college=$3, degree=$4, branch=$5,
       graduation_year=$6, experience_level=$7 WHERE id=$8 RETURNING *`,
      [name, mobile, college, degree, branch, graduationYear, experienceLevel, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/candidates/:id
export const deleteCandidate = async (req, res) => {
  try {
    await pool.query('DELETE FROM candidates WHERE id=$1', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Candidate deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/candidates/:id/submissions
export const getCandidateSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM submissions WHERE candidate_id=$1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
