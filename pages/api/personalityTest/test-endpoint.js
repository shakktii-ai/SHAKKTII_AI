// Simple test endpoint to verify API is working
export default async function handler(req, res) {
  console.log('Test endpoint hit');
  return res.status(200).json({ 
    status: 'ok', 
    message: 'Test endpoint is working',
    timestamp: new Date().toISOString()
  });
}
