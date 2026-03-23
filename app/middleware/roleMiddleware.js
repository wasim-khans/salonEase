// SalonEase Role Middleware
// Check user role and restrict access based on role

class RoleMiddleware {
  // Require admin role
  static requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  }

  // Require customer or staff role
  static requireRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      if (!allowedRoles.includes(req.session.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      next();
    };
  }

  // Require specific role
  static requireSpecificRole(role) {
    return (req, res, next) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      if (req.session.user.role !== role) {
        return res.status(403).json({ error: `${role} access required` });
      }
      
      next();
    };
  }
}

module.exports = RoleMiddleware;
