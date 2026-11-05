// In-memory token bucket per key (BUILD_SPEC §2). Hostinger runs a single Node instance, so one
// process-wide map is enough.
type Bucket = { tokens: number; updatedAt: number };

const MAX_TRACKED_KEYS = 10_000;

export function createRateLimiter({ capacity, perMs }: { capacity: number; perMs: number }) {
  const buckets = new Map<string, Bucket>();

  return function allow(key: string, now = Date.now()): boolean {
    if (buckets.size > MAX_TRACKED_KEYS) buckets.clear();
    const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
    const refilled = (now - bucket.updatedAt) * (capacity / perMs);
    const tokens = Math.min(capacity, bucket.tokens + refilled);
    const allowed = tokens >= 1;
    buckets.set(key, { tokens: allowed ? tokens - 1 : tokens, updatedAt: now });
    return allowed;
  };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
