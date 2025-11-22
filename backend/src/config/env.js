// backend/src/config/env.js
// Loads .env and validates required environment variables at startup.
// This ensures the app fails fast with a clear message if a required env is missing.

const dotenv = require("dotenv");
const path = require("path");

// Load .env from project root by default
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// List of required env variables for Phase-1
const REQUIRED_ENVS = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];

// Validate required envs
const missing = REQUIRED_ENVS.filter((k) => !process.env[k] || String(process.env[k]).trim() === "");

if (missing.length > 0) {
  // Fail fast with clear error
  throw new Error(
    `Missing required environment variable(s): ${missing.join(", ")}. Please set them in your .env or environment.`
  );
}

// Export configuration
module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SECRET: process.env.JWT_SECRET, // no fallback — required
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BCRYPT_SALT_ROUNDS: Number(process.env.BCRYPT_SALT_ROUNDS) || 10, // safe default for bcrypt rounds
  // Add other env exports here as needed (e.g. CLOUDINARY_URL, REDIS_URL, RAZORPAY keys)
};
