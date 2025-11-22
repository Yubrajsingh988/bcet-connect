// backend/src/modules/mentorship/chat/chat.service.js
const mongoose = require("mongoose");
const Chat = require("./chat.model");
const ApiError = require("../../../utils/ApiError");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

/**
 * Create and persist a chat message
 * payload: { sender, receiver?, communityId?, channelId?, message, attachments, meta }
 */
exports.createMessage = async (payload) => {
  if (!payload || !payload.sender) {
    throw new ApiError(400, "Invalid payload");
  }

  const doc = await Chat.create(payload);
  return doc;
};

/**
 * Get DM conversation between two users (paginated)
 * Returns chronological (oldest -> newest)
 */
exports.getConversation = async ({ userId, peerId, skip = 0, limit = 50 }) => {
  if (!isValidObjectId(userId) || !isValidObjectId(peerId)) return [];

  const q = {
    $or: [
      { sender: userId, receiver: peerId },
      { sender: peerId, receiver: userId },
    ],
  };

  const messages = await Chat.find(q)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  return messages.reverse();
};

/**
 * Get community/channel messages (paginated)
 */
exports.getCommunityMessages = async ({ communityId, channelId, skip = 0, limit = 50 }) => {
  if (!isValidObjectId(communityId)) return [];

  const q = { communityId };
  if (channelId) q.channelId = channelId;

  const messages = await Chat.find(q)
    .sort({ createdAt: -1 })
    .skip(Number(skip))
    .limit(Math.min(Number(limit) || 50, 200))
    .lean();

  return messages.reverse();
};

/**
 * Mark a message as read by userId
 */
exports.markRead = async (messageId, userId) => {
  if (!isValidObjectId(messageId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid id");
  }

  const updated = await Chat.findByIdAndUpdate(
    messageId,
    { $addToSet: { readBy: userId } },
    { new: true }
  ).lean();

  if (!updated) throw new ApiError(404, "Message not found");
  return updated;
};

/**
 * Mark delivered (for read receipts/delivery)
 */
exports.markDelivered = async (messageId, userId) => {
  if (!isValidObjectId(messageId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid id");
  }
  const updated = await Chat.findByIdAndUpdate(
    messageId,
    { $addToSet: { deliveredTo: userId } },
    { new: true }
  ).lean();
  if (!updated) throw new ApiError(404, "Message not found");
  return updated;
};
