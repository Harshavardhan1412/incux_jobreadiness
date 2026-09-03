import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL is not set. Check your backend/.env file.');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool = new Pool({
  connectionString,
  ssl: isLocalhost ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '15000', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
});

if (pool) {
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
  });
} else {
  console.warn('⚠️  DATABASE_URL is not set in backend/.env. Database features will run in mock mode.');
}

export const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW() as time, current_database() as db');
      client.release();
      console.log(`✅ PostgreSQL connected → database: "${res.rows[0].db}" at ${res.rows[0].time}`);
      return true;
    } catch (err) {
      console.error(`⚠️ PostgreSQL connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
  return false;
};

export const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ PostgreSQL connection pool closed gracefully.');
  } catch (err) {
    console.error('⚠️ Error closing PostgreSQL pool:', err.message);
  }
};
