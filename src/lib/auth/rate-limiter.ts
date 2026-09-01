/**
 * In-Memory Sliding-Window Rate Limiter for Login & Sensitive Auth Actions
 * Compatible with Edge / Node.js runtime.
 */

interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes window
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Clean expired entries periodically
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.lockedUntil && record.lockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (!record.lockedUntil && now - record.firstAttemptAt > WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Check if the given key is currently rate-limited / locked out
 */
export function checkRateLimit(key: string): { isAllowed: boolean; retryAfterSeconds?: number } {
  cleanupExpired();
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    return { isAllowed: true };
  }

  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isAllowed: false, retryAfterSeconds };
  }

  return { isAllowed: true };
}

/**
 * Record a failed authentication attempt
 */
export function recordFailedAttempt(key: string): { isLocked: boolean; attemptsLeft: number; retryAfterSeconds?: number } {
  cleanupExpired();
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttemptAt: now,
      lockedUntil: null,
    });
    return { isLocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - 1 };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return { isLocked: true, attemptsLeft: 0, retryAfterSeconds };
  }

  return { isLocked: false, attemptsLeft: MAX_FAILED_ATTEMPTS - record.attempts };
}

/**
 * Reset rate limit counter on successful login
 */
export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}
