// backend/src/modules/mentorship/chat/chat.routes.js
const router = require("express").Router();
const auth = require("../../../middleware/authMiddleware");
const chatController = require("./chat.controller");

// REST fallback / administrative usage for chat
router.post("/send", auth, chatController.sendMessage);

// DM conversation (paginated)
router.get("/conversation/:peerId", auth, chatController.getConversation);

// Community messages
router.get("/community/:communityId", auth, chatController.getCommunity);

// Mark read/delivered
router.patch("/:id/read", auth, chatController.markRead);
router.patch("/:id/delivered", auth, chatController.markDelivered);

module.exports = router;
