const mongoose = require("mongoose");

/* ──────────────────────────────────────────────
   MEDIA (Image / Video)
─────────────────────────────────────────────── */
const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: String, // cloudinary public id
  },
  { _id: false }
);

/* ──────────────────────────────────────────────
   COMMENTS
─────────────────────────────────────────────── */
const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ──────────────────────────────────────────────
   FEED ITEM (MASTER)
─────────────────────────────────────────────── */
const feedSchema = new mongoose.Schema(
  {
    /* ───── Core identity ───── */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        "USER",       // normal user post
        "COMMUNITY",  // community post
        "MENTOR",     // mentor post
        "ADMIN",      // admin announcement
        "JOB_CARD",   // job teaser
        "EVENT_CARD", // event teaser
        "AI_BLOCK",   // future AI injection
      ],
      default: "USER",
      index: true,
    },

    /* ───── Content ───── */
    text: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    media: {
      type: [mediaSchema],
      default: [],
    },

    /* ───── Context linking ───── */
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
      index: true,
    },

    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // jobId / eventId etc
    },

    /* ───── Visibility ───── */
    visibility: {
      type: String,
      enum: ["FOLLOWERS", "COMMUNITY", "PUBLIC"],
      default: "FOLLOWERS",
      index: true,
    },

    /* ───── Engagement ───── */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: {
      type: [commentSchema],
      default: [],
    },

    /* ───── Moderation ───── */
    isPinned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ──────────────────────────────────────────────
   INDEXES (VERY IMPORTANT FOR FEED)
─────────────────────────────────────────────── */
feedSchema.index({ createdAt: -1 });
feedSchema.index({ author: 1, createdAt: -1 });
feedSchema.index({ type: 1, createdAt: -1 });
feedSchema.index({ community: 1, createdAt: -1 });

module.exports = mongoose.model("Feed", feedSchema);
