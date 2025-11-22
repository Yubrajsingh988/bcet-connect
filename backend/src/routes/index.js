const router = require("express").Router();

router.get("/", (req, res) => {
  res.json({ message: "BCET CONNECT API" });
});

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/user", require("../modules/user/user.routes"));
router.use("/feed", require("../modules/feed/feed.routes"));
router.use("/jobs", require("../modules/jobs/job.routes"));
router.use("/events", require("../modules/events/event.routes"));
router.use("/communities", require("../modules/communities/community.routes"));
router.use("/mentorship", require("../modules/mentorship/mentorship.routes"));
router.use("/learning", require("../modules/learning/learning.routes"));
router.use("/admin", require("../modules/admin/admin.routes"));
router.use("/analytics", require("../modules/analytics/analytics.routes"));
router.use("/donations", require("../modules/donations/donation.routes"));

module.exports = router;
