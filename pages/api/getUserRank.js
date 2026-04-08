// pages/api/getUserRank.js
// Redirects to PointsProfile-based ranking (new system)
import dbConnect from '../../lib/dbConnect';
import { getPercentileRank } from '../../lib/pointsEngine';

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
    const rankData = await getPercentileRank(email);
    return res.status(200).json(rankData);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return res.status(200).json({
      rank: '--',
      totalUsers: '--',
      percentile: '--',
      totalPoints: 0,
    });
  }
}
