// import connectDb from '../../middleware/mongoose';
import User from '../../models/User';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  const { collageName } = req.query;



  if (req.method === 'GET') {
    try {
      // Fetch all users by companyName
      const users = await User.find({ collageName });

      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found for this company' });
      }

      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { email, updatedData = {} } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      Object.assign(user, updatedData);

      await user.save();

      res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
