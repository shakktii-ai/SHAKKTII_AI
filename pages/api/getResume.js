import connectDB from "../../middleware/dbConnectt";
import Resume from "../../models/Resume";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false });
    }

    try {
        await connectDB();

        const token = req.query.token;
        console.log("Token:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded:', decoded);
        const userId = decoded.id || decoded._id || decoded.userId;
        console.log('User Id', userId);
        const resume = await Resume.findOne({ userId }).sort({
            updatedAt: -1,
        });
        console.log('Resume:', resume);
        return res.status(200).json({
            success: true,
            data: resume,
        });
     } catch (error) {
  console.error("getResume error:", error);

  if (
    error.name === "TokenExpiredError" ||
    error.name === "JsonWebTokenError"
  ) {
    return res.status(401).json({
      success: false,
      error: "Your session has expired. Please log in again.",
    });
  }

  return res.status(500).json({
    success: false,
    error: "Something went wrong while loading your resume.",
  });
}
}