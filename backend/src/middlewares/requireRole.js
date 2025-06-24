// Middleware factory to allow only specific user roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient role' });
    }
    next();
  };
};


/**
 import { requireRole } from '../middlewares/requireRole.js';

router.get(
  '/landlord/dashboard',
  requireAuthenticate,
  requireRole(['LANDLORD']),
  landlordDashboardHandler
);
 */