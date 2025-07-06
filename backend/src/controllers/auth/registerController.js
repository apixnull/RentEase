// controllers/auth/registerController.js

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../../libs/prismaClient.js';
import { sendOtpCode } from '../../services/email/auth/sendOtp.js';
import redis from '../../libs/redisClient.js';

const OTP_EXPIRATION_SECONDS = 15 * 60; // 15 minutes

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

    // Save OTP in Redis with expiry (key format: verificationToken:<userId>)
    await redis.set(`verificationToken:${newUser.id}`, otpCode, {
      ex: OTP_EXPIRATION_SECONDS,
    });


    // Send OTP code to user's email
    await sendOtpCode(email, otpCode);

    // Respond with success and email info (same as before)
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
