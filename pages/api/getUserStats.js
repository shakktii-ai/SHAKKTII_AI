import mongoose from 'mongoose';
import User from '../../models/User';
import CryptoJS from 'crypto-js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed, only GET requests are accepted' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return just the interview statistics
    const stats = {
      no_of_interviews: user.no_of_interviews || 1,
      no_of_interviews_completed: user.no_of_interviews_completed || 0,
      email: user.email,
      fullName: user.fullName
    };

    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    return res.status(500).json({ error: 'An error occurred while fetching user statistics' });
  }
}

export default async function(req, res) {
  // Ensure MongoDB connection is established
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  
  // Call the main handler
  return handler(req, res);
}
