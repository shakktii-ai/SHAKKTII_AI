import PracticeProgress from "../../models/PracticeProgress";
import PracticeResponse from "../../models/PracticeResponse";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectDb from '../../middleware/dbConnect';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

// OpenAI GPT API integration function
const evaluateWithGPT = async (responses, skillArea, difficulty, level) => {
  try {
    console.log('Evaluating responses with GPT:', { responsesCount: responses.length, skillArea, difficulty, level });
    // Prepare the data to send to Claude
    const responseData = responses.map(r => ({
      questionId: r.cardId,
      question: r.question,
      expectedResponse: r.expectedResponse,
      userResponse: r.userResponse,
      timeSpent: r.timeSpent,
      responseDate: r.completedAt
    }));

    // Create a prompt for Claude to evaluate the responses
    const prompt = `
      You are evaluating a user's responses for a language learning exercise.

Skill Area: ${skillArea}  
Difficulty Level: ${difficulty}  
Level Number: ${level}  

Here are the user's responses:  
${JSON.stringify(responseData, null, 2)}

Please evaluate the overall performance and assign a star rating from 0 to 3 stars. Be sure to **adjust your expectations based on the level**:

- 0 stars: Poor performance — many significant errors or incomplete responses, even considering the level.
- 1 star: Basic performance — several errors, but shows some understanding appropriate to the level.
- 2 stars: Good performance — mostly correct with minor errors; meets most expectations for this level.
- 3 stars: Excellent performance — few or no errors **based on what is expected at this level**. Even if the response is simple, it deserves full credit if it's accurate and appropriate.

✅ Do not penalize for simplicity at lower levels. If a response is correct and aligns with the expected learning outcomes of the level, award 3 stars.

Provide specific, constructive feedback in 2–3 sentences about the user’s performance.

Return your evaluation as a JSON object in the following format:

{
  "overallRating": (number from 0–3),
  "feedback": "(your specific feedback for the user)",
  "completed": true
}

    `;

    // Check if API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return { 
        overallRating: 1, 
        feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
        completed: true 
      };
    }

    // Call OpenAI GPT API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 300,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "You are an expert language learning evaluator. You analyze student responses and provide constructive feedback and fair ratings. Always return valid JSON."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', errorText);
        return { 
          overallRating: 1, 
          feedback: "Thank you for your responses. More practice is needed to improve your skills.", 
          completed: true 
        };
      }

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
        console.error('Unexpected OpenAI API response structure:', JSON.stringify(result));
        return { 
          overallRating: 1, 
          feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
          completed: true 
        };
      }

      const textResponse = result.choices[0].message.content;
      
      // Extract JSON object from the response
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('Could not find valid JSON object in Claude response');
        return { 
          overallRating: 1, 
          feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
          completed: true 
        };
      }

      try {
        const evaluation = JSON.parse(jsonMatch[0]);
        
        // Validate the evaluation format
        if (typeof evaluation.overallRating !== 'number' || typeof evaluation.feedback !== 'string') {
          console.error('Invalid evaluation format from GPT');
          return { 
            overallRating: 1, 
            feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
            completed: true 
          };
        }
        
        // Make sure overall rating is a valid value
        evaluation.overallRating = Math.max(0, Math.min(3, Math.round(evaluation.overallRating)));
        
        // Add completed property if missing
        if (evaluation.completed === undefined) {
          evaluation.completed = true;
        }
        
        console.log('GPT evaluation:', evaluation);
        return evaluation;
      } catch (parseError) {
        console.error('Error parsing GPT response as JSON:', parseError);
        return { 
          overallRating: 1, 
          feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
          completed: true 
        };
      }
    } catch (fetchError) {
      console.error('Error fetching from OpenAI API:', fetchError);
      return { 
        overallRating: 1, 
        feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
        completed: true 
      };
    }
  } catch (error) {
    console.error('Error in evaluateWithGPT:', error);
    return { 
      overallRating: 1, 
      feedback: "Thank you for your responses. Keep practicing to improve your skills.", 
      completed: true 
    };
  }
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Get token from request header (but don't fail if no token)
  const token = req.headers.authorization?.split(' ')[1];
  
  const { userId, skillArea, difficulty, level, responses } = req.body;
  
  if (!responses || !Array.isArray(responses) || responses.length === 0) {
    return res.status(400).json({ success: false, error: 'No responses provided' });
  }
  
  try {
    // Try to decode token if present, use userId from body if not
    let verifiedUserId = userId;
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
        // Use token userId if it exists and no userId was provided in the body
        if (decoded.id && !userId) {
          verifiedUserId = decoded.id;
        }
      }
      
      // Fallback to default user ID if both checks fail
      if (!verifiedUserId) {
        verifiedUserId = '6462d8fbf6c3e30000000001';
      }
    } catch (tokenError) {
      console.log('Token verification failed, using provided userId or default');
      // Continue with the userId from the body or the default
      verifiedUserId = userId || '6462d8fbf6c3e30000000001';
    }

    // Use GPT API to evaluate the responses when we have them
    const evaluation = await evaluateWithGPT(responses, skillArea, difficulty, level);
    
    // Find or create progress record for this user, skill area, and difficulty
    let progressRecord;
    try {
      progressRecord = await PracticeProgress.findOne({
        userId: mongoose.Types.ObjectId.isValid(verifiedUserId) ? verifiedUserId : '6462d8fbf6c3e30000000001',
        skillArea,
        difficulty
      });
      
      if (!progressRecord) {
        console.log('Creating new progress record');
        // Initialize with only level 1 unlocked
        const initialLevelProgress = Array.from({ length: 30 }, (_, i) => ({
          level: i + 1,
          stars: 0,
          completed: i === 0, // Only first level is available by default
          questionsCompleted: 0
        }));
        
        // Create new progress record if it doesn't exist
        progressRecord = new PracticeProgress({
          userId: mongoose.Types.ObjectId.isValid(verifiedUserId) ? verifiedUserId : '6462d8fbf6c3e30000000001',
          skillArea,
          difficulty,
          levelProgress: initialLevelProgress,
          currentLevel: 1
        });
      } else {
        console.log('Found existing progress record');
      }
      
      // Initialize levelProgress if it doesn't exist
      if (!progressRecord.levelProgress) {
        progressRecord.levelProgress = Array.from({ length: 30 }, (_, i) => ({
          level: i + 1,
          stars: 0,
          completed: i === 0,
          questionsCompleted: 0
        }));
      }
      
      // Parse level as integer
      const levelNum = parseInt(level, 10);
      if (isNaN(levelNum)) {
        throw new Error('Level must be a valid number');
      }
      
      // Check if level already exists in levelProgress
      const levelIndex = progressRecord.levelProgress?.findIndex(lp => lp.level === levelNum);
      
      if (levelIndex > -1) {
        // Calculate the average star rating from the responses directly
        const responseStars = responses.map(r => r.score || 0);
        const averageStars = responseStars.length > 0 ? 
          responseStars.reduce((sum, score) => sum + score, 0) / responseStars.length : 0;
        
        // Round to nearest whole star (1, 2, or 3)
        const roundedStars = Math.round(averageStars);
        
        console.log('Response stars:', responseStars);
        console.log('Average stars:', averageStars);
        console.log('Rounded stars:', roundedStars);
        
        // Use the calculated stars consistently
        const calculatedStars = roundedStars;
        
        // Update existing level progress
        progressRecord.levelProgress[levelIndex] = {
          ...progressRecord.levelProgress[levelIndex],
          level: levelNum, // Explicitly set level to ensure it's present
          stars: calculatedStars,
          completed: true,
          questionsCompleted: responses.length,
          completedAt: new Date()
        };
        
        // Unlock only the next level when a level is completed
        if (levelNum < 30) {
          const nextLevelIndex = progressRecord.levelProgress.findIndex(p => p.level === levelNum + 1);
          if (nextLevelIndex > -1) {
            // Unlock only the next level - ensure level field is always included (required by schema)
            progressRecord.levelProgress[nextLevelIndex] = {
              ...progressRecord.levelProgress[nextLevelIndex],
              level: levelNum + 1, // Explicitly set the level field to avoid validation errors
              completed: true,  // Mark as available
              locked: false     // Ensure it's not locked
            };
          }
        }
      } else {
        // Add new level progress
        progressRecord.levelProgress.push({
          level: levelNum,
          stars: evaluation.overallRating,
          completed: true,
          questionsCompleted: responses.length,
          completedAt: new Date()
        });
      }
      
      // Update total stars earned
      let totalStarsEarned = 0;
      if (progressRecord.levelProgress && Array.isArray(progressRecord.levelProgress)) {
        progressRecord.levelProgress.forEach(lp => {
          totalStarsEarned += (lp.stars || 0);
        });
        progressRecord.totalStarsEarned = totalStarsEarned;
      }
      
      // Update current level if this level is completed successfully
      if (evaluation.completed && progressRecord.currentLevel <= levelNum) {
        // Only advance to next level if current level is completed
        progressRecord.currentLevel = levelNum + 1;
        // Cap at max level (30)
        if (progressRecord.currentLevel > 30) {
          progressRecord.currentLevel = 30;
        }
      }
      
      // Save progress record after updating
      await progressRecord.save();
      
      // Get the calculated stars from the level progress for consistent UI display
      const levelObj = progressRecord.levelProgress.find(lp => lp.level === levelNum);
      const calculatedStars = levelObj?.stars || 1;
      
      // Prepare response with consistent star rating
      return res.status(200).json({
        success: true, 
        evaluation: {
          ...evaluation,
          overallRating: calculatedStars // Override with calculated stars for UI consistency
        },
        levelProgress: {
          level: levelNum,
          stars: calculatedStars, // Use the same calculated stars
          completed: true
        },
        nextLevel: levelNum + 1 // Next level is current level + 1
      });
    } catch (progressError) {
      console.error('Error handling progress record:', progressError);
      return res.status(500).json({ success: false, error: 'Error processing level progress' });
    }
  } catch (error) {
    console.error("Error in evaluateLevelCompletion:", error);
    return res.status(500).json({ success: false, error: 'Server error processing level completion' });
  }
}

export default connectDb(handler);