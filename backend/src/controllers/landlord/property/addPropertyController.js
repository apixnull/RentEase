import prisma from "../../../libs/prismaClient.js";

/**
 * Controller: addPropertyController
 * ----------------------------------
 * Handles property creation (without image URLs).
 * - Uses authenticated user as the owner
 * - Parses optional JSON fields
 */
export const addPropertyController = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      id, // UUID from frontend
      title,
      description,
      type,
      street,
      barangay,
      municipality,
      city,
      province,
      zipCode,
      amenityTags,
      propertyFeatures,
      leaseRules,
      requiresScreening,
    } = req.body;

    const newProperty = await prisma.property.create({
      data: {
        id,
        ownerId,
        title,
        description,
        type,
        street,
        barangay,
        municipality,
        city,
        province,
        zipCode,
        amenityTags: amenityTags ? JSON.parse(amenityTags) : undefined,
        propertyFeatures: propertyFeatures ? JSON.parse(propertyFeatures) : undefined,
        leaseRules: leaseRules ? JSON.parse(leaseRules) : undefined,
        requiresScreening: requiresScreening ?? false,
      },
      select: {
        id: true,
      },
    });

    return res.status(201).json({
      message: "Property created successfully",
      propertyId: newProperty.id,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({
      message: "Failed to create property: " + error.message,
    });
  }
};

/**
 * Controller: updatePropertyImagesController
 * ------------------------------------------
 * Updates the image URLs of a property.
 * - Accepts propertyImageUrls (max 5) and mainImageUrl
 * - Requires propertyId from frontend
 */
export const updatePropertyImagesController = async (req, res) => {
  try {
    const { propertyId, propertyImageUrls, mainImageUrl } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required." });
    }

    const imageUrls = propertyImageUrls ? JSON.parse(propertyImageUrls) : [];

    if (!Array.isArray(imageUrls) || imageUrls.length > 5) {
      return res.status(400).json({ message: "Image list must be an array of up to 5 URLs." });
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: {
        propertyImageUrls: imageUrls,
        mainImageUrl: mainImageUrl || imageUrls[0] || null,
      },
    });

    return res.status(200).json({
      message: "Property images updated successfully.",
      propertyId,
    });
  } catch (error) {
    console.error("Error updating property images:", error);
    return res.status(500).json({
      message: "Failed to update property images: " + error.message,
    });
  }
};
