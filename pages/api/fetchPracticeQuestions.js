import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

/**
 * API handler for fetching practice questions
 * Fetches questions directly from OpenAI GPT API
 */
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
  
  const { skillArea, difficulty, count = 5, level = 1, cacheBuster } = req.body;

  if (!skillArea || !difficulty) {
    return res.status(400).json({ success: false, error: 'Skill area and difficulty are required.' });
  }
  
  // Validate level is a number between 1 and 30
  const levelNum = parseInt(level, 10);
  if (isNaN(levelNum) || levelNum < 1 || levelNum > 30) {
    return res.status(400).json({ success: false, error: 'Level must be a number between 1 and 30.' });
  }

  try {
    console.log(`Generating ${count} ${skillArea} questions for ${difficulty} level ${levelNum}`);
    
    // Generate questions from GPT API
    const questions = await generatePracticeQuestions(skillArea, difficulty, levelNum, count);
    
    if (!questions || questions.length === 0) {
      throw new Error('Failed to generate questions from GPT API');
    }

    // Format the questions for the response
    const formattedQuestions = questions.map((q, index) => ({
      cardId: q.cardId || `${skillArea.charAt(0)}-${difficulty.charAt(0)}-${levelNum.toString().padStart(2, '0')}-${(index+1).toString().padStart(2, '0')}`,
      skillArea,
      difficulty,
      level: levelNum,
      instructions: q.instructions || `Read the following content and answer the question.`,
      content: q.content || `Practice content for ${skillArea} exercise`,
      questionText: q.questionText || `What is the main information in this ${skillArea.toLowerCase()} content?`,
      expectedResponse: q.expectedResponse || "Expected response not provided.",
      options: q.options || [],
      timeLimit: q.timeLimit || 120,
      evaluationCriteria: q.evaluationCriteria || {
        basic: "Basic level performance",
        intermediate: "Intermediate level performance",
        advanced: "Advanced level performance"
      },
      imageUrl: q.imageUrl || "",
      audioUrl: q.audioUrl || ""
    }));

    return res.status(200).json({
      success: true,
      message: 'Questions generated successfully.',
      questions: formattedQuestions,
      count: formattedQuestions.length
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate questions. Please try again.'
    });
  }
};

/**
 * Function to generate practice questions using the OpenAI GPT API
 * @param {string} skillArea - The skill area for the questions (Speaking, Listening, etc.)
 * @param {string} difficulty - The difficulty level (Beginner, Moderate, Expert)
 * @param {number} level - The specific level number (1-30) within the difficulty tier
 * @param {number} count - Number of questions to generate
 * @param {number} retryAttempt - Current retry attempt number
 * @param {string} seed - Optional seed for ensuring different results
 * @returns {Promise<Array>} - Array of practice question objects
 */
async function generatePracticeQuestions(skillArea, difficulty, level, count, retryAttempt = 0, seed = null) {
  const url = 'https://api.openai.com/v1/chat/completions';

  // Get API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables.');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // Create prompt based on skill area, difficulty, and specific level, adjusting for retry attempts
  const levelRanges = {
    'Beginner': { min: 1, max: 10 },
    'Moderate': { min: 11, max: 20 },
    'Expert': { min: 21, max: 30 }
  };
  
  const levelRange = levelRanges[difficulty] || { min: 1, max: 30 };
  const relativeLevel = ((level - levelRange.min) / (levelRange.max - levelRange.min + 1)) * 100;
  
  let prompt = `Generate exactly ${count} UNIQUE and DIVERSE ${difficulty} level ${skillArea} assessment cards for language testing at level ${level} (${relativeLevel.toFixed(0)}% through ${difficulty} tier).

For each card, include these EXACT fields in JSON format:
{
  "cardId": "[skill-difficulty-level-number]" (e.g., "L-B-01-01" for Listening-Beginner-Level 1-Question 1)
  "instructions": "[Clear, level-appropriate instructions]"
  "content": "[The main content or scenario]"
  "questionText": "[A SPECIFIC question about the content]"
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"] (if applicable)
  "expectedResponse": "[Sample answer or correct option index]"
  "timeLimit": [time in seconds]
  "evaluationCriteria": ["Basic criteria", "Intermediate criteria", "Advanced criteria"]
}

CRITICAL REQUIREMENTS:
1. Each question MUST be COMPLETELY UNIQUE - different topics, scenarios, and contexts
2. Questions MUST be precisely calibrated for level ${level} (${difficulty} tier, ${relativeLevel.toFixed(0)}% progression)
3. For Listening: Vary accents, speeds, and contexts (conversations, announcements, lectures, etc.)
4. For Speaking: Include diverse prompts requiring different response types (descriptions, opinions, stories, etc.)
5. For Reading: Use varied text types (stories, articles, emails, etc.) with appropriate complexity
6. For Writing: Include diverse writing tasks (emails, stories, opinions, etc.) with clear requirements

LEVEL-SPECIFIC DIFFICULTY GUIDELINES:
- Levels 1-5: Simple vocabulary, basic structures, familiar topics, slow pace
- Levels 6-10: Common expressions, simple sentences, everyday situations, moderate pace
- Levels 11-15: Some complex structures, varied vocabulary, general knowledge topics
- Levels 16-20: Complex sentences, idiomatic expressions, abstract concepts
- Levels 21-25: Nuanced language, specialized vocabulary, implicit meaning
- Levels 26-30: Native-level complexity, sophisticated language, subtle distinctions

FOR LISTENING PRACTICE:
- Create diverse audio context descriptions on varied topics (weather, news, conversations, interviews, lectures, etc.)
- For each question, generate a UNIQUE question that tests a DIFFERENT aspect of listening comprehension
- NEVER use the generic question "What is the main topic of the audio?" repeatedly

*** CRITICAL REQUIREMENT: EVERY LISTENING PRACTICE QUESTION MUST INCLUDE THE 'questionText' FIELD ***
- This field MUST contain a specific question about the audio content (not just instructions)
- Example for content "The teacher says, 'Please take out your books and turn to page 20.'"
  * GOOD questionText: "What page number did the teacher ask students to turn to?"
  * BAD: leaving questionText blank or using generic text

- Include varied question types such as:
  * Questions about specific details mentioned ("What time does the train depart?") 
  * Questions about speaker attitudes ("How does the speaker feel about the new policy?")
  * Questions requiring inference ("What will likely happen next based on the conversation?")
  * Questions about purpose ("Why did the speaker mention the statistics?")
  * Questions about relationships ("How do the speakers know each other?")

LEVEL-SPECIFIC GUIDELINES FOR LISTENING PRACTICE:
- Levels 1-5: Simple comprehension of basic information, familiar topics, slow speech
- Levels 6-10: Understanding main points, basic opinions, everyday situations
- Levels 11-15: Comprehension of extended speech, implicit meanings, varied accents
- Levels 16-20: Understanding complex arguments, technical discussions, faster speech
- Levels 21-25: Comprehension of abstract concepts, idiomatic expressions, inferring meaning
- Levels 26-30: Understanding specialized topics, nuanced opinions, rapid native-level speech

FOR SPEAKING PRACTICE:
- Create varied prompts on different topics (family, hobbies, travel, food, education, etc.)
- Each prompt should be unique - DO NOT repeat similar scenarios
- Ensure the difficulty and complexity match exactly with level ${level} out of 30

LEVEL-SPECIFIC GUIDELINES FOR SPEAKING PRACTICE:
- Levels 1-5: Simple self-introduction, daily routines, favorite things, basic descriptions of familiar objects
- Levels 6-10: Personal preferences, past experiences, simple opinions on familiar topics
- Levels 11-15: Detailed descriptions, comparisons, expressing opinions with reasons
- Levels 16-20: Discussing advantages/disadvantages, explaining processes, making recommendations
- Levels 21-25: Constructing arguments, discussing abstract concepts, hypothetical scenarios
- Levels 26-30: Complex debates, presenting nuanced viewpoints, academic/professional discussions

For level ${level} specifically, focus on ${getLevelSpecificInstructions(level, difficulty)}

FOR READING PRACTICE:
- Include a short passage or story appropriate for the level
- ALWAYS include a specific question that tests comprehension of the passage
- The question should be different from the instructions
- ALWAYS include exactly 4 multiple-choice options for the answer
- Make sure one and only one option is correct
- For beginner levels, ask simple questions about main ideas or specific details
- For moderate levels, ask questions about implied meaning and relationships
- For expert levels, ask questions about inference, analysis, or drawing conclusions

Example Reading Practice format:
[
  {
    "cardId": "R-B-${level.toString().padStart(2, '0')}-01",
    "instructions": "Read the passage and answer the question below.",
    "content": "Mary went to the store to buy some milk. On her way home, she saw her friend John. They talked for a few minutes about school.",
    "questionText": "Where did Mary go?",  // THIS SHOULD BE A REAL QUESTION ABOUT THE CONTENT, NOT INSTRUCTIONS
    "options": ["To the park", "To the store", "To school", "To John's house"],
    "expectedResponse": "To the store",
    "timeLimit": 30,
    "level": ${level},
    "evaluationCriteria": [
      "Basic understanding of explicit information in the text",
      "Accurate comprehension with supporting details",
      "Full understanding with ability to recall specific details"
    ]
  }
]

IMPORTANT REQUIREMENTS:
1. The questionText must be a SPECIFIC, CONTENT-BASED question, NOT general instructions
2. GOOD example: "What was the main reason for the character's decision?"
3. BAD example: "Answer the following question about the text"
4. Questions must be answerable ONLY by reading/listening to the provided content
5. For multiple choice: Include exactly 4 options with one clearly correct answer
6. Ensure questions test different comprehension skills (main idea, details, inference, vocabulary in context, etc.)
7. Vary question types (wh- questions, true/false, multiple choice, fill-in, etc.)
8. Ensure content is culturally appropriate and accessible
9. For Listening: Include natural speech patterns and realistic scenarios
10. For Speaking: Provide clear, engaging prompts that encourage extended responses

IMPORTANT: Your response must be a valid JSON array of question objects. Do not include any markdown formatting, code blocks, or explanatory text.`;
  
  // Add additional instruction for retry attempts to improve chances of success
  if (retryAttempt > 0) {
    prompt += `\n\nThis is retry attempt #${retryAttempt}. Previous attempts failed to generate valid JSON. PLEASE ONLY RETURN A VALID JSON ARRAY WITH NO EXPLANATIONS OR OTHER TEXT. DO NOT INCLUDE CODE BLOCKS, MARKDOWN FORMATTING, OR ANY TEXT OUTSIDE THE JSON ARRAY.`;
  }

  const payload = {
    model: "gpt-4o", // Using GPT-4-turbo for better handling of structured outputs
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: "json_object" }, // Tell GPT to strictly return JSON
    seed: seed ? parseInt(seed) % 1000000 : undefined, // Use seed if provided for varied results
    messages: [
      {
        role: "system",
        content: "You are a specialized AI for creating educational content. Your task is to generate practice questions in valid JSON format. ONLY respond with valid JSON, no markdown, no extra text."
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    console.log(`Attempting to generate ${count} ${difficulty} ${skillArea} questions from GPT API (attempt ${retryAttempt + 1})`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', responseData);
      throw new Error(`OpenAI API returned an error: ${responseData?.error?.message || 'Unknown error'}`);
    }
    
    if (responseData?.choices?.[0]?.message?.content) {
      const jsonContent = responseData.choices[0].message.content;
      
      // Log only the first 100 characters of the response to avoid console pollution
      console.log(`GPT response (preview): ${jsonContent.substring(0, 100)}...`);
      
      // Strategy 1: Try to parse the entire response directly
      try {
        const parsedData = JSON.parse(jsonContent.trim());
        let questions = [];
        
        // Check if parsedData is an object with a questions key
        if (parsedData.questions && Array.isArray(parsedData.questions) && parsedData.questions.length > 0) {
          questions = parsedData.questions;
          console.log(`Successfully parsed GPT response with ${questions.length} items in 'questions' property`);
        }
        // Or if it's a direct array
        else if (Array.isArray(parsedData) && parsedData.length > 0) {
          questions = parsedData;
          console.log(`Successfully parsed full GPT response directly as JSON array with ${questions.length} items`);
        }
        
        // Ensure we have the exact number of questions requested
        if (questions.length > 0) {
          // If we got more questions than needed, take the first 'count' questions
          if (questions.length > count) {
            console.log(`Returning first ${count} of ${questions.length} questions`);
            return questions.slice(0, count);
          }
          // If we got exactly the number needed, return them
          else if (questions.length === count) {
            return questions;
          }
          // If we got some questions but not enough, we'll proceed to generate more
          else {
            console.log(`Got ${questions.length} questions, need ${count - questions.length} more`);
            const remainingCount = count - questions.length;
            const additionalQuestions = await generatePracticeQuestions(
              skillArea, 
              difficulty, 
              level, 
              remainingCount, 
              retryAttempt + 1, 
              `${seed || ''}${retryAttempt}` // Add retry attempt to seed for variety
            );
            
            if (additionalQuestions && additionalQuestions.length > 0) {
              return [...questions, ...additionalQuestions].slice(0, count);
            }
            // If we couldn't get more questions, return what we have
            return questions;
          }
        }
      } catch (directParseErr) {
        console.log('Direct JSON parse failed, trying extraction methods');
      }
      
      // Strategy 2: Try to extract JSON from markdown code blocks
      const codeBlockMatches = jsonContent.match(/```(?:json)?([\s\S]*?)```/g);
      if (codeBlockMatches && codeBlockMatches.length > 0) {
        for (const block of codeBlockMatches) {
          try {
            // Extract content between code block markers and parse
            const codeContent = block.replace(/```(?:json)?|```/g, '').trim();
            const parsedData = JSON.parse(codeContent);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`Successfully extracted JSON from code block with ${parsedData.length} items`);
              return parsedData;
            }
            // Check if it's wrapped in a property
            else if (parsedData.questions && Array.isArray(parsedData.questions)) {
              return parsedData.questions;
            }
          } catch (blockErr) {
            console.log('Failed to parse code block as JSON, trying next block');
          }
        }
      }
      
      // Strategy 3: Try to find JSON array pattern with [ ... ] brackets
      try {
        // Find all content between square brackets including nested brackets
        // This more complex regex tries to match complete JSON arrays
        const regex = /\[(\s*\{[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?\}\s*)*)?\]/g;
        const arrayMatches = jsonContent.match(regex);
        
        if (arrayMatches && arrayMatches.length > 0) {
          // Try each match until we find valid JSON
          for (const match of arrayMatches) {
            try {
              // Check if this looks like a JSON array with objects
              if (match.includes('{') && match.includes('}')) {
                const parsedData = JSON.parse(match);
                if (Array.isArray(parsedData) && parsedData.length > 0) {
                  console.log(`Successfully extracted JSON array with bracket matching: ${parsedData.length} items`);
                  return parsedData;
                }
              }
            } catch (err) {
              // Continue to next match if parsing fails
              console.log('Failed to parse potential JSON match');
            }
          }
        }
        
        // Strategy 4: Last resort - try to build the JSON manually by looking for key patterns
        console.log('Attempting to manually reconstruct JSON from text');
        if (jsonContent.includes('"cardId"') && jsonContent.includes('"instructions"')) {
          const manualMatches = jsonContent.match(/\{[\s\S]*?"cardId"[\s\S]*?\}/g);
          if (manualMatches && manualMatches.length > 0) {
            try {
              // Build a JSON array from the individual object matches
              const reconstructed = `[${manualMatches.join(',')}]`;
              let questions = JSON.parse(reconstructed);
              
              if (Array.isArray(questions) && questions.length > 0) {
                console.log(`Successfully reconstructed JSON array manually with ${questions.length} items`);
                
                // Ensure we have the exact number of questions requested
                if (questions.length >= count) {
                  return questions.slice(0, count);
                } else {
                  // If we got some questions but not enough, we'll proceed to generate more
                  console.log(`Got ${questions.length} questions, need ${count - questions.length} more`);
                  const remainingCount = count - questions.length;
                  const additionalQuestions = await generatePracticeQuestions(
                    skillArea, 
                    difficulty, 
                    level, 
                    remainingCount, 
                    retryAttempt + 1, 
                    `${seed || ''}${retryAttempt}`
                  );
                  
                  if (additionalQuestions && additionalQuestions.length > 0) {
                    return [...questions, ...additionalQuestions].slice(0, count);
                  }
                }
                return questions;
              }
            } catch (reconstructErr) {
              console.log('Failed to reconstruct JSON manually:', reconstructErr);
            }
          }
        }
        
        // If all extraction methods fail, return null to trigger a retry
        console.log('All JSON extraction methods failed');
        return null;
      } catch (jsonError) {
        console.error('JSON extraction error:', jsonError);
        throw new Error(`Failed to extract JSON from GPT API response: ${jsonError.message}`);
      }
    } else {
      console.error('Unexpected GPT API response format:', responseData);
      throw new Error('GPT API returned an unexpected response format');
    }
  } catch (error) {
    console.error('Error calling GPT API:', error);
    throw new Error(`Failed to connect to GPT API: ${error.message}`);
  }
}

/**
 * Helper function to generate level-specific instructions for speaking practice
 * @param {number} level - Level number (1-30)
 * @param {string} difficulty - Difficulty tier (Beginner, Moderate, Expert)
 * @returns {string} - Specific instructions for this level
 */
function getLevelSpecificInstructions(level, difficulty) {
  // Convert level to a 1-10 scale within each difficulty tier
  let tierLevel = 0;
  
  if (difficulty === 'Beginner') {
    tierLevel = Math.min(Math.max(level, 1), 10); // 1-10
  } else if (difficulty === 'Moderate') {
    tierLevel = Math.min(Math.max(level - 10, 1), 10); // 11-20 → 1-10
  } else { // Expert
    tierLevel = Math.min(Math.max(level - 20, 1), 10); // 21-30 → 1-10
  }
  
  // Define specific instructions for different level ranges
  if (difficulty === 'Beginner') {
    if (tierLevel <= 3) {
      return "very simple questions about personal information, daily routines, and basic descriptions using elementary vocabulary and simple present tense";
    } else if (tierLevel <= 6) {
      return "simple questions about likes/dislikes, family, hobbies, and basic past experiences using common vocabulary and simple present/past tenses";
    } else if (tierLevel <= 9) {
      return "moderately simple questions about recent activities, future plans, and preferences with some supporting details using basic compound sentences";
    } else {
      return "straightforward questions requiring brief opinions, comparisons, and descriptions using present, past and future tenses with some detail";
    }
  } else if (difficulty === 'Moderate') {
    if (tierLevel <= 3) {
      return "questions requiring explanations of preferences, detailed descriptions, and personal experiences with reasons and examples";
    } else if (tierLevel <= 6) {
      return "questions about hypothetical situations, detailed comparisons, and explanations of processes using varied vocabulary and complex sentences";
    } else if (tierLevel <= 9) {
      return "questions requiring expression of opinions with supporting arguments, detailed narratives, and explanation of advantages/disadvantages";
    } else {
      return "challenging questions about social issues, personal choices with consequences, and detailed explanations of complex topics";
    }
  } else { // Expert
    if (tierLevel <= 3) {
      return "complex questions requiring well-structured arguments, detailed analysis of issues, and nuanced opinions with supporting evidence";
    } else if (tierLevel <= 6) {
      return "sophisticated questions about abstract concepts, hypothetical scenarios with multiple factors, and detailed persuasive arguments";
    } else if (tierLevel <= 9) {
      return "highly challenging questions requiring critical analysis, evaluation of complex issues from multiple perspectives, and coherent, well-structured responses";
    } else {
      return "extremely demanding questions requiring academic-level discourse, sophisticated analysis of complex issues, and presentation of nuanced arguments with precise vocabulary";
    }
  }
}

// Export the handler as default
export default handler;
