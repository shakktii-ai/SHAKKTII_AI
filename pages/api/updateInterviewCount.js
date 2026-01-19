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

  const { email, action } = req.body;

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

    // Make sure fields are initialized
    if (user.no_of_interviews === undefined) {
      user.no_of_interviews = 1; // Start with at least 1 interview available
    }
    
    if (user.no_of_interviews_completed === undefined) {
      user.no_of_interviews_completed = 0;
    }
    
    // Update interview count based on action
    if (action === 'complete') {
      // Increment the completed interview count
      user.no_of_interviews_completed = user.no_of_interviews_completed + 1;
      
      // Save the updated user
      await user.save();
      
      return res.status(200).json({ 
        message: 'Interview completion recorded successfully',
        no_of_interviews: user.no_of_interviews,
        no_of_interviews_completed: user.no_of_interviews_completed
      });
    } else if (action === 'add') {
      // Increment the total interview count
      user.no_of_interviews = user.no_of_interviews + 1;
      
      // Save the updated user
      await user.save();
      
      return res.status(200).json({ 
        message: 'New interview added successfully',
        no_of_interviews: user.no_of_interviews,
        no_of_interviews_completed: user.no_of_interviews_completed
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "complete" or "add"' });
    }
  } catch (error) {
    console.error('Error updating interview count:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
