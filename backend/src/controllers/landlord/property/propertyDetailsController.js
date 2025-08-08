/**
 * Controller: propertyDetailsController
 * -------------------------------------
 * Retrieves complete property details for the given property ID, including:
 * - All unit information
 * - Count of AVAILABLE, OCCUPIED, and MAINTENANCE units
 * - Full property data (address, media, features, etc.)
 *
 * Expects: propertyId from URL params
 * Route: GET /property/:propertyId/details
 */

import prisma from "../../../libs/prismaClient.js";
export const propertyDetailsController = async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Validate required path parameter
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Fetch property by ID, including its related units
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        Unit: true, // Fetch all units linked to the property
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Count number of units per status
    const unitCounts = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      MAINTENANCE: 0,
    };

    property.Unit.forEach((unit) => {
      unitCounts[unit.status] += 1;
    });

    return res.status(200).json({
      propertyInfo: {
        id: property.id,
        title: property.title,
        description: property.description,
        type: property.type,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,

        address: {
          street: property.street,
          barangay: property.barangay,
          municipality: property.municipality,
          city: property.city,
          province: property.province,
          zipCode: property.zipCode,
        },

        amenityTags: property.amenityTags,
        propertyFeatures: property.propertyFeatures,
        leaseRules: property.leaseRules,

        propertyImageUrls: property.propertyImageUrls,
        mainImageUrl: property.mainImageUrl,

        requiresScreening: property.requiresScreening,
      },

      unitStats: {
        totalUnits: property.Unit.length,
        available: unitCounts.AVAILABLE,
        occupied: unitCounts.OCCUPIED,
        maintenance: unitCounts.MAINTENANCE,
      },

      units: property.Unit, // Full list of units with complete details
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res.status(500).json({ message: "Failed to fetch property details", error: error.message });
  }
};
