
import connectDb from '../../middleware/dbConnect';
import User from '../../models/User';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    // Check and establish database connection if needed
    if (!mongoose.connections[0].readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
    }

    const { collageName } = req.query; // Retrieve collageName from query params

    if (!collageName) {
        return res.status(400).json({ message: 'collage name is required' });
    }

    await connectDb();

    try {
        // Count the number of users in the 'User' collection with the given collageName
        const totalUsers = await User.countDocuments({ collageName });

        res.status(200).json({ totalUsers });  // Return the total number of users
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
