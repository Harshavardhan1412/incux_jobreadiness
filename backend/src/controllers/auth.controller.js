import { pool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// Validation Helper Utilities
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_REGEX = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;

// POST /api/auth/register
export const register = async (req, res) => {
  const {
    name,
    fullName,
    email,
    mobile,
    phoneNo,
    college,
    collegeName,
    degree,
    branch,
    specialization,
    country = 'India',
    state,
    city,
    graduationYear = 2026,
    experienceLevel = 'Fresher',
    password
  } = req.body;

  const candidateName = (name || fullName || '').trim();
  const candidateEmail = (email || '').trim().toLowerCase();
  const rawMobile = (mobile || phoneNo || '').trim();
  const candidateCollege = (college || collegeName || '').trim();
  const candidateBranch = (branch || '').trim();
  const candidateSpecialization = (specialization || '').trim();
  const candidateCountry = (country || 'India').trim();
  const candidateState = (state || '').trim();
  const candidateCity = (city || '').trim();

  // 1. Mandatory Field Validations
  if (!candidateName) {
    return res.status(400).json({ error: 'Full name is required.' });
  }

  if (!candidateEmail || !EMAIL_REGEX.test(candidateEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address (e.g., student@university.edu).' });
  }

  const cleanMobile = rawMobile.replace(/[\s\-]/g, '');
  if (!rawMobile || !INDIAN_MOBILE_REGEX.test(cleanMobile)) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' });
  }

  if (!candidateCollege) {
    return res.status(400).json({ error: 'College name is required.' });
  }

  if (!candidateBranch) {
    return res.status(400).json({ error: 'Branch is required.' });
  }

  if (!candidateSpecialization) {
    return res.status(400).json({ error: 'Specialization is required.' });
  }

  if (!candidateState) {
    return res.status(400).json({ error: 'State is required.' });
  }

  if (!candidateCity) {
    return res.status(400).json({ error: 'City is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    // 2. Check for duplicate email across users & candidates
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [candidateEmail]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please login instead.' });
    }

    const id = `cand-${Date.now()}`;
    const hash = await bcrypt.hash(password, 10);

    // 3. Insert into users authentication table
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'candidate', 'active')`,
      [id, candidateName, candidateEmail, hash]
    );

    // 4. Insert into candidate_profiles table
    await pool.query(
      `INSERT INTO candidate_profiles (
        id, user_id, name, email, mobile, college, degree, branch,
        specialization, country, state, city, graduation_year, experience_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id, id, candidateName, candidateEmail, cleanMobile, candidateCollege,
        degree || 'B.Tech', candidateBranch, candidateSpecialization,
        candidateCountry, candidateState, candidateCity,
        parseInt(graduationYear) || 2026, experienceLevel
      ]
    );

    // 5. Insert into candidates table (platform unified query support)
    const result = await pool.query(
      `INSERT INTO candidates (
        id, name, email, mobile, college, degree, branch,
        specialization, country, state, city, graduation_year, experience_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [
        id, candidateName, candidateEmail, cleanMobile, candidateCollege,
        degree || 'B.Tech', candidateBranch, candidateSpecialization,
        candidateCountry, candidateState, candidateCity,
        graduationYear.toString(), experienceLevel
      ]
    );

    const candidate = result.rows[0];
    const token = signToken({ id: candidate.id, email: candidate.email, role: 'candidate' });

    console.log(`✅ Candidate created and saved to DB: ${candidate.name} (${candidate.email})`);
    res.status(201).json({ success: true, token, candidate });
  } catch (err) {
    console.error('Register database error:', err.message);
    res.status(500).json({ error: 'Failed to create candidate profile. Please try again.' });
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
