// controller/authController/getCurrentUserInfo.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrentUserInfo = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isDisabled: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("getCurrentUserInfo error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
