const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },

    // weighting factors
    weight: { type: Number, default: 1 }, // e.g. based on gig value, reviewer reputation
    isVerified: { type: Boolean, default: true }, // true only if tied to a completed/paid gig

    // fraud detection
    flaggedAsSuspicious: { type: Boolean, default: false },
    flagReason: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ gig: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
