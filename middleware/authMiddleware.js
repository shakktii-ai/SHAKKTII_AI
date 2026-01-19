import jwt from 'jsonwebtoken';

export const authMiddleware = (handler) => async (req, res) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided, authorization denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwtsecret');
      
      // Add user data to request
      req.user = decoded;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Token is not valid' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
