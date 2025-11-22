// backend/src/middleware/roleMiddleware.js
/**
 * roleMiddleware(...allowedRoles)
 *
 * Usage:
 *   // single role
 *   router.post("/admin", authMiddleware, roleMiddleware("admin"), controller.handler);
 *
 *   // multiple roles
 *   router.post("/mentors", authMiddleware, roleMiddleware("faculty", "alumni"), controller.handler);
 *
 *   // array style
 *   router.post("/x", authMiddleware, roleMiddleware(...["student","alumni"]), controller.handler);
 *
 * Behavior:
 *   - If no roles are provided (roleMiddleware()), the middleware allows the request (public route).
 *   - If user role === "superadmin", always bypasses checks.
 *   - Normalizes roles and user role to lowercase trimmed strings.
 */

const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

module.exports = function roleMiddleware(...allowedRoles) {
  // Normalize allowedRoles: flatten, filter falsy, lowercase & trim, unique
  const normalizedRoles = [
    ...new Set(
      allowedRoles
        .flat(Infinity)
        .filter(Boolean)
        .map((r) => String(r).trim().toLowerCase())
    ),
  ];

  return (req, res, next) => {
    try {
      // If no roles passed → no restriction (public route)
      if (!normalizedRoles || normalizedRoles.length === 0) {
        return next();
      }

      // Ensure auth middleware ran and populated req.user
      if (!req.user) {
        return next(new ApiError(401, "Authentication required"));
      }

      const userRole = req.user.role ? String(req.user.role).toLowerCase().trim() : null;
      if (!userRole) {
        return next(new ApiError(403, "User role missing"));
      }

      // Superadmin bypass (optional special role)
      if (userRole === "superadmin") {
        if (process.env.NODE_ENV !== "production") {
          logger.debug("ROLE: superadmin bypass", { route: req.originalUrl, method: req.method });
        }
        return next();
      }

      const allowed = normalizedRoles.includes(userRole);

      if (process.env.NODE_ENV !== "production") {
        logger.debug("ROLE VALIDATION", {
          route: req.originalUrl,
          method: req.method,
          userRole,
          requiredRoles: normalizedRoles,
          allowed,
        });
      }

      if (!allowed) {
        return next(
          new ApiError(
            403,
            `Permission denied. Required role(s): [${normalizedRoles.join(", ")}]; your role: ${userRole}`
          )
        );
      }

      return next();
    } catch (err) {
      // Unexpected error in middleware
      logger.error("roleMiddleware unexpected error", err);
      return next(err);
    }
  };
};
