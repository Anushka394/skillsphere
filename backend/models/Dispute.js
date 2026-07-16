const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [{ url: String, name: String }],

    status: { type: String, enum: ["open", "under_review", "resolved", "rejected"], default: "open" },

    resolution: {
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin
      outcome: { type: String, enum: ["refund_client", "pay_freelancer", "partial_split", "no_action"] },
      notes: String,
      resolvedAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);
