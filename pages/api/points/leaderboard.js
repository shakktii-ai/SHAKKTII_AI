// pages/api/points/leaderboard.js
import dbConnect from '../../../lib/dbConnect';
import { getLeaderboard } from '../../../lib/pointsEngine';

// Cache: 5 minutes
let cache = {};
let cacheTime = {};
const CACHE_TTL = 5 * 60 * 1000;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type = 'overall', track = null, email } = req.query;
  const cacheKey = `${type}_${track || 'none'}`;
  const now = Date.now();

  try {
    await dbConnect();

    // Return cached if fresh
    if (cache[cacheKey] && (now - (cacheTime[cacheKey] || 0)) < CACHE_TTL) {
      const data = cache[cacheKey];
      return res.status(200).json({
        success: true,
        leaderboard: data,
        userEntry: email ? data.find((e) => e.email === email) || null : null,
        top10: data.slice(0, 10),
        lastUpdated: new Date(cacheTime[cacheKey]).toISOString(),
      });
    }

    const leaderboard = await getLeaderboard(type, track);

    cache[cacheKey] = leaderboard;
    cacheTime[cacheKey] = now;

    return res.status(200).json({
      success: true,
      leaderboard,
      userEntry: email ? leaderboard.find((e) => e.email === email) || null : null,
      top10: leaderboard.slice(0, 10),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching points leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      leaderboard: [],
      top10: [],
    });
  }
}
