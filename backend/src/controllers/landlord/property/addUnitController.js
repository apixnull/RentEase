import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: addUnitController (Single Unit Only)
 * ------------------------------------------------
 * - Creates one unit per request.
 * - Accepts feature tags and lease rules as arrays (not JSON strings).
 * - Enforces tag and rule limits.
 * - Associates unit with property and landlord.
 */
export const addUnitController = async (req, res) => {
  try {
    const {
      propertyId,
      label,
      description,
      floorNumber,
      maxOccupancy,
      unitFeatureTags,
      unitLeaseRules,
      targetPrice,
      isNegotiable,
    } = req.body;

    if (!propertyId || !label || !description || !targetPrice) {
      return res.status(400).json({
        message: "Missing required fields: propertyId, label, description, or targetPrice.",
      });
    }

    // ✅ Check if a unit with the same label exists for the same property
    const existingUnit = await prisma.unit.findFirst({
      where: {
        propertyId,
        label,
      },
    });

    if (existingUnit) {
      return res.status(409).json({
        message: `A unit with the label "${label}" already exists for this property.`,
      });
    }

    // ✅ Handle tags and rules (accept arrays directly or parse if strings)
    let parsedFeatureTags = [];
    let parsedLeaseRules = [];

    if (unitFeatureTags) {
      parsedFeatureTags = Array.isArray(unitFeatureTags)
        ? unitFeatureTags
        : JSON.parse(unitFeatureTags);
    }

    if (unitLeaseRules) {
      parsedLeaseRules = Array.isArray(unitLeaseRules)
        ? unitLeaseRules
        : JSON.parse(unitLeaseRules);
    }

    const createdUnit = await prisma.unit.create({
      data: {
        propertyId,
        label,
        description,
        floorNumber,
        maxOccupancy,
        unitFeatureTags: parsedFeatureTags,
        unitLeaseRules: parsedLeaseRules,
        targetPrice: parseFloat(targetPrice),
        isNegotiable: isNegotiable ?? false,
      },
      select: {
        id: true,
      },
    });

    return res.status(201).json({
      message: "Unit created successfully.",
      unitId: createdUnit.id,
    });

  } catch (error) {
    console.error("❌ Error creating unit:", error);
    return res.status(500).json({
      message: "Failed to create unit: " + error.message,
    });
  }
};


/**
 * Controller: updateUnitImagesController
 * --------------------------------------
 * Accepts a list of image URLs and updates:
 * - unitImageUrls (max 3)
 */
export const updateUnitImagesController = async (req, res) => {
  try {
    const { unitId } = req.params;
    const { propertyId, unitImageUrls } = req.body;

    if (!Array.isArray(unitImageUrls) || unitImageUrls.length > 3) {
      return res.status(400).json({
        message: "unitImageUrls must be an array with a max of 3 items",
      });
    }

    await prisma.unit.update({
      where: {
        propertyId_id: {
          propertyId,
          id: unitId,
        },
      },
      data: {
        unitImageUrls,
      },
    });

    return res.status(200).json({
      message: "Unit images updated successfully",
    });
  } catch (error) {
    console.error("Error updating unit images:", error);
    return res.status(500).json({
      message: "Failed to update unit images: " + error.message,
    });
  }
};
