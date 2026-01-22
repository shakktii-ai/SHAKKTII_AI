// import User from "../../../models/User";
// import connectDb from "../../../middleware/db";

// async function handler(req, res) {
//   if (req.method !== "GET") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     // Get all users with permanent login tokens
//     const users = await User.find(
//       { permanentLoginToken: { $exists: true } },
//       "fullName email permanentLoginToken createdAt"
//     ).sort({ createdAt: -1 });

//     // Add login links to each user
//     const usersWithLinks = users.map((user) => ({
//       ...user._doc,
//       loginLink: `${process.env.NEXT_PUBLIC_HOST}/auth/${user.permanentLoginToken}`,
//     }));

//     return res.status(200).json({
//       success: true,
//       users: usersWithLinks,
//     });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// }

// export default connectDb(handler);


import User from "../../../models/User";
import connectDb from "../../../middleware/db";
import jwt from "jsonwebtoken";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    /* =========================
       1️⃣ VERIFY ADMIN TOKEN
    ========================== */
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "jwtsecret");
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    /* =========================
       2️⃣ COLLAGE NAME (SOURCE OF TRUTH)
       👉 from token, NOT query
    ========================== */
    const collageName = decoded.collageName;

    if (!collageName) {
      return res.status(400).json({
        success: false,
        message: "Collage name missing in token",
      });
    }

    /* =========================
       3️⃣ FETCH ONLY THAT COLLAGE USERS
    ========================== */
    const users = await User.find(
      {
        permanentLoginToken: { $exists: true },
        collageName: collageName, // 🔥 MAIN FIX
      },
      "fullName email permanentLoginToken createdAt collageName"
    ).sort({ createdAt: -1 });

    /* =========================
       4️⃣ ADD LOGIN LINKS
    ========================== */
    const usersWithLinks = users.map((user) => ({
      ...user._doc,
      loginLink: `${process.env.NEXT_PUBLIC_HOST}/auth/${user.permanentLoginToken}`,
    }));

    return res.status(200).json({
      success: true,
      users: usersWithLinks,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export default connectDb(handler);
