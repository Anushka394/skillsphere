const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Freelancer = require("../models/Freelancer");
const Client = require("../models/Client");

// @desc    Get logged-in user's full profile (User + role-specific doc)
// @route   GET /api/profile
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  let roleProfile = null;

  if (user.role === "freelancer") {
    roleProfile = await Freelancer.findOne({ user: user._id });
  } else if (user.role === "client") {
    roleProfile = await Client.findOne({ user: user._id });
  }

  res.json({ success: true, user, profile: roleProfile });
});

// @desc    Update base user info (name, phone, location, avatar)
// @route   PUT /api/profile
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, phone, location, avatar } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (location) user.location = { ...user.location, ...location };
  if (avatar) user.avatar = avatar;

  await user.save();
  res.json({ success: true, user });
});

// @desc    Update freelancer-specific profile fields
// @route   PUT /api/profile/freelancer
// @access  Private (freelancer only)
const updateFreelancerProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    "title",
    "bio",
    "skills",
    "resumeUrl",
    "certifications",
    "workExperience",
    "availability",
    "pricing",
  ];

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await Freelancer.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, profile });
});

// @desc    Update client-specific profile fields
// @route   PUT /api/profile/client
// @access  Private (client only)
const updateClientProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["companyName", "industry", "about"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const profile = await Client.findOneAndUpdate({ user: req.user._id }, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, profile });
});

// @desc    Get any public freelancer profile by id (increments view count)
// @route   GET /api/profile/freelancer/:userId
// @access  Public
const getPublicFreelancerProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select("name avatar location role");
  if (!user || user.role !== "freelancer") {
    res.status(404);
    throw new Error("Freelancer not found");
  }

  const profile = await Freelancer.findOneAndUpdate(
    { user: user._id },
    { $inc: { profileViews: 1 } },
    { new: true }
  );

  res.json({ success: true, user, profile });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  updateFreelancerProfile,
  updateClientProfile,
  getPublicFreelancerProfile,
};
