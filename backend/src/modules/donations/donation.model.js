// backend/src/modules/donations/donation.model.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const donationSchema = new Schema(
  {
    // 🔗 Alumni (required)
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Snapshot values (UI + receipts)
    donorName: { type: String, trim: true },
    donorEmail: { type: String, trim: true, lowercase: true },
    batchYear: { type: Number },

    // 💰 Amount
    amount: {
      type: Number,
      required: true,
      min: [1, "Donation must be at least ₹1"],
    },

    currency: {
      type: String,
      enum: ["INR", "USD", "EUR", "GBP"],
      default: "INR",
      uppercase: true,
    },

    // 🎯 Purpose
    purpose: {
      type: String,
      enum: ["general", "scholarship", "infrastructure", "event", "community"],
      required: true,
      default: "general",
    },

    // 🔀 Transaction ID (gateway / manual ref)
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    paymentProvider: {
      type: String,
      enum: ["manual", "razorpay", "upi", "bank_transfer", "stripe", "other"],
      default: "manual",
    },

    // 📦 Status
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      index: true,
    },

    // 👀 Flags
    isAnonymous: { type: Boolean, default: false },
    verifiedByAdmin: { type: Boolean, default: false },

    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    receiptUrl: { type: String, trim: true },

    meta: { type: Schema.Types.Mixed },

    flagged: { type: Boolean, default: false },

    // Soft delete future-safe
    isDeleted: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

/**
 * Auto-fill donor snapshot details from User
 */
donationSchema.pre("save", async function (next) {
  if (!this.isModified("user")) return next();

  try {
    const User = mongoose.model("User");
    const user = await User.findById(this.user).lean();

    if (user) {
      if (!this.donorName) this.donorName = user.name;
      if (!this.donorEmail) this.donorEmail = user.email;
      if (!this.batchYear && user.batchYear) this.batchYear = user.batchYear;
    }

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * If donation is success → transactionId must be present
 */
donationSchema.pre("validate", function (next) {
  if (this.status === "success" && !this.transactionId) {
    return next(
      new Error("transactionId required for successful donation payment")
    );
  }
  next();
});

/**
 * Indexes
 */
donationSchema.index({ user: 1, createdAt: -1 });
donationSchema.index({ purpose: 1 });
donationSchema.index({ createdAt: 1 });
// unique + sparse → multiple null allowed, but non-null must be unique
donationSchema.index({ transactionId: 1 }, { unique: true, sparse: true });

/**
 * Virtual: display donor name (for UI)
 */
donationSchema.virtual("displayDonorName").get(function () {
  if (this.isAnonymous) return "Anonymous Donor";
  return this.donorName || this.donorEmail || "Alumni Donor";
});

const Donation = mongoose.model("Donation", donationSchema);
module.exports = Donation;
