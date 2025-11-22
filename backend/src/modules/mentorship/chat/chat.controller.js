// backend/src/modules/mentorship/chat/chat.controller.js
const chatService = require("./chat.service");
const catchAsync = require("../../../utils/catchAsync");
const ApiResponse = require("../../../utils/ApiResponse");
const ApiError = require("../../../utils/ApiError");

/**
 * POST /api/chat/send
 * body: { receiver, communityId, channelId, message, attachments, meta }
 */
exports.sendMessage = catchAsync(async (req, res) => {
  const payload = {
    sender: req.user.id,
    receiver: req.body.receiver,
    communityId: req.body.communityId,
    channelId: req.body.channelId,
    message: req.body.message || "",
    attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [],
    meta: req.body.meta || {},
  };

  // require at least receiver OR communityId
  if (!payload.receiver && !payload.communityId) {
    throw new ApiError(400, "receiver or communityId is required");
  }

  const saved = await chatService.createMessage(payload);

  return ApiResponse.success(res, saved, "Message sent");
});

/**
 * GET /api/chat/conversation/:peerId
 * query: skip, limit
 */
exports.getConversation = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const peerId = req.params.peerId;
  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 50;

  const messages = await chatService.getConversation({ userId, peerId, skip, limit });
  return ApiResponse.success(res, messages, "Conversation fetched");
});

/**
 * GET /api/chat/community/:communityId
 * query: channelId, skip, limit
 */
exports.getCommunity = catchAsync(async (req, res) => {
  const communityId = req.params.communityId;
  const channelId = req.query.channelId;
  const skip = Number(req.query.skip) || 0;
  const limit = Number(req.query.limit) || 50;

  const messages = await chatService.getCommunityMessages({ communityId, channelId, skip, limit });
  return ApiResponse.success(res, messages, "Community messages fetched");
});

/**
 * PATCH /api/chat/:id/read
 * body: {}
 */
exports.markRead = catchAsync(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  const updated = await chatService.markRead(messageId, userId);
  return ApiResponse.success(res, updated, "Message marked read");
});

/**
 * PATCH /api/chat/:id/delivered
 */
exports.markDelivered = catchAsync(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user.id;
  const updated = await chatService.markDelivered(messageId, userId);
  return ApiResponse.success(res, updated, "Message marked delivered");
});
