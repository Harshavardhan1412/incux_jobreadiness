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
        COALESCE(NULLIF(c.job_readiness_score, 0), s_agg.avg_score, 0) as job_readiness_score,
        COALESCE(NULLIF(c.job_readiness_score, 0), s_agg.avg_score, 0) as overall_score,
        GREATEST(COALESCE(c.aptitude_score, 0), COALESCE(s_agg.max_aptitude, 0)) as aptitude_score,
        GREATEST(COALESCE(c.reasoning_score, 0), COALESCE(s_agg.max_reasoning, 0)) as reasoning_score,
        GREATEST(COALESCE(c.technical_score, 0), COALESCE(s_agg.max_technical, 0)) as technical_score,
        GREATEST(COALESCE(c.verbal_score, 0), COALESCE(s_agg.max_verbal, 0)) as verbal_score,
        GREATEST(COALESCE(c.coding_score, 0), COALESCE(s_agg.max_coding, 0)) as coding_score,
        COALESCE(c.assessments_completed, s_agg.total_assessments, 0) as assessments_completed,
        CASE WHEN s_agg.avg_score IS NOT NULL OR COALESCE(c.assessments_completed, 0) > 0 THEN 'Completed' ELSE 'Active' END as assessment_status,
        COALESCE(cp.created_at, c.created_at) as created_at
      FROM candidate_profiles cp
      LEFT JOIN candidates c ON cp.id = c.id
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN (
        SELECT 
          candidate_id,
          candidate_email,
          COUNT(*) as total_assessments,
          ROUND(AVG(score)) as avg_score,
          MAX(COALESCE(NULLIF((category_scores->>'aptitude'), '')::numeric, NULLIF((category_scores->>'Aptitude'), '')::numeric, 0)) as max_aptitude,
          MAX(COALESCE(NULLIF((category_scores->>'reasoning'), '')::numeric, NULLIF((category_scores->>'Reasoning'), '')::numeric, NULLIF((category_scores->>'LogicalReasoning'), '')::numeric, 0)) as max_reasoning,
          MAX(COALESCE(NULLIF((category_scores->>'technical'), '')::numeric, NULLIF((category_scores->>'Technical'), '')::numeric, NULLIF((category_scores->>'TechnicalKnowledge'), '')::numeric, 0)) as max_technical,
          MAX(COALESCE(NULLIF((category_scores->>'verbal'), '')::numeric, NULLIF((category_scores->>'Verbal'), '')::numeric, NULLIF((category_scores->>'english'), '')::numeric, NULLIF((category_scores->>'English'), '')::numeric, 0)) as max_verbal,
          MAX(COALESCE(NULLIF((category_scores->>'coding'), '')::numeric, NULLIF((category_scores->>'Coding'), '')::numeric, 0)) as max_coding
        FROM assessment_submissions
        GROUP BY candidate_id, candidate_email
      ) s_agg ON cp.id = s_agg.candidate_id OR cp.user_id = s_agg.candidate_id OR LOWER(cp.email) = LOWER(s_agg.candidate_email)
      ORDER BY created_at DESC
    `);
    const responsePayload = { success: true, data: result.rows, total: result.rowCount };

    candidatesCache = responsePayload;
    lastCandidatesFetch = Date.now();

    res.json(responsePayload);
  } catch (err) {
    console.error('getAllCandidates error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch candidates.' });
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
        COALESCE(NULLIF(c.job_readiness_score, 0), s_agg.avg_score, 0) as job_readiness_score,
        COALESCE(NULLIF(c.job_readiness_score, 0), s_agg.avg_score, 0) as overall_score,
        GREATEST(COALESCE(c.aptitude_score, 0), COALESCE(s_agg.max_aptitude, 0)) as aptitude_score,
        GREATEST(COALESCE(c.reasoning_score, 0), COALESCE(s_agg.max_reasoning, 0)) as reasoning_score,
        GREATEST(COALESCE(c.technical_score, 0), COALESCE(s_agg.max_technical, 0)) as technical_score,
        GREATEST(COALESCE(c.verbal_score, 0), COALESCE(s_agg.max_verbal, 0)) as verbal_score,
        GREATEST(COALESCE(c.coding_score, 0), COALESCE(s_agg.max_coding, 0)) as coding_score,
        COALESCE(c.assessments_completed, s_agg.total_assessments, 0) as assessments_completed,
        CASE WHEN s_agg.avg_score IS NOT NULL OR COALESCE(c.assessments_completed, 0) > 0 THEN 'Completed' ELSE 'Active' END as assessment_status,
        COALESCE(cp.created_at, c.created_at) as created_at
      FROM candidate_profiles cp
      LEFT JOIN candidates c ON cp.id = c.id
      LEFT JOIN users u ON cp.user_id = u.id
      LEFT JOIN (
        SELECT 
          candidate_id,
          candidate_email,
          COUNT(*) as total_assessments,
          ROUND(AVG(score)) as avg_score,
          MAX(COALESCE(NULLIF((category_scores->>'aptitude'), '')::numeric, NULLIF((category_scores->>'Aptitude'), '')::numeric, 0)) as max_aptitude,
          MAX(COALESCE(NULLIF((category_scores->>'reasoning'), '')::numeric, NULLIF((category_scores->>'Reasoning'), '')::numeric, NULLIF((category_scores->>'LogicalReasoning'), '')::numeric, 0)) as max_reasoning,
          MAX(COALESCE(NULLIF((category_scores->>'technical'), '')::numeric, NULLIF((category_scores->>'Technical'), '')::numeric, NULLIF((category_scores->>'TechnicalKnowledge'), '')::numeric, 0)) as max_technical,
          MAX(COALESCE(NULLIF((category_scores->>'verbal'), '')::numeric, NULLIF((category_scores->>'Verbal'), '')::numeric, NULLIF((category_scores->>'english'), '')::numeric, NULLIF((category_scores->>'English'), '')::numeric, 0)) as max_verbal,
          MAX(COALESCE(NULLIF((category_scores->>'coding'), '')::numeric, NULLIF((category_scores->>'Coding'), '')::numeric, 0)) as max_coding
        FROM assessment_submissions
        GROUP BY candidate_id, candidate_email
      ) s_agg ON cp.id = s_agg.candidate_id OR cp.user_id = s_agg.candidate_id OR LOWER(cp.email) = LOWER(s_agg.candidate_email)
      WHERE cp.id=$1 OR cp.user_id=$1 OR c.id=$1
      LIMIT 1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Candidate not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getCandidateById error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch candidate profile.' });
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
    console.error('updateCandidate error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update candidate profile.' });
  }
};

// DELETE /api/candidates/:id
export const deleteCandidate = async (req, res) => {
  const candidateId = req.params.id;
  if (!candidateId) {
    return res.status(400).json({ success: false, error: 'Candidate ID is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Locate candidate identifiers across candidate_profiles, users, and candidates
    const candLookup = await client.query(
      `SELECT cp.id, cp.user_id, cp.email
       FROM candidate_profiles cp
       WHERE cp.id = $1 OR cp.user_id = $1
       UNION
       SELECT u.id, u.id as user_id, u.email
       FROM users u
       WHERE (u.id = $1 OR LOWER(u.email) = LOWER($1)) AND u.role = 'candidate'
       UNION
       SELECT c.id, c.id as user_id, NULL as email
       FROM candidates c
       WHERE c.id = $1`,
      [candidateId]
    );

    const idsSet = new Set([candidateId]);
    const emailsSet = new Set();

    candLookup.rows.forEach(row => {
      if (row.id) idsSet.add(row.id);
      if (row.user_id) idsSet.add(row.user_id);
      if (row.email) emailsSet.add(row.email.trim().toLowerCase());
    });

    const targetIds = Array.from(idsSet);
    const targetEmails = Array.from(emailsSet);

    // 2. Delete from assessment_submissions
    let deletedSubmissionsCount = 0;
    if (targetEmails.length > 0) {
      const subDelRes = await client.query(
        `DELETE FROM assessment_submissions 
         WHERE candidate_id = ANY($1::varchar[]) OR LOWER(candidate_email) = ANY($2::varchar[])`,
        [targetIds, targetEmails]
      );
      deletedSubmissionsCount += subDelRes.rowCount || 0;
    } else {
      const subDelRes = await client.query(
        `DELETE FROM assessment_submissions WHERE candidate_id = ANY($1::varchar[])`,
        [targetIds]
      );
      deletedSubmissionsCount += subDelRes.rowCount || 0;
    }

    // 3. Delete from legacy submissions
    await client.query(
      `DELETE FROM submissions WHERE candidate_id = ANY($1::varchar[])`,
      [targetIds]
    );

    // 4. Delete from candidates table
    await client.query(
      `DELETE FROM candidates WHERE id = ANY($1::varchar[])`,
      [targetIds]
    );

    // 5. Delete from candidate_profiles
    if (targetEmails.length > 0) {
      await client.query(
        `DELETE FROM candidate_profiles 
         WHERE id = ANY($1::varchar[]) OR user_id = ANY($1::varchar[]) OR LOWER(email) = ANY($2::varchar[])`,
        [targetIds, targetEmails]
      );
    } else {
      await client.query(
        `DELETE FROM candidate_profiles 
         WHERE id = ANY($1::varchar[]) OR user_id = ANY($1::varchar[])`,
        [targetIds]
      );
    }

    // 6. Delete from users table (safety check: ONLY where role = 'candidate', never admin!)
    if (targetEmails.length > 0) {
      await client.query(
        `DELETE FROM users 
         WHERE (id = ANY($1::varchar[]) OR LOWER(email) = ANY($2::varchar[])) AND role = 'candidate'`,
        [targetIds, targetEmails]
      );
    } else {
      await client.query(
        `DELETE FROM users WHERE id = ANY($1::varchar[]) AND role = 'candidate'`,
        [targetIds]
      );
    }

    await client.query('COMMIT');
    clearCandidatesCache();

    console.log(`✅ Candidate ${candidateId} permanently deleted across candidate_profiles, candidates, users, and submissions.`);
    return res.json({
      success: true,
      message: 'Candidate and all associated records deleted successfully from database.',
      deletedCandidateId: candidateId,
      deletedSubmissions: deletedSubmissionsCount
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`❌ Error deleting candidate ${candidateId}:`, err.message);
    return res.status(500).json({ success: false, error: 'Failed to delete candidate.' });
  } finally {
    client.release();
  }
};

// GET /api/candidates/:id/submissions
export const getCandidateSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, a.title as assessment_title, a.category as assessment_category 
       FROM assessment_submissions s
       LEFT JOIN assessments a ON s.assessment_id = a.id
       WHERE s.candidate_id=$1 OR s.candidate_email IN (SELECT email FROM candidate_profiles WHERE id=$1 OR user_id=$1) 
       ORDER BY s.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getCandidateSubmissions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch candidate submissions.' });
  }
};

// GET /api/candidates/company-eligibility/criteria
export const getCompanyEligibilityCriteria = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_eligibility_criteria ORDER BY company ASC, role ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getCompanyEligibilityCriteria error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch company eligibility criteria.' });
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
    res.status(500).json({ success: false, error: 'Failed to update academic marks.' });
  }
};

// POST /api/candidates/:id/reset-attempt (Admin Only)
export const resetCandidateAttempt = async (req, res) => {
  const candidateId = req.params.id;
  const { assessmentId, category, targetType } = req.body || {};
  const selectedType = (targetType || category || assessmentId || 'all').toString().trim();
  const lowerType = selectedType.toLowerCase();

  if (!candidateId) {
    return res.status(400).json({ success: false, error: 'Candidate ID is required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Locate candidate identifiers across candidate_profiles, users, and candidates
    const candLookup = await client.query(
      `SELECT cp.id, cp.user_id, cp.email
       FROM candidate_profiles cp
       WHERE cp.id = $1 OR cp.user_id = $1
       UNION
       SELECT u.id, u.id as user_id, u.email
       FROM users u
       WHERE (u.id = $1 OR LOWER(u.email) = LOWER($1)) AND u.role = 'candidate'
       UNION
       SELECT c.id, c.id as user_id, NULL as email
       FROM candidates c
       WHERE c.id = $1`,
      [candidateId]
    );

    const idsSet = new Set([candidateId]);
    const emailsSet = new Set();

    candLookup.rows.forEach(row => {
      if (row.id) idsSet.add(row.id);
      if (row.user_id) idsSet.add(row.user_id);
      if (row.email) emailsSet.add(row.email.trim().toLowerCase());
    });

    const targetIds = Array.from(idsSet);
    const targetEmails = Array.from(emailsSet);

    // 2. Determine target submissions to delete based on selectedType ('coding' | 'technical' / 'other' | specific asmId | 'all')
    let deletedCount = 0;
    let targetCategoryLabel = 'all';

    if (lowerType === 'coding') {
      targetCategoryLabel = 'coding';
      const codingAsms = await client.query(
        `SELECT id FROM assessments WHERE category ILIKE '%cod%' OR title ILIKE '%cod%'`
      );
      const codingIds = codingAsms.rows.map(r => r.id);

      const delAsm = await client.query(
        `DELETE FROM assessment_submissions 
         WHERE (candidate_id = ANY($1::varchar[]) OR LOWER(candidate_email) = ANY($2::varchar[]))
           AND (
             assessment_id = ANY($3::varchar[])
             OR assessment_id IN (SELECT id FROM assessments WHERE category ILIKE '%cod%' OR title ILIKE '%cod%')
           )
         RETURNING id`,
        [targetIds, targetEmails, codingIds]
      );
      deletedCount += delAsm.rowCount || 0;

      await client.query(
        `DELETE FROM submissions 
         WHERE candidate_id = ANY($1::varchar[])
           AND (
             assessment_id = ANY($2::varchar[])
             OR assessment_id IN (SELECT id FROM assessments WHERE category ILIKE '%cod%' OR title ILIKE '%cod%')
           )`,
        [targetIds, codingIds]
      );
    } else if (lowerType === 'technical' || lowerType === 'other' || lowerType === 'mcq') {
      targetCategoryLabel = 'technical';
      const delAsm = await client.query(
        `DELETE FROM assessment_submissions 
         WHERE (candidate_id = ANY($1::varchar[]) OR LOWER(candidate_email) = ANY($2::varchar[]))
           AND assessment_id NOT IN (SELECT id FROM assessments WHERE category ILIKE '%cod%' OR title ILIKE '%cod%')
         RETURNING id`,
        [targetIds, targetEmails]
      );
      deletedCount += delAsm.rowCount || 0;

      await client.query(
        `DELETE FROM submissions 
         WHERE candidate_id = ANY($1::varchar[])
           AND assessment_id NOT IN (SELECT id FROM assessments WHERE category ILIKE '%cod%' OR title ILIKE '%cod%')`,
        [targetIds]
      );
    } else if (selectedType && lowerType !== 'all') {
      // Specific assessment ID was provided
      targetCategoryLabel = selectedType;
      const delAsm = await client.query(
        `DELETE FROM assessment_submissions 
         WHERE (candidate_id = ANY($1::varchar[]) OR LOWER(candidate_email) = ANY($2::varchar[]))
           AND assessment_id = $3
         RETURNING id`,
        [targetIds, targetEmails, selectedType]
      );
      deletedCount += delAsm.rowCount || 0;

      await client.query(
        `DELETE FROM submissions 
         WHERE candidate_id = ANY($1::varchar[]) AND assessment_id = $2`,
        [targetIds, selectedType]
      );
    } else {
      // Full reset of all assessments
      targetCategoryLabel = 'all';
      const delAsm = await client.query(
        `DELETE FROM assessment_submissions 
         WHERE candidate_id = ANY($1::varchar[]) OR LOWER(candidate_email) = ANY($2::varchar[])
         RETURNING id`,
        [targetIds, targetEmails]
      );
      deletedCount += delAsm.rowCount || 0;

      await client.query(
        `DELETE FROM submissions 
         WHERE candidate_id = ANY($1::varchar[])`,
        [targetIds]
      );
    }

    // 3. Re-calculate candidate scores from remaining submissions
    const remaining = await client.query(
      `SELECT s.assessment_id, s.score, s.category_scores, s.created_at,
              COALESCE(a.category, '') as asm_category, COALESCE(a.title, '') as asm_title
       FROM assessment_submissions s
       LEFT JOIN assessments a ON s.assessment_id = a.id
       WHERE s.candidate_id = ANY($1::varchar[]) OR LOWER(s.candidate_email) = ANY($2::varchar[])
       ORDER BY s.created_at DESC`,
      [targetIds, targetEmails]
    );

    if (remaining.rows.length === 0) {
      await client.query(
        `UPDATE candidates SET 
           readiness_status = 'In Progress',
           job_readiness_score = 0,
           aptitude_score = 0,
           reasoning_score = 0,
           technical_score = 0,
           verbal_score = 0,
           coding_score = 0,
           assessments_completed = 0
         WHERE id = ANY($1::varchar[])`,
        [targetIds]
      );
    } else {
      let latestCodingScore = null;
      let latestTechnicalScore = null;
      let latestAptitudeScore = null;
      let latestReasoningScore = null;
      let latestVerbalScore = null;

      remaining.rows.forEach(r => {
        const isCoding = (r.asm_category || '').toLowerCase().includes('cod') || (r.asm_title || '').toLowerCase().includes('cod');
        const cat = typeof r.category_scores === 'string' ? JSON.parse(r.category_scores) : (r.category_scores || {});

        if (isCoding) {
          if (latestCodingScore === null) {
            latestCodingScore = Number(cat.coding ?? cat.Coding ?? r.score ?? 0);
          }
        } else {
          if (latestTechnicalScore === null && (cat.technical !== undefined || cat.Technical !== undefined || r.score !== undefined)) {
            latestTechnicalScore = Number(cat.technical ?? cat.Technical ?? r.score ?? 0);
          }
          if (latestAptitudeScore === null && cat.aptitude !== undefined) {
            latestAptitudeScore = Number(cat.aptitude ?? 0);
          }
          if (latestReasoningScore === null && cat.reasoning !== undefined) {
            latestReasoningScore = Number(cat.reasoning ?? 0);
          }
          if (latestVerbalScore === null && (cat.verbal !== undefined || cat.english !== undefined)) {
            latestVerbalScore = Number(cat.verbal ?? cat.english ?? 0);
          }
        }
      });

      const newCodingScore = latestCodingScore !== null ? latestCodingScore : 0;
      const newTechScore = latestTechnicalScore !== null ? latestTechnicalScore : 0;
      const newAptScore = latestAptitudeScore !== null ? latestAptitudeScore : 0;
      const newReasonScore = latestReasoningScore !== null ? latestReasoningScore : 0;
      const newVerbScore = latestVerbalScore !== null ? latestVerbalScore : 0;

      const completedScores = [];
      if (latestCodingScore !== null) completedScores.push(latestCodingScore);
      if (latestTechnicalScore !== null) completedScores.push(latestTechnicalScore);
      if (latestAptitudeScore !== null && latestAptitudeScore > 0) completedScores.push(latestAptitudeScore);
      if (latestReasoningScore !== null && latestReasoningScore > 0) completedScores.push(latestReasoningScore);
      if (latestVerbalScore !== null && latestVerbalScore > 0) completedScores.push(latestVerbalScore);

      const newOverallScore = completedScores.length > 0 
        ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
        : (remaining.rows[0]?.score || 0);

      await client.query(
        `UPDATE candidates SET 
           readiness_status = 'Completed',
           job_readiness_score = $1,
           aptitude_score = $2,
           reasoning_score = $3,
           technical_score = $4,
           verbal_score = $5,
           coding_score = $6,
           assessments_completed = $7
         WHERE id = ANY($8::varchar[])`,
        [
          newOverallScore,
          newAptScore,
          newReasonScore,
          newTechScore,
          newVerbScore,
          newCodingScore,
          remaining.rows.length,
          targetIds
        ]
      );
    }

    await client.query('COMMIT');
    clearCandidatesCache();

    let message = 'Assessment attempt reset successfully. The candidate can now retake the assessment.';
    if (targetCategoryLabel === 'coding') {
      message = 'Coding assessment attempt reset successfully. The candidate can now retake the Coding assessment.';
    } else if (targetCategoryLabel === 'technical') {
      message = 'Technical / MCQ assessment attempt reset successfully. The candidate can now retake the Technical assessment.';
    } else if (targetCategoryLabel !== 'all') {
      message = `Assessment attempt for ${targetCategoryLabel} reset successfully.`;
    }

    console.log(`✅ Candidate ${candidateId} attempt for [${targetCategoryLabel}] reset by administrator.`);
    return res.json({
      success: true,
      message,
      candidateId,
      targetCategory: targetCategoryLabel,
      deletedSubmissions: deletedCount
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error(`❌ Error resetting candidate attempt:`, err.message);
    return res.status(500).json({ success: false, error: 'Failed to reset candidate attempt.' });
  } finally {
    client.release();
  }
};



