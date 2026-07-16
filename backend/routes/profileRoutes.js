const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  updateFreelancerProfile,
  updateClientProfile,
  getPublicFreelancerProfile,
} = require("../controllers/profileController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getMyProfile);
router.put("/", protect, updateMyProfile);
router.put("/freelancer", protect, authorize("freelancer"), updateFreelancerProfile);
router.put("/client", protect, authorize("client"), updateClientProfile);
router.get("/freelancer/:userId", getPublicFreelancerProfile);

module.exports = router;
