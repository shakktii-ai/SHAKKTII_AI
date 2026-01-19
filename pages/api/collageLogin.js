//page/api/collageLogin
import User from "../../models/CollageReg";
import connectDb from "../../middleware/dbConnect";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const handler = async (req, res) => {
    if (req.method === "POST") {
        try {
            let admin = await User.findOne({ email: req.body.email });

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: "No user found with this email. Please check your credentials."
                });
            }

            // Decrypt stored password
            const bytes = CryptoJS.AES.decrypt(admin.password, process.env.PASSWORD_SECRET || "secret123");
            const decryptedPass = bytes.toString(CryptoJS.enc.Utf8);

            // Validate password
            if (req.body.password !== decryptedPass) {
                return res.status(401).json({
                    success: false,
                    error: "Invalid Credentials. Please check your password."
                });
            }

            // Generate JWT token with user data
            const Admintoken = jwt.sign(
                {
                    id: admin._id,
                    email: admin.email,
                    collageName: admin.collageName,
                   
                    
                },
                process.env.JWT_SECRET || "jwtsecret",
                { expiresIn: "1h" }
            );

            // Send user data and token in response
            return res.status(200).json({
                success: true,
                Admintoken,
                user: {
                    id: admin._id,
                    email: admin.email,
                    collageName: admin.collageName,
                  
                  
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                error: "An error occurred on the server. Please try again later."
            });
        }
    } else {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
};

export default connectDb(handler);

