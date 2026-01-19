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

  const { email, updateAll } = req.body;

  try {
    let result;
    let updatedUsers = [];
    
    if (updateAll) {
      // Update all users in the database
      result = await User.updateMany(
        {}, // Empty filter to match all documents
        { 
          $set: { 
            no_of_interviews: 1,
            no_of_interviews_completed: 0
          }
        }
      );
      
      // Get all updated users
      const allUsers = await User.find({});
      updatedUsers = allUsers.map(user => ({
        email: user.email,
        fullName: user.fullName,
        no_of_interviews: user.no_of_interviews || 1,
        no_of_interviews_completed: user.no_of_interviews_completed || 0
      }));
      
      return res.status(200).json({ 
        success: true,
        message: `Updated ${result.modifiedCount} user records successfully`,
        updatedCount: result.modifiedCount,
        updatedUsers
      });
    } else {
      // Validate required fields for single user update
      if (!email) {
        return res.status(400).json({ error: 'Email is required for single user update' });
      }
      
      // Update a single user
      result = await User.updateOne(
        { email: email },
        { 
          $set: { 
            no_of_interviews: 1,
            no_of_interviews_completed: 0
          }
        },
        { upsert: false } // Don't create a new document if it doesn't exist
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get the updated user to return
      const updatedUser = await User.findOne({ email });
      
      return res.status(200).json({ 
        success: true,
        message: 'User fields updated successfully',
        user: {
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          no_of_interviews: updatedUser.no_of_interviews || 1,
          no_of_interviews_completed: updatedUser.no_of_interviews_completed || 0
        }
      });
    }
  } catch (error) {
    console.error('Error updating user fields:', error);
    return res.status(500).json({ error: 'Failed to update user fields' });
  }
}
