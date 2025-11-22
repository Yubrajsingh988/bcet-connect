// backend/src/modules/mentorship/chat/chat.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String },
    mimeType: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User" }, // DM
    communityId: { type: Schema.Types.ObjectId, ref: "Community" }, // channel
    channelId: { type: String }, // optional sub-channel id
    message: { type: String, trim: true, default: "" },
    attachments: { type: [attachmentSchema], default: [] },
    readBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    deliveredTo: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    meta: { type: Schema.Types.Mixed, default: {} }, // e.g. { type: 'system' }
  },
  { timestamps: true }
);

// Indexes for efficient queries
messageSchema.index({ receiver: 1, createdAt: -1 });
messageSchema.index({ communityId: 1, channelId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", messageSchema);
