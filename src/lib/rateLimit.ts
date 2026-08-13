/**
 * Simple in-memory rate limiter for Vercel serverless functions.
 * Limits each IP to `maxRequests` per `windowMs`.
 *
 * Note: In-memory state is NOT shared across Vercel instances.
 * For high traffic, replace with Upstash Redis (free tier is sufficient).
 * For the current usage level this is fine — each cold start gets a fresh window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // epoch ms
}

export function checkRateLimit(
  ip: string,
  maxRequests = 5,
  windowMs = 60 * 60 * 1000 // 1 hour
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    // Fresh window
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}
