const asyncHandler = require("express-async-handler");
const Gig = require("../models/Gig");
const Freelancer = require("../models/Freelancer");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { rankFreelancers } = require("../utils/aiMatching");

// @route GET /api/gigs
const getGigs = asyncHandler(async (req, res) => {
  const { keyword, category, skills, minBudget, maxBudget, city, remote, page = 1, limit = 12 } = req.query;
  const query = { status: "open", approvedByAdmin: true };

  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (skills) query.skillsRequired = { $in: skills.split(",").map((s) => s.trim()) };
  if (minBudget || maxBudget) {
    query["budget.max"] = {};
    if (minBudget) query["budget.max"].$gte = Number(minBudget);
    if (maxBudget) query["budget.min"] = { $lte: Number(maxBudget) };
  }
  if (remote === "true") query["location.isRemote"] = true;
  if (city) query["location.city"] = new RegExp(city, "i");

  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query)
    .populate("client", "name avatar location")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), gigs });
});

// @route GET /api/gigs/:id
const getGigById = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate("client", "name avatar location")
    .populate("assignedFreelancer", "name avatar");

  if (!gig) { res.status(404); throw new Error("Gig not found"); }

  // AI-ranked freelancer recommendations (for client view only)
  let recommendations = [];
  if (req.user && req.user._id.toString() === gig.client._id.toString()) {
    const freelancers = await Freelancer.find({}).populate("user", "name avatar location");
    const data = freelancers.map((f) => ({
      userId: f.user?._id,
      name: f.user?.name,
      avatar: f.user?.avatar,
      location: f.user?.location,
      skills: f.skills,
      reputationScore: f.reputationScore,
    }));
    recommendations = (await rankFreelancers(gig.skillsRequired, data)).slice(0, 5);
  }

  res.json({ success: true, gig, recommendations });
});

// @route POST /api/gigs
const Client = require("../models/Client");

const createGig = asyncHandler(async (req, res) => {
  const { title, description, category, skillsRequired, budget, milestones, location, deadline } = req.body;
  const gig = await Gig.create({
    client: req.user._id,
    title, description, category, skillsRequired, budget, milestones,
    location: location || { isRemote: true },
    deadline,
  });

  // Update client gigs count
  await Client.findOneAndUpdate(
    { user: req.user._id },
    { $inc: { totalGigsPosted: 1 } }
  );

  res.status(201).json({ success: true, gig });
});

// @route PUT /api/gigs/:id
const updateGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) { res.status(404); throw new Error("Gig not found"); }
  if (gig.client.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorized"); }

  const allowed = ["title", "description", "category", "skillsRequired", "budget", "milestones", "location", "deadline", "status"];
  allowed.forEach((field) => { if (req.body[field] !== undefined) gig[field] = req.body[field]; });
  await gig.save();
  res.json({ success: true, gig });
});

// @route DELETE /api/gigs/:id
const deleteGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) { res.status(404); throw new Error("Gig not found"); }
  const isOwner = gig.client.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) { res.status(403); throw new Error("Not authorized"); }
  await gig.deleteOne();
  res.json({ success: true, message: "Gig deleted" });
});

// @route PUT /api/gigs/:id/assign/:freelancerId
const assignFreelancer = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) { res.status(404); throw new Error("Gig not found"); }
  if (gig.client.toString() !== req.user._id.toString()) { res.status(403); throw new Error("Not authorized"); }

  gig.assignedFreelancer = req.params.freelancerId;
  gig.status = "in_progress";
  await gig.save();

  await Notification.create({
    user: req.params.freelancerId,
    type: "proposal_accepted",
    title: "You got the gig!",
    message: `You've been assigned to: ${gig.title}`,
    link: `/gigs/${gig._id}`,
  });

  const io = req.app.get("io");
  io?.to(req.params.freelancerId.toString()).emit("notification", { type: "proposal_accepted", message: "You got the gig!" });

  res.json({ success: true, gig });
});

// @route PUT /api/gigs/:id/progress
const updateProgress = asyncHandler(async (req, res) => {
  const { milestoneId, status, note, completionPercentage } = req.body;
  const gig = await Gig.findById(req.params.id);
  if (!gig) { res.status(404); throw new Error("Gig not found"); }

  if (milestoneId) {
    const milestone = gig.milestones.id(milestoneId);
    if (!milestone) { res.status(404); throw new Error("Milestone not found"); }
    if (status) milestone.status = status;
    if (completionPercentage !== undefined) milestone.completionPercentage = completionPercentage;
  }

  if (note) gig.progress.logs.push({ note });

  const total = gig.milestones.length;
  const done = gig.milestones.filter((m) => ["approved", "paid"].includes(m.status)).length;
  gig.progress.taskCompletionPercentage = total ? Math.round((done / total) * 100) : (completionPercentage || 0);

  await gig.save();
  res.json({ success: true, gig });
});

// @route GET /api/gigs/my
const getMyGigs = asyncHandler(async (req, res) => {
  const filter = req.user.role === "client"
    ? { client: req.user._id }
    : { assignedFreelancer: req.user._id };
  const gigs = await Gig.find(filter).populate("client", "name avatar").populate("assignedFreelancer", "name avatar").sort({ createdAt: -1 });
  res.json({ success: true, gigs });
});

module.exports = { getGigs, getGigById, createGig, updateGig, deleteGig, assignFreelancer, updateProgress, getMyGigs };
