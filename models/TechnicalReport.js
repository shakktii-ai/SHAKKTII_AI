//models/TechnicalReport.js
import mongoose from "mongoose";
const QuestionDetailSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: String,
  userAnswer: String,
  isCorrect: Boolean,
});
const TechnicalReportSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      default: "Student",
    },

    subject: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    collageName: {
      type: String,
      default: "Unknown",
    },

    score: {
      type: Number,
      required: true,
    },

    totalQuestions: {
      type: Number,
      required: true,
    },

    percentage: Number,
  questionResponses: [QuestionDetailSchema],
    reportAnalysis: {
      summary: String,
      strengths: [String],
      weakAreas: [String],
      improvementTips: [String],
      // recommendedLevel: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.TechnicalReport ||
  mongoose.model("TechnicalReport", TechnicalReportSchema);
