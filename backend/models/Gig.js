const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  dueDate: Date,
  status: { type: String, enum: ["pending", "in_progress", "submitted", "approved", "paid"], default: "pending" },
  completionPercentage: { type: Number, default: 0 },
  files: [{ url: String, name: String, uploadedAt: { type: Date, default: Date.now } }],
});

const gigSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    skillsRequired: [{ type: String }],

    budget: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      type: { type: String, enum: ["fixed", "hourly"], default: "fixed" },
    },

    milestones: [milestoneSchema],

    attachments: [{ url: String, name: String }],

    location: {
      city: String,
      state: String,
      isRemote: { type: Boolean, default: true },
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    status: {
      type: String,
      enum: ["draft", "open", "in_progress", "completed", "cancelled", "disputed"],
      default: "open",
    },

    approvedByAdmin: { type: Boolean, default: true }, // admin can flag/unapprove

    progress: {
      taskCompletionPercentage: { type: Number, default: 0 },
      logs: [{ note: String, createdAt: { type: Date, default: Date.now } }],
    },

    deadline: Date,

    proposalsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gigSchema.index({ "location.coordinates": "2dsphere" });
gigSchema.index({ title: "text", description: "text", skillsRequired: "text" });

module.exports = mongoose.model("Gig", gigSchema);
