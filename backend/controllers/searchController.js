const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Freelancer = require("../models/Freelancer");
const Gig = require("../models/Gig");
const { rankFreelancers } = require("../utils/aiMatching");

// @route GET /api/search/freelancers?skills=React,Node&city=Delhi&minRating=4&page=1
const searchFreelancers = asyncHandler(async (req, res) => {
  const { skills, city, minRating, maxHourlyRate, page = 1, limit = 12, keyword } = req.query;

  let freelancerQuery = {};
  if (minRating) freelancerQuery.reputationScore = { $gte: Number(minRating) };
  if (maxHourlyRate) freelancerQuery["pricing.hourlyRate"] = { $lte: Number(maxHourlyRate) };
  if (skills) freelancerQuery["skills.name"] = { $in: skills.split(",").map((s) => s.trim()) };

  let userQuery = { role: "freelancer", isSuspended: false };
  if (city) userQuery["location.city"] = new RegExp(city, "i");
  if (keyword) userQuery.$or = [{ name: new RegExp(keyword, "i") }];

  const users = await User.find(userQuery).select("_id name avatar location");
  const userIds = users.map((u) => u._id);
  freelancerQuery.user = { $in: userIds };

  const total = await Freelancer.countDocuments(freelancerQuery);
  const freelancers = await Freelancer.find(freelancerQuery)
    .populate("user", "name avatar location")
    .skip((page - 1) * limit).limit(Number(limit));

  // AI rank if skills provided
  let results = freelancers;
  if (skills) {
    const skillArr = skills.split(",");
    const data = freelancers.map((f) => ({ ...f.toObject(), userId: f.user?._id }));
    results = await rankFreelancers(skillArr, data);
  }

  res.json({ success: true, total, page: Number(page), freelancers: results });
});

// @route GET /api/search/gigs?keyword=react&category=Development
const searchGigs = asyncHandler(async (req, res) => {
  const { keyword, category, minBudget, maxBudget, remote, page = 1, limit = 12 } = req.query;
  const query = { status: "open", approvedByAdmin: true };
  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = category;
  if (remote === "true") query["location.isRemote"] = true;
  if (minBudget) query["budget.max"] = { $gte: Number(minBudget) };
  if (maxBudget) query["budget.min"] = { ...(query["budget.min"] || {}), $lte: Number(maxBudget) };

  const total = await Gig.countDocuments(query);
  const gigs = await Gig.find(query)
    .populate("client", "name avatar")
    .sort(keyword ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .skip((page - 1) * limit).limit(Number(limit));

  res.json({ success: true, total, gigs });
});

module.exports = { searchFreelancers, searchGigs };
