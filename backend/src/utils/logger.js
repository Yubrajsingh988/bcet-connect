// backend/src/utils/logger.js

module.exports = {
  info(message, data = null) {
    console.log(`ℹ INFO: ${message}`, data || "");
  },

  success(message, data = null) {
    console.log(`🟢 SUCCESS: ${message}`, data || "");
  },

  error(message, data = null) {
    console.error(`❌ ERROR: ${message}`, data || "");
  },

  warn(message, data = null) {
    console.warn(`⚠ WARNING: ${message}`, data || "");
  },

  debug(message, data = null) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`🐛 DEBUG: ${message}`, data || "");
    }
  },
};
