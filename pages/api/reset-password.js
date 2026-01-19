import connectDb from "../../middleware/dbConnect";  // Your DB connection middleware
import User from "../../models/User";  // Your User model
import CryptoJS from "crypto-js";  // For encrypting the new password

const handler = async (req, res) => {
  if (req.method === "PUT") {
    const { token, password } = req.body;

    // Find the user by reset token
    const user = await User.findOne({ resetToken: token });
    if (!user) {
      return res.status(400).json({ error: "User not found or invalid token" });
    }

    // Check if the token has expired
    if (new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ error: "Token has expired" });
    }

    // Encrypt the new password
    const encryptedPassword = CryptoJS.AES.encrypt(password, "secret123").toString();

    try {
      // Update the user's password and remove resetToken & resetTokenExpiry
      await User.findByIdAndUpdate(
        user._id,
        {
          password: encryptedPassword,
          resetToken: undefined,
          resetTokenExpiry: undefined
        }
      );

      return res.status(200).json({ success: "Password reset successfully!" });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ error: "Error resetting password" });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default connectDb(handler);