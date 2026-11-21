interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowRateLimiter {
  private readonly store = new Map<string, RateLimitEntry>();

  constructor(
    private readonly maxAttempts: number,
    private readonly windowMs: number
  ) {}

  consume(key: string, nowMs: number = Date.now()): RateLimitResult {
    const existing = this.store.get(key);

    if (!existing || nowMs >= existing.resetAt) {
      this.store.set(key, { count: 1, resetAt: nowMs + this.windowMs });
      return {
        allowed: true,
        remaining: Math.max(0, this.maxAttempts - 1),
        retryAfterSeconds: 0,
      };
    }

    if (existing.count >= this.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((existing.resetAt - nowMs) / 1000)
        ),
      };
    }

    const nextCount = existing.count + 1;
    this.store.set(key, { count: nextCount, resetAt: existing.resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, this.maxAttempts - nextCount),
      retryAfterSeconds: 0,
    };
  }

  reset(key: string): void {
    this.store.delete(key);
  }
}

export const loginRateLimiter = new SlidingWindowRateLimiter(5, 15 * 60 * 1000);
export const commentRateLimiter = new SlidingWindowRateLimiter(3, 10 * 60 * 1000);

