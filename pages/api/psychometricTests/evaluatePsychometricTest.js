import connectDb from "../../../middleware/dbConnectt";
import PsychometricTestNew from "../../../models/PsychometricTestNew";
import PsychometricResponseNew from "../../../models/PsychometricResponseNew";
import User from "../../../models/User";

// Increase maxDuration to 300 seconds (5 minutes) to allow for longer processing
// This is the maximum allowed by Vercel/Next.js API routes
export const config = {
  runtime: 'nodejs',
  maxDuration: 300, // 300 seconds = 5 minutes
  api: {
    responseLimit: '10mb', // Increase response size limit if needed
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

// Function to parse JSON (no fallback)
function safeJsonParse(jsonString) {
  return JSON.parse(jsonString);
}

// Function to extract JSON from GPT's response
function extractJsonFromResponse(text) {
  if (!text) return null;
  
  try {
    // With response_format: {"type": "json_object"}, the response should be valid JSON directly
    const parsed = safeJsonParse(text);
    if (parsed) return parsed;
    
    // Fallback extraction logic if the direct parse fails
    // Try to find JSON in code blocks
    const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const parsed = safeJsonParse(codeBlockMatch[1]);
      if (parsed) return parsed;
    }
    
    // Try to find a JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Clean up potential JSON syntax errors
      let jsonStr = jsonMatch[0]
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/,([^,]*)$/, '$1') // Remove trailing comma if any
        .replace(/(['"]+)([a-zA-Z0-9_]+)(['"]+):/g, '"$2":') // Ensure proper JSON keys
        .replace(/'/g, '"'); // Replace single quotes with double quotes
      
      // Try to parse the cleaned JSON
      const cleanedParsed = safeJsonParse(jsonStr);
      if (cleanedParsed) return cleanedParsed;
    }
  } catch (e) {
    console.error('Error parsing JSON from GPT response:', e);
  }
  
  return null;
}

// Helper function to ensure score objects have the right structure
function ensureScoreObject(scoreObj, competencyName = '') {
  // If scoreObj is a number, convert it to a score object
  if (typeof scoreObj === 'number') {
    return {
      score: Math.max(0, Math.min(3, scoreObj)),
      comments: `Automatically generated comment for ${competencyName}`,
      developmentTips: `Consider reviewing your approach to ${competencyName}`,
      strengthLevel: 'Beginner'
    };
  }
  
  // If scoreObj is not an object or is null, return default values
  if (!scoreObj || typeof scoreObj !== 'object') {
    return {
      score: 0,
      comments: `No evaluation provided for ${competencyName}`,
      developmentTips: `Focus on developing your ${competencyName} skills`,
      strengthLevel: 'Beginner'
    };
  }
  
  // Ensure score is a valid number between 0 and 3
  const score = typeof scoreObj.score === 'number' ? Math.max(0, Math.min(3, scoreObj.score)) : 0;
  
  // Return the validated score object with default values for missing fields
  return {
    score: score,
    comments: typeof scoreObj.comments === 'string' ? scoreObj.comments : `Evaluation for ${competencyName}`,
    developmentTips: typeof scoreObj.developmentTips === 'string' 
      ? scoreObj.developmentTips 
      : `Consider working on your ${competencyName} skills`,
    strengthLevel: typeof scoreObj.strengthLevel === 'string' 
      ? scoreObj.strengthLevel 
      : (score >= 2.5 ? 'Advanced' : score >= 1.5 ? 'Intermediate' : 'Beginner')
  };
}

// Helper function to calculate overall score from individual competencies
function calculateOverallScore(evaluation, profileType) {
  try {
    if (!evaluation || typeof evaluation !== 'object') {
      console.warn('Invalid evaluation object:', evaluation);
      return 5; // Default to middle score if evaluation is invalid
    }
    
    // If we have explicit overallScore from GPT, use that instead
    if (typeof evaluation.overallScore === 'number') {
      return Math.max(0, Math.min(10, evaluation.overallScore)); // Ensure score is between 0-10
    }
    
    let scores = [];
    
    // Try to get scores from the evaluation object
    if (profileType === 'student') {
      // Student competencies
      scores = [
        evaluation.academicCollaboration?.score,
        evaluation.learningEthics?.score,
        evaluation.educationalLeadership?.score,
        evaluation.studyGroupDynamics?.score,
        evaluation.academicConflictResolution?.score,
        evaluation.classroomParticipation?.score
      ].filter(score => typeof score === 'number' && !isNaN(score));
    } else {
      // Employee competencies (default)
      scores = [
        evaluation.empathy?.score,
        evaluation.assertiveness?.score,
        evaluation.ethicalReasoning?.score,
        evaluation.collaboration?.score,
        evaluation.conflictResolution?.score,
        evaluation.leadershipPotential?.score,
        // Include optional competencies if they exist
        ...(evaluation.strategicThinking?.score !== undefined ? [evaluation.strategicThinking.score] : []),
        ...(evaluation.adaptability?.score !== undefined ? [evaluation.adaptability.score] : [])
      ].filter(score => typeof score === 'number' && !isNaN(score));
    }
    
    // If no valid scores found, return a default value
    if (scores.length === 0) {
      console.warn('No valid competency scores found in evaluation');
      return 5; // Default to middle score
    }
    
    // Calculate average score and convert from 0-3 to 0-10 scale
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const normalizedScore = Math.round((avgScore / 3) * 10);
    
    // Ensure the score is within 0-10 range
    return Math.max(0, Math.min(10, normalizedScore));
    
  } catch (e) {
    console.error('Error calculating overall score:', e);
    return 5; // Return a default score on error
  }
}

// Function to evaluate psychometric test responses with GPT
async function evaluateWithGPT(test, responses, profileType) {
  console.log('Starting evaluation with GPT...');
  const startTime = Date.now();
  try {
    console.log('Evaluating psychometric test responses with GPT');
    
    // Prepare the data for GPT
    const formattedResponses = responses.map(r => {
      const question = test.questions[r.questionIndex];
      const selectedOption = question.options[r.selectedOption];
      
      return {
        scenario: question.scenario,
        selectedOption: selectedOption.text,
        reasoning: r.reasoning || "No reasoning provided"
      };
    });
    
    // Create prompt for GPT based on profile type
    let prompt;
    
    if (profileType === 'student') {
      prompt = `
        You are evaluating a student's responses to a psychometric test that assesses the following core competencies:
        - Academic Collaboration: Ability to work effectively with peers on academic projects
        - Learning Ethics: Understanding and application of academic integrity principles
        - Educational Leadership: Taking initiative and guiding others in learning environments
        - Study Group Dynamics: Contributing effectively to group learning
        - Academic Conflict Resolution: Handling disagreements in educational settings
        - Classroom Participation: Engagement and contribution in classroom settings

        Here are the student's responses to ${formattedResponses.length} academic scenarios:
        ${JSON.stringify(formattedResponses, null, 2)}

        Please provide a comprehensive, detailed evaluation of the student's behavioral traits, learning style, and academic potential.
        
        Return your response as a JSON object with the following structure:
        {
          "academicCollaboration": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's ability to work with peers",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "learningEthics": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's understanding of academic integrity",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "educationalLeadership": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's ability to lead in educational contexts",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "studyGroupDynamics": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's ability to work effectively with others",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "academicConflictResolution": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's approach to resolving academic conflicts",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "classroomParticipation": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the student's engagement in classroom settings",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "overallScore": (number from 0-10, comprehensive score based on all competencies),
          "analysis": "Comprehensive analysis of the student's profile (300-400 words)",
          "decisionMakingStyle": "Primary decision-making approach (e.g., Analytical, Intuitive, Collaborative)",
          "secondaryStyle": "Secondary decision-making approach",
          "keyTraits": ["Key personality trait 1", "Key personality trait 2", "Key personality trait 3", "Key personality trait 4"],
          "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3", "Specific strength 4"],
          "strengthDetails": ["Detailed explanation of strength 1", "Detailed explanation of strength 2", "Detailed explanation of strength 3", "Detailed explanation of strength 4"],
          "areasToImprove": ["Specific area 1", "Specific area 2", "Specific area 3", "Specific area 4"],
          "improvementDetails": ["Detailed explanation of improvement area 1", "Detailed explanation of improvement area 2", "Detailed explanation of improvement area 3", "Detailed explanation of improvement area 4"],
          "recommendedLearningStyles": ["Learning Style 1", "Learning Style 2", "Learning Style 3"],
          "academicPathRecommendations": ["Specific academic path 1", "Specific academic path 2", "Specific academic path 3"],
          "recommendedResources": ["Specific book/course/resource 1", "Specific book/course/resource 2", "Specific book/course/resource 3"],
          "careerSuggestions": [
            {
              "title": "Leadership & Management",
              "description": "Why this path suits the student's assessed strengths and preferences",
              "roles": ["Club President", "Team Leader", "Project Coordinator"]
            },
            {
              "title": "Research & Analysis",
              "description": "Why this path suits the student's analytical abilities",
              "roles": ["Research Assistant", "Data Analyst", "Academic Researcher"]
            }
          ]
        }
        
        The scores should be on a 3-star rating system:
        - 0: Needs significant improvement
        - 1: Basic competency
        - 2: Strong competency
        - 3: Exceptional competency
        
        The overall score should be on a scale of 0-10, providing a more nuanced assessment.
        
        Please ensure your evaluation is:
        1. Detailed and specific to the student's response patterns
        2. Balanced between strengths and areas for improvement
        3. Constructive and actionable with specific development tips
        4. Insightful about underlying patterns in decision-making and learning approaches
        5. Forward-looking with personalized recommendations for growth
      `;
    } else {
      // Default to employee/professional profile
      prompt = `
        You are evaluating a professional's responses to a psychometric test that assesses the following core competencies:
        - Empathy: Ability to understand and share the feelings of colleagues and clients
        - Assertiveness: Confidence in expressing professional opinions and boundaries
        - Ethical Reasoning: Ability to navigate complex workplace ethics and make principled decisions
        - Collaboration: Working effectively in teams and across departments
        - Conflict Resolution: Managing and resolving workplace disagreements constructively
        - Leadership Potential: Capacity to lead, motivate, and develop others in a professional setting
        - Strategic Thinking: Ability to plan ahead and see the bigger picture
        - Adaptability: Flexibility in responding to changing circumstances

        Here are the professional's responses to ${formattedResponses.length} workplace scenarios:
        ${JSON.stringify(formattedResponses, null, 2)}

        Please provide a comprehensive, detailed evaluation of the professional's behavioral traits, decision-making style, and career potential.
        
        Return your response as a JSON object with the following structure:
        {
          "empathy": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's emotional intelligence and ability to understand others",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "assertiveness": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's confidence in expressing their views",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "ethicalReasoning": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's approach to ethical decision-making",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "collaboration": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's ability to work in teams",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "conflictResolution": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's approach to resolving workplace conflicts",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "leadershipPotential": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's potential to lead and develop others",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "strategicThinking": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's ability to think strategically",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "adaptability": {
            "score": (number from 0-3),
            "comments": "Detailed assessment of the professional's ability to adapt to changing circumstances",
            "developmentTips": "Specific, actionable advice for improving in this area",
            "strengthLevel": "Beginner/Intermediate/Advanced/Expert"
          },
          "overallScore": (number from 0-10, comprehensive score based on all competencies),
          "analysis": "Comprehensive analysis of the professional's work style and potential (300-400 words)",
          "decisionMakingStyle": "Primary decision-making approach (e.g., Analytical, Intuitive, Collaborative)",
          "secondaryStyle": "Secondary decision-making approach",
          "keyTraits": ["Key personality trait 1", "Key personality trait 2", "Key personality trait 3", "Key personality trait 4"],
          "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3", "Specific strength 4"],
          "strengthDetails": ["Detailed explanation of strength 1", "Detailed explanation of strength 2", "Detailed explanation of strength 3", "Detailed explanation of strength 4"],
          "areasToImprove": ["Specific area 1", "Specific area 2", "Specific area 3", "Specific area 4"],
          "improvementDetails": ["Detailed explanation of improvement area 1", "Detailed explanation of improvement area 2", "Detailed explanation of improvement area 3", "Detailed explanation of improvement area 4"],
          "careerSuggestions": [
            {
              "title": "Leadership & Management",
              "description": "Detailed description of why this career path is a good fit based on the assessment",
              "exampleRoles": ["Role 1", "Role 2", "Role 3", "Role 4"],
              "whyItFits": ["Reason 1", "Reason 2", "Reason 3"],
              "growthPotential": "High/Medium/Low",
              "skillsToDevelop": ["Skill 1", "Skill 2", "Skill 3"]
            },
            {
              "title": "Specialist & Technical",
              "description": "Detailed description of why this career path is a good fit based on the assessment",
              "exampleRoles": ["Role 1", "Role 2", "Role 3", "Role 4"],
              "whyItFits": ["Reason 1", "Reason 2", "Reason 3"],
              "growthPotential": "High/Medium/Low",
              "skillsToDevelop": ["Skill 1", "Skill 2", "Skill 3"]
            }
          ],
          "skillsDevelopmentAdvice": "Detailed advice on skills development based on the assessment results",
          "recommendedSkills": [
            {"name": "Skill 1", "level": 2.5, "importance": "High/Medium/Low"},
            {"name": "Skill 2", "level": 1.8, "importance": "High/Medium/Low"},
            {"name": "Skill 3", "level": 2.2, "importance": "High/Medium/Low"}
          ],
          "nextSteps": [
            "Actionable step 1 with specific details",
            "Actionable step 2 with specific details",
            "Actionable step 3 with specific details"
          ],
          "recommendedResources": [
            {
              "title": "Resource Title",
              "type": "Book/Course/Article/Podcast",
              "description": "Brief description of why this resource is recommended",
              "link": "URL or reference if available"
            }
          ],
          "industryFit": [
            {
              "industry": "Industry Name",
              "fitScore": 0-10,
              "reasons": ["Reason 1", "Reason 2"],
              "exampleRoles": ["Role 1", "Role 2"]
            }
          ]
        }
        
        The scores should be on a 3-star rating system:
        - 0: Needs significant improvement
        - 1: Basic competency
        - 2: Strong competency
        - 3: Exceptional competency
        
        The overall score should be on a scale of 0-10, providing a more nuanced assessment.
        
        Please ensure your evaluation is:
        1. Detailed and specific to the professional's response patterns
        2. Balanced between strengths and areas for improvement
        3. Constructive and actionable with specific development tips
        4. Insightful about underlying patterns in decision-making and leadership approaches
        5. Forward-looking with personalized career recommendations and growth opportunities
      `;
    }

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      throw new Error('API key is missing');
    }

    try {
      // Call OpenAI GPT API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        throw new Error('Request timed out. Please try again.');
      }, 300000); // 300 second (5 minute) timeout

      console.log('Sending request to OpenAI GPT API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          max_tokens: 4000,
          temperature: 0.5,
          response_format: { type: "json_object" },
          messages: [{
            role: "system",
            content: "You are an AI specialized in evaluating psychometric test responses. Provide detailed analysis in valid JSON format."
          }, {
            role: "user",
            content: prompt
          }]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error response:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
        console.error('Unexpected OpenAI API response structure:', JSON.stringify(result));
        throw new Error('Invalid API response format');
      }

      const textResponse = result.choices[0].message.content;
      console.log('GPT response received, length:', textResponse.length);

      // Log a portion of the response for debugging (first 500 chars)
      const previewLength = Math.min(500, textResponse.length);
      console.log('GPT response preview:', textResponse.substring(0, previewLength) + 
                 (previewLength < textResponse.length ? '...' : ''));
      
      // Extract and parse JSON from the response
      const evaluation = extractJsonFromResponse(textResponse);
      
      if (!evaluation) {
        console.error('Could not extract valid JSON from GPT response');
        console.log('Full GPT response (first 1000 chars):', 
                   textResponse.substring(0, 1000) + 
                   (textResponse.length > 1000 ? '...' : ''));
        throw new Error('Could not extract valid evaluation from response');
      }
      
      console.log('Successfully parsed evaluation from GPT response');
      
      // Ensure all required fields are present and have valid structure
      const mergedEvaluation = {
        ...evaluation,
        // Ensure scores are properly structured based on profile type
        ...(profileType === 'student' ? {
          // Student competencies
          academicCollaboration: ensureScoreObject(evaluation.academicCollaboration, 'Academic Collaboration'),
          learningEthics: ensureScoreObject(evaluation.learningEthics, 'Learning Ethics'),
          educationalLeadership: ensureScoreObject(evaluation.educationalLeadership, 'Educational Leadership'),
          studyGroupDynamics: ensureScoreObject(evaluation.studyGroupDynamics, 'Study Group Dynamics'),
          academicConflictResolution: ensureScoreObject(evaluation.academicConflictResolution, 'Academic Conflict Resolution'),
          classroomParticipation: ensureScoreObject(evaluation.classroomParticipation, 'Classroom Participation')
        } : {
          // Employee competencies (default)
          empathy: ensureScoreObject(evaluation.empathy, 'Empathy'),
          assertiveness: ensureScoreObject(evaluation.assertiveness, 'Assertiveness'),
          ethicalReasoning: ensureScoreObject(evaluation.ethicalReasoning, 'Ethical Reasoning'),
          collaboration: ensureScoreObject(evaluation.collaboration, 'Collaboration'),
          conflictResolution: ensureScoreObject(evaluation.conflictResolution, 'Conflict Resolution'),
          leadershipPotential: ensureScoreObject(evaluation.leadershipPotential, 'Leadership Potential'),
          // Optional employee competencies
          ...(evaluation.strategicThinking && { strategicThinking: ensureScoreObject(evaluation.strategicThinking, 'Strategic Thinking') }),
          ...(evaluation.adaptability && { adaptability: ensureScoreObject(evaluation.adaptability, 'Adaptability') })
        }),
        // Calculate overall score if not provided
        overallScore: typeof evaluation.overallScore === 'number' 
          ? evaluation.overallScore 
          : calculateOverallScore(evaluation, profileType),
        
        // Include career suggestions as returned by GPT (will be validated later)
        careerSuggestions: Array.isArray(evaluation.careerSuggestions) ? evaluation.careerSuggestions : [],
        
        // Ensure skills development data is properly structured
        recommendedSkills: (evaluation.recommendedSkills || []).map(skill => ({
          name: skill.name,
          level: skill.level,
          importance: skill.importance
        })),
        
        // Ensure next steps are properly formatted
        nextSteps: evaluation.nextSteps,
        
        // Ensure resources have proper structure
        recommendedResources: (evaluation.recommendedResources || []).map(resource => ({
          title: resource.title,
          type: resource.type,
          description: resource.description,
          link: resource.link
        }))
      };
      
      return mergedEvaluation;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('OpenAI API request timed out after 30 seconds');
        throw new Error('Request timed out. Please try again.');
      }
      console.error('Error in OpenAI API call:', error.message);
      throw error;
    }
  } catch (error) {
    console.error("Error evaluating with GPT:", error);
    // Throw the original error if evaluation fails
    console.error('Evaluation failed:', error);
    throw new Error('Failed to evaluate responses. Please try again.');
  }
}

// Helper function to ensure evaluation has all required fields
function ensureEvaluationStructure(evaluation, profileType) {
  if (!evaluation || typeof evaluation !== 'object') {
    console.error('Invalid evaluation object:', evaluation);
    throw new Error('Invalid evaluation data');
  }

  // Start with the evaluation data we have
  const safeEval = { ...evaluation };
  
  // Ensure recommendedSkills exists and has proper structure
  if (!Array.isArray(safeEval.recommendedSkills)) {
    safeEval.recommendedSkills = [];
  }
  
  // Ensure nextSteps exists and is an array
  if (!Array.isArray(safeEval.nextSteps)) {
    safeEval.nextSteps = [];
  }
  
  // If no recommended skills, add some default ones based on profile type
  if (safeEval.recommendedSkills.length === 0) {
    const defaultSkills = profileType === 'student' ? [
      { name: 'Time Management', level: 1.5, importance: 'High' },
      { name: 'Critical Thinking', level: 1.5, importance: 'High' },
      { name: 'Communication', level: 1.5, importance: 'High' }
    ] : [
      { name: 'Leadership', level: 1.5, importance: 'High' },
      { name: 'Project Management', level: 1.5, importance: 'High' },
      { name: 'Communication', level: 1.5, importance: 'High' }
    ];
    safeEval.recommendedSkills = defaultSkills;
  }
  
  // If no next steps, add some default ones
  if (safeEval.nextSteps.length === 0) {
    safeEval.nextSteps = [
      'Review your strengths and areas for improvement',
      'Set specific goals for skill development',
      'Seek feedback from peers or mentors',
      'Explore relevant learning resources'
    ];
  }
  
  // Define competencies for each profile type
  const competencies = {
    student: [
      'academicCollaboration', 'learningEthics', 'educationalLeadership',
      'studyGroupDynamics', 'academicConflictResolution', 'classroomParticipation'
    ],
    employee: [
      'empathy', 'assertiveness', 'ethicalReasoning',
      'collaboration', 'conflictResolution', 'leadershipPotential',
      'strategicThinking', 'adaptability'
    ]
  };

  // Ensure all competencies for the current profile type have valid score objects
  const currentCompetencies = competencies[profileType] || competencies.employee;
  
  currentCompetencies.forEach(comp => {
    try {
      if (safeEval[comp]) {
        safeEval[comp] = ensureScoreObject(safeEval[comp], comp);
      }
    } catch (e) {
      console.warn(`Error processing ${comp} score:`, e);
      // Don't fail the entire evaluation if one score is invalid
      safeEval[comp] = ensureScoreObject(null, comp);
    }
  });
  
  // Ensure we have an overall score
  if (typeof safeEval.overallScore !== 'number' || isNaN(safeEval.overallScore)) {
    safeEval.overallScore = calculateOverallScore(safeEval, profileType);
  } else {
    // Ensure overall score is between 0-10
    safeEval.overallScore = Math.max(0, Math.min(10, safeEval.overallScore));
  }
  
  // Ensure career suggestions have proper structure
  const ensureCareerSuggestion = (suggestion) => {
    if (!suggestion || typeof suggestion !== 'object') {
      throw new Error('Invalid career suggestion');
    }
    
    return {
      title: suggestion.title || '',
      description: suggestion.description || '',
      // keep whatever the model returned
      roles: Array.isArray(suggestion.roles) ? suggestion.roles : [],
      exampleRoles: Array.isArray(suggestion.exampleRoles) ? suggestion.exampleRoles : [],
      whyItFits: Array.isArray(suggestion.whyItFits) ? suggestion.whyItFits : [],
      growthPotential: suggestion.growthPotential || '',
      skillsToDevelop: Array.isArray(suggestion.skillsToDevelop) ? suggestion.skillsToDevelop : []
    };
  };

  // Ensure skills have proper structure
  const ensureSkill = (skill) => {
    if (!skill || typeof skill !== 'object') {
      throw new Error('Invalid skill object');
    }
    
    return {
      name: skill.name || '',
      level: Math.min(3, Math.max(0, skill.level)),
      importance: skill.importance || ''
    };
  };

  // Ensure resources have proper structure
  const ensureResource = (resource) => {
    if (!resource || typeof resource !== 'object') {
      throw new Error('Invalid resource object');
    }
    
    return {
      title: resource.title || '',
      type: resource.type || '',
      description: resource.description || '',
      link: resource.link || ''
    };
  };
  
  // Ensure industry fit has proper structure
  const ensureIndustryFit = (industry) => {
    if (!industry || typeof industry !== 'object') {
      throw new Error('Invalid industry object');
    }
    
    return {
      industry: industry.industry || '',
      fitScore: Math.min(10, Math.max(0, industry.fitScore)),
      reasons: Array.isArray(industry.reasons) ? industry.reasons : [],
      exampleRoles: Array.isArray(industry.exampleRoles) ? industry.exampleRoles : []
    };
  };
  
  // Calculate overall score if not present or invalid
  if (typeof safeEval.overallScore !== 'number' || safeEval.overallScore < 0 || safeEval.overallScore > 10) {
    safeEval.overallScore = calculateOverallScore(safeEval, profileType);
  }
  
  // Ensure arrays exist and are arrays with proper structure
  const ensureArray = (arr, defaultValue = []) => Array.isArray(arr) ? arr : defaultValue;
  
  // Common fields
  safeEval.strengths = ensureArray(safeEval.strengths);
  safeEval.areasToImprove = ensureArray(safeEval.areasToImprove);
  safeEval.keyTraits = ensureArray(safeEval.keyTraits);
  safeEval.strengthDetails = ensureArray(safeEval.strengthDetails);
  safeEval.improvementDetails = ensureArray(safeEval.improvementDetails);
  safeEval.nextSteps = ensureArray(safeEval.nextSteps);
  
  // Career development fields with index-based dynamic generation
  safeEval.careerSuggestions = ensureArray(safeEval.careerSuggestions)
    .map((suggestion, i) => ensureCareerSuggestion(suggestion, i));
    
  safeEval.recommendedSkills = ensureArray(safeEval.recommendedSkills)
    .map((skill, i) => ensureSkill(skill, i));
    
  safeEval.recommendedResources = ensureArray(safeEval.recommendedResources)
    .map((resource, i) => ensureResource(resource, i));
    
  safeEval.industryFit = ensureArray(safeEval.industryFit)
    .map((industry, i) => ensureIndustryFit(industry, i));
  
  // Profile type specific fields
  if (profileType === 'student') {
    safeEval.recommendedLearningStyles = ensureArray(safeEval.recommendedLearningStyles);
    safeEval.academicPathRecommendations = ensureArray(safeEval.academicPathRecommendations);
    safeEval.recommendedResources = ensureArray(safeEval.recommendedResources).map(ensureResource);
  } else {
    safeEval.careerPathRecommendations = ensureArray(safeEval.careerPathRecommendations);
    safeEval.roleFitRecommendations = ensureArray(safeEval.roleFitRecommendations);
    safeEval.industryFit = ensureArray(safeEval.industryFit).map(ensureIndustryFit);
  }
  
  // Ensure skills development advice exists
  if (typeof safeEval.skillsDevelopmentAdvice !== 'string') {
    safeEval.skillsDevelopmentAdvice = '';
  }
  
  return safeEval;
}

// API handler
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get data from request body
    const { userId, testId, responses, questions, profileType: requestProfileType } = req.body;
    let { email } = req.body;
    
    // Validate required fields
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data. Responses array is required.' 
      });
    }

    // Check if we have questions directly in the request
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data. Questions array is required.' 
      });
    }
    
    // Require either userId, email, or testId
    if (!userId && !email && !testId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either userId, email, or testId is required to save the test results.' 
      });
    }
    
    // Create a test object from the provided questions
    const test = {
      questions,
      profileType: requestProfileType || 'employee'
    };
    
    // Get profile type from the request or default to 'employee'
    const profileType = requestProfileType || 'employee';

    // Validate that all questions have been answered
    if (responses.length !== questions.length) {
      return res.status(400).json({ 
        success: false, 
        error: `All questions must be answered. Expected ${questions.length}, got ${responses.length}` 
      });
    }

    let evaluation;
    
    // Evaluate responses with GPT based on profile type
    try {
      console.log(`Starting evaluation for profile type: ${profileType}`);
      console.log(`Number of responses: ${responses.length}`);
      console.log(`Number of questions: ${questions.length}`);
      
      // Log the first response for debugging
      if (responses.length > 0) {
        console.log('Sample response:', JSON.stringify(responses[0], null, 2));
      }
      
      // Get evaluation from GPT
      evaluation = await evaluateWithGPT(test, responses, profileType);
      
      // Log the raw evaluation for debugging
      console.log('Raw evaluation from GPT:', JSON.stringify(evaluation, null, 2));
      
      // Ensure the evaluation has the correct structure
      evaluation = ensureEvaluationStructure(evaluation, profileType);
      
      // Log the structured evaluation for debugging
      console.log('Structured evaluation:', JSON.stringify({
        overallScore: evaluation.overallScore,
        competencies: Object.keys(evaluation).filter(k => 
          k !== 'overallScore' && 
          k !== 'analysis' && 
          k !== 'careerSuggestions' &&
          k !== 'recommendedResources' &&
          k !== 'nextSteps' &&
          k !== 'strengths' &&
          k !== 'areasToImprove'
        )
      }, null, 2));
      
    } catch (error) {
      console.error('Error in evaluation process:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.response && { response: error.response.data })
      });
      
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to evaluate responses: ' + (error.message || 'Unknown error occurred'),
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : undefined
      });
    }
    // Mark test as completed
    test.completed = true;
    test.isCompleted = true;
    test.completedAt = new Date();
    
    // Log the evaluation results for debugging
    console.log('Successfully parsed evaluation from GPT response');
    
    // Find or create the test record in the database
    let testRecord;
    let userIdToUse = userId;
    
    // If email is provided but userId is not, find the user by email
    if (!userIdToUse && email) {
      try {
        const user = await User.findOne({ email });
        if (user) {
          userIdToUse = user._id;
          console.log(`Found user with email ${email}, userId: ${userIdToUse}`);
        }
      } catch (error) {
        console.error('Error finding user by email:', error);
        // Continue without userId, we'll use email directly
      }
    }
    
    // Ensure we have an email, even if not provided
    if (!email) {
      email = `guest_${Date.now()}@example.com`;
      console.log('Using generated email for evaluation:', email);
    }
    
    // If testId is provided, find and update the existing test
    if (testId) {
      try {
        testRecord = await PsychometricTestNew.findById(testId);
        if (testRecord) {
          // Update the test record
          testRecord.completed = true;
          testRecord.isCompleted = true;
          testRecord.completedAt = new Date();
          testRecord.responses = responses.map(r => r.selectedOption);
          testRecord.reasonings = responses.map(r => r.reasoning || '');
          testRecord.results = evaluation;
          
          await testRecord.save();
          console.log(`Updated existing test record with ID: ${testRecord._id}`);
        } else {
          console.log(`Test with ID ${testId} not found, will create a new record`);
        }
      } catch (error) {
        console.error('Error finding or updating test by ID:', error);
        // Continue without testRecord, we'll create a new one
      }
    }
    
    // If no testRecord yet, create a new one
    if (!testRecord) {
      // Create test data object
      const testData = {
        profileType,
        questions,
        responses: responses.map(r => r.selectedOption),
        reasonings: responses.map(r => r.reasoning || ''),
        results: evaluation,
        completed: true,
        isCompleted: true,
        completedAt: new Date(),
        startTime: new Date(), // Fallback if no start time was recorded
        userEmail: email // Store email directly
      };
      
      // Only include userId if it's a valid MongoDB ObjectId
      if (userIdToUse && /^[0-9a-fA-F]{24}$/.test(userIdToUse)) {
        testData.userId = userIdToUse;
      }
      
      try {
        testRecord = new PsychometricTestNew(testData);
        await testRecord.save();
        console.log(`Created new test record with ID: ${testRecord._id}`);
      } catch (error) {
        console.error('Error creating new test record:', error);
        // Continue without testRecord
      }
    }
    
    // Save the response separately in the PsychometricResponse collection
    let newResponse = null; // Define newResponse outside the try block
    try {
      // Create response data object
      const responseData = {
        profileType,
        responses: responses.map((r, i) => ({
          questionIndex: i,
          selectedOption: r.selectedOption,
          reasoning: r.reasoning || ''
        })),
        results: {
          ...evaluation,
          isFallback: evaluation.isFallback || false
        },
        completedAt: new Date(),
        userEmail: email // Store email directly
      };
      
      // Add testId if available
      if (testRecord && testRecord._id) {
        responseData.testId = testRecord._id;
      }
      
      // Add userId if valid
      if (userIdToUse && /^[0-9a-fA-F]{24}$/.test(userIdToUse)) {
        responseData.userId = userIdToUse;
      }
      
      newResponse = new PsychometricResponseNew(responseData);
      
      await newResponse.save();
      console.log(`Saved response record with ID: ${newResponse._id}`);
    } catch (error) {
      console.error('Error saving response record:', error);
      // Continue without response record
    }

    // Prepare response data - send the complete evaluation directly
    const apiResponseData = {
      success: true,
      message: `${profileType === 'student' ? 'Student' : 'Professional'} psychometric test evaluated successfully`,
      profileType,
      testId: testRecord ? testRecord._id : null,
      responseId: newResponse ? newResponse._id : null,
      evaluation // Send the complete evaluation object
    };
    
    // Log the evaluation data being sent to the frontend
    console.log('Sending evaluation data to frontend:', JSON.stringify(evaluation).substring(0, 200) + '...');

    return res.status(200).json(apiResponseData);
    
  } catch (error) {
    console.error('Critical error in psychometric test evaluation:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error.response && { response: error.response.data }),
      request: {
        method: req.method,
        url: req.url,
        body: req.body ? { 
          ...req.body, 
          // Don't log the full responses in production
          responses: process.env.NODE_ENV === 'development' ? req.body.responses : 
            (req.body.responses ? `[${req.body.responses.length} responses]` : 'none')
        } : 'No body',
        query: req.query,
        params: req.params
      }
    });

    // Return a more detailed error response in development, generic in production
    const errorResponse = {
      success: false,
      error: 'An error occurred while processing your request',
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          message: error.message,
          name: error.name,
          ...(error.code && { code: error.code }),
          ...(error.errors && { errors: error.errors })
        }
      })
    };

    return res.status(500).json(errorResponse);
  }
}

// Apply database connection middleware only
export default connectDb(handler);
