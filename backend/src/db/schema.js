import { pool } from './pool.js';
import bcrypt from 'bcryptjs';

const schemaSQL = `
    -- 1. users: Stores authentication and user roles
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL,
      name VARCHAR(255) NOT NULL,
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. candidate_profiles: Stores candidate profile information
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      mobile VARCHAR(32),
      college VARCHAR(255),
      degree VARCHAR(128),
      branch VARCHAR(128),
      specialization VARCHAR(128),
      country VARCHAR(128) DEFAULT 'India',
      state VARCHAR(128),
      city VARCHAR(128),
      graduation_year INT,
      experience_level VARCHAR(64),
      resume_url TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. candidates: Candidate profile, readiness metrics & assessment performance
    CREATE TABLE IF NOT EXISTS candidates (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      mobile VARCHAR(32),
      college VARCHAR(255),
      degree VARCHAR(128),
      branch VARCHAR(128),
      specialization VARCHAR(128),
      country VARCHAR(128) DEFAULT 'India',
      state VARCHAR(128),
      city VARCHAR(128),
      graduation_year VARCHAR(16),
      experience_level VARCHAR(64) DEFAULT 'Fresher',
      job_readiness_score INT DEFAULT 0,
      readiness_level VARCHAR(128) DEFAULT 'In Progress',
      readiness_status VARCHAR(64) DEFAULT 'In Progress',
      aptitude_score INT DEFAULT 0,
      reasoning_score INT DEFAULT 0,
      technical_score INT DEFAULT 0,
      assessments_completed INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. assessments: Assessment definitions created by administrators
    CREATE TABLE IF NOT EXISTS assessments (
      id VARCHAR(64) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(64) NOT NULL,
      difficulty VARCHAR(32) DEFAULT 'Medium',
      duration_minutes INT NOT NULL,
      total_questions INT NOT NULL,
      total_marks INT NOT NULL DEFAULT 100,
      passing_score INT NOT NULL DEFAULT 65,
      status VARCHAR(32) DEFAULT 'Draft',
      created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. questions: Main Question Bank with JSONB options & answer keys
    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(64) PRIMARY KEY,
      topic_id VARCHAR(64),
      topic VARCHAR(255) DEFAULT 'General',
      category VARCHAR(64) NOT NULL,
      difficulty VARCHAR(32) NOT NULL,
      type VARCHAR(64) NOT NULL,
      question TEXT NOT NULL,
      code_snippet TEXT,
      language VARCHAR(32),
      explanation TEXT,
      marks INT DEFAULT 1,
      time_limit_sec INT DEFAULT 60,
      status VARCHAR(32) DEFAULT 'Active',
      source VARCHAR(32) DEFAULT 'Manual',
      options JSONB,
      correct_answer VARCHAR(16),
      tags TEXT[],
      created_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. submissions: Legacy submissions compatibility table
    CREATE TABLE IF NOT EXISTS submissions (
      id VARCHAR(64) PRIMARY KEY,
      candidate_id VARCHAR(64),
      assessment_id VARCHAR(64),
      score INT NOT NULL,
      accuracy INT NOT NULL,
      correct_count INT NOT NULL DEFAULT 0,
      incorrect_count INT NOT NULL DEFAULT 0,
      unanswered_count INT NOT NULL DEFAULT 0,
      time_taken VARCHAR(64),
      category_scores JSONB,
      topic_breakdown JSONB,
      answers JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. assessment_submissions: Official submitted assessment attempts & candidate scores
    CREATE TABLE IF NOT EXISTS assessment_submissions (
      id VARCHAR(64) PRIMARY KEY,
      candidate_id VARCHAR(64),
      candidate_name VARCHAR(255),
      candidate_email VARCHAR(255),
      assessment_id VARCHAR(64),
      assessment_title VARCHAR(255),
      score INT NOT NULL,
      accuracy INT NOT NULL,
      correct_count INT NOT NULL DEFAULT 0,
      incorrect_count INT NOT NULL DEFAULT 0,
      unanswered_count INT NOT NULL DEFAULT 0,
      time_taken VARCHAR(64),
      category_scores JSONB,
      topic_breakdown JSONB,
      answers JSONB,
      status VARCHAR(32) DEFAULT 'Completed',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. assessment_questions: Questions associated with an assessment with full question details
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id VARCHAR(64) PRIMARY KEY,
      assessment_id VARCHAR(64) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
      question_id VARCHAR(64) NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      category VARCHAR(64),
      topic VARCHAR(255),
      question TEXT,
      difficulty VARCHAR(32),
      options JSONB,
      correct_answer VARCHAR(16),
      marks INT DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_assessment_question UNIQUE (assessment_id, question_id)
    );
`;

export const initSchema = async () => {
  const LOCK_KEY = 74639201;
  let client;

  try {
    client = await pool.connect();
    // Acquire session-level advisory lock so only 1 replica runs migrations at a time
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

    // 1. Permanently Drop Unused / Deprecated Tables
    await client.query(`
      DROP TABLE IF EXISTS admin_sessions CASCADE;
      DROP TABLE IF EXISTS assessment_sections CASCADE;
      DROP TABLE IF EXISTS comapanies CASCADE;
      DROP TABLE IF EXISTS companies CASCADE;
      DROP TABLE IF EXISTS company_readiness CASCADE;
      DROP TABLE IF EXISTS company_roles CASCADE;
      DROP TABLE IF EXISTS question_skills CASCADE;
      DROP TABLE IF EXISTS role_skill_requirements CASCADE;
      DROP TABLE IF EXISTS topics CASCADE;
      DROP TABLE IF EXISTS test_attempts CASCADE;
      DROP TABLE IF EXISTS skills CASCADE;
      DROP TABLE IF EXISTS skill_performance CASCADE;
      DROP TABLE IF EXISTS candidate_answers CASCADE;
      DROP TABLE IF EXISTS performance_analysis CASCADE;
      DROP TABLE IF EXISTS reports CASCADE;
      DROP TABLE IF EXISTS question_options CASCADE;
    `);

    // 2. Synchronize Production Core Schema (including candidate_profiles)
    await client.query(schemaSQL);
    console.log('✅ Production Database Tables synchronized successfully.');

    // 3. Backfill candidate_profiles from candidates & users table
    await client.query(`
      INSERT INTO candidate_profiles (
        id, user_id, name, email, mobile, college, degree, branch,
        specialization, country, state, city, graduation_year, experience_level, created_at
      )
      SELECT 
        c.id,
        COALESCE(u.id, c.id),
        c.name,
        c.email,
        c.mobile,
        c.college,
        c.degree,
        c.branch,
        c.specialization,
        COALESCE(c.country, 'India'),
        c.state,
        c.city,
        NULLIF(regexp_replace(c.graduation_year::text, '\\D', '', 'g'), '')::INT,
        c.experience_level,
        c.created_at
      FROM candidates c
      LEFT JOIN users u ON LOWER(c.email) = LOWER(u.email)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ candidate_profiles table retrieved, verified, and backfilled.');

    // 4. Safe column migrations for active tables
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'active';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS specialization VARCHAR(128);
      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS country VARCHAR(128) DEFAULT 'India';
      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(128);
      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(128);
      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS resume_url TEXT;
      ALTER TABLE candidate_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS specialization VARCHAR(128);
      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS country VARCHAR(128) DEFAULT 'India';
      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS state VARCHAR(128);
      ALTER TABLE candidates ADD COLUMN IF NOT EXISTS city VARCHAR(128);

      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS total_marks INT DEFAULT 100;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passing_score INT DEFAULT 65;
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
      ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic_id VARCHAR(64);
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic VARCHAR(255) DEFAULT 'General';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS category VARCHAR(64) DEFAULT 'Technical';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(32) DEFAULT 'Medium';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS type VARCHAR(64) DEFAULT 'Single Choice';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS question TEXT;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS code_snippet TEXT;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS language VARCHAR(32);
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation TEXT;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS options JSONB;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(16) DEFAULT 'A';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS marks INT DEFAULT 4;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS time_limit_sec INT DEFAULT 60;
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS tags TEXT[];
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'Active';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS source VARCHAR(32) DEFAULT 'Manual';
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
      ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS category VARCHAR(64);
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS topic VARCHAR(255);
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS question TEXT;
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(32);
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS options JSONB;
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(16);
      ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS marks INT DEFAULT 1;
    `);
    console.log('✅ Safe column alterations applied.');

    // 5. Performance Indexes for Scalability & High-Concurrency Load
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_candidate_profiles_email ON candidate_profiles(email);
      CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
      CREATE INDEX IF NOT EXISTS idx_questions_category_diff ON questions(category, difficulty);
      CREATE INDEX IF NOT EXISTS idx_submissions_candidate_id ON assessment_submissions(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_submissions_cand_asm ON assessment_submissions(candidate_id, assessment_id);
      CREATE INDEX IF NOT EXISTS idx_assessment_questions_assessment_id ON assessment_questions(assessment_id);
      CREATE INDEX IF NOT EXISTS idx_assessment_questions_question_id ON assessment_questions(question_id);

      -- Deduplicate legacy rows in assessment_submissions if present before applying unique index
      DELETE FROM assessment_submissions a
      USING assessment_submissions b
      WHERE a.ctid < b.ctid
        AND a.candidate_id IS NOT NULL
        AND a.assessment_id IS NOT NULL
        AND a.candidate_id = b.candidate_id
        AND a.assessment_id = b.assessment_id;

      CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_cand_asm_unique 
      ON assessment_submissions(candidate_id, assessment_id);
    `);
    console.log('✅ Performance indexes and duplicate submission prevention constraint applied.');

    // 6. Ensure permanent single admin account exists
    const adminHash = await bcrypt.hash('Admin@2026', 10);
    await client.query(`
      INSERT INTO users (id, email, password_hash, role, name, status)
      VALUES ('admin-1', 'admin@readysetjob.com', $1, 'admin', 'HR Administrator', 'active')
      ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin', status = 'active';
    `, [adminHash]);
    console.log('✅ Permanent single admin credential verified (admin@readysetjob.com).');
  } catch (err) {
    console.error('❌ Schema initialization error:', err.message);
    throw err;
  } finally {
    if (client) {
      try {
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
      } catch (unlockErr) {
        console.error('⚠️ Advisory unlock warning:', unlockErr.message);
      }
      client.release();
    }
  }
};
