import connectDb from "../../middleware/dbConnect";
import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  // Get token from request header (but don't fail if no token)
  const token = req.headers.authorization?.split(' ')[1];
  
  // Try to decode token if present
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
      req.user = decoded;
    } catch (error) {
      console.log('Token verification failed, proceeding anyway');
      // We won't fail the request, just proceed without user info
    }
  }

  try {
    const { responses } = req.body;
    
    if (!responses || Object.keys(responses).length === 0) {
      return res.status(400).json({ error: 'Response data is required' });
    }

    // Get personality analysis from Claude API
    const analysisResult = await analyzePersonality(responses);

    if (!analysisResult) {
      return res.status(500).json({ error: 'Failed to analyze personality' });
    }

    // Return the analysis
    return res.status(200).json({
      success: true,
      message: 'Personality analyzed successfully',
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Error analyzing personality:', error);
    return res.status(500).json({ error: 'Server error during analysis' });
  }
}

async function analyzePersonality(responses) {
  const url = 'https://api.anthropic.com/v1/messages';

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  };

  // Prepare the responses for the prompt
  const responsesString = Object.entries(responses)
    .map(([questionId, value]) => `${questionId}: ${value}`)
    .join('\n');

  const prompt = `Below are responses to a personality assessment test where 1 is Strongly Disagree, 2 is Disagree, 3 is Neutral, 4 is Agree, and 5 is Strongly Agree:

${responsesString}

Based on these responses, please provide:
1. A fitting personality type name
2. A list of 3-5 strengths
3. A list of 2-3 areas for growth or challenges
4. A list of 3-5 potential career matches
5. A list of 3-4 personal development suggestions

Return your analysis as a structured JSON object with the following format:
{
  "personality_type": "Name of personality type",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "challenges": ["challenge 1", "challenge 2"],
  "career_matches": ["career 1", "career 2", "career 3"],
  "development_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;

  const payload = {
    model: "claude-3-haiku-20240307", 
    max_tokens: 1000,
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
    // Return fallback data if Claude fails or returns malformed response
    return {
      "personality_type": "Balanced Professional",
      "strengths": ["Adaptability", "Critical thinking", "Emotional intelligence", "Planning skills"],
      "challenges": ["May struggle with decisive action", "Could benefit from more assertiveness"],
      "career_matches": ["Project Management", "Research", "Customer Relations", "Technical Consulting"],
      "development_suggestions": ["Practice decision-making under pressure", "Seek leadership opportunities", "Develop specialized expertise"]
    };
  } catch (error) {
    console.error('Error calling Claude API for personality analysis:', error);
    return null;
  }
}

export default connectDb(handler);
