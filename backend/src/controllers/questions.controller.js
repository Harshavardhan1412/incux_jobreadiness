import { pool } from '../db/pool.js';
import crypto from 'crypto';

// GET /api/questions
export const getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty, topic } = req.query;
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    if (category) { params.push(category); sql += ` AND category=$${params.length}`; }
    if (difficulty) { params.push(difficulty); sql += ` AND difficulty=$${params.length}`; }
    if (topic) { params.push(`%${topic}%`); sql += ` AND topic ILIKE $${params.length}`; }
    sql += ' ORDER BY created_at DESC';
    const result = await pool.query(sql, params);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/questions  (admin only)
export const createQuestion = async (req, res) => {
  const { id: customId, category, topic, difficulty, type, question, codeSnippet, language, options, correctAnswer, explanation, marks, timeLimitSec, tags } = req.body;
  const id = customId || `q-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  try {
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
  const { category, topic, difficulty, type, question, options, correctAnswer, explanation } = req.body;
  try {
    const result = await pool.query(
      `UPDATE questions SET category=$1, topic=$2, difficulty=$3, type=$4, question=$5,
       options=$6, correct_answer=$7, explanation=$8 WHERE id=$9 RETURNING *`,
      [category, topic, difficulty, type, question, JSON.stringify(options), correctAnswer, explanation, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/questions/:id
export const deleteQuestion = async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id=$1', [req.params.id]);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
