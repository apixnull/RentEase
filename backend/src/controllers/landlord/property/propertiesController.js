import prisma from "../../../libs/prismaClient.js";

/**
 * Simplified Controller: Get landlord properties (basic info only).
 * Route: GET /landlord/properties
 */
const propertiesController = async (req, res) => {
  try {
    const landlordId = req.user.id;

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
      },
    });

    res.status(200).json({ properties });
  } catch (error) {
    console.error("[propertiesController] Error:", error);
    res.status(500).json({ error: "Failed to retrieve properties." });
  }
};

export default propertiesController;
