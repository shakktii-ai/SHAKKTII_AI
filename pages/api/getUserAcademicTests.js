import connectDb from "../../middleware/dbConnect";
import AcademicTestResponse from "../../models/AcademicTestResponse";
import AcademicTest from "../../models/AcademicTest";

async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract user ID from query parameters
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing required userId parameter' });
    }
    
    // Fetch all test responses for the user with populated test data
    const testResponses = await AcademicTestResponse.find({ userId })
      .sort({ completedAt: -1 }) // Sort by most recent first
      .lean(); // Use lean for better performance
    
    // If there are no test responses, return empty array
    if (!testResponses || testResponses.length === 0) {
      return res.status(200).json({ 
        success: true, 
        tests: [] 
      });
    }
    
    // Extract test IDs to fetch corresponding test details
    const testIds = testResponses.map(response => response.testId);
    
    // Fetch test details for all test IDs
    const testDetails = await AcademicTest.find({
      _id: { $in: testIds }
    }).lean();
    
    // Create a map of test details for quick lookup
    const testDetailsMap = testDetails.reduce((map, test) => {
      map[test._id.toString()] = test;
      return map;
    }, {});
    
    // Combine test responses with test details
    const combinedTests = testResponses.map(response => {
      const testId = response.testId.toString();
      const testDetail = testDetailsMap[testId] || {};
      
      return {
        _id: response._id,
        testId: response.testId,
        completedAt: response.completedAt,
        overallScore: response.overallScore,
        stars: response.stars,
        feedback: response.feedback,
        timeSpent: response.timeSpent,
        stream: testDetail.stream || 'Unknown',
        department: testDetail.department || 'Unknown',
        subject: testDetail.subject || 'Unknown',
        testFormat: testDetail.testFormat || 'Unknown',
        questionCount: testDetail.questions ? testDetail.questions.length : 0,
      };
    });
    
    res.status(200).json({ 
      success: true, 
      tests: combinedTests 
    });
  } catch (error) {
    console.error('Error fetching user academic tests:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch academic tests' 
    });
  }
}

// No authentication required directly to simplify during development
export default connectDb(handler);
