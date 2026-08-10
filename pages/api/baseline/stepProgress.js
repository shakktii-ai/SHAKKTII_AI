// pages/api/baseline/stepProgress.js

import dbConnect from "../../../middleware/dbConnect";
import UserReadiness from "../../../models/BaselineUserStepStrack";
import { calculateReadinessScores } from "../../../utils/readinessScore";

function clampScore(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

export default async function handler(req, res) {
  await dbConnect();

  try {
    // =========================
    // GET Progress
    // =========================
    if (req.method === "GET") {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "userId is required.",
        });
      }

      const userProgress = await UserReadiness.findOne({ userId });
      const readiness = calculateReadinessScores(
        userProgress?.progress || {},
        userProgress?.scores || {}
      );

      return res.status(200).json({
        success: true,
        progress: userProgress?.progress || null,
        scores: userProgress?.scores || null,
        readiness,
      });
    }

    // =========================
    // POST Update Progress
    // =========================
    if (req.method === "POST") {
      const { userId, stepKey, subTestKey, score } = req.body;

      if (!userId || !stepKey) {
        return res.status(400).json({
          success: false,
          message: "userId and stepKey are required.",
        });
      }

      let userProgress = await UserReadiness.findOneAndUpdate(
        { userId },
        {},
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      if (subTestKey) {
        if (!userProgress.progress[stepKey]) {
          userProgress.progress[stepKey] = {};
        }
        if (!userProgress.scores) {
          userProgress.scores = {};
        }
        if (!userProgress.scores[stepKey]) {
          userProgress.scores[stepKey] = {};
        }

        // Mark sub-test completed
        userProgress.progress[stepKey][subTestKey] = true;

        const normalizedScore = clampScore(score);
        if (normalizedScore !== null) {
          userProgress.scores[stepKey][subTestKey] = normalizedScore;
        }

        // Soft Skills
        if (stepKey === "step4_softSkills") {
          const { reading, writing, speaking, listening } =
            userProgress.progress.step4_softSkills;

          userProgress.progress.step4_softSkills.isCompleted =
            reading && writing && speaking && listening;

          const softSkillValues = ["reading", "writing", "speaking", "listening"]
            .map((key) => clampScore(userProgress.scores?.step4_softSkills?.[key]))
            .filter((value) => value !== null);

          if (softSkillValues.length) {
            userProgress.scores.step4_softSkills.overall = Math.round(
              softSkillValues.reduce((sum, value) => sum + value, 0) /
                softSkillValues.length
            );
          }
        }

        // Technical Skills
        if (stepKey === "step5_techSkills") {
          const { excelAssessment, technicalMcq } =
            userProgress.progress.step5_techSkills;

          userProgress.progress.step5_techSkills.isCompleted =
            excelAssessment && technicalMcq;

          const excelScore = clampScore(
            userProgress.scores?.step5_techSkills?.excelAssessment
          );
          const technicalMcqScore = clampScore(
            userProgress.scores?.step5_techSkills?.technicalMcq
          );

          if (excelScore !== null && technicalMcqScore !== null) {
            userProgress.scores.step5_techSkills.overall = Math.round(
              excelScore * 0.4 + technicalMcqScore * 0.6
            );
          } else if (excelScore !== null || technicalMcqScore !== null) {
            userProgress.scores.step5_techSkills.overall =
              excelScore ?? technicalMcqScore;
          }
        }
      } else {
        // Boolean Steps
        userProgress.progress[stepKey] = true;

        const normalizedScore = clampScore(score);
        if (normalizedScore !== null) {
          userProgress.scores[stepKey] = normalizedScore;
        }
      }

      const readiness = calculateReadinessScores(
        userProgress.progress || {},
        userProgress.scores || {}
      );
      userProgress.scores.overallReadiness = readiness.overallReadiness;

      userProgress.updatedAt = new Date();

      await userProgress.save();

      return res.status(200).json({
        success: true,
        progress: userProgress.progress,
        scores: userProgress.scores,
        readiness,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  } catch (error) {
    console.error("Step Progress Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
