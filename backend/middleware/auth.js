import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'retail_personalization_secret_key_12345';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden. Admin privileges required.' });
  }
  next();
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized. User authentication required.' });
  }
  next();
};
