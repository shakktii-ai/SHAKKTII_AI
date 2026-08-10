import mongoose from 'mongoose';

const userReadinessSchema = new mongoose.Schema({
  // CLEANER USER ID PATTERN:
  // Allows both ObjectId and custom string IDs while preserving indexing & refs
 userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  unique: true,
  index: true,
},

  progress: {
    // Single-test steps
    step1_profile: { type: Boolean, default: false },
    step2_resume: { type: Boolean, default: false },
    step3_decision: { type: Boolean, default: false },

    // Step 4: Soft Skills (4 Sub-tests)
    step4_softSkills: {
      reading: { type: Boolean, default: false },
      writing: { type: Boolean, default: false },
      speaking: { type: Boolean, default: false },
      listening: { type: Boolean, default: false },
      isCompleted: { type: Boolean, default: false }, // true when all 4 are true
    },

    // Step 5: Technical Skills (2 Sub-tests)
    step5_techSkills: {
      excelAssessment: { type: Boolean, default: false },
      technicalMcq: { type: Boolean, default: false },
      isCompleted: { type: Boolean, default: false }, // true when both are true
    },

    // Locked Final Steps
    step6_mockInterview: { type: Boolean, default: false },
    step7_readyToApply: { type: Boolean, default: false },
  },

  scores: {
    step1_profile: { type: Number, default: 0 },
    step2_resume: { type: Number, default: 0 },
    step3_decision: { type: Number, default: 0 },
    step4_softSkills: {
      reading: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
      speaking: { type: Number, default: 0 },
      listening: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    step5_techSkills: {
      excelAssessment: { type: Number, default: 0 },
      technicalMcq: { type: Number, default: 0 },
      overall: { type: Number, default: 0 },
    },
    step6_mockInterview: { type: Number, default: 0 },
    overallReadiness: { type: Number, default: 0 },
  },

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserReadiness ||
  mongoose.model('UserReadiness', userReadinessSchema);
