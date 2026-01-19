
 // Utility to connect to MongoDB
import Report from '../../models/OverallScore';  // Import the Mongoose model
import mongoose from 'mongoose';
// API handler to store and retrieve reports
export default async function handler(req, res) {
  if (!mongoose.connections[0].readyState) {
    await mongoose.connect(process.env.MONGODB_URI);
  }
  if (req.method === 'POST') {
    const { role, email,collageName, overallScore } = req.body;
console.log("all info",role, email,collageName, overallScore );

    

    try {
     
      // Create a new report
      const newReport = new Report({
        role,
        collageName, 
        email,
        overallScore,
        
      });

      // Save the report in the database
      await newReport.save();

      // Respond with a success message
      return res.status(201).json({ message: 'Report stored successfully', report: newReport });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to store report' });
    }
  } else if (req.method === 'GET') {
    const { email } = req.query;  // Get email from query parameters

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      // Connect to MongoDB
      if (!mongoose.connections[0].readyState) {
        await mongoose.connect(process.env.MONGODB_URI);
      }

      // Find reports by the provided email
      const reports = await Report.find({ email });

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
