// backend/src/middleware/errorHandler.js
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

/**
 * Global error handler
 * - Handles ApiError instances (our expected errors)
 * - Formats Joi / Mongoose validation errors into readable messages
 * - Logs errors via utils/logger
 * - In non-production, returns stack + details for debugging
 */
module.exports = (err, req, res, next) => {
  try {
    // Normalize unknown thrown values
    if (!err) {
      logger.error("Unknown error passed to errorHandler");
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }

    // If Joi validation error not wrapped earlier, normalize it
    if (err.isJoi && Array.isArray(err.details)) {
      const joiMessage = err.details.map((d) => d.message).join(", ");
      logger.warn("Validation error (Joi)", { message: joiMessage, path: err.details.map(d => d.path) });
      return res.status(400).json({ success: false, message: joiMessage });
    }

    // Mongoose validation error (schema validation)
    if (err.name === "ValidationError" && err.errors) {
      const messages = Object.values(err.errors).map((e) => e.message);
      const message = messages.join(", ");
      logger.warn("Validation error (Mongoose)", { message });
      return res.status(400).json({ success: false, message });
    }

    // If it's our ApiError class, use its statusCode & message
    if (err instanceof ApiError || err.statusCode) {
      const statusCode = err.statusCode || 400;
      const message = err.message || "Request error";
      // Optional extra payload (e.g. validation details)
      const extra = err.details ? { details: err.details } : {};

      logger.warn(`ApiError: ${message}`, { statusCode, ...extra });

      return res.status(statusCode).json({
        success: false,
        message,
        ... (process.env.NODE_ENV !== "production" && err.stack ? { stack: err.stack } : {}),
        ...extra,
      });
    }

    // Unknown / unexpected error
    // Log full error (stack) for investigation
    logger.error("Unhandled error", err && err.stack ? err.stack : err);

    // In development expose stack and error message
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: err.stack,
      });
    }

    // Production: minimal leak of info
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } catch (handlerErr) {
    // If error handler itself fails — fallback safe response
    logger.error("Error in errorHandler", handlerErr);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
