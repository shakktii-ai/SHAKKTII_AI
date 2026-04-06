import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  
  contact: {
    type: Object,
    default: {}
  },
  summary: {
    type: Object,
    default: {}
  },
  education: {
    type: Array,
    default: []
  },
  experience: {
    type: Array,
    default: []
  },
  projects: {
    type: Array,
    default: []
  },
  skills: {
    type: Object,
    default: {}
  },
  certificates: {
    type: Array,
    default: []
  },
  languages: {
    type: Array,
    default: []
  },
  saved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
