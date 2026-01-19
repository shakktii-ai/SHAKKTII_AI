import PsychometricTestNew from '../../../models/PsychometricTestNew';
import connectDb from '../../../middleware/dbConnectt';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error',
      error: 'Method Not Allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    // Parse the request body
    let body = {};
    try {
      if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else {
        body = req.body;
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return res.status(400).json({ 
        status: 'error',
        error: 'Invalid request body',
        details: 'Could not parse JSON body'
      });
    }

    const { profileType, userEmail } = body;
    
    // Validate required fields
    if (!profileType || !userEmail) {
      return res.status(400).json({ 
        status: 'error',
        error: 'Missing required fields',
        missingFields: {
          profileType: !profileType,
          userEmail: !userEmail
        }
      });
    }

    console.log(`[${new Date().toISOString()}] Checking status for ${profileType} test for user: ${userEmail}`);
    
    try {
      // Find the most recent test for this user and profile type
      const test = await PsychometricTestNew.findOne({
        userEmail,
        profileType,
        completed: false
      }).sort({ createdAt: -1 });

      if (!test) {
        console.log('No in-progress test found');
        return res.status(200).json({ 
          status: 'not_found',
          message: 'No in-progress test found for this user and profile type',
          suggestions: [
            'Check if the test was already completed',
            'Verify the user email is correct',
            'Check if any tests exist for this profile type'
          ]
        });
      }

      console.log(`Found test ${test._id} with status: ${test.completed ? 'completed' : 'in-progress'}`);
      
      return res.status(200).json({
        status: 'success',
        testId: test._id,
        questions: test.questions,
        completed: test.completed,
        createdAt: test.createdAt,
        message: test.completed 
          ? 'Test was successfully generated' 
          : 'Test generation is still in progress',
        nextSteps: test.completed
          ? 'You can now proceed to take the test'
          : 'Please wait while we generate your test questions'
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        status: 'error',
        error: 'Database operation failed',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('Unexpected error in checkStatus:', error);
    return res.status(500).json({ 
      status: 'error',
      error: 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack
      })
    });
  }
}

export default connectDb(handler);
