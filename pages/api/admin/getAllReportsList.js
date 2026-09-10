import User from "../../../models/User";
import Report from "../../../models/Report";
import AcademicTestResult from "../../../models/AcademicTestResult";
import TechnicalReport from "../../../models/TechnicalReport";
import PsychometricResponseNew from "../../../models/PsychometricResponseNew";
import connectDb from "../../../middleware/db";
import jwt from "jsonwebtoken";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    /* 1. Verify Admin Token */
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

    const collageName = decoded.collageName;
    if (!collageName) {
      return res.status(400).json({ success: false, message: "College name missing" });
    }

    const { category = "all", search = "", page = 1, limit = 50 } = req.query;

    /* 2. Fetch College Students */
    const students = await User.find({ collageName }).select("email fullName mobileNo").lean();
    const studentEmails = students.map(s => s.email).filter(Boolean);
    const emailToStudentMap = {};
    students.forEach(s => {
      emailToStudentMap[s.email] = {
        name: s.fullName || s.email?.split("@")[0] || "Student",
        email: s.email,
        mobile: s.mobileNo || "N/A"
      };
    });

    const unifiedReports = [];

    /* 3. Query Based on Category */
    if (category === "all" || category === "interview") {
      const mockReports = await Report.find({
        $or: [{ collageName }, { email: { $in: studentEmails } }]
      }).sort({ createdAt: -1 }).limit(100).lean().catch(() => []);

      mockReports.forEach(r => {
        const studentInfo = emailToStudentMap[r.email] || { name: r.email || "Student", email: r.email };
        
        // Score extraction
        let score = "N/A";
        let scorePercent = 75;
        if (r.reportAnalysis) {
          const m = r.reportAnalysis.match(/Overall(?:\s+Score)?:\s*\(?(\d+)(?:\/50|\/100|\/10)?\)?/i);
          if (m) {
            let val = parseInt(m[1], 10);
            if (val <= 10) scorePercent = val * 10;
            else if (val <= 50) scorePercent = val * 2;
            else scorePercent = val;
            score = `${scorePercent}%`;
          }
        }

        unifiedReports.push({
          id: r._id,
          reportType: "AI Mock Interview",
          category: "interview",
          title: `${r.role || "General"} Interview`,
          subjectOrRole: r.role || "Job Interview",
          studentName: studentInfo.name,
          studentEmail: r.email,
          score: score,
          scorePercent: scorePercent,
          reportAnalysis: r.reportAnalysis,
          date: r.createdAt,
          rawReport: r
        });
      });
    }

    if (category === "all" || category === "academic") {
      const academicReports = await AcademicTestResult.find({
        $or: [{ userId: { $in: studentEmails } }, { userId: { $in: students.map(s => s._id.toString()) } }]
      }).sort({ createdAt: -1 }).limit(100).lean().catch(() => []);

      academicReports.forEach(r => {
        const studentInfo = emailToStudentMap[r.userId] || { name: r.userId || "Student", email: r.userId };
        const scorePercent = r.overallScore || 0;

        unifiedReports.push({
          id: r._id,
          reportType: "Academic Assessment",
          category: "academic",
          title: `${r.subject || "Subject"} (${r.stream || "Academic"})`,
          subjectOrRole: `${r.subject || "Academic"} - ${r.stream || ""}`,
          studentName: studentInfo.name,
          studentEmail: r.userId,
          score: `${scorePercent}%`,
          scorePercent: scorePercent,
          stars: r.stars || 0,
          date: r.completedAt || r.createdAt,
          rawReport: r
        });
      });
    }

    if (category === "all" || category === "technical") {
      const technicalReports = await TechnicalReport.find({
        $or: [{ collageName }, { email: { $in: studentEmails } }]
      }).sort({ createdAt: -1 }).limit(100).lean().catch(() => []);

      technicalReports.forEach(r => {
        const studentInfo = emailToStudentMap[r.email] || { name: r.email || "Student", email: r.email };
        const scorePercent = r.percentage || (r.score && r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0);

        unifiedReports.push({
          id: r._id,
          reportType: "Technical Test",
          category: "technical",
          title: `${r.subject || "Technical"} Assessment`,
          subjectOrRole: r.subject || "Technical Subject",
          studentName: studentInfo.name,
          studentEmail: r.email,
          score: `${scorePercent}%`,
          scorePercent: scorePercent,
          date: r.createdAt,
          rawReport: r
        });
      });
    }

    if (category === "all" || category === "psychometric") {
      const psychometricReports = await PsychometricResponseNew.find({
        userEmail: { $in: studentEmails }
      }).sort({ createdAt: -1 }).limit(100).lean().catch(() => []);

      psychometricReports.forEach(r => {
        const studentInfo = emailToStudentMap[r.userEmail] || { name: r.userEmail || "Student", email: r.userEmail };
        const scorePercent = r.results?.overallScore || 80;

        unifiedReports.push({
          id: r._id,
          reportType: "Psychometric Assessment",
          category: "psychometric",
          title: `Behavioral & Psychological Profile`,
          subjectOrRole: `Personality Profile`,
          studentName: studentInfo.name,
          studentEmail: r.userEmail,
          score: `${scorePercent}%`,
          scorePercent: scorePercent,
          date: r.completedAt || r.createdAt,
          rawReport: r
        });
      });
    }

    // Sort by Date Descending
    unifiedReports.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter by search query if present
    let filteredReports = unifiedReports;
    if (search && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      filteredReports = unifiedReports.filter(r => 
        (r.studentName && r.studentName.toLowerCase().includes(q)) ||
        (r.studentEmail && r.studentEmail.toLowerCase().includes(q)) ||
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.subjectOrRole && r.subjectOrRole.toLowerCase().includes(q))
      );
    }

    return res.status(200).json({
      success: true,
      totalCount: filteredReports.length,
      reports: filteredReports
    });

  } catch (error) {
    console.error("Error fetching all reports:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching reports",
      error: error.message
    });
  }
}

export default connectDb(handler);
