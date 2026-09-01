import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../src/db/pool.js';
import { initSchema } from '../src/db/schema.js';
import bcrypt from 'bcryptjs';

const candidates = [
  { id: 'cand-001', name: 'John Doe', email: 'john.doe@example.com', mobile: '9876543210', college: 'BITS Pilani', degree: 'B.Tech', branch: 'Computer Science', graduation_year: '2026', experience_level: 'Fresher', job_readiness_score: 85, readiness_level: 'Job Ready', aptitude_score: 88, reasoning_score: 82, technical_score: 85, assessments_completed: 4 },
  { id: 'cand-002', name: 'Sarah Chen', email: 'sarah.chen@example.com', mobile: '9123456789', college: 'NIT Trichy', degree: 'B.Tech', branch: 'Information Technology', graduation_year: '2026', experience_level: 'Fresher', job_readiness_score: 78, readiness_level: 'Good Progress', aptitude_score: 82, reasoning_score: 74, technical_score: 78, assessments_completed: 3 },
  { id: 'cand-003', name: 'Arjun Patel', email: 'arjun.patel@example.com', mobile: '9988776655', college: 'VIT Vellore', degree: 'B.Tech', branch: 'Electronics & CS', graduation_year: '2027', experience_level: 'Fresher', job_readiness_score: 62, readiness_level: 'Needs Improvement', aptitude_score: 65, reasoning_score: 60, technical_score: 62, assessments_completed: 2 },
  { id: 'cand-004', name: 'Priya Sharma', email: 'priya.sharma@example.com', mobile: '8877665544', college: 'Amrita University', degree: 'B.Tech', branch: 'CS & Engineering', graduation_year: '2026', experience_level: 'Fresher', job_readiness_score: 91, readiness_level: 'Excellent', aptitude_score: 94, reasoning_score: 89, technical_score: 91, assessments_completed: 5 },
  { id: 'cand-005', name: 'Rahul Verma', email: 'rahul.verma@example.com', mobile: '7766554433', college: 'SRM Institute', degree: 'B.Tech', branch: 'Mechanical Engineering', graduation_year: '2026', experience_level: 'Fresher', job_readiness_score: 45, readiness_level: 'Early Stage', aptitude_score: 50, reasoning_score: 42, technical_score: 45, assessments_completed: 1 },
];

const assessments = [
  { id: 'asm-001', title: 'Technical Aptitude Test', category: 'Technical', description: 'Core CS fundamentals: DSA, OOP, DBMS, OS.', difficulty: 'Medium', duration_minutes: 45, total_questions: 20, passing_score: 65, status: 'Available' },
  { id: 'asm-002', title: 'Quantitative Aptitude', category: 'Aptitude', description: 'Arithmetic, algebra, and number systems.', difficulty: 'Easy', duration_minutes: 30, total_questions: 20, passing_score: 60, status: 'Available' },
  { id: 'asm-003', title: 'Logical Reasoning', category: 'Reasoning', description: 'Patterns, sequences, and analytical reasoning.', difficulty: 'Medium', duration_minutes: 30, total_questions: 20, passing_score: 65, status: 'Available' },
  { id: 'asm-004', title: 'Full-Stack Mock Exam', category: 'Technical', description: 'React, Node.js, SQL, and system design.', difficulty: 'Hard', duration_minutes: 60, total_questions: 30, passing_score: 70, status: 'Available' },
];

const questions = [
  { id: 'q-001', category: 'Technical', topic: 'Arrays & Strings', difficulty: 'Easy', type: 'Single Choice', question: 'What is the time complexity of accessing an element by index in an array?', options: JSON.stringify({ A: 'O(n)', B: 'O(log n)', C: 'O(1)', D: 'O(n²)' }), correct_answer: 'C', explanation: 'Array index access is O(1) as it uses direct memory addressing.', marks: 4, time_limit_sec: 45, tags: ['arrays', 'complexity'] },
  { id: 'q-002', category: 'Technical', topic: 'OOP Concepts', difficulty: 'Medium', type: 'Single Choice', question: 'Which OOP principle allows a class to inherit properties from multiple parent classes?', options: JSON.stringify({ A: 'Encapsulation', B: 'Multiple Inheritance', C: 'Polymorphism', D: 'Abstraction' }), correct_answer: 'B', explanation: 'Multiple inheritance allows a class to inherit from more than one parent class.', marks: 4, time_limit_sec: 60, tags: ['oop', 'inheritance'] },
  { id: 'q-003', category: 'Aptitude', topic: 'Number Systems', difficulty: 'Easy', type: 'Single Choice', question: 'What is 15% of 240?', options: JSON.stringify({ A: '36', B: '34', C: '38', D: '32' }), correct_answer: 'A', explanation: '15% × 240 = 0.15 × 240 = 36.', marks: 4, time_limit_sec: 45, tags: ['percentage', 'arithmetic'] },
  { id: 'q-004', category: 'Reasoning', topic: 'Sequences', difficulty: 'Medium', type: 'Single Choice', question: 'What comes next in the series: 2, 6, 12, 20, 30, ?', options: JSON.stringify({ A: '40', B: '42', C: '44', D: '46' }), correct_answer: 'B', explanation: 'Differences: 4,6,8,10,12. Next = 30+12 = 42.', marks: 4, time_limit_sec: 60, tags: ['series', 'patterns'] },
  { id: 'q-005', category: 'Technical', topic: 'SQL Queries', difficulty: 'Medium', type: 'Code', question: 'What does this SQL query return?', code_snippet: 'SELECT department, COUNT(*) as emp_count\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY emp_count DESC;', language: 'sql', options: JSON.stringify({ A: 'All departments with their employee count', B: 'Departments with more than 5 employees, sorted by count descending', C: 'Top 5 departments by employee count', D: 'All employees grouped alphabetically' }), correct_answer: 'B', explanation: 'HAVING COUNT(*) > 5 filters groups, ORDER BY DESC sorts descending.', marks: 6, time_limit_sec: 90, tags: ['sql', 'aggregation', 'having'] },
];

const run = async () => {
  console.log('🌱 Starting database seed...');
  await initSchema();

  // Admin user
  const adminHash = await bcrypt.hash('Admin@2026', 10);
  await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET password_hash=EXCLUDED.password_hash`,
    ['admin-1', 'HR Administrator', 'admin@readysetjob.com', adminHash, 'admin']
  );
  console.log('✅ Admin user seeded (admin@readysetjob.com / Admin@2026)');

  // Candidates
  for (const c of candidates) {
    const hash = await bcrypt.hash('Test@1234', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES ($1,$2,$3,$4,'candidate')
       ON CONFLICT (id) DO NOTHING`,
      [c.id, c.name, c.email, hash]
    );
    await pool.query(
      `INSERT INTO candidates (id,name,email,mobile,college,degree,branch,graduation_year,experience_level,
       job_readiness_score,readiness_level,aptitude_score,reasoning_score,technical_score,assessments_completed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO UPDATE SET job_readiness_score=EXCLUDED.job_readiness_score`,
      [c.id,c.name,c.email,c.mobile,c.college,c.degree,c.branch,c.graduation_year,c.experience_level,
       c.job_readiness_score,c.readiness_level,c.aptitude_score,c.reasoning_score,c.technical_score,c.assessments_completed]
    );
  }
  console.log(`✅ ${candidates.length} candidates seeded (password: Test@1234)`);

  // Assessments
  for (const a of assessments) {
    await pool.query(
      `INSERT INTO assessments (id,title,category,description,difficulty,duration_minutes,total_questions,passing_score,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title`,
      [a.id,a.title,a.category,a.description,a.difficulty,a.duration_minutes,a.total_questions,a.passing_score,a.status]
    );
  }
  console.log(`✅ ${assessments.length} assessments seeded`);

  // Questions
  for (const q of questions) {
    await pool.query(
      `INSERT INTO questions (id,category,topic,difficulty,type,question,code_snippet,language,options,correct_answer,explanation,marks,time_limit_sec,tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (id) DO UPDATE SET question=EXCLUDED.question`,
      [q.id,q.category,q.topic,q.difficulty,q.type,q.question,q.code_snippet||null,q.language||null,
       q.options,q.correct_answer,q.explanation,q.marks,q.time_limit_sec,q.tags||[]]
    );
  }
  console.log(`✅ ${questions.length} questions seeded`);

  console.log('\n🎉 Database seed complete!');
  await pool.end();
};

run().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
