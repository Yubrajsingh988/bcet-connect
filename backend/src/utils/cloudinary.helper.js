// backend/src/utils/cloudinary.helper.js

const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/* ──────────────────────────────────────────────
   UPLOAD BUFFER TO CLOUDINARY (PRODUCTION SAFE)
─────────────────────────────────────────────── */
function uploadBufferToCloudinary(buffer, opts = {}) {
  return new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("No buffer provided"));
    }

    const uploadOptions = {
      folder: opts.folder || "bcet",

      // 🔥 IMPORTANT DEFAULT
      resource_type: opts.resource_type || "image",

      // 🔥 REQUIRED FOR VIDEO STREAMING
      chunk_size: 6 * 1024 * 1024, // 6MB chunks

      // allow future transforms
      transformation: opts.transformation || undefined,

      // passthrough
      ...opts.extraOptions,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/* ──────────────────────────────────────────────
   DELETE BY PUBLIC ID (IMAGE / VIDEO SAFE)
─────────────────────────────────────────────── */
function deleteByPublicId(publicId, opts = {}) {
  if (!publicId) return Promise.resolve(null);

  return cloudinary.uploader.destroy(publicId, {
    resource_type: opts.resource_type || "image",
  });
}

module.exports = {
  uploadBufferToCloudinary,
  deleteByPublicId,
};
