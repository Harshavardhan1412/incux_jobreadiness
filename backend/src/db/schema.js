import { pool } from './pool.js';

export const initSchema = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id           VARCHAR(64)  PRIMARY KEY,
      name         VARCHAR(255) NOT NULL,
      email        VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role         VARCHAR(32)  NOT NULL DEFAULT 'candidate',
      created_at   TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id                    VARCHAR(64)  PRIMARY KEY,
      name                  VARCHAR(255) NOT NULL,
      email                 VARCHAR(255) UNIQUE NOT NULL,
      mobile                VARCHAR(32),
      college               VARCHAR(255),
      degree                VARCHAR(128),
      branch                VARCHAR(128),
      graduation_year       VARCHAR(16),
      experience_level      VARCHAR(64)  DEFAULT 'Fresher',
      job_readiness_score   INT          DEFAULT 0,
      readiness_level       VARCHAR(128) DEFAULT 'In Progress',
      readiness_status      VARCHAR(64)  DEFAULT 'In Progress',
      aptitude_score        INT          DEFAULT 0,
      reasoning_score       INT          DEFAULT 0,
      technical_score       INT          DEFAULT 0,
      assessments_completed INT          DEFAULT 0,
      created_at            TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id               VARCHAR(64)  PRIMARY KEY,
      title            VARCHAR(255) NOT NULL,
      category         VARCHAR(64)  NOT NULL,
      description      TEXT,
      difficulty       VARCHAR(32)  DEFAULT 'Medium',
      duration_minutes INT          DEFAULT 30,
      total_questions  INT          DEFAULT 20,
      passing_score    INT          DEFAULT 65,
      status           VARCHAR(32)  DEFAULT 'Available',
      created_by       VARCHAR(64),
      created_at       TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id             VARCHAR(64)  PRIMARY KEY,
      category       VARCHAR(64)  NOT NULL,
      topic          VARCHAR(128) NOT NULL,
      difficulty     VARCHAR(32)  DEFAULT 'Medium',
      type           VARCHAR(64)  DEFAULT 'Single Choice',
      question       TEXT         NOT NULL,
      code_snippet   TEXT,
      language       VARCHAR(32),
      options        JSONB        NOT NULL,
      correct_answer VARCHAR(16)  NOT NULL,
      explanation    TEXT,
      marks          INT          DEFAULT 4,
      time_limit_sec INT          DEFAULT 60,
      tags           TEXT[],
      created_at     TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id               VARCHAR(64)  PRIMARY KEY,
      candidate_id     VARCHAR(64)  REFERENCES candidates(id) ON DELETE SET NULL,
      assessment_id    VARCHAR(64)  REFERENCES assessments(id) ON DELETE SET NULL,
      score            INT          NOT NULL,
      accuracy         INT          NOT NULL,
      correct_count    INT          NOT NULL DEFAULT 0,
      incorrect_count  INT          NOT NULL DEFAULT 0,
      unanswered_count INT          NOT NULL DEFAULT 0,
      time_taken       VARCHAR(64),
      category_scores  JSONB,
      topic_breakdown  JSONB,
      answers          JSONB,
      created_at       TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id         VARCHAR(64) PRIMARY KEY,
      user_id    VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(sql);
    console.log('✅ Database schema synchronized (all tables ready).');
  } catch (err) {
    console.error('❌ Schema initialization failed:', err.message);
    throw err;
  }
};
