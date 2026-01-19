import dbConnect from '../../lib/dbConnect';
import AcademicTestResult from '../../models/AcademicTestResult';

// This endpoint retrieves test history from MongoDB
export default async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    console.log('Fetching test results from database...');
    // Get all test results, sorted by completedAt in descending order
    const testResults = await AcademicTestResult.find({})
      .sort({ completedAt: -1 })
      .lean();
    
    console.log(`Found ${testResults.length} test results`);
    
    if (testResults.length > 0) {
      console.log('Sample test result:', {
        _id: testResults[0]._id,
        testId: testResults[0].testId,
        subject: testResults[0].subject,
        completedAt: testResults[0].completedAt
      });
    }
    
    // Format the response to match the expected frontend structure
    const formattedTests = testResults.map(test => {
      // Process answers to ensure they're in the correct format
      const processedAnswers = (test.answers || []).map((answer, index) => ({
        ...answer,
        questionIndex: answer.questionIndex !== undefined ? answer.questionIndex : index,
        userAnswer: answer.userAnswer || 'No answer provided',
        correctAnswer: answer.correctAnswer || (test.questions && test.questions[answer.questionIndex || index] ? 
          test.questions[answer.questionIndex || index].correctAnswer : 'N/A'),
        explanation: answer.explanation || 'No explanation available',
        isCorrect: answer.isCorrect || false
      }));

      // Process questions to ensure they have all required fields
      const processedQuestions = (test.questions || []).map((question, index) => ({
        ...question,
        questionText: question.questionText || question.question || `Question ${index + 1}`,
        correctAnswer: question.correctAnswer || 'N/A',
        explanation: question.explanation || 'No explanation available'
      }));

      // Generate incorrect questions from answers that were marked incorrect
      const incorrectQuestions = processedAnswers
        .filter(a => !a.isCorrect)
        .map(answer => ({
          question: processedQuestions[answer.questionIndex]?.questionText || `Question ${answer.questionIndex + 1}`,
          userAnswer: answer.userAnswer,
          correctAnswer: answer.correctAnswer,
          explanation: answer.explanation,
          improvementTips: answer.improvementTips || [
            'Review the related concepts',
            'Practice similar questions',
            'Refer to your study materials'
          ]
        }));

      const formattedTest = {
        _id: test._id.toString(),
        testId: test.testId,
        completedAt: test.completedAt,
        overallScore: test.overallScore || 0,
        stars: test.stars || 0,
        feedback: test.feedback || 'No feedback available',
        timeSpent: test.timeSpent || 0,
        stream: test.stream || 'Unknown',
        department: test.department || 'Unknown',
        subject: test.subject || 'Unknown',
        testFormat: test.testFormat || 'MCQ',
        questionCount: processedQuestions.length,
        correctCount: test.correctCount || 0,
        incorrectCount: test.incorrectCount || 0,
        incorrectQuestions: incorrectQuestions,
        subjectMastery: test.subjectMastery || {
          strengths: test.subjectMastery?.strengths || ['Good understanding of core concepts'],
          improvements: test.subjectMastery?.improvements || ['Practice more to improve accuracy'],
          recommendations: test.subjectMastery?.recommendations || ['Review the incorrect answers and explanations']
        },
        // Include the full test data for the detail view
        testData: {
          ...test,
          _id: test._id.toString(),
          answers: processedAnswers,
          questions: processedQuestions
        }
      };
      
      // Log a sample of the formatted test data
      if (test === testResults[0]) {
        console.log('Sample formatted test data:', {
          _id: formattedTest._id,
          testId: formattedTest.testId,
          subject: formattedTest.subject,
          completedAt: formattedTest.completedAt,
          hasTestData: !!formattedTest.testData,
          answerCount: formattedTest.testData.answers?.length || 0,
          questionCount: formattedTest.testData.questions?.length || 0,
          incorrectQuestions: formattedTest.incorrectQuestions?.length || 0
        });
        
        if (formattedTest.testData.answers?.length > 0) {
          console.log('Sample answer data:', {
            questionIndex: formattedTest.testData.answers[0].questionIndex,
            userAnswer: formattedTest.testData.answers[0].userAnswer,
            correctAnswer: formattedTest.testData.answers[0].correctAnswer,
            isCorrect: formattedTest.testData.answers[0].isCorrect
          });
        }
      }
      
      return formattedTest;
    });
    
    const responseData = { 
      success: true, 
      tests: formattedTests 
    };
    
    console.log(`Sending ${formattedTests.length} tests to client`);
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error fetching test history from database:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch test history',
      details: error.message
    });
  }
};
