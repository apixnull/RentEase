// controllers/property/addPropertiesController.js
import prisma from "../../../libs/prismaClient.js";
import { v4 as uuidv4 } from 'uuid';

const addPropertiesController = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      type,
      street,
      barangay,
      municipality,
      city,
      province,
      zipCode,
      requiresScreening,
      amenities,  // JSON string expected, array of strings (amenityTags)
      features,   // JSON string expected, array of strings (propertySharedFeatures)
      unit,       // JSON string expected, representing a single unit
      photos,     // Array of URLs
      mainImageUrl,
      rules // <-- add this
    } = req.body;

    // Basic validation
    if (!title || !type || !province || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required property fields: title, type, province, or zipCode",
      });
    }

    // Parse JSON fields safely
    let parsedAmenities = [];
    let parsedFeatures = [];
    let parsedUnit = null;
    let parsedRules = [];

    try {
      parsedAmenities = amenities ? JSON.parse(amenities) : [];
      parsedFeatures = features ? JSON.parse(features) : [];
      parsedUnit = unit ? JSON.parse(unit) : null;
      parsedRules = rules ? JSON.parse(rules) : [];
    } catch (error) {
      console.error("JSON parsing error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in amenities, features, or unit",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    if (!parsedUnit) {
      return res.status(400).json({
        success: false,
        message: "Unit data is required",
      });
    }

    // Validate photos array
    const photoArray = Array.isArray(photos) ? photos : [];

    // Prepare unit arrays for features and images
    const unitFeaturesArray = Array.isArray(parsedUnit.unitFeatureTags) ? parsedUnit.unitFeatureTags : [];
    const unitPhotosArray = Array.isArray(parsedUnit.unitImageUrls || parsedUnit.photos) ? (parsedUnit.unitImageUrls || parsedUnit.photos) : [];

    // Create IDs
    const propertyId = uuidv4();
    const unitId = uuidv4();

    // Compose property images (main + additional)
    const allPropertyImages = mainImageUrl ? [mainImageUrl, ...photoArray] : photoArray;

    const result = await prisma.$transaction(async (tx) => {
      // Create property
      const property = await tx.property.create({
        data: {
          id: propertyId,
          title,
          description,
          type,
          street,
          barangay,
          municipality: municipality || null,
          city: city || null,
          province,
          zipCode,
          requiresScreening: requiresScreening === "true" || requiresScreening === true,
          isListed: false,
          ownerId: userId,
          mainImageUrl: mainImageUrl || null,
          propertyImageUrls: allPropertyImages,
          amenityTags: parsedAmenities,
          propertySharedFeatures: parsedFeatures,
          propertyRules: parsedRules,
        },
      });

      // Create unit
      const unitCreated = await tx.unit.create({
        data: {
          id: unitId,
          propertyId: property.id,
          label: parsedUnit.label || "Unit 1",
          description: parsedUnit.description || "",
          status: "AVAILABLE", // default status
          floorNumber: parsedUnit.floorNumber !== undefined ? parseInt(parsedUnit.floorNumber) : null,
          maxOccupancy: parsedUnit.maxOccupancy ? Math.max(1, parseInt(parsedUnit.maxOccupancy)) : 1,
          unitFeatureTags: unitFeaturesArray,
          unitImageUrls: unitPhotosArray,
          targetPrice: parsedUnit.targetPrice ? parseFloat(parsedUnit.targetPrice) : 0,
          isNegotiable: !!parsedUnit.isNegotiable,
          leaseRules: Array.isArray(parsedUnit.leaseRules) ? parsedUnit.leaseRules : [],
        },
      });

      return property;
    });

    return res.status(201).json({
      success: true,
      message: "Property and unit created successfully",
      data: { propertyId: result.id, title: result.title },
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default addPropertiesController;
