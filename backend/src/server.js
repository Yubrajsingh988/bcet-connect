// backend/src/server.js
const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { PORT, REDIS_URL } = require("./config/env");
const ioManager = require("../sockets/ioManager"); // keep same relative path as your project
const path = require("path");

// connect DB first
connectDB();

// create http server from express app
const server = http.createServer(app);

const { Server } = require("socket.io");
const { createAdapter } = (() => {
  try {
    // require optional redis adapter only if redis url present
    return require("@socket.io/redis-adapter");
  } catch (e) {
    return {};
  }
})();

// parse allowed origins: support comma-separated CLIENT_URL env or fallback
const rawOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
const allowedOrigins = rawOrigins.map((o) => o && o.trim()).filter(Boolean);

// socket.io options
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // allow non-browser (curl, mobile) which send no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // allow exact match of single origin too
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6, // 1MB default; increase if you send bigger payloads via sockets
});

// init io manager
if (ioManager && typeof ioManager.init === "function") {
  ioManager.init(io);
} else if (ioManager && ioManager.init === undefined && typeof ioManager === "function") {
  // fallback if ioManager exported differently
  ioManager(io);
}

// OPTIONAL: configure Redis adapter for horizontal scaling (if REDIS_URL provided)
(async () => {
  try {
    if (REDIS_URL && createAdapter && typeof createAdapter === "function") {
      const { createClient } = require("redis");
      const pubClient = createClient({ url: REDIS_URL });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter.createAdapter(pubClient, subClient));
      console.log("✅ Socket.IO Redis adapter enabled");
    } else if (REDIS_URL) {
      console.warn(
        "⚠️ REDIS_URL provided but @socket.io/redis-adapter not installed. Install @socket.io/redis-adapter and redis to enable scaling."
      );
    }
  } catch (err) {
    console.error("Redis adapter init failed:", err.message || err);
  }
})();

// Load socket modules (if they exist). Keep require guarded so missing files don't crash startup.
try {
  // notifications.socket expected at backend/sockets/notifications.socket.js (your project used this)
  require("../sockets/notifications.socket")(io);
  console.log("✅ notifications.socket loaded");
} catch (e) {
  // not fatal; log for debugging
  console.log("ℹ️ notifications.socket not loaded (file may be missing)");
}

try {
  // chat.socket if present
  require("../sockets/chat.socket")(io);
  console.log("✅ chat.socket loaded");
} catch (e) {
  console.log("ℹ️ chat.socket not loaded (file may be missing)");
}

// start server
server.listen(PORT || 5000, () => {
  console.log(`🚀 Server running http://localhost:${PORT || 5000}`);
});

// graceful shutdown handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.stack || err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  // optionally close server then exit
});
process.on("SIGTERM", () => {
  console.info("SIGTERM received: closing HTTP server");
  server.close(() => {
    console.info("HTTP server closed");
    process.exit(0);
  });
});
