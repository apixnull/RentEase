// File: controllers/unitController.js
import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: getUnitController
 * -----------------------------
 * Fetches all units for a given propertyId, restricted by the authenticated user's ownership.
 */
export const getUnitController = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id; // From auth middleware

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Verify that the property belongs to the logged-in user
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (property.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied: Not the property owner" });
    }

    // Fetch all units for that property
    const units = await prisma.unit.findMany({
      where: { propertyId },
      select: {
        id: true,
        label: true,
        floorNumber: true,
        status: true,
        unitFeatureTags: true,
        unitImageUrls: true,
        unitLeaseRules: true,
        targetPrice: true,
        isListed: true,
      },
    });

    return res.status(200).json({ units });
  } catch (error) {
    console.error("Error in getUnitController:", error);
    return res.status(500).json({ message: "Failed to fetch units" });
  }
};
