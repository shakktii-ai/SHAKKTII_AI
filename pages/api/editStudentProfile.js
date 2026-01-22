// // import connectDb from '../../middleware/mongoose';
// import User from '../../models/User';
// import mongoose from 'mongoose';

// export default async function handler(req, res) {
//   if (!mongoose.connections[0].readyState) {
//     await mongoose.connect(process.env.MONGODB_URI);
//   }

//   const { collageName } = req.query;



//   if (req.method === 'GET') {
//     try {
//       // Fetch all users by companyName
//       const users = await User.find({ collageName });

//       if (!users || users.length === 0) {
//         return res.status(404).json({ message: 'No users found for this company' });
//       }

//       res.status(200).json({ users });
//     } catch (error) {
//       res.status(500).json({ message: 'Server error' });
//     }
//   } else if (req.method === 'PUT') {
//     try {
//       const { email, updatedData = {} } = req.body;

//       if (!email) {
//         return res.status(400).json({ message: 'Email is required' });
//       }

//       const user = await User.findOne({ email });

//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }

//       Object.assign(user, updatedData);

//       await user.save();

//       res.status(200).json({ message: 'User updated successfully', user });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Server error' });
//     }
//   } else {
//     res.status(405).json({ message: 'Method Not Allowed' });
//   }
// }


import mongoose from "mongoose";
import User from "../../models/User";

export default async function handler(req, res) {
  try {
    /* ===============================
       1️⃣ MongoDB Connection
    =============================== */
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    /* ===============================
       2️⃣ GET → Fetch collage-wise students
       URL:
       /api/editStudentProfile?collageName=SPPU
    =============================== */
    if (req.method === "GET") {
      const { collageName } = req.query;

      if (!collageName) {
        return res.status(400).json({
          success: false,
          message: "collageName is required",
        });
      }

      const users = await User.find(
        { collageName },
        "fullName email DOB education mobileNo address profileImg createdAt"
      ).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        users,
      });
    }

    /* ===============================
       3️⃣ PUT → Update student profile
       Body:
       {
         email: "student@email.com",
         updatedData: {
           fullName,
           DOB,
           mobileNo,
           address,
           education,
           email
         }
       }
    =============================== */
    if (req.method === "PUT") {
      const { email, updatedData } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No update data provided",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update allowed fields only
      const allowedFields = [
        "fullName",
        "DOB",
        "mobileNo",
        "address",
        "education",
        "email",
      ];

      allowedFields.forEach((field) => {
        if (updatedData[field] !== undefined) {
          user[field] = updatedData[field];
        }
      });

      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user,
      });
    }

    /* ===============================
       4️⃣ Other methods not allowed
    =============================== */
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });

  } catch (error) {
    console.error("Edit Student Profile API Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
