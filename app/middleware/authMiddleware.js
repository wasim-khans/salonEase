// SalonEase Authentication Middleware
// Check if user is authenticated and set user in request

class AuthMiddleware {
  // Check if user is logged in
  static requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add user to request object
    req.user = req.session.user;
    next();
  }

  // Check if user is authenticated
  static isAuthenticated(req) {
    return req.session && req.session.user;
  }

  // Get current user from session
  static getCurrentUser(req) {
    return req.session ? req.session.user : null;
  }

  // Logout user
  static logout(req, res) {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        return res.clearCookie('connect.sid').json({ message: 'Logged out successfully' });
      });
    } else {
      return res.status(400).json({ error: 'No active session' });
    }
  }
}

module.exports = AuthMiddleware;
