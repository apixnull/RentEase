import prisma from "../../libs/prismaClient.js";

const toIso = (value) => (value ? value.toISOString() : null);

const userDetailSelect = {
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
  isVerified: true,
  isDisabled: true,
  lastPasswordChange: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
  landlordOffenses: {
    orderBy: { detectedAt: "desc" },
    select: {
      id: true,
      listingId: true,
      type: true,
      severity: true,
      description: true,
      detectedBy: true,
      detectedAt: true,
      createdAt: true,
      updatedAt: true,
      listing: {
        select: {
          id: true,
          lifecycleStatus: true,
        },
      },
    },
  },
};

const formatUserDetails = (user) => ({
  ...user,
  birthdate: toIso(user.birthdate),
  lastLogin: toIso(user.lastLogin),
  lastPasswordChange: toIso(user.lastPasswordChange),
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  landlordOffenses: user.landlordOffenses.map((offense) => ({
    ...offense,
    detectedAt: offense.detectedAt.toISOString(),
    createdAt: offense.createdAt.toISOString(),
    updatedAt: offense.updatedAt.toISOString(),
    listing: offense.listing
      ? {
          id: offense.listing.id,
          lifecycleStatus: offense.listing.lifecycleStatus,
        }
      : null,
  })),
});

// ============================================================================
// ADMIN — GET ALL USERS
// ----------------------------------------------------------------------------
// Fetches all users sorted by recently created (newest first)
// ============================================================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc", // Newest first
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        middleName: true,
        lastName: true,
        avatarUrl: true,
        phoneNumber: true,
        isVerified: true,
        isDisabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedUsers = users.map((user) => ({
      ...user,
      lastLogin: toIso(user.lastLogin),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error);
    return res.status(500).json({
      error: "Failed to fetch users.",
      details: error.message,
    });
  }
};

// ============================================================================
// ADMIN — GET USER DETAILS
// ----------------------------------------------------------------------------
// Fetches single user profile with contact, security, audit & offenses
// ============================================================================
export const getUserDetails = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userDetailSelect,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json({ user: formatUserDetails(user) });
  } catch (error) {
    console.error("❌ Error in getUserDetails:", error);
    return res.status(500).json({
      error: "Failed to fetch user details.",
      details: error.message,
    });
  }
};

// ============================================================================
// ADMIN — UPDATE USER STATUS
// ----------------------------------------------------------------------------
// Blocks or unblocks a user account
// ============================================================================
export const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { action } = req.body || {};

  if (!["block", "unblock"].includes(action)) {
    return res.status(400).json({ error: "Invalid action. Use 'block' or 'unblock'." });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isDisabled: action === "block" },
      select: { id: true, isDisabled: true },
    });

    return res.status(200).json({
      user: updated,
      message: `User ${action === "block" ? "blocked" : "unblocked"} successfully.`,
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found." });
    }
    console.error("❌ Error in updateUserStatus:", error);
    return res.status(500).json({
      error: "Failed to update user status.",
      details: error.message,
    });
  }
};

