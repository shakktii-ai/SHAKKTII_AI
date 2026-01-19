// 
import User from "../../../models/User";
import connectDb from "../../../middleware/dbConnect";

const handler = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }

    const user = await User.findOne({ permanentLoginToken: token }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid token" });
    }

    // Check if profile is filled
    const profileComplete = !!(
      user.fullName &&
      user.email &&
      user.mobileNo &&
      user.address &&
      user.education &&
      user.collageName &&
      user.DOB &&
      user.password &&
      user. profileImg
    );

    res.status(200).json({
      success: true,
      user,
      profileComplete,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default connectDb(handler);