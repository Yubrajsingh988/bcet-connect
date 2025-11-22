const mongoose = require("mongoose");

const learningResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    url: { type: String, required: true },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    // Kis skills ke liye ye resource helpful hai
    skills: [String], // e.g. ["React", "Node.js"]

    // Type: video / blog / course / playlist etc.
    tags: [String],

    // Kisne add kiya tha (student/alumni/faculty/admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Upvote & Downvote users ke IDs
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LearningResource", learningResourceSchema);
