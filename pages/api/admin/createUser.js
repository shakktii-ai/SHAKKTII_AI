// /pages/api/admin/createUser.js
import User from "../../../models/User";
import connectDb from "../../../middleware/db";
import crypto from "crypto";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    let permanentLoginToken;
    let tokenExists = true;

    // Ensure unique permanentLoginToken
    while (tokenExists) {
      permanentLoginToken = crypto.randomBytes(32).toString("hex");
      const existingUser = await User.findOne({ permanentLoginToken });
      if (!existingUser) {
        tokenExists = false;
      }
    }

    // Generate placeholders for unique fields
    const placeholderEmail = `${permanentLoginToken}@placeholder.local`;
    const placeholderMobile = `000${Date.now()}`; // unique dummy mobile

    // Create a new user with defaults
    const user = new User({
      permanentLoginToken,
      email: placeholderEmail,
      mobileNo: placeholderMobile,
      no_of_interviews: 2,
      no_of_interviews_completed: 0,
    });

    await user.save();

    // Generate login link
    const uniqueLink = `${process.env.NEXT_PUBLIC_HOST}/auth/${permanentLoginToken}`;

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      loginLink: uniqueLink,
      userId: user._id,
      token: permanentLoginToken,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export default connectDb(handler);