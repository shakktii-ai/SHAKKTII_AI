import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const config = {
    runtime: 'nodejs',
    maxDuration: 300,
  };
// Helper function to determine the level-specific evaluation criteria
function getLevelSpecificEvaluationPrompt(difficulty, level) {
  let basePrompt = `You're evaluating a user's decision-making abilities based on their chosen responses to scenarios.`;
  
  if (difficulty === 'Beginner') {
    if (level <= 3) {
      return `${basePrompt} Focus on basic reasoning skills and whether they avoided clearly harmful choices. Be gentle in feedback, highlight positives, and provide simple, accessible guidance.`;
    } else if (level <= 7) {
      return `${basePrompt} Assess whether they considered basic consequences of actions and made reasonable choices. Balance positive feedback with constructive suggestions.`;
    } else {
      return `${basePrompt} Evaluate their ability to consider multiple perspectives and short-term consequences. Provide balanced feedback noting their developing decision skills.`;
    }
  } else if (difficulty === 'Moderate') {
    if (level <= 3) {
      return `${basePrompt} Evaluate their ability to balance competing priorities and make nuanced choices. Look for evidence of strategic thinking.`;
    } else if (level <= 7) {
      return `${basePrompt} Assess their ability to anticipate second-order consequences and analyze stakeholder impacts. Your feedback should be thorough but encouraging.`;
    } else {
      return `${basePrompt} Evaluate their grasp of complex trade-offs and ability to make decisions under uncertainty. Provide detailed, constructive feedback.`;
    }
  } else { // Expert
    if (level <= 3) {
      return `${basePrompt} Evaluate their application of ethical frameworks, strategic analysis, and ability to handle difficult trade-offs. Your feedback should be comprehensive.`;
    } else if (level <= 7) {
      return `${basePrompt} Assess their ability to make high-stakes decisions with incomplete information, balance competing values, and justify choices. Be rigorous but fair.`;
    } else {
      return `${basePrompt} Evaluate them at a leadership level - looking at visionary thinking, principled decision-making, and subtle judgment. Provide nuanced, expert-level feedback.`;
    }
  }
}

// Evaluate user responses to decision scenarios
async function evaluateDecisionResponses(difficulty, level, responses, scenarios, retryAttempt = 0) {
  try {
    const levelSpecificPrompt = getLevelSpecificEvaluationPrompt(difficulty, level);
    
    // Prepare scenario and response data for evaluation
    const scenarioResponsePairs = responses.map(response => {
      const matchingScenario = scenarios.find(s => s.scenarioId === response.scenarioId) || {};
      const chosenOption = matchingScenario.options?.find(o => o.id === response.selectedOption) || {};
      
      return {
        scenario: matchingScenario.description || response.scenario,
        title: matchingScenario.title || "Untitled Scenario",
        selectedOption: response.selectedOption,
        optionText: chosenOption.text || response.optionText,
        effectiveness: chosenOption.value || response.optionValue,
        reasoning: chosenOption.reasoning || "",
        consequences: chosenOption.consequences || "",
        timeSpent: response.timeSpent || 0
      };
    });

    const prompt = `
${levelSpecificPrompt}

Below are the real-world scenarios the user was presented with, along with their chosen responses:
${JSON.stringify(scenarioResponsePairs, null, 2)}

# 🎯 Evaluation Task
You are an expert decision-making analyst. Based on the user's responses to each scenario, perform a comprehensive evaluation. Format your output as a valid, structured JSON object with the following fields:

---

1. **"overallEvaluation"** – General assessment of decision-making performance:
- score: Percentage score (0–100) reflecting overall decision quality
- stars: Star rating (0–3) based on performance
- feedback: Concise, constructive summary of the user's decision-making strengths and weaknesses (2–3 sentences)
- strengths: Array of 3 bullet points describing the user's decision-making strengths (e.g., risk assessment, strategic thinking)
- improvements: Array of 3 bullet points with specific improvement areas (e.g., emotional regulation, long-term planning)
- decisionStyle: One-word label describing their decision-making style (e.g., "Analytical", "Impulsive", "Deliberate", "Adaptive")
- decisionQuality: Summary label for overall decision quality ("Excellent", "Good", "Fair", "Needs Improvement")

---

2. **"optionAnalysis"** – A general pattern-based analysis of the user's choices across all scenarios:
- What trends or habits are observable in their decisions?
- Did they consistently choose optimal, suboptimal, or emotionally-driven responses?
- How did they handle ethical dilemmas, risk, ambiguity, or trade-offs?

---

3. **"questionAnalysis"** – A detailed breakdown for each scenario:
An array of objects, each structured as:

{
"questionTitle": "Title or summary of the scenario",
  "bestOption": "Label of the best option (e.g., 'A') and brief justification of why it was optimal",
  "worstOption": "Label of the least effective option (e.g., 'D') and why it was poor",
  "userChoice": "Option the user selected (e.g., 'B')",
  "userChoiceQuality": "Feedback on the user's decision quality for this scenario – include reasoning",
  "alternativeOutcomes": "A short paragraph describing what might have happened if the user had picked a different option"
}


Respond ONLY with a single, valid JSON object matching the above structure.
`;

    const response = await openai.chat.completions.create({
      model:"gpt-4o",
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.5,
      max_tokens: 3000,
      response_format: { type: "json_object" } // Force JSON response
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Extract JSON part from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      if (retryAttempt < 2) {
        console.log(`Failed to extract valid JSON from OpenAI response. Retrying... (${retryAttempt + 1})`);
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryAttempt)));
        return evaluateDecisionResponses(difficulty, level, responses, scenarios, retryAttempt + 1);
      } else {
        throw new Error("Could not extract valid JSON after multiple attempts");
      }
    }
    
    const jsonString = jsonMatch[0];
    
    try {
      const evaluationResult = JSON.parse(jsonString);
      
      // Process questionAnalysis to ensure we have an entry for every scenario
      const processedQuestionAnalysis = scenarioResponsePairs.map((scenario, index) => {
        // Try to find matching analysis by title or index
        const matchedAnalysis = evaluationResult.questionAnalysis?.find(qa => 
          qa.questionTitle === scenario.title || 
          qa.questionTitle?.includes(scenario.title) ||
          qa.questionTitle === `Question ${index + 1}`
        );
        
        // If no match found, create a default analysis
        if (!matchedAnalysis) {
          return {
            questionId: scenario.scenarioId || `q${index + 1}`,
            questionTitle: scenario.title || `Question ${index + 1}`,
            bestOption: "The best option would balance short and long-term benefits.",
            worstOption: "Options with negative consequences are typically poor choices.",
            userChoice: scenario.optionText || 'Unknown',
            userChoiceQuality: "Your choice shows reasonable judgment.",
            alternativeOutcomes: "Different choices would lead to different outcomes."
          };
        }
        
        // Return matched analysis with fallbacks
        return {
          questionId: scenario.scenarioId || `q${index + 1}`,
          questionTitle: matchedAnalysis.questionTitle || scenario.title || `Question ${index + 1}`,
          bestOption: matchedAnalysis.bestOption || "The best option would balance short and long-term benefits.",
          worstOption: matchedAnalysis.worstOption || "Options with negative consequences are typically poor choices.",
          userChoice: matchedAnalysis.userChoice || scenario.optionText || 'Unknown',
          userChoiceQuality: matchedAnalysis.userChoiceQuality || "Your choice shows reasonable judgment.",
          alternativeOutcomes: matchedAnalysis.alternativeOutcomes || "Different choices would lead to different outcomes."
        };
      });

      // Make sure to include all fields with fallbacks
      return {
        overallEvaluation: evaluationResult.overallEvaluation || {
          score: evaluationResult.score || 70,
          stars: evaluationResult.stars || 2,
          feedback: evaluationResult.feedback || "Your decision-making shows potential. Consider the long-term impacts of your choices.",
          strengths: evaluationResult.strengths || ["You consider multiple perspectives."],
          improvements: evaluationResult.improvements || ["Try to analyze consequences more thoroughly."],
          decisionStyle: evaluationResult.decisionStyle || "Balanced",
          decisionQuality: evaluationResult.decisionQuality || "Good"
        },
        optionAnalysis: evaluationResult.optionAnalysis || "General analysis not available.",
        questionAnalysis: processedQuestionAnalysis
      };
    } catch (error) {
      if (retryAttempt < 2) {
        console.log(`Failed to parse JSON from OpenAI response. Retrying... (${retryAttempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryAttempt)));
        return evaluateDecisionResponses(difficulty, level, responses, scenarios, retryAttempt + 1);
      } else {
        throw new Error("Could not parse valid JSON after multiple attempts");
      }
    }
  } catch (error) {
    console.error("Error evaluating decision responses:", error);
    
    // Return default evaluation if there's an error
    return {
      overallEvaluation: {
        score: 70,
        stars: 2,
        feedback: "Your decision-making shows potential, though our evaluation system encountered an error.",
        strengths: ["You completed the decision scenarios."],
        improvements: ["Continue practicing your decision-making skills."],
        decisionStyle: "Balanced",
        decisionQuality: "Good"
      },
      optionAnalysis: "General analysis not available.",
      questionAnalysis: scenarioResponsePairs.map(scenario => ({
        questionId: scenario.scenario?.scenarioId || 'unknown',
        questionTitle: scenario.title || 'Scenario',
        bestOption: "The best option would balance short and long-term benefits.",
        worstOption: "Options with negative consequences are typically poor choices.",
        userChoice: scenario.optionText || 'Unknown',
        userChoiceQuality: "Your choice shows reasonable judgment.",
        alternativeOutcomes: "Different choices would lead to different outcomes."
      }))
    };
  }
}

// Update the user's progress for the decision-making practice
async function updateUserProgress(userId, difficulty, level, stars) {
  try {
    // Convert level to integer to ensure proper comparison
    const levelNum = parseInt(level, 10);
    
    console.log(`Updating progress for user ${userId}, level ${levelNum}, stars: ${stars}`);
    
    const apiUrl = `${process.env.API_URL || 'http://localhost:3000'}/api/updatePracticeProgress`;
    console.log(`Calling updatePracticeProgress API: ${apiUrl}`);
    
    const requestBody = {
      userId,
      skillArea: 'DecisionMaking',
      difficulty,
      level: levelNum,
      stars,
      completed: true,
      unlockNextLevel: true // Explicitly request next level to be unlocked
    };
    
    console.log('Sending update request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    let result;
    
    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      console.error('Error response from updatePracticeProgress:', {
        status: response.status,
        statusText: response.statusText,
        body: result
      });
      throw new Error(result.error || `Failed to update user progress: ${response.status} ${response.statusText}`);
    }
    
    console.log('Successfully updated progress:', result);
    return result;
  } catch (error) {
    console.error('Error updating user progress:', error);
    // Continue execution even if progress update fails
    return { success: false, error: error.message };
  }
}

// Main API handler
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // No token/auth required

  try {
    const { skillArea, difficulty, level, responses, scenarios = [] } = req.body;

    if (!skillArea || skillArea !== 'DecisionMaking') {
      return res.status(400).json({ success: false, error: 'Invalid skill area' });
    }

    if (!difficulty || !['Beginner', 'Moderate', 'Expert'].includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Invalid difficulty' });
    }

    if (!level || isNaN(level) || level < 1 || level > 10) {
      return res.status(400).json({ success: false, error: 'Invalid level' });
    }

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid responses' });
    }

    // Get user ID from token or request body
    // Use a generic guest ID if no userId is provided to avoid ObjectId casting errors
    const userId = req.body.userId || 'guest';
    
    // Evaluate the user's responses
    const evaluation = await evaluateDecisionResponses(difficulty, level, responses, scenarios);
    
    // Update user progress - with fallback if evaluation fails
    const stars = evaluation?.stars || 2;
    await updateUserProgress(userId, difficulty, level, stars);
    
    return res.status(200).json({
      success: true,
      evaluation,
      message: 'Decision responses evaluated successfully'
    });
  } catch (error) {
    console.error('Error in evaluateDecisionScenario API:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export default handler;
