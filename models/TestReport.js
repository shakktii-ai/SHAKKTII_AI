const mongoose = require('mongoose');

const testReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed to accept both ObjectId and string
    ref: 'User',
    required: false,
    index: true
  },
  userEmail: {
    type: String,
    required: false
  },
  testType: {
    type: String,
    required: true,
    default: 'personality'
  },
  responses: [{
    questionId: String,
    questionText: String,
    selectedOption: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  analysis: {
    summary: String,
    recommendations: [String],
    strengths: [String],
    areasForGrowth: [String],
    rawAnalysis: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.TestReport || mongoose.model('TestReport', testReportSchema);
