import connectDB from '../../middleware/dbConnect';
import User from '../../models/User';
import PsychometricResponseNew from '../../models/PsychometricResponseNew';
import PracticeResponse from '../../models/PracticeResponse';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await connectDB();
    
    // Get all users with their scores
    const users = await User.find({}, 'fullName email profileImg');
    
    const leaderboard = await Promise.all(users.map(async (user) => {
      // Get psychometric test scores
      const psychometricScores = await PsychometricResponseNew.aggregate([
        { $match: { userEmail: user.email } },
        { $group: { 
          _id: '$userEmail', 
          psychometricScore: { $avg: '$results.overallScore' },
          testCount: { $sum: 1 }
        }}
      ]);

      // Get practice test scores
      const practiceScores = await PracticeResponse.aggregate([
        { $match: { userId: user._id } },
        { $group: { 
          _id: '$userId', 
          practiceScore: { $avg: '$score' },
          testCount: { $sum: 1 }
        }}
      ]);

      const psychometricAvg = psychometricScores[0]?.psychometricScore || 0;
      const practiceAvg = practiceScores[0]?.practiceScore || 0;
      
      // Calculate total score (weighted average)
      const totalScore = (psychometricAvg * 0.4) + (practiceAvg * 0.6);

      return {
        email: user.email,
        totalScore: Math.round(totalScore * 10) / 10
      };
    }));

    // Sort by total score in descending order
    leaderboard.sort((a, b) => b.totalScore - a.totalScore);

    // Add rank and find current user
    let userRank = null;
    const totalUsers = leaderboard.length;
    
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].email.toLowerCase() === email.toLowerCase()) {
        const rank = i + 1;
        const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
        
        userRank = {
          rank,
          totalUsers,
          percentile: percentile > 0 ? percentile : 1, // Ensure at least 1% if not last
          totalScore: leaderboard[i].totalScore
        };
        break;
      }
    }

    if (!userRank) {
      return res.status(404).json({ message: 'User not found in leaderboard' });
    }

    res.status(200).json(userRank);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    // Return default rank structure in case of error
    res.status(200).json({
      rank: '--',
      totalUsers: '--',
      percentile: '--',
      totalScore: 0
    });
  }
}
