// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth Middleware - Token:', token);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded token:', decoded);
    
    // Find user in database
    const user = await db.User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'name', 'role', 'restaurantId']
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Attach user to request
    req.user = user;
    console.log('✅ User attached to request:', req.user.id);
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;