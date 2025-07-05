// controllers/auth/verifyEmailController.js

import prisma from '../../libs/prismaClient.js';

/**
 * Verifies a user's email using a provided OTP code
 * @route POST /auth/verify-email
 * @param {string} email - User's email address
 * @param {string} otpCode - OTP code from email
 */
const verifyEmailController = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    // Ensure both email and code are provided
    if (!email || !otpCode) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    // Look up the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get the most recent, non-expired verification token
    const token = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        code: otpCode,
        expiresAt: {
          gte: new Date(), // Ensure it's not expired
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!token) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { id: token.id },
    });

    return res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export default verifyEmailController;
