// file: propertyController.js
import prisma from "../../libs/prismaClient.js";

// ---------------------------------------------- GET ALL AMENITIES ----------------------------------------------
export const getAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });

    return res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return res.status(500).json({ message: "Failed to fetch amenities" });
  }
};

// ---------------------------------------------- GET ALL CITIES & MUNICIPALITIES ----------------------------------------------
export const getCitiesAndMunicipalities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const municipalities = await prisma.municipality.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return res.json({
      cities,
      municipalities,
    });
  } catch (error) {
    console.error("Error fetching cities/municipalities:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch cities/municipalities" });
  }
};

// ---------------------------------------------- CREATE PROPERTY ----------------------------------------------
export const createProperty = async (req, res) => {
  try {
    const {
      title,
      type,
      street,
      barangay,
      zipCode,
      cityId,
      municipalityId,
      latitude,
      longitude,
      mainImageUrl,
      nearInstitutions,
    } = req.body;

    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    // --- Required fields ---
    if (!title || !type || !street || !barangay) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // --- Validate city vs municipality (must be exactly one) ---
    if ((!cityId && !municipalityId) || (cityId && municipalityId)) {
      return res.status(400).json({
        message: "Provide either a City OR a Municipality, not both",
      });
    }

    // --- Validate institutions ---
    if (nearInstitutions && Array.isArray(nearInstitutions)) {
      if (nearInstitutions.length > 10) {
        return res
          .status(400)
          .json({ message: "Maximum of 10 nearby institutions allowed" });
      }

      for (const inst of nearInstitutions) {
        const name = typeof inst === "string" ? inst : inst?.name || "";

        const wordCount = name.trim().split(/\s+/).length;
        if (wordCount > 3) {
          return res.status(400).json({
            message: `Institution "${name}" exceeds 3-word limit`,
          });
        }
      }
    }

    // --- Create property ---
    const property = await prisma.property.create({
      data: {
        ownerId,
        title,
        type,
        street,
        barangay,
        zipCode: zipCode || null,
        cityId: cityId || null,
        municipalityId: municipalityId || null,
        latitude: latitude || null,
        longitude: longitude || null,
        mainImageUrl: mainImageUrl || null,
        nearInstitutions: nearInstitutions
          ? JSON.stringify(nearInstitutions)
          : null,
      },
      select: {
        id: true, // Only return the ID
      },
    });

    return res.status(201).json({
      message: "Property created successfully",
      id: property.id, // id
    });
  } catch (error) {
    if (
      error.name === "PrismaClientKnownRequestError" &&
      error.code === "P2002"
    ) {
      return res.status(400).json({
        message: "A property with the same title and address already exists.",
      });
    }

    console.error("Error creating property:", error);
    return res.status(500).json({ message: "Failed to create property" });
  }
};

// ---------------------------------------------- GET ALL PROPERTIES OF THE LANDLORD (SUMMARY WITH COUNTS) ----------------------------------------------
export const getLandlordProperties = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    // Fetch properties
    const properties = await prisma.property.findMany({
      where: { ownerId },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        street: true,
        barangay: true,
        zipCode: true,
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        mainImageUrl: true,
        Unit: { select: { status: true } }, // only need status
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedProperties = properties.map((prop) => {
      const units = prop.Unit;

      const totalUnits = units.length;
      const availableUnits = units.filter(
        (u) => u.status === "AVAILABLE"
      ).length;
      const occupiedUnits = units.filter((u) => u.status === "OCCUPIED").length;
      const maintenanceUnits = units.filter(
        (u) => u.status === "MAINTENANCE"
      ).length;

      return {
        id: prop.id,
        title: prop.title,
        type: prop.type,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        street: prop.street,
        barangay: prop.barangay,
        zipCode: prop.zipCode,
        city: prop.city,
        municipality: prop.municipality,
        mainImageUrl: prop.mainImageUrl,
        unitsSummary: {
          total: totalUnits,
          available: availableUnits,
          occupied: occupiedUnits,
          maintenance: maintenanceUnits,
        },
      };
    });

    return res.json(formattedProperties);
  } catch (error) {
    console.error("Error fetching landlord properties with counts:", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// ---------------------------------------------- GET SPECIFIC PROPERTY DETAILS INCLUDING UNIT COUNTS ----------------------------------------------
export const getPropertyDetails = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const ownerId = req.user?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Fetch property with aggregated counts
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        street: true,
        barangay: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        mainImageUrl: true,
        nearInstitutions: true,
        Unit: {
          select: { status: true, listedAt: true },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Aggregate unit counts
    const totalUnits = property.Unit.length;
    const listedUnits = property.Unit.filter((u) => u.listedAt !== null).length;
    const availableUnits = property.Unit.filter(
      (u) => u.status === "AVAILABLE"
    ).length;
    const occupiedUnits = property.Unit.filter(
      (u) => u.status === "OCCUPIED"
    ).length;
    const maintenanceUnits = property.Unit.filter(
      (u) => u.status === "MAINTENANCE"
    ).length;

    const formattedProperty = {
      id: property.id,
      title: property.title,
      type: property.type,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      street: property.street,
      barangay: property.barangay,
      zipCode: property.zipCode,
      latitude: property.latitude,
      longitude: property.longitude,
      city: property.city,
      municipality: property.municipality,
      mainImageUrl: property.mainImageUrl,
      nearInstitutions: property.nearInstitutions,
      unitsSummary: {
        total: totalUnits,
        listed: listedUnits,
        available: availableUnits,
        occupied: occupiedUnits,
        maintenance: maintenanceUnits,
      },
    };

    return res.json(formattedProperty);
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch property details" });
  }
};
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
        securityDeposit: true,

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
    const { propertyId, unitId } = req.params;
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
        propertyId,
        property: { ownerId },
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
      label,
      description,
      status,
      floorNumber,
      maxOccupancy,
      mainImageUrl,
      otherImages, // an array of images up to 6
      unitLeaseRules,
      targetPrice,
      securityDeposit,
      requiresScreening,
      amenities, // array of amenity IDs
    } = req.body;

    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    if (!propertyId || !label || !description || !status || !targetPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
    });
    if (!property) {
      return res
        .status(403)
        .json({ message: "Property not found or not owned by landlord" });
    }

    // Validate otherImages (max 6)
    if (otherImages && Array.isArray(otherImages) && otherImages.length > 6) {
      return res
        .status(400)
        .json({ message: "Maximum of 6 other images allowed" });
    }

    // --- Prevent duplicate unit labels (case + space insensitive) ---
    const normalize = (str) => str.replace(/\s+/g, "").toLowerCase();
    const normalizedLabel = normalize(label);

    const existingUnits = await prisma.unit.findMany({
      where: { propertyId },
      select: { label: true },
    });

    const conflict = existingUnits.some(
      (u) => normalize(u.label) === normalizedLabel
    );

    if (conflict) {
      return res.status(400).json({
        message: `A unit with the label "${label}" already exists in this property.`,
      });
    }

    // ✅ Convert values to correct types
    const parsedMaxOccupancy = maxOccupancy ? Number(maxOccupancy) : 1;
    const parsedFloorNumber = floorNumber ? Number(floorNumber) : null;
    const parsedTargetPrice = Number(targetPrice);
    const parsedSecurityDeposit = securityDeposit
      ? Number(securityDeposit)
      : null;

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId,
        label: label.trim(),
        description,
        status,
        floorNumber: parsedFloorNumber,
        maxOccupancy: parsedMaxOccupancy,
        mainImageUrl: mainImageUrl || null,
        otherImages: otherImages || null, // Prisma handles JSON
        unitLeaseRules: unitLeaseRules || null,
        targetPrice: parsedTargetPrice,
        securityDeposit: parsedSecurityDeposit,
        requiresScreening: requiresScreening ?? false,
        amenities: amenities
          ? {
              connect: amenities.map((id) => ({ id })),
            }
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
    return res.status(500).json({ message: "Failed to create unit" });
  }
};
