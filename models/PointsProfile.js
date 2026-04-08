// models/PointsProfile.js
import mongoose from 'mongoose';

const PointsLogSchema = new mongoose.Schema(
  {
    activity: { type: String, required: true }, // e.g. "mock_interview_completed"
    points: { type: Number, required: true },
    description: { type: String, default: '' },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const BadgeSchema = new mongoose.Schema(
  {
    badgeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['streak', 'level', 'top_percentile', 'track', 'special'], default: 'special' },
    awardedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const WeeklyModuleSchema = new mongoose.Schema(
  {
    moduleId: { type: String, required: true }, // e.g. "soft_skills_beginner"
    skillArea: { type: String, required: true }, // e.g. "Speaking"
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DailyGameSchema = new mongoose.Schema(
  {
    gameType: { type: String, required: true }, // e.g. "finance_quiz"
    completedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
  },
  { _id: false }
);

const InterviewScoreSchema = new mongoose.Schema(
  {
    jobRoleId: { type: String }, // jobRole name or ID
    score: { type: Number, required: true }, // overall score
    level: { type: String, default: 'Beginner' }, // Beginner, Intermediate, Advanced, Expert
    completedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PointsProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, unique: true, index: true },

    // Core metrics
    totalPoints: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 }, // resets weekly
    weekStartDate: { type: Date }, // tracks when current week started

    // Level info
    level: { type: Number, default: 1, min: 1, max: 6 },
    levelName: { type: String, default: 'Starter' },

    // Streak tracking
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date },
    streakRestoredAt: { type: Date },

    // Activity tracking for limits
    weeklyModuleCompletions: [WeeklyModuleSchema], // reset weekly
    dailyGameCompletions: [DailyGameSchema], // reset daily

    // Interview improvement tracking
    interviewScores: [InterviewScoreSchema],

    // Points event log (recent 200)
    pointsLog: [PointsLogSchema],

    // Badges & rewards
    badges: [BadgeSchema],
    bonusMockCredits: { type: Number, default: 0 },

    // Track-specific points
    trackPoints: {
      finance: { type: Number, default: 0 },
      consulting: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      hr: { type: Number, default: 0 },
      marketing: { type: Number, default: 0 },
      general: { type: Number, default: 0 },
    },

    // Last reward check timestamps
    lastTopRewardCheck: { type: Date },
  },
  { timestamps: true }
);

// Prevent model overwrite error during hot-reload
const PointsProfile =
  mongoose.models.PointsProfile ||
  mongoose.model('PointsProfile', PointsProfileSchema);

export default PointsProfile;
