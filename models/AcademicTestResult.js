import mongoose from 'mongoose';

const academicTestResultSchema = new mongoose.Schema({
  testId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  stream: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  testFormat: {
    type: String,
    enum: ['MCQ', 'Written', 'Speaking'],
    default: 'MCQ'
  },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String,
    explanation: String
  }],
  answers: [{
    questionIndex: Number,
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    score: Number,
    feedback: String,
    explanation: String,
    improvementTips: [String],
    concepts: [String]
  }],
  correctCount: {
    type: Number,
    default: 0
  },
  incorrectCount: {
    type: Number,
    default: 0
  },
  incorrectQuestions: [{
    question: String,
    userAnswer: String,
    correctAnswer: String,
    explanation: String,
    improvementTips: [String],
    concept: String
  }],
  overallScore: {
    type: Number,
    required: true
  },
  stars: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  feedback: {
    type: String,
    default: ''
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  subjectMastery: {
    strengths: [String],
    improvements: [String],
    recommendations: [String]
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.AcademicTestResult || 
  mongoose.model('AcademicTestResult', academicTestResultSchema);
