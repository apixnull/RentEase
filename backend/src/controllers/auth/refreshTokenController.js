import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../../libs/prismaClient.js";

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided." });
    }

    const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const userId = payload.id;

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!storedToken) {
      return res.status(403).json({ message: "Refresh token not found or expired." });
    }

    const isValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isValid) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // ❌ Fix starts here: remove 'exp' and 'iat' from payload
    const { id, email, role, isVerified, isDisabled } = payload;
    const newPayload = { id, email, role, isVerified, isDisabled };

    // 🔁 Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 🔐 Sign new refresh token (90s)
    const newRefreshToken = jwt.sign(newPayload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "90s",
    });

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 90 * 1000),
      },
    });

    // 🔐 Sign new access token (60s)
    const newAccessToken = jwt.sign(newPayload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "60s",
    });

    // 🍪 Set new cookies
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: 60 * 1000,
      sameSite: isProd ? "None" : "Lax",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      maxAge: 90 * 1000,
      sameSite: isProd ? "None" : "Lax",
    });

    return res.status(200).json({
      message: "Tokens refreshed successfully.",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid or expired refresh token." });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

export default refreshTokenController;
