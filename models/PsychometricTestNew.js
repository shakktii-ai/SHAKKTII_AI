const mongoose = require('mongoose');

const PsychometricTestNewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
    userEmail: { type: String, required: true }, // Required
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
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    responses: [{ type: Number }] // Array of selected option indices
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.PsychometricTestNew || mongoose.model("PsychometricTestNew", PsychometricTestNewSchema);
