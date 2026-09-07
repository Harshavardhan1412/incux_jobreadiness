import { pool } from '../db/pool.js';
import crypto from 'crypto';

let questionsCache = null;
let lastQuestionsFetch = 0;
const CACHE_TTL_MS = 3000;

export const clearQuestionsCache = () => {
  questionsCache = null;
  lastQuestionsFetch = 0;
};

// GET /api/questions
export const getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty, topic } = req.query;
    const isFiltered = category || difficulty || topic;

    const now = Date.now();
    if (!isFiltered && questionsCache && (now - lastQuestionsFetch < CACHE_TTL_MS)) {
      return res.json(questionsCache);
    }

    let sql = `
      SELECT id, category, topic, difficulty, type, question,
             code_snippet, language, explanation, marks,
             time_limit_sec, status, source, options, correct_answer,
             tags, created_at, updated_at
      FROM questions
      WHERE 1=1
    `;
    const params = [];
    if (category) { params.push(category); sql += ` AND category=$${params.length}`; }
    if (difficulty) { params.push(difficulty); sql += ` AND difficulty=$${params.length}`; }
    if (topic) { params.push(`%${topic}%`); sql += ` AND topic ILIKE $${params.length}`; }
    sql += ' ORDER BY created_at DESC';

    const result = await pool.query(sql, params);
    const responsePayload = { success: true, data: result.rows, total: result.rowCount };

    if (!isFiltered) {
      questionsCache = responsePayload;
      lastQuestionsFetch = now;
    }

    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/questions  (admin only)
export const createQuestion = async (req, res) => {
  const { id: customId, category, topic, difficulty, type, question, codeSnippet, language, options, correctAnswer, explanation, marks, timeLimitSec, tags } = req.body;
  const id = customId || `q-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  try {
    clearQuestionsCache();
    const result = await pool.query(
      `INSERT INTO questions (id, category, topic, difficulty, type, question, code_snippet, language, options, correct_answer, explanation, marks, time_limit_sec, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE SET
         category = EXCLUDED.category,
         topic = EXCLUDED.topic,
         difficulty = EXCLUDED.difficulty,
         type = EXCLUDED.type,
         question = EXCLUDED.question,
         code_snippet = EXCLUDED.code_snippet,
         language = EXCLUDED.language,
         options = EXCLUDED.options,
         correct_answer = EXCLUDED.correct_answer,
         explanation = EXCLUDED.explanation,
         marks = EXCLUDED.marks,
         time_limit_sec = EXCLUDED.time_limit_sec,
         tags = EXCLUDED.tags,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, category || 'Technical', topic || 'General', difficulty || 'Medium', type || 'Single Choice', question, codeSnippet || null, language || null,
       JSON.stringify(options || []), correctAnswer || 'A', explanation || null, marks || 4, timeLimitSec || 60, tags || []]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/questions/:id
export const updateQuestion = async (req, res) => {
  const { category, topic, difficulty, type, question, options, correctAnswer, explanation, marks } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    clearQuestionsCache();

    const result = await client.query(
      `UPDATE questions SET 
         category=COALESCE($1, category), 
         topic=COALESCE($2, topic), 
         difficulty=COALESCE($3, difficulty), 
         type=COALESCE($4, type), 
         question=COALESCE($5, question),
         options=CASE WHEN $6::text IS NOT NULL THEN $6::jsonb ELSE options END, 
         correct_answer=COALESCE($7, correct_answer), 
         explanation=COALESCE($8, explanation),
         marks=COALESCE($9, marks),
         updated_at=CURRENT_TIMESTAMP 
       WHERE id=$10 RETURNING *`,
      [category, topic, difficulty, type, question, options ? JSON.stringify(options) : null, correctAnswer, explanation, marks, req.params.id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found.' });
    }

    const updatedQ = result.rows[0];

    // Cascade update to assessment_questions table
    await client.query(
      `UPDATE assessment_questions SET
         category = $1,
         topic = $2,
         difficulty = $3,
         question = $4,
         options = $5,
         correct_answer = $6,
         marks = $7
       WHERE question_id = $8`,
      [updatedQ.category, updatedQ.topic, updatedQ.difficulty, updatedQ.question, JSON.stringify(updatedQ.options), updatedQ.correct_answer, updatedQ.marks, req.params.id]
    );

    await client.query('COMMIT');
    res.json({ success: true, data: updatedQ });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

// DELETE /api/questions/:id
export const deleteQuestion = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    clearQuestionsCache();

    // Delete question from assessment_questions first (and foreign key CASCADE handles it too)
    await client.query('DELETE FROM assessment_questions WHERE question_id=$1', [req.params.id]);
    await client.query('DELETE FROM questions WHERE id=$1', [req.params.id]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Question and all assessment links deleted.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
