// backend/src/modules/feed/feed.controller.js

const feedService = require("./feed.service");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");

/* ──────────────────────────────────────────────
   CREATE POST
─────────────────────────────────────────────── */
exports.createPost = catchAsync(async (req, res) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }

  // ✅ media already normalized by uploadMiddleware
  const media = Array.isArray(req.files)
    ? req.files.map((m) => ({
        type: m.resourceType === "video" ? "video" : "image",
        url: m.url,
        publicId: m.publicId,
        resourceType: m.resourceType,
      }))
    : [];

  const payload = {
    text: req.body.text?.trim() || "",
    media,
    type: req.body.type || "USER",
    visibility: req.body.visibility || "FOLLOWERS",
    community: req.body.community || null,
    refId: req.body.refId || null,
  };

  if (!payload.text && media.length === 0) {
    throw new ApiError(400, "Post must contain text or media");
  }

  const post = await feedService.createPost(req.user.id, payload);

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});

/* ──────────────────────────────────────────────
   GET FEED
─────────────────────────────────────────────── */
exports.getFeed = catchAsync(async (req, res) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized");
  }

  const feed = await feedService.getPersonalizedFeed(
    req.user.id,
    {
      type: req.query.type || "ALL",
      limit: Number(req.query.limit) || 20,
    }
  );

  res.json({
    success: true,
    data: feed,
  });
});

/* ──────────────────────────────────────────────
   UPDATE POST
─────────────────────────────────────────────── */
exports.updatePost = catchAsync(async (req, res) => {
  const updated = await feedService.updatePost({
    postId: req.params.id,
    userId: req.user.id,
    patch: {
      text: req.body.text?.trim(),
      visibility: req.body.visibility,
    },
  });

  if (!updated) {
    throw new ApiError(403, "Not allowed to update this post");
  }

  res.json({
    success: true,
    message: "Post updated",
    data: updated,
  });
});

/* ──────────────────────────────────────────────
   DELETE POST
─────────────────────────────────────────────── */
exports.deletePost = catchAsync(async (req, res) => {
  const isAdmin = req.user.role === "admin";

  const deleted = await feedService.deletePost({
    postId: req.params.id,
    userId: req.user.id,
    isAdmin,
  });

  if (!deleted) {
    throw new ApiError(403, "Not allowed to delete this post");
  }

  res.json({
    success: true,
    message: "Post deleted successfully",
  });
});

/* ──────────────────────────────────────────────
   LIKE / UNLIKE
─────────────────────────────────────────────── */
exports.toggleLike = catchAsync(async (req, res) => {
  const likesCount = await feedService.toggleLike(
    req.params.id,
    req.user.id
  );

  res.json({
    success: true,
    data: { likesCount },
  });
});

/* ──────────────────────────────────────────────
   ADD COMMENT
─────────────────────────────────────────────── */
exports.addComment = catchAsync(async (req, res) => {
  const updatedPost = await feedService.addComment(
    req.params.id,
    req.user.id,
    req.body.text
  );

  res.status(201).json({
    success: true,
    data: updatedPost,
  });
});
