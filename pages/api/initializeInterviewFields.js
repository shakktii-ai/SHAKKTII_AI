import mongoose from 'mongoose';
import User from '../../models/User';

export default async function handler(req, res) {
  // Ensure the connection to MongoDB is active
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  // Validate required fields
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize interview tracking fields if they don't exist
    let updated = false;
    
    if (user.no_of_interviews === undefined) {
      user.no_of_interviews = 1; // Default to 1 available interview
      updated = true;
    }
    
    if (user.no_of_interviews_completed === undefined) {
      user.no_of_interviews_completed = 0; // Default to 0 completed interviews
      updated = true;
    }
    
    if (updated) {
      // Save the updated user
      await user.save();
    }
    
    return res.status(200).json({ 
      success: true,
      message: updated ? 'Interview fields initialized successfully' : 'Fields already initialized',
      user: {
        email: user.email,
        fullName: user.fullName,
        no_of_interviews: user.no_of_interviews,
        no_of_interviews_completed: user.no_of_interviews_completed
      }
    });
  } catch (error) {
    console.error('Error initializing interview fields:', error);
    return res.status(500).json({ error: 'Failed to initialize interview fields' });
  }
}
