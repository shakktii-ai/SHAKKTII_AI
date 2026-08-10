import User from "../../models/User";
import connectDb from "../../middleware/db";
import multer from "multer";
import cloudinary from "../../lib/cloudinary";

// Disable default body parser so multer can handle multipart form-data (files)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Setup Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper to run express middleware (multer) in Next.js API routes
const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only PUT requests are supported.",
    });
  }

  try {
    // Run multer to parse form data and file buffer
    await runMiddleware(req, res, upload.single("profileImg"));

    const { email, ...updateFields } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for updating profile",
      });
    }

    // Upload new profile image to Cloudinary if a file was provided
    if (req.file) {
      const publicId = `user_profiles/${email.replace(/[@.]/g, "_")}`;
      updateFields.profileImg = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { public_id: publicId, folder: "user_profiles", overwrite: true },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    // Update user in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
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