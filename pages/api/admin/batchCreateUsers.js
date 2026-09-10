import User from "../../../models/User";
import connectDb from "../../../middleware/db";
import crypto from "crypto";
import jwt from "jsonwebtoken";

async function handler(req, res) {
  if (req.method !== "POST") {
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
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    const collageName = decoded.collageName;
    if (!collageName) {
      return res.status(400).json({ success: false, message: "College name missing in token" });
    }

    const { count = 5, interviewQuota = 2, batchLabel = "" } = req.body;
    const numToCreate = Math.min(Math.max(parseInt(count, 10) || 1, 1), 200); // max 200 in single batch

    const usersToInsert = [];
    const generatedLinks = [];
    const host = process.env.NEXT_PUBLIC_HOST || "https://mockmingle.in";

    for (let i = 0; i < numToCreate; i++) {
      const permanentLoginToken = crypto.randomBytes(32).toString("hex");
      const timestamp = Date.now() + i;
      const placeholderEmail = `${permanentLoginToken.slice(0, 16)}@placeholder.local`;
      const placeholderMobile = `000${timestamp}`;

      usersToInsert.push({
        permanentLoginToken,
        email: placeholderEmail,
        mobileNo: placeholderMobile,
        collageName: collageName,
        education: batchLabel || "",
        no_of_interviews: parseInt(interviewQuota, 10) || 2,
        no_of_interviews_completed: 0,
        fullName: "",
      });

      generatedLinks.push({
        token: permanentLoginToken,
        loginLink: `${host}/auth/${permanentLoginToken}`,
        email: placeholderEmail,
        collageName: collageName,
        interviewQuota: parseInt(interviewQuota, 10) || 2,
        createdAt: new Date(),
      });
    }

    // Insert all records in one atomic operation
    const createdUsers = await User.insertMany(usersToInsert);

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${createdUsers.length} student access links`,
      count: createdUsers.length,
      links: generatedLinks,
    });

  } catch (error) {
    console.error("Batch create users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating batch users",
      error: error.message
    });
  }
}

export default connectDb(handler);
