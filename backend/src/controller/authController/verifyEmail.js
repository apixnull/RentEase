// src/controller/authController/verifyEmail.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyEmail = async (req, res) => {
  const { tokenId, otpCode } = req.body;

  if (!tokenId || !otpCode) {
    return res.status(400).json({ success: false, message: "Token ID and OTP code are required." });
  }

  try {
    // Find the verification token record by tokenId (id) with otpCode and not expired
    const verificationRecord = await prisma.verificationToken.findUnique({
      where: {
        id: tokenId, // the UUID string of the verification token
      },
      include: {
        user: true,
      },
    });

    if (
      !verificationRecord ||
      verificationRecord.code !== otpCode ||
      verificationRecord.expiresAt < new Date()
    ) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Update user as verified
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { isVerified: true },
    });

    // Delete the verification token record after successful verification
    await prisma.verificationToken.delete({
        where: { id: tokenId },
    });

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    console.error("Error verifying email:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
