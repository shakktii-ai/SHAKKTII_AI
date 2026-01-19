import OpenAI from 'openai';
import dbConnect from '../../lib/dbConnect';
import AcademicTestResult from '../../models/AcademicTestResult';

// Shared in-memory storage for test data
let testStoreInitialized = false;

// Initialize the test store if it doesn't exist
const getTestStore = () => {
  try {
    if (!global.testStore) {
      console.log('Initializing global test store');
      global.testStore = new Map();
      testStoreInitialized = true;
      
      // Set up cleanup interval (runs every hour)
      if (!global.testStoreCleanupInterval) {
        global.testStoreCleanupInterval = setInterval(() => {
          try {
            const now = Date.now();
            let count = 0;
            for (const [id, test] of global.testStore.entries()) {
              if (now - test.createdAt > 24 * 60 * 60 * 1000) { // 24 hours
                global.testStore.delete(id);
                count++;
              }
            }
            if (count > 0) {
              console.log(`Cleaned up ${count} expired tests`);
            }
          } catch (cleanupError) {
            console.error('Error during test store cleanup:', cleanupError);
          }
        }, 60 * 60 * 1000); // Run every hour
      }
    }
    return global.testStore || new Map(); // Always return a Map, even if initialization failed
  } catch (initError) {
    console.error('Error initializing test store:', initError);
    return new Map(); // Return a new Map as fallback
  }
};

// Function to store test data
const storeTestData = (testId, testData) => {
  const store = getTestStore();
  console.log(`Storing test data for ID: ${testId}`);
  
  const dataToStore = {
    ...testData,
    testId, // Ensure testId is set correctly
    createdAt: Date.now(),
    lastAccessed: Date.now()
  };
  
  store.set(testId, dataToStore);
  
  // Log storage
  console.log(`Test stored successfully: ${testId}`);
  console.log(`Current test store size: ${store.size}`);
  console.log('Available test IDs:', Array.from(store.keys()));
  
  return dataToStore;
};

// Function to get test data
const getTestData = (testId) => {
  const store = getTestStore();
  const testData = store.get(testId);
  
  if (testData) {
    // Update last accessed time
    testData.lastAccessed = Date.now();
    store.set(testId, testData);
  }
  
  return testData;
};

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function evaluateWithGPT(testData, userAnswers) {
  console.log(`Evaluating test responses for ${testData.subject} (${testData.stream})...`);
  try {
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Format the questions and answers for the prompt
    const questionsText = testData.questions.map((q, i) => {
      return `QUESTION ${i + 1}:
${q.questionText}

CORRECT ANSWER:
${q.correctAnswer}

EXPLANATION:
${q.explanation || 'No explanation provided'}
`;
    }).join('\n');

    const studentAnswersText = userAnswers.map((ans, i) => {
      return `QUESTION ${i + 1}:
${ans.userAnswer || 'No answer provided'}\n`;
    }).join('\n');

    // Prepare comprehensive evaluation prompt
    const prompt = `You are an expert academic evaluator with deep knowledge of ${testData.subject} curriculum for ${testData.stream} level students.

IMPORTANT INSTRUCTIONS:
1. Be generous but accurate in your evaluation
2. Give full credit for answers that are essentially correct, even if worded differently
3. For MCQ questions, focus on the correctness of the selected option, not just exact text matching
4. For written answers, look for understanding of concepts rather than exact wording

EVALUATE THE FOLLOWING TEST RESPONSES:

TEST DETAILS:
- Subject: ${testData.subject}
- Stream: ${testData.stream}
- Department: ${testData.department || 'Not specified'}
- Test Format: ${testData.testFormat}
- Total Questions: ${testData.questions.length}

QUESTIONS AND CORRECT ANSWERS:
${questionsText}

STUDENT'S ANSWERS:
${studentAnswersText}

EVALUATION INSTRUCTIONS:
1. Be generous in your evaluation - if the student's answer is conceptually correct but worded differently, consider it correct.
2. For each question, provide:
   - isCorrect: true if the answer is essentially correct
   - score: 0-100 based on accuracy
   - feedback: Detailed explanation of why the answer is correct/incorrect
   - conceptsAddressed: Key concepts from the question
3. Calculate an overall score (0-100) and assign stars (0-3)
4. Provide general feedback on performance
5. Analyze subject mastery with strengths, improvements, and recommendations

RESPONSE FORMAT (strict JSON):
{
  "answers": [
    {
      "questionIndex": 0,
      "isCorrect": true,
      "score": 100,
      "feedback": "Detailed feedback...",
      "conceptsAddressed": ["concept1", "concept2"]
    }
  ],
  "overallScore": 85,
  "stars": 2,
  "feedback": "Overall feedback...",
  "subjectMastery": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["area1", "area2"],
    "recommendations": ["suggestion1", "suggestion2"]
  }
}`;

    // Call GPT-4-turbo API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert academic evaluator with deep knowledge of ${testData.subject} curriculum for ${testData.stream} level students. Provide fair, accurate, and educational evaluations.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent evaluation
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    console.log('GPT evaluation response received, length:', responseText.length);
    
    try {
      const evaluation = JSON.parse(responseText);
      
      // Validate the evaluation structure
      if (!evaluation.answers || !Array.isArray(evaluation.answers)) {
        throw new Error('Invalid evaluation format: missing answers array');
      }
      
      // Ensure we have the required fields
      const validatedEvaluation = {
        answers: evaluation.answers.map((answer, index) => ({
          questionIndex: answer.questionIndex || index,
          isCorrect: answer.isCorrect || false,
          score: Math.max(0, Math.min(100, answer.score || 0)),
          feedback: answer.feedback || 'No feedback provided',
          conceptsAddressed: answer.conceptsAddressed || []
        })),
        overallScore: Math.max(0, Math.min(100, evaluation.overallScore || 0)),
        stars: Math.max(0, Math.min(3, evaluation.stars || 0)),
        feedback: evaluation.feedback || 'No overall feedback provided',
        subjectMastery: evaluation.subjectMastery || {
          strengths: [],
          improvements: [],
          recommendations: []
        }
      };
      
      console.log(`GPT evaluation completed. Overall score: ${validatedEvaluation.overallScore}%, Stars: ${validatedEvaluation.stars}`);
      return validatedEvaluation;
      
    } catch (parseError) {
      console.error('Error parsing GPT evaluation response:', parseError);
      throw new Error('Failed to parse evaluation response');
    }
    
  } catch (error) {
    console.error("Error evaluating with GPT:", error);
    throw error;
  }
}

// Generate basic evaluation if AI fails
function generateBasicEvaluation(testData, userAnswers) {
  console.log('Generating basic evaluation...');
  console.log('Test data questions:', testData.questions);
  console.log('User answers:', userAnswers);
  
  const answers = testData.questions.map((q, index) => {
    // Get user answer, handling both array of strings and array of objects with userAnswer property
    let userAnswer = '';
    if (Array.isArray(userAnswers) && userAnswers[index]) {
      if (typeof userAnswers[index] === 'object' && userAnswers[index] !== null) {
        userAnswer = (userAnswers[index].userAnswer || '').toString().trim();
      } else {
        userAnswer = userAnswers[index].toString().trim();
      }
    }
    
    console.log(`Question ${index} - User answer: '${userAnswer}', Correct answer: '${q.correctAnswer}'`);
    
    // Evaluation variables
    let isCorrect = false;
    let isPartial = false;
    let score = 0;
    let feedback = '';
    
    if (testData.testFormat === 'MCQ') {
      // For MCQ, we need to compare the selected option with the correct answer
      // Normalize both for comparison (trim whitespace, make lowercase)
      const normalizedUserAnswer = userAnswer ? userAnswer.trim().toLowerCase() : '';
      const normalizedCorrectAnswer = q.correctAnswer ? 
        (typeof q.correctAnswer === 'string' ? q.correctAnswer : JSON.stringify(q.correctAnswer)).trim().toLowerCase() : '';
      
      // If options exist, try to match by index first
      if (q.options && q.options.length > 0) {
        const correctOptionIndex = q.options.findIndex(opt => 
          opt && opt.toString().trim().toLowerCase() === normalizedCorrectAnswer
        );
        
        if (correctOptionIndex !== -1) {
          // If user selected an option by index
          const userOptionIndex = parseInt(normalizedUserAnswer);
          if (!isNaN(userOptionIndex) && q.options[userOptionIndex]) {
            isCorrect = userOptionIndex === correctOptionIndex;
          } 
          // If user entered the option text directly
          else if (q.options.some(opt => opt && opt.toString().trim().toLowerCase() === normalizedUserAnswer)) {
            isCorrect = normalizedUserAnswer === q.options[correctOptionIndex].toString().trim().toLowerCase();
          }
        }
      } 
      // If no options, just compare the answers directly
      else {
        isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
      }
      
      // Get all available options normalized for comparison
      const normalizedOptions = q.options ? q.options.map(opt => opt ? opt.toString().trim().toLowerCase() : '') : [];
      
      // Set score and feedback based on correctness
      if (isCorrect) {
        score = 100;
        feedback = "Correct answer! Well done.";
      } else {
        score = 0;
        feedback = `Incorrect. The correct answer is: ${q.correctAnswer}`;
        
        // Check for partial matches for non-MCQ questions
        if (testData.testFormat !== 'MCQ' && 
            normalizedUserAnswer && 
            normalizedCorrectAnswer &&
            (normalizedCorrectAnswer.includes(normalizedUserAnswer) || 
             normalizedUserAnswer.includes(normalizedCorrectAnswer))) {
          isPartial = true;
          score = 50;
          feedback = `Partially correct. The complete answer is: ${q.correctAnswer}`;
        }
      }
    } 
    // For non-MCQ or if options are not available
    else if (testData.testFormat === 'Written' && userAnswer && q.correctAnswer) {
      const normalizedUserAnswer = userAnswer.toString().trim().toLowerCase();
      const normalizedCorrectAnswer = q.correctAnswer.toString().trim().toLowerCase();
      
      // For written answers, use keyword matching
      const correctKeywords = normalizedCorrectAnswer.split(/\s+/).filter(w => w.length > 3);
      let matchedKeywords = 0;
      
      // Count matched keywords
      correctKeywords.forEach(keyword => {
        if (normalizedUserAnswer.includes(keyword)) {
          matchedKeywords++;
        }
      });
      
      const matchRatio = correctKeywords.length > 0 ? matchedKeywords / correctKeywords.length : 0;
      score = Math.round(matchRatio * 100);
      
      if (score >= 80) {
        isCorrect = true;
        feedback = "Excellent answer! You've covered all the key points.";
      } else if (score >= 50) {
        isPartial = true;
        feedback = "Good attempt. You've covered some important points, but missed others.";
      } else if (score >= 30) {
        isPartial = true;
        score = 30; // Minimum passing score
        feedback = "Partially correct, but your answer is missing several key elements.";
      } else {
        score = 0;
        feedback = "Your answer doesn't contain enough key elements from the expected response.";
      }
    } 
    // For speaking tests
    else if (testData.testFormat === 'Speaking' && userAnswer && q.correctAnswer) {
      const normalizedUserAnswer = userAnswer.toString().trim().toLowerCase();
      const normalizedCorrectAnswer = q.correctAnswer.toString().trim().toLowerCase();
      
      // For speaking, be more lenient with matching
      const correctWords = normalizedCorrectAnswer.split(/\s+/);
      const userWords = normalizedUserAnswer.split(/\s+/);
      
      // Count words that appear in both answers
      let matchedWords = 0;
      correctWords.forEach(word => {
        if (word.length > 2 && userWords.includes(word)) {
          matchedWords++;
        }
      });
      
      const matchRatio = correctWords.length > 0 ? matchedWords / correctWords.length : 0;
      score = Math.round(matchRatio * 100);
      
      if (score >= 70) {
        isCorrect = true;
        feedback = "Great speaking response! Your answer matches what we were looking for.";
      } else if (score >= 40) {
        isPartial = true;
        score = 40; // Minimum passing score
        feedback = "Good attempt. Your spoken response contains some of the key elements we were looking for.";
      } else {
        score = 0;
        feedback = "Your spoken response didn't contain enough of the key elements we were looking for.";
      }
    } 
    // For any other case (including no answer)
    else {
      score = 0;
      feedback = q.correctAnswer ? 
        `No answer provided. The correct answer is: ${q.correctAnswer}` :
        "No answer provided.";
    }
    
    return {
      questionIndex: index,
      isCorrect: isCorrect,
      isPartial: isPartial,
      score: score,
      feedback: feedback
    };
  });
  
  // Calculate overall score
  const overallScore = answers.reduce((sum, ans) => sum + ans.score, 0) / answers.length;
  
  // Determine stars (0-3)
  let stars;
  if (overallScore >= 85) stars = 3;
  else if (overallScore >= 70) stars = 2;
  else if (overallScore >= 50) stars = 1;
  else stars = 0;
  
  // Generate appropriate feedback based on score
  let feedbackMessage;
  if (stars === 3) {
    feedbackMessage = `Excellent work! You scored ${Math.round(overallScore)}% on this test.`;
  } else if (stars === 2) {
    feedbackMessage = `Good job! You scored ${Math.round(overallScore)}% on this test. Keep practicing to improve further.`;
  } else if (stars === 1) {
    feedbackMessage = `You scored ${Math.round(overallScore)}% on this test. With more practice, you can improve your understanding of this subject.`;
  } else {
    feedbackMessage = `You scored ${Math.round(overallScore)}% on this test. Don't worry - review the material and try again to improve your score.`;
  }
  
  return {
    answers,
    overallScore,
    stars,
    feedback: feedbackMessage
  };
}

async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract parameters from request body
    const { testId, answers, timeSpent } = req.body;
    
    console.log('Received test submission:', { testId, timeSpent, answersCount: answers?.length });
    console.log('First answer format:', answers[0]);
    
    if (!testId || !answers) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Validate answers format - ensure they have questionIndex and userAnswer
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    let testData;
    
    // Get the test data from in-memory store
    try {
      const store = getTestStore();
      console.log('Looking up test data for ID:', testId);
      console.log('Current test store size:', store.size);
      console.log('Available test IDs:', Array.from(store.keys()));
      
      testData = getTestData(testId);
      if (!testData) {
        console.error(`Test not found in memory store: ${testId}`);
        return res.status(404).json({ 
          success: false,
          error: 'Test not found or expired',
          message: 'The test could not be found. It may have expired or was not properly saved.',
          storeStatus: {
            initialized: testStoreInitialized,
            size: store.size,
            availableIds: Array.from(store.keys())
          }
        });
      }
      
      console.log('Found test data for evaluation:', {
        testId: testData.testId,
        subject: testData.subject,
        questionCount: testData.questions?.length || 0
      });
    } catch (storeError) {
      console.error('Error accessing test store:', storeError);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to access test data store',
        details: storeError.message
      });
    }
    
    console.log('Found test data:', {
      testId: testData.testId,
      subject: testData.subject,
      questionCount: testData.questions?.length || 0
    });

    // Log the answers received for debugging
    console.log('Answers received for evaluation:', JSON.stringify(answers, null, 2));
    
    // Evaluate the test using GPT-4-turbo
    let evaluation;
    try {
      evaluation = await evaluateWithGPT(testData, answers);
      console.log('GPT Evaluation result:', JSON.stringify(evaluation, null, 2));
    } catch (aiError) {
      console.error("Error with AI evaluation, using basic evaluation:", aiError);
      evaluation = generateBasicEvaluation(testData, answers);
      console.log('Basic Evaluation result:', JSON.stringify(evaluation, null, 2));
    }

    // Ensure stars value is within valid range (0-3)
    const starsValue = Math.min(Math.max(parseInt(evaluation.stars) || 0, 0), 3);
    console.log(`Original stars value: ${evaluation.stars}, Validated stars value: ${starsValue}`);
    
    // Format the response data
    const responseData = {
      testId,
      answers: evaluation.answers.map(ans => {
        // Get the answer for this question index
        let userAnswer = '';
        
        // Handle both formats - array of strings or array of objects with userAnswer property
        if (Array.isArray(answers)) {
          if (typeof answers[ans.questionIndex] === 'string') {
            userAnswer = answers[ans.questionIndex];
          } else if (answers[ans.questionIndex] && typeof answers[ans.questionIndex] === 'object') {
            userAnswer = answers[ans.questionIndex].userAnswer;
          }
        }
        
        // Ensure userAnswer is never empty
        if (!userAnswer || userAnswer.trim() === '') {
          userAnswer = 'No answer provided';
        }
        
        return {
          questionIndex: ans.questionIndex,
          userAnswer: userAnswer,
          isCorrect: ans.isCorrect,
          score: ans.score,
          feedback: ans.feedback
        };
      }),
      overallScore: evaluation.overallScore,
      stars: starsValue,
      feedback: evaluation.feedback
    };

    // Calculate correct and incorrect counts
    const correctCount = evaluation.answers.filter(a => a.isCorrect).length;
    const incorrectCount = evaluation.answers.length - correctCount;
    
    // Prepare incorrect questions for review
    const incorrectQuestions = evaluation.answers
      .filter(a => !a.isCorrect)
      .map(a => ({
        question: a.question || `Question ${a.questionIndex + 1}`,
        userAnswer: a.userAnswer,
        correctAnswer: a.correctAnswer,
        explanation: a.explanation || 'No explanation available',
        improvementTips: a.improvementTips || [],
        concept: a.concepts ? a.concepts[0] : 'General'
      }));

    // Prepare the test result data
    const testResultData = {
      testId,
      userId: testData.userId || 'anonymous',
      stream: testData.stream,
      department: testData.department,
      subject: testData.subject,
      testFormat: testData.testFormat,
      questions: testData.questions || [],
      answers: evaluation.answers.map((ans, idx) => ({
        ...ans,
        question: testData.questions?.[idx]?.question || `Question ${idx + 1}`,
        correctAnswer: ans.correctAnswer || (testData.questions?.[idx]?.correctAnswer || 'N/A'),
        explanation: ans.explanation || '',
        improvementTips: ans.improvementTips || [],
        concepts: ans.concepts || []
      })),
      overallScore: evaluation.overallScore,
      stars: starsValue,
      feedback: evaluation.feedback,
      timeSpent: timeSpent || 0,
      subjectMastery: evaluation.subjectMastery,
      correctCount,
      incorrectCount,
      incorrectQuestions,
      completedAt: new Date()
    };

    try {
      // Save to MongoDB
      await dbConnect();
      const testResult = new AcademicTestResult(testResultData);
      await testResult.save();
      console.log('Test result saved to MongoDB:', testResult._id);
      
      // Also store in memory for faster access
      storeTestData(testId, testResultData);
    } catch (dbError) {
      console.error('Error saving test result to database:', dbError);
      // Continue with in-memory storage even if DB save fails
      storeTestData(testId, testResultData);
    }

    // Send the response
    res.status(200).json({
      success: true,
      ...responseData
    });

  } catch (error) {
    console.error('Error in evaluation handler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate test',
      message: error.message || 'An unexpected error occurred'
    });
  }
}

// Export all necessary functions
export { storeTestData, getTestData, getTestStore };

// Default export for Next.js API route
export default handler;
