import jwt from "jsonwebtoken";

/**
 * Middleware factory to require authentication and optionally enforce roles.
 * @param {string[]} [allowedRoles] - Array of allowed roles for this route. If omitted, no role check.
 */
export const requireAuthenticate = (allowedRoles) => (req, res, next) => {
  // Extract token only from cookie
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Attach user payload to request

    if (allowedRoles && allowedRoles.length > 0) {
      // Check if user's role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Access forbidden: insufficient permissions" });
      }
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Access token expired" });
    }
    return res.status(401).json({ success: false, message: "Invalid access token" });
  }
};



/**
  --> usage

  router.get('/user-info', requireAuthenticate(), getCurrentUserInfo);

  router.post('/some-protected-route', requireAuthenticate(['LANDLORD', 'ADMIN']), someController);

  router.get('/tenant-route', requireAuthenticate(['TENANT']), tenantController);

  router.get('/any-role-route', requireAuthenticate(), anyRoleController);
  
 */