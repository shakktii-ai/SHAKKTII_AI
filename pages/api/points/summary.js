// pages/api/points/summary.js
import dbConnect from '../../../lib/dbConnect';
import { getPointsSummary, getPercentileRank } from '../../../lib/pointsEngine';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await dbConnect();

    const [summary, rankData] = await Promise.all([
      getPointsSummary(email),
      getPercentileRank(email),
    ]);

    return res.status(200).json({
      success: true,
      ...summary,
      rank: rankData.rank,
      totalUsers: rankData.totalUsers,
      percentile: rankData.percentile,
    });
  } catch (error) {
    console.error('Error fetching points summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch points summary',
      // Return safe defaults
      totalPoints: 0,
      level: 1,
      levelName: 'Starter',
      currentStreak: 0,
      percentile: 0,
      rank: '--',
      totalUsers: '--',
      badges: [],
      recentLog: [],
    });
  }
}
