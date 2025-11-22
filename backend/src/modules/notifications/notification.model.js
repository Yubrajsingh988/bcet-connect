// backend/src/modules/notifications/notification.model.js
const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "job",
  "event",
  "community",
  "chat",
  "donation",
  "admin",
  "ai",
  "system",
  "generic",
];

const NOTIFICATION_PRIORITIES = ["low", "normal", "high"];

const notificationSchema = new mongoose.Schema(
  {
    // recipient user (required)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // actor who triggered the notification (optional)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // notification type (helps UI grouping & icons)
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      default: "generic",
      required: true,
      index: true,
    },

    // short title shown in the list (required)
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // longer message/description (optional)
    message: {
      type: String,
      default: "",
      trim: true,
    },

    // optional frontend route / absolute url to open when notification clicked
    redirectUrl: {
      type: String,
      default: null,
      trim: true,
    },

    // arbitrary structured payload (e.g. { jobId, eventId, communityId })
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // read state + timestamp
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // soft-dismiss flag (if user dismissed the notification from UI)
    dismissed: {
      type: Boolean,
      default: false,
      index: true,
    },

    // optional priority for ordering / badges
    priority: {
      type: String,
      enum: NOTIFICATION_PRIORITIES,
      default: "normal",
      index: true,
    },

    // archived (server-side archiving/cleanup)
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true, versionKey: false, transform: docToJSON },
    toObject: { virtuals: true, versionKey: false, transform: docToJSON },
  }
);

/**
 * Transform function for toJSON/toObject
 * - expose `id` instead of `_id`
 * - remove internal fields that frontend doesn't need
 */
function docToJSON(doc, ret) {
  // Remove internal fields
  ret.id = ret._id?.toString?.() ?? ret._id;
  delete ret._id;
  // remove __v already handled by versionKey:false
  // optionally hide archived/dismissed for frontend list (keep them for admin APIs)
  return ret;
}

/**
 * Compound index helpful for fast unread count and ordering
 * Query patterns:
 *  - unread count: { user, isRead: false, dismissed: false }
 *  - list newest: { user, dismissed: false } sort createdAt desc
 */
notificationSchema.index({ user: 1, isRead: 1, dismissed: 1, createdAt: -1 });

/**
 * Static helpers to use from service layer (small convenience)
 * Prefer implementing business logic in service.file, but these are useful shortcuts.
 */
notificationSchema.statics.markAsRead = async function (userId, notificationId) {
  return this.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  ).lean();
};

notificationSchema.statics.markAllRead = async function (userId) {
  const res = await this.updateMany(
    { user: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
  return res;
};

/**
 * Optional: instance method to push minimal payload for sockets
 * Use NotificationService.create() to push via ioManager instead of calling this directly.
 */
notificationSchema.methods.toSocketPayload = function () {
  return {
    id: this._id.toString(),
    user: this.user,
    actor: this.actor,
    type: this.type,
    title: this.title,
    message: this.message,
    redirectUrl: this.redirectUrl,
    data: this.data,
    isRead: this.isRead,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);
