// backend/src/middleware/roleMiddleware.js

const ApiError = require("../utils/ApiError");

/**
 * Role-based access control middleware
 * 
 * Usage:
 *   role("admin")
 *   role(["admin", "faculty"])
 *   role("alumni", "faculty")
 */
module.exports = function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    // Ensure user exists (authMiddleware required before this)
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    // ---- Normalize Accepted Roles ----
    const normalizedRoles = [
      ...new Set(
        allowedRoles
          .flat()
          .map((r) => String(r).trim().toLowerCase())
      ),
    ];

    const userRole = req.user.role
      ? String(req.user.role).toLowerCase()
      : null;

    if (!userRole) {
      return next(new ApiError(403, "User role missing from token"));
    }

    // ---- Super Admin Bypass ----
    if (userRole === "superadmin") {
      console.log(`🔓 SUPERADMIN BYPASS → Route: ${req.originalUrl}`);
      return next();
    }

    // ---- Check Permissions ----
    const allowed = normalizedRoles.includes(userRole);

    if (process.env.NODE_ENV !== "production") {
      console.log("🔐 ROLE VALIDATION →", {
        route: req.originalUrl,
        method: req.method,
        userRole,
        allowedRoles: normalizedRoles,
        allowed,
      });
    }

    if (!allowed) {
      return next(
        new ApiError(
          403,
          `Permission Denied → Need role: [${normalizedRoles.join(
            ", "
          )}] | Your Role: ${userRole}`
        )
      );
    }

    return next();
  };
};
