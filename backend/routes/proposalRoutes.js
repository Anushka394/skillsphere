const express = require("express");
const r = express.Router();
const { submitProposal, getProposalsForGig, getMyProposals, updateProposalStatus } = require("../controllers/proposalController");
const { protect, authorize } = require("../middleware/authMiddleware");
r.post("/", protect, authorize("freelancer"), submitProposal);
r.get("/gig/:gigId", protect, getProposalsForGig);
r.get("/my", protect, authorize("freelancer"), getMyProposals);
r.put("/:id", protect, updateProposalStatus);
module.exports = r;
