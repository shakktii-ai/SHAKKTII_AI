
import mongoose from 'mongoose';
import Report from '../../models/Report';  // Assuming Report is a Mongoose model for storing reports
  import OverallScore from '../../models/OverallScore';
// API handler to store and retrieve reports
export default async function handler(req, res) {
  // Ensure the connection to MongoDB is active
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  // Handle POST request (for storing new report)
  if (req.method === 'POST') {
    const { role, email, collageName, reportAnalysis } = req.body;

    // Validate required fields
    if (!role || !email || !collageName || !reportAnalysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Create a new report in the Report model
      const newReport = new Report({
        role,
        collageName,
        email,
        reportAnalysis,
      });

      // Save the report in the database
      await newReport.save();

      // Respond with success message
      return res.status(201).json({ message: 'Report stored successfully', report: newReport });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to store report' });
    }

  // Handle GET request (for retrieving reports)
  } else if (req.method === 'GET') {
    const { email, emails, collageName } = req.query;  // Get email or emails (batch) and collageName from query parameters

    // If an individual email is provided, fetch reports for that user
  

if (email) {
  try {
    const reports = await Report.find({ email }).lean();
    const scores = await OverallScore.find({ email }).lean();

    if (!reports || reports.length === 0) {
      return res.status(404).json({ error: 'No reports found' });
    }

  const normalize = (val) =>
  String(val || "").trim().toLowerCase();

const mergedReports = reports.map(report => {
  // get all possible matches
  const possibleScores = scores.filter(s =>
    normalize(s.email) === normalize(report.email) &&
    normalize(s.role) === normalize(report.role)
  );

  // find closest by time
  let bestMatch = null;
  let minDiff = Infinity;

  for (const s of possibleScores) {
    const diff = Math.abs(
      new Date(s.createdAt) - new Date(report.createdAt)
    );

    if (diff < minDiff) {
      minDiff = diff;
      bestMatch = s;
    }
  }

  return {
    ...report,
    overallScore: bestMatch ? Number(bestMatch.overallScore) : 0
  };
});

    return res.status(200).json({ reports: mergedReports });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
} else if (emails) {
      try {
        const emailArray = JSON.parse(emails);  // Parse the emails from the query parameter

        const reports = await Report.find({ email: { $in: emailArray } });

        // Group reports by email
        const groupedReports = reports.reduce((acc, report) => {
          if (!acc[report.email]) {
            acc[report.email] = [];
          }
          acc[report.email].push(report);
          return acc;
        }, {});

        return res.status(200).json({ reports: groupedReports });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve reports for multiple emails' });
      }

    // If no email or emails are provided, and the request is for a company
    } else if (collageName) {
      try {
        const reports = await Report.find({ collageName });

        if (reports.length === 0) {
          return res.status(404).json({ error: 'No reports found for this company' });
        }

        return res.status(200).json({ reports });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to retrieve reports for this company' });
      }
    } else {
      return res.status(400).json({ error: 'Email, emails, or collageName are required' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
