const express = require("express");
const router = express.Router();

const controller = require("./feed.controller");
const auth = require("../../middleware/authMiddleware");
const validateRequest = require("../../middleware/validateRequest");
const uploadMW = require("../../middleware/uploadMiddleware");

const {
  createPostSchema,
  addCommentSchema,
  getFeedQuerySchema,
} = require("./feed.validation");

/* ──────────────────────────────────────────────
   CREATE POST
   - Media upload first
   - Then validation
   - Then controller
─────────────────────────────────────────────── */
router.post(
  "/",
  auth,
  uploadMW.array("media", 6, "feed"),
  validateRequest(createPostSchema),
  controller.createPost
);

/* ──────────────────────────────────────────────
   GET FEED
   - Pagination safe
   - Type filter safe
─────────────────────────────────────────────── */
router.get(
  "/",
  auth,
  validateRequest(getFeedQuerySchema, "query"),
  controller.getFeed
);

/* ──────────────────────────────────────────────
   UPDATE POST
─────────────────────────────────────────────── */
router.put(
  "/:id",
  auth,
  validateRequest(createPostSchema),
  controller.updatePost
);

/* ──────────────────────────────────────────────
   DELETE POST
   - Also deletes Cloudinary media (handled in service)
─────────────────────────────────────────────── */
router.delete("/:id", auth, controller.deletePost);

/* ──────────────────────────────────────────────
   INTERACTIONS
─────────────────────────────────────────────── */
router.post("/:id/like", auth, controller.toggleLike);

router.post(
  "/:id/comment",
  auth,
  validateRequest(addCommentSchema),
  controller.addComment
);

module.exports = router;
