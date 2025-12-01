import prisma from "../../libs/prismaClient.js";

// ------------------------------------------------------------------------------
// GET SPECIFIC UNIT DETAILS (for landlord dashboard)
// Includes: unit info, amenities, property summary, occupant, listing, reviews.
// ------------------------------------------------------------------------------

export const getUnitDetails = async (req, res) => {
  try {
    const { unitId } = req.params;
    const ownerId = req.user?.id;

    // ⚠️ Validate input
    if (!unitId) {
      return res.status(400).json({ message: "Unit ID is required" });
    }

    // 🔹 Fetch unit data with property, amenities, reviews, and latest listing
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { ownerId }, // ensure landlord owns it
      },
      include: {
        amenities: { select: { id: true, name: true, category: true } },
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true, // nullable
            createdAt: true,
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true, // nullable
              },
            },
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
          },
        },
        listings: {
          orderBy: { createdAt: "desc" },
          take: 1, // latest listing only
          select: {
            id: true, // ✅ include listing ID
            isFeatured: true,
            lifecycleStatus: true,
            visibleAt: true,
            flaggedAt: true,
            flaggedReason: true, // ⚠️ include flag reason for FLAGGED status
            hiddenAt: true,
            blockedAt: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!unit) {
      return res
        .status(404)
        .json({ message: "Unit not found or not accessible" });
    }

    // 🔹 Check for active lease and get tenant information
    const activeLease = await prisma.lease.findFirst({
      where: {
        unitId: unit.id,
        status: 'ACTIVE',
      },
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Get the most recent active lease
    });

    // 🧮 Compute review stats
    const totalReviews = await prisma.unitReview.count({
      where: { unitId: unit.id },
    });

    const avgRatingResult = await prisma.unitReview.aggregate({
      where: { unitId: unit.id },
      _avg: { rating: true },
    });

    const averageRating = avgRatingResult._avg.rating ?? 0;

    // 🔹 Count views from UnitView table
    const viewCount = await prisma.unitView.count({
      where: { unitId: unit.id },
    });

    // 🧩 Extract latest listing safely
    const latestListing = unit.listings[0] || null;

    // ⚠️ Check if editing will affect listing status
    // If listing is VISIBLE, HIDDEN, or FLAGGED, editing will reset it to WAITING_REVIEW
    const willAffectListing =
      latestListing &&
      ["VISIBLE", "HIDDEN", "FLAGGED"].includes(latestListing.lifecycleStatus);

    // ✅ Structured response
    return res.json({
      id: unit.id,
      label: unit.label,
      description: unit.description,
      floorNumber: unit.floorNumber,
      maxOccupancy: unit.maxOccupancy,
      targetPrice: unit.targetPrice,
      mainImageUrl: unit.mainImageUrl,
      otherImages: unit.otherImages,
      unitLeaseRules: unit.unitLeaseRules,
      viewCount: viewCount, // ✅ count from UnitView table
      requiresScreening: unit.requiresScreening,
      unitCondition: unit.unitCondition,
      occupiedAt: activeLease ? activeLease.startDate.toISOString() : null, // Use lease start date if active
      leaseId: activeLease ? activeLease.id : null, // Include lease ID for navigation
      listedAt:
        !!latestListing &&
        ["VISIBLE", "FLAGGED", "HIDDEN"].includes(
          latestListing.lifecycleStatus
        ), // true if latest listing is active
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      amenities: unit.amenities,
      occupant: activeLease ? activeLease.tenant : null, // Get tenant from active lease
      property: unit.property,
      reviews: unit.reviews,
      reviewStats: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
      },
      latestListing: latestListing
        ? {
            id: latestListing.id, // ✅ include listing ID
            lifecycleStatus: latestListing.lifecycleStatus,
            isFeatured: latestListing.isFeatured,
            visibleAt: latestListing.visibleAt,
            flaggedAt: latestListing.flaggedAt,
            flaggedReason: latestListing.flaggedReason, // ⚠️ include flag reason
            hiddenAt: latestListing.hiddenAt,
            blockedAt: latestListing.blockedAt,
            expiresAt: latestListing.expiresAt,
            createdAt: latestListing.createdAt,
          }
        : null,
      willAffectListing: willAffectListing, // ⚠️ Flag indicating if editing will reset listing status
    });
  } catch (error) {
    console.error("Error fetching unit details:", error);
    return res.status(500).json({ message: "Failed to fetch unit details" });
  }
};


// ---------------------------------------------- CREATE NEW UNIT UNDER PROPERTY ----------------------------------------------
export const createUnit = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      id,
      label,
      description,
      floorNumber,
      maxOccupancy,
      mainImageUrl,
      otherImages,
      unitLeaseRules,
      targetPrice,
      requiresScreening,
      amenities,
    } = req.body;

    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    // ✅ Basic validation
    if (!propertyId || !label || !description || !targetPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: { id: true },
    });

    if (!property) {
      return res
        .status(403)
        .json({ message: "Property not found or not owned by landlord" });
    }

    // ✅ Validate other images count
    if (Array.isArray(otherImages) && otherImages.length > 6) {
      return res.status(400).json({
        message: "Maximum of 6 other images allowed",
      });
    }

    // ✅ Prevent duplicate unit labels (case + space insensitive)
    const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();
    const normalizedLabel = normalize(label);

    const existingUnits = await prisma.unit.findMany({
      where: { propertyId },
      select: { label: true },
    });

    if (existingUnits.some((u) => normalize(u.label) === normalizedLabel)) {
      return res.status(400).json({
        message: `A unit with the label "${label}" already exists in this property.`,
      });
    }

    // ✅ Convert and validate numeric fields
    const parsedMaxOccupancy = maxOccupancy ? Number(maxOccupancy) : 1;
    const parsedFloorNumber = floorNumber ? Number(floorNumber) : null;
    const parsedTargetPrice = Number(targetPrice);

    if (parsedTargetPrice > 100000) {
      return res
        .status(400)
        .json({ message: "Target price cannot exceed ₱100,000" });
    }

    // ✅ Create unit
    const newUnit = await prisma.unit.create({
      data: {
        id: id || undefined,
        propertyId,
        label: label.trim(),
        description,
        floorNumber: parsedFloorNumber,
        maxOccupancy: parsedMaxOccupancy,
        mainImageUrl: mainImageUrl || null,
        otherImages: otherImages || null,
        unitLeaseRules: unitLeaseRules || null,
        targetPrice: parsedTargetPrice,
        requiresScreening: requiresScreening ?? false,
        amenities: amenities
          ? { connect: amenities.map((id) => ({ id })) }
          : undefined,
      },
      include: { amenities: true },
    });

    return res.status(201).json({
      message: "Unit created successfully",
      unit: newUnit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    return res.status(500).json({
      message: "Failed to create unit",
      error: error.message,
    });
  }
};

// ---------------------------------------------- UPDATE UNIT ----------------------------------------------
export const updateUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const {
      label,
      description,
      floorNumber,
      maxOccupancy,
      mainImageUrl,
      otherImages,
      unitLeaseRules,
      targetPrice,
      requiresScreening,
      amenities,
    } = req.body;

    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    // ✅ Basic validation
    if (!unitId || !label || !description || !targetPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate unit ownership
    const existingUnit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { ownerId },
      },
      include: {
        property: { select: { id: true } },
      },
    });

    if (!existingUnit) {
      return res
        .status(404)
        .json({ message: "Unit not found or not owned by landlord" });
    }

    // ✅ Validate other images count
    if (Array.isArray(otherImages) && otherImages.length > 6) {
      return res.status(400).json({
        message: "Maximum of 6 other images allowed",
      });
    }

    // ✅ Prevent duplicate unit labels (case + space insensitive) - exclude current unit
    const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();
    const normalizedLabel = normalize(label);

    const existingUnits = await prisma.unit.findMany({
      where: {
        propertyId: existingUnit.propertyId,
        id: { not: unitId }, // Exclude current unit
      },
      select: { label: true },
    });

    if (existingUnits.some((u) => normalize(u.label) === normalizedLabel)) {
      return res.status(400).json({
        message: `A unit with the label "${label}" already exists in this property.`,
      });
    }

    // ✅ Convert and validate numeric fields
    const parsedMaxOccupancy = maxOccupancy ? Number(maxOccupancy) : 1;
    const parsedFloorNumber = floorNumber ? Number(floorNumber) : null;
    const parsedTargetPrice = Number(targetPrice);

    if (parsedTargetPrice > 100000) {
      return res
        .status(400)
        .json({ message: "Target price cannot exceed ₱100,000" });
    }

    // ✅ Update unit
    const updatedUnit = await prisma.unit.update({
      where: { id: unitId },
      data: {
        label: label.trim(),
        description,
        floorNumber: parsedFloorNumber,
        maxOccupancy: parsedMaxOccupancy,
        mainImageUrl: mainImageUrl || null,
        otherImages: otherImages || null,
        unitLeaseRules: unitLeaseRules || null,
        targetPrice: parsedTargetPrice,
        requiresScreening: requiresScreening ?? false,
        amenities: amenities
          ? { set: [], connect: amenities.map((id) => ({ id })) }
          : { set: [] },
      },
      include: { amenities: true },
    });

    // ⚠️ If unit has an active listing (VISIBLE, HIDDEN, or FLAGGED), reset it to WAITING_REVIEW
    // This requires admin review again after unit information changes
    const latestListing = await prisma.listing.findFirst({
      where: { unitId: unitId },
      orderBy: { createdAt: "desc" },
      select: { id: true, lifecycleStatus: true },
    });

    if (
      latestListing &&
      ["VISIBLE", "HIDDEN", "FLAGGED"].includes(latestListing.lifecycleStatus)
    ) {
      await prisma.listing.update({
        where: { id: latestListing.id },
        data: {
          lifecycleStatus: "WAITING_REVIEW",
          visibleAt: null,
          hiddenAt: null,
          flaggedAt: null,
          reviewedAt: null,
        },
      });
    }

    return res.status(200).json({
      message: "Unit updated successfully",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Error updating unit:", error);
    return res.status(500).json({
      message: "Failed to update unit",
      error: error.message,
    });
  }
};

// ---------------------------------------------- DELETE UNIT ----------------------------------------------
export const deleteUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const ownerId = req.user?.id;

    if (!unitId) {
      return res.status(400).json({ message: "Unit ID is required" });
    }

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify unit exists and belongs to the landlord
    const existingUnit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { ownerId },
      },
      select: {
        id: true,
        label: true,
        mainImageUrl: true,
        property: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // Delete unit (cascade will handle related data: listings, leases, reviews, etc.)
    await prisma.unit.delete({
      where: { id: unitId },
    });

    return res.status(200).json({
      message: "Unit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting unit:", error);
    return res.status(500).json({
      message: "Failed to delete unit.",
      details: error.message,
    });
  }
};
