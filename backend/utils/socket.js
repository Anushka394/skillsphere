const jwt = require("jsonwebtoken");

const initSocket = (io) => {
  // authenticate socket connections via JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.userId}`);
    socket.join(socket.userId); // personal room for direct notifications

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", (payload) => {
      // payload: { conversationId, receiverId, text, attachments }
      io.to(payload.conversationId).emit("newMessage", payload);
      io.to(payload.receiverId).emit("notification", {
        type: "message_received",
        message: "You have a new message",
      });
    });

    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("userTyping", { userId });
    });

    socket.on("stopTyping", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("userStoppedTyping", { userId });
    });

    socket.on("markRead", ({ conversationId, messageIds }) => {
      socket.to(conversationId).emit("messagesRead", { messageIds });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = initSocket;
