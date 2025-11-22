// backend/src/middleware/uploadMiddleware.js

const multer = require("multer");
const ApiError = require("../utils/ApiError");
const {
  uploadBufferToCloudinary,
  deleteByPublicId,
} = require("../utils/cloudinary.helper");

/* ──────────────────────────────────────────────
   LIMITS
─────────────────────────────────────────────── */
const IMAGE_MAX_SIZE = 10 * 1024 * 1024;   // 10 MB
const VIDEO_MAX_SIZE = 100 * 1024 * 1024;  // 100 MB

/* ──────────────────────────────────────────────
   ALLOWED MIME TYPES
─────────────────────────────────────────────── */
const ALLOWED_MIME = [
  // images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",

  // videos
  "video/mp4",
  "video/webm",
  "video/quicktime",

  // documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/* ──────────────────────────────────────────────
   MULTER STORAGE
─────────────────────────────────────────────── */
const storage = multer.memoryStorage();

/* ──────────────────────────────────────────────
   FILE FILTER
─────────────────────────────────────────────── */
function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(
      new ApiError(400, `Unsupported file type: ${file.mimetype}`),
      false
    );
  }
  cb(null, true);
}

/* ──────────────────────────────────────────────
   BASE UPLOADER
─────────────────────────────────────────────── */
const baseUpload = multer({
  storage,
  fileFilter,
});

/* ──────────────────────────────────────────────
   NORMALIZER
─────────────────────────────────────────────── */
function normalizeCloudinary(result) {
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type, // image | video
    bytes: result.bytes,
    format: result.format,
    width: result.width,
    height: result.height,
  };
}

/* ──────────────────────────────────────────────
   SIZE VALIDATION
─────────────────────────────────────────────── */
function validateSize(file) {
  const isVideo = file.mimetype.startsWith("video");
  const max = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;

  if (file.size > max) {
    throw new ApiError(
      400,
      `${isVideo ? "Video" : "Image"} exceeds size limit`
    );
  }
}

/* ──────────────────────────────────────────────
   CLOUDINARY UPLOAD (🔥 FIXED)
─────────────────────────────────────────────── */
async function uploadFileToCloudinary(file, folder) {
  const isVideo = file.mimetype.startsWith("video");

  return uploadBufferToCloudinary(file.buffer, {
    folder,
    resource_type: isVideo ? "video" : "image", // ✅ FIX
  });
}

/* ──────────────────────────────────────────────
   SINGLE FILE (AVATAR / RESUME)
─────────────────────────────────────────────── */
function single(fieldName, folder = "bcet") {
  return [
    baseUpload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file) {
          throw new ApiError(400, `File '${fieldName}' is required`);
        }

        validateSize(req.file);

        const uploaded = await uploadFileToCloudinary(
          req.file,
          folder
        );

        req.file = normalizeCloudinary(uploaded);
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}

/* ──────────────────────────────────────────────
   MULTIPLE FILES (FEED / GALLERY)
─────────────────────────────────────────────── */
function array(fieldName, maxCount = 6, folder = "bcet") {
  return [
    baseUpload.array(fieldName, maxCount),
    async (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          req.files = [];
          return next();
        }

        const uploads = [];

        for (const file of req.files) {
          validateSize(file);

          const uploaded = await uploadFileToCloudinary(
            file,
            folder
          );

          uploads.push(normalizeCloudinary(uploaded));
        }

        req.files = uploads;
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
}

/* ──────────────────────────────────────────────
   CLOUDINARY DELETE (POST DELETE)
─────────────────────────────────────────────── */
async function deleteCloudinaryFiles(media = []) {
  if (!Array.isArray(media)) return;

  for (const m of media) {
    if (!m?.publicId) continue;

    try {
      await deleteByPublicId(m.publicId, {
        resource_type: m.resourceType || "image",
      });
    } catch (err) {
      console.error("❌ Cloudinary delete failed:", err.message);
    }
  }
}

/* ──────────────────────────────────────────────
   EXPORTS
─────────────────────────────────────────────── */
module.exports = {
  single,                // user avatar, etc
  array,                 // feed media
  deleteCloudinaryFiles, // post delete cleanup
};
