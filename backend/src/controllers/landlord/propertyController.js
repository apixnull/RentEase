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
/**
 * @desc Create a new property
 * @route POST /api/landlord/property/create
 * @access Private (LANDLORD)
 */
export const createProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;

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
      otherInformation,
    } = req.body;

    // --- Required fields ---
    if (!title || !type || !street || !barangay) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // --- Validate city vs municipality ---
    if ((!cityId && !municipalityId) || (cityId && municipalityId)) {
      return res.status(400).json({
        error: "Provide either a City OR a Municipality, not both.",
      });
    }

    // --- Validate institutions JSON ---
    let parsedInstitutions = null;
    if (nearInstitutions) {
      if (!Array.isArray(nearInstitutions)) {
        return res
          .status(400)
          .json({ error: "nearInstitutions must be an array." });
      }

      if (nearInstitutions.length > 10) {
        return res
          .status(400)
          .json({ error: "Maximum of 10 nearby institutions allowed." });
      }

      for (const inst of nearInstitutions) {
        const name = typeof inst === "string" ? inst : inst?.name || "";
        const wordCount = name.trim().split(/\s+/).length;
        if (wordCount > 3) {
          return res.status(400).json({
            error: `Institution "${name}" exceeds 3-word limit.`,
          });
        }
      }
      parsedInstitutions = nearInstitutions;
    }

    // --- Validate otherInformation JSON ---
    let parsedOtherInfo = null;
    if (otherInformation) {
      if (!Array.isArray(otherInformation)) {
        return res
          .status(400)
          .json({ error: "otherInformation must be an array." });
      }

      parsedOtherInfo = otherInformation.map((info) => ({
        context: info.context || "",
        description: info.description || "",
      }));
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
        nearInstitutions: parsedInstitutions || null,
        otherInformation: parsedOtherInfo || null,
      },
      select: {
        id: true,
        title: true,
      },
    });

    return res.status(201).json({
      message: `Property "${property.title}" created successfully.`,
      id: property.id,
    });
  } catch (error) {
    console.error("❌ Error creating property:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A property with the same title and address already exists.",
      });
    }

    return res.status(500).json({
      error: "Failed to create property.",
      details: error.message,
    });
  }
};

// ------------------------------------------------------------------------------
// GET ALL PROPERTY INCLUDING UNITS SUMMARY
// ------------------------------------------------------------------------------

export const getLandlordProperties = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    // 1️⃣ Fetch all properties of the landlord
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        Unit: {
          select: {
            unitCondition: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2️⃣ Count active listings per property
    const propertyIds = properties.map((p) => p.id);
    const listedCounts = await prisma.listing.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: propertyIds },
        lifecycleStatus: { in: ['VISIBLE', 'FLAGGED', 'HIDDEN'] }, // active listings
      },
      _count: { id: true },
    });

    // Map propertyId → listed count
    const listedMap = {};
    listedCounts.forEach((lc) => {
      listedMap[lc.propertyId] = lc._count.id;
    });

    // 3️⃣ Check if each unit has an active lease
    const allUnitIds = properties.flatMap((p) => p.Unit.map((u) => u.id));
    const activeLeases = await prisma.lease.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: allUnitIds },
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const activeLeaseMap = {};
    activeLeases.forEach((lease) => {
      activeLeaseMap[lease.unitId] = true; // ✅ true if unit has an active lease
    });

    // 4️⃣ Format the response
    const formattedProperties = properties.map((prop) => {
      const units = prop.Unit || [];

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => activeLeaseMap[u.id]).length; // ✅ count units with active leases
      const maintenanceUnits = units.filter(u =>
        ["NEED_MAINTENANCE", "UNDER_MAINTENANCE"].includes(u.unitCondition)
      ).length;
      const availableUnits = units.filter(u => u.unitCondition === "GOOD" && !activeLeaseMap[u.id]).length; // ✅ check active lease instead of occupiedAt
      const listedUnits = listedMap[prop.id] || 0; // active listings count

      return {
        id: prop.id,
        title: prop.title,
        type: prop.type,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        address: {
          street: prop.street,
          barangay: prop.barangay,
          zipCode: prop.zipCode,
          city: prop.city,
          municipality: prop.municipality,
        },
        mainImageUrl: prop.mainImageUrl,
        unitsSummary: {
          total: totalUnits,
          listed: listedUnits,       // units with active listings
          available: availableUnits,
          occupied: occupiedUnits,
          maintenance: maintenanceUnits,
        },
      };
    });

    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};
// ------------------------------------------------------------------------------
// GET SPECIFIC PROPERTY DETAILS INCLUDING UNITS, REVIEWS & AMENITIES
// ------------------------------------------------------------------------------

export const getPropertyDetailsAndUnits = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // 🔹 Fetch property with all related units, amenities, and reviews
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
        mainImageUrl: true,
        nearInstitutions: true,
        otherInformation: true,
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        Unit: {
          select: {
            id: true,
            label: true,
            description: true,
            floorNumber: true,
            maxOccupancy: true,
            targetPrice: true,
            mainImageUrl: true,
            createdAt: true,
            updatedAt: true,
            requiresScreening: true,
            unitCondition: true,
            amenities: { select: { id: true, name: true, category: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 🔹 Check if each unit has at least one active listing
    const unitIds = property.Unit.map((u) => u.id);
    const listings = await prisma.listing.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
        lifecycleStatus: { in: ['VISIBLE', 'FLAGGED', 'HIDDEN'] },
      },
      _count: { id: true },
    });

    const listingMap = {};
    listings.forEach((l) => {
      listingMap[l.unitId] = true; // ✅ just return true if there is an active listing
    });

    // 🔹 Check if each unit has an active lease
    const activeLeases = await prisma.lease.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const activeLeaseMap = {};
    activeLeases.forEach((lease) => {
      activeLeaseMap[lease.unitId] = true; // ✅ true if unit has an active lease
    });

    // 🔹 Count views from UnitView table for each unit
    const viewCounts = await prisma.unitView.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
      },
      _count: { id: true },
    });

    const viewCountMap = {};
    viewCounts.forEach((vc) => {
      viewCountMap[vc.unitId] = vc._count.id; // ✅ total view count from UnitView table
    });

    // --- Compute condition-based summaries ---
    const totalUnits = property.Unit.length;
    const goodUnits = property.Unit.filter((u) => u.unitCondition === "GOOD").length;
    const needMaintenanceUnits = property.Unit.filter((u) => u.unitCondition === "NEED_MAINTENANCE").length;
    const underMaintenanceUnits = property.Unit.filter((u) => u.unitCondition === "UNDER_MAINTENANCE").length;
    const unusableUnits = property.Unit.filter((u) => u.unitCondition === "UNUSABLE").length;
    const occupiedUnits = property.Unit.filter((u) => activeLeaseMap[u.id]).length; // ✅ count units with active leases
    const listedUnits = property.Unit.filter((u) => listingMap[u.id]).length; // ✅ total units with active listings

    // --- Format each unit ---
    const units = property.Unit.map((u) => {
      const totalReviews = u.reviews.length;
      const averageRating =
        totalReviews > 0
          ? u.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      return {
        id: u.id,
        label: u.label,
        description: u.description,
        floorNumber: u.floorNumber,
        maxOccupancy: u.maxOccupancy,
        targetPrice: u.targetPrice,
        mainImageUrl: u.mainImageUrl,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        occupiedAt: activeLeaseMap[u.id] ? new Date().toISOString() : null, // ✅ set based on active lease
        isListed: listingMap[u.id] || false, // ✅ true/false if listed
        viewCount: viewCountMap[u.id] || 0, // ✅ count from UnitView table
        unitCondition: u.unitCondition,
        requiresScreening: u.requiresScreening,
        amenities: u.amenities,
        reviewStats: {
          totalReviews,
          averageRating: Number(averageRating.toFixed(1)),
        },
      };
    });

    // --- Final property summary ---
    const propertyDetails = {
      id: property.id,
      title: property.title,
      type: property.type,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      address: {
        street: property.street,
        barangay: property.barangay,
        zipCode: property.zipCode,
        city: property.city,
        municipality: property.municipality,
      },
      location: {
        latitude: property.latitude,
        longitude: property.longitude,
      },
      media: {
        mainImageUrl: property.mainImageUrl,
        nearInstitutions: property.nearInstitutions,
        otherInformation: property.otherInformation,
      },
      unitsSummary: {
        listed: listedUnits, // ✅ total units with active listings
        total: totalUnits,
        occupied: occupiedUnits,
        good: goodUnits,
        needMaintenance: needMaintenanceUnits,
        underMaintenance: underMaintenanceUnits,
        unusable: unusableUnits,
      },
    };

    // ✅ Return property + unit details
    return res.json({
      property: propertyDetails,
      units,
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res.status(500).json({ message: "Failed to fetch property details" });
  }
};
