interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateLimitEntry>();

const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  }

  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      limited: false,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;

  return {
    limited: false,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}
