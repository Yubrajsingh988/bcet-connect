// backend/src/sockets/notifications.socket.js
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const notificationService = require("../modules/notifications/notification.service");
const { Types: { ObjectId } } = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET || process.env.APP_JWT_SECRET || "change-me";

let ioRef = null;
function getTokenFromHandshake(handshake) {
  if (!handshake) return null;
  // Preferred: socket.handshake.auth.token (used by modern socket.io clients)
  if (handshake.auth && handshake.auth.token) return handshake.auth.token;
  // Fallback: query param token (e.g. io("...", { query: { token } }))
  if (handshake.query && handshake.query.token) return handshake.query.token;
  // fallback header is not available in socket handshake reliably
  return null;
}
function initNotificationsSocket(io) {
  if (!io) throw new Error("Socket.io instance required");

  ioRef = io;

  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = getTokenFromHandshake(socket.handshake);
      if (!token) {
        // If you want to allow anonymous sockets, call next(); but for notifications we require auth
        return next(new Error("Authentication token required"));
      }

      // Verify JWT
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        return next(new Error("Invalid authentication token"));
      }

      // Minimal payload check
      if (!payload || !payload.id && !payload._id) {
        return next(new Error("Invalid token payload"));
      }

      const userId = payload.id || payload._id;

      // Ensure ObjectId-like string
      if (!ObjectId.isValid(userId)) {
        return next(new Error("Invalid user id in token"));
      }

      // Load a little user info (optional — adjust projections as needed)
      const user = await User.findById(userId).select("_id name email role avatar").lean();
      if (!user) return next(new Error("User not found"));

      // Attach user to socket for later handlers
      socket.user = {
        id: String(user._id),
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      };

      // Join user-specific room. Use a stable room name across codebase.
      socket.join(`user:${socket.user.id}`);

      // (Optional) Join extra rooms for role-based broadcasting
      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
      }

      return next();
    } catch (err) {
      console.error("Socket auth error:", err);
      return next(new Error("Socket authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    try {
      const uid = socket.user?.id ?? "unknown";
      console.log(`Socket connected: id=${socket.id} user=${uid}`);

      // Inform client of successful connection (optional)
      socket.emit("notifications:connected", { ok: true, userId: uid });

      /**
       * Client asks server to mark a single notification as read.
       * payload: { id: "<notificationId>" }
       * callback (optional) receives { success: true/false, data/error }
       */
      socket.on("notifications:mark-read", async (payload = {}, cb) => {
        const cbSafe = typeof cb === "function" ? cb : () => {};
        try {
          const id = payload.id || payload.notificationId;
          if (!id || !ObjectId.isValid(id)) return cbSafe({ success: false, error: "invalid id" });

          const updated = await notificationService.markAsRead(socket.user.id, id);
          cbSafe({ success: true, data: updated });
        } catch (err) {
          console.error("notifications:mark-read error:", err);
          cbSafe({ success: false, error: err.message || "server error" });
        }
      });

      socket.on("notifications:mark-all-read", async (_payload, cb) => {
        const cbSafe = typeof cb === "function" ? cb : () => {};
        try {
          await notificationService.markAllRead(socket.user.id);
          cbSafe({ success: true });
        } catch (err) {
          console.error("notifications:mark-all-read error:", err);
          cbSafe({ success: false, error: err.message || "server error" });
        }
      });

      socket.on("notifications:subscribe", (payload = {}, cb) => {
        const cbSafe = typeof cb === "function" ? cb : () => {};
        try {
          const { channels } = payload;
          if (!Array.isArray(channels)) return cbSafe({ success: false, error: "channels required" });
          channels.forEach((ch) => {
            if (typeof ch === "string" && ch.trim()) socket.join(`topic:${ch.trim()}`);
          });
          cbSafe({ success: true });
        } catch (err) {
          console.error("notifications:subscribe error:", err);
          cbSafe({ success: false, error: err.message || "server error" });
        }
      });

      // Disconnect cleanup
      socket.on("disconnect", (reason) => {
        console.log(`Socket disconnected: id=${socket.id} user=${uid} reason=${reason}`);
        // No explicit leave needed — socket.io handles room cleanup for this socket automatically
      });
    } catch (err) {
      console.error("Error in connection handler:", err);
    }
  }); // io.on('connection')
}

function emitToUser(userId, payload) {
  if (!ioRef) {
    console.warn("emitToUser called before io initialized");
    return false;
  }
  if (!userId) {
    console.warn("emitToUser missing userId");
    return false;
  }
  try {
    ioRef.to(`user:${String(userId)}`).emit("notification:receive", payload);
    return true;
  } catch (err) {
    console.error("emitToUser error:", err);
    return false;
  }
}

function emitToRole(role, payload) {
  if (!ioRef) return false;
  try {
    ioRef.to(`role:${role}`).emit("notification:receive", payload);
    return true;
  } catch (err) {
    console.error("emitToRole error:", err);
    return false;
  }
}

module.exports = {
  initNotificationsSocket,
  emitToUser,
  emitToRole
};
