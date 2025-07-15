// src/controllers/auth/resetPasswordController.js
import bcrypt from "bcrypt";
import prisma from "../../libs/prismaClient.js";
import redis from '../../libs/redisClient.js';

const resetPasswordController = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    // Check all fields presence
    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Password complexity validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      });
    }

    // Confirm password match check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Lookup userId by token from Redis
    const userId = await redis.get(`resetPasswordToken:${token}`);

    if (!userId) {
      return res.status(400).json({ message: "Reset token is invalid or expired" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
      },
    });

    // Delete the used reset token from Redis
    await redis.del(`resetPasswordToken:${token}`);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("[ResetPasswordController]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default resetPasswordController;
