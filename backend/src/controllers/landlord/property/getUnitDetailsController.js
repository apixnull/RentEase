// src/controllers/landlord/property/getUnitDetailsController.js
import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: Get full details of a unit based on unitId and propertyId.
 * Route: GET /landlord/property/:propertyId/unit/:unitId
 */
const getUnitDetailsController = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { propertyId, unitId } = req.params;

    if (!propertyId || !unitId) {
      return res.status(400).json({ message: "Missing propertyId or unitId." });
    }

    // Verify ownership of the property
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: landlordId,
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found or access denied." });
    }

    // Fetch the unit
    const unit = await prisma.unit.findUnique({
      where: {
        propertyId_id: {
          propertyId,
          id: unitId,
        },
      },
      include: {
        Lease: true,
        MaintenanceRequest: true,
        Application: true,
      },
    });

    if (!unit) {
      return res.status(404).json({ message: "Unit not found." });
    }

    // Structure response
    return res.status(200).json({
      unit: {
        id: unit.id,
        label: unit.label,
        description: unit.description,
        status: unit.status,
        floorNumber: unit.floorNumber,
        maxOccupancy: unit.maxOccupancy,
        targetPrice: unit.targetPrice,
        isNegotiable: unit.isNegotiable,

        unitFeatureTags: unit.unitFeatureTags ?? [],
        unitImageUrls: unit.unitImageUrls ?? [],
        leaseRules: unit.leaseRules ?? [],

        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,

        lease: unit.Lease,
        maintenanceRequests: unit.MaintenanceRequest,
        applications: unit.Application,
      },
    });
  } catch (error) {
    console.error("[getUnitDetailsController] Error:", error);
    return res.status(500).json({ message: "Failed to retrieve unit details." });
  }
};

export default getUnitDetailsController;