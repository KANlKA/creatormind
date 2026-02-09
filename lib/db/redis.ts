import { Redis } from '@upstash/redis';

// Lazy initialization - only create Redis client when actually needed
let redisInstance: Redis | null = null;

function getRedis(): Redis {
  if (!redisInstance && process.env.UPSTASH_REDIS_REST_URL) {
    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redisInstance!;
}

export default getRedis();

// Helper functions
export async function cacheSet(key: string, value: any, expirationSeconds?: number) {
  const redis = getRedis();
  if (expirationSeconds) {
    await redis.set(key, JSON.stringify(value), { ex: expirationSeconds });
  } else {
    await redis.set(key, JSON.stringify(value));
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const data = await redis.get(key);
  if (!data) return null;
  return typeof data === 'string' ? JSON.parse(data) : (data as T);
}

export async function cacheDel(key: string) {
  const redis = getRedis();
  await redis.del(key);
}

export async function cacheExists(key: string): Promise<boolean> {
  const redis = getRedis();
  const result = await redis.exists(key);
  return result === 1;
}