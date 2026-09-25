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

    const result = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id AND aq.assessment_id IS NOT NULL),
          a.total_questions,
          0
        )::int as total_questions,
        COALESCE(
          (SELECT json_agg(aq.question_id) FROM assessment_questions aq WHERE aq.assessment_id = a.id),
          '[]'::json
        ) as selected_question_ids
      FROM assessments a
      ORDER BY a.created_at DESC
    `);
    const responsePayload = { success: true, data: result.rows };

    assessmentsCache = responsePayload;
    lastAssessmentsFetch = now;

    res.json(responsePayload);
  } catch (err) {
    console.error('getAllAssessments error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch assessments.' });
  }
};

// GET /api/assessments/:id
export const getAssessmentById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.*,
        COALESCE(
          (SELECT COUNT(*) FROM assessment_questions aq WHERE aq.assessment_id = a.id AND aq.assessment_id IS NOT NULL),
          a.total_questions,
          0
        )::int as total_questions,
        COALESCE(
          (SELECT json_agg(aq.question_id) FROM assessment_questions aq WHERE aq.assessment_id = a.id),
          '[]'::json
        ) as selected_question_ids
      FROM assessments a
      WHERE a.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Assessment not found.' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('getAssessmentById error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch assessment.' });
  }
};

// Helper function to sync questions for an assessment in assessment_questions table
export const syncAssessmentQuestions = async (client, assessmentId, selectedQuestionIds = [], fallbackCategory = 'Technical', targetCount = 10) => {
  let idsToLink = Array.isArray(selectedQuestionIds) ? selectedQuestionIds.filter(Boolean) : [];

  // If no explicit question IDs provided, auto-select matching questions from questions table
  if (idsToLink.length === 0) {
    const isAllMix = ['All', 'Full Length', 'All Mix (Combined)', 'All Mix'].some(
      m => m.toLowerCase() === (fallbackCategory || '').toLowerCase()
    );

    let qPoolRes;
    if (isAllMix) {
      qPoolRes = await client.query('SELECT id FROM questions ORDER BY created_at DESC LIMIT $1', [targetCount || 10]);
    } else {
      qPoolRes = await client.query('SELECT id FROM questions WHERE category ILIKE $1 ORDER BY created_at DESC LIMIT $2', [fallbackCategory, targetCount || 10]);
      if (qPoolRes.rows.length === 0) {
        qPoolRes = await client.query('SELECT id FROM questions ORDER BY created_at DESC LIMIT $1', [targetCount || 10]);
      }
    }
    idsToLink = qPoolRes.rows.map(r => r.id);
  }

  if (idsToLink.length > 0) {
    // 1. Remove any questions currently in assessment_questions that are not in the new idsToLink
    await client.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1 AND NOT (question_id = ANY($2::varchar[]))',
      [assessmentId, idsToLink]
    );

    // 2. Fetch question details from questions table
    const qDetailsRes = await client.query(
      `SELECT id, category, topic, question, difficulty, options, correct_answer, marks,
              test_cases, starter_templates, constraints
       FROM questions
       WHERE id = ANY($1::varchar[])`,
      [idsToLink]
    );

    // PERF-004 fix: Bulk upsert using UNNEST to eliminate N+1 round-trips (1 query for all questions)
    if (qDetailsRes.rows.length > 0) {
      const ids         = qDetailsRes.rows.map(() => `aq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`);
      const qIds        = qDetailsRes.rows.map(q => q.id);
      const categories  = qDetailsRes.rows.map(q => q.category);
      const topics      = qDetailsRes.rows.map(q => q.topic);
      const questions   = qDetailsRes.rows.map(q => q.question);
      const diffs       = qDetailsRes.rows.map(q => q.difficulty);
      const options     = qDetailsRes.rows.map(q => JSON.stringify(q.options || []));
      const answers     = qDetailsRes.rows.map(q => q.correct_answer);
      const marks       = qDetailsRes.rows.map(q => q.marks || 1);
      const testCases   = qDetailsRes.rows.map(q => q.test_cases ? JSON.stringify(q.test_cases) : null);
      const templates   = qDetailsRes.rows.map(q => q.starter_templates ? JSON.stringify(q.starter_templates) : null);
      const constraints = qDetailsRes.rows.map(q => q.constraints || null);
      const asmIds      = qDetailsRes.rows.map(() => assessmentId);

      await client.query(
        `INSERT INTO assessment_questions
           (id, assessment_id, question_id, category, topic, question, difficulty, options, correct_answer, marks, test_cases, starter_templates, constraints)
         SELECT
           UNNEST($1::varchar[]),
           UNNEST($2::varchar[]),
           UNNEST($3::varchar[]),
           UNNEST($4::varchar[]),
           UNNEST($5::varchar[]),
           UNNEST($6::text[]),
           UNNEST($7::varchar[]),
           UNNEST($8::jsonb[]),
           UNNEST($9::varchar[]),
           UNNEST($10::int[]),
           UNNEST($11::jsonb[]),
           UNNEST($12::jsonb[]),
           UNNEST($13::text[])
         ON CONFLICT (assessment_id, question_id) DO UPDATE SET
           category = EXCLUDED.category,
           topic = EXCLUDED.topic,
           question = EXCLUDED.question,
           difficulty = EXCLUDED.difficulty,
           options = EXCLUDED.options,
           correct_answer = EXCLUDED.correct_answer,
           marks = EXCLUDED.marks,
           test_cases = EXCLUDED.test_cases,
           starter_templates = EXCLUDED.starter_templates,
           constraints = EXCLUDED.constraints`,
        [ids, asmIds, qIds, categories, topics, questions, diffs, options, answers, marks, testCases, templates, constraints]
      );
    }
  } else {
    // If no questions, clear any existing assessment_questions for this assessment
    await client.query('DELETE FROM assessment_questions WHERE assessment_id = $1', [assessmentId]);
  }
};

// POST /api/assessments  (admin only)
export const createAssessment = async (req, res) => {
  const { id: customId, title, category, description, difficulty, durationMinutes, totalQuestions, passingScore, selectedQuestionIds } = req.body;
  const id = customId || `asm-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  const client = await pool.connect();

  const finalTotalQuestions = (Array.isArray(selectedQuestionIds) && selectedQuestionIds.length > 0)
    ? selectedQuestionIds.length
    : (Number(totalQuestions) > 0 ? Number(totalQuestions) : 10);

  try {
    await client.query('BEGIN');
    clearAssessmentsCache();

    const result = await client.query(
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
      [id, title, category || 'Technical', description || null, difficulty || 'Medium', Number(durationMinutes) || 30, finalTotalQuestions, Number(passingScore) || 65, req.user?.id || 'admin']
    );

    // Sync questions into assessment_questions table
    await syncAssessmentQuestions(client, id, selectedQuestionIds, category || 'Technical', finalTotalQuestions);

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('createAssessment error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to create assessment.' });
  } finally {
    client.release();
  }
};

// PUT /api/assessments/:id
export const updateAssessment = async (req, res) => {
  const { title, category, description, difficulty, durationMinutes, totalQuestions, passingScore, status, selectedQuestionIds } = req.body;
  const client = await pool.connect();

  const finalTotalQuestions = (Array.isArray(selectedQuestionIds) && selectedQuestionIds.length > 0)
    ? selectedQuestionIds.length
    : (totalQuestions != null ? Number(totalQuestions) : null);

  try {
    await client.query('BEGIN');
    clearAssessmentsCache();

    const result = await client.query(
      `UPDATE assessments SET 
         title = COALESCE($1, title), 
         category = COALESCE($2, category), 
         description = COALESCE($3, description), 
         difficulty = COALESCE($4, difficulty),
         duration_minutes = COALESCE($5, duration_minutes), 
         total_questions = COALESCE($6, total_questions), 
         passing_score = COALESCE($7, passing_score), 
         status = COALESCE($8, status), 
         updated_at = CURRENT_TIMESTAMP 
       WHERE id=$9 RETURNING *`,
      [
        title ?? null,
        category ?? null,
        description ?? null,
        difficulty ?? null,
        durationMinutes != null ? Number(durationMinutes) : null,
        finalTotalQuestions,
        passingScore != null ? Number(passingScore) : null,
        status ?? null,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const updatedAsm = result.rows[0];

    // If selectedQuestionIds are provided in the update, sync them
    if (selectedQuestionIds !== undefined) {
      await syncAssessmentQuestions(client, req.params.id, selectedQuestionIds, updatedAsm.category, Number(updatedAsm.total_questions) || 10);
    }

    await client.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('updateAssessment error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update assessment.' });
  } finally {
    client.release();
  }
};

// DELETE /api/assessments/:id
export const deleteAssessment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    clearAssessmentsCache();

    // Explicitly delete linked questions from assessment_questions table
    await client.query('DELETE FROM assessment_questions WHERE assessment_id=$1', [req.params.id]);

    // Delete the assessment itself
    const delRes = await client.query('DELETE FROM assessments WHERE id=$1 RETURNING id', [req.params.id]);
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Assessment and all associated questions deleted.', data: delRes.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('deleteAssessment error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete assessment.' });
  } finally {
    client.release();
  }
};

// GET /api/assessments/:id/questions
export const getAssessmentQuestions = async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const candidateId = req.user?.id;
    const candidateEmail = req.user?.email;

    // Retake only allowed if administrator or server-side env flag explicitly enabled
    const allowRetake = process.env.ALLOW_ASSESSMENT_RETAKE === 'true' || isAdmin;

    // Single Attempt Enforcement: If candidate already completed, block fetching questions
    if (!allowRetake && (candidateId || candidateEmail)) {
      const existing = await pool.query(
        `SELECT id, score, accuracy, created_at FROM assessment_submissions 
         WHERE assessment_id = $1 AND (candidate_id = $2 OR LOWER(candidate_email) = LOWER($3))
         UNION
         SELECT id, score, accuracy, created_at FROM submissions
         WHERE assessment_id = $1 AND candidate_id = $2
         LIMIT 1`,
        [req.params.id, candidateId || '', candidateEmail || '']
      );
      if (existing.rows.length > 0) {
        return res.status(403).json({
          success: false,
          error: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
          message: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
          alreadyCompleted: true,
          submission: existing.rows[0]
        });
      }
    }

    const result = await pool.query(
      `SELECT aq.id, aq.assessment_id, aq.question_id, aq.category, aq.topic,
              aq.question, aq.difficulty, aq.options,
              COALESCE(q.type, 'Single Choice') as type,
              COALESCE(aq.test_cases, q.test_cases) as test_cases,
              COALESCE(aq.starter_templates, q.starter_templates) as starter_templates,
              COALESCE(aq.constraints, q.constraints) as constraints,
              ${isAdmin ? 'aq.correct_answer,' : ''}
              aq.marks, aq.created_at
       FROM assessment_questions aq
       LEFT JOIN questions q ON aq.question_id = q.id
       WHERE aq.assessment_id = $1
       ORDER BY aq.created_at ASC`,
      [req.params.id]
    );

    // Sanitize hidden test cases from candidate responses to prevent answer/input leakage
    const sanitizedRows = isAdmin ? result.rows : result.rows.map(row => {
      let tc = row.test_cases;
      if (typeof tc === 'string') {
        try { tc = JSON.parse(tc); } catch { tc = []; }
      }
      const safeTestCases = Array.isArray(tc)
        ? tc.filter(item => !item.isHidden).map(item => ({
            id: item.id,
            input: item.input,
            expectedOutput: item.expectedOutput,
            isHidden: false
          }))
        : [];
      return {
        ...row,
        test_cases: safeTestCases
      };
    });

    res.json({ success: true, data: sanitizedRows, total: result.rowCount });
  } catch (err) {
    console.error('getAssessmentQuestions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch assessment questions.' });
  }
};

// POST /api/assessments/:id/questions
export const addQuestionsToAssessment = async (req, res) => {
  const assessmentId = req.params.id;
  const { questionIds, questions: inputQuestions } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verify assessment exists
    const asmCheck = await client.query('SELECT id FROM assessments WHERE id = $1', [assessmentId]);
    if (asmCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Assessment not found.' });
    }

    const insertedRows = [];

    // Case A: questionIds array provided
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const qRes = await client.query(
        `SELECT id, category, topic, question, difficulty, options, correct_answer, marks
         FROM questions
         WHERE id = ANY($1::varchar[])`,
        [questionIds]
      );

      for (const q of qRes.rows) {
        const aqId = `aq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const insRes = await client.query(
          `INSERT INTO assessment_questions (id, assessment_id, question_id, category, topic, question, difficulty, options, correct_answer, marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (assessment_id, question_id) DO UPDATE SET
             category = EXCLUDED.category,
             topic = EXCLUDED.topic,
             question = EXCLUDED.question,
             difficulty = EXCLUDED.difficulty,
             options = EXCLUDED.options,
             correct_answer = EXCLUDED.correct_answer,
             marks = EXCLUDED.marks
           RETURNING *`,
          [aqId, assessmentId, q.id, q.category, q.topic, q.question, q.difficulty, JSON.stringify(q.options), q.correct_answer, q.marks || 1]
        );
        insertedRows.push(insRes.rows[0]);
      }
    }

    // Case B: full questions objects provided
    if (Array.isArray(inputQuestions) && inputQuestions.length > 0) {
      for (const q of inputQuestions) {
        if (!q.id && !q.question_id) continue;
        const qId = q.question_id || q.id;
        const aqId = `aq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        const insRes = await client.query(
          `INSERT INTO assessment_questions (id, assessment_id, question_id, category, topic, question, difficulty, options, correct_answer, marks)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (assessment_id, question_id) DO UPDATE SET
             category = EXCLUDED.category,
             topic = EXCLUDED.topic,
             question = EXCLUDED.question,
             difficulty = EXCLUDED.difficulty,
             options = EXCLUDED.options,
             correct_answer = EXCLUDED.correct_answer,
             marks = EXCLUDED.marks
           RETURNING *`,
          [aqId, assessmentId, qId, q.category, q.topic, q.question, q.difficulty, JSON.stringify(q.options), q.correct_answer || q.correctAnswer, q.marks || 1]
        );
        insertedRows.push(insRes.rows[0]);
      }
    }

    await client.query('COMMIT');
    clearAssessmentsCache();
    res.status(201).json({ success: true, message: `Linked ${insertedRows.length} questions to assessment.`, data: insertedRows });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('addQuestionsToAssessment error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to add questions to assessment.' });
  } finally {
    client.release();
  }
};

// DELETE /api/assessments/:id/questions/:questionId
export const removeQuestionFromAssessment = async (req, res) => {
  const { id: assessmentId, questionId } = req.params;
  try {
    await pool.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1 AND (question_id = $2 OR id = $2)',
      [assessmentId, questionId]
    );
    clearAssessmentsCache();
    res.json({ success: true, message: 'Question removed from assessment.' });
  } catch (err) {
    console.error('removeQuestionFromAssessment error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to remove question from assessment.' });
  }
};

