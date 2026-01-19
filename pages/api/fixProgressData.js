import connectDb from "../../middleware/dbConnect";
import PracticeProgress from "../../models/PracticeProgress";
import PracticeResponse from "../../models/PracticeResponse";
import mongoose from 'mongoose';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, progressId } = req.body;
    
    if (!progressId) {
      return res.status(400).json({ error: 'Missing progressId' });
    }
    
    console.log(`Fixing progress record ${progressId}`);
    
    // Get the progress record
    const progressRecord = await PracticeProgress.findById(progressId);
    
    if (!progressRecord) {
      return res.status(404).json({ error: 'Progress record not found' });
    }
    
    // Get all practice responses for this user and skill area
    const responses = await PracticeResponse.find({ 
      userId: progressRecord.userId,
      // Match responses that likely belong to this progress record
      $or: [
        // If response has skillArea field matching
        { skillArea: progressRecord.skillArea },
        // Or if cardId contains text that matches this skill area
        { cardId: new RegExp(progressRecord.skillArea, 'i') }
      ]
    });
    
    console.log(`Found ${responses.length} responses for this user and skill area`);
    
    if (responses.length === 0) {
      // If no responses found, set default values
      progressRecord.sessionsCompleted = 1;
      progressRecord.questionsAttempted = 10;
      progressRecord.timeSpent = 300; // 5 minutes
      progressRecord.averageScore = 2; // Medium score
      progressRecord.lastUpdated = new Date();
    } else {
      // Update based on responses
      progressRecord.sessionsCompleted = responses.length;
      progressRecord.questionsAttempted = responses.length;
      
      // Calculate total time spent (default 60 seconds per response if missing)
      const totalTimeSpent = responses.reduce((total, response) => {
        return total + (response.timeSpent || 60);
      }, 0);
      progressRecord.timeSpent = totalTimeSpent;
      
      // Calculate average score
      const totalScore = responses.reduce((total, response) => {
        return total + (response.score || 1);
      }, 0);
      progressRecord.averageScore = totalScore / responses.length;
      
      // Find highest score
      const highestScore = Math.max(...responses.map(r => r.score || 0), 0);
      if (highestScore > progressRecord.highestScore) {
        progressRecord.highestScore = highestScore;
      }
      
      progressRecord.lastUpdated = new Date();
    }
    
    // Save the updated record
    await progressRecord.save();
    
    return res.status(200).json({
      success: true,
      message: 'Progress record fixed successfully',
      updatedRecord: progressRecord
    });
  } catch (error) {
    console.error('Error fixing progress record:', error);
    return res.status(500).json({ error: 'Server error fixing progress data' });
  }
}

export default connectDb(handler);
