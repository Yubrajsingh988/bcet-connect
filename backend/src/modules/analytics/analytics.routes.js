const router = require("express").Router();
const controller = require("./analytics.controller");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");

/**
 * ✅ All analytics routes are ADMIN-ONLY
 * authMiddleware → JWT verify
 * role("admin") → only admin can access
 */
router.use(auth, role("admin"));

/**
 * 📌 OVERVIEW STATS
 * URL: GET /api/analytics/overview
 * Use-case: Admin dashboard top counters
 */
router.get("/overview", controller.getOverview);

/**
 * 📌 USER ANALYTICS
 * URL: GET /api/analytics/users
 * Use-case: Role distribution, monthly signups
 */
router.get("/users", controller.userStats);

/**
 * 📌 JOBS ANALYTICS
 * URL: GET /api/analytics/jobs
 * Use-case: total jobs, pending vs approved, posting trends
 */
router.get("/jobs", controller.jobStats);

/**
 * 📌 EVENTS ANALYTICS
 * URL: GET /api/analytics/events
 * Use-case: events count, approvals, registrations trend
 */
router.get("/events", controller.eventStats);

/**
 * 📌 COMMUNITIES ANALYTICS
 * URL: GET /api/analytics/communities
 * Use-case: most active communities, members, engagement
 */
router.get("/communities", controller.communityStats);

/**
 * 📌 FEED / POSTS ANALYTICS
 * URL: GET /api/analytics/feed
 * Use-case: posts per day, top posts, active users
 */
router.get("/feed", controller.feedStats);

/**
 * 📌 LEARNING / CONTENT ANALYTICS (Future / optional)
 * URL: GET /api/analytics/learning
 */
router.get("/learning", controller.learningStats);

/**
 * 📌 DONATIONS ANALYTICS
 * URL: GET /api/analytics/donations
 * Use-case: total funds, monthly donations, top donors
 */
router.get("/donations", controller.donationStats);

module.exports = router;
