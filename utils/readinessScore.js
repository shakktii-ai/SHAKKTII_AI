const STEP_WEIGHTS = {
  step1_profile: 10,
  step2_resume: 15,
  step3_decision: 15,
  step4_softSkills: 25,
  step5_techSkills: 35,
};

function clampScore(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function average(values) {
  const valid = values.filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function getStep1Score(progress = {}, scores = {}) {
  return clampScore(scores.step1_profile) ?? (progress.step1_profile ? 100 : 0);
}

function getStep2Score(progress = {}, scores = {}) {
  return clampScore(scores.step2_resume) ?? (progress.step2_resume ? 100 : 0);
}

function getStep3Score(progress = {}, scores = {}) {
  return clampScore(scores.step3_decision) ?? (progress.step3_decision ? 100 : 0);
}

function getStep4Score(progress = {}, scores = {}) {
  const softSkillScores = scores.step4_softSkills || {};
  const explicitOverall = clampScore(softSkillScores.overall);
  if (explicitOverall !== null) return explicitOverall;

  const explicitAverage = average([
    clampScore(softSkillScores.reading),
    clampScore(softSkillScores.writing),
    clampScore(softSkillScores.speaking),
    clampScore(softSkillScores.listening),
  ]);
  if (explicitAverage !== null) return explicitAverage;

  const softSkillProgress = progress.step4_softSkills || {};
  const completedCount = ["reading", "writing", "speaking", "listening"].filter(
    (key) => !!softSkillProgress[key]
  ).length;
  return Math.round((completedCount / 4) * 100);
}

function getStep5Score(progress = {}, scores = {}) {
  const techScores = scores.step5_techSkills || {};
  const explicitOverall = clampScore(techScores.overall);
  if (explicitOverall !== null) return explicitOverall;

  const excel = clampScore(techScores.excelAssessment);
  const technicalMcq = clampScore(techScores.technicalMcq);

  if (excel !== null && technicalMcq !== null) {
    return Math.round(excel * 0.4 + technicalMcq * 0.6);
  }

  if (excel !== null) return excel;
  if (technicalMcq !== null) return technicalMcq;

  const techProgress = progress.step5_techSkills || {};
  const completedCount = ["excelAssessment", "technicalMcq"].filter(
    (key) => !!techProgress[key]
  ).length;
  return Math.round((completedCount / 2) * 100);
}

export function calculateReadinessScores(progress = {}, scores = {}) {
  const stepScores = {
    step1_profile: getStep1Score(progress, scores),
    step2_resume: getStep2Score(progress, scores),
    step3_decision: getStep3Score(progress, scores),
    step4_softSkills: getStep4Score(progress, scores),
    step5_techSkills: getStep5Score(progress, scores),
  };

  const weightedTotal = Object.entries(STEP_WEIGHTS).reduce(
    (sum, [stepKey, weight]) => sum + stepScores[stepKey] * weight,
    0
  );

  const overallReadiness = Math.round(
    weightedTotal /
      Object.values(STEP_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
  );

  return {
    stepScores,
    overallReadiness,
  };
}
