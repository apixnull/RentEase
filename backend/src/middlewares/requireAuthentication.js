// file: requireAuthentication.js

import prisma from "../libs/prismaClient.js";

// Middleware for role-based authentication using express-session
// Use "ANY_ROLE" to allow any logged-in user
// Supports multiple roles: requireAuthentication(["TENANT", "LANDLORD"])
// Automatically checks if user is disabled and rejects with 403
export const requireAuthentication = (allowedRoles = ["ANY_ROLE"]) => {
  return async (req, res, next) => {
    const u = req.session?.user;
    
    // Check if user is authenticated
    if (!u) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if user account is disabled (blocked)
    try {
      const user = await prisma.user.findUnique({
        where: { id: u.id },
        select: { isDisabled: true },
      });

      if (user?.isDisabled) {
        // Destroy the session to force logout
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session for disabled user:", err);
          }
        });
        return res.status(403).json({ 
          code: "ACCOUNT_DISABLED",
          message: "Account is disabled. You have been logged out.",
        });
      }
    } catch (error) {
      // If we can't check the user status, log error but continue
      // This prevents a DB issue from breaking all auth
      console.error("Error checking user status in requireAuthentication:", error);
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
