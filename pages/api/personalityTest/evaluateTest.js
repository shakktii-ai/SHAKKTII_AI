import mongoose from 'mongoose';
import PracticeProgress from '../../../models/PracticeProgress';

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// Configure API route to increase limits and handle large headers
export const config = {
  maxDuration: 300, // 5 minutes in seconds
  runtime: 'nodejs',
  // API configuration
  api: {
    // Body size limit (10MB)
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '10mb',
    // Disable default body parsing as we'll parse it manually
    bodyParser: false,
  },
};

// Helper function to validate the request data
async function validateRequestData(questions, responses) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('Invalid or missing questions array');
  }
  
  if (!responses || typeof responses !== 'object' || Object.keys(responses).length === 0) {
    throw new Error('Invalid or missing responses object');
  }
  
  // Ensure all questions have responses (default to neutral if missing)
  const validatedResponses = { ...responses };
  questions.forEach(q => {
    if (validatedResponses[q.id] === undefined) {
      validatedResponses[q.id] = 3; // Default to neutral (3)
    }
  });
  
  return { questions, responses: validatedResponses };
}

// Helper function to generate the analysis prompt
function generateAnalysisPrompt(questions, responses) {
  const questionResponses = questions.map((q, index) => {
    const responseValue = responses[q.id];
    const responseText = q.options?.find(opt => opt.value === responseValue)?.text || responseValue;
    return `${index + 1}. ${q.text}\n   Response: ${responseText} (${responseValue}/5)`;
  }).join('\n\n');
  
  return `Analyze the following personality test responses and provide a detailed personality assessment.

Questions and Responses:
${questionResponses}

Please provide a detailed personality analysis with the following sections:
1. A comprehensive executive summary of key personality traits (be specific and detailed)
2. 3-5 specific, actionable recommendations for personal development with practical steps
3. 3-5 key strengths to build upon
4. 3-5 areas for potential growth and development
5. 3-5 career matches that would be a good fit, with brief explanations

Format the response as a valid JSON object with the following structure:
{
  "executiveSummary": "Comprehensive executive summary of key personality traits...",
  "personalityType": "Descriptive personality type (e.g., 'The Strategic Thinker' or 'The Empathetic Leader')",
  "recommendations": [
    {
      "title": "Short title for the recommendation",
      "description": "Detailed explanation of the recommendation with practical steps"
    }
  ],
  "strengths": [
    {
      "title": "Strength title",
      "description": "Brief explanation of how this strength manifests"
    }
  ],
  "areasForGrowth": [
    {
      "title": "Area for growth",
      "description": "Brief explanation of this area for development"
    }
  ],
  "careerMatches": [
    {
      "title": "Career title",
      "description": "Brief explanation of why this career is a good fit"
    }
  ]
}

IMPORTANT: Your response must be valid JSON that can be parsed with JSON.parse(). Do not include any markdown formatting or additional text outside the JSON.`;
}

// Main API handler
export default async function handler(req, res) {
  console.log('\n--- New Request ---');
  console.log('Method:', req.method);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Parse the request body
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }
    
    const { questions, responses } = JSON.parse(body);
    
    // Validate request data
    const { questions: validatedQuestions, responses: validatedResponses } = 
      await validateRequestData(questions, responses);
    
    console.log('Questions count:', validatedQuestions.length);
    console.log('Responses count:', Object.keys(validatedResponses).length);
    
    // Generate the analysis prompt
    const prompt = generateAnalysisPrompt(validatedQuestions, validatedResponses);
    console.log('Generated analysis prompt, calling OpenAI...');
    
    // Create an AbortController for the fetch request
    const controller = new AbortController();
    let timeoutId;
    
    try {
      // Set a 5-minute timeout
      timeoutId = setTimeout(() => controller.abort(), 300000);
      
      // Call OpenAI API with signal for timeout
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal, // Add signal for timeout
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that analyzes personality test results.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('OpenAI API error:', error);
        throw new Error(`Failed to analyze responses: ${error.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      const analysisText = result.choices[0]?.message?.content || '';
      
      // Parse the analysis text (should be JSON)
      let analysis;
      try {
        // Try to extract JSON from the response if it's wrapped in markdown
        const jsonMatch = analysisText.match(/```(?:json\n)?([\s\S]*?)\n```/) || [];
        const jsonString = jsonMatch[1] || analysisText;
        analysis = JSON.parse(jsonString);
      } catch (error) {
        console.error('Error parsing analysis JSON:', error);
        // If parsing fails, return the raw text as the summary
        analysis = { summary: analysisText };
      }
    
      // Format the response data
      const formatArray = (arr) => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
          if (typeof item === 'string') {
            return { title: item, description: '' };
          }
          return {
            title: item.title || 'Untitled',
            description: item.description || ''
          };
        });
      };
    
      // Get user ID from the request or use a default for demo
      const userId = req.query.userId || '6462d8fbf6c3e30000000001';
      
      // Calculate score based on responses (simple average for now)
      const responseValues = Object.values(validatedResponses);
      const totalScore = responseValues.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      const averageScore = Math.round((totalScore / (responseValues.length * 5)) * 100);
      
      // Format strengths and areas to improve as arrays of strings
      const formatArrayItems = (items) => {
        if (!Array.isArray(items)) return [];
        return items.slice(0, 3).map(item => {
          if (typeof item === 'string') return item;
          return item.description || item.title || '';
        }).filter(Boolean);
      };

      const strengthsArray = formatArrayItems(analysis?.strengths || []);
      const areasToImproveArray = formatArrayItems(analysis?.areasForGrowth || []);

      try {
        // First, get the current highest score if it exists
        const existingProgress = await PracticeProgress.findOne({ userId, skillArea: 'Personality' });
        const currentHighestScore = existingProgress?.highestScore || 0;
        const highestScore = Math.max(currentHighestScore, averageScore);

        // Prepare the update object
        const update = {
          $inc: {
            sessionsCompleted: 1,
            questionsAttempted: validatedQuestions.length,
            totalStarsEarned: 1, // Award 1 star for completing the test
          },
          $set: {
            averageScore,
            highestScore,
            lastUpdated: new Date(),
            difficulty: 'Moderate', // Default difficulty for personality test
            strengths: strengthsArray,
            areasToImprove: areasToImproveArray,
          }
        };

        // Only set on insert if this is a new document
        if (!existingProgress) {
          update.$setOnInsert = {
            userId,
            skillArea: 'Personality',
            currentLevel: 1
          };
        }

        // Update or create progress record
        await PracticeProgress.findOneAndUpdate(
          { userId, skillArea: 'Personality' },
          update,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        
        console.log('Saved Personality test progress for user:', userId);

      } catch (dbError) {
        console.error('Error saving progress to database:', dbError);
        // Continue with the response even if saving progress fails
      }

      // Return the analysis in the format expected by the frontend
      return res.status(200).json({
        success: true,
        data: {
          analysis: {
            ...analysis,
            // Ensure these fields are properly formatted as arrays of objects with title/description
            strengths: formatArray(analysis.strengths || []),
            areasForGrowth: formatArray(analysis.areasForGrowth || []),
            recommendations: formatArray(analysis.recommendations || []),
            personalityTraits: formatArray(analysis.personalityTraits || []),
            score: analysis.score || 0,
            // Ensure these fields are included for compatibility
            personalityType: analysis.personalityType || 'Your Personality Profile',
            executiveSummary: analysis.executiveSummary || analysis.summary || 'No summary available',
            careerMatches: formatArray(analysis.careerMatches || [])
          },
          meta: {
            generatedAt: new Date().toISOString(),
            isAuthenticated: true,
            message: 'Your test results have been saved!',
            reportId: `report-${Date.now()}`
          }
        },
        // Include progress information in the response
        progress: {
          userId,
          skillArea: 'Personality',
          averageScore: averageScore || 0,
          highestScore: averageScore || 0,
          sessionsCompleted: 1,
          questionsAttempted: validatedQuestions.length,
          totalStarsEarned: 1
        }
      });
    
    } catch (error) {
      // Clear timeout if it was set
      if (timeoutId) clearTimeout(timeoutId);
      
      console.error('Error in OpenAI API call:', error);
      
      let errorMessage = 'Failed to analyze responses';
      if (error.name === 'AbortError') {
        errorMessage = 'The analysis took too long to complete. Please try again with a simpler response.';
      } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.message?.includes('timeout')) {
        errorMessage = 'Connection to the AI service timed out. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return res.status(500).json({ 
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } catch (error) {
    // Clear timeout if it was set
    if (timeoutId) clearTimeout(timeoutId);
    
    console.error('Error in request processing:', error);
    
    return res.status(500).json({ 
      success: false,
      error: 'An unexpected error occurred while processing your request.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
