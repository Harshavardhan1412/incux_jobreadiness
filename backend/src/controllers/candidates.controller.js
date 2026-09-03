import { pool } from '../db/pool.js';

let candidatesCache = null;
let lastCandidatesFetch = 0;
const CACHE_TTL_MS = 3000;

export const clearCandidatesCache = () => {
  candidatesCache = null;
  lastCandidatesFetch = 0;
};

// GET /api/candidates
export const getAllCandidates = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(s.latest_score, c.job_readiness_score, 0) as job_readiness_score,
        COALESCE(s.latest_score, c.job_readiness_score, 0) as overall_score,
        CASE WHEN s.latest_score IS NOT NULL OR c.assessments_completed > 0 THEN 'Completed' ELSE COALESCE(c.readiness_status, 'Active') END as assessment_status
      FROM candidates c
      LEFT JOIN (
        SELECT DISTINCT ON (LOWER(candidate_email), candidate_id)
          candidate_id,
          candidate_email,
          score as latest_score,
          created_at
        FROM assessment_submissions
        ORDER BY LOWER(candidate_email), candidate_id, created_at DESC
      ) s ON c.id = s.candidate_id OR LOWER(c.email) = LOWER(s.candidate_email)
      ORDER BY c.created_at DESC
    `);
    const responsePayload = { success: true, data: result.rows, total: result.rowCount };

    candidatesCache = responsePayload;
    lastCandidatesFetch = now;

    res.json(responsePayload);
  } catch (err) {
    console.error('getAllCandidates error:', err.message);
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
    clearCandidatesCache();
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
    clearCandidatesCache();
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
      'SELECT * FROM assessment_submissions WHERE candidate_id=$1 OR candidate_email IN (SELECT email FROM candidates WHERE id=$1) ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
