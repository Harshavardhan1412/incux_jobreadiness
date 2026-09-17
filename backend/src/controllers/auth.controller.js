process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '128';

import { pool } from '../db/pool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const BCRYPT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

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
    return res.status(400).json({ success: false, error: 'Full name is required.' });
  }

  if (!candidateEmail || !EMAIL_REGEX.test(candidateEmail)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid email address (e.g., student@university.edu).' });
  }

  const cleanMobile = rawMobile.replace(/[\s\-]/g, '');
  if (!rawMobile || !INDIAN_MOBILE_REGEX.test(cleanMobile)) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' });
  }

  if (!candidateCollege) {
    return res.status(400).json({ success: false, error: 'College name is required.' });
  }

  if (!candidateBranch) {
    return res.status(400).json({ success: false, error: 'Branch is required.' });
  }

  if (!candidateSpecialization) {
    return res.status(400).json({ success: false, error: 'Specialization is required.' });
  }

  if (!candidateState) {
    return res.status(400).json({ success: false, error: 'State is required.' });
  }

  if (!candidateCity) {
    return res.status(400).json({ success: false, error: 'City is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const id = `cand-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // 2. Insert into users authentication table
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, 'candidate', 'active')`,
      [id, candidateName, candidateEmail, hash]
    );

    // 3. Insert into candidate_profiles table
    await client.query(
      `INSERT INTO candidate_profiles (
        id, user_id, name, email, mobile, college, degree, branch,
        specialization, country, state, city, graduation_year, experience_level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (id) DO NOTHING`,
      [
        id, id, candidateName, candidateEmail, cleanMobile, candidateCollege,
        degree || 'B.Tech', candidateBranch, candidateSpecialization,
        candidateCountry, candidateState, candidateCity,
        parseInt(graduationYear) || 2026, experienceLevel
      ]
    );

    // 4. Insert into candidates table for readiness metrics tracking
    await client.query(
      `INSERT INTO candidates (id, experience_level, readiness_status)
       VALUES ($1, $2, 'In Progress')
       ON CONFLICT (id) DO NOTHING`,
      [id, experienceLevel]
    );

    await client.query('COMMIT');

    const candidate = {
      id,
      name: candidateName,
      email: candidateEmail,
      mobile: cleanMobile,
      college: candidateCollege,
      degree: degree || 'B.Tech',
      branch: candidateBranch,
      specialization: candidateSpecialization,
      country: candidateCountry,
      state: candidateState,
      city: candidateCity,
      graduationYear: parseInt(graduationYear) || 2026,
      experienceLevel,
      jobReadinessScore: 0,
      readinessLevel: 'In Progress',
      readinessStatus: 'In Progress',
      aptitudeScore: 0,
      reasoningScore: 0,
      technicalScore: 0,
      assessmentsCompleted: 0
    };
    const token = signToken({ id, email: candidateEmail, role: 'candidate' });

    console.log(`✅ Candidate created and saved to DB: ${candidate.name} (${candidate.email})`);
    return res.status(201).json({ success: true, token, candidate });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') {
      return res.status(409).json({ success: false, error: 'An account with this email address already exists. Please login instead.' });
    }
    console.error('Register database error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to create candidate profile. Please try again.' });
  } finally {
    client.release();
  }
};

// POST /api/auth/login  (candidate)
export const loginCandidate = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }
  try {
    const userRes = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.name, u.role,
              cp.mobile, cp.college, cp.degree, cp.branch, cp.specialization, cp.country, cp.state, cp.city, cp.graduation_year,
              COALESCE(cp.experience_level, c.experience_level, 'Fresher') as experience_level,
              COALESCE(c.readiness_status, 'In Progress') as readiness_status,
              COALESCE(c.job_readiness_score, 0) as job_readiness_score,
              COALESCE(c.aptitude_score, 0) as aptitude_score,
              COALESCE(c.reasoning_score, 0) as reasoning_score,
              COALESCE(c.technical_score, 0) as technical_score,
              COALESCE(c.verbal_score, 0) as verbal_score,
              COALESCE(c.coding_score, 0) as coding_score,
              COALESCE(c.assessments_completed, 0) as assessments_completed,
              COALESCE(cp.tenth_marks, c.tenth_marks) as tenth_marks,
              COALESCE(cp.twelfth_diploma_marks, c.twelfth_diploma_marks) as twelfth_diploma_marks,
              COALESCE(cp.graduation_percentage, c.graduation_percentage) as graduation_percentage,
              COALESCE(cp.backlogs, c.backlogs, 0) as backlogs
       FROM users u
       LEFT JOIN candidate_profiles cp ON u.id = cp.user_id OR u.id = cp.id
       LEFT JOIN candidates c ON u.id = c.id
       WHERE LOWER(u.email) = LOWER($1) AND u.role = 'candidate'
       LIMIT 1`,
      [email.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const candidate = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      college: user.college,
      degree: user.degree,
      branch: user.branch,
      specialization: user.specialization,
      country: user.country,
      state: user.state,
      city: user.city,
      graduationYear: user.graduation_year,
      experienceLevel: user.experience_level,
      jobReadinessScore: user.job_readiness_score || 0,
      job_readiness_score: user.job_readiness_score || 0,
      overallScore: user.job_readiness_score || 0,
      readinessLevel: (user.job_readiness_score || 0) >= 65 ? 'Job Ready' : 'In Progress',
      readinessStatus: user.readiness_status || 'In Progress',
      aptitudeScore: user.aptitude_score || 0,
      reasoningScore: user.reasoning_score || 0,
      technicalScore: user.technical_score || 0,
      verbalScore: user.verbal_score || 0,
      verbal_score: user.verbal_score || 0,
      codingScore: user.coding_score || 0,
      coding_score: user.coding_score || 0,
      assessmentsCompleted: user.assessments_completed || 0,
      tenthMarks: user.tenth_marks,
      twelfthDiplomaMarks: user.twelfth_diploma_marks,
      graduationPercentage: user.graduation_percentage,
      tenth_marks: user.tenth_marks,
      twelfth_diploma_marks: user.twelfth_diploma_marks,
      graduation_percentage: user.graduation_percentage,
      backlogs: Number(user.backlogs || 0),
    };

    const token = signToken({ id: user.id, email: user.email, role: 'candidate' });
    res.json({ success: true, token, candidate });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

// POST /api/auth/admin/login
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email)=LOWER($1) AND role=$2', [email.trim(), 'admin']);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: 'admin' });
    res.json({ success: true, token, admin: { id: user.id, name: user.name, email: user.email, role: 'admin' } });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ success: false, error: 'Admin login failed.' });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const candRes = await pool.query(`
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
        COALESCE(c.job_readiness_score, 0) as job_readiness_score,
        COALESCE(c.job_readiness_score, 0) as overall_score,
        COALESCE(c.aptitude_score, 0) as aptitude_score,
        COALESCE(c.reasoning_score, 0) as reasoning_score,
        COALESCE(c.technical_score, 0) as technical_score,
        COALESCE(c.verbal_score, 0) as verbal_score,
        COALESCE(c.coding_score, 0) as coding_score,
        COALESCE(c.assessments_completed, 0) as assessments_completed,
        COALESCE(c.readiness_status, 'In Progress') as readiness_status,
        COALESCE(cp.created_at, c.created_at) as created_at
      FROM candidate_profiles cp
      LEFT JOIN candidates c ON cp.id = c.id
      LEFT JOIN users u ON cp.user_id = u.id
      WHERE cp.id=$1 OR cp.user_id=$1
      LIMIT 1
    `, [req.user.id]);
    if (candRes.rows.length > 0) {
      const row = candRes.rows[0];
      row.tenthMarks = row.tenth_marks;
      row.twelfthDiplomaMarks = row.twelfth_diploma_marks;
      row.graduationPercentage = row.graduation_percentage;
      row.backlogs = Number(row.backlogs || 0);
      row.jobReadinessScore = row.job_readiness_score || 0;
      row.overallScore = row.job_readiness_score || 0;
      row.aptitudeScore = row.aptitude_score || 0;
      row.reasoningScore = row.reasoning_score || 0;
      row.technicalScore = row.technical_score || 0;
      row.verbalScore = row.verbal_score || 0;
      row.codingScore = row.coding_score || 0;
      return res.json({ success: true, candidate: row, role: 'candidate' });
    }
    const userRes = await pool.query('SELECT id, name, email, role FROM users WHERE id=$1', [req.user.id]);
    res.json({ success: true, user: userRes.rows[0], role: userRes.rows[0]?.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
