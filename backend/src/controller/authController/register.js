import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtpCode } from "../../services/auth/sendOtpCode.js";

const prisma = new PrismaClient();

const generateOtpCode = () => {
  const otp = crypto.randomBytes(3).readUIntBE(0, 3) % 1000000;
  return otp.toString().padStart(6, '0');
};

export const register = async (req, res) => {
  const { email, password, confirmPassword, role } = req.body;

  if (!email || !password || !confirmPassword || !role) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: "Passwords do not match." });
  }

  if (!["TENANT", "LANDLORD"].includes(role)) {
    return res.status(403).json({ success: false, message: "Only tenants and landlords can register." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ success: false, message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role,
    },
  });

  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      code: otpCode,
      expiresAt,
    },
  });

  const emailResult = await sendOtpCode(email, otpCode);

  if (!emailResult.success) {
    return res.status(500).json({ success: false, message: "Failed to send verification email." });
  }

  return res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.",
    userId: user.id,
    email: user.email, // helpful for resend + display
  });

};
