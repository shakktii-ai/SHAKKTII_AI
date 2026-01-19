// import User from "../../models/User";
// import dbConnect from "../../middleware/dbConnect";
// import mongoose from "mongoose";
// import CryptoJS from "crypto-js";
// import multer from "multer";
// import cloudinary from "../../lib/cloudinary";

// // disable Next.js body parsing (so multer can work)
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // setup multer (memory storage, keeps file in buffer)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // helper to run multer inside Next.js API
// const runMiddleware = (req, res, fn) =>
//   new Promise((resolve, reject) => {
//     fn(req, res, (result) => {
//       if (result instanceof Error) return reject(result);
//       return resolve(result);
//     });
//   });

// // helper to upload to Cloudinary from buffer
// const uploadToCloudinary = (fileBuffer) =>
//   new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       { folder: "user_profiles" },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result.secure_url);
//       }
//     );
//     uploadStream.end(fileBuffer);
//   });

// const handler = async (req, res) => {
//   try {
//     await dbConnect();

//     if (req.method === "POST") {
//       // run multer to parse file
//       await runMiddleware(req, res, upload.single("profileImg"));

//       const {
//         fullName,
//         email,
//         password,
//         mobileNo,
//         address,
//         DOB,
//         education,
//         collageName,
//       } = req.body;

//       // ✅ upload profile image if exists
//       let profileImgUrl = "";
//       if (req.file) {
//         profileImgUrl = await uploadToCloudinary(req.file.buffer);
//       }

//       // Validate required fields
//       const requiredFields = {
//         fullName: "Full Name",
//         email: "Email Address",
//         password: "Password",
//         mobileNo: "Mobile Number",
//         education: "Education",
//         collageName: "College Name",
//       };

//       const missingFields = [];
//       for (const [field, label] of Object.entries(requiredFields)) {
//         if (!req.body[field]) missingFields.push(label);
//       }
//       if (missingFields.length > 0) {
//         return res.status(400).json({
//           success: false,
//           error: "Required fields missing",
//           missingFields,
//           message: `Please provide: ${missingFields.join(", ")}`,
//         });
//       }

//       // validate email
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(email)) {
//         return res.status(400).json({
//           success: false,
//           error: "Invalid email format",
//           field: "email",
//           message: "Please provide a valid email address",
//         });
//       }

//       // validate password
//       const passwordValidations = {
//         minLength: password.length >= 8,
//         hasUppercase: /[A-Z]/.test(password),
//         hasLowercase: /[a-z]/.test(password),
//         hasNumber: /[0-9]/.test(password),
//         hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
//       };
//       const criteriaCount = Object.values(passwordValidations).filter(Boolean)
//         .length;
//       if (criteriaCount < 3) {
//         return res.status(400).json({
//           success: false,
//           error: "Weak password",
//           field: "password",
//           message:
//             "Password must meet at least 3 of the following: 8+ chars, uppercase, lowercase, number, special char",
//           validations: passwordValidations,
//         });
//       }

//       // check if email exists
//       const existingUser = await User.findOne({ email });
//       if (existingUser) {
//         return res.status(409).json({
//           success: false,
//           error: "Email already registered",
//           field: "email",
//           message: "This email is already registered. Try login instead.",
//         });
//       }

//       // create new user
//       const userData = {
//         profileImg: profileImgUrl,
//         fullName,
//         email,
//         mobileNo,
//         address,
//         DOB,
//         education,
//         collageName,
//         password: CryptoJS.AES.encrypt(password, "secret123").toString(),
//         no_of_interviews: 1,
//         no_of_interviews_completed: 0,
//       };

//       const u = new User(userData);
//       await u.save();

//       return res
//         .status(200)
//         .json({ success: true, message: "Signup successful" });
//     }

//     // -------- PUT (update profile) --------
//     else if (req.method === "PUT") {
//   await runMiddleware(req, res, upload.single("profileImg"));

//   const { email, ...updateFields } = req.body;

//   if (!email) {
//     return res.status(400).json({
//       success: false,
//       message: "Email is required for updating profile",
//     });
//   }

//   // upload new profile image if provided, overwrite old image
//   if (req.file) {
//     const publicId = `user_profiles/${email.replace(/[@.]/g, "_")}`; // unique per user
//     updateFields.profileImg = await new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         { public_id: publicId, folder: "user_profiles", overwrite: true },
//         (error, result) => {
//           if (error) return reject(error);
//           resolve(result.secure_url);
//         }
//       );
//       uploadStream.end(req.file.buffer);
//     });
//   }

//   const updatedUser = await User.findOneAndUpdate(
//     { email },
//     { $set: updateFields },
//     { new: true }
//   ).select("-password");

//   if (!updatedUser) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   res.status(200).json({
//     success: true,
//     message: "Profile updated successfully",
//     user: updatedUser,
//   });
// }


//     // -------- other methods --------
//     else {
//       res.status(405).json({
//         success: false,
//         error: "Method not allowed",
//         message: "This endpoint supports only POST/PUT",
//       });
//     }
//   } catch (error) {
//     console.error("Error in signup handler:", error);

//     if (error.code === 11000) {
//       const field = Object.keys(error.keyPattern)[0];
//       return res.status(409).json({
//         success: false,
//         error: "Duplicate value",
//         field,
//         message: `This ${field} is already registered`,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Server error",
//       message: error.message,
//     });
//   }
// };

// export default handler;


import User from "../../models/User";
import connectDb from "../../middleware/db";
 import CryptoJS from "crypto-js";
async function handler (req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      permanentLoginToken,
      profileImg,
      fullName,
      email,
      DOB,
      password,
      mobileNo,
      address,
      education,
      collageName,
    } = req.body;

    let user;

    if (permanentLoginToken) {
      // 🔄 Update existing user created via admin
      user = await User.findOne({ permanentLoginToken });

      if (!user) {
        return res.status(404).json({ success: false, message: "Invalid signup link" });
      }

      // Update placeholder user with real data
      user.profileImg = profileImg || user.profileImg;
      user.fullName = fullName || user.fullName;
      user.email = email || user.email; // overwrite placeholder
      user.DOB = DOB || user.DOB;
       if (password) {
        user.password = CryptoJS.AES.encrypt(password, "secret123").toString();
      }
      user.mobileNo = mobileNo || user.mobileNo;
      user.address = address || user.address;
      user.education = education || user.education;
      user.collageName = collageName || user.collageName;

      await user.save();
    } else {
      // 🆕 Normal signup (no pre-created token)
      user = new User({
        profileImg,
        fullName,
        email,
        DOB,
        password: CryptoJS.AES.encrypt(password, "secret123").toString(),
        mobileNo,
        address,
        education,
        collageName,
           no_of_interviews: 0,
         no_of_interviews_completed: 0,
      });

      await user.save();
    }

    return res.status(200).json({ success: true, message: "Signup successful", user });
  } catch (error) {
    console.error("Error in signup:", error);
     if (error.code === 11000) {
    // Handle duplicate field
    const field = Object.keys(error.keyPattern)[0]; 
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use another one.`
    });
  }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export default connectDb(handler);
