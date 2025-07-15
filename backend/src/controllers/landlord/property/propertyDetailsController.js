import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: Get detailed info for a specific property.
 * Route: GET /landlord/property/:id
 */
const propertyDetailsController = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const propertyId = req.params.id;

    if (!propertyId) {
      return res.status(400).json({ error: "Missing property ID." });
    }

    // Fetch property with nested units and related entities
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: landlordId,
      },
      include: {
        PropertyPhoto: true,
        tags: { include: { tag: true } },
        Unit: {
          include: {
            UnitPhoto: true,
            Application: true,
            MaintenanceRequest: true,
          },
        },
        Income: true,
        Expense: true,
        MaintenanceRequest: true,
        Listing: {
          include: {
            payments: true,
          },
        },
        Application: {
          include: {
            tenant: {
              include: {
                UserProfile: true,
                ContactInfo: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Compute unit status + price ranges
    const unitStatusCount = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      MAINTENANCE: 0,
    };

    const perUnitPrices = [];
    const perHeadPrices = [];

    property.Unit.forEach((unit) => {
      if (unit.status in unitStatusCount) {
        unitStatusCount[unit.status]++;
      }

      if (unit.chargePerHead && unit.pricePerHead != null) {
        perHeadPrices.push(unit.pricePerHead);
      } else if (!unit.chargePerHead && unit.pricePerUnit != null) {
        perUnitPrices.push(unit.pricePerUnit);
      }
    });

    const getPriceRange = (arr) => {
      if (arr.length === 0) return null;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return min === max ? min : [min, max];
    };

    // Aggregate counts
    const [
      unitAppCount,
      unitMaintCount,
      propertyAppCount,
      propertyMaintCount,
    ] = await Promise.all([
      prisma.application.aggregate({
        _count: true,
        where: {
          unit: {
            propertyId,
          },
        },
      }),
      prisma.maintenanceRequest.aggregate({
        _count: true,
        where: {
          unit: {
            propertyId,
          },
        },
      }),
      prisma.application.aggregate({
        _count: true,
        where: {
          propertyId,
        },
      }),
      prisma.maintenanceRequest.aggregate({
        _count: true,
        where: {
          propertyId,
        },
      }),
    ]);

    const formatted = {
      ...property,
      unitCount: property.Unit.length,
      unitStatusCount,
      priceRangePerUnit: getPriceRange(perUnitPrices),
      priceRangePerHead: getPriceRange(perHeadPrices),
      stats: {
        totalApplicants: unitAppCount._count + propertyAppCount._count,
        totalMaintenanceRequests:
          unitMaintCount._count + propertyMaintCount._count,
      },
    };

    res.status(200).json({ property: formatted });
  } catch (error) {
    console.error("[propertyDetailsController] Error:", error);
    res.status(500).json({ error: "Failed to fetch property details." });
  }
};

export default propertyDetailsController;
