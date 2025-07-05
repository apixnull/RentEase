// controllers/auth/resendOtpController.js

import prisma from '../../libs/prismaClient.js';
import crypto from 'crypto';
import { sendOtpCode } from '../../services/email/auth/sendOtp.js';

/**
 * Resends a fresh OTP code to the user's email
 * @route POST /auth/resend-otp
 * @param {string} email - User's email address
 */
const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Look up the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Optional: block resend if already verified
    if (user.isVerified) {
      return res.status(409).json({ message: 'Email is already verified.' });
    }

    // Delete any existing unexpired OTPs
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: {
          gte: new Date(),
        },
      },
    });

    // Generate a new 6-digit OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save the new OTP
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        code: newOtp,
        expiresAt,
      },
    });

    // Send the new OTP
    await sendOtpCode(email, newOtp);

    return res.status(200).json({ message: 'A new OTP code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default resendOtpController;
