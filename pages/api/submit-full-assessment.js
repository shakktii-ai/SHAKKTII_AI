

// pages/api/submit-full-assessment.js

import mongoose from "mongoose";
import TechnicalReport from "../../models/TechnicalReport";
import jwt from "jsonwebtoken";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

//AI REPORT GENERATOR
async function generateAIReport(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: "Return only valid JSON. No markdown. No explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    const raw = data?.choices?.[0]?.message?.content || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();

    return JSON.parse(clean);

  } catch (err) {
    console.error("AI Parse Error:", err);

    return {
      summary: "Analysis not available.",
      strengths: [],
      weakAreas: [],
      improvementTips: [],
    };
  }
}

//API
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const { email, userInfo, masterData } = req.body;

    //AUTH
    let collageName = "Unknown";
    let authEmail = email;

    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET || "jwtsecret"
        );

        collageName = decoded.collageName || "Unknown";
        authEmail = decoded.email || email;

      } catch {
        const decoded = jwt.decode(authHeader.split(" ")[1]);
        if (decoded) {
          collageName = decoded.collageName || "Unknown";
          authEmail = decoded.email || email;
        }
      }
    }
   // TECHNICAL DATA
const techQ = masterData?.assessment?.questions || [];
const techA = masterData?.assessment?.answers || {};

// Normalizer to avoid mismatch
const normalize = (str) =>
  String(str || "").trim().toLowerCase();

let correctCount = 0;
let attemptedCount = 0;

const techDetails = techQ.map((q, i) => {
  const userAns = techA[i];

  const hasAnswered =
    userAns !== undefined &&
    userAns !== null &&
    String(userAns).trim() !== "";

  if (hasAnswered) attemptedCount++;

  const isCorrect =
    hasAnswered &&
    normalize(userAns) === normalize(q.correctAnswer);

  if (isCorrect) correctCount++;

  return {
    questionText: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    userAnswer: hasAnswered ? userAns : "Not Answered",
    attempted: hasAnswered,   
    isCorrect,
  };
});

const totalQuestions = techQ.length;

const percentage =
  totalQuestions > 0
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

const accuracy =
  attemptedCount > 0
    ? Math.round((correctCount / attemptedCount) * 100)
    : 0;

    // ================= AI PROMPT =================
    const aiPrompt = `
You are an expert technical trainer and evaluator for vocational students.

Student Details:
Subject: ${userInfo?.subject}
Total Questions: ${totalQuestions}
Correct Answers: ${correctCount}
Attempted Questions: ${attemptedCount}
Score Percentage: ${percentage}%
Accuracy: ${accuracy}%

Analyze the student’s technical performance and return STRICT JSON only.

Required Format:

{
  "summary": "Clear professional performance summary",
  "strengths": ["point", "point"],
  "weakAreas": ["point", "point"],
  "improvementTips": ["tip", "tip"]
}

Guidelines:
- Use simple professional English
- Focus on practical skills and technical understanding
- strengths: maximum 4 points
- weakAreas: maximum 4 points
- improvementTips: maximum 5 actionable tips
- Return valid JSON only
`;

    const aiReport = await generateAIReport(aiPrompt);

    // ================= SAVE REPORT =================
    const report = await TechnicalReport.create({
      role: "Student",
      subject: userInfo?.subject,
      email: authEmail,
      collageName,

    score: correctCount,
totalQuestions: totalQuestions,
percentage: percentage,
 questionResponses: techDetails,

      reportAnalysis: aiReport,
    });

    return res.json({
      success: true,
      reportId: report._id,
      scores: {
       technical: percentage
      },
    });

  } catch (err) {
    console.error("Submit error:", err);
    return res.status(500).json({ error: err.message });
  }
}
