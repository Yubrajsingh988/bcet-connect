// backend/src/modules/jobs/job.model.js

const mongoose = require("mongoose");

const applicantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: String,
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },

    companyLogo: {
      type: String,
      default: "https://via.placeholder.com/100x100?text=Logo",
    },

    location: { type: String, required: true },

    employmentType: {
      type: String,
      enum: ["Full-Time", "Internship", "Part-Time", "Contract", "Freelance"],
      default: "Full-Time",
    },

    mode: {
      type: String,
      enum: ["Onsite", "Remote", "Hybrid"],
      default: "Onsite",
    },

    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior", "Lead"],
      default: "Entry",
    },

    category: {
      type: String,
      default: "General",
    },

    description: { type: String, required: true },

    skills: {
      type: [String],
      default: [],
    },

    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },

    applyLink: {
      type: String,
      default: "",
    },

    deadline: Date,

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    applicants: {
      type: [applicantSchema],
      default: [],
    },

    // 🔥 FIXED FIELD NAME
    isApproved: {
      type: Boolean,
      default: true, // change back to false when admin panel ready
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
