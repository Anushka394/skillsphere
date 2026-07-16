const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");
const Gig = require("../models/Gig");
const Notification = require("../models/Notification");
const Freelancer = require("../models/Freelancer");

const getRazorpay = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// @route POST /api/payments/order   — client funds escrow for a milestone
const createOrder = asyncHandler(async (req, res) => {
  const { gigId, milestoneId, amount } = req.body;
  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({ amount: amount * 100, currency: "INR", receipt: `ss_${Date.now()}` });

  const payment = await Payment.create({
    gig: gigId, milestoneId, client: req.user._id,
    freelancer: (await Gig.findById(gigId)).assignedFreelancer,
    amount, type: "escrow_funding", status: "pending",
    gateway: "razorpay", gatewayOrderId: order.id,
  });

  res.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency, paymentId: payment._id });
});

// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;
  const expectedSig = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");

  if (expectedSig !== razorpay_signature) { res.status(400); throw new Error("Invalid payment signature"); }

  const payment = await Payment.findByIdAndUpdate(paymentId, {
    status: "held_in_escrow", gatewayPaymentId: razorpay_payment_id, gatewaySignature: razorpay_signature,
  }, { new: true });

  res.json({ success: true, payment });
});

// @route POST /api/payments/:paymentId/release   — admin/client releases milestone payment
const releaseMilestonePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment || payment.status !== "held_in_escrow") { res.status(400); throw new Error("Payment not in escrow"); }
  if (payment.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403); throw new Error("Not authorized");
  }

  payment.status = "released";
  payment.type = "milestone_payout";
  await payment.save();

  await Freelancer.findOneAndUpdate({ user: payment.freelancer }, { $inc: { totalEarnings: payment.amount } });
  await Notification.create({
    user: payment.freelancer, type: "payment_received",
    title: `₹${payment.amount} released`, message: "Milestone payment released to you",
    link: `/dashboard`,
  });

  const io = req.app.get("io");
  io?.to(payment.freelancer.toString()).emit("notification", { type: "payment_received", message: `₹${payment.amount} released` });

  res.json({ success: true, payment });
});

const getMyTransactions = asyncHandler(async (req, res) => {
  const filter = req.user.role === "client" ? { client: req.user._id } : { freelancer: req.user._id };
  const payments = await Payment.find(filter).populate("gig", "title").sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

module.exports = { createOrder, verifyPayment, releaseMilestonePayment, getMyTransactions };
