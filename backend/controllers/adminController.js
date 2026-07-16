const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Gig = require("../models/Gig");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Dispute = require("../models/Dispute");
const Freelancer = require("../models/Freelancer");
const AdminLog = require("../models/AdminLog");

const log = async (admin, action, targetType, targetId, details = "") =>
  AdminLog.create({ admin, action, targetType, targetId, details });

const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalFreelancers, totalClients, totalGigs, openGigs, completedGigs, paymentsData, recentUsers, topFreelancers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "freelancer" }),
    User.countDocuments({ role: "client" }),
    Gig.countDocuments(),
    Gig.countDocuments({ status: "open" }),
    Gig.countDocuments({ status: "completed" }),
    Payment.aggregate([
      { $match: { status: { $in: ["released", "held_in_escrow"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
    Freelancer.find().sort({ reputationScore: -1 }).limit(5).populate("user", "name avatar email"),
  ]);

  const platformRevenue = paymentsData[0]?.totalRevenue || 0;
  const jobSuccessRate = totalGigs ? Math.round((completedGigs / totalGigs) * 100) : 0;

  res.json({
    success: true,
    stats: { totalUsers, totalFreelancers, totalClients, totalGigs, openGigs, completedGigs, platformRevenue, jobSuccessRate },
    recentUsers, topFreelancers,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];

  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, users });
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: true, suspensionReason: req.body.reason || "" }, { new: true });
  if (!user) { res.status(404); throw new Error("User not found"); }
  await log(req.user._id, "suspend_user", "User", user._id, req.body.reason);
  res.json({ success: true, user });
});

const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isSuspended: false, suspensionReason: "" }, { new: true });
  if (!user) { res.status(404); throw new Error("User not found"); }
  await log(req.user._id, "unsuspend_user", "User", user._id);
  res.json({ success: true, user });
});

const verifyFreelancer = asyncHandler(async (req, res) => {
  const freelancer = await Freelancer.findOneAndUpdate(
    { user: req.params.id },
    { isVerified: true, verificationBadge: "id_verified" },
    { new: true }
  );
  if (!freelancer) { res.status(404); throw new Error("Freelancer not found"); }
  await log(req.user._id, "verify_freelancer", "User", req.params.id);
  res.json({ success: true, freelancer });
});

const getAllGigsAdmin = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = status ? { status } : {};
  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query).populate("client", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, gigs });
});

const approveGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findByIdAndUpdate(req.params.id, { approvedByAdmin: req.body.approved }, { new: true });
  await log(req.user._id, req.body.approved ? "approve_gig" : "reject_gig", "Gig", gig._id);
  res.json({ success: true, gig });
});

module.exports = { getDashboardStats, getAllUsers, suspendUser, unsuspendUser, verifyFreelancer, getAllGigsAdmin, approveGig };
