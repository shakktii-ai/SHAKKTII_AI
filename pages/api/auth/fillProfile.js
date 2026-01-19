// // /pages/api/auth/fillProfile.js
// import User from "../../../models/User";
// import connectDb from "../../../middleware/db";
// import CryptoJS from "crypto-js";

// async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ success: false, message: "Method not allowed" });
//   }

//   try {
//     const {
//       token,
//       fullName,
//       email,
//       DOB,
//       address,
//       mobileNo,
//       education,
//       collageName,
//       password,
//       profileImg,
//     } = req.body;

//     if (!token) {
//       return res.status(400).json({ success: false, message: "Missing token" });
//     }

//     const user = await User.findOne({ permanentLoginToken: token });
//     if (!user) {
//       return res.status(404).json({ success: false, message: "Invalid token" });
//     }

//     // Update user info
//     if (fullName) user.fullName = fullName;
//     if (email) user.email = email;
//     if (DOB) user.DOB = DOB;
//     if (address) user.address = address;
//     if (mobileNo) user.mobileNo = mobileNo;
//     if (education) user.education = education;
//     if (collageName) user.collageName = collageName;
//     if (profileImg) user.profileImg = profileImg;

//     if (password) {
//       user.password = CryptoJS.AES.encrypt(password, process.env.SECRET_KEY).toString();
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: "Profile updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// }

// export default connectDb(handler); // ✅ important


import User from "../../../models/User";
import connectDb from "../../../middleware/db";
import CryptoJS from "crypto-js";
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    
    const user = await User.findOne({ permanentLoginToken: token });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { fullName, email, DOB, address, mobileNo, education, collageName,password, profileImg } = req.body;

   
    user.fullName = fullName;
    user.email = email;
    user.DOB = DOB;
    user.address = address;
    user.mobileNo = mobileNo;
    user.education = education;
    user.collageName = collageName;
    //  Encrypt password if updated
    if (password) {
      user.password = CryptoJS.AES.encrypt(password, process.env.ENCRYPT_SECRET || "secret123").toString();
    }
    user. profileImg= profileImg;
    
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export default connectDb(handler);