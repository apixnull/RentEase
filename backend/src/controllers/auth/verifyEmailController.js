// controllers/auth/verifyEmailController.js

import prisma from '../../libs/prismaClient.js';
import redis from '../../libs/redisClient.js';

const verifyEmailController = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Retrieve OTP from Redis
    const redisKey = `verificationToken:${user.id}`;
    const storedOtp = await redis.get(redisKey);

    console.log(`[DEBUG] Stored OTP: ${storedOtp}, Received OTP: ${otpCode}`);

    // Compare OTP safely as string
    if (!storedOtp || storedOtp.toString() !== otpCode.toString()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Remove OTP from Redis after successful verification
    await redis.del(redisKey);

    return res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default verifyEmailController;
