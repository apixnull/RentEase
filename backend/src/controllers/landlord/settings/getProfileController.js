import prisma from "../../../libs/prismaClient.js";

// ========== GET EDITABLE USER PROFILE & CONTACT INFO ==========
export const getUserProfileController = async (req, res) => {
  const userId = req.user.id; // Assumes auth middleware is used

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        UserProfile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        ContactInfo: {
          select: {
            phoneNumber: true,
            messengerUrl: true,
            facebookUrl: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    console.error("Error retrieving user profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
