
 // Utility to connect to MongoDB
import Report from '../../models/Report';  // Import the Mongoose model
import mongoose from 'mongoose';
// API handler to store and retrieve reports
export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
   if (req.method === 'GET') {
    const { collageName } = req.query;  // Get email from query parameters

    // Check if email is provided
    if (!collageName) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Connect to MongoDB
      if (!mongoose.connections[0].readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
      }

      // Find reports by the provided email
      const reports = await Report.find({ collageName });

      // If no reports are found
      if (reports.length === 0) {
        return res.status(404).json({ error: 'No reports found for this email' });
      }

      // Respond with the found reports
      return res.status(200).json({ reports });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to retrieve reports' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
