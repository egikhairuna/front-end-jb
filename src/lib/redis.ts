import Redis from 'ioredis';

declare global {
  var __redis: Redis | undefined;
}

function getRedisClient(): Redis {
  if (globalThis.__redis) return globalThis.__redis;
  
  const client = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableOfflineQueue: false,
    retryStrategy(times) {
      // Exponential/linear backoff up to a maximum of 30 seconds between retries
      return Math.min(times * 2000, 30000);
    },
  });

  let hasLoggedError = false;

  client.on('error', (err) => {
    if (!hasLoggedError) {
      console.error('Redis rate-limit client error:', err.message);
      console.warn('⚠️ Rate limiting will fail-open (in-memory rate limit is not active).');
      hasLoggedError = true;
    }
  });

  client.on('connect', () => {
    if (hasLoggedError) {
      console.log('✅ Redis rate-limit client connected successfully.');
      hasLoggedError = false;
    }
  });

  globalThis.__redis = client;
  return client;
}

export const redis = getRedisClient();
