const userService = require("./user.service");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const { deleteByPublicId } = require("../../utils/cloudinary.helper");

/* ──────────────────────────────────────────────
   AUTH GUARD (single responsibility)
─────────────────────────────────────────────── */
const requireAuth = (req) => {
  if (!req.user || !req.user.id) {
    throw new ApiError(401, "Not authenticated");
  }
  return req.user.id;
};

/* ──────────────────────────────────────────────
   GET MY PROFILE
   - Returns FULL profile
   - Includes virtuals (profileCompleteness)
   - Single source of truth for frontend
─────────────────────────────────────────────── */
exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = requireAuth(req);

    const user = await userService.getProfileById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // IMPORTANT: userService already returns lean + virtuals
    return ApiResponse.success(
      res,
      200,
      "Profile fetched successfully",
      user
    );
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────
   UPDATE MY PROFILE
   - Handles bio, headline, skills, education,
     experience, social, batch, department
   - Partial updates allowed
   - Validation handled in service
─────────────────────────────────────────────── */
exports.updateMyProfile = async (req, res, next) => {
  try {
    const userId = requireAuth(req);
    const payload = req.body || {};

    const updated = await userService.updateProfile(userId, payload);

    return ApiResponse.success(
      res,
      200,
      "Profile updated successfully",
      updated
    );
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────
   GET PUBLIC PROFILE
   - Read-only
   - Limited projection (no private data)
─────────────────────────────────────────────── */
exports.getPublicProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, "User id is required");
    }

    const user = await userService.getPublicProfile(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return ApiResponse.success(
      res,
      200,
      "Public profile fetched successfully",
      user
    );
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────
   UPLOAD AVATAR
   - Cloudinary
   - Deletes old avatar safely
   - Updates profile + recalculates completeness
─────────────────────────────────────────────── */
exports.uploadAvatar = async (req, res, next) => {
  try {
    const userId = requireAuth(req);

    if (!req.file?.cloudinary?.url) {
      throw new ApiError(400, "Avatar upload failed");
    }

    const { url, public_id } = req.file.cloudinary;

    // cleanup old avatar (best-effort)
    try {
      const current = await userService.getProfileById(userId);
      if (
        current?.avatarPublicId &&
        current.avatarPublicId !== public_id
      ) {
        deleteByPublicId(current.avatarPublicId).catch(() => {});
      }
    } catch (_) {}

    const updated = await userService.updateProfile(userId, {
      avatar: url,
      avatarPublicId: public_id,
    });

    return ApiResponse.success(
      res,
      200,
      "Avatar updated successfully",
      updated
    );
  } catch (err) {
    next(err);
  }
};

/* ──────────────────────────────────────────────
   UPLOAD RESUME
   - PDF / DOC
   - Updates profile + completeness
─────────────────────────────────────────────── */
exports.uploadResume = async (req, res, next) => {
  try {
    const userId = requireAuth(req);

    if (!req.file?.cloudinary?.url) {
      throw new ApiError(400, "Resume upload failed");
    }

    const { url, public_id } = req.file.cloudinary;

    const updated = await userService.updateProfile(userId, {
      resume: url,
      resumePublicId: public_id,
    });

    return ApiResponse.success(
      res,
      200,
      "Resume uploaded successfully",
      updated
    );
  } catch (err) {
    next(err);
  }
};
