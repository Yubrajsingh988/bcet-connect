// backend/src/modules/events/event.model.js
const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      trim: true,
    },

    // date & time of the event (store as real Date)
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },

    // event location (string, can be "Online - Zoom" etc.)
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // banner image URL (Cloudinary / CDN)
    banner: {
      type: String,
      default: null,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "tech",
        "non-tech",
        "sports",
        "cultural",
        "community",
        "general",
        "workshop",
        "seminar",
        "placement",
      ],
      default: "general",
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    // registered user ids
    registeredUsers: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    // Optional max capacity (number of registrations allowed)
    capacity: {
      type: Number,
      default: 200,
      min: [1, "Capacity must be at least 1"],
    },

    // Optional registration deadline (after which register not allowed)
    registrationDeadline: {
      type: Date,
    },

    // Admin approval required before showing publicly
    approved: {
      type: Boolean,
      default: false,
    },

    // Soft delete flag
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // When event was cancelled (soft-cancel)
    cancelledAt: {
      type: Date,
      default: null,
    },

    // Optional metadata object for extensibility (links, host info, fees etc.)
    meta: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -----------------------
   VIRTUALS
   ----------------------- */

// number of registrations
eventSchema.virtual("registrationsCount").get(function () {
  return Array.isArray(this.registeredUsers) ? this.registeredUsers.length : 0;
});

// friendly isUpcoming flag
eventSchema.virtual("isUpcoming").get(function () {
  return this.date ? new Date(this.date) >= new Date() : false;
});

/* -----------------------
   INDEXES
   ----------------------- */

// Useful indexes for filters + fast lookups
eventSchema.index({ category: 1, date: 1, approved: 1, isDeleted: 1 });
// text index for search on title/description/location
eventSchema.index(
  { title: "text", description: "text", location: "text" },
  { name: "event_text_index", weights: { title: 5, description: 2, location: 1 } }
);

/* -----------------------
   PRE / POST HOOKS
   ----------------------- */

// Normalize some fields before save
eventSchema.pre("save", function (next) {
  if (this.title) this.title = String(this.title).trim();
  if (this.location) this.location = String(this.location).trim();
  if (this.banner) this.banner = String(this.banner).trim();

  // If registrationDeadline is in the past, optionally mark approved false (business rule)
  // (Service layer will still control approval.)
  if (this.registrationDeadline && new Date() > new Date(this.registrationDeadline)) {
    // don't auto-change approved blindly — keep but we do not auto-approve
    // this.approved = false;
  }
  next();
});

/* -----------------------
   INSTANCE METHODS
   ----------------------- */

/**
 * Check if event reached capacity
 * @returns {Boolean}
 */
eventSchema.methods.isFull = function () {
  if (typeof this.capacity !== "number") return false;
  return this.registeredUsers && this.registeredUsers.length >= this.capacity;
};

/**
 * Check if a user can register now
 * - not deleted
 * - approved
 * - not cancelled
 * - not full
 * - before registrationDeadline (if set)
 */
eventSchema.methods.canRegister = function () {
  if (this.isDeleted) return false;
  if (!this.approved) return false;
  if (this.cancelledAt) return false;
  if (this.isFull()) return false;
  if (this.registrationDeadline && new Date() > new Date(this.registrationDeadline)) return false;
  return true;
};

/* -----------------------
   STATIC HELPERS
   ----------------------- */

/**
 * Simple search helper using text index
 * @param {String} q - query string
 * @param {Object} opts - { limit, skip, onlyApproved }
 */
eventSchema.statics.search = function (q = "", opts = {}) {
  const query = { isDeleted: false };
  if (opts.onlyApproved !== false) query.approved = true;
  if (q && q.trim().length > 0) {
    return this.find({ $text: { $search: q }, ...query })
      .select({ score: { $meta: "textScore" }, title: 1, date: 1, location: 1, banner: 1 })
      .sort({ score: { $meta: "textScore" }, date: 1 })
      .skip(opts.skip || 0)
      .limit(opts.limit || 20);
  }
  // fallback: return upcoming events if no query
  const now = new Date();
  query.date = { $gte: now };
  return this.find(query).sort({ date: 1 }).limit(opts.limit || 20);
};

/* -----------------------
   TO JSON TRANSFORM
   ----------------------- */

// hide internal fields from API output and convert _id to id
function transform(doc, ret) {
  ret.id = ret._id;
  delete ret._id;
  delete ret.__v;
  // keep cancelledAt null as-is
  return ret;
}

if (!eventSchema.options.toJSON.transform) {
  eventSchema.options.toJSON.transform = transform;
}
if (!eventSchema.options.toObject.transform) {
  eventSchema.options.toObject.transform = transform;
}

/* -----------------------
   EXPORT
   ----------------------- */

module.exports = model("Event", eventSchema);
