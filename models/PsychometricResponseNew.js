const mongoose = require('mongoose');

const PsychometricResponseNewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional
    userEmail: { type: String, required: true }, // Required
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "PsychometricTestNew" }, // Optional
    profileType: { type: String, enum: ["student", "employee"], default: "employee" },
    responses: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        reasoning: { type: String }
      }
    ],
    results: {
      overallScore: { type: Number },
      strengths: [{ type: String }],
      areasToImprove: [{ type: String }],
      analysis: { type: String },
      
      // Student-specific competencies
      academicCollaboration: { type: Object },
      learningEthics: { type: Object },
      educationalLeadership: { type: Object },
      studyGroupDynamics: { type: Object },
      academicConflictResolution: { type: Object },
      classroomParticipation: { type: Object },
      
      // Employee-specific competencies
      empathy: { type: Object },
      assertiveness: { type: Object },
      ethicalReasoning: { type: Object },
      collaboration: { type: Object },
      conflictResolution: { type: Object },
      leadershipPotential: { type: Object },
      
      // Recommendations
      recommendedLearningStyles: [{ type: String }],
      academicPathRecommendations: [{ type: String }],
      careerPathRecommendations: [{ type: String }],
      roleFitRecommendations: [{ type: String }],
      // Career suggestions with roles/exampleRoles
      careerSuggestions: [{ type: Object }],
      // Skills array [{ name, level, importance }]
      recommendedSkills: [{ type: Object }],
      // Next steps (simple strings array)
      nextSteps: [{ type: String }],
      skillsDevelopmentAdvice: { type: String },
      
      personalityProfile: { type: Object },
      isFallback: { type: Boolean, default: false }
    },
    completedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.PsychometricResponseNew || mongoose.model("PsychometricResponseNew", PsychometricResponseNewSchema);
