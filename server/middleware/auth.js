const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth middleware - Token present:', !!token);
    console.log('🔐 Auth middleware - Headers:', req.headers);
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    console.log('🔐 Decoded token:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    console.log('🔐 User found:', !!user);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (!user.isActive) {
      console.log('❌ User account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    console.log('✅ Auth successful for user:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

module.exports = { auth, authorize };
