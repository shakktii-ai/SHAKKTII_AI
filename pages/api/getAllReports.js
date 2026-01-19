import mongoose from 'mongoose';
import Report from '../../models/Report';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Ensure MongoDB connection
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    // Fetch reports for the specific user and sort by creation date
    const reports = await Report.find({ email }).sort({ createdAt: -1 });
    
    // Transform the data for the charts
    const transformedReports = reports.map(report => {
      const scores = extractScores(report.reportAnalysis);
      return {
        email: report.email,
        role: report.role,
        scores,
        jobRole: report.role,
        collageName: report.collageName,
        date: report.createdAt
      };
    });

    return res.status(200).json(transformedReports);
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Error fetching reports' });
  }
}

// Helper function to extract scores from report analysis
function extractScores(reportAnalysis) {
  const scoreTypes = [
    'Technical Proficiency',
    'Communication',
    'Decision-making',
    'Confidence',
    'Language Fluency'
  ];

  const scores = {};
  scoreTypes.forEach(type => {
    const regexNoParentheses = new RegExp(`${type}:\\s*(\\d+\/10)`, 'i');
    const regexWithParentheses = new RegExp(`${type}:\\s*\\((\\d+\/10)\\)`, 'i');
    
    const match = reportAnalysis.match(regexNoParentheses) || reportAnalysis.match(regexWithParentheses);
    scores[type.toLowerCase().replace(/[\s-]/g, '_')] = match ? parseInt(match[1]) : 0;
  });

  // Calculate overall score (average of all scores)
  const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  scores.overall = Math.round((totalScore / scoreTypes.length) * 10); // Convert to percentage

  return scores;
}

