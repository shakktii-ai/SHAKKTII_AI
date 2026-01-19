const mongoose = require('mongoose');

const AcademicTestResponseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicTest", required: true },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        userAnswer: { type: String, required: true },
        isCorrect: { type: Boolean },
        score: { type: Number }, // Score for this question (0-100)
        feedback: { type: String }
      }
    ],
    overallScore: { type: Number }, // Overall percentage score
    stars: { type: Number, min: 0, max: 3 }, // 0-3 stars rating
    feedback: { type: String }, // Overall feedback
    timeSpent: { type: Number }, // in seconds
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create model or use existing one if available
const AcademicTestResponse = mongoose.models.AcademicTestResponse || 
  mongoose.model("AcademicTestResponse", AcademicTestResponseSchema);

module.exports = AcademicTestResponse;
