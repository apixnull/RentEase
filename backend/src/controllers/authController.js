import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { sendEmailVerification } from '../services/emailService.js';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const OTP_EXPIRATION_MINUTES = 15;
const prisma = new PrismaClient();

export async function register(req, res) {
  try {
    const { email, password, fullName, role } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        isVerified: false,
      },
    });

    // Generate OTP code and expiration
    const rawOTP = Math.floor(100000 + Math.random() * 900000).toString(); // "538291"
    const hashedOTP = crypto.createHash('sha256').update(rawOTP).digest('hex');
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Save OTP token
    await prisma.token.create({
      data: {
        userId: user.id,
        token: hashedOTP,
        expiresAt,
        type: 'EMAIL_VERIFICATION',
        used: false,
      },
    });

    // Send verification email
    await sendEmailVerification(email, rawOTP);

    return res.status(201).json({
      success: true,
      message: 'Signup successful. Please verify your email.',
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
}



export async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    const token = await prisma.token.findFirst({
      where: {
        userId: user.id,
        token: hashedOTP,
        type: "EMAIL_VERIFICATION",
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    // Mark token as used and verify user
    await prisma.$transaction([
      prisma.token.update({
        where: { id: token.id },
        data: { used: true },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      }),
    ]);

    return res.json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}


// POST /api/auth/resend-otp
export async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "User is already verified." });
    }

    const rawOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash("sha256").update(rawOTP).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    // Invalidate previous un-used tokens of this type
    await prisma.token.updateMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
        used: false,
        expiresAt: { gt: new Date() },
      },
      data: { used: true },
    });

    // Store new OTP
    await prisma.token.create({
      data: {
        userId: user.id,
        token: hashedOTP,
        expiresAt,
        type: "EMAIL_VERIFICATION",
        used: false,
      },
    });

    await sendEmailVerification(email, rawOTP);

    return res.json({ success: true, message: "A new verification code has been sent." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}
