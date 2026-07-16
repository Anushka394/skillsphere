const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "new_gig_posted",
        "proposal_received",
        "proposal_accepted",
        "proposal_rejected",
        "payment_received",
        "review_added",
        "message_received",
        "dispute_update",
        "milestone_update",
        "account_alert",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" }, // frontend route to navigate to
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
