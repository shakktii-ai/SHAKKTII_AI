const mongoose = require('mongoose');

const PracticeTestSchema = new mongoose.Schema(
  {
    cardId: { type: String, required: true },
    skillArea: { type: String, required: true, enum: ["Speaking", "Listening", "Reading", "Writing", "Personality"] },
    difficulty: { type: String, required: true, enum: ["Beginner", "Moderate", "Expert"] },
    instructions: { type: String, required: true },
    content: { type: String, required: true },
    expectedResponse: { type: String },
    options: { type: [String] },
    timeLimit: { type: Number, required: true },
    evaluationCriteria: {
      basic: { type: String, required: true },
      intermediate: { type: String, required: true },
      advanced: { type: String, required: true },
    },
    imageUrl: { type: String },
    audioUrl: { type: String },
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PracticeTest = mongoose.models.PracticeTest || mongoose.model("PracticeTest", PracticeTestSchema);

module.exports = PracticeTest;
