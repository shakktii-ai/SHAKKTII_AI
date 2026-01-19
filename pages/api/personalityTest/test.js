export default function handler(req, res) {
  console.log('Test endpoint hit');
  res.status(200).json({ status: 'ok', message: 'Test endpoint is working' });
}
