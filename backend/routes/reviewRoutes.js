const express = require("express");
const r = express.Router();
const { addReview, getUserReviews } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
r.post("/", protect, addReview);
r.get("/user/:userId", getUserReviews);
module.exports = r;
