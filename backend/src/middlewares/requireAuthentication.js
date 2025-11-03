// file: requireAuthentication.js

// Middleware for role-based authentication using express-session
// Use "ANY_ROLE" to allow any logged-in user
export const requireAuthentication = (allowedRoles = ["ANY_ROLE"]) => {
  return (req, res, next) => {
    const u = req.session?.user;
    if (!u) return res.status(401).json({ message: "Authentication required" });
    if (!(allowedRoles.includes("ANY_ROLE") || allowedRoles.includes(u.role))) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    req.user = u;
    next();
  };
};
