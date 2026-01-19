import OpenAI from 'openai';
import { storeTestData } from './evaluateAcademicTest';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

// Configuration
const MAX_RETRIES = 3;
const QUESTION_COUNT = 10;

async function generateQuestionsWithGPT(stream, department, subject, confidenceLevel, testFormat) {
  // Variable to track if we need to regenerate questions due to issues
  let needsRegeneration = false;
  
  try {
    console.log(`Generating questions for ${subject} (${stream}, ${department}) at confidence level ${confidenceLevel} in ${testFormat} format`);
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Create subject-specific and level-appropriate prompt
    const getSubjectSpecificPrompt = (subject, stream, department) => {
      const subjectPrompts = {
        'Mathematics': `Focus on ${stream === '10th' ? 'quadratic equations, trigonometry, and coordinate geometry' : 
                      stream === '11th' ? 'functions, limits, and probability' : 
                      'calculus, vectors, and differential equations'}`,
        'Physics': `Focus on ${stream === '10th' ? 'light, electricity, and magnetism' : 
                   stream === '11th' ? 'mechanics, thermodynamics, and waves' : 
                   'modern physics, electromagnetic induction, and optics'}`,
        'Chemistry': `Focus on ${stream === '10th' ? 'acids, bases, and periodic table' : 
                     stream === '11th' ? 'atomic structure, chemical bonding, and organic chemistry basics' : 
                     'chemical kinetics, electrochemistry, and coordination compounds'}`,
        'Biology': `Focus on ${stream === '10th' ? 'life processes, reproduction, and heredity' : 
                   stream === '11th' ? 'plant physiology, animal physiology, and biomolecules' : 
                   'genetics, evolution, and biotechnology'}`,
        'English': `Focus on ${stream === '10th' ? 'grammar, comprehension, and basic literature' : 
                   stream === '11th' ? 'advanced grammar, poetry analysis, and prose' : 
                   'critical analysis, essay writing, and advanced literature'}`,
        'History': `Focus on ${stream === '10th' ? 'nationalism, freedom struggle, and world wars' : 
                   stream === '11th' ? 'ancient civilizations and medieval history' : 
                   'modern world history and contemporary issues'}`,
        'Geography': `Focus on ${stream === '10th' ? 'resources, agriculture, and manufacturing' : 
                     stream === '11th' ? 'physical geography and climate' : 
                     'human geography and regional planning'}`,
        'Economics': `Focus on ${stream === '11th' ? 'microeconomics and basic concepts' : 
                     'macroeconomics, national income, and economic policies'}`,
        'Computer Science': `Focus on ${stream === '11th' ? 'programming basics, data structures, and algorithms' : 
                           'advanced programming, database management, and software engineering'}`,
        'Accountancy': `Focus on ${stream === '11th' ? 'basic accounting principles and journal entries' : 
                       'company accounts, analysis of financial statements, and cash flow'}`,
        'Business Studies': `Focus on ${stream === '11th' ? 'nature of business and business environment' : 
                            'management principles, marketing, and financial management'}`
      };
      
      return subjectPrompts[subject] || `Focus on core concepts and principles of ${subject} appropriate for ${stream} level students`;
    };
    
    // Create comprehensive prompt for GPT
    const prompt = `You are an expert academic content creator specializing in ${subject} for ${stream} level students in the ${department} stream.

Generate exactly 10 high-quality ${subject} questions that are:
1. Specifically tailored to ${stream} curriculum standards
2. Appropriate for ${department} stream students
3. ${getSubjectSpecificPrompt(subject, stream, department)}
4. Designed for confidence level ${confidenceLevel}/5 students

Question Distribution:
- 3 Easy questions (foundational concepts)
- 4 Moderate questions (application-based)
- 3 Hard questions (analysis and critical thinking)

${testFormat === 'MCQ' ? `MCQ FORMAT REQUIREMENTS:
- Each question MUST have EXACTLY 4 options
- EXACTLY 1 correct answer per question
- Options must be subject-specific and plausible
- No generic options like "All of the above" or "None of the above"
- Correct answer should be academically accurate
- Wrong options should be common misconceptions or related concepts
- Use terminology appropriate for ${stream} level` : 
testFormat === 'Written' ? `WRITTEN FORMAT REQUIREMENTS:
- Questions should require detailed explanations
- Include specific key points in the correct answer
- Focus on understanding rather than memorization
- Appropriate for written assessment` :
`SPEAKING FORMAT REQUIREMENTS:
- Questions suitable for oral examination
- Clear, discussion-based questions
- Include key talking points in the correct answer`}

CRITICAL: Return a valid JSON object with a 'questions' array containing exactly 10 questions in this exact format:
{
  "questions": [
    {
      "questionText": "Complete question with proper ${subject} terminology",
      "difficulty": "Easy|Moderate|Hard",
      "options": ${testFormat === 'MCQ' ? '["Option A", "Option B", "Option C", "Option D"]' : '[]'},
      "correctAnswer": "${testFormat === 'MCQ' ? 'Exact text matching one option' : 'Detailed expected answer with key points'}",
      "explanation": "Clear explanation focusing on ${subject} concepts",
      "topic": "Specific ${subject} topic covered"
    }
  ]
}

Remember:
- Questions must be curriculum-aligned for ${stream} ${department} students
- Use proper ${subject} terminology and concepts
- Ensure progressive difficulty from Easy to Hard
- Make questions relevant to real-world applications where appropriate
- Return EXACTLY 10 questions in the questions array`;

    // Call GPT-4-turbo API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert academic content creator specializing in ${subject} education for ${stream} level students. Generate curriculum-aligned questions with high academic standards.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    console.log('GPT response received, length:', responseText.length);
    console.log('Response preview:', responseText.substring(0, 200) + '...');
    
    try {
      // Parse the JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response content:', responseText);
        throw new Error('Failed to parse JSON response from GPT');
      }
      
      // Log the parsed response structure for debugging
      console.log('Parsed response keys:', Object.keys(parsedResponse));
      
      // Extract questions array with better error handling
      let questions = [];
      if (Array.isArray(parsedResponse.questions)) {
        console.log('Found questions array in response.questions');
        questions = parsedResponse.questions;
      } else if (Array.isArray(parsedResponse)) {
        console.log('Found questions array as root of response');
        questions = parsedResponse;
      } else if (parsedResponse.questions && typeof parsedResponse.questions === 'object') {
        console.log('Found questions object, converting to array');
        questions = Object.values(parsedResponse.questions);
      }
      
      console.log(`Extracted ${questions.length} questions from response`);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        console.error('No valid questions array found in response');
        console.error('Response structure:', JSON.stringify(parsedResponse, null, 2));
        throw new Error('Response does not contain a valid questions array');
      }

      // Validate and normalize questions
      const validatedQuestions = questions.slice(0, 10).map((q, index) => {
        let options = q.options || [];
        let correctAnswer = q.correctAnswer || '';
        
        if (testFormat === 'MCQ') {
          // Ensure exactly 4 options
          if (!Array.isArray(options) || options.length !== 4) {
            console.log(`Question ${index + 1} has invalid options count, generating subject-specific options`);
            options = generateSubjectSpecificOptions(subject, q.questionText, stream);
            needsRegeneration = true;
          }
          
          // Ensure correct answer matches one of the options
          if (!correctAnswer || !options.includes(correctAnswer)) {
            console.log(`Question ${index + 1} has invalid correctAnswer, using first option`);
            correctAnswer = options[0];
            needsRegeneration = true;
          }
        }
        
        return {
          questionText: q.questionText || `${subject} question ${index + 1}`,
          difficulty: q.difficulty || 'Moderate',
          options: options,
          correctAnswer: correctAnswer,
          explanation: q.explanation || `This covers important ${subject} concepts for ${stream} students`,
          topic: q.topic || subject
        };
      });

      // If we had issues, try one more time with a simpler approach
      if (needsRegeneration && validatedQuestions.length < 10) {
        console.log('Attempting regeneration with fallback method...');
        return await generateFallbackQuestions(stream, department, subject, confidenceLevel, testFormat);
      }

      console.log(`Successfully generated ${validatedQuestions.length} questions for ${subject}`);
      return validatedQuestions;
      
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      throw new Error('Failed to parse GPT response as JSON');
    }
    
  } catch (apiError) {
    console.error('GPT API error:', apiError);
    throw new Error(`GPT API call failed: ${apiError.message}`);
  }
}

// Function to regenerate questions with GPT when validation fails
async function regenerateQuestionsWithRetry(stream, department, subject, confidenceLevel, testFormat, attempt = 0) {
  if (attempt >= MAX_RETRIES) {
    throw new Error('Maximum retry attempts reached for question generation');
  }

  console.log(`Generating questions (attempt ${attempt + 1}/${MAX_RETRIES})...`);
  
  try {
    const questions = await generateQuestionsWithGPT(stream, department, subject, confidenceLevel, testFormat);
    const validatedQuestions = validateQuestions(questions, subject, testFormat);
    
    if (validatedQuestions.length >= QUESTION_COUNT) {
      return validatedQuestions.slice(0, QUESTION_COUNT);
    }
    
    if (attempt < MAX_RETRIES - 1) {
      return regenerateQuestionsWithRetry(stream, department, subject, confidenceLevel, testFormat, attempt + 1);
    }
    
    throw new Error('Failed to generate enough valid questions after retries');
  } catch (error) {
    console.error(`Attempt ${attempt + 1} failed:`, error);
    if (attempt < MAX_RETRIES - 1) {
      return regenerateQuestionsWithRetry(stream, department, subject, confidenceLevel, testFormat, attempt + 1);
    }
    throw error;
  }
}

// Validate and normalize questions from GPT
function validateQuestions(questions, subject, testFormat) {
  if (!Array.isArray(questions)) {
    throw new Error('Invalid questions format: expected an array');
  }

  return questions
    .filter(q => q && q.questionText && q.questionText.trim() !== '')
    .map((q, index) => {
      const question = {
        questionText: q.questionText || `${subject} question ${index + 1}`,
        difficulty: ['Easy', 'Moderate', 'Hard'].includes(q.difficulty) ? q.difficulty : 'Moderate',
        options: [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || `Explanation for ${subject} question`,
        topic: q.topic || subject
      };

      // For MCQ format, ensure we have valid options
      if (testFormat === 'MCQ') {
        question.options = Array.isArray(q.options) && q.options.length >= 2
          ? q.options.slice(0, 4) // Take up to 4 options
          : ['Option A', 'Option B', 'Option C', 'Option D'];
        
        // Ensure correct answer is one of the options
        if (!question.correctAnswer || !question.options.includes(question.correctAnswer)) {
          question.correctAnswer = question.options[0];
        }
      }

      return question;
    });
}

// Fallback question generator using GPT with simplified prompt
async function generateFallbackQuestions(stream, department, subject, confidenceLevel, testFormat) {
  console.log('Using fallback question generation with GPT...');
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Generate ${QUESTION_COUNT} ${subject} questions for ${stream} students in ${department} stream. ` +
                  `Format: JSON array with questionText, difficulty (Easy/Moderate/Hard), options (if MCQ), correctAnswer, explanation, topic.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = JSON.parse(completion.choices[0].message.content);
    const questions = Array.isArray(response) ? response : response.questions || [];
    
    return validateQuestions(questions, subject, testFormat).slice(0, QUESTION_COUNT);
  } catch (error) {
    console.error('Error in fallback question generation:', error);
    throw new Error('Failed to generate fallback questions');
  }
}

async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract parameters from request body and validate them
    const { userId, stream, department, subject, confidenceLevel, testFormat } = req.body;
    
    // Validate all required fields
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!stream) missingFields.push('stream');
    if (!department) missingFields.push('department');
    if (!subject) missingFields.push('subject');
    if (!confidenceLevel) missingFields.push('confidenceLevel');
    if (!testFormat) missingFields.push('testFormat');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required parameters', 
        missingFields,
        received: { userId, stream, department, subject, confidenceLevel, testFormat }
      });
    }
    
    // Validate confidenceLevel is a number between 1-5
    const confLevel = parseInt(confidenceLevel, 10);
    if (isNaN(confLevel) || confLevel < 1 || confLevel > 5) {
      return res.status(400).json({ 
        error: 'Invalid confidence level', 
        message: 'Confidence level must be a number between 1 and 5'
      });
    }
    
    // Validate test format
    if (!['MCQ', 'Written', 'Speaking'].includes(testFormat)) {
      return res.status(400).json({ 
        error: 'Invalid test format', 
        message: 'Test format must be one of: MCQ, Written, Speaking'
      });
    }

    console.log('Generating academic test:', { stream, department, subject, confidenceLevel: confLevel, testFormat });
    
    // Generate questions with retry mechanism
    let questions;
    try {
      questions = await regenerateQuestionsWithRetry(stream, department, subject, confLevel, testFormat);
    } catch (error) {
      console.error('Error generating questions after retries:', error);
      return res.status(500).json({
        error: 'Failed to generate questions',
        message: 'Could not generate test questions. Please try again later.'
      });
    }

    // Generate a unique test ID
    const testId = 'generated_' + Date.now();
    
    // Create test object to return to client (without answers)
    const clientTest = {
      _id: testId,
      userId,
      stream,
      department,
      subject,
      confidenceLevel: confLevel,
      testFormat,
      dateCreated: new Date(),
      isCompleted: false,
      questions: questions.map(q => ({
        questionText: q.questionText,
        difficulty: q.difficulty,
        options: q.options || [],
        topic: q.topic,
        // Hide answers and explanations
        correctAnswer: undefined,
        explanation: undefined
      }))
    };
    
    try {
      // Prepare test data for storage
      const testData = {
        testId,
        stream,
        department,
        subject,
        confidenceLevel: confLevel,
        testFormat,
        questions: questions.map(q => ({
          questionText: q.questionText,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || 'medium',
          topic: q.topic || subject,
          options: q.options || []
        })),
        timestamp: Date.now()
      };
      
      console.log('Storing test data for evaluation...');
      storeTestData(testId, testData);
      console.log('Test data stored successfully');
    } catch (storageError) {
      console.error('Error storing test data:', storageError);
      // Don't fail the request, just log the error since the test can still be taken
    }
    
    console.log(`Generated test with ${questions.length} questions`);
    
    res.status(200).json({
      success: true,
      message: 'Academic test created successfully',
      test: clientTest
    });
  } catch (error) {
    console.error('Error generating academic test:', error);
    // Handle errors and send appropriate response
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      res.status(500).json({
        error: 'API Error',
        message: error.response.data?.error?.message || 'An error occurred with the AI service'
      });
    } else {
      console.error('Error generating academic test:', error);
      res.status(500).json({
        error: 'Failed to create academic test',
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
}

// No database connection needed
export default handler;
