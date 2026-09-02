import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../src/db/pool.js';
import { initSchema } from '../src/db/schema.js';
import bcrypt from 'bcryptjs';

const runSeed = async () => {
  console.log('🌱 Starting comprehensive 19-table database seed...');
  await initSchema();

  // 1. Seed Users (Admin & Candidates)
  const adminHash = await bcrypt.hash('Admin@2026', 10);
  const candHash = await bcrypt.hash('Test@1234', 10);

  await pool.query(`
    INSERT INTO users (id, email, password_hash, role, name, status)
    VALUES 
      ('admin-1', 'admin@readysetjob.com', $1, 'admin', 'HR Administrator', 'active'),
      ('user-cand-1', 'john.doe@example.com', $2, 'candidate', 'John Doe', 'active'),
      ('user-cand-2', 'sarah.chen@example.com', $2, 'candidate', 'Sarah Chen', 'active'),
      ('user-cand-3', 'arjun.patel@example.com', $2, 'candidate', 'Arjun Patel', 'active'),
      ('user-cand-4', 'priya.sharma@example.com', $2, 'candidate', 'Priya Sharma', 'active'),
      ('user-cand-5', 'rahul.verma@example.com', $2, 'candidate', 'Rahul Verma', 'active')
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  `, [adminHash, candHash]);
  console.log('✅ 1. Users seeded.');

  // 2. Seed Candidate Profiles
  const candUsers = await pool.query(`SELECT id, email FROM users WHERE role = 'candidate'`);
  const userMap = {};
  candUsers.rows.forEach(u => { userMap[u.email] = u.id; });

  await pool.query(`
    INSERT INTO candidate_profiles (
      id, user_id, name, email, mobile, college, degree, branch,
      graduation_year, experience_level, resume_url
    ) VALUES 
      ('cand-001', $1, 'John Doe', 'john.doe@example.com', '9876543210', 'BITS Pilani', 'B.Tech', 'Computer Science', 2026, 'Fresher', 'https://storage.readysetjob.com/resumes/john_doe.pdf'),
      ('cand-002', $2, 'Sarah Chen', 'sarah.chen@example.com', '9123456789', 'NIT Trichy', 'B.Tech', 'Information Technology', 2026, 'Fresher', 'https://storage.readysetjob.com/resumes/sarah_chen.pdf'),
      ('cand-003', $3, 'Arjun Patel', 'arjun.patel@example.com', '9988776655', 'VIT Vellore', 'B.Tech', 'Electronics & CS', 2027, 'Fresher', null),
      ('cand-004', $4, 'Priya Sharma', 'priya.sharma@example.com', '8877665544', 'Amrita University', 'B.Tech', 'CS & Engineering', 2026, 'Fresher', 'https://storage.readysetjob.com/resumes/priya_sharma.pdf'),
      ('cand-005', $5, 'Rahul Verma', 'rahul.verma@example.com', '7766554433', 'SRM Institute', 'B.Tech', 'Mechanical Engineering', 2026, 'Fresher', null)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, college = EXCLUDED.college, user_id = EXCLUDED.user_id;
  `, [
    userMap['john.doe@example.com'] || 'cand-001',
    userMap['sarah.chen@example.com'] || 'cand-002',
    userMap['arjun.patel@example.com'] || 'cand-003',
    userMap['priya.sharma@example.com'] || 'cand-004',
    userMap['rahul.verma@example.com'] || 'cand-005'
  ]);
  console.log('✅ 2. Candidate Profiles seeded.');

  // 3. Seed Topics
  await pool.query(`
    INSERT INTO topics (id, name, category, description, status)
    VALUES
      ('top-1', 'Data Structures & Algorithms', 'Technical', 'Arrays, Strings, Trees, Graphs and Searching', 'active'),
      ('top-2', 'Object-Oriented Programming', 'Technical', 'Inheritance, Polymorphism, Encapsulation, Abstraction', 'active'),
      ('top-3', 'Database Management & SQL', 'Technical', 'RDBMS, Transactions, Indexing, SQL Joins & Window Queries', 'active'),
      ('top-4', 'Quantitative Aptitude', 'Aptitude', 'Arithmetic, Algebra, Percentages, Probability', 'active'),
      ('top-5', 'Logical Reasoning', 'Reasoning', 'Puzzles, Series, Syllogisms, Critical Thinking', 'active')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `);
  console.log('✅ 3. Topics seeded.');

  // 4. Seed Skills
  await pool.query(`
    INSERT INTO skills (id, name, category, description, status)
    VALUES
      ('sk-1', 'Problem Solving & DSA', 'Technical', 'Algorithmic efficiency and data manipulation', 'active'),
      ('sk-2', 'System Design & Architecture', 'Technical', 'Scalable component structures and APIs', 'active'),
      ('sk-3', 'Database Optimization', 'Technical', 'Query tuning and schema normalization', 'active'),
      ('sk-4', 'Quantitative Ability', 'Aptitude', 'Mathematical speed and accuracy', 'active'),
      ('sk-5', 'Analytical Reasoning', 'Reasoning', 'Deductive logic and pattern matching', 'active'),
      ('sk-6', 'Code Quality & Debugging', 'Technical', 'Clean code practices and edge-case handling', 'active')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `);
  console.log('✅ 4. Skills seeded.');

  // 5. Seed Questions
  await pool.query(`
    INSERT INTO questions (
      id, topic_id, category, difficulty, type, question,
      code_snippet, language, explanation, marks, time_limit_sec, status, source, created_by
    ) VALUES
      ('q-101', 'top-1', 'Technical', 'Easy', 'Single Choice', 'Which data structure follows the LIFO (Last In, First Out) principle?', null, null, 'A Stack follows the Last-In-First-Out order.', 4, 60, 'Active', 'Manual', 'admin-1'),
      ('q-102', 'top-1', 'Technical', 'Medium', 'Single Choice', 'What is the worst-case time complexity of QuickSort?', null, null, 'QuickSort is O(n^2) in worst case when pivot selection is unbalanced.', 4, 60, 'Active', 'Manual', 'admin-1'),
      ('q-103', 'top-2', 'Technical', 'Medium', 'Single Choice', 'Which principle allows a class to inherit from multiple parent classes?', null, null, 'Multiple Inheritance allows a derived class to inherit from multiple bases.', 4, 60, 'Active', 'Manual', 'admin-1'),
      ('q-104', 'top-3', 'Technical', 'Medium', 'Code Snippet', 'What does this SQL query return?', 'SELECT department, COUNT(*) as emp_count\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY emp_count DESC;', 'sql', 'HAVING COUNT(*) > 5 filters aggregated groups, ORDER BY DESC sorts descending.', 5, 90, 'Active', 'Manual', 'admin-1'),
      ('q-105', 'top-4', 'Aptitude', 'Easy', 'Single Choice', 'A train running at 72 km/h crosses a pole in 9 seconds. What is the length of the train?', null, null, '72 km/h = 72 * (5/18) = 20 m/s. Length = Speed * Time = 20 * 9 = 180 meters.', 4, 60, 'Active', 'Manual', 'admin-1'),
      ('q-106', 'top-5', 'Reasoning', 'Medium', 'Single Choice', 'Find the next number in the series: 3, 8, 15, 24, 35, ?', null, null, 'Pattern is n^2 - 1 for n=2,3,4,5,6. Next is 7^2 - 1 = 48.', 4, 60, 'Active', 'Manual', 'admin-1')
    ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question;
  `);
  console.log('✅ 5. Questions seeded.');

  // 6. Seed Question Options
  await pool.query(`
    INSERT INTO question_options (id, question_id, option_key, option_text, display_order, is_correct)
    VALUES
      ('opt-101-A', 'q-101', 'A', 'Queue', 1, false),
      ('opt-101-B', 'q-101', 'B', 'Stack', 2, true),
      ('opt-101-C', 'q-101', 'C', 'Linked List', 3, false),
      ('opt-101-D', 'q-101', 'D', 'Tree', 4, false),

      ('opt-102-A', 'q-102', 'A', 'O(n log n)', 1, false),
      ('opt-102-B', 'q-102', 'B', 'O(n^2)', 2, true),
      ('opt-102-C', 'q-102', 'C', 'O(log n)', 3, false),
      ('opt-102-D', 'q-102', 'D', 'O(n)', 4, false),

      ('opt-103-A', 'q-103', 'A', 'Encapsulation', 1, false),
      ('opt-103-B', 'q-103', 'B', 'Multiple Inheritance', 2, true),
      ('opt-103-C', 'q-103', 'C', 'Polymorphism', 3, false),
      ('opt-103-D', 'q-103', 'D', 'Abstraction', 4, false),

      ('opt-104-A', 'q-104', 'A', 'All departments with employee count', 1, false),
      ('opt-104-B', 'q-104', 'B', 'Departments with >5 employees sorted descending', 2, true),
      ('opt-104-C', 'q-104', 'C', 'Top 5 departments by size', 3, false),
      ('opt-104-D', 'q-104', 'D', 'Grouped employee names alphabetically', 4, false),

      ('opt-105-A', 'q-105', 'A', '150 meters', 1, false),
      ('opt-105-B', 'q-105', 'B', '180 meters', 2, true),
      ('opt-105-C', 'q-105', 'C', '200 meters', 3, false),
      ('opt-105-D', 'q-105', 'D', '160 meters', 4, false),

      ('opt-106-A', 'q-106', 'A', '46', 1, false),
      ('opt-106-B', 'q-106', 'B', '48', 2, true),
      ('opt-106-C', 'q-106', 'C', '50', 3, false),
      ('opt-106-D', 'q-106', 'D', '52', 4, false)
    ON CONFLICT (id) DO UPDATE SET option_text = EXCLUDED.option_text;
  `);
  console.log('✅ 6. Question Options seeded.');

  // 7. Seed Question Skills Mapping
  await pool.query(`
    INSERT INTO question_skills (id, question_id, skill_id, weight)
    VALUES
      ('qs-1', 'q-101', 'sk-1', 1.0),
      ('qs-2', 'q-102', 'sk-1', 1.2),
      ('qs-3', 'q-103', 'sk-6', 1.0),
      ('qs-4', 'q-104', 'sk-3', 1.5),
      ('qs-5', 'q-105', 'sk-4', 1.0),
      ('qs-6', 'q-106', 'sk-5', 1.0)
    ON CONFLICT (question_id, skill_id) DO NOTHING;
  `);
  console.log('✅ 7. Question Skills mapped.');

  // 8. Seed Assessments
  await pool.query(`
    INSERT INTO assessments (
      id, title, description, category, difficulty,
      duration_minutes, total_questions, total_marks, passing_score, status, created_by
    ) VALUES
      ('asm-001', 'Technical Assessment', 'Core computer science fundamentals: DSA, OOP, DBMS, OS and SQL.', 'Technical', 'Medium', 45, 20, 100, 65, 'Published', 'admin-1'),
      ('asm-002', 'Quantitative Aptitude Test', 'Assess numerical reasoning, algebra, arithmetic, and problem solving speed.', 'Aptitude', 'Easy', 30, 20, 80, 60, 'Published', 'admin-1'),
      ('asm-003', 'Logical Reasoning Assessment', 'Pattern identification, sequences, deductive logic, and analytical problem solving.', 'Reasoning', 'Medium', 30, 20, 80, 65, 'Published', 'admin-1'),
      ('asm-004', 'Full-Stack SDE Mock Exam', 'End-to-end full-stack software engineer readiness test with algorithms and architecture.', 'Technical', 'Hard', 60, 30, 120, 70, 'Published', 'admin-1')
    ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
  `);
  console.log('✅ 8. Assessments seeded.');

  // 9. Seed Assessment Sections
  await pool.query(`
    INSERT INTO assessment_sections (id, assessment_id, name, description, question_count, marks_per_question, display_order)
    VALUES
      ('sec-1', 'asm-001', 'Section A: Data Structures', 'Core arrays, linked lists, stacks, trees', 8, 5, 1),
      ('sec-2', 'asm-001', 'Section B: OOP & DBMS', 'Object design, transactions, SQL', 7, 5, 2),
      ('sec-3', 'asm-001', 'Section C: Algorithms', 'Sorting, searching, algorithmic complexity', 5, 5, 3)
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `);
  console.log('✅ 9. Assessment Sections seeded.');

  // 10. Seed Assessment Questions Link
  await pool.query(`
    INSERT INTO assessment_questions (id, assessment_id, section_id, question_id, question_order, marks)
    VALUES
      ('aq-1', 'asm-001', 'sec-1', 'q-101', 1, 4),
      ('aq-2', 'asm-001', 'sec-3', 'q-102', 2, 4),
      ('aq-3', 'asm-001', 'sec-2', 'q-103', 3, 4),
      ('aq-4', 'asm-001', 'sec-2', 'q-104', 4, 5)
    ON CONFLICT (assessment_id, question_id) DO NOTHING;
  `);
  console.log('✅ 10. Assessment Questions linked.');

  // 11. Seed Companies
  await pool.query(`
    INSERT INTO companies (id, name, industry, description, website, status)
    VALUES
      ('comp-1', 'Google', 'Technology & Cloud', 'Global leader in search, AI, and cloud computing.', 'https://careers.google.com', 'Active'),
      ('comp-2', 'Microsoft', 'Enterprise Software', 'Productivity, cloud services, and developer platforms.', 'https://careers.microsoft.com', 'Active'),
      ('comp-3', 'Amazon', 'E-Commerce & Cloud AWS', 'Cloud infrastructure and distributed retail systems.', 'https://amazon.jobs', 'Active'),
      ('comp-4', 'TCS Digital', 'IT Consulting', 'High-performance engineering consulting division.', 'https://tcs.com', 'Active')
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
  `);
  console.log('✅ 11. Companies seeded.');

  // 12. Seed Company Roles
  await pool.query(`
    INSERT INTO company_roles (id, company_id, role_name, description, experience_level, status)
    VALUES
      ('role-1', 'comp-1', 'Software Engineer - SDE 1', 'Entry-level engineering role focusing on algorithmic problem solving.', 'Fresher / 0-2 yrs', 'Active'),
      ('role-2', 'comp-2', 'Software Engineer (Full-Stack)', 'Building scalable cloud applications and APIs.', 'Fresher / 0-2 yrs', 'Active'),
      ('role-3', 'comp-3', 'SDE 1 (Distributed Systems)', 'High-throughput microservices and cloud databases.', 'Fresher / 0-2 yrs', 'Active'),
      ('role-4', 'comp-4', 'Digital Systems Engineer', 'Full-stack application engineering and data pipelines.', 'Fresher', 'Active')
    ON CONFLICT (id) DO UPDATE SET role_name = EXCLUDED.role_name;
  `);
  console.log('✅ 12. Company Roles seeded.');

  // 13. Seed Role Skill Requirements
  await pool.query(`
    INSERT INTO role_skill_requirements (id, role_id, skill_id, required_score, weight, importance)
    VALUES
      ('rsr-1', 'role-1', 'sk-1', 85, 1.5, 'Required'),
      ('rsr-2', 'role-1', 'sk-6', 80, 1.0, 'Required'),
      ('rsr-3', 'role-2', 'sk-2', 75, 1.2, 'Required'),
      ('rsr-4', 'role-2', 'sk-3', 70, 1.0, 'Preferred'),
      ('rsr-5', 'role-3', 'sk-1', 80, 1.4, 'Required'),
      ('rsr-6', 'role-3', 'sk-3', 75, 1.1, 'Required')
    ON CONFLICT (role_id, skill_id) DO NOTHING;
  `);
  console.log('✅ 13. Role Skill Requirements mapped.');

  // 14. Seed Sample Test Attempt
  await pool.query(`
    INSERT INTO test_attempts (
      id, candidate_id, assessment_id, attempt_number, status, started_at, submitted_at, time_taken_seconds
    ) VALUES
      ('att-001', 'cand-001', 'asm-001', 1, 'Completed', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '28 minutes', 1680)
    ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
  `);
  console.log('✅ 14. Test Attempt seeded.');

  // 15. Seed Candidate Answers
  await pool.query(`
    INSERT INTO candidate_answers (
      id, attempt_id, question_id, selected_option, is_correct, marks_obtained, time_taken_seconds, answered_at
    ) VALUES
      ('ans-1', 'att-001', 'q-101', 'B', true, 4, 42, NOW() - INTERVAL '2 days' + INTERVAL '5 minutes'),
      ('ans-2', 'att-001', 'q-102', 'B', true, 4, 55, NOW() - INTERVAL '2 days' + INTERVAL '12 minutes'),
      ('ans-3', 'att-001', 'q-103', 'B', true, 4, 38, NOW() - INTERVAL '2 days' + INTERVAL '18 minutes'),
      ('ans-4', 'att-001', 'q-104', 'B', true, 5, 82, NOW() - INTERVAL '2 days' + INTERVAL '25 minutes')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✅ 15. Candidate Answers seeded.');

  // 16. Seed Performance Analysis
  await pool.query(`
    INSERT INTO performance_analysis (
      id, attempt_id, overall_score, accuracy, speed_score,
      aptitude_score, reasoning_score, technical_score,
      strengths, weaknesses, ai_summary, recommendations
    ) VALUES (
      'perf-001', 'att-001', 82.5, 87.5, 84.0, 82, 74, 85,
      '["Data Structures", "Algorithm Optimization", "Logical Deduction"]'::jsonb,
      '["SQL Window Functions", "Probability & Combinatorics"]'::jsonb,
      'Candidate shows high technical proficiency in core CS fundamentals with strong problem-solving speed. Needs minor practice in advanced SQL windowing.',
      '["Practice 15 SQL Medium problems on LeetCode", "Review Permutations & Probability formulas", "Implement 3 Graph DFS/BFS algorithms"]'::jsonb
    )
    ON CONFLICT (attempt_id) DO UPDATE SET overall_score = EXCLUDED.overall_score;
  `);
  console.log('✅ 16. Performance Analysis seeded.');

  // 17. Seed Skill Performance
  await pool.query(`
    INSERT INTO skill_performance (
      id, attempt_id, candidate_id, skill_id, score, proficiency, questions_attempted, correct_answers
    ) VALUES
      ('sp-1', 'att-001', 'cand-001', 'sk-1', 90.0, 'Strong', 2, 2),
      ('sp-2', 'att-001', 'cand-001', 'sk-6', 85.0, 'Strong', 1, 1),
      ('sp-3', 'att-001', 'cand-001', 'sk-3', 75.0, 'Average', 1, 1)
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✅ 17. Skill Performance seeded.');

  // 18. Seed Company Readiness
  await pool.query(`
    INSERT INTO company_readiness (
      id, candidate_id, attempt_id, company_id, role_id,
      readiness_score, readiness_level, matched_skills, skill_gaps, ai_analysis
    ) VALUES (
      'cr-001', 'cand-001', 'att-001', 'comp-1', 'role-1',
      86.0, 'Strong',
      '["Problem Solving & DSA", "Code Quality & Debugging"]'::jsonb,
      '["System Scalability Patterns"]'::jsonb,
      'Candidate is well-positioned for Google SDE-1 with 86% match probability based on algorithmic speed and clean code metrics.'
    )
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✅ 18. Company Readiness seeded.');

  // 19. Seed Final Generated Report
  await pool.query(`
    INSERT INTO reports (
      id, candidate_id, attempt_id, report_type, overall_score,
      summary, strengths, weaknesses, recommendations, report_url
    ) VALUES (
      'rep-001', 'cand-001', 'att-001', 'Comprehensive Job Readiness Report', 85.0,
      'Verified evaluation for SDE Placement Readiness with 85/100 readiness index.',
      '["Data Structures", "Algorithmic Complexity", "Object-Oriented Design"]'::jsonb,
      '["Advanced SQL Subqueries", "Probability"]'::jsonb,
      '["Complete 7-day SQL Refresher", "Take Full-Stack Mock Exam #4"]'::jsonb,
      'https://readysetjob.com/verify/rep-001'
    )
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('✅ 19. Reports seeded.');

  console.log('\n🎉 ALL 19 DATABASE TABLES POPULATED & LINKED SUCCESSFULLY!');
};

runSeed().then(() => pool.end()).catch(e => { console.error('Seed error:', e.message); pool.end(); });
