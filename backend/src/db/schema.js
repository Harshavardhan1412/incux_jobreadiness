import { pool } from './pool.js';

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

    -- 2. candidate_profiles: Stores candidate information
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE,
      mobile VARCHAR(20),
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

    -- Legacy candidates alias view or compatibility table if needed
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

    -- 3. assessments: Stores assessments created by admin
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

    -- 4. assessment_sections: Stores sections inside an assessment
    CREATE TABLE IF NOT EXISTS assessment_sections (
      id VARCHAR(64) PRIMARY KEY,
      assessment_id VARCHAR(64) REFERENCES assessments(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      description TEXT,
      question_count INT NOT NULL,
      marks_per_question INT DEFAULT 1,
      display_order INT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 5. topics: Stores question topics
    CREATE TABLE IF NOT EXISTS topics (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) UNIQUE NOT NULL,
      category VARCHAR(64) NOT NULL,
      description TEXT,
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. skills: Stores skills evaluated by the platform
    CREATE TABLE IF NOT EXISTS skills (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) UNIQUE NOT NULL,
      category VARCHAR(64) NOT NULL,
      description TEXT,
      status VARCHAR(32) DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 7. questions: Main Question Bank
    CREATE TABLE IF NOT EXISTS questions (
      id VARCHAR(64) PRIMARY KEY,
      topic_id VARCHAR(64) REFERENCES topics(id) ON DELETE SET NULL,
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

    -- 8. questions table handles options via JSONB array (question_options removed to avoid redundancy)

    -- 9. question_skills: Maps questions to skills
    CREATE TABLE IF NOT EXISTS question_skills (
      id VARCHAR(64) PRIMARY KEY,
      question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
      skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
      weight DECIMAL DEFAULT 1.0,
      UNIQUE(question_id, skill_id)
    );

    -- 10. assessment_questions: Connects assessments with questions
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id VARCHAR(64) PRIMARY KEY,
      assessment_id VARCHAR(64) REFERENCES assessments(id) ON DELETE CASCADE,
      section_id VARCHAR(64) REFERENCES assessment_sections(id) ON DELETE SET NULL,
      question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
      question_order INT NOT NULL,
      marks INT NOT NULL,
      UNIQUE(assessment_id, question_id)
    );

    -- 11. test_attempts: Stores every candidate's attempt
    CREATE TABLE IF NOT EXISTS test_attempts (
      id VARCHAR(64) PRIMARY KEY,
      candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      assessment_id VARCHAR(64) REFERENCES assessments(id) ON DELETE CASCADE,
      attempt_number INT NOT NULL,
      status VARCHAR(32) DEFAULT 'InProgress',
      started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      submitted_at TIMESTAMPTZ,
      time_taken_seconds INT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 12. candidate_answers: Stores individual answers
    CREATE TABLE IF NOT EXISTS candidate_answers (
      id VARCHAR(64) PRIMARY KEY,
      attempt_id VARCHAR(64) REFERENCES test_attempts(id) ON DELETE CASCADE,
      question_id VARCHAR(64) REFERENCES questions(id) ON DELETE CASCADE,
      selected_option VARCHAR(8),
      is_correct BOOLEAN,
      marks_obtained DECIMAL DEFAULT 0,
      time_taken_seconds INT,
      answered_at TIMESTAMPTZ
    );

    -- 13. performance_analysis: Stores overall test analysis
    CREATE TABLE IF NOT EXISTS performance_analysis (
      id VARCHAR(64) PRIMARY KEY,
      attempt_id VARCHAR(64) REFERENCES test_attempts(id) ON DELETE CASCADE UNIQUE,
      overall_score DECIMAL NOT NULL,
      accuracy DECIMAL NOT NULL,
      speed_score DECIMAL NOT NULL,
      aptitude_score DECIMAL,
      reasoning_score DECIMAL,
      technical_score DECIMAL,
      strengths JSONB,
      weaknesses JSONB,
      ai_summary TEXT,
      recommendations JSONB,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. skill_performance: Stores detailed skill-level performance
    CREATE TABLE IF NOT EXISTS skill_performance (
      id VARCHAR(64) PRIMARY KEY,
      attempt_id VARCHAR(64) REFERENCES test_attempts(id) ON DELETE CASCADE,
      candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
      score DECIMAL NOT NULL,
      proficiency VARCHAR(32),
      questions_attempted INT DEFAULT 0,
      correct_answers INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 15. companies: Stores companies used for readiness analysis
    CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(128) UNIQUE NOT NULL,
      industry VARCHAR(128),
      description TEXT,
      website TEXT,
      status VARCHAR(32) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 16. company_roles: Stores roles offered/targeted for each company
    CREATE TABLE IF NOT EXISTS company_roles (
      id VARCHAR(64) PRIMARY KEY,
      company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
      role_name VARCHAR(128) NOT NULL,
      description TEXT,
      experience_level VARCHAR(64),
      status VARCHAR(32) DEFAULT 'Active',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 17. role_skill_requirements: Defines what skills are required for each company role
    CREATE TABLE IF NOT EXISTS role_skill_requirements (
      id VARCHAR(64) PRIMARY KEY,
      role_id VARCHAR(64) REFERENCES company_roles(id) ON DELETE CASCADE,
      skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE CASCADE,
      required_score DECIMAL,
      weight DECIMAL DEFAULT 1.0,
      importance VARCHAR(32) DEFAULT 'Required',
      UNIQUE(role_id, skill_id)
    );

    -- 18. company_readiness: Stores candidate's company/role suitability result
    CREATE TABLE IF NOT EXISTS company_readiness (
      id VARCHAR(64) PRIMARY KEY,
      candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      attempt_id VARCHAR(64) REFERENCES test_attempts(id) ON DELETE SET NULL,
      company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
      role_id VARCHAR(64) REFERENCES company_roles(id) ON DELETE CASCADE,
      readiness_score DECIMAL NOT NULL,
      readiness_level VARCHAR(32),
      matched_skills JSONB,
      skill_gaps JSONB,
      ai_analysis TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- 19. reports: Stores the final generated candidate report
    CREATE TABLE IF NOT EXISTS reports (
      id VARCHAR(64) PRIMARY KEY,
      candidate_id VARCHAR(64) REFERENCES candidate_profiles(id) ON DELETE CASCADE,
      attempt_id VARCHAR(64) REFERENCES test_attempts(id) ON DELETE SET NULL,
      report_type VARCHAR(64),
      overall_score DECIMAL,
      summary TEXT,
      strengths JSONB,
      weaknesses JSONB,
      recommendations JSONB,
      report_url TEXT,
      generated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Legacy submissions table
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
  `;

export const initSchema = async () => {
  const LOCK_KEY = 74639201;
  let client;

  try {
    client = await pool.connect();
    // Acquire session-level advisory lock so only 1 replica runs migrations at a time
    await client.query('SELECT pg_advisory_lock($1)', [LOCK_KEY]);

    await client.query(schemaSQL);
    console.log('✅ All 19 Database Tables synchronized successfully.');

    // Safe column migrations for existing tables
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

      -- Drop redundant options table if it exists (options are stored directly in questions.options JSONB)
      DROP TABLE IF EXISTS question_options CASCADE;
    `);
    console.log('✅ Safe column alterations applied.');
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
