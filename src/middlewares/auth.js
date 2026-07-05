import jwt from 'jsonwebtoken';

// Middleware to parse and verify the JWT token from cookies
export const parseUser = (req, res, next) => {
  const token = req.cookies?.token;
  req.user = null;

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'placeholder-jwt-session-secret-key-32-chars-long';
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    } catch (error) {
      console.warn('Authentication token verification failed:', error.message);
      res.clearCookie('token');
    }
  }
  next();
};

// Middleware to block unauthorized access on protected routes
export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please sync with Google.' });
  }
  next();
};
