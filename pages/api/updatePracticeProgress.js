import connectDb from "../../middleware/dbConnect";
import PracticeProgress from "../../models/PracticeProgress";
import PracticeResponse from "../../models/PracticeResponse";
import mongoose from "mongoose";
// Removed auth requirement

// Helper function to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id) {
  if (!id) return false;
  try {
    return mongoose.isValidObjectId(id);
  } catch (error) {
    return false;
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Update to handle both session-based updates and direct level completion
    const { skillArea, difficulty, sessionData, level, stars, completed, unlockNextLevel } = req.body;
    let userId = req.user?.id || req.body.userId || 'guest'; // From auth middleware or direct API call
    
    // Handle userId format - if it's not a valid ObjectId, use a consistent prefix
    if (!isValidObjectId(userId) && userId !== 'guest') {
      console.log(`Converting non-ObjectId userId: ${userId} to string format`);
      userId = `str_${userId}`; // Prefix with str_ to indicate it's a string ID
    }

    // Allow either sessionData-based updates OR direct level updates
    const isDirectLevelUpdate = skillArea && difficulty && (level !== undefined);
    const isSessionUpdate = skillArea && difficulty && sessionData;
    
    if (!isDirectLevelUpdate && !isSessionUpdate) {
      return res.status(400).json({ error: 'Missing required fields for either session update or direct level update' });
    }

    // Find existing progress record or create new one
    let progressRecord;
    
    // Use a query that works for both ObjectId and string userIds
    try {
      progressRecord = await PracticeProgress.findOne({
        userId,
        skillArea,
        difficulty
      });
    } catch (error) {
      console.error('Error finding progress record:', error.message);
      // If there was an error with the userId format, try with a string version
      if (error.name === 'CastError' && error.path === 'userId') {
        const stringUserId = `str_${userId}`;
        console.log(`Retrying with string userId: ${stringUserId}`);
        progressRecord = await PracticeProgress.findOne({
          userId: stringUserId,
          skillArea,
          difficulty
        });
      } else {
        throw error; // Re-throw if it's not a userId casting error
      }
    }

    if (!progressRecord) {
      progressRecord = new PracticeProgress({
        userId,
        skillArea,
        difficulty,
        sessionsCompleted: 0,
        questionsAttempted: 0,
        averageScore: 0,
        highestScore: 0,
        timeSpent: 0,
        strengths: [],
        areasToImprove: []
      });
    }

    // Update progress stats
    progressRecord.sessionsCompleted = (progressRecord.sessionsCompleted || 0) + 1;
    progressRecord.questionsAttempted = (progressRecord.questionsAttempted || 0) + (sessionData?.questionsAttempted || 0);
    progressRecord.timeSpent = (progressRecord.timeSpent || 0) + (sessionData?.timeSpent || 0);
    progressRecord.lastUpdated = new Date();

    // Calculate new average score
    const newSessionScore = sessionData?.sessionScore || 0;
    const previousSessions = Math.max(1, progressRecord.sessionsCompleted - 1);
    const totalScorePoints = ((progressRecord.averageScore || 0) * previousSessions) + newSessionScore;
    progressRecord.averageScore = totalScorePoints / progressRecord.sessionsCompleted;
    
    // Update highest score if needed
    if (newSessionScore > progressRecord.highestScore) {
      progressRecord.highestScore = newSessionScore;
    }
    
    // Handle level progression system - support both session-based and direct level updates
    const currentLevel = isDirectLevelUpdate ? level : (sessionData?.level || progressRecord?.currentLevel || 1);
    
    // Initialize levelProgress array if it doesn't exist
    if (!progressRecord.levelProgress) {
      progressRecord.levelProgress = [];
    }
    
    console.log(`Handling level ${currentLevel} for ${userId}, Difficulty: ${difficulty}`);
    
    // Find the current level's progress record or create it
    let levelProgressRecord = progressRecord.levelProgress.find(lp => lp.level === currentLevel);
    
    if (!levelProgressRecord) {
      levelProgressRecord = {
        level: currentLevel,
        stars: 0,
        questionsCompleted: 0,
        bestScore: 0,
        completed: false
      };
      progressRecord.levelProgress.push(levelProgressRecord);
    }
    
    // Handle different update scenarios - directly setting values or updating from session data
    if (isDirectLevelUpdate) {
      // For direct level updates (from evaluateDecisionScenario.js)
      console.log(`Direct level update: Level ${currentLevel}, Stars: ${stars}, Completed: ${completed}`);
      
      // Update stars if provided and better than current
      if (stars !== undefined && stars > levelProgressRecord.stars) {
        const additionalStars = stars - levelProgressRecord.stars;
        progressRecord.totalStarsEarned = (progressRecord.totalStarsEarned || 0) + additionalStars;
        levelProgressRecord.stars = stars;
      }
      
      // Mark as completed if specified
      if (completed) {
        levelProgressRecord.completed = true;
        levelProgressRecord.completedAt = new Date();
      }
      
      // Handle explicit next level unlocking
      if (unlockNextLevel && currentLevel < 10) {
        // Make sure the current level is completed
        levelProgressRecord.completed = true;
        levelProgressRecord.completedAt = levelProgressRecord.completedAt || new Date();
        
        const nextLevel = currentLevel + 1;
        console.log(`Explicitly unlocking next level: ${nextLevel}`);
        
        // Find or create the next level's progress record
        let nextLevelRecord = progressRecord.levelProgress.find(lp => lp.level === nextLevel);
        if (!nextLevelRecord) {
          nextLevelRecord = {
            level: nextLevel,
            stars: 0,
            questionsCompleted: 0,
            bestScore: 0,
            completed: false,
            locked: false // Explicitly unlock the next level
          };
          progressRecord.levelProgress.push(nextLevelRecord);
        } else {
          // Make sure it's not locked
          nextLevelRecord.locked = false;
        }
        
        // Update current level for progress tracking
        progressRecord.currentLevel = Math.max(progressRecord.currentLevel || 1, nextLevel);
      }
    } else {
      // Original session-based update logic
      levelProgressRecord.questionsCompleted += sessionData.questionsAttempted || 0;
      
      // Update best score if needed
      if (newSessionScore > levelProgressRecord.bestScore) {
        levelProgressRecord.bestScore = newSessionScore;
      }
      
      // Calculate stars based on score (example thresholds)
      let earnedStars = 0;
      if (newSessionScore >= 90) {
        earnedStars = 3; // 3 stars for 90% or above
      } else if (newSessionScore >= 70) {
        earnedStars = 2; // 2 stars for 70-89%
      } else if (newSessionScore >= 50) {
        earnedStars = 1; // 1 star for 50-69%
      }
      
      // Update stars if earned more than current
      if (earnedStars > levelProgressRecord.stars) {
        // Calculate additional stars earned
        const additionalStars = earnedStars - levelProgressRecord.stars;
        progressRecord.totalStarsEarned = (progressRecord.totalStarsEarned || 0) + additionalStars;
        levelProgressRecord.stars = earnedStars;
      }
      
      // Mark level as completed if earned at least 1 star and not already completed
      if (earnedStars > 0 && !levelProgressRecord.completed) {
        levelProgressRecord.completed = true;
        levelProgressRecord.completedAt = new Date();
        
        // Unlock the next level if it exists and we're not at the max level
        const nextLevel = currentLevel + 1;
        if (nextLevel <= 30) { // Assuming 30 is the max level
          let nextLevelRecord = progressRecord.levelProgress.find(lp => lp.level === nextLevel);
          
          if (!nextLevelRecord) {
            // Create the next level record if it doesn't exist
            nextLevelRecord = {
              level: nextLevel,
              locked: false,
              completed: false,
              stars: 0,
              bestScore: 0,
              questionsCompleted: 0,
              lastAttempted: null
            };
            progressRecord.levelProgress.push(nextLevelRecord);
          } else if (nextLevelRecord.locked) {
            // Just unlock it if it exists but is locked
            nextLevelRecord.locked = false;
          }
          
          console.log(`Unlocked level ${nextLevel} after completing level ${currentLevel}`);
        }
        
        // If this is the current level and it's completed, advance to next level if not at max
        if (currentLevel === progressRecord.currentLevel && progressRecord.currentLevel < 30) {
          progressRecord.currentLevel += 1;
        }
      }
    }

    // Analyze strengths and areas to improve based on user responses
    let analysis = null;
    
    // Only try to analyze responses if we have testIds
    if (sessionData?.testIds?.length > 0) {
      try {
        const responses = await PracticeResponse.find({
          userId,
          'testId': { $in: sessionData.testIds }
        }).sort({ createdAt: -1 }).limit(50);

        // Only analyze if we got responses
        if (responses.length > 0) {
          analysis = await analyzeResponses(responses, skillArea);
          
          if (analysis && analysis.strengths && analysis.areasToImprove) {
            // Keep only unique strengths and areas to improve (max 5 of each)
            const allStrengths = [...new Set([
              ...(progressRecord.strengths || []), 
              ...(analysis.strengths || [])
            ])].slice(0, 5);
            
            const allAreasToImprove = [...new Set([
              ...(progressRecord.areasToImprove || []), 
              ...(analysis.areasToImprove || [])
            ])].slice(0, 5);
            
            progressRecord.strengths = allStrengths;
            progressRecord.areasToImprove = allAreasToImprove;
          }
        }
      } catch (error) {
        console.error('Error analyzing responses:', error.message);
        // Continue without analysis if there's an error
      }
    }

    await progressRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Progress updated successfully',
      progress: progressRecord
    });
  } catch (error) {
    console.error('Error updating practice progress:', error);
    return res.status(500).json({ error: 'Server error processing progress update' });
  }
}

// Function to analyze responses using Claude API
async function analyzeResponses(responses, skillArea) {
  const url = 'https://api.anthropic.com/v1/messages';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  // Prepare the responses data for analysis
  const responsesData = responses.map(r => ({
    question: r.cardId,
    response: r.userResponse,
    score: r.score
  }));

  const prompt = `As a language assessment expert, please analyze the following ${skillArea} responses from a student:

${JSON.stringify(responsesData, null, 2)}

Based on these responses, identify:
1. 3-5 specific strengths this student demonstrates
2. 3-5 specific areas where the student could improve

Return your analysis in JSON format only, like this:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"]
}`;

  const payload = {
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.ok && responseData?.content?.[0]?.text) {
      // Extract the JSON from the response
      const jsonContent = responseData.content[0].text;
      const jsonMatch = jsonContent.match(/\{.*\}/s);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        return JSON.parse(jsonString);
      }
    }
    
    console.error('Claude API error or invalid format:', responseData);
    return {
      strengths: ["Good effort", "Active participation", "Consistent practice"],
      areasToImprove: ["Continue practicing", "Focus on more complex topics", "Review feedback"]
    };
  } catch (error) {
    console.error('Error calling Claude API for response analysis:', error);
    return null;
  }
}

export default connectDb(handler);
