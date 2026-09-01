import { pool } from '../db/pool.js';

// GET /api/admin/stats  — dashboard KPIs
export const getStats = async (req, res) => {
  try {
    const [candCount, subCount, avgScore, assessCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM candidates'),
      pool.query('SELECT COUNT(*) FROM submissions'),
      pool.query('SELECT ROUND(AVG(score)) as avg FROM submissions'),
      pool.query('SELECT COUNT(*) FROM assessments'),
    ]);
    const jobReadyCount = await pool.query(
      'SELECT COUNT(*) FROM candidates WHERE job_readiness_score >= 70'
    );
    res.json({
      success: true,
      stats: {
        totalCandidates: parseInt(candCount.rows[0].count),
        totalSubmissions: parseInt(subCount.rows[0].count),
        avgScore: parseInt(avgScore.rows[0].avg) || 0,
        totalAssessments: parseInt(assessCount.rows[0].count),
        jobReadyCandidates: parseInt(jobReadyCount.rows[0].count),
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/analytics  — score distribution & category breakdown
export const getAnalytics = async (req, res) => {
  try {
    const scoreRanges = await pool.query(`
      SELECT
        CASE
          WHEN score >= 90 THEN '90-100'
          WHEN score >= 80 THEN '80-89'
          WHEN score >= 70 THEN '70-79'
          WHEN score >= 60 THEN '60-69'
          ELSE 'Below 60'
        END as range,
        COUNT(*) as count
      FROM submissions GROUP BY range ORDER BY range DESC
    `);

    const categoryAvg = await pool.query(`
      SELECT a.category, ROUND(AVG(s.score)) as avg_score, COUNT(*) as total
      FROM submissions s
      JOIN assessments a ON s.assessment_id = a.id
      GROUP BY a.category ORDER BY avg_score DESC
    `);

    const recentSubmissions = await pool.query(`
      SELECT s.id, c.name, c.college, a.title, a.category, s.score, s.accuracy, s.created_at
      FROM submissions s
      JOIN candidates c ON s.candidate_id = c.id
      JOIN assessments a ON s.assessment_id = a.id
      ORDER BY s.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      scoreDistribution: scoreRanges.rows,
      categoryAverages: categoryAvg.rows,
      recentSubmissions: recentSubmissions.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/reports  — full candidate report for CSV export
export const getPlacementReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id, c.name, c.email, c.mobile, c.college, c.degree, c.branch,
        c.graduation_year, c.experience_level,
        c.job_readiness_score, c.readiness_level,
        c.aptitude_score, c.reasoning_score, c.technical_score,
        c.assessments_completed, c.created_at
      FROM candidates c
      ORDER BY c.job_readiness_score DESC
    `);
    res.json({ success: true, data: result.rows, total: result.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
