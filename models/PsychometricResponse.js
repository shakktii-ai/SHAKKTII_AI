const mongoose = require('mongoose');

// Define both result schemas to accommodate different profile types
const StudentResultsSchema = new mongoose.Schema(
  {
    academicCollaboration: { type: Number, min: 0, max: 3 },
    learningEthics: { type: Number, min: 0, max: 3 },
    educationalLeadership: { type: Number, min: 0, max: 3 },
    studyGroupDynamics: { type: Number, min: 0, max: 3 },
    academicConflictResolution: { type: Number, min: 0, max: 3 },
    classroomParticipation: { type: Number, min: 0, max: 3 },
    overallScore: { type: Number, min: 0, max: 3 },
    analysis: { type: String },
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    recommendedLearningStyles: [{ type: String }],
    academicPathRecommendations: [{ type: String }]
  },
  { _id: false }
);

const EmployeeResultsSchema = new mongoose.Schema(
  {
    workplaceDynamics: { type: Number, min: 0, max: 3 },
    professionalEthics: { type: Number, min: 0, max: 3 },
    managementPotential: { type: Number, min: 0, max: 3 },
    teamCollaboration: { type: Number, min: 0, max: 3 },
    conflictResolution: { type: Number, min: 0, max: 3 },
    professionalLeadership: { type: Number, min: 0, max: 3 },
    overallScore: { type: Number, min: 0, max: 3 },
    analysis: { type: String },
    strengths: [{ type: String }],
    areasToImprove: [{ type: String }],
    careerPathRecommendations: [{ type: String }],
    roleFitRecommendations: [{ type: String }]
  },
  { _id: false }
);

const PsychometricResponseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // No required field
    userEmail: { type: String, required: true }, // Make userEmail required instead
    testId: { type: mongoose.Schema.Types.ObjectId, ref: "PsychometricTest" }, // No required field
    profileType: { type: String, enum: ["student", "employee"], default: "employee" },
    responses: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true }, // Index of the selected option
        reasoning: { type: String } // Optional reasoning for the choice
      }
    ],
    // Use Mixed type to allow for different result structures based on profile type
    results: { type: mongoose.Schema.Types.Mixed },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create model or use existing one if available
const PsychometricResponse = mongoose.models.PsychometricResponse || mongoose.model("PsychometricResponse", PsychometricResponseSchema);

module.exports = PsychometricResponse;
