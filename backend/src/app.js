// backend/src/app.js
/**
 * Upgraded app.js for BCET-Connect
 * - Uses safe in-place sanitization (no reassignments of req.query/req.body)
 * - Strong CORS handling (supports comma-separated CLIENT_URL)
 * - Global rate-limiter (light)
 * - JSON + urlencoded parsers for uploads/forms
 * - Helmet for security headers
 * - Centralized 404 + error handler
 *
 * NOTE:
 * - Ensure ./middleware/sanitizeInputs.js exists (mutating sanitizer).
 * - If you previously used express-mongo-sanitize, remove its app.use line
 *   or uninstall the package: `npm uninstall express-mongo-sanitize`
 */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const { generalLimiter } = require("./middleware/rateLimiter");
const sanitizeInputs = require("./middleware/sanitizeInputs"); // safe in-place sanitizer
const ApiError = require("./utils/ApiError");
const logger = require("./utils/logger"); // optional, use your logger impl
const { PORT } = require("./config/env");

const app = express();

/* ---------------------------- Security headers --------------------------- */
app.use(helmet());

/* --------------------------------- CORS --------------------------------- */
/**
 * Accepts comma-separated CLIENT_URL in .env; fallback to localhost:5173.
 * Allows no-origin requests (curl/mobile/native apps).
 */
const CLIENT_URLS = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);

      // allow if origin is in allowed list
      if (CLIENT_URLS.includes(origin)) return callback(null, true);

      // deny otherwise
      return callback(new Error("CORS policy: This origin is not allowed"));
    },
    credentials: true,
  })
);

/* -------------------------- Global rate limiter ------------------------- */
/* Keep near top to drop abusive requests early */
if (generalLimiter) {
  app.use(generalLimiter);
}

/* --------------------------- Request parsers ---------------------------- */
/* JSON and urlencoded BEFORE sanitizer so we mutate existing objects. */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ---------------------------- Input sanitizers -------------------------- */
/**
 * Use our safe in-place sanitizer to remove dangerous keys like:
 * - keys starting with '$' (Mongo operators)
 * - dotted keys containing '.'
 *
 * This MUTATES req.body/req.params/req.query and therefore avoids
 * reassigning getter-only properties (fixes your crash).
 */
app.use(sanitizeInputs);

/* ------------------------------ Logging --------------------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ------------------------------- Health --------------------------------- */
app.get("/", (req, res) => {
  res.send(`BCET CONNECT API running on port ${PORT || process.env.PORT || 5000}`);
});

/* ------------------------------- Routes --------------------------------- */
/**
 * IMPORTANT:
 * - Use one canonical mount in production. I recommend /api (keeps backward-compat).
 * - If you want /api/v1 later, add versioned routes in routes/index or create separate router.
 */
app.use("/api", routes);

/* ------------------------------ 404 handler ----------------------------- */
/* Use ApiError so errorHandler can render consistent responses */
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found → ${req.originalUrl}`));
});

/* --------------------------- Global error handler ----------------------- */
app.use((err, req, res, next) => {
  // Optional: debug log for developer
  if (process.env.NODE_ENV !== "production") {
    logger?.error?.("Unhandled error", err);
  } else {
    logger?.error?.(err.message || "Server error");
  }
  return errorHandler(err, req, res, next);
});

module.exports = app;
