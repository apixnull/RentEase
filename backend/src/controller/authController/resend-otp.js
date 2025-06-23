// src/controller/authController/resendOtp.js
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { sendOtpCode } from "../../services/auth/sendOtpCode.js";

const prisma = new PrismaClient();

const generateOtpCode = () => {
  const otp = crypto.randomBytes(3).readUIntBE(0, 3) % 1000000;
  return otp.toString().padStart(6, '0');
};

export const resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User already verified." });
    }

    // Delete any existing tokens for the user
    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

    // Generate new token
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const newToken = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt,
      },
    });

    const emailResult = await sendOtpCode(email, otpCode);

    if (!emailResult.success) {
      return res.status(500).json({ success: false, message: "Failed to send email." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully.",
      tokenId: newToken.id,
    });
  } catch (err) {
    console.error("Resend OTP error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
