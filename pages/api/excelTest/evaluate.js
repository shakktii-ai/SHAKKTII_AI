// pages/api/excelTest/evaluate.js
import mongoose from 'mongoose';
import PracticeProgress from '../../../models/PracticeProgress';

const MONGODB_URI = process.env.MONGODB_URI;

if (!global._mongoConnection) {
  global._mongoConnection = mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// ✅ Vercel config
export const config = {
  runtime: 'nodejs',
  maxDuration: 60, // realistic for Pro plan
  api: {
    bodyParser: false, // we parse manually
  },
};

function generateEvaluationPrompt(questions, answers) {
  return `
You are an AI evaluator. Compare the user's answers with the "correctAnswer" field.

Questions:
${JSON.stringify(questions, null, 2)}

User Answers:
${JSON.stringify(answers, null, 2)}

Rules:
- Score = correct answers count
- Percentage = (score / total) * 100
- Strengths = Areas where user got right
- Weaknesses = Areas where user got wrong

Return ONLY JSON:
{
  "score": number,
  "percentage": number,
  "strengths": [string],
  "weaknesses": [string],
  "feedback": string
}`;
}

export default async function handler(req, res) {
  console.log('\n--- Excel Test Evaluation ---');

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let timeoutId;
  try {
    // ✅ parse raw body safely
    let rawBody = '';
    for await (const chunk of req) rawBody += chunk;
    let body;
    try {
      body = JSON.parse(rawBody || '{}');
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }

    const { questions, answers } = body;
    if (!Array.isArray(questions) || !answers) {
      return res.status(400).json({ error: 'Missing questions or answers' });
    }

    console.log('Questions:', questions.length, 'Answers:', Object.keys(answers).length);

    const prompt = generateEvaluationPrompt(questions, answers);

    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a strict evaluator.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 800,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'OpenAI API failed');
    }

    const result = await response.json();
    const rawContent = result.choices[0]?.message?.content?.trim() || '';
    console.log('Raw AI response:', rawContent);

    // ✅ parse evaluation JSON safely
    let evaluation;
    try {
      evaluation = JSON.parse(rawContent);
    } catch {
      const match = rawContent.match(/\{[\s\S]*\}/);
      evaluation = match ? JSON.parse(match[0]) : { feedback: rawContent };
    }

    // ✅ Save progress
    const userId = req.query.userId || body.userId || '6462d8fbf6c3e30000000001';
    const percentage = evaluation?.percentage || 0;

    try {
      const existing = await PracticeProgress.findOne({ userId, skillArea: 'Excel Test' });
      const highestScore = Math.max(existing?.highestScore || 0, percentage);

      const update = {
        $inc: {
          sessionsCompleted: 1,
          questionsAttempted: questions.length,
          totalStarsEarned: 1,
        },
        $set: {
          averageScore: percentage,
          highestScore,
          lastUpdated: new Date(),
          difficulty: 'Moderate',
          strengths: evaluation?.strengths || [],
          areasToImprove: evaluation?.weaknesses || [],
          report: evaluation, // ✅ store full AI JSON like Personality test
        },
      };

      if (!existing) {
        update.$setOnInsert = { userId, skillArea: 'Excel Test', currentLevel: 1 };
      }

      await PracticeProgress.findOneAndUpdate(
        { userId, skillArea: 'Excel Test' },
        update,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (dbErr) {
      console.error('DB Save Error:', dbErr);
    }

    return res.status(200).json({
      success: true,
      data: evaluation,
      meta: { generatedAt: new Date().toISOString(), reportId: `report-${Date.now()}` },
    });
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    console.error('Evaluation Error:', err);
    return res.status(500).json({
      success: false,
      error: err.name === 'AbortError' ? 'Evaluation timed out' : err.message,
    });
  }
}
