import connectDb from "../../middleware/dbConnect";
import PracticeResponse from "../../models/PracticeResponse";
import PracticeProgress from "../../models/PracticeProgress";
import mongoose from 'mongoose';


export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required userId field' });
    }
    
    console.log(`Rebuilding practice progress for userId: ${userId}`);
    
    // Delete existing progress records for this user to rebuild fresh
    await PracticeProgress.deleteMany({ userId });
    
    // Fetch all practice responses for this user
    const responses = await PracticeResponse.find({ userId }).sort({ completedAt: 1 });
    
    console.log(`Found ${responses.length} responses to process`);
    
    // Process each response to rebuild progress
    let processedCount = 0;
    for (const response of responses) {
      // Extract data from response or use defaults
      const skillArea = response.skillArea || getSkillAreaFromCardId(response.cardId) || 'Listening';
      const difficulty = response.difficulty || getDifficultyFromCardId(response.cardId) || 'Beginner';
      const level = response.level || getLevelFromCardId(response.cardId) || 1;
      const score = response.score || 1;
      const timeSpent = response.timeSpent || 60;
      
      // Update progress for this response
      await updateProgressForResponse(
        userId,
        skillArea,
        difficulty,
        score,
        timeSpent,
        level
      );
      
      processedCount++;
    }
    
    return res.status(200).json({
      success: true,
      message: `Successfully rebuilt practice progress from ${processedCount} responses`,
      totalResponses: responses.length
    });
  } catch (error) {
    console.error('Error rebuilding practice progress:', error);
    return res.status(500).json({ error: 'Server error rebuilding progress data' });
  }
}

// Function to update practice progress for a single response
async function updateProgressForResponse(userId, skillArea, difficulty, score, timeSpent, level) {
  try {
    // Find existing progress record or create a new one
    let progressRecord = await PracticeProgress.findOne({
      userId,
      skillArea,
      difficulty
    });
    
    if (!progressRecord) {
      // Create a new progress record with default level progression
      progressRecord = new PracticeProgress({
        userId,
        skillArea,
        difficulty,
        sessionsCompleted: 0,
        questionsAttempted: 0,
        averageScore: 0,
        timeSpent: 0,
        currentLevel: 1,
        totalStarsEarned: 0,
        levelProgress: []
      });
    }
    
    // Ensure level progress exists for this level
    let levelProgress = progressRecord.levelProgress.find(lp => lp.level === parseInt(level));
    if (!levelProgress) {
      // Add this level to the progress
      progressRecord.levelProgress.push({
        level: parseInt(level),
        stars: 0,
        questionsCompleted: 0,
        completed: false
      });
    }
    
    // Update the level progress
    const levelProgressIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level));
    if (levelProgressIndex !== -1) {
      // Increment completed questions count
      progressRecord.levelProgress[levelProgressIndex].questionsCompleted++;
      
      // Update stars if new score is higher
      if (score > progressRecord.levelProgress[levelProgressIndex].stars) {
        // Calculate stars earned from previous score
        const prevStars = progressRecord.levelProgress[levelProgressIndex].stars || 0;
        const newStars = Math.min(3, score); // Max 3 stars
        
        // Add the difference to the total stars
        progressRecord.totalStarsEarned += (newStars - prevStars);
        
        // Update the stars for this level
        progressRecord.levelProgress[levelProgressIndex].stars = newStars;
      }
      
      // Mark as completed if 5 or more questions completed
      if (progressRecord.levelProgress[levelProgressIndex].questionsCompleted >= 5) {
        progressRecord.levelProgress[levelProgressIndex].completed = true;
        progressRecord.levelProgress[levelProgressIndex].completedAt = new Date();
        
        // Make all previous levels completed too
        for (let i = 1; i < parseInt(level); i++) {
          const prevLevelIndex = progressRecord.levelProgress.findIndex(lp => lp.level === i);
          if (prevLevelIndex === -1) {
            // Add the previous level as completed
            progressRecord.levelProgress.push({
              level: i,
              stars: 3, // Max stars for previous levels
              questionsCompleted: 5, // Mark as fully completed
              completed: true,
              completedAt: new Date()
            });
          } else if (!progressRecord.levelProgress[prevLevelIndex].completed) {
            progressRecord.levelProgress[prevLevelIndex].completed = true;
            progressRecord.levelProgress[prevLevelIndex].completedAt = new Date();
          }
        }
        
        // Add the next level if it doesn't exist
        if (parseInt(level) < 30) { // Maximum 30 levels
          const nextLevelIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level) + 1);
          if (nextLevelIndex === -1) {
            // Add the next level
            progressRecord.levelProgress.push({
              level: parseInt(level) + 1,
              stars: 0,
              questionsCompleted: 0,
              completed: false
            });
          }
        }
      }
    }
    
    // Update overall progress metrics
    progressRecord.sessionsCompleted++;
    progressRecord.questionsAttempted++;
    progressRecord.timeSpent += timeSpent;
    
    // Update average score (weighted average)
    const oldTotal = progressRecord.averageScore * (progressRecord.questionsAttempted - 1);
    progressRecord.averageScore = (oldTotal + score) / progressRecord.questionsAttempted;
    
    // Update highest score if needed
    if (score > progressRecord.highestScore) {
      progressRecord.highestScore = score;
    }
    
    // Update current level to highest completed level + 1
    const completedLevels = progressRecord.levelProgress
      .filter(lp => lp.completed)
      .map(lp => lp.level);
    
    if (completedLevels.length > 0) {
      const highestCompletedLevel = Math.max(...completedLevels);
      progressRecord.currentLevel = Math.min(30, highestCompletedLevel + 1);
    } else {
      progressRecord.currentLevel = 1;
    }
    
    // Update timestamp
    progressRecord.lastUpdated = new Date();
    
    // Save the updated progress
    await progressRecord.save();
  } catch (error) {
    console.error('Error updating progress for response:', error);
  }
}

// Helper function to determine skill area from card ID
// Implement logic based on your card ID naming convention
function getSkillAreaFromCardId(cardId) {
  if (!cardId) return 'Listening';
  
  const cardIdLower = cardId.toString().toLowerCase();
  if (cardIdLower.includes('speak')) return 'Speaking';
  if (cardIdLower.includes('listen')) return 'Listening';
  if (cardIdLower.includes('read')) return 'Reading';
  if (cardIdLower.includes('writ')) return 'Writing';
  if (cardIdLower.includes('person')) return 'Personality';
  
  // Default to Listening if unknown
  return 'Listening';
}

// Helper function to determine difficulty from card ID
function getDifficultyFromCardId(cardId) {
  if (!cardId) return 'Beginner';
  
  const cardIdLower = cardId.toString().toLowerCase();
  if (cardIdLower.includes('expert')) return 'Expert';
  if (cardIdLower.includes('moderate')) return 'Moderate';
  if (cardIdLower.includes('beginner')) return 'Beginner';
  
  // Default to Beginner if unknown
  return 'Beginner';
}

// Helper function to determine level from card ID
function getLevelFromCardId(cardId) {
  if (!cardId) return 1;
  
  // Try to extract level number from the card ID
  const levelMatch = cardId.toString().match(/level[_-]?(\d+)/i);
  if (levelMatch && levelMatch[1]) {
    return parseInt(levelMatch[1]);
  }
  
  // Default to level 1 if no level found
  return 1;
}

export default connectDb(handler);
