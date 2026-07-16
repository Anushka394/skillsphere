const express = require("express");
const r = express.Router();
const { sendMessage, getConversation, getUserConversations, markRead } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
r.post("/", protect, sendMessage);
r.get("/", protect, getUserConversations);
r.get("/:userId", protect, getConversation);
r.put("/:userId/read", protect, markRead);
module.exports = r;
