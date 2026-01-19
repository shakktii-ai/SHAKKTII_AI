// pages/api/excelTest/questions.js
import { OpenAI } from "openai";

export const config = {
  runtime: "nodejs",
  maxDuration: 60, // realistic for Vercel; adjust per plan
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured");
      return res.status(200).json({ questions: [], error: "OpenAI key missing" });
    }

    const count = 15;

    const systemPrompt =
      "You are a precise JSON generator for Excel MCQ quizzes. " +
      "Return ONLY valid JSON and nothing else.";

    const userPrompt = [
      `Generate exactly ${count} Excel-related multiple choice questions.`,
      "Each item must have the following shape:",
      "",
      "{",
      '  "question": "string",',
      '  "options": ["A", "B", "C", "D"],',
      '  "answer": "A"  // one of A/B/C/D',
      "}",
      "",
      "CRITICAL:",
      "1) Output ONLY a single JSON object with a top-level key `questions`.",
      "2) Do NOT include markdown fences or explanations.",
      "3) Ensure exactly 15 items and each has 4 options.",
      "",
      "Example:",
      JSON.stringify(
        {
          questions: [
            {
              question: "Which Excel function adds numbers in a range?",
              options: ["SUM", "AVERAGE", "COUNT", "MAX"],
              answer: "A",
            },
          ],
        },
        null,
        2
      ),
    ].join("\n");

    // Use gpt-4 as requested
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.5,
      max_tokens: 2200,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim() || "";
    if (!content) {
      return res.status(200).json({ questions: [], error: "Empty response from OpenAI" });
    }

    // -------- Safe JSON parse with cleanups --------
    const safeParse = (s) => {
      try {
        return { ok: true, data: JSON.parse(s) };
      } catch (e) {
        return { ok: false, err: e };
      }
    };

    let parsed = safeParse(content);

    if (!parsed.ok) {
      // Remove code fences if any
      let fixed = content.replace(/```(?:json)?/g, "").replace(/```/g, "").trim();
      // Try to extract a JSON object
      const objMatch = fixed.match(/\{\s*[\s\S]*\}\s*$/);
      if (objMatch) fixed = objMatch[0];
      // Remove trailing commas
      fixed = fixed.replace(/,\s*([}\]])/g, "$1");
      parsed = safeParse(fixed);
      if (!parsed.ok) {
        console.error("Failed to parse OpenAI response:", content);
        return res.status(200).json({ questions: [], error: "Invalid JSON from OpenAI" });
      }
    }

    const data = parsed.data;
    let questions = Array.isArray(data?.questions) ? data.questions : [];

    // -------- Validate & normalize --------
    const letterToIndex = (letter) => {
      const map = { A: 0, B: 1, C: 2, D: 3 };
      return map[String(letter || "").trim().toUpperCase()];
    };

    const normalized = questions.slice(0, count).map((q, idx) => {
      const question = String(q?.question || "").trim();
      let options = Array.isArray(q?.options) ? q.options.map(String) : [];

      // ensure exactly 4 options (trim or pad)
      options = options.slice(0, 4);
      while (options.length < 4) options.push("");

      const letter = String(q?.answer || "").trim().toUpperCase();
      const i = letterToIndex(letter);
      const correctText = Number.isInteger(i) && options[i] != null ? options[i] : "";

      return {
        id: idx + 1,
        question,
        options,
        // keep both for compatibility:
        answer: letter,            // e.g., "A"
        correctAnswer: correctText // the actual option text
      };
    });

    if (normalized.length < count) {
      console.warn(`Generated only ${normalized.length}/${count} questions`);
    }

    return res.status(200).json({ questions: normalized });
  } catch (error) {
    console.error("Error generating Excel questions:", error);
    return res.status(200).json({
      questions: [],
      error: error.message || "Failed to generate Excel questions",
    });
  }
}
