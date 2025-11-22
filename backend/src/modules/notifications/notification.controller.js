// backend/src/modules/notifications/notification.controller.js
const service = require("./notification.service");
const ApiError = require("../../utils/ApiError");

/**
 * Helper to read authenticated user id from req.user
 */
function getUserId(req) {
  return (req.user && (req.user.id || req.user._id)) ? String(req.user.id || req.user._id) : null;
}

/**
 * GET /api/notifications
 * Query params:
 *  - page (1-based)
 *  - limit
 *  - onlyUnread (boolean)
 *  - includeDismissed (boolean)
 */
exports.list = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return next(new ApiError(401, "Unauthorized"));

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    let limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    if (isNaN(limit) || limit <= 0) limit = 20;

    const onlyUnread = req.query.onlyUnread === "true" || req.query.onlyUnread === "1";
    const includeDismissed = req.query.includeDismissed === "true" || req.query.includeDismissed === "1";

    const data = await service.getListForUser(userId, {
      page,
      limit,
      onlyUnread,
      includeDismissed,
    });

    // normalize response shape
    res.json({
      success: true,
      data: {
        items: data.items || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || limit,
        unreadCount: data.unreadCount != null ? data.unreadCount : await service.getUnreadCount(userId),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns: { success: true, data: { unreadCount: number } }
 */
exports.unreadCount = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return next(new ApiError(401, "Unauthorized"));

    const count = await service.getUnreadCount(userId);
    res.json({ success: true, data: { unreadCount: Number(count) } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications/read/:id
 * Mark a single notification as read
 */
exports.markRead = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const notifId = req.params.id;
    if (!userId) return next(new ApiError(401, "Unauthorized"));
    if (!notifId) return next(new ApiError(400, "Notification id required"));

    const updated = await service.markAsRead(userId, notifId);
    if (!updated) return next(new ApiError(404, "Notification not found"));

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/notifications/read-all
 * Marks all unread notifications as read for the authenticated user
 */
exports.markAllRead = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    if (!userId) return next(new ApiError(401, "Unauthorized"));

    const result = await service.markAllRead(userId);
    // result may be a write result object
    const modified = result?.nModified ?? result?.modifiedCount ?? null;

    res.json({
      success: true,
      message: "All notifications marked read",
      data: { modified: modified ?? "unknown" },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/notifications/:id
 * Delete a notification for the authenticated user
 */
exports.delete = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const notifId = req.params.id;
    if (!userId) return next(new ApiError(401, "Unauthorized"));
    if (!notifId) return next(new ApiError(400, "Notification id required"));

    const deleted = await service.deleteNotification(userId, notifId);
    if (!deleted) return next(new ApiError(404, "Notification not found"));

    res.json({ success: true, message: "Notification deleted", data: deleted });
  } catch (err) {
    next(err);
  }
};
