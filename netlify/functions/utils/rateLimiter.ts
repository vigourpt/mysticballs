interface RateLimitEntry {
  count: number;
  timestamp: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  private limits: Map<string, RateLimitEntry>;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  private constructor(windowMs: number = 60_000, maxRequests: number = 5) {
    this.limits = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, { count: 1, timestamp: now });
      return false;
    }

    if (now - entry.timestamp > this.windowMs) {
      // Reset if window has passed
      this.limits.set(key, { count: 1, timestamp: now });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.timestamp > this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();
