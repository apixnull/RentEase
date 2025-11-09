// file: requireAuthentication.js

// Middleware for role-based authentication using express-session
// Use "ANY_ROLE" to allow any logged-in user
// Supports multiple roles: requireAuthentication(["TENANT", "LANDLORD"])
export const requireAuthentication = (allowedRoles = ["ANY_ROLE"]) => {
  return (req, res, next) => {
    const u = req.session?.user;
    
    // Check if user is authenticated
    if (!u) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // If ANY_ROLE is specified, allow any authenticated user
    if (allowedRoles.includes("ANY_ROLE")) {
      req.user = u;
      return next();
    }
    
    // Check if user's role is in the allowed roles array
    if (!allowedRoles.includes(u.role)) {
      return res.status(403).json({ 
        message: "Forbidden: Insufficient role",
        required: allowedRoles,
        current: u.role
      });
    }
    
    // User is authenticated and has required role
    req.user = u;
    next();
  };
};
