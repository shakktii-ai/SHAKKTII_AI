import CollageReg from "../../../models/CollageReg";
import connectDb from "../../../middleware/db";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

async function handler(req, res) {
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

  const collegeId = decoded.id;
  const email = decoded.email;

  if (req.method === "GET") {
    try {
      const college = await CollageReg.findOne({
        $or: [{ _id: collegeId }, { email }]
      }).select("-password").lean();

      if (!college) {
        return res.status(404).json({ success: false, message: "College record not found" });
      }

      return res.status(200).json({
        success: true,
        college
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Failed to fetch college profile" });
    }
  }

  if (req.method === "PUT") {
    try {
      const {
        contactPersonName,
        contactNumber,
        designation,
        department,
        address,
        website,
        socialMediaLinks,
        currentPassword,
        newPassword
      } = req.body;

      const college = await CollageReg.findOne({
        $or: [{ _id: collegeId }, { email }]
      });

      if (!college) {
        return res.status(404).json({ success: false, message: "College record not found" });
      }

      // If user wants to change password
      if (newPassword && newPassword.trim() !== "") {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: "Current password is required to set a new password" });
        }

        const bytes = CryptoJS.AES.decrypt(college.password, process.env.PASSWORD_SECRET || "secret123");
        const decryptedPass = bytes.toString(CryptoJS.enc.Utf8);

        if (currentPassword !== decryptedPass) {
          return res.status(400).json({ success: false, message: "Current password does not match" });
        }

        const encryptedNew = CryptoJS.AES.encrypt(newPassword, process.env.PASSWORD_SECRET || "secret123").toString();
        college.password = encryptedNew;
      }

      // Update allowed profile fields
      if (contactPersonName) college.contactPersonName = contactPersonName;
      if (contactNumber) college.contactNumber = contactNumber;
      if (designation) college.designation = designation;
      if (department) college.department = department;
      if (address) college.address = address;
      if (website !== undefined) college.website = website;
      if (socialMediaLinks !== undefined) college.socialMediaLinks = socialMediaLinks;

      await college.save();

      return res.status(200).json({
        success: true,
        message: "Institution profile updated successfully",
        college: {
          collageName: college.collageName,
          email: college.email,
          contactPersonName: college.contactPersonName,
          contactNumber: college.contactNumber,
          designation: college.designation,
          department: college.department,
          address: college.address,
          website: college.website,
        }
      });

    } catch (err) {
      console.error("Update college profile error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: err.message
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}

export default connectDb(handler);
