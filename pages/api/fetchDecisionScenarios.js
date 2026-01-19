import { OpenAI } from 'openai';

// More robust OpenAI initialization with error checking
let openai;
let openaiInitialized = false;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    openaiInitialized = true;
    console.log('OpenAI client initialized successfully');
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

const count = 10;

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

/**
 * API handler for fetching decision scenarios
 * Fetches scenarios directly from OpenAI GPT API
 * (No authentication required)
 */
const handler = async (req, res) => {
  // Check if OpenAI is initialized before proceeding
  if (!openaiInitialized) {
    console.error('OpenAI client not initialized - missing API key');
    return res.status(500).json({
      success: false,
      error: 'API configuration error',
      message: 'Missing OpenAI API key. Please add your API key to the environment variables.',
      errorCode: 'MISSING_API_KEY'
    });
  }

  // Accept both GET and POST to be flexible
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  
  // Try to extract parameters from both query and body
  let difficulty, level;
  
  try {
    // Get parameters from either query (GET) or body (POST)
    difficulty = req.query.difficulty || (req.body && req.body.difficulty);
    level = parseInt(req.query.level || (req.body && req.body.level) || 1, 10);
    
    // Log minimal info to avoid large data in logs
    console.log(`Fetch request for ${difficulty} level ${level}`);
  } catch (error) {
    console.error('Error parsing request:', error.message);
    // If we can't parse the request, use defaults
    difficulty = 'Beginner';
    level = 1;
  }

  // Log additional debug info
  console.log('Request method:', req.method);
  console.log('Query parameters:', req.query);
  console.log('Body parameters:', req.body);
  
  // Always provide a response even if parameters are missing
  if (!difficulty) {
    difficulty = 'Beginner';
  }
  
  // Validate level is a number between 1 and 30
  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 30) {
    return res.status(400).json({ success: false, error: 'Level must be a number between 1 and 30.' });
  }

  try {
    // Check if OpenAI client was properly initialized
    if (!openaiInitialized) {
      // Send a clear error about the missing API key
      console.error('Cannot generate scenarios: OpenAI client not initialized');
      return res.status(500).json({ 
        success: false, 
        error: 'API configuration error - missing OpenAI API key',
        message: 'The server is missing the OpenAI API key in environment variables.'
      });
    }

    console.log(`Generating ${count} decision scenarios for ${difficulty} level ${levelNum}`);
    
    // Generate scenarios from GPT API
    const scenarios = await generateDecisionScenarios(difficulty, levelNum, count);
    
    if (!scenarios || scenarios.length === 0) {
      throw new Error('Failed to generate scenarios from GPT API');
    }

    // Format the scenarios for the response
    const formattedScenarios = scenarios.map((s, index) => ({
      scenarioId: s.scenarioId || `DM-${difficulty.charAt(0)}-${levelNum.toString().padStart(2, '0')}-${(index+1).toString().padStart(2, '0')}`,
      difficulty,
      level: levelNum,
      title: s.title || `Decision Scenario ${index + 1}`,
      description: s.description || `Make a decision for this scenario.`,
      options: s.options || [],
      category: s.category || 'general',
      timeLimit: 120 // 2 minutes per scenario
    }));
    
    // Create the response object
    const response = {
      success: true,
      scenarios: formattedScenarios
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error generating scenarios:', error.message);
    
    // Return a proper error response instead of fallback scenarios
    return res.status(500).json({
      success: false,
      error: 'Failed to generate scenarios from OpenAI API',
      message: error.message || 'An unexpected error occurred while generating scenarios',
      errorCode: 'GPT_GENERATION_FAILED'
    });
  }
};

/**
 * Generate decision scenarios using OpenAI GPT API
 * @param {string} difficulty - Beginner, Moderate, or Expert
 * @param {number} level - Level number (1-30)
 * @param {number} count - Number of scenarios to generate
 * @returns {Array} Array of scenario objects
 */
async function generateDecisionScenarios(difficulty, level, count) {
  // Determine complexity based on difficulty and level
  let complexity = "basic";
  if (difficulty === "Moderate" || (difficulty === "Beginner" && level > 7)) {
    complexity = "moderate";
  } else if (difficulty === "Expert" || (difficulty === "Moderate" && level > 7)) {
    complexity = "complex";
  }

  // Define detailed categories mapped to levels
  const levelCategories = {
    1: ["personal", "health"],
    2: ["family", "relationship"],
    3: ["social", "education"],
    4: ["sports", "entertainment"],
    5: ["career", "finance"],
    6: ["business", "technology"],
    7: ["legal", "ethical"],
    8: ["environment", "community"],
    9: ["leadership", "crisis-management"],
    10: ["global-issues", "strategic-thinking"]
  };

  // Get the appropriate categories for the current level (using modulo for levels > 10)
  const levelKey = ((level - 1) % 10) + 1;
  const availableCategories = levelCategories[levelKey] || ["general"];
  
  // Select a random category from the available ones for this level
  const category = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  
  // Construct the prompt
  const prompt = `Generate ${count} realistic decision-making scenario(s) for a ${difficulty.toLowerCase()} level ${level} practice exercise. 

The scenario should be ${complexity} in nature and related to ${category} decisions.

Each scenario should include:
- A descriptive title
- A detailed scenario description (2-3 paragraphs maximum)
- Exactly 4 possible options to choose from (labeled A, B, C, D)

Respond with ONLY valid JSON in this exact format with no additional text or explanation:
[
  {
    "title": "Scenario Title",
    "description": "Detailed scenario description...",
    "options": [
      "Option A: Description of first option",
      "Option B: Description of second option",
      "Option C: Description of third option",
      "Option D: Description of fourth option"
    ],
    "category": "${category}"
  }
]
`;

  try {
    // Check if openai was properly initialized
    if (!openai) {
      throw new Error('OpenAI client is not initialized - missing API key');
    }

    // Make the API call with reduced max tokens to prevent 431 errors
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system", 
        content: "You are a helpful assistant that generates decision-making scenarios in JSON format."
      },{
        role: "user", 
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 3000,  // Further limit token size to prevent 431 errors
      // Fixed response_format to work with all supported models
      response_format: { type: "json_object" }
    });

    // Parse the response
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from OpenAI");
      
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      
      // Check if the response has scenarios property
      let scenarios = Array.isArray(parsedContent) ? parsedContent : parsedContent.scenarios || [];
      
      if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new Error("Invalid scenarios format");
      }
      
      // Validate and normalize each scenario
      const validatedScenarios = scenarios.map(scenario => validateAndNormalizeScenario(scenario, category));
      return validatedScenarios;
      
    } catch (parseError) {
      console.error('Error parsing GPT response:', parseError);
      // No fallback - throw error to be handled by caller
      throw new Error(`Failed to parse GPT response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    // No fallback - throw error to be handled by caller
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Validates and normalizes a scenario object to ensure it has the required properties
 * @param {Object} scenario - The scenario object to validate
 * @param {string} category - Default category if not provided
 * @returns {Object} Normalized scenario object
 */
function validateAndNormalizeScenario(scenario, category) {
  // Ensure options array exists and has exactly 4 options
  if (!scenario.options || !Array.isArray(scenario.options)) {
    scenario.options = generateOptionsForScenario(scenario, category);
  } else if (scenario.options.length !== 4) {
    // If we have some options but not exactly 4, supplement or trim
    if (scenario.options.length < 4) {
      // Generate additional context-aware options
      const additionalOptions = generateOptionsForScenario(scenario, category, 4 - scenario.options.length);
      scenario.options = [...scenario.options, ...additionalOptions];
    } else {
      // Trim to 4 options
      scenario.options = scenario.options.slice(0, 4);
    }
  }

  // Convert options to objects with id and text properties for frontend compatibility
  scenario.options = scenario.options.map((opt, idx) => {
    const prefix = String.fromCharCode(65 + idx); // A, B, C, D
    let text;
    
    // Check if option is already in the right format or needs formatting
    if (typeof opt === 'string') {
      if (opt.startsWith(`Option ${prefix}:`) || opt.startsWith(`${prefix}:`)) {
        text = opt;
      } else {
        text = `Option ${prefix}: ${opt}`;
      }
    } else if (typeof opt === 'object' && opt.text) {
      // If it's already an object with text property, use that
      text = opt.text.startsWith(`Option ${prefix}:`) ? opt.text : `Option ${prefix}: ${opt.text}`;
    } else {
      text = `Option ${prefix}: No description provided`;
    }
    
    // Return option in the format expected by the frontend
    return {
      id: prefix,
      text: text,
      value: 0 // Default value
    };
  });

  // Set timeLimit if not present
  if (!scenario.timeLimit) {
    scenario.timeLimit = 120; // Default 2 minutes
  }

  return {
    title: scenario.title || "Decision Scenario",
    description: scenario.description || "Make a decision based on the given information.",
    options: scenario.options,
    timeLimit: scenario.timeLimit,
    category: scenario.category || category || "general",
  };
}

/**
 * Generate context-aware options for a scenario
 * @param {Object} scenario - The scenario object
 * @param {string} category - The category of the scenario
 * @param {number} count - Number of options to generate (default: 4)
 * @returns {Array} Array of option objects
 */
function generateOptionsForScenario(scenario, category, count = 4) {
  // Analyze scenario text to determine appropriate options
  const scenarioText = (scenario.description || '').toLowerCase();
  const isBusinessScenario = category === 'business' || 
    scenarioText.includes('company') || 
    scenarioText.includes('business') || 
    scenarioText.includes('market') ||
    scenarioText.includes('client') ||
    scenarioText.includes('investor');
  
  const isEthical = category === 'ethical' || 
    scenarioText.includes('ethical') ||
    scenarioText.includes('moral') ||
    scenarioText.includes('dilemma') ||
    scenarioText.includes('values');
  
  let optionTexts;
  if (isBusinessScenario) {
    optionTexts = [
      "Option A: Pursue maximum profit potential regardless of risk",
      "Option B: Take a balanced approach weighing both risk and opportunity",
      "Option C: Focus on long-term stability over short-term gains",
      "Option D: Seek additional information before making a decision"
    ].slice(0, count);
  } else if (isEthical) {
    optionTexts = [
      "Option A: Choose the path that benefits the most people",
      "Option B: Adhere strictly to ethical principles regardless of outcome",
      "Option C: Find a compromise that balances competing interests",
      "Option D: Decline to make this decision as it presents ethical concerns"
    ].slice(0, count);
  } else {
    // Default personal/general options
    optionTexts = [
      "Option A: Take immediate action with available information",
      "Option B: Gather more information before deciding",
      "Option C: Delegate the decision to someone with more expertise",
      "Option D: Postpone the decision until circumstances change"
    ].slice(0, count);
  }
  
  // Convert text options to objects with id and text properties
  return optionTexts.map((text, index) => {
    const prefix = String.fromCharCode(65 + index); // A, B, C, D
    return {
      id: prefix,
      text: text,
      value: 0 // Default value
    };
  });
}

// Fallback scenario function removed to ensure all scenarios come from OpenAI API

export default handler;
