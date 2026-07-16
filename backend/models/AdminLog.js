const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "suspend_user", "verify_freelancer", "approve_gig"
    targetType: { type: String, enum: ["User", "Gig", "Payment", "Review", "Dispute"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminLog", adminLogSchema);
