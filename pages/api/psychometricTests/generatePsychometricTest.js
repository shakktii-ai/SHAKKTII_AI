export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

import connectDb from "../../../middleware/dbConnectt";
import PsychometricTestNew from "../../../models/PsychometricTestNew";
import User from "../../../models/User";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { profileType, userId, userEmail } = req.body;
  let email = userEmail || req.body.email; // Accept both userEmail and email for backward compatibility

  if (!profileType) {
    return res.status(400).json({ error: 'Profile type is required. Use "student" or "professional".' });
  }

  if (!userId && !email) {
    return res.status(400).json({ error: 'Either userId or email is required to save the test.' });
  }

  try {
    console.log(`Generating psychometric test for profile: ${profileType}`);
    const questions = await getPsychometricQuestions(profileType);

    if (questions && Array.isArray(questions) && questions.length > 0) {
      // Validate and format questions to ensure they have the required structure
      const validatedQuestions = questions.map(question => {
        // Ensure each question has the required fields
        if (!question.scenario || typeof question.scenario !== 'string') {
          console.warn('Question missing scenario, using default');
          question.scenario = 'How would you handle a challenging situation?';
        }

        // Ensure difficulty is valid
        if (!question.difficulty || !['Easy', 'Moderate', 'Complex'].includes(question.difficulty)) {
          question.difficulty = 'Moderate';
        }

        // Ensure options are valid
        if (!Array.isArray(question.options) || question.options.length < 4) {
          console.warn('Question has invalid options, using defaults');
          question.options = [
            { text: "Most effective approach", value: 3 },
            { text: "Somewhat effective approach", value: 2 },
            { text: "Less effective approach", value: 1 },
            { text: "Least effective approach", value: 0 }
          ];
        } else {
          // Ensure each option has text and value
          question.options = question.options.slice(0, 4).map((option, index) => ({
            text: option.text || `Option ${index + 1}`,
            value: typeof option.value === 'number' ? option.value : (3 - index)
          }));
        }

        return {
          scenario: question.scenario,
          options: question.options,
          difficulty: question.difficulty
        };
      });

      // Find user by email if email is provided but userId is not
      let userIdToUse = userId;
      if (!userIdToUse && email) {
        try {
          const user = await User.findOne({ email });
          if (user) {
            userIdToUse = user._id;
          }
          // If user not found with email, we'll continue with just the email
        } catch (error) {
          console.error('Error finding user by email:', error);
          // Continue without userId
        }
      }
      
      // Ensure we have an email, even if not provided
      if (!email) {
        email = `guest_${Date.now()}@example.com`;
        console.log('Using generated email:', email);
      }

      // Create a test object to save in the database
      // If we have a valid MongoDB ObjectId for userId, use it
      // Otherwise, we'll create a test without userId but include userEmail
      const testData = {
        profileType,
        questions: validatedQuestions,
        startTime: new Date(),
        completed: false,
        isCompleted: false,
        userEmail: email // Store email directly in the test document
      };
      
      // Only include userId if it's a valid MongoDB ObjectId
      if (userIdToUse && /^[0-9a-fA-F]{24}$/.test(userIdToUse)) {
        testData.userId = userIdToUse;
      }
      
      try {
        console.log('Creating new test with data:', JSON.stringify({
          ...testData,
          questions: '[questions array]' // Don't log the full questions array
        }));
        
        const newTest = new PsychometricTestNew(testData);
        const savedTest = await newTest.save();
        console.log(`Saved psychometric test with ID: ${savedTest._id}`);

        return res.status(200).json({
          success: true,
          testId: savedTest._id,
          questions: validatedQuestions,
          profileType
        });
      } catch (error) {
        console.error('Error saving psychometric test:', error);
        
        // Return the questions anyway so the user can still take the test
        // even if we couldn't save it to the database
        return res.status(200).json({
          success: true,
          warning: 'Test could not be saved to database, but you can still proceed',
          questions: validatedQuestions,
          profileType
        });
      }
    } else {
      console.error('Failed to generate valid questions');
      return res.status(500).json({ error: 'Failed to generate valid questions' });
    }
  } catch (error) {
    console.error('Error during processing:', error);
    return res.status(500).json({ error: `Error during processing: ${error.message}` });
  }
}

async function getPsychometricQuestions(profileType) {
  const url = 'https://api.openai.com/v1/chat/completions';
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables.');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  let prompt = '';

  if (profileType.toLowerCase() === 'student') {
    prompt = `Create EXACTLY 30 psychometric test questions for students. Follow these specific requirements:

QUESTION REQUIREMENTS:
1. Each question MUST present a realistic academic scenario students face
2. Each question MUST have EXACTLY 4 multiple-choice options
3. Options MUST have values: 3 (most effective), 2, 1, and 0 (least effective)
4. Each question MUST have a difficulty level: "Easy", "Moderate", or "Complex"

COMPETENCY AREAS (cover at least 3):
- Academic collaboration
- Learning environment ethics
- Educational leadership
- Study group dynamics
- Academic conflict resolution

RESPONSE FORMAT - Return ONLY a JSON array with this EXACT structure:
[
  {
    "scenario": "Your realistic scenario text here",
    "options": [
      {"text": "Most effective option", "value": 3},
      {"text": "Somewhat effective option", "value": 2},
      {"text": "Less effective option", "value": 1},
      {"text": "Least effective option", "value": 0}
    ],
    "difficulty": "Easy" or "Moderate" or "Complex"
  },
  ... 29 more question objects...
]

CRITICAL: You MUST return EXACTLY 30 questions. Return ONLY the JSON array with NO explanatory text, NO intro, NO conclusion. The response MUST be valid JSON that can be parsed directly.`;
  } else {
    prompt = `Create EXACTLY 30 psychometric test questions for working professionals. Follow these specific requirements:

QUESTION REQUIREMENTS:
1. Each question MUST present a realistic workplace scenario professionals face
2. Each question MUST have EXACTLY 4 multiple-choice options
3. Options MUST have values: 3 (most effective), 2, 1, and 0 (least effective)
4. Each question MUST have a difficulty level: "Easy", "Moderate", or "Complex"

COMPETENCY AREAS (cover at least 3):
- Workplace dynamics
- Professional ethics
- Management potential
- Team collaboration 
- Workplace conflict resolution

RESPONSE FORMAT - Return ONLY a JSON array with this EXACT structure:
[
  {
    "scenario": "Your realistic scenario text here",
    "options": [
      {"text": "Most effective option", "value": 3},
      {"text": "Somewhat effective option", "value": 2},
      {"text": "Less effective option", "value": 1},
      {"text": "Least effective option", "value": 0}
    ],
    "difficulty": "Easy" or "Moderate" or "Complex"
  },
  ... 29 more question objects...
]

CRITICAL: You MUST return EXACTLY 30 questions. Return ONLY the JSON array with NO explanatory text, NO intro, NO conclusion. The response MUST be valid JSON that can be parsed directly.`;
  }

  const payload = {
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 4500,
    messages: [
      {
        role: 'user',
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

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return null;
    }

    if (data?.choices?.[0]?.message?.content) {
      const rawContent = data.choices[0].message.content;
      console.log('Successfully received response from OpenAI, content length:', rawContent.length);
      
      // Log the first 200 characters of the response for debugging
      console.log('Response preview:', rawContent.substring(0, 200) + '...');
      
      // Log the response length only for debugging purposes
      console.log(`Full response length: ${rawContent.length} characters`);
      
      // Parse the content as JSON
      try {
        let parsedQuestions = JSON.parse(rawContent);
        
        // Handle case where the response might be wrapped in an object
        if (!Array.isArray(parsedQuestions)) {
          // Check if it's inside a 'questions' property
          if (parsedQuestions.questions && Array.isArray(parsedQuestions.questions)) {
            parsedQuestions = parsedQuestions.questions;
          } 
          // Check if it's inside a 'data' property
          else if (parsedQuestions.data && Array.isArray(parsedQuestions.data)) {
            parsedQuestions = parsedQuestions.data;
          }
          // If it's not an array and doesn't contain an array, try to extract JSON
          else {
            const possibleArrayKeys = Object.keys(parsedQuestions).filter(key => 
              Array.isArray(parsedQuestions[key]) && parsedQuestions[key].length > 0);
            
            if (possibleArrayKeys.length > 0) {
              parsedQuestions = parsedQuestions[possibleArrayKeys[0]];
            } else {
              throw new Error('Response is not an array and does not contain an array');
            }
          }
        }
        
        // Ensure we have valid questions
        if (parsedQuestions && Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
          return parsedQuestions;
        } else {
          console.error('No valid questions found in parsed response');
          return null;
        }
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        console.error('Raw content:', rawContent);
        return null;
      }
    } else {
      console.error('Unexpected response format from OpenAI:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}
