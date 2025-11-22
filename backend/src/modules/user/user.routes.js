// backend/src/modules/user/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const uploadMiddleware = require("../../middleware/uploadMiddleware");
const { authLimiter } = require("../../middleware/rateLimiter");
router.get(
  "/me",
  authMiddleware,
  userController.getMyProfile
);
router.put(
  "/me",
  authMiddleware,
  userController.updateMyProfile
);
router.put(
  "/me/avatar",
  authMiddleware,
  authLimiter, // protect upload abuse
  uploadMiddleware.single("avatar", "avatars"),
  userController.uploadAvatar
);
router.put(
  "/me/resume",
  authMiddleware,
  authLimiter,
  uploadMiddleware.single("resume", "resumes"),
  userController.uploadResume
);
router.get(
  "/:id",
  userController.getPublicProfile
);
module.exports = router;
