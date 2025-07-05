// controllers/auth/logoutController.js

import prisma from "../../libs/prismaClient.js";
import jwt from "jsonwebtoken";

/**
 * Logs the user out by:
 * - Clearing access & refresh cookies
 * - Deleting refresh tokens from DB if refreshToken is valid
 */
const logoutController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  // Always clear cookies (even if token is missing or invalid)
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",

    
    sameSite: "None",
  });

  if (!refreshToken) {
    console.info("[Logout] No refresh token provided. Skipping token deletion.");
    return res.status(200).json({ message: "Logged out successfully." });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (decoded?.id) {
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.id },
      });
      console.info(`[Logout] Deleted all refresh tokens for user ${decoded.id}`);
    }
  } catch (err) {
    // Token invalid/expired — still logout user
    console.warn("[Logout] Invalid or expired refresh token. Skipping deletion.");
  }

  return res.status(200).json({ message: "Logged out successfully." });
};

export default logoutController;
