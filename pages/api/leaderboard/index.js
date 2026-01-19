// pages/api/leaderboard/index.js
import dbConnect from '../../../middleware/dbConnect';
import User from '../../../models/User';
import PsychometricResponseNew from '../../../models/PsychometricResponseNew';
import PracticeResponse from '../../../models/PracticeResponse';

// Cache for leaderboard data (5 minutes)
let cachedLeaderboard = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

async function getCachedLeaderboard() {
  const now = Date.now();
  
  // Return cached data if it's still fresh
  if (cachedLeaderboard && (now - lastFetchTime) < CACHE_DURATION) {
    return { data: cachedLeaderboard, error: null };
  }

  try {
    await dbConnect();
    
    // Add error handling for database operations
    const users = await User.find({ isActive: { $ne: false } }, 'fullName email profileImg')
      .limit(1000)
      .lean()
      .exec()
      .catch(err => {
        console.error('Error fetching users:', err);
        throw new Error('Failed to fetch users');
      });

    const batchSize = 50;
    const leaderboard = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(batch.map(async (user) => {
        try {
          const [psychometricScores, practiceScores] = await Promise.all([
            PsychometricResponseNew.aggregate([
              { $match: { userEmail: user.email } },
              { $group: { 
                _id: '$userEmail', 
                psychometricScore: { $avg: '$results.overallScore' }
              }}
            ]).exec(),
            PracticeResponse.aggregate([
              { $match: { userId: user._id } },
              { $group: { 
                _id: '$userId', 
                practiceScore: { $avg: '$score' }
              }}
            ]).exec()
          ]);

          const psychometricAvg = psychometricScores[0]?.psychometricScore || 0;
          const practiceAvg = practiceScores[0]?.practiceScore || 0;
          const totalScore = (psychometricAvg * 0.4) + (practiceAvg * 0.6);

          return {
            userId: user._id.toString(),
            fullName: user.fullName || 'Anonymous',
            email: user.email,
            profileImg: user.profileImg,
            psychometricScore: psychometricAvg,
            practiceScore: practiceAvg,
            totalScore: totalScore
          };
        } catch (error) {
          console.error(`Error processing user ${user.email || user._id}:`, error);
          return null;
        }
      }));

      leaderboard.push(...batchResults.filter(Boolean));
    }

    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    cachedLeaderboard = rankedLeaderboard;
    lastFetchTime = now;

    return { data: rankedLeaderboard, error: null };
  } catch (error) {
    console.error('Error in getCachedLeaderboard:', error);
    return { data: null, error: error.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  try {
    const { data: leaderboard, error } = await getCachedLeaderboard();
    
    if (error) {
      console.error('Leaderboard error:', error);
      if (cachedLeaderboard) {
        console.log('Returning cached leaderboard data due to error');
        const top10 = cachedLeaderboard.slice(0, 10);
        let userRank = null;
        if (email) {
          userRank = cachedLeaderboard.find(entry => entry.email === email) || null;
        }
        
        return res.status(200).json({
          success: false,
          message: 'Using cached data due to error',
          top10,
          userRank,
          lastUpdated: new Date(lastFetchTime).toISOString()
        });
      }
      throw new Error('Failed to fetch leaderboard data');
    }

    // Get top 10
    const top10 = leaderboard.slice(0, 10);

    // Get current user's rank if email is provided
    let userRank = null;
    if (email) {
      userRank = leaderboard.find(entry => entry.email === email) || null;
    }

    return res.status(200).json({
      success: true,
      top10,
      userRank,
      lastUpdated: new Date(lastFetchTime).toISOString()
    });

  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}