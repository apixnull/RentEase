// file: authController.js
import prisma from "../libs/prismaClient.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { emailVerificationTemplate } from "../services/email/templates/emailVerification.js";
import { registrationWelcomeTemplate } from "../services/email/templates/registrationWelcome.js";
import { resetPasswordTemplate } from "../services/email/templates/resetPassword.js"
import { sendEmail } from "../services/email/emailSender.js";
import redis from "../libs/redisClient.js";
import jwt from "jsonwebtoken"; 

// jwt 
const ACCESS_TOKEN_TTL = "1h";
const REFRESH_TOKEN_TTL = "7d";
const REFRESH_COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// email verification life span
const OTP_TTL = 600; // 10 minutes
const MAX_OTP_ATTEMPTS = 8; // maximum OTP verification attempts
const MAX_RESEND_ATTEMTPS = 1 // maximum resend verification attempts


// ---------------------------------------------- REGISTER ----------------------------------------------
// Handles new user registration, generates OTP, and sends verification email
export const register = async (req, res) => {
  try {
    // Destructure request body
    let { email, password, confirmPassword, role } = req.body;

    // Validate required fields
    if (!email || !password || !confirmPassword || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Trim inputs
    email = email.trim();
    password = password.trim();
    confirmPassword = confirmPassword.trim();
    role = role.trim();

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message: "Password must have at least 8 characters including uppercase, lowercase, number, and symbol"
      });
    }

    // Validate role
    if (!["LANDLORD", "TENANT"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    // Handle soft-deleted user
    if (existingUser && existingUser.deletedAt) {
      await prisma.user.delete({ where: { email } });
    } else if (existingUser) {
      // Email already registered
      return res.status(409).json({ message: "Invalid Email" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    await prisma.user.create({ data: { email, passwordHash, role } });

    // Generate OTP and token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(16).toString("hex");
    const key = `verify_email:${token}`;

    // Store OTP and token in Redis (attempts and resends initialized as strings)
    await redis.hset(key, { email, otp, attempts: "0", resends: "0" });
    await redis.expire(key, OTP_TTL);

    // Send verification email
    await sendEmail({
      to: email,
      subject: "RentEase Email Verification",
      html: emailVerificationTemplate(email, otp)
    });

    return res.status(201).json({
      message: "Success! Check your email for the OTP code.",
      token
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



// ---------------------------------------------- VERIFY EMAIL ----------------------------------------------
// Handles OTP verification and updates attempt count
export const verifyEmail = async (req, res) => {
    try {
        // Destructure request body
        const { token, otp } = req.body;

        // Validate input
        if (!token || !otp) {
            return res.status(400).json({ message: "Token and OTP are required" });
        }

        const key = `verify_email:${token}`;
        const data = await redis.hgetall(key);

        // Check if key exists (token valid)
        if (!data) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Convert attempts from string to number
        let attempts = Number(data.attempts);

        // Block if max attempts reached
        if (attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({ message: "Maximum OTP attempts reached. Try again later." });
        }

        if (String(otp) !== String(data.otp)) {
            attempts += 1;
            await redis.hset(key, { attempts: attempts.toString() });
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP correct → verify user
        await prisma.user.update({
            where: { email: data.email },
            data: { isVerified: true },
        });

        // Send welcome email
        await sendEmail({
            to: data.email,
            subject: "Welcome to RentEase!",
            html: registrationWelcomeTemplate(data.email),
        });

        // Remove Redis key
        await redis.del(key);

        // Success response
        return res.status(200).json({ message: "Email verified successfully" });

    } catch (err) {
        console.error("Verify email error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



// ---------------------------------------------- RESEND VERIFICATION ----------------------------------------------
// Handles OTP resending with safety checks for max resends and attempts
export const resendVerification = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token is required" });
        }

        const key = `verify_email:${token}`;
        const data = await redis.hgetall(key);

        // token not found or expired
        if (!data) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const attempts = Number(data.attempts); // convert string to number
        let resends = Number(data.resends);     // convert string to number

        // block if max attempts reached
        if (attempts >= MAX_OTP_ATTEMPTS) {
            return res.status(429).json({ message: "Maximum OTP attempts reached. Cannot resend." });
        }

        // block if max resend reached
        if (resends >= MAX_RESEND_ATTEMTPS) {
            return res.status(429).json({ message: "OTP has already been resent. Cannot resend again." });
        }

        // increment resends
        resends += 1;

        // generate new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // update only otp and resends safely
        await redis.hset(key, { otp: newOtp, resends: resends.toString() });
        await redis.expire(key, OTP_TTL);

        // send verification email
        await sendEmail({
            to: data.email,
            subject: "RentEase Email Verification (Resent)",
            html: emailVerificationTemplate(data.email, newOtp)
        });

        return res.status(200).json({ message: "Verification email resent successfully" });

    } catch (err) {
        console.error("Resend verification error:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// ---------------------------------------------- FORGOT PASSWORD ----------------------------------------------
// Handles sending password reset email with token
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    // Invalid if user not found or soft-deleted
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: "Invalid email" });
    }

    // Block if disabled
    if (user.isDisabled) {
      return res
        .status(403)
        .json({ message: "Account is disabled due to violations" });
    }

    // ✅ Check last password change (3-day restriction)
    if (user.lastPasswordChange) {
      const now = new Date();
      const diffMs = now - user.lastPasswordChange;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (diffDays < 3) {
        return res.status(429).json({
          message:
            "You can only change your password once every 3 days. Please try again later.",
        });
      }
    }

    // Generate secure token
    const token = crypto.randomBytes(16).toString("hex");
    const key = `reset_password:${token}`;

    // Store reset request in Redis (expires in 10 minutes)
    await redis.hset(key, { email: user.email });
    await redis.expire(key, 10 * 60); // 10 minutes

    // Build reset URL (frontend route)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Send reset email
    await sendEmail({
      to: user.email,
      subject: "Reset your RentEase password",
      html: resetPasswordTemplate(user.email, resetUrl),
    });

    return res.status(200).json({ message: "Password reset instructions sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- RESET PASSWORD ----------------------------------------------
// Handles resetting the user's password using token
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Token, new password, and confirm password are required" });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Look up Redis token
    const key = `reset_password:${token}`;
    const data = await redis.hgetall(key);

    if (!data || !data.email) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: "Invalid account" });
    }
   

    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password and lastPasswordChange
    await prisma.user.update({
      where: { email: user.email },
      data: {
        passwordHash: hashed,
        lastPasswordChange: new Date(),
      },
    });

    // Invalidate token
    await redis.del(key);

    return res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ---------------------------------------------- LOGIN ----------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userIp = req.ip;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      return res.status(404).json({ message: "Invalid credentials" });
    }

    if (user.isDisabled) {
      return res.status(403).json({
        code: "ACCOUNT_DISABLED",
        message: "Account is disabled due to violations",
      });
    }

    // Email verification flow
    if (!user.isVerified) {
      const token = crypto.randomBytes(16).toString("hex");
      const key = `verify_email:${token}`;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await redis.hset(key, {
        email: user.email,
        otp,
        attempts: "0",
        resends: "0",
      });
      await redis.expire(key, 10 * 60); // OTP TTL = 10m

      await sendEmail({
        to: user.email,
        subject: "RentEase Email Verification",
        html: emailVerificationTemplate(user.email, otp),
      });

      return res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before logging in",
        token,
      });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ----------------- One session per IP -----------------
    const sessionId = crypto.randomBytes(16).toString("hex");
    const sessionKey = `session:${user.id}:${userIp}`;

    await redis.setex(sessionKey, 60 * 60 * 24 * 7, sessionId); // 7 days TTL

    // Access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user.id, sid: sessionId, ip: userIp },
      process.env.JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL }
    );

    // Refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user.id, sid: sessionId, ip: userIp },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_TTL }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Send cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: REFRESH_COOKIE_TTL_MS,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ---------------------------------------------- REFRESH ----------------------------------------------
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    const userIp = req.ip;

    if (!refreshToken) {
      return res.status(401).json({ message: "Missing refresh token" });
    }

    // Verify refresh token
    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    const { userId, sid } = payload;

    // Validate session in Redis
    const sessionKey = `session:${userId}:${userIp}`;
    const storedSessionId = await redis.get(sessionKey);

    if (!storedSessionId || storedSessionId !== sid) {
      return res.status(403).json({ message: "Session invalid or expired" });
    }

    // Rotate access token
    const newAccessToken = jwt.sign(
      { userId, sid, ip: userIp },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- LOGOUT ----------------------------------------------
export const logout = async (req, res) => {
  try {
    const { id: userId } = req.user; // user info attached by requireAuthentication
    const userIp = req.ip;

    // Remove session from Redis for this IP
    await redis.del(`session:${userId}:${userIp}`);

    // Clear access token cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- GET USER INFO (/me) ----------------------------------------------
export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // attached by requireAuthentication

    // Fetch user info from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,

        firstName: true,
        middleName: true,
        lastName: true,
        avatarUrl: true,
        birthdate: true,
        gender: true,
        bio: true,
        
        phoneNumber: true,
        messengerUrl: true,
        facebookUrl: true,
        whatsappUrl: true,
        isVerified: true,
        isDisabled: true,
        lastLogin: true,
        hasSeenOnboarding: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Format dates as ISO strings
    const formattedUser = {
      ...user,
      birthdate: user.birthdate?.toISOString(),
      lastLogin: user.lastLogin?.toISOString(),
    };

    return res.status(200).json({ user: formattedUser });
  } catch (err) {
    console.error("Get user info error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ---------------------------------------------- COMPLETE USER ONBOARDING ----------------------------------------------
export const onboarding = async (req, res) => {
  try {
    const userId = req.user.id; // from requireAuthentication
    const {
      firstName,
      middleName,
      lastName,
      avatarUrl,
      birthdate,
      gender,
      bio,
      phoneNumber,
      messengerUrl,
      facebookUrl,
      whatsappUrl,
    } = req.body;

    // Prevent re-onboarding
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { hasSeenOnboarding: true },
    });

    if (existingUser?.hasSeenOnboarding) {
      return res.status(422).json({ message: "Onboarding already completed" });
    }


    // Build update object dynamically to avoid overwriting existing fields
    const updateData = { hasSeenOnboarding: true };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (middleName !== undefined) updateData.middleName = middleName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (birthdate !== undefined) updateData.birthdate = birthdate ? new Date(birthdate) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (messengerUrl !== undefined) updateData.messengerUrl = messengerUrl;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (whatsappUrl !== undefined) updateData.whatsappUrl = whatsappUrl;

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return res.status(200).json({ message: "Profile successfully updated" });
  } catch (err) {
    console.error("Complete onboarding error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
