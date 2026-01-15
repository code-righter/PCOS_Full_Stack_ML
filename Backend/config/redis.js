// src/config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const redis = new Redis(process.env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  family: 4, 
});

redis.on('connect', () => {
  console.log('✅ Remote Redis Connected Successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err);
});

export default redis;