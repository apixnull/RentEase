// controllers/auth/forgotPasswordController.js
import crypto from 'crypto';
import { sendResetEmail } from '../../services/email/auth/sendResetEmail.js';
import prisma from "../../libs/prismaClient.js";

const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Find user by email (lowercase for consistency)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, isVerified: true },
    });

    // Don't reveal if user exists or not for security reasons
    if (!user || !user.isVerified) {
      return res.status(200).json({ message: "A reset password link has been sent to your email." });
    }

    // Generate a secure random token (64 hex chars)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Delete any existing tokens for user to keep only one valid token
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Save the new token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

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
