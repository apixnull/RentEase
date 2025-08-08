import prisma from "../../../libs/prismaClient.js";
export const editProfileController = async (req, res) => {
  const userId = req.user.id; 

  const {
    firstName,
    lastName,
    avatarUrl,
    phoneNumber,
    messengerUrl,
    facebookUrl,
  } = req.body;

  try {
    // ... existing user lookup code ...

    // ========== Update UserProfile ==========
    if (firstName !== undefined || lastName !== undefined || avatarUrl !== undefined) {
      await prisma.userProfile.upsert({
        where: { userId },
        update: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(avatarUrl !== undefined && { avatarUrl }),
        },
        create: {
          userId,
          firstName: firstName || "",
          lastName: lastName || "",
          avatarUrl: avatarUrl || null,
        },
      });
    }

    // ========== Update Contact Info ==========
    if (
      phoneNumber !== undefined ||
      messengerUrl !== undefined ||
      facebookUrl !== undefined
    ) {
      await prisma.userContactInfo.upsert({
        where: { userId },
        update: {
          ...(phoneNumber !== undefined && { phoneNumber }),
          ...(messengerUrl !== undefined && { messengerUrl }),
          ...(facebookUrl !== undefined && { facebookUrl }),
        },
        create: {
          userId,
          phoneNumber: phoneNumber || null,
          messengerUrl: messengerUrl || null,
          facebookUrl: facebookUrl || null,
        },
      });
    }

    return res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};