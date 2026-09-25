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
    answers,
    proctoringViolations,
    autoSubmitted,
    autoSubmitReason
  } = req.body;

  // Resolve candidate identity from authenticated token or request body
  const candidateId = (req.user && req.user.role !== 'admin' && req.user.id)
    ? req.user.id
    : (bodyCandId || req.user?.id || 'cand-user');
  const email = (req.user && req.user.role !== 'admin' && req.user.email)
    ? req.user.email
    : (candidateEmail || req.user?.email || null);
  const name = (req.user && req.user.role !== 'admin' && req.user.name)
    ? req.user.name
    : (candidateName || req.user?.name || 'Candidate Student');
  // VULN-002 fix: require a real authenticated candidate ID — never fall back to arbitrary/hardcoded values
  if (!candidateId || candidateId === 'cand-user') {
    return res.status(401).json({ success: false, error: 'Authenticated candidate required to submit an assessment.' });
  }

  const asmId = assessmentId;
  const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // VULN-002 fix: Validate that assessmentId actually exists in the assessments table
    if (!asmId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'assessmentId is required.' });
    }
    const asmCheck = await client.query('SELECT id FROM assessments WHERE id = $1', [asmId]);
    if (asmCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Assessment not found.' });
    }

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
    // VULN-002 fix: ALWAYS use server-evaluated category scores — never fall back to client-supplied values
    const finalCategoryScores = evaluation.categoryScores || { aptitude: 0, reasoning: 0, technical: 0, verbal: 0, coding: 0 };
    const finalTopicBreakdown = (evaluation.topicBreakdown && evaluation.topicBreakdown.length > 0)
      ? evaluation.topicBreakdown
      : (clientTopicBreakdown || []);

    const catScores = finalCategoryScores;
    const sectionsTested = evaluation.sectionsTested || {};
    const hasAptitude = Boolean(sectionsTested.aptitude);
    const hasReasoning = Boolean(sectionsTested.reasoning);
    const hasTechnical = Boolean(sectionsTested.technical);
    const hasVerbal = Boolean(sectionsTested.verbal);
    const hasCoding = Boolean(sectionsTested.coding);

    const finalAptitudeScore = Number(catScores.aptitude ?? catScores.Aptitude ?? 0);
    const finalReasoningScore = Number(catScores.reasoning ?? catScores.Reasoning ?? 0);
    const finalTechnicalScore = Number(catScores.technical ?? catScores.Technical ?? 0);
    const finalVerbalScore = Number(catScores.verbal ?? catScores.Verbal ?? catScores.english ?? 0);
    const finalCodingScore = Number(catScores.coding ?? catScores.Coding ?? 0);

    // 2. Check for existing submission by candidate for this assessment
    const existingSubmission = await client.query(
      `SELECT id, score, accuracy, created_at FROM assessment_submissions 
       WHERE (candidate_id = $1 OR (candidate_email IS NOT NULL AND LOWER(candidate_email) = LOWER($2))) AND assessment_id = $3 
       ORDER BY created_at DESC LIMIT 1`,
      [candidateId, email || '', asmId]
    );

    // 2a. Authoritative proctoring violation count from DB events (prevents client under-reporting)
    const pEventsRes = await client.query(
      `SELECT COUNT(*) FROM proctoring_events 
       WHERE (candidate_id = $1 OR attempt_id = $2) AND (assessment_id = $3 OR assessment_id IS NULL)`,
      [candidateId, req.body.attemptId || '', asmId]
    );
    const dbViolations = parseInt(pEventsRes.rows[0]?.count || '0', 10);
    const finalViolations = Math.max(dbViolations, Number(proctoringViolations || 0));

    let savedSubmissionRecord = null;


    if (existingSubmission.rows.length > 0) {
      const existingId = existingSubmission.rows[0].id;
      // Update existing attempt with fresh score, accuracy, and evaluated answers
      // ARCH-003 fix: Preserve original created_at (audit trail) — only update updated_at
      const updated = await client.query(
        `UPDATE assessment_submissions 
         SET score = $1, accuracy = $2, correct_count = $3, incorrect_count = $4, unanswered_count = $5,
             time_taken = $6, category_scores = $7, topic_breakdown = $8, answers = $9, status = 'Completed',
             updated_at = NOW(),
             proctoring_violations = $10, auto_submitted = $11, auto_submit_reason = $12
         WHERE id = $13
         RETURNING *`,
        [
          finalScore,
          finalAccuracy,
          finalCorrectCount,
          finalIncorrectCount,
          finalUnansweredCount,
          timeTaken || '25 min',
          JSON.stringify(catScores),
          JSON.stringify(finalTopicBreakdown),
          JSON.stringify(answers || {}),
          finalViolations,
          Boolean(autoSubmitted),
          autoSubmitReason || null,
          existingId
        ]
      );
      savedSubmissionRecord = updated.rows[0];


      // Update legacy submissions table
      await client.query(
        `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
         ON CONFLICT (id) DO UPDATE SET
           score = EXCLUDED.score,
           accuracy = EXCLUDED.accuracy,
           correct_count = EXCLUDED.correct_count,
           incorrect_count = EXCLUDED.incorrect_count,
           unanswered_count = EXCLUDED.unanswered_count,
           time_taken = EXCLUDED.time_taken,
           category_scores = EXCLUDED.category_scores,
           topic_breakdown = EXCLUDED.topic_breakdown,
           answers = EXCLUDED.answers,
           created_at = NOW()`,
        [
          existingId, candidateId, asmId, finalScore, finalAccuracy,
          finalCorrectCount, finalIncorrectCount, finalUnansweredCount,
          timeTaken || '25 min', JSON.stringify(catScores), JSON.stringify(finalTopicBreakdown),
          JSON.stringify(answers || {})
        ]
      );
    } else {
      // 3. Insert into assessment_submissions table
      const result = await client.query(
        `INSERT INTO assessment_submissions 
         (id, candidate_id, candidate_name, candidate_email, assessment_id, assessment_title, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers, proctoring_violations, auto_submitted, auto_submit_reason, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'Completed',NOW())
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
          JSON.stringify(answers || {}),
          finalViolations,
          Boolean(autoSubmitted),
          autoSubmitReason || null
        ]
      );
      savedSubmissionRecord = result.rows[0];

      // 4. Also insert into legacy submissions table for backwards compatibility
      await client.query(
        `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          id, candidateId, asmId, finalScore, finalAccuracy,
          finalCorrectCount, finalIncorrectCount, finalUnansweredCount,
          timeTaken || '28 min', JSON.stringify(finalCategoryScores), JSON.stringify(finalTopicBreakdown),
          JSON.stringify(answers || {})
        ]
      );
    }

    // 5. Update or insert candidate readiness status and scores in candidates table
    await client.query(
      `INSERT INTO candidates (id, job_readiness_score, aptitude_score, reasoning_score, technical_score, verbal_score, coding_score, readiness_status, assessments_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Completed', 1)
       ON CONFLICT (id) DO UPDATE SET
         job_readiness_score = GREATEST(COALESCE(candidates.job_readiness_score, 0), EXCLUDED.job_readiness_score),
         aptitude_score = CASE WHEN $8 = true THEN GREATEST(COALESCE(candidates.aptitude_score, 0), EXCLUDED.aptitude_score) ELSE candidates.aptitude_score END,
         reasoning_score = CASE WHEN $9 = true THEN GREATEST(COALESCE(candidates.reasoning_score, 0), EXCLUDED.reasoning_score) ELSE candidates.reasoning_score END,
         technical_score = CASE WHEN $10 = true THEN GREATEST(COALESCE(candidates.technical_score, 0), EXCLUDED.technical_score) ELSE candidates.technical_score END,
         verbal_score = CASE WHEN $11 = true THEN GREATEST(COALESCE(candidates.verbal_score, 0), EXCLUDED.verbal_score) ELSE candidates.verbal_score END,
         coding_score = CASE WHEN $12 = true THEN GREATEST(COALESCE(candidates.coding_score, 0), EXCLUDED.coding_score) ELSE candidates.coding_score END,
         readiness_status = 'Completed',
         assessments_completed = COALESCE(candidates.assessments_completed, 0) + 1`,
      [
        candidateId, finalScore, finalAptitudeScore, finalReasoningScore, finalTechnicalScore, finalVerbalScore, finalCodingScore,
        hasAptitude, hasReasoning, hasTechnical, hasVerbal, hasCoding
      ]
    );

    // 6. If candidate profile exists, update timestamp
    if (email || candidateId) {
      await client.query(
        `UPDATE candidate_profiles SET updated_at = NOW() WHERE id = $1 OR user_id = $1 OR (email IS NOT NULL AND LOWER(email) = LOWER($2))`,
        [candidateId, email || '']
      ).catch(() => {});
    }

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully and recorded in database.',
      data: {
        ...savedSubmissionRecord,
        obtained_marks: evaluation.obtainedMarks,
        total_marks: evaluation.totalMarks
      }
    });
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
    res.status(500).json({ success: false, error: 'Failed to process submission. Please try again.' });
  } finally {
    client.release();
  }
};

// GET /api/submissions  (admin view of all submissions)
export const getAllSubmissions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
              COALESCE(cp.name, s.candidate_name, 'Candidate') as candidate_name, 
              COALESCE(cp.email, s.candidate_email) as candidate_email, 
              cp.college
       FROM assessment_submissions s
       LEFT JOIN candidate_profiles cp ON s.candidate_id = cp.id OR s.candidate_id = cp.user_id OR LOWER(s.candidate_email) = LOWER(cp.email)
       ORDER BY s.created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('getAllSubmissions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions.' });
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
    console.error('getMySubmissions error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch your submissions.' });
  }
};

// POST /api/submissions/proctoring-event
export const logProctoringEvent = async (req, res) => {
  try {
    const {
      attemptId,
      candidateId: bodyCandId,
      assessmentId,
      type, // 'NO_FACE' | 'LOOKING_AWAY' | 'MULTIPLE_FACES'
      timestamp,
      details
    } = req.body;

    if (!attemptId || !type) {
      return res.status(400).json({ success: false, error: 'attemptId and type are required' });
    }

    // Authoritative candidate identity: use token user id unless admin explicitly logging for candidate
    const candidateId = (req.user?.role === 'admin' && bodyCandId) ? bodyCandId : (req.user?.id || bodyCandId);
    if (!candidateId) {
      return res.status(401).json({ success: false, error: 'Candidate authentication required' });
    }

    const asmId = assessmentId || null;
    const eventId = `pe-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const eventTime = timestamp ? new Date(timestamp) : new Date();

    const insertResult = await pool.query(
      `INSERT INTO proctoring_events (id, attempt_id, candidate_id, assessment_id, type, timestamp, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        eventId,
        String(attemptId),
        candidateId,
        asmId,
        String(type).toUpperCase(),
        eventTime,
        details ? JSON.stringify(details) : null
      ]
    );

    return res.status(201).json({
      success: true,
      data: insertResult.rows[0]
    });
  } catch (err) {
    console.error('Error logging proctoring event:', err);
    return res.status(500).json({ success: false, error: 'Failed to record proctoring event' });
  }
};

// GET /api/submissions/proctoring-events/:attemptId
export const getProctoringEvents = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!attemptId) {
      return res.status(400).json({ success: false, error: 'attemptId is required' });
    }

    const isAdmin = req.user?.role === 'admin';
    const currentUserId = req.user?.id;

    // Non-admins can strictly only fetch events belonging to their own candidate profile
    let sql = `
      SELECT id, attempt_id, candidate_id, assessment_id, type, timestamp, details
      FROM proctoring_events
      WHERE (attempt_id = $1 OR candidate_id = $1)
    `;
    const params = [attemptId];

    if (!isAdmin) {
      sql += ` AND candidate_id = $2`;
      params.push(currentUserId);
    }
    sql += ` ORDER BY timestamp ASC`;

    const result = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching proctoring events:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch proctoring events' });
  }
};

