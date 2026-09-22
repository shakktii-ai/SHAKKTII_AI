import mongoose from "mongoose";

const JobRegistrationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      index: true,
    },
    districtTaluka: {
      type: String,
      required: [true, "District / Taluka is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Other"],
    },
    highestEducation: {
      type: String,
      required: [true, "Highest education is required"],
      trim: true,
    },
    pastExperience: {
      type: String,
      required: [true, "Work experience is required"],
      trim: true,
    },
    pastWorkDetails: {
      type: String,
      default: "",
      trim: true,
    },
    preferredIndustries: {
      type: [String],
      required: [true, "At least one preferred industry is required"],
      default: [],
    },
    relocationPreference: {
      type: String,
      required: [true, "Relocation preference is required"],
      trim: true,
    },
    jobType: {
      type: String,
      default: "Full-time",
      trim: true,
    },
    hasAadhaar: {
      type: String,
      required: [true, "Aadhaar status is required"],
      enum: ["Yes", "No"],
    },
    aadhaarNumber: {
      type: String,
      default: "",
      trim: true,
    },
    hasResume: {
      type: String,
      required: [true, "Resume status is required"],
      enum: ["Yes", "No"],
    },
    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    hasPracticedInterview: {
      type: String,
      required: [true, "Interview practice status is required"],
      enum: ["Yes", "No"],
    },
    interviewPracticeDetails: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Shortlisted", "Placed", "Rejected"],
      default: "New",
      index: true,
    },
    source: {
      type: String,
      default: "web_registration",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.JobRegistration ||
  mongoose.model("JobRegistration", JobRegistrationSchema);
