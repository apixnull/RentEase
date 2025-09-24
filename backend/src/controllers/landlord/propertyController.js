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
    return res.status(500).json({ message: "Failed to fetch cities/municipalities" });
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
      nearInstitutions, // expect array of objects or strings
    } = req.body;

    const ownerId = req.user?.id; // from auth middleware
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    // Required fields
    if (!title || !type || !street || !barangay) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate city vs municipality (must be exactly one)
    if ((!cityId && !municipalityId) || (cityId && municipalityId)) {
      return res.status(400).json({
        message: "Provide either a City OR a Municipality, not both",
      });
    }


    // Validate nearInstitutions (max 3 entries)
    if (nearInstitutions && Array.isArray(nearInstitutions)) {
      if (nearInstitutions.length > 3) {
        return res.status(400).json({ message: "Maximum of 3 near institutions allowed" });
      }
    }

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
        nearInstitutions: nearInstitutions ? JSON.stringify(nearInstitutions) : null,
      },
    });

    return res.status(201).json(property);
  } catch (error) {
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
      where: { ownerId, deletedAt: null },
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
        Unit: { select: { status: true, isListed: true, deletedAt: true } }, // include deletedAt
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedProperties = properties.map((prop) => {
      // Filter out soft-deleted units
      const activeUnits = prop.Unit.filter(u => !u.deletedAt);

      const totalUnits = activeUnits.length;
      const listedUnits = activeUnits.filter(u => u.isListed).length;
      const availableUnits = activeUnits.filter(u => u.status === "AVAILABLE").length;
      const occupiedUnits = activeUnits.filter(u => u.status === "OCCUPIED").length;
      const maintenanceUnits = activeUnits.filter(u => u.status === "MAINTENANCE").length;

      return {
        id: prop.id,
        title: prop.title,
        type: prop.type,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt, // ✅ now included
        street: prop.street,
        barangay: prop.barangay,
        zipCode: prop.zipCode,
        city: prop.city,
        municipality: prop.municipality,
        mainImageUrl: prop.mainImageUrl,
        unitsSummary: {
          total: totalUnits,
          listed: listedUnits,
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
      where: { id: propertyId, ownerId, deletedAt: null },
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
          where: { deletedAt: null },
          select: { status: true, isListed: true },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Aggregate unit counts
    const totalUnits = property.Unit.length;
    const listedUnits = property.Unit.filter(u => u.isListed).length;
    const availableUnits = property.Unit.filter(u => u.status === "AVAILABLE").length;
    const occupiedUnits = property.Unit.filter(u => u.status === "OCCUPIED").length;
    const maintenanceUnits = property.Unit.filter(u => u.status === "MAINTENANCE").length;

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
    return res.status(500).json({ message: "Failed to fetch property details" });
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

    // Verify property belongs to landlord and is not soft-deleted
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId, deletedAt: null },
      select: { id: true },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found or not accessible" });
    }

    // Fetch only active units with minimal details
    const units = await prisma.unit.findMany({
      where: { propertyId, deletedAt: null },
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
        isListed: true,

        // Media
        mainImageUrl: true,

        // Views
        viewCount: true,

        // Reviews (just ratings to compute summary)
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute reviews summary
    const formattedUnits = units.map((unit) => {
      const totalReviews = unit.reviews.length;
      const avgRating =
        totalReviews > 0
          ? unit.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : null;

      return {
        ...unit,
        reviewsSummary: {
          total: totalReviews,
          average: avgRating,
        },
      };
    });

    return res.json(formattedUnits);
  } catch (error) {
    console.error("Error fetching property units:", error);
    return res.status(500).json({ message: "Failed to fetch property units" });
  }
};
