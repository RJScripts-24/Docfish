import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const uploadWindowMs = Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || 60_000);
const uploadMaxRequests = Number(process.env.UPLOAD_RATE_LIMIT_MAX || 30);

const uploadRateMap = new Map<string, RateLimitEntry>();

const getClientKey = (req: Request) =>
  `${req.user?.userId || 'anonymous'}:${req.ip || req.socket.remoteAddress || 'unknown'}`;

const purgeExpired = (now: number) => {
  for (const [key, entry] of uploadRateMap.entries()) {
    if (entry.resetAt <= now) {
      uploadRateMap.delete(key);
    }
  }
};

export const uploadRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const now = Date.now();
  purgeExpired(now);

  const key = getClientKey(req);
  const existing = uploadRateMap.get(key);

  if (!existing || existing.resetAt <= now) {
    uploadRateMap.set(key, {
      count: 1,
      resetAt: now + uploadWindowMs,
    });
    next();
    return;
  }

  if (existing.count >= uploadMaxRequests) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(Math.max(1, retryAfterSeconds)));
    res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many upload requests. Please try again later.',
    });
    return;
  }

  existing.count += 1;
  uploadRateMap.set(key, existing);
  next();
};
