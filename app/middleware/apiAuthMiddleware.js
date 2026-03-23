// API Authentication Middleware - JWT token verification
const TokenService = require('../services/tokenService');

class ApiAuthMiddleware {
  // Verify JWT token for API routes
  static requireAuth(req, res, next) {
    try {
      const token = TokenService.extractToken(req);
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'Access token required'
        });
      }
      
      const decoded = TokenService.verifyToken(token);
      
      if (!decoded) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
      
      // Attach user to request
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Authentication error'
      });
    }
  }
  
  // Optional authentication (doesn't fail if no token)
  static optionalAuth(req, res, next) {
    try {
      const token = TokenService.extractToken(req);
      
      if (token) {
        const decoded = TokenService.verifyToken(token);
        if (decoded) {
          req.user = decoded;
        }
      }
      
      next();
    } catch (error) {
      next();
    }
  }
}

module.exports = ApiAuthMiddleware;
