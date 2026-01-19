import connectDb from "../../middleware/dbConnect";
import PracticeResponse from "../../models/PracticeResponse";
import PracticeProgress from "../../models/PracticeProgress";
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Get token from request header (but don't fail if no token)
  const token = req.headers.authorization?.split(' ')[1];
  
  // Try to decode token if present, use a default user ID if not
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
      req.user = decoded;
    } catch (error) {
      console.log('Token verification failed, using default user ID');
      req.user = { id: '6462d8fbf6c3e30000000001' }; // Default user ID for testing
    }
  } else {
    // If no token provided, use a default user ID
    req.user = { id: '6462d8fbf6c3e30000000001' }; // Default user ID for testing
  }

  try {
    const { testId, cardId, userResponse, score, timeSpent, userId: bodyUserId, skillArea, difficulty, level } = req.body;
    // Use userId from body if provided, otherwise use from token, or default
    const userId = bodyUserId || req.user?.id || '6462d8fbf6c3e30000000001';
    
    // Only require cardId and userResponse
    if (!cardId || !userResponse) {
      return res.status(400).json({ error: 'Missing required fields: cardId and userResponse are required' });
    }
    
    // Log the request for debugging
    console.log('Received practice response:', { userId, cardId, userResponse });

    // Always use a valid ObjectId for testId
    let validTestId;
    try {
      // If the provided testId is a valid MongoDB ObjectId, use it
      if (testId && testId.match(/^[0-9a-fA-F]{24}$/) && mongoose.Types.ObjectId.isValid(testId)) {
        validTestId = testId;
      } 
      // If a hex string of correct length is provided but not valid, convert it
      else if (testId && testId.match(/^[0-9a-fA-F]{24}$/)) {
        validTestId = new mongoose.Types.ObjectId(testId).toString();
      }
      // If the testId is in our client-generated format (timestamp + random)
      else if (testId && testId.length === 24 && testId.match(/^[0-9a-fA-F]+$/)) {
        // It looks like a valid hex string, so we can try to use it directly
        validTestId = testId;
      } 
      // Otherwise generate a new ObjectId
      else {
        console.log('Generating new ObjectId for practice response. Original value:', testId);
        validTestId = new mongoose.Types.ObjectId().toString();
      }
    } catch (error) {
      console.error('Error validating testId:', error);
      validTestId = '6462d8fbf6c3e30000000001'; // Default ObjectId
    }
    
    // Save response to database with validated testId
    const practiceResponse = new PracticeResponse({
      userId,
      testId: validTestId,
      cardId, // Store the original cardId as a string
      userResponse,
      score: score || 1, // Default to 1 star if not provided
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });

    await practiceResponse.save();

    // Get the card details to provide context for Claude evaluation
    const cardDetails = {
      cardId,
      skillArea: skillArea || getSkillAreaFromCardId(cardId) || 'Listening',
      difficulty: difficulty || getDifficultyFromCardId(cardId) || 'Beginner',
      level: level || getLevelFromCardId(cardId) || 1
    };
    
    // Use GPT AI to evaluate the response and generate feedback
    const evaluation = await evaluateWithGPT(userResponse, cardDetails);
    
    // Extract score and feedback from the evaluation
    const calculatedScore = evaluation.score || 1; // Default to 1 if evaluation fails
    const feedback = evaluation.feedback || "Thank you for your response. Keep practicing to improve your skills.";

    // Update the response with feedback and the calculated score
    practiceResponse.feedbackResponse = feedback;
    practiceResponse.score = calculatedScore; // Update the score in the database
    await practiceResponse.save();

    // Extract skill area from card ID if not provided
    const detectedSkillArea = skillArea || getSkillAreaFromCardId(cardId) || 'Listening';
    const detectedDifficulty = difficulty || getDifficultyFromCardId(cardId) || 'Beginner';
    const detectedLevel = level || getLevelFromCardId(cardId) || 1;
    
    console.log('Practice response details:', {
      skillArea: detectedSkillArea,
      difficulty: detectedDifficulty,
      level: detectedLevel,
      score: calculatedScore,
      timeSpent: timeSpent || 60
    });
    
    // Update progress data
    await updatePracticeProgress(
      userId,
      detectedSkillArea,
      detectedDifficulty,
      calculatedScore,
      timeSpent || 60, // Default time if not provided
      detectedLevel
    );

    return res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      feedback,
      score: calculatedScore // Send the calculated score in the response
    });
  } catch (error) {
    console.error('Error submitting practice response:', error);
    return res.status(500).json({ error: 'Server error processing response' });
  }
}

// Function to evaluate response and generate feedback using OpenAI GPT API
async function evaluateWithGPT(userResponse, cardDetails) {
  try {
    console.log('Evaluating practice response with GPT:', { 
      cardId: cardDetails.cardId,
      skillArea: cardDetails.skillArea,
      difficulty: cardDetails.difficulty,
      level: cardDetails.level
    });
    
    if (!process.env.OPENAI_API_KEY) {
      const errorMsg = 'OpenAI API key is not configured';
      console.error(errorMsg);
      return { 
        score: 1, 
        feedback: "We're currently unable to evaluate responses. Please try again later.",
        strengths: ["Your response was received successfully"],
        areasForImprovement: ["Evaluation service is temporarily unavailable"],
        completed: false
      };
    }
    
    const url = 'https://api.openai.com/v1/chat/completions';

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    };

    // Create a detailed prompt for GPT-4-turbo to evaluate the response
    const prompt = `You are an expert language learning evaluator. Please evaluate the following response based on the given context.

SKILL AREA: ${cardDetails.skillArea}
DIFFICULTY: ${cardDetails.difficulty} (Level ${cardDetails.level})

USER RESPONSE:
${userResponse}

EVALUATION CRITERIA:
For ${cardDetails.difficulty} level ${cardDetails.skillArea} practice (Level ${cardDetails.level}), consider:
1. Accuracy of language use (grammar, vocabulary)
2. Relevance and completeness of the response
3. Complexity and fluency appropriate for the level
4. Achievement of the task's communicative purpose

SCORING GUIDE (0-3 stars):
- 0 stars: Response is largely incomprehensible or completely off-topic
- 1 star: Response shows minimal understanding with significant errors
- 2 stars: Response is mostly correct with some errors but communicates the main idea
- 3 stars: Response is accurate, appropriate, and demonstrates good command at this level

INSTRUCTIONS:
1. Be encouraging and constructive in your feedback
2. Focus on 1-2 key areas for improvement
3. Acknowledge what was done well
4. Adjust expectations based on the difficulty level

Return your evaluation as a valid JSON object in this exact format:
{
  "score": 0-3,
  "feedback": "Your specific, constructive feedback here.",
  "strengths": ["List 1-2 specific strengths"],
  "areasForImprovement": ["List 1-2 specific areas to improve"],
  "completed": true
}

IMPORTANT: Only return valid JSON with no other text.`;

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: "gpt-4-turbo-preview",
          max_tokens: 500,
          temperature: 0.3, // Lower temperature for more consistent evaluations
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are an expert language learning evaluator. You provide fair, constructive feedback and accurate scoring for language learning exercises. You always return valid JSON in the exact format specified, with no additional text.`
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
          score: 1, 
          feedback: "We're having trouble evaluating your response right now.",
          strengths: ["Your response was received successfully"],
          areasForImprovement: ["Please try again in a few moments"],
          completed: false
        };
      }

      const result = await response.json();
      
      if (!result.choices?.[0]?.message?.content) {
        console.error('Unexpected OpenAI API response structure:', JSON.stringify(result));
        throw new Error('Invalid response structure from OpenAI API');
      }

      const textResponse = result.choices[0].message.content;
      console.log('Raw GPT response:', textResponse);
      
      // Parse the response as JSON
      try {
        // Try to parse directly first
        let evaluation;
        try {
          evaluation = JSON.parse(textResponse);
        } catch (parseError) {
          // If direct parse fails, try to extract JSON from code blocks
          const jsonMatch = textResponse.match(/```(?:json)?\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            evaluation = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error('Could not parse response as JSON');
          }
        }
        
        // Validate the evaluation format
        if (typeof evaluation.score === 'undefined' || !evaluation.feedback) {
          console.error('Invalid evaluation format from GPT:', evaluation);
          throw new Error('Invalid evaluation format');
        }
        
        // Ensure all required fields are present
        const validatedEvaluation = {
          score: Math.max(0, Math.min(3, parseInt(evaluation.score) || 1)),
          feedback: (evaluation.feedback || 'Thank you for your response.').trim(),
          strengths: Array.isArray(evaluation.strengths) ? evaluation.strengths : [],
          areasForImprovement: Array.isArray(evaluation.areasForImprovement) ? evaluation.areasForImprovement : [],
          completed: evaluation.completed !== false
        };
        
        console.log('Validated evaluation:', validatedEvaluation);
        return validatedEvaluation;
      } catch (parseError) {
        console.error('Error parsing OpenAI response as JSON:', parseError);
        
        // Fall back to regex extraction if direct parsing fails
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const extractedEvaluation = JSON.parse(jsonMatch[0]);
            if (extractedEvaluation.score !== undefined && extractedEvaluation.feedback) {
              return extractedEvaluation;
            }
          } catch (secondError) {
            console.error('Second attempt at parsing JSON failed:', secondError);
          }
        }
        return { 
          score: 1, 
          feedback: "We couldn't process your response. Please try again.",
          strengths: ["Your response was received successfully"],
          areasForImprovement: ["Please ensure your response is clear and complete"],
          completed: false
        };
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('OpenAI API request timed out');
      } else {
        console.error('Error calling OpenAI API:', error);
      }
      // Generate a dynamic fallback based on the error
      const errorType = error.name === 'AbortError' ? 'request timed out' : 'processing error';
      const fallbackFeedback = {
        score: 1,
        feedback: `We encountered a ${errorType} while evaluating your response. Please try again.`,
        strengths: ["Your response was received successfully"],
        areasForImprovement: ["Please try submitting your response again"],
        completed: false
      };
      
      console.error('GPT Evaluation Error:', {
        error: error.message,
        errorType: error.name,
        cardDetails,
        timestamp: new Date().toISOString()
      });
      
      return fallbackFeedback;
    }
  } catch (error) {
    console.error('Error evaluating with GPT:', error);
    // Generate a dynamic error message based on the error type
    const errorContext = error.message.includes('timeout') ? 'The evaluation took too long' : 
                        error.message.includes('JSON') ? 'We had trouble processing the evaluation' :
                        'An unexpected error occurred';
    
    const fallbackFeedback = {
      score: 1,
      feedback: `${errorContext}. Your response has been saved.`,
      strengths: ["Your response was received successfully"],
      areasForImprovement: ["Please try submitting your response again"],
      completed: false
    };
    
    console.error('GPT Evaluation Error:', {
      error: error.message,
      errorType: error.name,
      cardDetails,
      timestamp: new Date().toISOString(),
      stack: error.stack
    });
    
    return fallbackFeedback;
  }
}

// Function to update practice progress
async function updatePracticeProgress(userId, skillArea, difficulty, score, timeSpent, level) {
  try {
    console.log(`Updating practice progress for user ${userId}, skill ${skillArea}, difficulty ${difficulty}, level ${level}`);
    
    // Find existing progress record or create a new one
    let progressRecord = await PracticeProgress.findOne({
      userId,
      skillArea,
      difficulty
    });
    
    if (!progressRecord) {
      // Create a new progress record with default level progression
      console.log('Creating new progress record');
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
        levelProgress: [{
          level: 1,
          stars: 0,
          questionsCompleted: 0,
          completed: false
        }]
      });
    }
    
    // Ensure level progress exists for the current level
    const levelIndex = progressRecord.levelProgress.findIndex(lp => lp.level === parseInt(level));
    if (levelIndex === -1) {
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
        
        // Mark next level as unlocked if not already
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
        
        // Update current level if completed current level
        if (parseInt(level) === progressRecord.currentLevel) {
          progressRecord.currentLevel = Math.min(30, parseInt(level) + 1);
        }
      }
    }
    
    // Update overall progress metrics
    progressRecord.sessionsCompleted++;
    progressRecord.questionsAttempted++;
    progressRecord.timeSpent += timeSpent;
    
    // Update average score
    const oldTotal = progressRecord.averageScore * (progressRecord.questionsAttempted - 1);
    progressRecord.averageScore = (oldTotal + score) / progressRecord.questionsAttempted;
    
    // Update highest score if needed
    if (score > progressRecord.highestScore) {
      progressRecord.highestScore = score;
    }
    
    // Update timestamp
    progressRecord.lastUpdated = new Date();
    
    // Save the updated progress
    await progressRecord.save();
    console.log('Updated practice progress successfully');
  } catch (error) {
    console.error('Error updating practice progress:', error);
  }
}

// Helper function to determine skill area from card ID
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
