import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://default:qeTZunBQpbbGqpqXmnFZoKLNzzqnNCdo@redis.railway.internal:6379';

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    connectTimeout: 4000,
    reconnectStrategy: (retries) => {
      // Avoid excessive CPU/connection attempts if Redis host is not reachable in current environment
      if (retries > 3) {
        return false;
      }
      return Math.min(retries * 500, 2000);
    }
  }
});

let isRedisReady = false;

redisClient.on('connect', () => {
  console.log('🔴 [Redis] Connected to Redis instance.');
});

redisClient.on('ready', () => {
  isRedisReady = true;
  console.log('✅ [Redis] Client ready for execution caching.');
});

redisClient.on('error', (err) => {
  isRedisReady = false;
  // Graceful non-fatal logging to avoid unhandled exceptions or crashing Express
  if (err.code === 'ENOTFOUND' || err.message?.includes('ENOTFOUND')) {
    // Expected when running in local development outside of Railway private VPC
  } else {
    console.warn(`⚠️ [Redis] Notice: ${err.message}`);
  }
});

redisClient.on('end', () => {
  isRedisReady = false;
});

// Non-blocking asynchronous initial connection
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    // Graceful fallback to direct execution when Redis is not available
  }
})();

/**
 * Returns true if Redis is ready and available for read/write operations
 */
export const isRedisAvailable = () => isRedisReady && redisClient.isOpen;
