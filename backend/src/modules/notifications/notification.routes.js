// backend/src/modules/notifications/notification.routes.js
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const controller = require("./notification.controller");
const auth = require("../../middleware/authMiddleware");

/**
 * Simple param validator for Mongo ObjectId to avoid invalid ids reaching the controller.
 */
function validateObjectIdParam(req, res, next) {
  const id = req.params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, error: "Invalid notification id" });
  }
  return next();
}

/**
 * Optional: attach rate limiter middleware here for heavy endpoints like listing/search.
 * e.g.
 * const rateLimit = require("express-rate-limit");
 * const listLimiter = rateLimit({ windowMs: 1000 * 60, max: 60 });
 * router.get("/", auth, listLimiter, controller.list);
 */

/* All notification routes require authentication */
router.use(auth);

/**
 * GET /api/notifications
 * Query params: page (1), limit, onlyUnread, includeDismissed
 * Returns paginated notifications and unreadCount
 */
router.get("/", controller.list);

/**
 * GET /api/notifications/unread-count
 * Returns { unreadCount }
 */
router.get("/unread-count", controller.unreadCount);

/**
 * POST /api/notifications/mark-all-read
 * Marks all user's notifications as read
 */
router.post("/mark-all-read", controller.markAllRead);

/**
 * POST /api/notifications/:id/mark-read
 * Mark a single notification as read
 */
router.post("/:id/mark-read", validateObjectIdParam, controller.markRead);

/**
 * DELETE /api/notifications/:id
 * Delete a single notification for the user
 */
router.delete("/:id", validateObjectIdParam, controller.delete);

module.exports = router;
