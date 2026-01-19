import connectDb from '../../../middleware/dbConnectt';
import PsychometricTestNew from '../../../models/PsychometricTestNew';
import PsychometricResponseNew from '../../../models/PsychometricResponseNew';
import mongoose from 'mongoose';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    
    const { 
      userId, 
      userEmail, 
      profileType, 
      responses, 
      results, 
      questions 
    } = req.body;
    
    if (!userEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'User email is required' 
      });
    }
    
    // First, save or update the test
    let test = null;
    
    // Create or update test
    try {
      // Check if userId is a valid MongoDB ObjectId
      // If not, don't include it in the document
      const isValidObjectId = userId && mongoose.isValidObjectId(userId);
      
      const testData = {
        userEmail,
        profileType,
        questions,
        responses: responses.map(r => r.selectedOption),
        completed: true,
        isCompleted: true,
        completedAt: new Date()
      };
      
      // Only add userId if it's a valid ObjectId
      if (isValidObjectId) {
        testData.userId = userId;
      }
      
      test = new PsychometricTestNew(testData);
      
      await test.save();
    } catch (error) {
      console.error('Error saving test:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving test', 
        error: error.message 
      });
    }
    
    // Then, save the test response with results
    try {
      const evaluation = results.evaluation || {};
      
      // Create response data without userId first
      const responseData = {
        userEmail,
        testId: test._id,
        profileType,
        responses,
        results: {
          // Basic evaluation data
          overallScore: evaluation.overallScore || 7,
          strengths: evaluation.strengths || [],
          areasToImprove: evaluation.areasToImprove || [],
          analysis: evaluation.analysis || '',
          
          // Add all competency fields directly from the evaluation object
          // Student-specific competencies
          academicCollaboration: evaluation.academicCollaboration || null,
          learningEthics: evaluation.learningEthics || null,
          educationalLeadership: evaluation.educationalLeadership || null,
          studyGroupDynamics: evaluation.studyGroupDynamics || null,
          academicConflictResolution: evaluation.academicConflictResolution || null,
          classroomParticipation: evaluation.classroomParticipation || null,
          
          // Employee-specific competencies
          empathy: evaluation.empathy || null,
          assertiveness: evaluation.assertiveness || null,
          ethicalReasoning: evaluation.ethicalReasoning || null,
          collaboration: evaluation.collaboration || null,
          conflictResolution: evaluation.conflictResolution || null,
          leadershipPotential: evaluation.leadershipPotential || null,
          
          // Recommendations
          recommendedLearningStyles: evaluation.recommendedLearningStyles || [],
          academicPathRecommendations: evaluation.academicPathRecommendations || [],
          careerPathRecommendations: evaluation.careerPathRecommendations || [],
          roleFitRecommendations: evaluation.roleFitRecommendations || [],
          // New: career suggestions from evaluation (student or employee)
          careerSuggestions: evaluation.careerSuggestions || [],
          // Skills & next steps
          recommendedSkills: evaluation.recommendedSkills || [],
          nextSteps: evaluation.nextSteps || [],
          skillsDevelopmentAdvice: evaluation.skillsDevelopmentAdvice || '',
          
          // Personality profile
          personalityProfile: {
            decisionMakingStyle: evaluation.decisionMakingStyle || '',
            secondaryStyle: evaluation.secondaryStyle || '',
            keyTraits: evaluation.keyTraits || []
          },
          
          isFallback: results.isFallback || false
        },
        completedAt: new Date()
      };
      
      // Only add userId if it's a valid ObjectId
      if (userId && mongoose.isValidObjectId(userId)) {
        responseData.userId = userId;
      }
      
      const testResponse = new PsychometricResponseNew(responseData);
      
      await testResponse.save();
      
      return res.status(200).json({ 
        success: true, 
        testId: test._id,
        responseId: testResponse._id,
        message: 'Test results saved successfully' 
      });
    } catch (error) {
      console.error('Error saving test response:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving test response', 
        error: error.message 
      });
    }
  } catch (error) {
    console.error('Error in saveTestResults API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
}

export default connectDb(handler);
