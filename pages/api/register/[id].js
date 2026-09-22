import connectDb from "../../../middleware/db";
import JobRegistration from "../../../models/JobRegistration";

async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: "Registration ID is required." });
  }

  // GET: Fetch single registration
  if (req.method === "GET") {
    try {
      const registration = await JobRegistration.findById(id).lean();
      if (!registration) {
        return res.status(404).json({
          success: false,
          message: "Job registration not found.",
        });
      }

      return res.status(200).json({
        success: true,
        registration,
      });
    } catch (error) {
      console.error("Error in GET /api/register/[id]:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch registration.",
        error: error.message,
      });
    }
  }

  // PUT / PATCH: Update registration (status, notes, or fields)
  if (req.method === "PUT" || req.method === "PATCH") {
    try {
      const allowedUpdates = [
        "fullName",
        "mobileNo",
        "districtTaluka",
        "gender",
        "highestEducation",
        "pastExperience",
        "pastWorkDetails",
        "preferredIndustries",
        "relocationPreference",
        "jobType",
        "hasAadhaar",
        "aadhaarNumber",
        "hasResume",
        "resumeUrl",
        "hasPracticedInterview",
        "interviewPracticeDetails",
        "status",
        "notes",
      ];

      const updates = {};
      for (const key of Object.keys(req.body)) {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid update fields provided.",
        });
      }

      const updatedRegistration = await JobRegistration.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedRegistration) {
        return res.status(404).json({
          success: false,
          message: "Job registration not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job registration updated successfully.",
        registration: updatedRegistration,
      });
    } catch (error) {
      console.error("Error in PUT/PATCH /api/register/[id]:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update registration.",
        error: error.message,
      });
    }
  }

  // DELETE: Delete registration
  if (req.method === "DELETE") {
    try {
      const deletedRegistration = await JobRegistration.findByIdAndDelete(id);
      if (!deletedRegistration) {
        return res.status(404).json({
          success: false,
          message: "Job registration not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job registration deleted successfully.",
      });
    } catch (error) {
      console.error("Error in DELETE /api/register/[id]:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete registration.",
        error: error.message,
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed. Use GET, PUT, PATCH, or DELETE.",
  });
}

export default connectDb(handler);
