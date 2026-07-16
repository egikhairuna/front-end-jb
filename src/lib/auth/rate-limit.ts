import { redis } from '@/lib/redis';

const WINDOW_MS = 15 * 60 * 1000;   // 15 minutes
const MAX_ATTEMPTS = 10;
const KEY_TTL_SEC = 20 * 60;

export async function checkRateLimit(
  identifier: string,
  maxAttempts: number = MAX_ATTEMPTS
): Promise<{
  allowed: boolean;
  retryAfterMs?: number;
  remaining?: number;
}> {
  try {
    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const key = `rl:${identifier}`;

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, KEY_TTL_SEC);

    const results = await pipeline.exec();
    if (!results) return { allowed: true };

    const count = results[2]?.[1] as number;

    if (count > maxAttempts) {
      const oldest = await redis.zrange(key, 0, 0, 'WITHSCORES');
      const oldestTime = oldest[1] ? parseInt(oldest[1], 10) : now;
      const retryAfterMs = Math.max(0, oldestTime + WINDOW_MS - now);
      return { allowed: false, retryAfterMs, remaining: 0 };
    }

    return { allowed: true, remaining: maxAttempts - count };
  } catch (err) {
    // Fail-open: if Redis is down, allow the request
    console.error('Rate limit Redis error — failing open:', (err as Error).message);
    return { allowed: true };
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}
