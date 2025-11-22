// backend/src/config/cloudinary.js
// Loads Cloudinary and config from env variables.
// Ensure these env vars are present in your .env:
// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

const cloudinary = require("cloudinary").v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  // Do NOT crash in every environment — but warn strongly
  // In production you should fail fast. Here we throw to make the problem obvious.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing Cloudinary env variables. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  } else {
    console.warn("⚠️ Cloudinary env vars missing — uploads will fail until configured.");
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
