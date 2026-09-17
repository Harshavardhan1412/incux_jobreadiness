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

  // Prevent candidate identity spoofing (IDOR prevention)
  if (req.user && req.user.role !== 'admin' && bodyCandId && String(bodyCandId) !== String(req.user.id)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: You cannot submit an assessment on behalf of another candidate.'
    });
  }

  const id = `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  const candidateId = (req.user?.role !== 'admin' && req.user?.id) ? req.user.id : (bodyCandId || req.user?.id || 'cand-user');
  const email = (req.user?.role !== 'admin' && req.user?.email) ? req.user.email : (candidateEmail || req.user?.email || null);
  const name = (req.user?.role !== 'admin' && req.user?.name) ? req.user.name : (candidateName || req.user?.name || 'Candidate Student');
  const asmId = assessmentId || 'asm-1';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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
    const finalCategoryScores = (evaluation.categoryScores && Object.keys(evaluation.categoryScores).length > 0)
      ? evaluation.categoryScores
      : (clientCategoryScores || {});
    const finalTopicBreakdown = (evaluation.topicBreakdown && evaluation.topicBreakdown.length > 0)
      ? evaluation.topicBreakdown
      : (clientTopicBreakdown || []);

    const catScores = finalCategoryScores || {};
    const finalAptitudeScore = Number(catScores.aptitude ?? catScores.Aptitude ?? 0);
    const finalReasoningScore = Number(catScores.reasoning ?? catScores.Reasoning ?? 0);
    const finalTechnicalScore = Number(catScores.technical ?? catScores.Technical ?? 0);
    const finalVerbalScore = Number(catScores.verbal ?? catScores.Verbal ?? catScores.english ?? 0);

    // 2. Check for existing submission by candidate for this assessment (Single Attempt Rule)
    const existingSubmission = await client.query(
      `SELECT id, score, accuracy, created_at FROM assessment_submissions 
       WHERE (candidate_id = $1 OR LOWER(candidate_email) = LOWER($2)) AND assessment_id = $3 
       ORDER BY created_at DESC LIMIT 1`,
      [candidateId, email || '', asmId]
    );

    if (existingSubmission.rows.length > 0) {
      const timeDiff = Date.now() - new Date(existingSubmission.rows[0].created_at).getTime();
      // If submitted within 2 seconds, treat as idempotent duplicate submission
      if (timeDiff < 2000) {
        await client.query('COMMIT');
        return res.status(200).json({
          success: true,
          message: 'Idempotent submission received.',
          data: existingSubmission.rows[0],
        });
      }

      const allowRetake = req.body?.retake === true || 
                          req.query?.retake === 'true' || 
                          req.headers?.['x-allow-retake'] === 'true' || 
                          req.user?.role === 'admin' || 
                          process.env.ALLOW_ASSESSMENT_RETAKE === 'true';

      if (allowRetake) {
        // Update existing attempt with fresh score and answers
        const updated = await client.query(
          `UPDATE assessment_submissions 
           SET score = $1, accuracy = $2, correct_count = $3, incorrect_count = $4, unanswered_count = $5,
               time_taken = $6, category_scores = $7, topic_breakdown = $8, answers = $9, created_at = NOW(),
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
            Number(proctoringViolations || 0),
            Boolean(autoSubmitted),
            autoSubmitReason || null,
            existingSubmission.rows[0].id
          ]
        );
        await client.query('COMMIT');
        return res.status(200).json({
          success: true,
          message: 'Assessment attempt updated successfully.',
          data: updated.rows[0]
        });
      }

      // Single Attempt Enforcement: Candidates can write exam only once!
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        error: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
        message: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
        alreadySubmitted: true,
        submission: existingSubmission.rows[0]
      });
    }

    // Also check legacy submissions table
    const existingLegacy = await client.query(
      `SELECT id, score, accuracy, created_at FROM submissions 
       WHERE candidate_id = $1 AND assessment_id = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [candidateId, asmId]
    );
    if (existingLegacy.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        error: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
        message: 'You have already completed this assessment. Candidates are permitted to take each assessment only once.',
        alreadySubmitted: true,
        submission: existingLegacy.rows[0]
      });
    }

    // 3. Insert into assessment_submissions table
    const result = await client.query(
      `INSERT INTO assessment_submissions 
       (id, candidate_id, candidate_name, candidate_email, assessment_id, assessment_title, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers, proctoring_violations, auto_submitted, auto_submit_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
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
        Number(proctoringViolations || 0),
        Boolean(autoSubmitted),
        autoSubmitReason || null
      ]
    );

    // 4. Also insert into legacy submissions table for backwards compatibility
    await client.query(
      `INSERT INTO submissions (id, candidate_id, assessment_id, score, accuracy, correct_count, incorrect_count, unanswered_count, time_taken, category_scores, topic_breakdown, answers)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, candidateId, asmId, finalScore, finalAccuracy,
        finalCorrectCount, finalIncorrectCount, finalUnansweredCount,
        timeTaken || '28 min', JSON.stringify(finalCategoryScores), JSON.stringify(finalTopicBreakdown),
        JSON.stringify(answers || {})
      ]
    );

    // 5. Update candidate status and actual category scores in candidates table
    await client.query(
      `UPDATE candidates SET
         job_readiness_score = $1,
         aptitude_score = $2,
         reasoning_score = $3,
         technical_score = $4,
         verbal_score = $5,
         readiness_status = 'Completed',
         assessments_completed = COALESCE(assessments_completed, 0) + 1
       WHERE id = $6`,
      [finalScore, finalAptitudeScore, finalReasoningScore, finalTechnicalScore, finalVerbalScore, candidateId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...result.rows[0],
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
    res.status(500).json({ success: false, error: err.message });
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

    const candidateId = req.user?.id || bodyCandId || null;
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

    const result = await pool.query(
      `SELECT id, attempt_id, candidate_id, assessment_id, type, timestamp, details
       FROM proctoring_events
       WHERE attempt_id = $1 OR candidate_id = $1
       ORDER BY timestamp ASC`,
      [attemptId]
    );

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

