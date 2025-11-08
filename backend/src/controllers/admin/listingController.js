import prisma from "../../libs/prismaClient.js";

// ============================================================================
// ADMIN — GET ALL LISTINGS (Simplified for new schema)
// ----------------------------------------------------------------------------
// Fetches all listings (except WAITING_PAYMENT) with property, unit, and 
// landlord info for admin dashboard monitoring.
// ============================================================================
export const getAllListingsForAdmin = async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        lifecycleStatus: {
          not: "WAITING_PAYMENT", // exclude unpaid/incomplete listings
        },
      },
      orderBy: { createdAt: "desc" },
      select: {
        // ---------------------------------------------------------------------
        // CORE INFO
        // ---------------------------------------------------------------------
        id: true,
        lifecycleStatus: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,

        // ---------------------------------------------------------------------
        // LIFECYCLE TIMESTAMPS
        // ---------------------------------------------------------------------
        expiresAt: true,
        reviewedAt: true,

        // ---------------------------------------------------------------------
        // ADMIN REVIEW (Manual Flags / Blocks)
        // ---------------------------------------------------------------------
        reviewedBy: true,
        flaggedReason: true,
        blockedReason: true,

        // ---------------------------------------------------------------------
        // UNIT + PROPERTY RELATIONS
        // ---------------------------------------------------------------------
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },

        // ---------------------------------------------------------------------
        // LANDLORD (OWNER)
        // ---------------------------------------------------------------------
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(200).json({ listings });
  } catch (error) {
    console.error("❌ Error in getAllListingsForAdmin:", error);
    return res.status(500).json({
      error: "Failed to fetch listings for admin.",
    });
  }
};


// ============================================================================
// ADMIN — GET SPECIFIC LISTING (Native Fields + Unit, Property & Reviewer)
// ----------------------------------------------------------------------------
// Returns all native listing fields, plus unit label, property's full address,
// and reviewer information (admin who reviewed the listing).
// ============================================================================
export const getSpecificListingAdmin = async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        // ---------------------------------------------------------------------
        // UNIT + PROPERTY
        // ---------------------------------------------------------------------
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },
          },
        },

        // ---------------------------------------------------------------------
        // REVIEWER (Admin user who reviewed the listing)
        // ---------------------------------------------------------------------
         reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    // -------------------------------------------------------------------------
    // Response
    // -------------------------------------------------------------------------
    return res.status(200).json({ listing });
  } catch (error) {
    console.error("❌ Error in getSpecificListingAdmin:", error);
    return res.status(500).json({
      error: "Failed to fetch listing details.",
    });
  }
};

// ============================================================================
// ADMIN — GET UNIT, PROPERTY & LANDLORD BY LISTING ID
// ----------------------------------------------------------------------------
// Returns separated data:
//   • unit → unit info
//   • property → property info
//   • landlord → landlord info
// ============================================================================
export const getListingUnitAndProperty = async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        // ---------------------------------------------------------------------
        // UNIT + PROPERTY INFO
        // ---------------------------------------------------------------------
        unit: {
          select: {
            id: true,
            label: true,
            description: true,
            targetPrice: true,
            mainImageUrl: true,
            otherImages: true,
            unitLeaseRules: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                mainImageUrl: true,
                nearInstitutions: true,
                otherInformation: true,
                street: true,
                barangay: true,
                zipCode: true,
                latitude: true,
                longitude: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },
          },
        },

        // ---------------------------------------------------------------------
        // LANDLORD INFO
        // ---------------------------------------------------------------------
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!listing || !listing.unit) {
      return res.status(404).json({
        error: "Unit, property, or landlord information not found for this listing.",
      });
    }

    // -------------------------------------------------------------------------
    // Response — separated
    // -------------------------------------------------------------------------
    return res.status(200).json({
      unit: listing.unit,
      property: listing.unit.property,
      landlord: listing.landlord,
    });
  } catch (error) {
    console.error("❌ Error in getListingUnitAndProperty:", error);
    return res.status(500).json({
      error: "Failed to fetch unit, property, and landlord information.",
    });
  }
};

// ============================================================================
// ADMIN — UPDATE LISTING STATUS (Approve, Flag, Block)
// ----------------------------------------------------------------------------
// Admin moderation endpoint for controlling listing visibility lifecycle.
// - approve → mark as VISIBLE
// - flag → mark as FLAGGED
// - block → mark as BLOCKED
// ============================================================================
export const updateListingStatus = async (req, res) => {
  const { listingId } = req.params;
  const { action, reason } = req.body;

  try {
    // Ensure authenticated admin
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(403).json({ error: "Unauthorized: Admin ID missing." });
    }

    // Only allow valid moderation actions
    const validActions = ["approve", "flag", "block"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Must be one of: ${validActions.join(", ")}.`,
      });
    }

    // Fetch current listing to get existing resubmissionHistory and lifecycleStatus
    const currentListing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { 
        resubmissionHistory: true,
        lifecycleStatus: true,
      },
    });

    if (!currentListing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const now = new Date();
    
    // Get existing resubmission history
    const existingResubmissionHistory = Array.isArray(currentListing.resubmissionHistory)
      ? [...currentListing.resubmissionHistory]
      : [];

    // Validation: Prevent blocking an already blocked listing
    if (action === "block" && (currentListing.lifecycleStatus || "").toUpperCase() === "BLOCKED") {
      return res.status(400).json({
        error: "Cannot block a listing that is already blocked.",
      });
    }

    let updateData = {
      reviewedBy: adminId,
      reviewedAt: now,

      // Reset all timestamps and reasons for consistency
      visibleAt: null,
      hiddenAt: null,
      flaggedAt: null,
      blockedAt: null,

      // Always clear both reasons to prevent residue from prior moderation
      flaggedReason: null,
      blockedReason: null,
    };

    // -------------------------------------------------------------------------
    // ⚙️ Apply action logic
    // -------------------------------------------------------------------------
    if (action === "approve") {
      updateData = {
        ...updateData,
        lifecycleStatus: "VISIBLE",
        visibleAt: now,
      };
    }

    if (action === "flag") {
      const flagReason = reason || "Suspicious content or violation detected.";
      
      // Add to resubmission history
      const updatedResubmissionHistory = [
        ...existingResubmissionHistory,
        {
          attempt: existingResubmissionHistory.length + 1,
          type: "FLAGGED",
          reason: flagReason,
          resubmittedAt: now.toISOString(),
        },
      ];

      updateData = {
        ...updateData,
        lifecycleStatus: "FLAGGED",
        flaggedAt: now,
        flaggedReason: flagReason,
        blockedReason: null, // ensure no leftover block reason
        resubmissionHistory: updatedResubmissionHistory,
      };
    }

    if (action === "block") {
      const blockReason = reason || "Severe policy violation or fraudulent activity.";
      
      // Add to resubmission history
      const updatedResubmissionHistory = [
        ...existingResubmissionHistory,
        {
          attempt: existingResubmissionHistory.length + 1,
          type: "BLOCKED",
          reason: blockReason,
          resubmittedAt: now.toISOString(),
        },
      ];

      updateData = {
        ...updateData,
        lifecycleStatus: "BLOCKED",
        blockedAt: now,
        blockedReason: blockReason,
        flaggedReason: null, // ensure no leftover flag reason
        resubmissionHistory: updatedResubmissionHistory,
      };
    }

    // -------------------------------------------------------------------------
    // 🧾 Commit update
    // -------------------------------------------------------------------------
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return res.status(200).json({
      message: `Listing successfully ${action}d.`,
      listing: updatedListing,
    });
  } catch (error) {
    console.error("❌ Error in updateListingStatus:", error);
    return res.status(500).json({
      error: "Failed to update listing status.",
    });
  }
};
