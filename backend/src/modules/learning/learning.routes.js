const router = require("express").Router();
const controller = require("./learning.controller");
const auth = require("../../middleware/authMiddleware");

// ========= Learning Resources =========

// GET all / filtered resources
router.get("/resources", auth, controller.getResources);

// Create a new resource
router.post("/resources", auth, controller.createResource);

// Upvote / Downvote
router.post("/resources/:id/upvote", auth, controller.upvoteResource);
router.post("/resources/:id/downvote", auth, controller.downvoteResource);

// ========= AI Endpoints =========

// Resume parsing
router.post("/parse-resume", auth, controller.parseResume);

// AI Learning Path
router.post("/learning-path", auth, controller.getLearningPath);

module.exports = router;
