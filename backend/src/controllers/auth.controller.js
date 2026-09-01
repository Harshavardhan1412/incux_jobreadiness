import { pool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
export const register = async (req, res) => {
  const { fullName, email, mobile, college, degree, branch, graduationYear, experienceLevel, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  try {
    const exists = await pool.query('SELECT id FROM candidates WHERE email=$1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    const id = `cand-${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);

    // Insert into users table
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,'candidate')`,
      [id, fullName, email, hash]
    );

    // Insert into candidates profile table
    const result = await pool.query(
      `INSERT INTO candidates (id, name, email, mobile, college, degree, branch, graduation_year, experience_level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [id, fullName, email, mobile, college, degree, branch, graduationYear, experienceLevel]
    );

    const candidate = result.rows[0];
    const token = signToken({ id: candidate.id, email: candidate.email, role: 'candidate' });
    res.status(201).json({ success: true, token, candidate });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// POST /api/auth/login  (candidate)
export const loginCandidate = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email=$1 AND role=$2', [email, 'candidate']);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Candidate account not found.' });
    }
    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }
    const candRes = await pool.query('SELECT * FROM candidates WHERE id=$1', [user.id]);
    const candidate = candRes.rows[0];
    const token = signToken({ id: user.id, email: user.email, role: 'candidate' });
    res.json({ success: true, token, candidate });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/admin/login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email=$1 AND role=$2', [email, 'admin']);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }
    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect admin password.' });
    }
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: 'admin' });
    res.json({ success: true, token, admin: { id: user.id, name: user.name, email: user.email, role: 'admin' } });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ error: 'Admin login failed.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const candRes = await pool.query('SELECT * FROM candidates WHERE id=$1', [req.user.id]);
    if (candRes.rows.length > 0) {
      return res.json({ success: true, candidate: candRes.rows[0], role: 'candidate' });
    }
    const userRes = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [req.user.id]);
    res.json({ success: true, user: userRes.rows[0], role: userRes.rows[0]?.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
