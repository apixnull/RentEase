// src/controller/authController/verifyEmail.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return res.status(400).json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        code: token,
        expiresAt: { gt: new Date() }, // not expired
      },
    });

    if (!verificationRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Update user to mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Optionally delete the token after successful verification
    await prisma.verificationToken.delete({
      where: {
        userId_id: {
          userId: user.id,
          id: verificationRecord.id,
        },
      },
    });

    return res.status(200).json({ success: true, message: "Email verified successfully." });
  } catch (err) {
    console.error("Error verifying email:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
