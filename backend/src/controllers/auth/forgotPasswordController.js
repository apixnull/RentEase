// controllers/auth/forgotPasswordController.js
import crypto from 'crypto';
import { sendResetEmail } from '../../services/email/auth/sendResetEmail.js';
import prisma from '../../libs/prismaClient.js';
import redis from '../../libs/redisClient.js';

const RESET_TOKEN_EXPIRATION_SECONDS = 60 * 60; // 1 hour

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Find user by email (lowercase for consistency)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, isVerified: true, isDisabled: true },
    });

    // Don't reveal if user exists or not or is disabled for security reasons
    if (!user || !user.isVerified || user.isDisabled) {
      return res.status(200).json({ message: "A reset password link has been sent to your email." });
    }

    // Generate a secure random token (64 hex chars)
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in Redis with expiry (key format: resetPasswordToken:<token>)
    await redis.set(
      `resetPasswordToken:${token}`,
      user.id,
      { ex: RESET_TOKEN_EXPIRATION_SECONDS }
    );

    // Compose the reset URL for email
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

    // Send the reset email via your email service
    await sendResetEmail(email, resetUrl);

    return res.status(200).json({ message: "A reset password link has been sent to your email." });
  } catch (error) {
    console.error("[forgotPasswordController] Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default forgotPasswordController;
