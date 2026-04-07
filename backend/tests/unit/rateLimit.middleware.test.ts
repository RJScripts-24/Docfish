const makeRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe('uploadRateLimiter', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.UPLOAD_RATE_LIMIT_WINDOW_MS = '60000';
    process.env.UPLOAD_RATE_LIMIT_MAX = '2';
  });

  afterEach(() => {
    delete process.env.UPLOAD_RATE_LIMIT_WINDOW_MS;
    delete process.env.UPLOAD_RATE_LIMIT_MAX;
  });

  it('allows requests up to the configured limit', () => {
    const { uploadRateLimiter } = require('../../src/middlewares/rateLimit.middleware');

    const req: any = {
      user: { userId: 'user-1' },
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    };

    const res = makeRes();
    const next = jest.fn();

    uploadRateLimiter(req, res, next);
    uploadRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 429 when limit is exceeded', () => {
    const { uploadRateLimiter } = require('../../src/middlewares/rateLimit.middleware');

    const req: any = {
      user: { userId: 'user-2' },
      ip: '127.0.0.2',
      socket: { remoteAddress: '127.0.0.2' },
    };

    const res = makeRes();
    const next = jest.fn();

    uploadRateLimiter(req, res, next);
    uploadRateLimiter(req, res, next);
    uploadRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'RATE_LIMITED',
      })
    );
  });
});
