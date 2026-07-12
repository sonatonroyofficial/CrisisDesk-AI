import { NextRequest } from 'next/server';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10; // Max 10 requests per minute per IP

export function isRateLimited(req: NextRequest): { limited: boolean; limit: number; remaining: number; reset: number } {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

  const now = Date.now();
  let info = rateLimitMap.get(ip);

  if (!info || now > info.resetTime) {
    info = {
      count: 0,
      resetTime: now + WINDOW_MS,
    };
  }

  info.count += 1;
  rateLimitMap.set(ip, info);

  const remaining = Math.max(0, MAX_REQUESTS - info.count);
  const resetSeconds = Math.ceil((info.resetTime - now) / 1000);

  if (info.count > MAX_REQUESTS) {
    return {
      limited: true,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: resetSeconds,
    };
  }

  return {
    limited: false,
    limit: MAX_REQUESTS,
    remaining,
    reset: resetSeconds,
  };
}
