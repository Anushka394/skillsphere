const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Gig = require("../models/Gig");
const Freelancer = require("../models/Freelancer");

const addReview = asyncHandler(async (req, res) => {
  const { gigId, revieweeId, rating, comment } = req.body;
  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== "completed") { res.status(400); throw new Error("Gig must be completed to leave a review"); }

  const existing = await Review.findOne({ gig: gigId, reviewer: req.user._id });
  if (existing) { res.status(400); throw new Error("You already reviewed this gig"); }

  const review = await Review.create({ gig: gigId, reviewer: req.user._id, reviewee: revieweeId, rating, comment });

  // Update freelancer reputation score (weighted avg)
  const reviews = await Review.find({ reviewee: revieweeId, flaggedAsSuspicious: false });
  const total = reviews.reduce((sum, r) => sum + r.rating * r.weight, 0);
  const weights = reviews.reduce((sum, r) => sum + r.weight, 0);
  const newScore = weights ? total / weights : 0;

  await Freelancer.findOneAndUpdate({ user: revieweeId }, { reputationScore: Number(newScore.toFixed(2)) });

  res.status(201).json({ success: true, review });
});

const getUserReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.userId, flaggedAsSuspicious: false })
    .populate("reviewer", "name avatar role")
    .populate("gig", "title")
    .sort({ createdAt: -1 });
  res.json({ success: true, reviews });
});

module.exports = { addReview, getUserReviews };
