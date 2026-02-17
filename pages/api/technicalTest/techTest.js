// pages/api/assessment.js

import mongoose from "mongoose";
import AssessmentReport from "../../../models/TechnicalReport";

// ================= DATABASE =================
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || { conn: null, promise: null };
global.mongoose = cached;

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ================= CLEAN JSON =================
function cleanJSON(text) {
  return text.replace(/```json|```/g, "").trim();
}

// ================= SAFE PARSE =================
function safeParse(text) {
  try {
    return JSON.parse(cleanJSON(text));
  } catch (err) {
    console.error("JSON Parse Error:", err);
    return null;
  }
}

// ================= API =================
export default async function handler(req, res) {
  await dbConnect();

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI key missing" });
  }

  const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

  // ==================================================
  // GET REPORTS
  // ==================================================
  if (req.method === "GET") {
    const { email } = req.query;

    if (!email)
      return res.status(400).json({ error: "Email required" });

    const reports = await AssessmentReport.find({ email }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ reports });
  }

  // ==================================================
  // POST
  // ==================================================
  if (req.method === "POST") {
    const {
      type,
      subject,
      questions,
      userAnswers,
      email,
      collageName,
      role,
    } = req.body;

    // ==========================================
    // GENERATE QUESTIONS
    // ==========================================
    if (type === "generate_questions") {
      if (!subject || subject.trim() === "") {
        return res.status(400).json({ error: "Subject required" });
      }

      const systemPrompt = `
You are an Technical examiner.

Return ONLY valid JSON.
No markdown.
No explanation.
No Repetition.
`;

      const userPrompt = `
Generate 20 multiple choice questions STRICTLY related to subject: ${subject}

Return format:

[
  {
    "id": 1,
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Exact correct option"
  }
]

Rules:
- Questions must be technical and practical
- Exactly 4 options
- Only one correct answer
- No repetition
`;

      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.5,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        const data = await response.json();

        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
          console.error("AI Empty Response:", data);
          return res
            .status(500)
            .json({ error: "AI returned empty content" });
        }

        const parsed = safeParse(content);

        if (!parsed || !Array.isArray(parsed)) {
          console.error("AI Invalid JSON:", content);
          return res
            .status(500)
            .json({ error: "Invalid AI response format" });
        }

        return res.status(200).json({ result: parsed });

      } catch (err) {
        console.error("Question generation error:", err);
        return res.status(500).json({
          error: "Question generation failed",
          details: err.message,
        });
      }
    }

    // ==========================================
    // EVALUATE ANSWERS
    // ==========================================
    if (type === "evaluate_answers") {
      if (!email)
        return res.status(400).json({ error: "Login required" });

      let score = 0;

      questions.forEach((q, i) => {
        if (userAnswers[i] === q.correctAnswer) score++;
      });

      const newReport = new AssessmentReport({
        role: role || "Student",
        subject,
        email,
        collageName: collageName || "Unknown",
        score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
      });

      await newReport.save();

      return res.status(200).json({
        success: true,
        score,
        total: questions.length,
      });
    }

    return res.status(400).json({ error: "Invalid request type" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
