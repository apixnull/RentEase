// controllers/auth/registerController.js

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../libs/prismaClient.js';
import { sendOtpCode } from '../../services/email/auth/sendOtp.js';


const registerController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user record in DB
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        isVerified: false,
        isDisabled: false,
      },
    });

    // Generate a short verification code (6-digit numeric OTP)
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Set expiration time for OTP (e.g., 15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save the verification token linked to user
    await prisma.verificationToken.create({
      data: {
        userId: newUser.id,
        code: otpCode,
        expiresAt,
      },
    });

    // Send OTP code to user's email
    await sendOtpCode(email, otpCode);

    // Respond with success and email info
    return res.status(201).json({
      message: 'User registered successfully, verification code sent',
      email: newUser.email,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default registerController;
