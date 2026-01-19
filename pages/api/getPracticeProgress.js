import connectDb from "../../middleware/dbConnectt";
import PracticeProgress from "../../models/PracticeProgress";
import PracticeResponse from "../../models/PracticeResponse";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';


const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function handler(req, res) {
  console.log('getPracticeProgress API called with query:', req.query);
  console.log('Environment:', process.env.NODE_ENV);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get userId from query
    let userId = req.query.userId;
    
    if (!userId) {
      console.error('No userId provided in query');
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    console.log('Fetching progress for user:', userId);
    
    /* AUTH TEMPORARILY DISABLED
    // Try to get userId from request query
    if (req.query.userId) {
      userId = req.query.userId;
    } 
    // Try to get from JWT token
    else {
      try {
        const token = req.headers.authorization?.split(' ')[1] || '';
        if (token) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
          userId = decoded.id;
        }
      } catch (tokenError) {
        console.log('Token verification failed, proceeding with default user');
        // Continue with demo user ID if token verification fails
      }
    }
    
    // If still no userId, use a default demo user ID
    if (!userId) {
      userId = '6462d8fbf6c3e30000000001'; // Default demo user ID
    }
    */
    
    const { skillArea } = req.query;

    // Create base query
    const query = { userId };
    
    // Add skillArea filter if provided
    if (skillArea && skillArea !== 'all') {
      query.skillArea = skillArea;
      console.log('Filtering by skillArea:', skillArea);
    } else {
      console.log('No skillArea filter applied');
    }
    
    console.log('Database query:', JSON.stringify(query, null, 2));

    // Fetch progress records
    const progressRecords = await PracticeProgress.find(query).sort({ lastUpdated: -1 });
    
    // Get recent responses for activity feed
    const recentResponses = await PracticeResponse.find({ userId })
      .sort({ completedAt: -1 })
      .limit(10);

    // Calculate overall stats
    const overallStats = {
      totalSessionsCompleted: 0,
      totalQuestionsAttempted: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      totalStarsEarned: 0,
      levelsCompleted: 0,
      skillBreakdown: {}
    };

    if (progressRecords.length > 0) {
      // Aggregate data
      progressRecords.forEach(record => {
        overallStats.totalSessionsCompleted += record.sessionsCompleted;
        overallStats.totalQuestionsAttempted += record.questionsAttempted;
        overallStats.totalTimeSpent += record.timeSpent;
        
        // Add level progression data to overall stats
        if (record.totalStarsEarned) {
          overallStats.totalStarsEarned += record.totalStarsEarned;
        }
        
        // Count completed levels
        if (record.levelProgress && Array.isArray(record.levelProgress)) {
          const completedLevels = record.levelProgress.filter(level => level.completed);
          overallStats.levelsCompleted += completedLevels.length;
          
          // Add levels data to skill breakdown
          if (!overallStats.skillBreakdown[record.skillArea]) {
            overallStats.skillBreakdown[record.skillArea] = {
              sessionsCompleted: 0,
              averageScore: 0,
              totalSessions: 0,
              completedLevels: 0,
              starsEarned: 0,
              currentLevel: record.currentLevel || 1
            };
          } else if (record.currentLevel) {
            // Keep track of the highest level for each skill area
            overallStats.skillBreakdown[record.skillArea].currentLevel = 
              Math.max(overallStats.skillBreakdown[record.skillArea].currentLevel, record.currentLevel);
          }
          
          overallStats.skillBreakdown[record.skillArea].completedLevels += completedLevels.length;
          overallStats.skillBreakdown[record.skillArea].starsEarned += record.totalStarsEarned || 0;
        }
        
        // Add to skill breakdown
        if (!overallStats.skillBreakdown[record.skillArea]) {
          overallStats.skillBreakdown[record.skillArea] = {
            sessionsCompleted: 0,
            averageScore: 0,
            totalSessions: 0,
            completedLevels: 0,
            starsEarned: 0,
            currentLevel: record.currentLevel || 1
          };
        }
        
        overallStats.skillBreakdown[record.skillArea].sessionsCompleted += record.sessionsCompleted;
        overallStats.skillBreakdown[record.skillArea].totalSessions += 1;
        
        // Weighted average for each skill area
        const currentSkill = overallStats.skillBreakdown[record.skillArea];
        currentSkill.averageScore = 
          ((currentSkill.averageScore * (currentSkill.totalSessions - 1)) + record.averageScore) / 
          currentSkill.totalSessions;
      });
      
      // Calculate overall average score (weighted by sessions)
      const totalScorePoints = progressRecords.reduce((sum, record) => {
        return sum + (record.averageScore * record.sessionsCompleted);
      }, 0);
      
      overallStats.averageScore = totalScorePoints / overallStats.totalSessionsCompleted || 0;
    }

    // Format time spent for display
    overallStats.formattedTimeSpent = formatTimeSpent(overallStats.totalTimeSpent);
    
    progressRecords.forEach(record => {
      record._doc.formattedTimeSpent = formatTimeSpent(record.timeSpent);
      
      // Generate complete level progression map for the frontend
      record._doc.levelProgressMap = generateLevelProgressionMap(
        record.difficulty, 
        record.levelProgress || [], 
        record.currentLevel || 1
      );
    });
    
    // Generate skill-based level maps for the frontend
    const levelMaps = {};
    Object.keys(overallStats.skillBreakdown).forEach(skill => {
      const skillData = {};
      ['Beginner', 'Moderate', 'Expert'].forEach(difficulty => {
        const progressRecord = progressRecords.find(r => 
          r.skillArea === skill && r.difficulty === difficulty
        );
        
        if (progressRecord) {
          skillData[difficulty] = {
            currentLevel: progressRecord.currentLevel || 1,
            totalStarsEarned: progressRecord.totalStarsEarned || 0,
            levelProgressMap: generateLevelProgressionMap(
              difficulty,
              progressRecord.levelProgress || [],
              progressRecord.currentLevel || 1
            )
          };
        } else {
          // Create default data if no progress record exists
          skillData[difficulty] = {
            currentLevel: 1,
            totalStarsEarned: 0,
            levelProgressMap: generateLevelProgressionMap(difficulty, [], 1)
          };
        }
      });
      
      levelMaps[skill] = skillData;
    });

    return res.status(200).json({
      success: true,
      progress: progressRecords,
      recentActivity: recentResponses,
      overallStats,
      levelMaps
    });
  } catch (error) {
    console.error('Error fetching practice progress:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Return more detailed error information in development
    const errorResponse = process.env.NODE_ENV === 'production'
      ? { error: 'Server error retrieving progress data' }
      : { 
          error: 'Server error retrieving progress data',
          message: error.message,
          stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
          code: error.code
        };
        
    return res.status(500).json(errorResponse);
  }
}

// Helper function to format time spent
function formatTimeSpent(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

// Helper function to generate a complete level progression map
function generateLevelProgressionMap(difficulty, levelProgress, currentLevel) {
  // Create a map of all 30 levels with their status
  const allLevels = [];
  
  for (let i = 1; i <= 30; i++) {
    // Find if we have progress data for this level
    const levelData = levelProgress.find(lp => lp.level === i);
    
    // Determine status
    let status = 'locked';
    if (i < currentLevel) {
      status = 'completed';
    } else if (i === currentLevel) {
      status = 'current';
    } else if (i === currentLevel + 1) {
      status = 'unlocked';
    }
    
    // Create the level object
    allLevels.push({
      level: i,
      difficulty,
      status,
      stars: levelData ? levelData.stars : 0,
      bestScore: levelData ? levelData.bestScore : 0,
      questionsCompleted: levelData ? levelData.questionsCompleted : 0,
      completed: levelData ? levelData.completed : false,
      completedAt: levelData ? levelData.completedAt : null,
      requirements: generateLevelRequirements(difficulty, i)
    });
  }
  
  return allLevels;
}

// Helper function to generate level requirements based on difficulty and level number
function generateLevelRequirements(difficulty, levelNumber) {
  // Base requirements that increase with level
  const baseQuestions = 5 + Math.floor(levelNumber / 5);
  const baseScore = 50 + levelNumber * 1.5; // Up to 95% for level 30
  
  // Adjust based on difficulty
  let multiplier = 1.0;
  if (difficulty === 'Moderate') {
    multiplier = 1.2;
  } else if (difficulty === 'Expert') {
    multiplier = 1.5;
  }
  
  return {
    minQuestions: Math.round(baseQuestions * multiplier),
    scoreThresholds: {
      oneStar: Math.min(50, Math.round(baseScore * 0.6)), // Min 50% for one star
      twoStars: Math.min(70, Math.round(baseScore * 0.8)), // Min 70% for two stars
      threeStars: Math.min(90, Math.round(baseScore)) // Min 90% for three stars
    },
    description: `Complete ${Math.round(baseQuestions * multiplier)} questions with at least ${Math.min(50, Math.round(baseScore * 0.6))}% accuracy to earn 1 star.`
  };
}

// Apply the database connection middleware
export default connectDb(handler);

export { config };
