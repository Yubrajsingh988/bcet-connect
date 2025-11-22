// backend/src/middleware/authMiddleware.js
/**
 * Auth middleware
 * - verifies JWT from Authorization header / x-access-token header / cookies
 * - distinguishes expired tokens from invalid tokens
 * - optional token revocation check (hook for Redis / DB)
 *
 * Usage:
 *   router.get("/me", authMiddleware, controller.me)
 *
 * Note:
 *   For cookie-based tokens ensure you use `cookie-parser` middleware in app.js:
 *     const cookieParser = require('cookie-parser'); app.use(cookieParser());
 */

const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const User = require("../modules/user/user.model");
const logger = require("../utils/logger");

// Optional: place to implement token revocation check (logout / blacklist).
// Return true if token is revoked and should be rejected.
const isTokenRevoked = async (token, decoded) => {
  // Placeholder implementation — replace with actual logic when ready.
  // Example: check Redis set "revoked_tokens" or DB table for token jti.
  // return await redisClient.sismember("revoked_tokens", token) === 1;
  return false;
};

const getTokenFromRequest = (req) => {
  // 1) Authorization header: "Bearer <token>"
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1].trim();
  }

  // 2) custom header
  const headerToken = req.headers["x-access-token"] || req.headers["x_auth_token"];
  if (headerToken && typeof headerToken === "string" && headerToken.trim() !== "") {
    return headerToken.trim();
  }

  // 3) cookies (if you use cookie-parser)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

module.exports = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next(new ApiError(401, "Authorization token missing"));
    }

    let decoded;
    try {
      // verify will throw if invalid or expired
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Differentiate expired vs invalid
      if (err.name === "TokenExpiredError") {
        return next(new ApiError(401, "Session expired. Please log in again."));
      }
      logger.warn("Auth token verification failed", { message: err.message });
      return next(new ApiError(401, "Invalid authentication token"));
    }

    if (!decoded || !decoded.id) {
      return next(new ApiError(403, "Invalid token payload"));
    }

    // Optional revocation check (e.g. token blacklisting on logout)
    try {
      const revoked = await isTokenRevoked(token, decoded);
      if (revoked) {
        return next(new ApiError(401, "Token revoked. Please log in again."));
      }
    } catch (revErr) {
      // don't block auth flow on revocation-check failure — just log and continue
      logger.error("Token revocation check failed", revErr);
    }

    // Load minimal user info (avoid loading sensitive fields)
    const user = await User.findById(decoded.id).select("_id name email role avatar");
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    // attach normalized user to req
    req.user = {
      _id: user._id,
      id: user._id, // backward compatibility: some code expects .id
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    if (process.env.NODE_ENV !== "production") {
      logger.debug("AUTH SUCCESS", { id: req.user._id.toString(), role: req.user.role });
    }

    return next();
  } catch (err) {
    // Unexpected errors -> forward to global error handler
    logger.error("Auth middleware unexpected error", err);
    return next(err);
  }
};
