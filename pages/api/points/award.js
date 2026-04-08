// pages/api/points/award.js
import dbConnect from '../../../lib/dbConnect';
import {
  awardMockInterviewPoints,
  awardFeedbackReviewPoints,
  awardSkillPracticePoints,
  awardGamePoints,
  awardImprovementBonus,
  updateStreak,
  restoreStreak,
} from '../../../lib/pointsEngine';

const ACTIVITY_HANDLERS = {
  mock_interview: awardMockInterviewPoints,
  feedback_reviewed: awardFeedbackReviewPoints,
  skill_practice: awardSkillPracticePoints,
  domain_game: awardGamePoints,
  improvement_bonus: awardImprovementBonus,
  restore_streak: restoreStreak,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, activityType, metadata = {} } = req.body;

  if (!email || !activityType) {
    return res.status(400).json({ message: 'email and activityType are required' });
  }

  if (!ACTIVITY_HANDLERS[activityType]) {
    return res.status(400).json({ message: `Unknown activityType: ${activityType}` });
  }

  try {
    await dbConnect();

    const handler = ACTIVITY_HANDLERS[activityType];
    const result = await handler(email, metadata);

    return res.status(200).json({
      success: true,
      activityType,
      ...result,
    });
  } catch (error) {
    console.error(`Error awarding points for ${activityType}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Failed to award points',
    });
  }
}
