import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30000,
      max: 10,
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
  });
} else {
  console.warn('⚠️  DATABASE_URL is not set in backend/.env. Database features will run in mock mode.');
}

export const testConnection = async () => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as time, current_database() as db');
    client.release();
    console.log(`✅ PostgreSQL connected → database: "${res.rows[0].db}" at ${res.rows[0].time}`);
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    return false;
  }
};
