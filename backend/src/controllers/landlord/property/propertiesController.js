import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: getUserPropertiesNativeController
 * ---------------------------------------------
 * Retrieves all property data (excluding leaseRules & propertyFeatures) 
 * for the authenticated user, along with:
 * - total unit count
 * - count of AVAILABLE, OCCUPIED, and MAINTENANCE units
 */
const propertiesController = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const properties = await prisma.property.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ownerId: true,
        title: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        street: true,
        barangay: true, 
        municipality: true, // optional 
        city: true, // optional 
        province: true,
        zipCode: true,
        amenityTags: true, // json ex: "Near UC Main", "Near UC ACT"
        propertyFeatures: true, // json ex: "PisoNet", "Parking", "Pool"
        mainImageUrl: true, // image url
        requiresScreening: true,

        // Related units (status only for aggregation)
        Unit: {
          select: {
            status: true,
          },
        },
      },
    });

    const processedProperties = properties.map((property) => {
      const statusCounts = property.Unit.reduce(
        (acc, unit) => {
          acc.total += 1;
          acc[unit.status] += 1;
          return acc;
        },
        { total: 0, AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 }
      );

      // Destructure leaseRules and propertyFeatures out (excluded from select)
      const {
        Unit, // we already used this for counts
        ...rest
      } = property;

      return {
        ...rest,
        ...statusCounts,
      };
    });

    return res.status(200).json(processedProperties);
  } catch (error) {
    console.error("Error fetching native property data:", error);
    return res.status(500).json({
      message: "Failed to retrieve property data: " + error.message,
    });
  }
};

export default propertiesController;
