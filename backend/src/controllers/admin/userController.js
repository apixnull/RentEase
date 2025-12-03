import prisma from "../../libs/prismaClient.js";
import redis from "../../libs/redisClient.js";

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
// When blocking, destroys all active sessions to force immediate logout
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

    // If blocking, destroy all active sessions for this user to force immediate logout
    if (action === "block") {
      try {
        // Get all session keys from Redis
        const sessionKeys = await redis.keys("sess:*");
        let destroyedCount = 0;

        // Check each session and destroy if it belongs to the blocked user
        for (const key of sessionKeys) {
          try {
            const sessionData = await redis.get(key);
            if (sessionData) {
              const session = typeof sessionData === "string" ? JSON.parse(sessionData) : sessionData;
              // Check if this session belongs to the blocked user
              if (session?.user?.id === userId) {
                await redis.del(key);
                destroyedCount++;
              }
            }
          } catch (err) {
            // Skip invalid session data
            console.warn(`⚠️ Failed to process session ${key}:`, err.message);
          }
        }

        console.log(`✅ Destroyed ${destroyedCount} session(s) for blocked user ${userId}`);
      } catch (redisError) {
        // Log error but don't fail the request - user is still blocked in DB
        console.error("❌ Error destroying sessions:", redisError);
      }
    }

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

// ============================================================================
// ADMIN — DELETE LANDLORD OFFENSE
// ----------------------------------------------------------------------------
// Deletes a specific landlord offense record
// ============================================================================
export const deleteLandlordOffense = async (req, res) => {
  const { offenseId } = req.params;

  try {
    // Verify offense exists
    const offense = await prisma.landlordOffense.findUnique({
      where: { id: offenseId },
    });

    if (!offense) {
      return res.status(404).json({ error: "Offense not found." });
    }

    // Delete the offense
    await prisma.landlordOffense.delete({
      where: { id: offenseId },
    });

    return res.status(200).json({
      message: "Offense deleted successfully.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Offense not found." });
    }
    console.error("❌ Error in deleteLandlordOffense:", error);
    return res.status(500).json({
      error: "Failed to delete offense.",
      details: error.message,
    });
  }
};

