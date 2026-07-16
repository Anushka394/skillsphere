const express = require("express");
const r = express.Router();
const { getNotifications, markRead, markAllRead } = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");
r.get("/", protect, getNotifications);
r.put("/read-all", protect, markAllRead);
r.put("/:id/read", protect, markRead);
module.exports = r;
