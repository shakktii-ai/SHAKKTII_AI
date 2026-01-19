import connectDb from "../../../middleware/dbConnectt";
import PsychometricTest from "../../../models/PsychometricTest";
import PsychometricResponse from "../../../models/PsychometricResponse";
import PsychometricTestNew from "../../../models/PsychometricTestNew";
import PsychometricResponseNew from "../../../models/PsychometricResponseNew";
import User from "../../../models/User";

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user ID or email from query parameters
    const userId = req.query.userId;
    const email = req.query.email;
    
    if (!userId && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either userId or email is required to fetch test history' 
      });
    }
    
    let userIdToUse = userId;
    
    // If email is provided but userId is not, find the user by email
    if (!userIdToUse && email) {
      const user = await User.findOne({ email });
      if (user) {
        userIdToUse = user._id;
        console.log(`Found user with email ${email}, userId: ${userIdToUse}`);
      } else {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found with the provided email' 
        });
      }
    }

    // Build queries to find tests by userId or userEmail
    // We'll create two separate queries to ensure we find all tests
    let testQueries = [];
    
    // If we have a valid userId, add a query for it
    if (userIdToUse && /^[0-9a-fA-F]{24}$/.test(userIdToUse)) {
      testQueries.push({ userId: userIdToUse });
    }
    
    // If we have an email, add a query for it
    if (email) {
      testQueries.push({ userEmail: email });
    }
    
    // If we have no queries, return empty results
    if (testQueries.length === 0) {
      return res.status(400).json({ error: 'Either userId or email is required' });
    }
    
    console.log('Finding tests with queries:', JSON.stringify(testQueries));
    
    // Find all tests from both old and new models using $or query to match any of our criteria
    const testsOld = await PsychometricTest.find({ $or: testQueries })
      .sort({ createdAt: -1 })
      .lean()
      .catch(err => {
        console.error('Error querying old tests:', err);
        return [];
      });
      
    const testsNew = await PsychometricTestNew.find({ $or: testQueries })
      .sort({ createdAt: -1 })
      .lean()
      .catch(err => {
        console.error('Error querying new tests:', err);
        return [];
      });
    
    // Combine test results
    const tests = [...testsNew, ...testsOld];
    console.log(`Found ${testsNew.length} new tests and ${testsOld.length} old tests`);

    // Use the same queries for responses as we did for tests
    console.log('Finding responses with queries:', JSON.stringify(testQueries));
    
    // Find all responses from both old and new models using $or query
    const responsesOld = await PsychometricResponse.find({ $or: testQueries })
      .sort({ completedAt: -1 })
      .lean()
      .catch(err => {
        console.error('Error querying old responses:', err);
        return [];
      });
      
    const responsesNew = await PsychometricResponseNew.find({ $or: testQueries })
      .sort({ completedAt: -1 })
      .lean()
      .catch(err => {
        console.error('Error querying new responses:', err);
        return [];
      });
    
    // Combine response results
    const responses = [...responsesNew, ...responsesOld];
    console.log(`Found ${responsesNew.length} new responses and ${responsesOld.length} old responses`);

    // Debug log to see test and response IDs
    console.log('Test IDs:', tests.map(t => t._id.toString()));
    console.log('Response testIds:', responses.map(r => r.testId ? r.testId.toString() : 'null'));
    
    // Combine tests with their responses
    const testsWithResponses = tests.map(test => {
      // Find a response that matches this test's ID
      const testResponse = responses.find(r => {
        // Handle both string and ObjectId comparisons
        if (!r.testId) return false;
        const responseTestId = r.testId.toString();
        const testId = test._id.toString();
        return responseTestId === testId;
      });
      
      // If no matching response found, try to find one with matching email
      let finalResponse = testResponse;
      if (!finalResponse) {
        finalResponse = responses.find(r => {
          return r.userEmail === test.userEmail && 
                 r.profileType === test.profileType && 
                 !r.testId; // Responses without testId might belong to this test
        });
      }
      
      return {
        ...test,
        // Ensure isCompleted is always set based on the completed flag
        isCompleted: test.completed || test.isCompleted || !!finalResponse || false,
        completed: test.completed || test.isCompleted || !!finalResponse || false, // Ensure both flags are in sync
        response: finalResponse || null
      };
    });

    return res.status(200).json({
      success: true,
      tests: testsWithResponses
    });
  } catch (error) {
    console.error('Error fetching psychometric tests:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch psychometric tests',
      message: error.message
    });
  }
}

// Apply database connection middleware only
export default connectDb(handler);
