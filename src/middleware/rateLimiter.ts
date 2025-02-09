import rateLimit from 'express-rate-limit';

export const readingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many readings requested. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Configure for Netlify Functions environment
  handler: (_, res) => {
    res.status(429).json({
      error: 'Too many readings requested. Please try again later.'
    });
  },
  keyGenerator: (req) => {
    // Get IP from Netlify-specific headers
    const ip = 
      req.headers['client-ip'] ||
      req.headers['x-nf-client-connection-ip'] ||
      'unknown';
    return typeof ip === 'string' ? ip : 'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for OPTIONS requests
    return req.method === 'OPTIONS';
  },
  requestWasSuccessful: () => true, // Don't count failed requests
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
