const mongoose = require('mongoose');

const PsychometricTestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // No required field
    userEmail: { type: String, required: true }, // Make userEmail required instead
    profileType: { type: String, enum: ["student", "employee"], default: "employee" },
    questions: [
      {
        scenario: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            value: { type: Number, required: true } // Value for scoring
          }
        ],
        difficulty: { type: String, enum: ["Easy", "Moderate", "Complex"], required: true }
      }
    ],
    startTime: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false }, // For frontend compatibility
    completedAt: { type: Date },
    responses: [{ type: Number }], // Array of selected option indices
    reasonings: [{ type: String }], // Array of reasoning for each response
    results: { type: Object } // Results object with scores and analysis
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PsychometricTest = mongoose.models.PsychometricTest || mongoose.model("PsychometricTest", PsychometricTestSchema);

module.exports = PsychometricTest;
