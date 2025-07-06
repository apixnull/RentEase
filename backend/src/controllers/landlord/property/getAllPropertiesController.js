// File: controllers/landlord/property/getAllPropertiesController.js

import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: Get all properties owned by the authenticated landlord.
 * Route: GET /landlord/properties
 * Note: Includes count of units, but not full unit data
 */
const getAllPropertiesController = async (req, res) => {
  try {
    const landlordId = req.user.id;

    const properties = await prisma.property.findMany({
      where: {
        ownerId: landlordId,
      },
      include: {
        _count: {
          select: { Unit: true },
        },
        PropertyPhoto: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = properties.map((property) => ({
      ...property,
      unitCount: property._count.Unit,
    }));

    res.status(200).json({ properties: formatted });
  } catch (error) {
    console.error("[getAllPropertiesController] Error:", error);
    res.status(500).json({ error: "Failed to retrieve properties." });
  }
};

export default getAllPropertiesController;
