/**
 * Notification Service — Phase 5 FINAL
 * -----------------------------------
 * Responsibilities:
 * - DB persistence
 * - Socket emission (real-time)
 * - Feed / social / system notifications
 * - Bulk + single helpers
 */

const Notification = require("./notification.model");
const ioManager = require("../../../sockets/ioManager");

/* ──────────────────────────────────────────────
   SOCKET ACCESS (SAFE)
─────────────────────────────────────────────── */
function getIO() {
  try {
    if (!ioManager) return null;
    if (typeof ioManager.getIO === "function") return ioManager.getIO();
    if (ioManager.io) return ioManager.io;
  } catch {
    return null;
  }
  return null;
}

/* ──────────────────────────────────────────────
   FORMATTER (API + SOCKET SAFE)
─────────────────────────────────────────────── */
function formatNotification(doc) {
  if (!doc) return null;
  const n = typeof doc.toObject === "function" ? doc.toObject() : doc;

  return {
    id: String(n._id),
    user: n.user,
    actor: n.actor || null,
    type: n.type || "SYSTEM",
    title: n.title || "",
    message: n.message || "",
    redirectUrl: n.redirectUrl || null,
    data: n.data || {},
    priority: n.priority || "normal",
    isRead: n.isRead === true,
    readAt: n.readAt || null,
    createdAt: n.createdAt,
  };
}

/* ──────────────────────────────────────────────
   CORE CREATOR
─────────────────────────────────────────────── */
exports.createNotification = async function (opts = {}) {
  const {
    userId,
    actorId = null,
    type = "SYSTEM",
    title = "",
    message = "",
    redirectUrl = null,
    data = {},
    priority = "normal",
  } = opts;

  if (!userId) {
    throw new Error("createNotification: userId is required");
  }

  const doc = await Notification.create({
    user: userId,
    actor: actorId || null,
    type,
    title,
    message,
    redirectUrl,
    data,
    priority,
  });

  // Emit realtime notification
  try {
    const io = getIO();
    if (io) {
      const payload = formatNotification(doc);
      io.to(`user:${String(userId)}`).emit("notification:new", payload);
    }
  } catch (err) {
    console.error("Notification socket emit failed:", err?.message);
  }

  return doc;
};

/* ──────────────────────────────────────────────
   FEED HELPERS (PHASE-5 IMPORTANT)
─────────────────────────────────────────────── */

// When someone you follow posts
exports.notifyNewPost = async ({ recipientId, actorId, postId }) =>
  exports.createNotification({
    userId: recipientId,
    actorId,
    type: "POST",
    title: "New post",
    message: "Someone you follow shared a new post",
    redirectUrl: `/feed/${postId}`,
  });

// Like notification
exports.notifyLike = async ({ recipientId, actorId, postId }) =>
  exports.createNotification({
    userId: recipientId,
    actorId,
    type: "LIKE",
    title: "New like",
    message: "Someone liked your post",
    redirectUrl: `/feed/${postId}`,
  });

// Comment notification
exports.notifyComment = async ({ recipientId, actorId, postId }) =>
  exports.createNotification({
    userId: recipientId,
    actorId,
    type: "COMMENT",
    title: "New comment",
    message: "Someone commented on your post",
    redirectUrl: `/feed/${postId}`,
  });

// Admin announcement
exports.notifyAdminAnnouncement = async ({ recipientId, title, message, redirectUrl }) =>
  exports.createNotification({
    userId: recipientId,
    type: "ADMIN",
    title,
    message,
    redirectUrl,
    priority: "high",
  });

/* ──────────────────────────────────────────────
   FETCHING
─────────────────────────────────────────────── */
exports.getListForUser = async function (
  userId,
  { page = 1, limit = 20, onlyUnread = false } = {}
) {
  if (!userId) throw new Error("getListForUser: userId required");

  const query = { user: userId, archived: { $ne: true } };
  if (onlyUnread) query.isRead = false;

  const skip = (page - 1) * limit;

  const [items, total, unreadCount] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("actor", "name avatar role")
      .lean(),
    Notification.countDocuments(query),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return { items, total, unreadCount, page, limit };
};

/* ──────────────────────────────────────────────
   READ / DELETE
─────────────────────────────────────────────── */
exports.markAsRead = async function (userId, notifId) {
  const doc = await Notification.findOneAndUpdate(
    { _id: notifId, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).lean();

  try {
    const io = getIO();
    if (io && doc) {
      io.to(`user:${String(userId)}`).emit("notification:read", { id: doc._id });
    }
  } catch {}

  return doc;
};

exports.markAllRead = async function (userId) {
  const res = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  try {
    const io = getIO();
    if (io) {
      io.to(`user:${String(userId)}`).emit("notification:allRead");
    }
  } catch {}

  return res;
};

exports.deleteNotification = async function (userId, notifId) {
  return Notification.findOneAndDelete({ _id: notifId, user: userId }).lean();
};

/* ──────────────────────────────────────────────
   HOUSEKEEPING
─────────────────────────────────────────────── */
exports.archiveNotifications = async function (userId, olderThan) {
  return Notification.updateMany(
    { user: userId, createdAt: { $lt: olderThan } },
    { archived: true }
  );
};
