// controllers/auth/loginController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../libs/prismaClient.js";

/**
 * Logs in a user and sets access + refresh tokens in cookies.
 * Returns minimal user data for frontend use.
 */
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        errorCode: "EMAIL_NOT_VERIFIED",
      });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        message: "This account has been disabled.",
        errorCode: "ACCOUNT_DISABLED",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const payload = { id: user.id, email: user.email, role: user.role, isVerified: user.isVerified, isDisabled: user.isDisabled };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "60s",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "90s",
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 90 * 1000),
      },
    });


    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 1000,
      sameSite: "Lax",
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      maxAge: 90 * 1000,
      sameSite: "Lax",
    });



    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default loginController;
