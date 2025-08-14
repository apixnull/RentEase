// controllers/unitController.js

import prisma from "../../../libs/prismaClient.js";

export const getListedUnitController = async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: {
        isListed: true,
        status: "AVAILABLE" // Only include available units
      },
      select: {
        id: true,
        status: true,
        targetPrice: true,
        isNegotiable: true,
        unitImageUrls: true, // We'll slice the first one in map
        property: {
          select: {
            title: true,
            street: true,
            barangay: true,
            municipality: true,
            city: true,
            province: true,
            zipCode: true,
            amenityTags: true
          }
        }
      }
    });

    const formatted = units.map(unit => ({
      id: unit.id,
      status: unit.status,
      targetPrice: unit.targetPrice,
      isNegotiable: unit.isNegotiable,
      imageUrl: unit.unitImageUrls?.[0] || null,
      property: {
        title: unit.property.title,
        address: {
          street: unit.property.street,
          barangay: unit.property.barangay,
          municipality: unit.property.municipality,
          city: unit.property.city,
          province: unit.property.province,
          zipCode: unit.property.zipCode
        },
        amenityTags: unit.property.amenityTags
      }
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error retrieving listed units:", error);
    res.status(500).json({ message: "Failed to retrieve listed units." });
  }
};
