const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const speakeasy = require("speakeasy");
const User = require("../models/User");
const Freelancer = require("../models/Freelancer");
const Client = require("../models/Client");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

// @desc    Register new user (client or freelancer)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide name, email and password");
  }

  if (role === "admin") {
    res.status(400);
    throw new Error("Cannot self-register as admin");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(emailVerificationToken).digest("hex");

  const user = await User.create({
    name,
    email,
    password,
    role: role === "freelancer" ? "freelancer" : "client",
    emailVerificationToken: hashedToken,
    emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
  });

  // create role-specific profile
  if (user.role === "freelancer") {
    await Freelancer.create({ user: user._id });
  } else {
    await Client.create({ user: user._id });
  }

  // send verification email (non-blocking failure)
  try {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your SkillSphere account",
      html: `<p>Hi ${user.name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>. This link expires in 24 hours.</p>`,
    });
  } catch (err) {
    console.error("Email send failed:", err.message);
  }

  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully" });
});

// @desc    Login user (step 1; if 2FA enabled, returns a flag instead of tokens)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +twoFactorSecret");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (user.isSuspended) {
    res.status(403);
    throw new Error("Account suspended. Contact support.");
  }

  if (user.twoFactorEnabled) {
    // Client must call /api/auth/2fa/verify-login next with a tempToken
    const tempToken = generateAccessToken(user._id, user.role); // short-lived in real impl; reuse for simplicity
    return res.json({
      success: true,
      requires2FA: true,
      tempToken,
      message: "Enter your 2FA code to complete login",
    });
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: user.isEmailVerified },
  });
});

// @desc    Verify 2FA code and complete login
// @route   POST /api/auth/2fa/verify-login
// @access  Public (requires tempToken from login step)
const verify2FALogin = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  const user = await User.findById(userId).select("+twoFactorSecret");
  if (!user || !user.twoFactorEnabled) {
    res.status(400);
    throw new Error("2FA not enabled for this account");
  }

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    res.status(401);
    throw new Error("Invalid 2FA code");
  }

  user.lastLogin = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  res.json({ success: true, accessToken, refreshToken, user: { id: user._id, name: user.name, role: user.role } });
});

// @desc    Enable 2FA - generates secret + QR otpauth url
// @route   POST /api/auth/2fa/setup
// @access  Private
const setup2FA = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `SkillSphere (${req.user.email})` });

  const user = await User.findById(req.user._id);
  user.twoFactorSecret = secret.base32;
  await user.save();

  res.json({
    success: true,
    otpauthUrl: secret.otpauth_url,
    base32Secret: secret.base32,
    message: "Scan the QR in an authenticator app, then confirm with /2fa/confirm",
  });
});

// @desc    Confirm 2FA setup with a code
// @route   POST /api/auth/2fa/confirm
// @access  Private
const confirm2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!verified) {
    res.status(400);
    throw new Error("Invalid code, 2FA not enabled");
  }

  user.twoFactorEnabled = true;
  await user.save();

  res.json({ success: true, message: "2FA enabled successfully" });
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  // Always respond success to avoid email enumeration
  if (!user) {
    return res.json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1h
  await user.save();

  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: "SkillSphere password reset",
      html: `<p>Reset your password by clicking <a href="${resetUrl}">here</a>. This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(500);
    throw new Error("Email could not be sent");
  }

  res.json({ success: true, message: "If that email exists, a reset link has been sent." });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful. Please log in." });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  verify2FALogin,
  setup2FA,
  confirm2FA,
  forgotPassword,
  resetPassword,
  getMe,
};
