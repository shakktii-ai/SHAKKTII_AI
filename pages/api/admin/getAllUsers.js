import User from "../../../models/User";
import connectDb from "../../../middleware/db";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Get all users with permanent login tokens
    const users = await User.find(
      { permanentLoginToken: { $exists: true } },
      "fullName email permanentLoginToken createdAt"
    ).sort({ createdAt: -1 });

    // Add login links to each user
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
      error: error.message,
    });
  }
}

export default connectDb(handler);
