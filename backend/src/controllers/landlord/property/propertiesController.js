// src/controllers/landlord/property/propertiesController.js
import prisma from "../../../libs/prismaClient.js";

/**
 * GET /landlord/properties
 * Returns a summary of each property owned by the authenticated landlord.
 */
const propertiesController = async (req, res) => {
  try {
    const landlordId = req.user.id;

    // 1) Fetch core property info including JSON arrays for features and amenities
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        street: true,
        barangay: true,
        municipality: true,
        city: true,
        province: true,
        zipCode: true,
        requiresScreening: true,
        isListed: true,
        mainImageUrl: true,
        amenityTags: true,              // JSON array of strings, intangible amenities
        propertySharedFeatures: true,   // JSON array of strings, tangible/shared features
      },
    });

    // 2) Enrich each property with aggregated data
    const enrichedProperties = await Promise.all(
      properties.map(async (property) => {
        // Fetch count of pending applications for this property
        const pendingApplicationsCount = await prisma.application.count({
          where: {
            propertyId: property.id,
            status: "PENDING",
          },
        });

        // Group units by their status for this property
        const unitStatusGroups = await prisma.unit.groupBy({
          by: ["status"],
          where: { propertyId: property.id },
          _count: { status: true },
        });

        // Fetch all units to get their targetPrice for price range calculation
        const units = await prisma.unit.findMany({
          where: { propertyId: property.id },
          select: { targetPrice: true },
        });

        // Map unit statuses to counts, with default 0
        const unitCounts = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 };
        unitStatusGroups.forEach(({ status, _count }) => {
          unitCounts[status] = _count.status;
        });

        // Calculate total units from counts
        const totalUnits = Object.values(unitCounts).reduce((acc, val) => acc + val, 0);

        // Calculate min and max targetPrice for price range
        const prices = units.map((u) => u.targetPrice).filter((v) => v != null);
        const priceRange = prices.length
          ? { min: Math.min(...prices), max: Math.max(...prices) }
          : null;

        return {
          id: property.id,
          title: property.title,
          description: property.description,
          type: property.type,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          street: property.street,
          barangay: property.barangay,
          municipality: property.municipality,
          city: property.city,
          province: property.province,
          zipCode: property.zipCode,
          requiresScreening: property.requiresScreening,
          isListed: property.isListed,
          mainImageUrl: property.mainImageUrl,
          amenities: property.amenityTags || [],            // intangible advantages nearby
          sharedFeatures: property.propertySharedFeatures || [], // tangible property features
          unitCount: totalUnits,
          unitCounts,
          pendingApplicationCount: pendingApplicationsCount,
          priceRange,
        };
      })
    );

    res.status(200).json({ properties: enrichedProperties });
  } catch (error) {
    console.error("[propertiesController] Error:", error);
    res.status(500).json({ error: "Failed to retrieve properties." });
  }
};

export default propertiesController;
