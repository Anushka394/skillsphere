const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");

const getConversationId = (a, b) => [a, b].sort().join("_");

const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, text, gigId, attachments } = req.body;
  const conversationId = getConversationId(req.user._id.toString(), receiverId);

  const message = await Message.create({
    conversationId, sender: req.user._id, receiver: receiverId,
    text, attachments, gig: gigId,
  });
  await message.populate("sender", "name avatar");

  const io = req.app.get("io");
  io?.to(conversationId).emit("newMessage", message);
  io?.to(receiverId).emit("notification", { type: "message_received", message: "New message" });

  res.status(201).json({ success: true, message });
});

const getConversation = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
  const messages = await Message.find({ conversationId })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  await Message.updateMany({ conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

  res.json({ success: true, messages, conversationId });
});

const getUserConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const messages = await Message.aggregate([
    { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$conversationId", lastMessage: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$lastMessage" } },
    { $lookup: { from: "users", localField: "sender", foreignField: "_id", as: "senderInfo" } },
    { $lookup: { from: "users", localField: "receiver", foreignField: "_id", as: "receiverInfo" } },
  ]);
  res.json({ success: true, conversations: messages });
});

const markRead = asyncHandler(async (req, res) => {
  const conversationId = getConversationId(req.user._id.toString(), req.params.userId);
  await Message.updateMany({ conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});

module.exports = { sendMessage, getConversation, getUserConversations, markRead };
