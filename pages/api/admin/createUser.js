// // /pages/api/admin/createUser.js
// import User from "../../../models/User";
// import connectDb from "../../../middleware/db";
// import crypto from "crypto";

// async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res
//       .status(405)
//       .json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     let permanentLoginToken;
//     let tokenExists = true;

//     // Ensure unique permanentLoginToken
//     while (tokenExists) {
//       permanentLoginToken = crypto.randomBytes(32).toString("hex");
//       const existingUser = await User.findOne({ permanentLoginToken });
//       if (!existingUser) {
//         tokenExists = false;
//       }
//     }

//     // Generate placeholders for unique fields
//     const placeholderEmail = `${permanentLoginToken}@placeholder.local`;
//     const placeholderMobile = `000${Date.now()}`; // unique dummy mobile

//     // Create a new user with defaults
//     const user = new User({
//       permanentLoginToken,
//       email: placeholderEmail,
//       mobileNo: placeholderMobile,
//       no_of_interviews: 2,
//       no_of_interviews_completed: 0,
//     });

//     await user.save();

//     // Generate login link
//     const uniqueLink = `${process.env.NEXT_PUBLIC_HOST}/auth/${permanentLoginToken}`;

//     return res.status(200).json({
//       success: true,
//       message: "User created successfully",
//       loginLink: uniqueLink,
//       userId: user._id,
//       token: permanentLoginToken,
//     });
//   } catch (error) {
//     console.error("Error creating user:", error);
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
import crypto from "crypto";
import jwt from "jsonwebtoken";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
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

    let adminData;
    try {
      adminData = jwt.verify(token, process.env.JWT_SECRET || "jwtsecret");
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const collageName = adminData.collageName;

    if (!collageName) {
      return res.status(400).json({
        success: false,
        message: "Collage name missing in admin token",
      });
    }

    /* =========================
       2️⃣ CREATE UNIQUE TOKEN
    ========================== */
    let permanentLoginToken;
    let tokenExists = true;

    while (tokenExists) {
      permanentLoginToken = crypto.randomBytes(32).toString("hex");
      const existingUser = await User.findOne({ permanentLoginToken });
      if (!existingUser) tokenExists = false;
    }

    /* =========================
       3️⃣ PLACEHOLDER DATA
    ========================== */
    const placeholderEmail = `${permanentLoginToken}@placeholder.local`;
    const placeholderMobile = `000${Date.now()}`;

    /* =========================
       4️⃣ CREATE USER (AUTO COLLAGE)
    ========================== */
    const user = new User({
      permanentLoginToken,
      email: placeholderEmail,
      mobileNo: placeholderMobile,
      collageName, // 🔥 AUTO-FILLED HERE
      no_of_interviews: 2,
      no_of_interviews_completed: 0,
    });

    await user.save();

    /* =========================
       5️⃣ LOGIN LINK
    ========================== */
    const uniqueLink = `${process.env.NEXT_PUBLIC_HOST}/auth/${permanentLoginToken}`;

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      loginLink: uniqueLink,
      userId: user._id,
    });

  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export default connectDb(handler);
