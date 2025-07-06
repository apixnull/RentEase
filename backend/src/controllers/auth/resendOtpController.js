// controllers/auth/resendOtpController.js

import prisma from '../../libs/prismaClient.js';
import crypto from 'crypto';
import { sendOtpCode } from '../../services/email/auth/sendOtp.js';
import redis from '../../libs/redisClient.js';

const OTP_EXPIRATION_SECONDS = 15 * 60; // 15 minutes

/**
 * Resends a fresh OTP code to the user's email
 * @route POST /auth/resend-otp
 */
const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(409).json({ message: 'Email is already verified.' });
    }

    // Always generate and overwrite any existing OTP in Redis
    const newOtp = crypto.randomInt(100000, 999999).toString();

    const redisKey = `verificationToken:${user.id}`;
    await redis.set(redisKey, newOtp, { ex: OTP_EXPIRATION_SECONDS });

    await sendOtpCode(email, newOtp);

    return res.status(200).json({ message: 'A new OTP code has been sent to your email.' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default resendOtpController;
