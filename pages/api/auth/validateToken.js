import User from "../../../models/User";
import connectDb from "../../../middleware/db";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ success: false, message: "Token required" });
  }

  try {
    const user = await User.findOne({ permanentLoginToken: token });

    if (!user) {
      return res.status(404).json({ success: false, message: "Invalid link" });
    }

    // check profile completeness
    const isProfileFilled = Boolean(
      user.fullName && user.mobileNo && user.address && user.education
    );

    return res.status(200).json({
      success: true,
      isProfileFilled,
      user,
    });
  } catch (err) {
    console.error("ValidateToken Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default connectDb(handler);
