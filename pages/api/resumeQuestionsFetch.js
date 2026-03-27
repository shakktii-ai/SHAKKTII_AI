// // pages/api/resumeQuestionsFetch.js
// // Accepts a base64-encoded PDF resume + difficulty level.
// // Extracts text from the PDF using pdf-parse, then sends it to OpenAI
// // to generate resume-specific interview questions.

// export const config = {
//   runtime: 'nodejs',
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { resumeBase64, level } = req.body;

//   if (!resumeBase64 || !level) {
//     return res.status(400).json({ error: 'Resume (base64) and level are required.' });
//   }

//   try {
//     // Convert base64 back to Buffer for pdf-parse
//     const pdfBuffer = Buffer.from(resumeBase64, 'base64');

//     // Extract text from PDF using pdf-parse
//     // Install: npm install pdf-parse
//     const pdfParse = require('pdf-parse');
//     const pdfData = await pdfParse(pdfBuffer);
//     const resumeText = pdfData.text;

//     if (!resumeText || resumeText.trim().length < 50) {
//       return res.status(400).json({ error: 'Could not extract sufficient text from the resume PDF. Please ensure the PDF is not scanned/image-based.' });
//     }

//     console.log(`Extracted ${resumeText.length} characters from resume PDF`);

//     // Generate questions from resume text
//     const questions = await getResumeBasedQuestions(resumeText, level);

//     if (questions) {
//       console.log('Resume-based questions fetched successfully');
//       return res.status(200).json({
//         message: 'Resume parsed. Questions fetched successfully.',
//         questions,
//       });
//     } else {
//       return res.status(500).json({ error: 'No questions fetched from OpenAI API.' });
//     }
//   } catch (error) {
//     console.error('Error during resume processing:', error);
//     return res.status(500).json({ error: `Error during processing: ${error.message}` });
//   }
// }

// async function getResumeBasedQuestions(resumeText, level) {
//   const url = 'https://api.openai.com/v1/chat/completions';

//   const apiKey = process.env.OPENAI_API_KEY;

//   if (!apiKey) {
//     console.error('OpenAI API key is missing.');
//     return null;
//   }

//   const headers = {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${apiKey}`,
//   };

//   // Truncate resume text to avoid exceeding token limits (keep first ~3000 chars)
//   const truncatedResume = resumeText.substring(0, 3000);

//   const prompt = `You are an expert technical interviewer. Based on the following resume, generate 10 highly relevant interview questions tailored specifically to this candidate's background, skills, projects, and experience. 

// The questions should be at the "${level}" difficulty level and should:
// - Reference specific skills, technologies, or experiences mentioned in the resume
// - Mix technical, behavioral, and situational questions
// - Test depth of knowledge in the candidate's stated areas of expertise
// - Be realistic questions a real interviewer would ask

// Format the questions as a numbered list (1., 2., etc.) with each question on a new line.

// Resume:
// ${truncatedResume}

// Generate 10 interview questions:`;

//   const payload = {
//     model: 'gpt-4',
//     temperature: 0.7,
//     max_tokens: 1200,
//     messages: [
//       {
//         role: 'user',
//         content: prompt,
//       },
//     ],
//   };

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('OpenAI API error:', data);
//       return null;
//     }

//     if (data?.choices?.[0]?.message?.content) {
//       console.log('Successfully received resume-based questions from OpenAI');
//       return data.choices[0].message.content;
//     } else {
//       console.error('Unexpected response format from OpenAI:', data);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error calling OpenAI API:', error);
//     return null;
//   }
// }

// pages/api/resumeQuestionsFetch.js
// Accepts a base64-encoded PDF resume + difficulty level.
// Extracts text from the PDF using pdf-parse, then sends it to OpenAI
// to generate resume-specific interview questions.





// export const config = {
//   runtime: 'nodejs',
//   maxDuration: 300,
// };

// export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { resumeBase64, level } = req.body;

//   if (!resumeBase64 || !level) {
//     return res.status(400).json({ error: 'Resume (base64) and level are required.' });
//   }

//   try {
//     // Convert base64 back to Buffer for pdf-parse
//     const pdfBuffer = Buffer.from(resumeBase64, 'base64');

//     // Extract text from PDF using pdf-parse
//     // Install: npm install pdf-parse
//     const pdfParse = require('pdf-parse');
//     const pdfData = await pdfParse(pdfBuffer);
//     const resumeText = pdfData.text;

//     if (!resumeText || resumeText.trim().length < 50) {
//       return res.status(400).json({ error: 'Could not extract sufficient text from the resume PDF. Please ensure the PDF is not scanned/image-based.' });
//     }

//     console.log(`Extracted ${resumeText.length} characters from resume PDF`);

//     // Generate questions from resume text
//     const questions = await getResumeBasedQuestions(resumeText, level);

//     if (questions) {
//       console.log('Resume-based questions fetched successfully');
//       return res.status(200).json({
//         message: 'Resume parsed. Questions fetched successfully.',
//         questions,
//       });
//     } else {
//       return res.status(500).json({ error: 'No questions fetched from OpenAI API.' });
//     }
//   } catch (error) {
//     console.error('Error during resume processing:', error);
//     return res.status(500).json({ error: `Error during processing: ${error.message}` });
//   }
// }

// async function getResumeBasedQuestions(resumeText, level) {
//   const url = 'https://api.openai.com/v1/chat/completions';

//   const apiKey = process.env.OPENAI_API_KEY;

//   if (!apiKey) {
//     console.error('OpenAI API key is missing.');
//     return null;
//   }

//   const headers = {
//     'Content-Type': 'application/json',
//     Authorization: `Bearer ${apiKey}`,
//   };

//   // Truncate resume text to avoid exceeding token limits (keep first ~4000 chars)
//   const truncatedResume = resumeText.substring(0, 4000);

//   const prompt = `You are a senior interviewer conducting a real face-to-face job interview. You have carefully read the candidate's resume in full and you are now sitting across from them. Your goal is to deeply evaluate this specific candidate — not ask generic questions.

// Candidate's Resume:
// ${truncatedResume}

// Difficulty Level: ${level}

// Your task: Generate exactly 26 interview questions that YOU, as the interviewer, would personally ask THIS candidate during a live interview. 

// Follow these strict rules:

// 1. DEEP DIVE into the resume — reference specific company names, job titles, project names, technologies, tools, and dates mentioned in the resume. For example: "I see you worked at [Company X] as a [Role] — can you walk me through a specific challenge you faced there?" or "Your resume mentions you built [Project Y] using [Technology Z] — how did you approach the architecture?"

// 2. PROBE for real depth — don't accept surface-level answers. Ask follow-up style questions like "You mentioned X — can you explain exactly how you implemented that?" or "What was the hardest bug you fixed in [specific project]?"

// 3. MIX these question types across the 20 questions:
//    - 6 Technical deep-dive questions (based on specific skills/technologies on their resume)
//    - 5 Project-specific questions (digging into projects listed on resume)
//    - 4 Behavioral questions (using STAR method, referencing their actual experience)
//    - 3 Situational/problem-solving questions (realistic scenarios tied to their background)
//    - 2 Career motivation questions (why they made specific career moves shown on resume)

// 4. SOUND NATURAL — phrase questions exactly as a real interviewer would say them in person. Use a conversational, direct tone. Start questions with phrases like: "I noticed on your resume...", "Looking at your experience at...", "You've listed... can you tell me more about...", "Walk me through...", "In your role as... how did you handle..."

// 5. AT THE ${level.toUpperCase()} LEVEL — calibrate complexity appropriately. Beginner: foundational understanding. Intermediate: practical application. Advanced: architectural decisions, trade-offs. Expert: system design, leadership, optimization at scale.

// 6. NO generic questions — never ask "Tell me about yourself", "What are your strengths/weaknesses", or any question that is not directly tied to something on this specific resume.

// Format: Return ONLY a numbered list (1., 2., 3. ... 20.) with one question per line. No categories, no headers, no explanations — just the 20 questions.`;

//   const payload = {
//     model: 'gpt-4',
//     temperature: 0.7,
//     max_tokens: 2000,
//     messages: [
//       {
//         role: 'user',
//         content: prompt,
//       },
//     ],
//   };

//   try {
//     const response = await fetch(url, {
//       method: 'POST',
//       headers,
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error('OpenAI API error:', data);
//       return null;
//     }

//     if (data?.choices?.[0]?.message?.content) {
//       console.log('Successfully received resume-based questions from OpenAI');
//       return data.choices[0].message.content;
//     } else {
//       console.error('Unexpected response format from OpenAI:', data);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error calling OpenAI API:', error);
//     return null;
//   }
// }




// pages/api/resumeQuestionsFetch.js
// Accepts a base64-encoded PDF resume + difficulty level.
// Extracts text from the PDF using pdf-parse, then sends it to OpenAI
// to generate resume-specific interview questions.

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { resumeBase64, level } = req.body;

  if (!resumeBase64 || !level) {
    return res.status(400).json({ error: 'Resume (base64) and level are required.' });
  }

  try {
    // Convert base64 back to Buffer for pdf-parse
    const pdfBuffer = Buffer.from(resumeBase64, 'base64');

    // Extract text from PDF using pdf-parse
    // Install: npm install pdf-parse
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract sufficient text from the resume PDF. Please ensure the PDF is not scanned/image-based.' });
    }

    console.log(`Extracted ${resumeText.length} characters from resume PDF`);

    // Generate questions from resume text
    const questions = await getResumeBasedQuestions(resumeText, level);

    if (questions) {
      console.log('Resume-based questions fetched successfully');
      return res.status(200).json({
        message: 'Resume parsed. Questions fetched successfully.',
        questions,
      });
    } else {
      return res.status(500).json({ error: 'No questions fetched from OpenAI API.' });
    }
  } catch (error) {
    console.error('Error during resume processing:', error);
    return res.status(500).json({ error: `Error during processing: ${error.message}` });
  }
}

async function getResumeBasedQuestions(resumeText, level) {
  const url = 'https://api.openai.com/v1/chat/completions';

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('OpenAI API key is missing.');
    return null;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };

  // Truncate resume text to avoid exceeding token limits (keep first ~4000 chars)
  const truncatedResume = resumeText.substring(0, 4000);

  const prompt = `You are a highly experienced senior interviewer at a top-tier company. You have just spent 15 minutes thoroughly reading this candidate's resume word by word — every job title, every project, every skill, every date gap, every achievement. You are now sitting face-to-face with this candidate in a formal interview room. You have a notepad in front of you with observations you made while reading their resume.

Your mission is NOT to ask generic interview questions. Your mission is to INTERROGATE this specific human being based on exactly what they have written about themselves. Every single question must feel like it could ONLY be asked to THIS candidate and nobody else.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDATE'S RESUME:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${truncatedResume}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTERVIEW DIFFICULTY: ${level}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — DEEPLY ANALYZE THE RESUME:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before writing any question, mentally extract:
- Every company name, job title, start/end date
- Every project name, technology stack, tool, framework, database, language mentioned
- Every quantified achievement (%, numbers, scale, users, performance improvements)
- Every certification, degree, institution
- Any career gaps, quick job changes, or unusual transitions
- Skills listed but not proven by any project or job (potential bluffing areas)
- The most impressive thing on this resume
- The weakest or most vague claim on this resume
- ALL technologies/frameworks/languages listed anywhere on the resume (skills section, projects, jobs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — GENERATE EXACTLY 30 QUESTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUESTIONS 1–10 → FOUNDATIONAL CONCEPT TESTING (for every technology listed on resume)
This is the most critical section. For EACH major technology, framework, or language the candidate has listed on their resume, ask at least one direct foundational concept question. These are the kind of questions that instantly reveal if someone truly knows a technology or just listed it.

HOW TO DO THIS:
- Look at every skill, tool, framework, language on the resume
- For each one, ask a core conceptual question that any genuine user of that technology MUST know
- Frame it naturally as if you are verifying their claim

EXAMPLES of how to frame these questions (adapt to whatever is on THIS resume):
- If they listed React → "You have React listed — can you explain what hooks are and walk me through the different types of hooks you have actually used?"
- If they listed JavaScript → "Since you have JavaScript experience — explain the difference between let, const, and var, and when would you use each?"
- If they listed Node.js → "You have Node.js listed — what is the event loop and how does non-blocking I/O actually work under the hood?"
- If they listed SQL/MySQL/PostgreSQL → "You used [Database] — explain the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN with a real use case from your work"
- If they listed Python → "You listed Python — what is the difference between a list and a tuple, and when would you choose one over the other?"
- If they listed MongoDB → "You used MongoDB — explain what indexing is and how it affected query performance in your project"
- If they listed CSS → "You have CSS experience — explain the difference between Flexbox and CSS Grid, and when would you pick one over the other?"
- If they listed Git → "You used Git — walk me through your branching strategy and explain the difference between git merge and git rebase"
- If they listed TypeScript → "You listed TypeScript — what is the difference between an interface and a type alias, and when do you use generics?"
- If they listed Redux → "You used Redux — explain the data flow: what are actions, reducers, and the store, and why would you use middleware like Thunk or Saga?"
- If they listed Docker → "You have Docker listed — what is the difference between a Docker image and a container, and how did you use Docker in your project?"
- If they listed AWS → "You listed AWS — which specific services did you use and can you explain what [specific service from resume] does and why you chose it?"

Apply this SAME pattern to EVERY technology on this candidate's specific resume.
Generate between 8–10 questions from this section, picking the most important technologies.

QUESTIONS 11–16 → TECHNICAL DEEP-DIVE (resume project/job context)
- Reference a specific project or job and go deep on the technical decisions
- Ask about architecture, trade-offs, performance issues, debugging, and why they chose specific tools
- Example: "In your [Project Name] using [Tech Stack] — how did you handle state management and what problems did you run into?"
- Force proof that they actually built and used what they claim

QUESTIONS 17–20 → PROJECT INTERROGATION (most significant projects)
- Ask what PROBLEM the project solved, not just what it did
- Ask about the hardest technical challenge they faced in that specific project
- Ask about decisions they made — what they chose AND what they decided NOT to do and why
- Ask about failures, rollbacks, or things they would do differently
- Include the actual project name and stack in each question

QUESTIONS 21–23 → PAST JOB EXPERIENCE DRILLING
- Reference their actual company name, job title, and tenure
- Ask about team size, their specific ownership, most impactful thing they shipped
- If they have a short tenure (less than 1 year), ask about it directly and professionally
- Ask about a conflict or disagreement with a manager or teammate and how they handled it

QUESTIONS 24–26 → BEHAVIORAL — STAR METHOD
- Frame using something REAL from their resume as context
- Example: "In your role at [Company] — tell me about a time a project went off track and how you brought it back"
- Test: leadership, ownership, conflict resolution, failure recovery, communication under pressure

QUESTIONS 27–28 → SITUATIONAL / PROBLEM-SOLVING
- Present a real-world scenario they would face in a role matching their background
- Make it specific to the domain, tech stack, or industry shown in their resume
- Test: how they think under pressure, prioritize, and communicate trade-offs

QUESTIONS 29–30 → CAREER DEPTH & MOTIVATION
- Ask about a specific career transition visible on the resume — why did they move from X to Y?
- If there is a career gap, ask about it thoughtfully and professionally
- Ask what they are most proud of that is NOT on their resume

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE AND LANGUAGE RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Speak DIRECTLY to the candidate as "you" — you are talking to them RIGHT NOW
- Sound like a real human interviewer, not a chatbot or exam paper
- Use phrases like: "I noticed...", "Looking at your resume...", "You have [Technology] listed — can you...", "Walk me through...", "Help me understand...", "In your role at [Company]...", "Your resume says you built [X] — tell me exactly how..."
- Ask ONE clear focused question per entry — no multi-part compound questions
- Be direct, confident, and professionally challenging
- For foundational concept questions, it is FINE and EXPECTED to ask direct definition/concept questions because you are verifying whether the candidate truly knows the technology they listed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIFFICULTY CALIBRATION: ${level.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${level === 'Beginner' ? 'Focus on fundamentals. Ask basic concept questions about every technology. Test whether they genuinely understand what they listed. Be encouraging but thorough. Foundational questions should test core definitions, basic syntax, and simple use cases.' : ''}
${level === 'Intermediate' ? 'Focus on practical application. Concept questions should go one level deeper — not just "what is X" but "when and why would you use X over Y". Test real debugging experience, performance awareness, and team collaboration.' : ''}
${level === 'Advanced' ? 'Concept questions should probe architectural thinking. Ask about internals, edge cases, performance trade-offs, and best practices. Test depth of mastery — can they teach it, not just use it.' : ''}
${level === 'Expert' ? 'Concept questions should test mastery-level understanding: internal implementation details, performance at scale, trade-offs between competing approaches, and how to mentor others on this technology. Test if they can architect systems around these technologies, not just use them.' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABSOLUTE RULES — NEVER VIOLATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- NEVER ask "Tell me about yourself" or "What are your strengths and weaknesses"
- NEVER ask a question that could be asked to ANY candidate regardless of their resume
- EVERY question must reference something specific from THIS resume
- NEVER be vague — every question must be precise and pointed
- NEVER ask more than one question per numbered entry
- ALWAYS include foundational concept questions for EVERY major technology on the resume

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a clean numbered list from 1 to 30.
Each line: just the number, a period, a space, then the question.
No headers. No categories. No explanations. No blank lines between questions.
1. Question here.
2. Question here.
...
30. Question here.`;

  const payload = {
    model: 'gpt-4',
    temperature: 0.85,
    max_tokens: 3500,
    messages: [
      {
        role: 'system',
        content: `You are a senior technical interviewer with 15+ years of experience hiring engineers, developers, and professionals at top companies. You conduct rigorous, resume-specific interviews. You never ask generic questions. Every question you ask is directly tied to what the candidate has written about themselves. You are professional, sharp, and thorough.`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return null;
    }

    if (data?.choices?.[0]?.message?.content) {
      console.log('Successfully received resume-based questions from OpenAI');
      return data.choices[0].message.content;
    } else {
      console.error('Unexpected response format from OpenAI:', data);
      return null;
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return null;
  }
}