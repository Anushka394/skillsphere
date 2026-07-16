const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    title: { type: String, default: "" }, // e.g. "Full Stack Developer"
    bio: { type: String, default: "" },

    skills: [
      {
        name: { type: String, required: true },
        proficiency: { type: String, enum: ["Beginner", "Intermediate", "Advanced", "Expert"], default: "Intermediate" },
      },
    ],

    portfolio: [
      {
        title: String,
        description: String,
        imageUrl: String,
        projectUrl: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    resumeUrl: { type: String, default: "" },

    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        certificateUrl: String,
      },
    ],

    workExperience: [
      {
        company: String,
        roleTitle: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],

    availability: [
      {
        date: Date,
        slots: [{ start: String, end: String, isBooked: { type: Boolean, default: false } }],
      },
    ],

    pricing: {
      hourlyRate: { type: Number, default: 0 },
      milestoneBased: { type: Boolean, default: true },
    },

    isVerified: { type: Boolean, default: false },
    verificationBadge: { type: String, enum: ["none", "id_verified", "skill_verified", "top_rated"], default: "none" },

    reputationScore: { type: Number, default: 0 }, // weighted score, computed
    totalEarnings: { type: Number, default: 0 },
    completedGigs: { type: Number, default: 0 },

    profileViews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

freelancerSchema.index({ "skills.name": "text", title: "text", bio: "text" });

module.exports = mongoose.model("Freelancer", freelancerSchema);
