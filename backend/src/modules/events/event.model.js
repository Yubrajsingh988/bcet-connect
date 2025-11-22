// backend/src/modules/events/event.model.js
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      minlength: 20,
    },

    // ✅ Store as real Date (date + time combined from frontend)
    date: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    banner: {
      type: String,
      default: null,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 👥 Registered users
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔢 Optional capacity
    capacity: {
      type: Number,
      default: 200,
    },

    // ⏰ Optional registration deadline
    registrationDeadline: {
      type: Date,
    },

    // ✅ Needs approval from admin
    approved: {
      type: Boolean,
      default: false,
    },

    // 🧹 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔥 Virtual: number of registrations
eventSchema.virtual("registrationsCount").get(function () {
  return this.registeredUsers.length;
});

// 🔥 Useful indexes for dashboard filters
eventSchema.index({ category: 1, date: 1, approved: 1, isDeleted: 1 });

// 🔥 Auto-disable old events if registrationDeadline passed
eventSchema.pre("save", function (next) {
  if (this.registrationDeadline && new Date() > this.registrationDeadline) {
    // optional: auto mark as not approved
    this.approved = false;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
