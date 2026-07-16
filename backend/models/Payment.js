const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    gig: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
    milestoneId: { type: mongoose.Schema.Types.ObjectId }, // sub-doc id within gig.milestones
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    type: { type: String, enum: ["escrow_funding", "milestone_payout", "refund"], required: true },

    status: {
      type: String,
      enum: ["pending", "held_in_escrow", "released", "refunded", "failed"],
      default: "pending",
    },

    gateway: { type: String, enum: ["razorpay", "stripe"], default: "razorpay" },
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
