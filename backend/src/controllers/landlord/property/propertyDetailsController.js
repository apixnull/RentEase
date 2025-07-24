// src/controllers/landlord/property/propertyDetailsController.js
import prisma from "../../../libs/prismaClient.js";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Controller: Get detailed info for a specific property.
 * Route: GET /landlord/property/:id
 */
const propertyDetailsController = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const propertyId = req.params.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Missing property ID." });
    }

    // Fetch property and its units
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        ownerId: landlordId,
      },
      include: {
        Unit: true,
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    // Group applications by status (for this property, current month only)
    const applicationGroups = await prisma.application.groupBy({
      by: ["status"],
      where: {
        propertyId,
        createdAt: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date()),
        },
      },
      _count: { status: true },
    });

    // Normalize application counts
    const applicationStatusCount = {
      PENDING: 0,
      REVIEWED: 0,
      APPROVED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    applicationGroups.forEach(({ status, _count }) => {
      if (applicationStatusCount.hasOwnProperty(status)) {
        applicationStatusCount[status] = _count.status;
      }
    });

    // Count unit statuses and gather price points
    const unitStatusCount = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      MAINTENANCE: 0,
    };

    const pricePoints = [];

    property.Unit.forEach((unit) => {
      const { status, targetPrice } = unit;
      if (status in unitStatusCount) {
        unitStatusCount[status]++;
      }
      if (typeof targetPrice === "number") {
        pricePoints.push(targetPrice);
      }
    });

    const getPriceRange = (arr) => {
      if (arr.length === 0) return null;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      return min === max ? min : [min, max];
    };

    // Final structured response
    return res.status(200).json({
      property: {
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

        propertySharedFeatures: property.propertySharedFeatures ?? [],
        amenityTags: property.amenityTags ?? [],
        propertyRules: property.propertyRules ?? [],
        propertyImageUrls: property.propertyImageUrls ?? [],
        mainImageUrl: property.mainImageUrl ?? null,

        requiresScreening: property.requiresScreening,
        isListed: property.isListed,

        unitCount: property.Unit.length,
        unitStatusCount,
        priceRange: getPriceRange(pricePoints),
        applicationStatusCount,

        units: property.Unit,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch property details." });
  }
};

export default propertyDetailsController;
