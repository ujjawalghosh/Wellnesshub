const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Use consistent JWT_SECRET - same as auth.js and server.js
const JWT_SECRET = process.env.JWT_SECRET || 'wellnesshub_jwt_secret_key_2024';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch full user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user on request with all user data
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;

