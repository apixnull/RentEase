// file: requireAuthentication.js
import jwt from "jsonwebtoken";
import prisma from "../libs/prismaClient.js";
import redis from "../libs/redisClient.js";

// Middleware for role-based authentication
// Use "ANY_ROLE" to allow any logged-in user
export const requireAuthentication = (allowedRoles = ["ANY_ROLE"]) => {
  return async (req, res, next) => {
    try {
      // Debug: log cookies
      console.log("Incoming cookies:", req.cookies);
      
      // 1. Read JWT from cookie
      const token = req.cookies?.accessToken;
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // 2. Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { userId, sid, ip: tokenIp } = decoded;

      if (!userId || !sid || !tokenIp) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const currentIp = req.ip;

      // 3. Validate session in Redis per IP
      const redisKey = `session:${userId}:${currentIp}`;
      const storedSessionId = await redis.get(redisKey);

      if (!storedSessionId || storedSessionId !== sid || currentIp !== tokenIp) {
        return res.status(401).json({ message: "Session expired or invalid" });
      }

      // 4. Query user for latest role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true }
      });

      // 5. Role-based access
      if (!(allowedRoles.includes("ANY_ROLE") || allowedRoles.includes(user.role))) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      // 6. Attach user info
      req.user = { id: user.id, role: user.role, sid };

      return next();
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
};


/*
Usage examples:

// Any logged-in user
router.get("/dashboard", requireAuthentication(["ANY_ROLE"]), (req, res) => {
  res.json({ message: "Dashboard for all users", user: req.user });
});

// Only tenants and landlords
router.get("/rentals", requireAuthentication(["TENANT", "LANDLORD"]), (req, res) => {
  res.json({ message: "Accessible by tenants and landlords", user: req.user });
});

// Only admins
router.get("/admin/panel", requireAuthentication(["ADMIN"]), (req, res) => {
  res.json({ message: "Admin only", user: req.user });
});

// All roles explicitly
router.get("/all-access", requireAuthentication(["ADMIN", "TENANT", "LANDLORD"]), (req, res) => {
  res.json({ message: "All roles allowed", user: req.user });
});
*/
