const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    description: { type: String, required: true },
    bidAmount: { type: Number, required: true },
    estimatedCompletionDays: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "negotiating", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },

    negotiationHistory: [
      {
        proposedBy: { type: String, enum: ["client", "freelancer"] },
        amount: Number,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Proposal", proposalSchema);
