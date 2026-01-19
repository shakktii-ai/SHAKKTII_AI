const mongoose = require('mongoose');

const AcademicTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stream: { 
      type: String, 
      required: true, 
      enum: ["10th", "11th", "12th", "Science", "Commerce", "Arts/Humanities", "Engineering", "Medical", "Law", "General"] 
    },
    department: { type: String, required: true },
    subject: { type: String, required: true },
    confidenceLevel: { type: Number, required: true, min: 1, max: 5 },
    testFormat: { 
      type: String, 
      required: true, 
      enum: ["MCQ", "Written", "Speaking"] 
    },
    questions: [
      {
        questionText: { type: String, required: true },
        difficulty: { type: String, required: true, enum: ["Easy", "Moderate", "Hard"] },
        options: [{ type: String }], // For MCQ
        correctAnswer: { type: String, required: true },
        explanation: { type: String }
      }
    ],
    dateCreated: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

// Create model or use existing one if available
const AcademicTest = mongoose.models.AcademicTest || mongoose.model("AcademicTest", AcademicTestSchema);

module.exports = AcademicTest;
