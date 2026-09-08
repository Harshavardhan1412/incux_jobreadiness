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
        COALESCE(cp.id, c.id) as id,
        COALESCE(cp.name, u.name, 'Candidate') as name,
        COALESCE(cp.email, u.email) as email,
        cp.mobile,
        cp.college,
        cp.degree,
        cp.branch,
        cp.specialization,
        cp.country,
        cp.state,
        cp.city,
        cp.graduation_year,
        COALESCE(cp.experience_level, c.experience_level, 'Fresher') as experience_level,
        COALESCE(cp.tenth_marks, c.tenth_marks) as tenth_marks,
        COALESCE(cp.twelfth_diploma_marks, c.twelfth_diploma_marks) as twelfth_diploma_marks,
        COALESCE(cp.graduation_percentage, c.graduation_percentage) as graduation_percentage,
        COALESCE(cp.backlogs, c.backlogs, 0) as backlogs,
        COALESCE(c.job_readiness_score, s.latest_score, 0) as job_readiness_score,
        COALESCE(c.job_readiness_score, s.latest_score, 0) as overall_score,
        COALESCE(c.aptitude_score, NULLIF((s.category_scores->>'aptitude'), '')::int, NULLIF((s.category_scores->>'Aptitude'), '')::int, 0) as aptitude_score,
        COALESCE(c.reasoning_score, NULLIF((s.category_scores->>'reasoning'), '')::int, NULLIF((s.category_scores->>'Reasoning'), '')::int, 0) as reasoning_score,
        COALESCE(c.technical_score, NULLIF((s.category_scores->>'technical'), '')::int, NULLIF((s.category_scores->>'Technical'), '')::int, 0) as technical_score,
        COALESCE(c.verbal_score, NULLIF((s.category_scores->>'verbal'), '')::int, NULLIF((s.category_scores->>'Verbal'), '')::int, NULLIF((s.category_scores->>'english'), '')::int, 0) as verbal_score,
        COALESCE(c.assessments_completed, 0) as assessments_completed,
        CASE WHEN s.latest_score IS NOT NULL OR COALESCE(c.assessments_completed, 0) > 0 THEN 'Completed' ELSE 'Active' END as assessment_status,
        COALESCE(cp.created_at, c.created_at) as created_at
      FROM candidate_profiles cp
      LEFT JOIN candidates c ON cp.id = c.id
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (candidate_id)
          candidate_id,
          candidate_email,
          score as latest_score,
          category_scores,
          created_at
        FROM assessment_submissions
        ORDER BY candidate_id, created_at DESC
      ) s ON cp.id = s.candidate_id OR cp.user_id = s.candidate_id OR LOWER(cp.email) = LOWER(s.candidate_email)
      ORDER BY created_at DESC
    `);
    const responsePayload = { success: true, data: result.rows, total: result.rowCount };

    candidatesCache = responsePayload;
    lastCandidatesFetch = Date.now();

    res.json(responsePayload);
  } catch (err) {
    console.error('getAllCandidates error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/candidates/:id
export const getCandidateById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(cp.id, c.id) as id,
        COALESCE(cp.name, u.name, 'Candidate') as name,
        COALESCE(cp.email, u.email) as email,
        cp.mobile,
        cp.college,
        cp.degree,
        cp.branch,
        cp.specialization,
        cp.country,
        cp.state,
        cp.city,
        cp.graduation_year,
        COALESCE(cp.experience_level, c.experience_level, 'Fresher') as experience_level,
        COALESCE(cp.tenth_marks, c.tenth_marks) as tenth_marks,
        COALESCE(cp.twelfth_diploma_marks, c.twelfth_diploma_marks) as twelfth_diploma_marks,
        COALESCE(cp.graduation_percentage, c.graduation_percentage) as graduation_percentage,
        COALESCE(cp.backlogs, c.backlogs, 0) as backlogs,
        COALESCE(c.job_readiness_score, s.latest_score, 0) as job_readiness_score,
        COALESCE(c.job_readiness_score, s.latest_score, 0) as overall_score,
        COALESCE(c.aptitude_score, NULLIF((s.category_scores->>'aptitude'), '')::int, NULLIF((s.category_scores->>'Aptitude'), '')::int, 0) as aptitude_score,
        COALESCE(c.reasoning_score, NULLIF((s.category_scores->>'reasoning'), '')::int, NULLIF((s.category_scores->>'Reasoning'), '')::int, 0) as reasoning_score,
        COALESCE(c.technical_score, NULLIF((s.category_scores->>'technical'), '')::int, NULLIF((s.category_scores->>'Technical'), '')::int, 0) as technical_score,
        COALESCE(c.verbal_score, NULLIF((s.category_scores->>'verbal'), '')::int, NULLIF((s.category_scores->>'Verbal'), '')::int, NULLIF((s.category_scores->>'english'), '')::int, 0) as verbal_score,
        COALESCE(c.assessments_completed, 0) as assessments_completed,
        CASE WHEN s.latest_score IS NOT NULL OR COALESCE(c.assessments_completed, 0) > 0 THEN 'Completed' ELSE 'Active' END as assessment_status,
        COALESCE(cp.created_at, c.created_at) as created_at
      FROM candidate_profiles cp
      LEFT JOIN candidates c ON cp.id = c.id
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (candidate_id)
          candidate_id,
          candidate_email,
          score as latest_score,
          category_scores,
          created_at
        FROM assessment_submissions
        ORDER BY candidate_id, created_at DESC
      ) s ON cp.id = s.candidate_id OR cp.user_id = s.candidate_id OR LOWER(cp.email) = LOWER(s.candidate_email)
      WHERE cp.id=$1 OR cp.user_id=$1 OR c.id=$1
      LIMIT 1
    `, [req.params.id]);
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
      `UPDATE candidate_profiles SET 
         name=$1, mobile=$2, college=$3, degree=$4, branch=$5,
         graduation_year=NULLIF(regexp_replace($6::text, '\\D', '', 'g'), '')::INT,
         experience_level=$7, updated_at=CURRENT_TIMESTAMP 
       WHERE id=$8 OR user_id=$8 RETURNING *`,
      [name, mobile, college, degree, branch, graduationYear, experienceLevel, req.params.id]
    );
    await pool.query(
      `UPDATE users SET name=$1, updated_at=CURRENT_TIMESTAMP WHERE id=$2`,
      [name, req.params.id]
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
    await pool.query('DELETE FROM candidate_profiles WHERE id=$1 OR user_id=$1', [req.params.id]);
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
      `SELECT * FROM assessment_submissions 
       WHERE candidate_id=$1 OR candidate_email IN (SELECT email FROM candidate_profiles WHERE id=$1 OR user_id=$1) 
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/candidates/company-eligibility/criteria
export const getCompanyEligibilityCriteria = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_eligibility_criteria ORDER BY company ASC, role ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/candidates/:id/academic-marks
export const updateAcademicMarks = async (req, res) => {
  const {
    tenth_marks, twelfth_diploma_marks, graduation_percentage, backlogs,
    tenthMarks, twelfthDiplomaMarks, graduationPercentage
  } = req.body;
  const tenth = tenth_marks !== undefined ? tenth_marks : tenthMarks;
  const twelfth = twelfth_diploma_marks !== undefined ? twelfth_diploma_marks : twelfthDiplomaMarks;
  const grad = graduation_percentage !== undefined ? graduation_percentage : graduationPercentage;
  const numBacklogs = backlogs !== undefined ? parseInt(backlogs, 10) : 0;

  if (
    tenth === undefined || twelfth === undefined || grad === undefined ||
    tenth === '' || twelfth === '' || grad === ''
  ) {
    return res.status(400).json({ success: false, error: 'Please enter 10th, 12th/Diploma, and current graduation marks/percentage.' });
  }

  const numTenth = parseFloat(tenth);
  const numTwelfth = parseFloat(twelfth);
  const numGrad = parseFloat(grad);

  if (isNaN(numTenth) || numTenth < 0 || numTenth > 100) {
    return res.status(400).json({ success: false, error: '10th marks must be a valid percentage between 0 and 100.' });
  }

  if (isNaN(numTwelfth) || numTwelfth < 0 || numTwelfth > 100) {
    return res.status(400).json({ success: false, error: '12th/Diploma marks must be a valid percentage between 0 and 100.' });
  }

  if (isNaN(numGrad) || numGrad < 0 || numGrad > 100) {
    return res.status(400).json({ success: false, error: 'Current graduation marks must be a valid percentage between 0 and 100.' });
  }

  if (isNaN(numBacklogs) || numBacklogs < 0) {
    return res.status(400).json({ success: false, error: 'Active backlogs must be a valid non-negative number (0 or more).' });
  }

  try {
    const candidateId = req.params.id;
    clearCandidatesCache();

    // 1. Update candidate_profiles table
    const profileRes = await pool.query(
      `UPDATE candidate_profiles
       SET tenth_marks = $1,
           twelfth_diploma_marks = $2,
           graduation_percentage = $3,
           backlogs = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 OR user_id = $5 OR LOWER(email) = (SELECT LOWER(email) FROM users WHERE id = $5 LIMIT 1)
       RETURNING *`,
      [numTenth, numTwelfth, numGrad, numBacklogs, candidateId]
    );

    // If profile row doesn't exist yet, insert it
    if (profileRes.rowCount === 0) {
      await pool.query(
        `INSERT INTO candidate_profiles (id, user_id, name, tenth_marks, twelfth_diploma_marks, graduation_percentage, backlogs)
         SELECT u.id, u.id, u.name, $1, $2, $3, $4
         FROM users u
         WHERE u.id = $5
         ON CONFLICT (id) DO UPDATE SET
           tenth_marks = EXCLUDED.tenth_marks,
           twelfth_diploma_marks = EXCLUDED.twelfth_diploma_marks,
           graduation_percentage = EXCLUDED.graduation_percentage,
           backlogs = EXCLUDED.backlogs,
           updated_at = CURRENT_TIMESTAMP`,
        [numTenth, numTwelfth, numGrad, numBacklogs, candidateId]
      );
    }

    // 2. Also update candidates table for unified records
    await pool.query(
      `UPDATE candidates
       SET tenth_marks = $1,
           twelfth_diploma_marks = $2,
           graduation_percentage = $3,
           backlogs = $4
       WHERE id = $5`,
      [numTenth, numTwelfth, numGrad, numBacklogs, candidateId]
    );

    res.json({
      success: true,
      message: 'Academic marks and active backlogs saved successfully to candidate_profiles.',
      data: {
        tenth_marks: numTenth,
        twelfth_diploma_marks: numTwelfth,
        graduation_percentage: numGrad,
        backlogs: numBacklogs
      }
    });
  } catch (err) {
    console.error('updateAcademicMarks error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};


