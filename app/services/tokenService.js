// Token Service - JWT token management
const jwt = require('jsonwebtoken');

class TokenService {
  // Generate JWT token
  static generateToken(user) {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    return jwt.sign(payload, process.env.SESSION_SECRET, {
      expiresIn: '24h' // Token expires in 24 hours
    });
  }
  
  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.SESSION_SECRET);
    } catch (error) {
      return null;
    }
  }
  
  // Extract token from Authorization header
  static extractToken(req) {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    return null;
  }
}

module.exports = TokenService;
