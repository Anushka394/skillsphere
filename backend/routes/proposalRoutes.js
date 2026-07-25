const express = require("express");
const r = express.Router();
const { submitProposal, getProposalsForGig, getMyProposals, updateProposalStatus, getReceivedProposals } = require("../controllers/proposalController");
const { protect, authorize } = require("../middleware/authMiddleware");

r.get("/received", protect, authorize("client"), getReceivedProposals);
r.post("/", protect, authorize("freelancer"), submitProposal);
r.get("/gig/:gigId", protect, getProposalsForGig);
r.get("/my", protect, authorize("freelancer"), getMyProposals);
r.put("/:id", protect, updateProposalStatus);

module.exports = r;