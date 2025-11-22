const router = require("express").Router();
const controller = require("./admin.controller");
const auth = require("../../middleware/authMiddleware");
const role = require("../../middleware/roleMiddleware");

// Only Admin Access
router.use(auth, role("admin"));

/* USERS */
router.get("/users", controller.getUsers);
router.patch("/users/:id/role", controller.changeUserRole);

/* JOBS */
router.get("/jobs/pending", controller.pendingJobs);
router.post("/jobs/:id/approve", controller.approveJob);

/* EVENTS */
router.get("/events/pending", controller.pendingEvents);
router.post("/events/:id/approve", controller.approveEvent);

/* ANALYTICS */
router.get("/analytics", controller.analytics);

module.exports = router;
