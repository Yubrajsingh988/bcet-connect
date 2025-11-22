// backend/src/services/notification.service.js
const ioManager = require("../sockets/ioManager");
const Notification = (() => {
  try {
    return require("../modules/notifications/notification.model");
  } catch (e) {
    return null;
  }
})();

/**
 * Push a notification:
 * { userId, title, message, type, data }
 * - stores in DB (optional) and emits via socket if connected
 */
exports.push = async ({ userId, title, message, type = "generic", data = {} }) => {
  try {
    if (Notification) {
      await Notification.create({
        user: userId,
        title,
        message,
        type,
        data,
      });
    }
  } catch (err) {
    // don't fail the main flow for notification save error
    console.error("Notification save failed:", err.message || err);
  }

  try {
    const io = ioManager.io;
    if (io) {
      io.to(`user:${userId}`).emit("notification:receive", {
        title,
        message,
        type,
        data,
        createdAt: new Date(),
      });
    }
  } catch (err) {
    // silent failocks
    console.error("Notification emit failed:", err.message || err);
  }
};
