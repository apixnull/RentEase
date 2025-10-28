import prisma from "../../libs/prismaClient.js";

// ---------------------------------------------- GET ALL UNITS UNDER THAT PROPERTY ----------------------------------------------
export const getPropertyUnits = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Verify property belongs to landlord
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: { id: true },
    });

    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or not accessible" });
    }

    // Fetch units with only review summary
    const units = await prisma.unit.findMany({
      where: { propertyId },
      select: {
        id: true,
        label: true,
        status: true,
        floorNumber: true,
        createdAt: true,
        updatedAt: true,

        // Pricing
        targetPrice: true,

        // Screening & Listing
        requiresScreening: true,
        listedAt: true,

        // Media
        mainImageUrl: true,

        // Views
        viewCount: true,

        // Reviews summary only
        _count: {
          select: { reviews: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format with only average (rounded to star 1–5) + total
    const formattedUnits = units.map((unit) => {
      const total = unit._count.reviews;

      // compute decimal avg
      const decimalAvg =
        total > 0
          ? unit.reviews.reduce((sum, r) => sum + r.rating, 0) / total
          : 0;

      // round to nearest whole star (0–5)
      const starRating = Math.round(decimalAvg);

      const { reviews, _count, ...rest } = unit;

      return {
        ...rest,
        isListed: unit.listedAt !== null,  // boolean for UI
        reviewsSummary: {
          total,
          average: starRating, // 👈 only 0–5 now
        },
      };
    });

    return res.json(formattedUnits);
  } catch (error) {
    console.error("Error fetching property units:", error);
    return res.status(500).json({ message: "Failed to fetch property units" });
  }
};

// ---------------------------------------------- GET SPECIFIC UNIT DETAILS ----------------------------------------------
export const getUnitDetails = async (req, res) => {
  try {
    const { unitId } = req.params;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    if (!unitId) {
      return res.status(400).json({ message: "Unit ID is required" });
    }

    // --- Get unit with property details, amenities, and latest reviews ---
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { ownerId }, // validate ownership through property
      },
      include: {
        amenities: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
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
      },
    });

    if (!unit) {
      return res
        .status(404)
        .json({ message: "Unit not found or not accessible" });
    }

    // --- Count total reviews ---
    const totalReviews = await prisma.unitReview.count({
      where: { unitId: unit.id },
    });

    // --- Compute average rating ---
    const avgRating = await prisma.unitReview.aggregate({
      where: { unitId: unit.id },
      _avg: { rating: true },
    });

    const averageRating = avgRating._avg.rating ?? 0;
    const starRating = Math.round(averageRating); // 1–5 stars

    // --- Build property address string ---
    const property = unit.property;
    const fullAddress = [
      property.street,
      property.barangay,
      property.city?.name || property.municipality?.name,
      property.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    // --- Response ---
    return res.json({
      ...unit,
      isListed: unit.listedAt != null, // derived flag
      listedAt: unit.listedAt, // raw datetime
      property: {
        id: property.id,
        title: property.title,
        address: fullAddress,
      },
      reviewsSummary: {
        total: totalReviews,
        average: averageRating,
        stars: starRating,
      },
    });
  } catch (error) {
    console.error("Error fetching unit details:", error);
    return res.status(500).json({ message: "Failed to fetch unit details" });
  }
};

// ---------------------------------------------- CREATE NEW UNITS UNDER THAT PROPERTY ----------------------------------------------
export const createUnit = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const {
      id, 
      label,
      description,
      status,
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
    if (!propertyId || !label || !description || !status || !targetPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Validate property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
    });
    if (!property) {
      return res
        .status(403)
        .json({ message: "Property not found or not owned by landlord" });
    }

    // ✅ Validate other images count
    if (Array.isArray(otherImages) && otherImages.length > 6) {
      return res
        .status(400)
        .json({ message: "Maximum of 6 other images allowed" });
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

    // ✅ Convert values
    const parsedMaxOccupancy = maxOccupancy ? Number(maxOccupancy) : 1;
    const parsedFloorNumber = floorNumber ? Number(floorNumber) : null;
    const parsedTargetPrice = Number(targetPrice);
    const parsedSecurityDeposit = securityDeposit
      ? Number(securityDeposit)
      : null;

    // ✅ Create unit — use provided ID if available
    const unit = await prisma.unit.create({
      data: {
        id: id || undefined, // 👈 override if provided, else Prisma uses default uuid()
        propertyId,
        label: label.trim(),
        description,
        status,
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
      id: unit.id,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    return res.status(500).json({
      message: "Failed to create unit",
      error: error.message,
    });
  }
};
