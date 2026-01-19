const mongoose = require('mongoose');

const PracticeResponseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeTest", required: true },
    cardId: { type: String, required: true },
    userResponse: { type: String, required: true },
    score: { type: Number, required: true }, // 1, 2, or 3 stars
    timeSpent: { type: Number }, // in seconds
    feedbackResponse: { type: String },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PracticeResponse = mongoose.models.PracticeResponse || mongoose.model("PracticeResponse", PracticeResponseSchema);

module.exports = PracticeResponse;
