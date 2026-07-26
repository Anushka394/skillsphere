const asyncHandler = require("express-async-handler");
const Proposal = require("../models/Proposal");
const Gig = require("../models/Gig");
const Notification = require("../models/Notification");

const submitProposal = asyncHandler(async (req, res) => {
  const { gigId, description, bidAmount, estimatedCompletionDays } = req.body;
  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== "open") { res.status(400); throw new Error("Gig not available"); }

  const existing = await Proposal.findOne({ gig: gigId, freelancer: req.user._id });
  if (existing) { res.status(400); throw new Error("You already submitted a proposal for this gig"); }

  const proposal = await Proposal.create({ gig: gigId, freelancer: req.user._id, description, bidAmount, estimatedCompletionDays });
  gig.proposalsCount += 1;
  await gig.save();

  await Notification.create({
    user: gig.client, type: "proposal_received",
    title: "New proposal received",
    message: `Someone submitted a proposal for: ${gig.title}`,
    link: `/gigs/${gig._id}`,
  });

  const io = req.app.get("io");
  io?.to(gig.client.toString()).emit("notification", { type: "proposal_received" });

  res.status(201).json({ success: true, proposal });
});

const getProposalsForGig = asyncHandler(async (req, res) => {
  const gig = await Gig.findById(req.params.gigId);
  if (!gig) { res.status(404); throw new Error("Gig not found"); }
  if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403); throw new Error("Not authorized");
  }
  const proposals = await Proposal.find({ gig: req.params.gigId })
    .populate("freelancer", "name avatar location")
    .sort({ createdAt: -1 });
  res.json({ success: true, proposals });
});

const getMyProposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find({ freelancer: req.user._id })
    .populate({ path: "gig", populate: { path: "client", select: "name avatar" } })
    .sort({ createdAt: -1 });
  res.json({ success: true, proposals });
});

const updateProposalStatus = asyncHandler(async (req, res) => {
  const { status, amount, message } = req.body;
  const proposal = await Proposal.findById(req.params.id).populate("gig");
  if (!proposal) { res.status(404); throw new Error("Proposal not found"); }

  const gig = proposal.gig;
  const isClient = gig.client.toString() === req.user._id.toString();
  const isFreelancer = proposal.freelancer.toString() === req.user._id.toString();

  if (!isClient && !isFreelancer) { res.status(403); throw new Error("Not authorized"); }

  if (status === "negotiating" && amount) {
    proposal.negotiationHistory.push({ proposedBy: isClient ? "client" : "freelancer", amount, message });
  }

  proposal.status = status;
  await proposal.save();

  // When client accepts proposal — assign freelancer to gig + mark in_progress
  if (status === "accepted" && isClient) {
    await Gig.findByIdAndUpdate(gig._id, {
      assignedFreelancer: proposal.freelancer,
      status: "in_progress",
    });
  }

  const notifyUser = isClient ? proposal.freelancer : gig.client;
  await Notification.create({
    user: notifyUser,
    type: status === "accepted" ? "proposal_accepted" : "proposal_rejected",
    title: `Proposal ${status}`,
    message: `Your proposal for "${gig.title}" was ${status}`,
    link: `/gigs/${gig._id}`,
  });

  const io = req.app.get("io");
  io?.to(notifyUser.toString()).emit("notification", {
    type: status === "accepted" ? "proposal_accepted" : "proposal_rejected",
    message: `Your proposal was ${status}`,
  });

  res.json({ success: true, proposal });
});

const getReceivedProposals = asyncHandler(async (req, res) => {
  const gigs = await Gig.find({ client: req.user._id });
  const gigIds = gigs.map((g) => g._id);
  const proposals = await Proposal.find({ gig: { $in: gigIds } })
    .populate("freelancer", "name avatar location")
    .populate("gig", "title budget")
    .sort({ createdAt: -1 });
  res.json({ success: true, proposals });
});

module.exports = { submitProposal, getProposalsForGig, getMyProposals, updateProposalStatus, getReceivedProposals };