import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key';

export function signToken(user) {
  return jwt.sign(
    { email: user.email, role: user.role || 'admin' },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

export function verifyToken(req) {
  try {
    if (!req || !req.headers) return null;

    // Ensure headers.cookie exists and is a string
    const cookieHeader = typeof req.headers.cookie === 'string' ? req.headers.cookie : '';
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;

    if (!token) return null;

    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}
