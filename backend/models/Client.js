const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    about: { type: String, default: "" },
    totalGigsPosted: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Client", clientSchema);
