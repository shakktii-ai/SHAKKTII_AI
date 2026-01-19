import mongoose from 'mongoose';

// Schema for tracking level progress and stars
const LevelProgressSchema = new mongoose.Schema(
  {
    level: { type: Number, required: true, min: 1, max: 30 }, // Levels 1-30
    stars: { type: Number, required: true, min: 0, max: 3, default: 0 }, // 0-3 stars
    questionsCompleted: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 }, // Percentage score (0-100)
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: false }
);

const PracticeProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    skillArea: { type: String, required: true, enum: ["Speaking", "Listening", "Reading", "Writing", "Personality", "DecisionMaking"] },
    difficulty: { type: String, required: true, enum: ["Beginner", "Moderate", "Expert"] },
    // Overall progress metrics
    sessionsCompleted: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in seconds
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    
    // New level tracking system
    currentLevel: { type: Number, default: 1, min: 1, max: 30 },
    totalStarsEarned: { type: Number, default: 0 },
    levelProgress: [LevelProgressSchema], // Array of progress for each level
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PracticeProgress = mongoose.models.PracticeProgress || mongoose.model("PracticeProgress", PracticeProgressSchema);

export default PracticeProgress;
