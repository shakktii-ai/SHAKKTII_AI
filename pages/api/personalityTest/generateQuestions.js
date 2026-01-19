import { OpenAI } from 'openai';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Always return exactly 10 questions
    const count = 10;
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return res.status(500).json({ 
        error: 'OpenAI API key is not configured. Please check your server configuration.'
      });
    }

    const prompt = [
      `Generate exactly ${count} personality test questions that assess various personality traits.`,
      '- Each question must have exactly 5 response options: Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree.',
      '- Questions should cover different aspects of personality including but not limited to:',
      '  - Social behavior (introversion/extraversion)',
      '  - Decision making (thinking/feeling)',
      '  - Approach to planning (judging/perceiving)',
      '  - Response to stress and change',
      '  - Interpersonal relationships',
      '  - Work style and preferences',
      '  - Emotional intelligence',
      '  - Creativity and problem-solving',
      '  - Values and beliefs',
      '',
      'CRITICAL INSTRUCTIONS:',
      '1. Return ONLY a valid JSON array of question objects, nothing else',
      '2. Do not include any markdown formatting (no ```json or ```)',
      '3. Ensure the response is properly closed with matching brackets',
      '4. Each question object must have:',
      '   - text: The question text (string)',
      '   - options: An array of exactly 5 option objects, each with "value" (number 1-5) and "text" (string) properties',
      '5. Make sure all strings are properly escaped',
      '6. Do not include any trailing commas',
      '7. The response must be valid JSON that can be parsed with JSON.parse()',
      '',
      'Example of required format:',
      JSON.stringify([
        {
          text: "I enjoy meeting new people and socializing in large groups.",
          options: [
            { value: 1, text: "Strongly Disagree" },
            { value: 2, text: "Disagree" },
            { value: 3, text: "Neutral" },
            { value: 4, text: "Agree" },
            { value: 5, text: "Strongly Agree" }
          ]
        }
      ], null, 2)
    ].join('\n');

    const systemPrompt = [
      'You are a precise JSON generator for personality test questions.',
      '- Your response must be a valid JSON array of question objects.',
      '- Do not include any markdown formatting or additional text.',
      '- Ensure all brackets are properly closed and all strings are properly escaped.',
      '- The response must be parseable by JSON.parse().'
    ].join(' ');

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 3000
    });

    // Get the raw content from the response
    const content = response.choices[0]?.message?.content?.trim() || '';
    console.log('Raw AI response received, length:', content.length);
    
    if (!content) {
      throw new Error('Empty response from AI service');
    }

    // Helper function to safely parse JSON with detailed error logging
    const safeJsonParse = (jsonString) => {
      try {
        return { success: true, data: JSON.parse(jsonString) };
      } catch (error) {
        const position = error.message.match(/(\d+)/)?.[0] || 'unknown';
        return { success: false, error, position };
      }
    };

    // First try parsing directly
    let result = safeJsonParse(content);
    
    // If direct parse fails, try cleaning up the response
    if (!result.success) {
      console.log('Initial parse failed, attempting cleanup...');
      
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        console.log('Found code block, extracting...');
        result = safeJsonParse(codeBlockMatch[1]);
      }
      
      // If still failing, try to extract JSON array/object
      if (!result?.success) {
        console.log('Trying to extract JSON from text...');
        const jsonMatch = content.match(/(\[\s*\{[\s\S]*?\}\s*\])|(\{[\s\S]*?\})/);
        if (jsonMatch) {
          result = safeJsonParse(jsonMatch[0]);
        }
      }
      
      // If we have a position, try to fix common issues
      if (!result?.success) {
        console.log('Attempting to fix JSON...');
        try {
          // Try to fix common JSON issues
          let fixed = content;
          // Remove trailing commas
          fixed = fixed.replace(/,+(\s*[}\]])/g, '$1');
          // Fix unescaped quotes
          fixed = fixed.replace(/([^\\])"(\s*:)/g, '$1\\"$2');
          // Fix missing quotes around property names
          fixed = fixed.replace(/([{\s,])(\w+)\s*:/g, '$1"$2":');
          
          result = safeJsonParse(fixed);
        } catch (e) {
          console.error('Error during JSON fix attempt:', e);
        }
      }
    }
    
    let questions = [];
    
    if (!result.success) {
      console.error('Failed to parse JSON after all attempts');
      console.error('Error position:', result.position);
      console.error('Content around error:', 
        content.substring(
          Math.max(0, (parseInt(result.position) || 0) - 50), 
          Math.min(content.length, (parseInt(result.position) || 0) + 50)
        )
      );
      throw new Error('Failed to parse AI response as valid JSON');
    }
    
    // Handle different possible response formats
    if (Array.isArray(result.data)) {
      console.log('Parsed as array of questions');
      questions = result.data;
    } else if (result.data?.questions && Array.isArray(result.data.questions)) {
      console.log('Parsed as object with questions array');
      questions = result.data.questions;
    } else if (result.data && typeof result.data === 'object') {
      console.log('Parsed as single question object');
      questions = [result.data];
    } else {
      console.error('Unexpected response format from AI:', result.data);
      throw new Error('Unexpected response format from AI');
    }
    
    // Ensure we have exactly the requested number of questions
    if (questions.length > count) {
      questions = questions.slice(0, count);
    } else if (questions.length < count) {
      console.warn(`Warning: Only generated ${questions.length} questions out of requested ${count}`);
    }

    // Ensure each question has the correct structure
    const validatedQuestions = questions.map((q, index) => {
      try {
        // Ensure the question has text
        if (!q.text || typeof q.text !== 'string') {
          throw new Error(`Question at index ${index} is missing valid text`);
        }
        
        // Ensure options exist and is an array
        if (!Array.isArray(q.options) || q.options.length !== 5) {
          throw new Error(`Question "${q.text}" must have exactly 5 options`);
        }
        
        // Validate each option
        const validatedOptions = q.options.map((opt, optIndex) => {
          if (typeof opt !== 'object' || !opt || !('value' in opt) || !('text' in opt)) {
            throw new Error(`Invalid option at index ${optIndex} in question "${q.text}"`);
          }
          return {
            value: Number(opt.value) || 0,
            text: String(opt.text || '')
          };
        });
        
        return {
          id: index + 1,
          text: q.text.trim(),
          options: validatedOptions
        };
      } catch (error) {
        console.error(`Error processing question at index ${index}:`, error);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    });
    
    return res.status(200).json(validatedQuestions);
  } catch (error) {
    console.error('Error generating personality test questions:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate personality test questions',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
