const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  registerUser,
  verifyEmail,
  loginUser,
  verify2FALogin,
  setup2FA,
  confirm2FA,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateToken");

router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/2fa/verify-login", verify2FALogin);
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/confirm", protect, confirm2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user._id, req.user.role);
    const refreshToken = generateRefreshToken(req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

module.exports = router;
