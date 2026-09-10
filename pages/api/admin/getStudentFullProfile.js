import User from "../../../models/User";
import Report from "../../../models/Report";
import AcademicTestResult from "../../../models/AcademicTestResult";
import TechnicalReport from "../../../models/TechnicalReport";
import PsychometricResponseNew from "../../../models/PsychometricResponseNew";
import OverallScore from "../../../models/OverallScore";
import connectDb from "../../../middleware/db";
import jwt from "jsonwebtoken";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "jwtsecret");
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Student email is required" });
    }

    /* 1. Fetch User Record */
    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    /* 2. Fetch All Assessments */
    const [mockInterviews, academicTests, technicalTests, psychometricData, overallScores] = await Promise.all([
      Report.find({ email }).sort({ createdAt: -1 }).lean().catch(() => []),
      AcademicTestResult.find({
        $or: [{ userId: email }, { userId: user._id.toString() }]
      }).sort({ completedAt: -1 }).lean().catch(() => []),
      TechnicalReport.find({ email }).sort({ createdAt: -1 }).lean().catch(() => []),
      PsychometricResponseNew.find({ userEmail: email }).sort({ completedAt: -1 }).lean().catch(() => []),
      OverallScore.find({ email }).sort({ createdAt: 1 }).lean().catch(() => []),
    ]);

    // Parse mock interview scores
    const parsedInterviews = mockInterviews.map(r => {
      let overall = 0;
      let technical = 0;
      let communication = 0;
      let decisionMaking = 0;
      let confidence = 0;
      let fluency = 0;

      if (r.reportAnalysis) {
        const text = r.reportAnalysis;
        const oMatch = text.match(/Overall(?:\s+Score)?:\s*\(?(\d+)(?:\/50|\/100|\/10)?\)?/i);
        if (oMatch) {
          let num = parseInt(oMatch[1], 10);
          if (num <= 10) overall = num * 10;
          else if (num <= 50) overall = num * 2;
          else overall = num;
        }

        const tMatch = text.match(/Technical Proficiency:\s*\(?(\d+)\/10\)?/i);
        if (tMatch) technical = parseInt(tMatch[1], 10);

        const cMatch = text.match(/Communication:\s*\(?(\d+)\/10\)?/i);
        if (cMatch) communication = parseInt(cMatch[1], 10);

        const dMatch = text.match(/Decision-Making:\s*\(?(\d+)\/10\)?/i);
        if (dMatch) decisionMaking = parseInt(dMatch[1], 10);

        const confMatch = text.match(/Confidence:\s*\(?(\d+)\/10\)?/i);
        if (confMatch) confidence = parseInt(confMatch[1], 10);

        const fMatch = text.match(/Language Fluency:\s*\(?(\d+)\/10\)?/i);
        if (fMatch) fluency = parseInt(fMatch[1], 10);
      }

      return {
        ...r,
        parsedScores: { overall, technical, communication, decisionMaking, confidence, fluency }
      };
    });

    return res.status(200).json({
      success: true,
      student: {
        _id: user._id,
        fullName: user.fullName || "Student",
        email: user.email,
        mobileNo: user.mobileNo || "N/A",
        education: user.education || "N/A",
        DOB: user.DOB || "N/A",
        address: user.address || "N/A",
        profileImg: user.profileImg || null,
        collageName: user.collageName,
        createdAt: user.createdAt,
        no_of_interviews: user.no_of_interviews || 2,
        no_of_interviews_completed: user.no_of_interviews_completed || mockInterviews.length
      },
      assessments: {
        mockInterviews: parsedInterviews,
        academicTests: academicTests,
        technicalTests: technicalTests,
        psychometric: psychometricData,
        scoreHistory: overallScores.map(s => ({
          date: new Date(s.createdAt).toLocaleDateString(),
          score: s.overallScore
        }))
      }
    });

  } catch (error) {
    console.error("Student profile API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching student profile",
      error: error.message
    });
  }
}

export default connectDb(handler);
