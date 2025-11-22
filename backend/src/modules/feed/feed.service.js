const mongoose = require("mongoose");
const Feed = require("./feed.model");
const User = require("../user/user.model");
const ApiError = require("../../utils/ApiError");
const {
  deleteCloudinaryFiles,
} = require("../../middleware/uploadMiddleware");

/* ──────────────────────────────────────────────
   HELPERS
─────────────────────────────────────────────── */

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

/* ──────────────────────────────────────────────
   CREATE POST
─────────────────────────────────────────────── */

exports.createPost = async (userId, data = {}) => {
  if (!isValidId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const post = await Feed.create({
    author: userId,
    type: data.type || "USER",
    text: data.text?.trim() || "",
    media: Array.isArray(data.media) ? data.media : [],
    community: data.community || null,
    refId: data.refId || null,
    visibility: data.visibility || "FOLLOWERS",
  });

  return post.populate("author", "name avatar role");
};

/* ──────────────────────────────────────────────
   GET PERSONALIZED FEED (PRODUCTION SAFE)
─────────────────────────────────────────────── */

exports.getPersonalizedFeed = async (
  userId,
  { type = "ALL", limit = 20, page = 1 } = {}
) => {
  if (!isValidId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId).select(
    "following communities role"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const followingIds = user.following || [];
  const communityIds = user.communities || [];

  /**
   * 🔥 VISIBILITY RULES (CRITICAL)
   * - Own posts ALWAYS visible
   * - Admin ALWAYS visible
   * - Respect visibility flags
   */
  const visibilityQuery = {
    isDeleted: false,
    $or: [
      { author: userId }, // ✅ own posts

      {
        author: { $in: followingIds },
        visibility: "FOLLOWERS",
      },

      {
        community: { $in: communityIds },
        visibility: "COMMUNITY",
      },

      { visibility: "PUBLIC" },

      { type: "ADMIN" },
    ],
  };

  /**
   * 🎯 TYPE FILTER
   * IMPORTANT: Never hide own posts
   */
  if (type !== "ALL") {
    visibilityQuery.$and = [
      {
        $or: [{ type }, { author: userId }],
      },
    ];
  }

  const skip = (page - 1) * limit;

  const feed = await Feed.find(visibilityQuery)
    .populate("author", "name avatar role")
    .populate("community", "name")
    .populate("comments.author", "name avatar")
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  /* ───── AI BLOCK (SAFE PLACEHOLDER) ───── */
  if (
    process.env.FEATURE_AI_FEED === "true" &&
    page === 1
  ) {
    feed.unshift({
      _id: "ai-block",
      type: "AI_BLOCK",
      text: "AI recommendations coming soon 🚀",
      createdAt: new Date(),
    });
  }

  return feed;
};

/* ──────────────────────────────────────────────
   UPDATE POST
─────────────────────────────────────────────── */

exports.updatePost = async ({
  postId,
  userId,
  patch = {},
}) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new ApiError(400, "Invalid id");
  }

  const post = await Feed.findOne({
    _id: postId,
    author: userId,
    isDeleted: false,
  });

  if (!post) return null;

  if (typeof patch.text === "string") {
    post.text = patch.text.trim();
  }

  if (patch.visibility) {
    post.visibility = patch.visibility;
  }

  await post.save();
  return post.populate("author", "name avatar role");
};

/* ──────────────────────────────────────────────
   DELETE POST (SOFT + CLOUDINARY CLEANUP)
─────────────────────────────────────────────── */

exports.deletePost = async ({ postId, userId, isAdmin }) => {
  if (!isValidId(postId)) {
    throw new ApiError(400, "Invalid post id");
  }

  const condition = isAdmin
    ? { _id: postId }
    : { _id: postId, author: userId };

  const post = await Feed.findOne(condition);
  if (!post) return null;

  /**
   * 🔥 Cloudinary cleanup (NON-BLOCKING)
   */
  if (Array.isArray(post.media) && post.media.length > 0) {
    deleteCloudinaryFiles(post.media).catch((err) =>
      console.error(
        "⚠ Cloudinary cleanup failed:",
        err.message
      )
    );
  }

  post.isDeleted = true;
  await post.save();

  return true;
};

/* ──────────────────────────────────────────────
   LIKE / UNLIKE
─────────────────────────────────────────────── */

exports.toggleLike = async (postId, userId) => {
  if (!isValidId(postId) || !isValidId(userId)) {
    throw new ApiError(400, "Invalid id");
  }

  const post = await Feed.findById(postId);
  if (!post || post.isDeleted) {
    throw new ApiError(404, "Post not found");
  }

  const index = post.likes.findIndex(
    (id) => id.toString() === userId
  );

  if (index === -1) post.likes.push(userId);
  else post.likes.splice(index, 1);

  await post.save();
  return post.likes.length;
};

/* ──────────────────────────────────────────────
   ADD COMMENT
─────────────────────────────────────────────── */

exports.addComment = async (postId, userId, text) => {
  if (!text?.trim()) {
    throw new ApiError(400, "Comment text required");
  }

  const post = await Feed.findById(postId);
  if (!post || post.isDeleted) {
    throw new ApiError(404, "Post not found");
  }

  post.comments.push({
    author: userId,
    text: text.trim(),
  });

  await post.save();

  return post.populate("comments.author", "name avatar");
};
