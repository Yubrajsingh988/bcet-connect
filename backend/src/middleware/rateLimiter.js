// backend/src/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

/**
 * General light limiter for all requests (prevents floods)
 * - 300 req/min per IP by default (adjust for your hosting)
 */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // max 300 requests per minute per IP
  standardHeaders: true, // Return rate limit info in the RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests — please slow down.",
    });
  },
});

/**
 * Auth limiter for sensitive endpoints (login/register/password)
 * - small number to mitigate brute-force (10 per 15 minutes)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Too many authentication attempts. Try again later or contact support.",
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
};
