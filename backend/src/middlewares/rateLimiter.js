import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter middleware:
 * Limits each IP to 100 requests per 15 minutes.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests from this IP, please try again later.',
    });
  },
});

/**
 * Auth-specific rate limiter middleware:
 * Limits each IP to 10 requests per 15 minutes.
 * Generic message to avoid revealing details.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 10 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later.',
    });
  },
});


/**
 * Refresh token rate limiter middleware:
 * Allows more frequent calls than login/register, but still limits abuse.
 * Limits each IP to 50 requests per 15 minutes to prevent refresh token flooding.
 */
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many token refresh attempts, please try again later.',
    });
  },
});
