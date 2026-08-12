import mongoose from 'mongoose';
import TechnicalReport from '../../models/TechnicalReport';
import baselinetechnicalReport from '../../models/BaselineTechnicalReport';
const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Fetch technical reports for the user, sorted by most recent first
    const [technicalReports, baselineReports] = await Promise.all([
       await TechnicalReport.find({ email })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 reports
      .lean(),
      await baselinetechnicalReport.find({ email })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 reports
      .lean(),
    ]);
 const reports = [...technicalReports, ...baselineReports].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
    return res.status(200).json({
      success: true,
      reports: reports,
      total: reports.length
    });

  } catch (error) {
    console.error('Error fetching technical reports:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to fetch technical reports'
    });
  }
}
