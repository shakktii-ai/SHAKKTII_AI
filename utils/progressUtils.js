import { calculateReadinessScores } from "./readinessScore";

// utils/progressHelper.js
export function calculateStepStates(progress = {}, scores = {}) {
  const p = progress;

  const step1 = !!p.step1_profile;
  const step2 = !!p.step2_resume;
  const step3 = !!p.step3_decision;
  const step4 = !!p.step4_softSkills?.isCompleted;
  const step5 = !!p.step5_techSkills?.isCompleted;
  const step6 = !!p.step6_mockInterview;
  const readiness = calculateReadinessScores(progress, scores);

  // Prerequisites check for locked modals (Steps 6 & 7)
  const isStep6Locked = !(step1 && step2 && step3 && step4 && step5);
  const isStep7Locked = !(step1 && step2 && step3 && step4 && step5);

  // Completed steps count for readiness calculation
  const completedCount = [step1, step2, step3, step4, step5, step6].filter(Boolean).length;
  const readinessPercentage = readiness.overallReadiness;

  return {
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    isStep6Locked,
    isStep7Locked,
    readinessPercentage,
    stepScores: readiness.stepScores,
  };
}
