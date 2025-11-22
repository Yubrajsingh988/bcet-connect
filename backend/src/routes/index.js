// backend/src/routes/index.js
const router = require("express").Router();

/**
 * Optional rate limiter for sensitive endpoints like /search.
 * If `express-rate-limit` is not installed, we gracefully fall back to a passthrough middleware.
 */
let searchRateLimit = (req, res, next) => next();
try {
  // eslint-disable-next-line global-require
  const rateLimit = require("express-rate-limit");
  searchRateLimit = rateLimit({
    windowMs: 10 * 1000, // 10s window
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many search requests, please slow down." }
  });
  console.log("ℹ️ express-rate-limit loaded for /search");
} catch (e) {
  console.log("ℹ️ express-rate-limit not installed — /search will not be rate-limited (install express-rate-limit for protection)");
}

/**
 * Search service (single entry point).
 * Ensure backend/src/services/search.service.js exports globalSearch(q, options)
 */
const searchService = require("../services/search.service");

// simple health route
router.get("/", (req, res) => {
  res.json({ message: "BCET CONNECT API" });
});

/**
 * Global search endpoint
 * GET /search?q=term&limit=6&page=1&collections=users,jobs
 *
 * Query params:
 *  - q: string (required-ish; empty returns empty results)
 *  - limit: number (per-collection limit, default 6, max 50)
 *  - page: number (1-based page; converted to skip by service)
 *  - collections: comma-separated list of ['users','jobs','events','communities'] to restrict search
 *
 * Response:
 *  { success: true, data: { users: { items, total }, jobs: {...}, events: {...}, communities: {...} } }
 */
router.get("/search", searchRateLimit, async (req, res, next) => {
  try {
    const rawQ = req.query.q ?? "";
    const q = String(rawQ).trim();

    // parse and sanitize limit & page
    const rawLimit = parseInt(req.query.limit, 10);
    const rawPage = parseInt(req.query.page, 10);

    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 50)) : 6;
    const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1;

    // optional collections filter (comma-separated)
    let collections;
    if (req.query.collections) {
      collections = String(req.query.collections || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      // sanitize to allowed set
      const allowed = new Set(["users", "jobs", "events", "communities"]);
      collections = collections.filter((c) => allowed.has(c));
      if (collections.length === 0) collections = undefined; // treat as not provided
    }

    // If empty query, return empty sets quickly (avoid unnecessary work)
    if (!q) {
      return res.json({
        success: true,
        data: {
          users: { items: [], total: 0 },
          jobs: { items: [], total: 0 },
          events: { items: [], total: 0 },
          communities: { items: [], total: 0 }
        }
      });
    }

    const data = await searchService.globalSearch(q, { limit, page, collections });
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
});

/* --------------------------
   Existing route mounts
   (kept your original ordering and mounts)
   -------------------------- */

// Auth
router.use("/auth", require("../modules/auth/auth.routes"));

// Users — mount both /user and /users for backward-compatibility
// Prefer using /users in new frontend calls
router.use("/user", require("../modules/user/user.routes"));
router.use("/users", require("../modules/user/user.routes"));

// Feed
router.use("/feed", require("../modules/feed/feed.routes"));

// Jobs
router.use("/jobs", require("../modules/jobs/job.routes"));

// Events
router.use("/events", require("../modules/events/event.routes"));

// Communities
router.use("/communities", require("../modules/communities/community.routes"));

// Mentorship (general mentorship endpoints)
router.use("/mentorship", require("../modules/mentorship/mentorship.routes"));

// Chat (REST fallback / admin or history endpoints)
try {
  router.use("/chat", require("../modules/mentorship/chat/chat.routes"));
} catch (e) {
  // if chat module doesn't exist yet, skip silently (makes deployment easier)
  console.log("ℹ️ chat REST routes not mounted (module missing)");
}

// Learning
router.use("/learning", require("../modules/learning/learning.routes"));

// Admin
router.use("/admin", require("../modules/admin/admin.routes"));

// Analytics
router.use("/analytics", require("../modules/analytics/analytics.routes"));

// Donations
router.use("/donations", require("../modules/donations/donation.routes"));

// Notifications REST
router.use("/notifications", require("../modules/notifications/notification.routes"));

module.exports = router;
