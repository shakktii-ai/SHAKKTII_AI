import connectDb from "../../../middleware/db";
import JobRegistration from "../../../models/JobRegistration";

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        fullName,
        mobileNo,
        districtTaluka,
        gender,
        highestEducation,
        pastExperience,
        pastWorkDetails = "",
        preferredIndustries,
        relocationPreference,
        jobType = "Full-time",
        hasAadhaar,
        aadhaarNumber = "",
        hasResume,
        resumeUrl = "",
        hasPracticedInterview,
        interviewPracticeDetails = "",
        source = "web_registration",
      } = req.body;

      // 1. Validate required fields
      if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        return res.status(400).json({
          success: false,
          field: "fullName",
          message: "Full Name is required.",
        });
      }

      const cleanMobile = (mobileNo || "").replace(/[^0-9]/g, "");
      if (!cleanMobile || cleanMobile.length !== 10) {
        return res.status(400).json({
          success: false,
          field: "mobileNo",
          message: "Please provide a valid 10-digit Mobile / WhatsApp number.",
        });
      }

      if (!districtTaluka || typeof districtTaluka !== "string" || !districtTaluka.trim()) {
        return res.status(400).json({
          success: false,
          field: "districtTaluka",
          message: "District / Taluka is required.",
        });
      }

      if (!gender || !["Male", "Female", "Other"].includes(gender)) {
        return res.status(400).json({
          success: false,
          field: "gender",
          message: "Please select a valid Gender (Male, Female, or Other).",
        });
      }

      if (!highestEducation || typeof highestEducation !== "string" || !highestEducation.trim()) {
        return res.status(400).json({
          success: false,
          field: "highestEducation",
          message: "Highest Education is required.",
        });
      }

      if (!pastExperience || typeof pastExperience !== "string" || !pastExperience.trim()) {
        return res.status(400).json({
          success: false,
          field: "pastExperience",
          message: "Work Experience selection is required.",
        });
      }

      if (!Array.isArray(preferredIndustries) || preferredIndustries.length === 0) {
        return res.status(400).json({
          success: false,
          field: "preferredIndustries",
          message: "Please select at least 1 preferred industry.",
        });
      }

      if (!relocationPreference || typeof relocationPreference !== "string" || !relocationPreference.trim()) {
        return res.status(400).json({
          success: false,
          field: "relocationPreference",
          message: "Where you want to work (Relocation Preference) is required.",
        });
      }

      if (!hasAadhaar || !["Yes", "No"].includes(hasAadhaar)) {
        return res.status(400).json({
          success: false,
          field: "hasAadhaar",
          message: "Aadhaar Card status (Yes/No) is required.",
        });
      }

      const cleanAadhaar = (aadhaarNumber || "").replace(/[^0-9]/g, "");
      if (hasAadhaar === "Yes" && cleanAadhaar && cleanAadhaar.length !== 12) {
        return res.status(400).json({
          success: false,
          field: "aadhaarNumber",
          message: "Please provide a valid 12-digit Aadhaar number.",
        });
      }

      if (!hasResume || !["Yes", "No"].includes(hasResume)) {
        return res.status(400).json({
          success: false,
          field: "hasResume",
          message: "Resume status (Yes/No) is required.",
        });
      }

      if (!hasPracticedInterview || !["Yes", "No"].includes(hasPracticedInterview)) {
        return res.status(400).json({
          success: false,
          field: "hasPracticedInterview",
          message: "Practiced interview status (Yes/No) is required.",
        });
      }

      // 2. Check if mobile number is already registered
      const existingRegistration = await JobRegistration.findOne({ mobileNo: cleanMobile });
      if (existingRegistration) {
        return res.status(409).json({
          success: false,
          field: "mobileNo",
          message: "This Mobile / WhatsApp number is already registered for Job Alerts. We will notify you when a job becomes available.",
        });
      }

      // 3. Create new Registration Document
      const newRegistration = new JobRegistration({
        fullName: fullName.trim(),
        mobileNo: cleanMobile,
        districtTaluka: districtTaluka.trim(),
        gender,
        highestEducation: highestEducation.trim(),
        pastExperience: pastExperience.trim(),
        pastWorkDetails: (pastWorkDetails || "").trim(),
        preferredIndustries,
        relocationPreference: relocationPreference.trim(),
        jobType: (jobType || "Full-time").trim(),
        hasAadhaar,
        aadhaarNumber: hasAadhaar === "Yes" ? cleanAadhaar : "",
        hasResume,
        resumeUrl: hasResume === "Yes" ? (resumeUrl || "").trim() : "",
        hasPracticedInterview,
        interviewPracticeDetails: hasPracticedInterview === "Yes" ? (interviewPracticeDetails || "").trim() : "",
        status: "New",
        source,
      });

      await newRegistration.save();

      return res.status(201).json({
        success: true,
        message: "Job registration submitted successfully!",
        data: {
          id: newRegistration._id,
          fullName: newRegistration.fullName,
          mobileNo: newRegistration.mobileNo,
          districtTaluka: newRegistration.districtTaluka,
          preferredIndustries: newRegistration.preferredIndustries,
          jobType: newRegistration.jobType,
          createdAt: newRegistration.createdAt,
        },
      });
    } catch (error) {
      console.error("Error in POST /api/register:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "This mobile number is already registered.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Server error occurred while processing registration.",
        error: error.message,
      });
    }
  }

  if (req.method === "GET") {
    try {
      const {
        search = "",
        districtTaluka = "",
        highestEducation = "",
        gender = "",
        status = "",
        industry = "",
        jobType = "",
        page = 1,
        limit = 50,
      } = req.query;

      const filter = {};

      if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        filter.$or = [
          { fullName: searchRegex },
          { mobileNo: searchRegex },
          { districtTaluka: searchRegex },
          { pastWorkDetails: searchRegex },
        ];
      }

      if (districtTaluka) {
        filter.districtTaluka = new RegExp(districtTaluka.trim(), "i");
      }

      if (highestEducation) {
        filter.highestEducation = highestEducation;
      }

      if (gender) {
        filter.gender = gender;
      }

      if (status) {
        filter.status = status;
      }

      if (industry) {
        filter.preferredIndustries = { $in: [industry] };
      }

      if (jobType) {
        filter.jobType = jobType;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [registrations, totalCount] = await Promise.all([
        JobRegistration.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        JobRegistration.countDocuments(filter),
      ]);

      return res.status(200).json({
        success: true,
        registrations,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
        },
      });
    } catch (error) {
      console.error("Error in GET /api/register:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve registrations.",
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use POST to register or GET to list.",
  });
}

export default connectDb(handler);
