const express = require("express");
const r = express.Router();
const { createOrder, verifyPayment, releaseMilestonePayment, getMyTransactions } = require("../controllers/paymentController");
const { protect, authorize } = require("../middleware/authMiddleware");
r.post("/order", protect, authorize("client"), createOrder);
r.post("/verify", protect, verifyPayment);
r.post("/:paymentId/release", protect, releaseMilestonePayment);
r.get("/my", protect, getMyTransactions);
module.exports = r;
