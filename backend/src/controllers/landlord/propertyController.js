// file: propertyController.js
import prisma from "../../libs/prismaClient.js";
import supabase from "../../libs/supabaseClient.js";

const SUPABASE_BUCKET = "rentease-images";
const SUPABASE_PUBLIC_BASE_URL = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/`
  : null;

const parseCoordinateValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const deleteSupabaseImageIfExists = async (publicUrl) => {
  if (!publicUrl) return;

  // Extract path from Supabase public URL
  // Format: https://[project].supabase.co/storage/v1/object/public/rentease-images/path/to/file
  let relativePath = null;
  
  try {
    const urlObj = new URL(publicUrl);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/rentease-images\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      relativePath = decodeURIComponent(pathMatch[1]);
    } else if (SUPABASE_PUBLIC_BASE_URL && publicUrl.startsWith(SUPABASE_PUBLIC_BASE_URL)) {
      // Fallback to old method if URL format matches
      relativePath = publicUrl.replace(SUPABASE_PUBLIC_BASE_URL, "");
    }
  } catch (err) {
    console.warn("⚠️ Invalid URL format for image deletion:", err.message);
    return;
  }

  if (!relativePath) return;

  try {
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove([relativePath]);
    if (error) {
      console.warn("⚠️ Failed to delete old property image:", error.message);
    } else {
      console.log(`✅ Successfully deleted old property image: ${relativePath}`);
    }
  } catch (err) {
    console.warn("⚠️ Failed to delete old property image:", err.message);
  }
};

const sanitizeInstitutionsInput = (institutions) => {
  if (!Array.isArray(institutions)) {
    throw new Error("nearInstitutions must be an array.");
  }

  if (institutions.length > 10) {
    throw new Error("Maximum of 10 nearby institutions allowed.");
  }

  const sanitized = institutions
    .map((inst) => {
      const name =
        (typeof inst === "string" ? inst : inst?.name || "").trim();
      const type =
        (typeof inst === "string" ? "" : inst?.type || "").trim();
      return { name, type };
    })
    .filter((inst) => inst.name || inst.type);

  sanitized.forEach((inst) => {
    if (inst.name && inst.name.split(/\s+/).length > 3) {
      throw new Error(`Institution "${inst.name}" exceeds 3-word limit.`);
    }
  });

  return sanitized;
};

const sanitizeOtherInformationInput = (otherInformation) => {
  if (!Array.isArray(otherInformation)) {
    throw new Error("otherInformation must be an array.");
  }

  return otherInformation
    .map((info) => ({
      context: (info?.context || "").trim(),
      description: (info?.description || "").trim(),
    }))
    .filter((info) => info.context || info.description);
};

// ---------------------------------------------- GET ALL AMENITIES ----------------------------------------------
export const getAmenities = async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany({
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    });

    return res.json(amenities);
  } catch (error) {
    console.error("Error fetching amenities:", error);
    return res.status(500).json({ message: "Failed to fetch amenities" });
  }
};

// ---------------------------------------------- GET ALL CITIES & MUNICIPALITIES ----------------------------------------------
export const getCitiesAndMunicipalities = async (req, res) => {
  try {
    const cities = await prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const municipalities = await prisma.municipality.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return res.json({
      cities,
      municipalities,
    });
  } catch (error) {
    console.error("Error fetching cities/municipalities:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch cities/municipalities" });
  }
};

// ---------------------------------------------- CREATE PROPERTY ----------------------------------------------
/**
 * @desc Create a new property
 * @route POST /api/landlord/property/create
 * @access Private (LANDLORD)
 */
export const createProperty = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    const {
      title,
      type,
      street,
      barangay,
      zipCode,
      cityId,
      municipalityId,
      latitude,
      longitude,
      mainImageUrl,
      nearInstitutions,
      otherInformation,
    } = req.body;

    // --- Required fields ---
    if (!title || !type || !street || !barangay) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // --- Validate city vs municipality ---
    if ((!cityId && !municipalityId) || (cityId && municipalityId)) {
      return res.status(400).json({
        error: "Provide either a City OR a Municipality, not both.",
      });
    }

    // --- Validate institutions JSON ---
    let parsedInstitutions = null;
    if (nearInstitutions) {
      if (!Array.isArray(nearInstitutions)) {
        return res
          .status(400)
          .json({ error: "nearInstitutions must be an array." });
      }

      if (nearInstitutions.length > 10) {
        return res
          .status(400)
          .json({ error: "Maximum of 10 nearby institutions allowed." });
      }

      for (const inst of nearInstitutions) {
        const name = typeof inst === "string" ? inst : inst?.name || "";
        const wordCount = name.trim().split(/\s+/).length;
        if (wordCount > 3) {
          return res.status(400).json({
            error: `Institution "${name}" exceeds 3-word limit.`,
          });
        }
      }
      parsedInstitutions = nearInstitutions;
    }

    // --- Validate otherInformation JSON ---
    let parsedOtherInfo = null;
    if (otherInformation) {
      if (!Array.isArray(otherInformation)) {
        return res
          .status(400)
          .json({ error: "otherInformation must be an array." });
      }

      parsedOtherInfo = otherInformation.map((info) => ({
        context: info.context || "",
        description: info.description || "",
      }));
    }

    // --- Create property ---
    const property = await prisma.property.create({
      data: {
        ownerId,
        title,
        type,
        street,
        barangay,
        zipCode: zipCode || null,
        cityId: cityId || null,
        municipalityId: municipalityId || null,
        latitude: latitude || null,
        longitude: longitude || null,
        mainImageUrl: mainImageUrl || null,
        nearInstitutions: parsedInstitutions || null,
        otherInformation: parsedOtherInfo || null,
      },
      select: {
        id: true,
        title: true,
      },
    });

    return res.status(201).json({
      message: `Property "${property.title}" created successfully.`,
      id: property.id,
    });
  } catch (error) {
    console.error("❌ Error creating property:", error);

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A property with the same title and address already exists.",
      });
    }

    return res.status(500).json({
      error: "Failed to create property.",
      details: error.message,
    });
  }
};

// ------------------------------------------------------------------------------
// GET ALL PROPERTY INCLUDING UNITS SUMMARY
// ------------------------------------------------------------------------------

export const getLandlordProperties = async (req, res) => {
  try {
    const ownerId = req.user?.id;

    // 1️⃣ Fetch all properties of the landlord
    const properties = await prisma.property.findMany({
      where: { ownerId },
      include: {
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        Unit: {
          select: {
            unitCondition: true,
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2️⃣ Count active listings per property
    const propertyIds = properties.map((p) => p.id);
    const listedCounts = await prisma.listing.groupBy({
      by: ['propertyId'],
      where: {
        propertyId: { in: propertyIds },
        lifecycleStatus: { in: ['VISIBLE', 'FLAGGED', 'HIDDEN'] }, // active listings
      },
      _count: { id: true },
    });

    // Map propertyId → listed count
    const listedMap = {};
    listedCounts.forEach((lc) => {
      listedMap[lc.propertyId] = lc._count.id;
    });

    // 3️⃣ Check if each unit has an active lease
    const allUnitIds = properties.flatMap((p) => p.Unit.map((u) => u.id));
    const activeLeases = await prisma.lease.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: allUnitIds },
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const activeLeaseMap = {};
    activeLeases.forEach((lease) => {
      activeLeaseMap[lease.unitId] = true; // ✅ true if unit has an active lease
    });

    // 4️⃣ Format the response
    const formattedProperties = properties.map((prop) => {
      const units = prop.Unit || [];

      const totalUnits = units.length;
      const occupiedUnits = units.filter(u => activeLeaseMap[u.id]).length; // ✅ count units with active leases
      const maintenanceUnits = units.filter(u =>
        ["NEED_MAINTENANCE", "UNDER_MAINTENANCE"].includes(u.unitCondition)
      ).length;
      const availableUnits = units.filter(u => u.unitCondition === "GOOD" && !activeLeaseMap[u.id]).length; // ✅ check active lease instead of occupiedAt
      const listedUnits = listedMap[prop.id] || 0; // active listings count

      return {
        id: prop.id,
        title: prop.title,
        type: prop.type,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        address: {
          street: prop.street,
          barangay: prop.barangay,
          zipCode: prop.zipCode,
          city: prop.city,
          municipality: prop.municipality,
        },
        mainImageUrl: prop.mainImageUrl,
        unitsSummary: {
          total: totalUnits,
          listed: listedUnits,       // units with active listings
          available: availableUnits,
          occupied: occupiedUnits,
          maintenance: maintenanceUnits,
        },
      };
    });

    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};
// ------------------------------------------------------------------------------
// GET SPECIFIC PROPERTY DETAILS INCLUDING UNITS, REVIEWS & AMENITIES
// ------------------------------------------------------------------------------

export const getPropertyDetailsAndUnits = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // 🔹 Fetch property with all related units, amenities, and reviews
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: {
        id: true,
        title: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        street: true,
        barangay: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        mainImageUrl: true,
        nearInstitutions: true,
        otherInformation: true,
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
        Unit: {
          select: {
            id: true,
            label: true,
            description: true,
            floorNumber: true,
            maxOccupancy: true,
            targetPrice: true,
            mainImageUrl: true,
            createdAt: true,
            updatedAt: true,
            requiresScreening: true,
            unitCondition: true,
            amenities: { select: { id: true, name: true, category: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 🔹 Check if each unit has at least one active listing
    const unitIds = property.Unit.map((u) => u.id);
    const listings = await prisma.listing.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
        lifecycleStatus: { in: ['VISIBLE', 'FLAGGED', 'HIDDEN'] },
      },
      _count: { id: true },
    });

    const listingMap = {};
    listings.forEach((l) => {
      listingMap[l.unitId] = true; // ✅ just return true if there is an active listing
    });

    // 🔹 Check if each unit has an active lease
    const activeLeases = await prisma.lease.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
        status: 'ACTIVE',
      },
      _count: { id: true },
    });

    const activeLeaseMap = {};
    activeLeases.forEach((lease) => {
      activeLeaseMap[lease.unitId] = true; // ✅ true if unit has an active lease
    });

    // 🔹 Count views from UnitView table for each unit
    const viewCounts = await prisma.unitView.groupBy({
      by: ['unitId'],
      where: {
        unitId: { in: unitIds },
      },
      _count: { id: true },
    });

    const viewCountMap = {};
    viewCounts.forEach((vc) => {
      viewCountMap[vc.unitId] = vc._count.id; // ✅ total view count from UnitView table
    });

    // --- Compute condition-based summaries ---
    const totalUnits = property.Unit.length;
    const goodUnits = property.Unit.filter((u) => u.unitCondition === "GOOD").length;
    const needMaintenanceUnits = property.Unit.filter((u) => u.unitCondition === "NEED_MAINTENANCE").length;
    const underMaintenanceUnits = property.Unit.filter((u) => u.unitCondition === "UNDER_MAINTENANCE").length;
    const unusableUnits = property.Unit.filter((u) => u.unitCondition === "UNUSABLE").length;
    const occupiedUnits = property.Unit.filter((u) => activeLeaseMap[u.id]).length; // ✅ count units with active leases
    const listedUnits = property.Unit.filter((u) => listingMap[u.id]).length; // ✅ total units with active listings

    // --- Format each unit ---
    const units = property.Unit.map((u) => {
      const totalReviews = u.reviews.length;
      const averageRating =
        totalReviews > 0
          ? u.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      return {
        id: u.id,
        label: u.label,
        description: u.description,
        floorNumber: u.floorNumber,
        maxOccupancy: u.maxOccupancy,
        targetPrice: u.targetPrice,
        mainImageUrl: u.mainImageUrl,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        occupiedAt: activeLeaseMap[u.id] ? new Date().toISOString() : null, // ✅ set based on active lease
        isListed: listingMap[u.id] || false, // ✅ true/false if listed
        viewCount: viewCountMap[u.id] || 0, // ✅ count from UnitView table
        unitCondition: u.unitCondition,
        requiresScreening: u.requiresScreening,
        amenities: u.amenities,
        reviewStats: {
          totalReviews,
          averageRating: Number(averageRating.toFixed(1)),
        },
      };
    });

    // --- Final property summary ---
    const propertyDetails = {
      id: property.id,
      title: property.title,
      type: property.type,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      address: {
        street: property.street,
        barangay: property.barangay,
        zipCode: property.zipCode,
        city: property.city,
        municipality: property.municipality,
      },
      location: {
        latitude: property.latitude,
        longitude: property.longitude,
      },
      media: {
        mainImageUrl: property.mainImageUrl,
        nearInstitutions: property.nearInstitutions,
        otherInformation: property.otherInformation,
      },
      unitsSummary: {
        listed: listedUnits, // ✅ total units with active listings
        total: totalUnits,
        occupied: occupiedUnits,
        good: goodUnits,
        needMaintenance: needMaintenanceUnits,
        underMaintenance: underMaintenanceUnits,
        unusable: unusableUnits,
      },
    };

    // ✅ Return property + unit details
    return res.json({
      property: propertyDetails,
      units,
    });
  } catch (error) {
    console.error("Error fetching property details:", error);
    return res.status(500).json({ message: "Failed to fetch property details" });
  }
};

// ------------------------------------------------------------------------------ 
// GET PROPERTY DATA FOR EDITING (BASIC DETAILS + LOCATION)
// ------------------------------------------------------------------------------

export const getPropertyEditableData = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: {
        id: true,
        title: true,
        type: true,
        street: true,
        barangay: true,
        zipCode: true,
        latitude: true,
        longitude: true,
        mainImageUrl: true,
        nearInstitutions: true,
        otherInformation: true,
        city: { select: { id: true, name: true } },
        municipality: { select: { id: true, name: true } },
      },
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.json({
      property: {
        id: property.id,
        title: property.title,
        type: property.type,
        address: {
          street: property.street,
          barangay: property.barangay,
          zipCode: property.zipCode,
          city: property.city,
          municipality: property.municipality,
        },
        location: {
          latitude: property.latitude,
          longitude: property.longitude,
        },
        media: {
          mainImageUrl: property.mainImageUrl,
          nearInstitutions: property.nearInstitutions || [],
          otherInformation: property.otherInformation || [],
        },
      },
    });
  } catch (error) {
    console.error("Error fetching property editable data:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch property editable data" });
  }
};

// ------------------------------------------------------------------------------ 
// UPDATE PROPERTY
// ------------------------------------------------------------------------------

export const updateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const existingProperty = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: {
        id: true,
        mainImageUrl: true,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    const {
      title,
      type,
      street,
      barangay,
      zipCode,
      cityId,
      municipalityId,
      latitude,
      longitude,
      mainImageUrl,
      nearInstitutions,
      otherInformation,
    } = req.body;

    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedType = typeof type === "string" ? type.trim() : "";
    const trimmedStreet = typeof street === "string" ? street.trim() : "";
    const trimmedBarangay = typeof barangay === "string" ? barangay.trim() : "";
    const trimmedZip = typeof zipCode === "string" ? zipCode.trim() : null;
    const normalizedCityId =
      typeof cityId === "string" ? cityId.trim() || null : cityId ?? null;
    const normalizedMunicipalityId =
      typeof municipalityId === "string"
        ? municipalityId.trim() || null
        : municipalityId ?? null;

    if (!trimmedTitle || !trimmedType || !trimmedStreet || !trimmedBarangay) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (
      (normalizedCityId && normalizedMunicipalityId) ||
      (!normalizedCityId && !normalizedMunicipalityId)
    ) {
      return res.status(400).json({
        message: "Provide either a City OR a Municipality, not both.",
      });
    }

    let parsedInstitutions;
    if (nearInstitutions !== undefined) {
      try {
        const sanitized = sanitizeInstitutionsInput(nearInstitutions);
        parsedInstitutions = sanitized.length > 0 ? sanitized : null;
      } catch (validationError) {
        return res
          .status(400)
          .json({ message: validationError.message || "Invalid institutions." });
      }
    }

    let parsedOtherInfo;
    if (otherInformation !== undefined) {
      try {
        const sanitized = sanitizeOtherInformationInput(otherInformation);
        parsedOtherInfo = sanitized.length > 0 ? sanitized : null;
      } catch (validationError) {
        return res
          .status(400)
          .json({ message: validationError.message || "Invalid information." });
      }
    }

    const trimmedMainImageInput =
      typeof mainImageUrl === "string" ? mainImageUrl.trim() : "";
    const resolvedMainImageUrl =
      trimmedMainImageInput || existingProperty.mainImageUrl;

    if (!resolvedMainImageUrl) {
      return res
        .status(400)
        .json({ message: "Main image is required for the property." });
    }

    if (
      existingProperty.mainImageUrl &&
      resolvedMainImageUrl !== existingProperty.mainImageUrl
    ) {
      await deleteSupabaseImageIfExists(existingProperty.mainImageUrl);
    }

    const updatePayload = {
      title: trimmedTitle,
      type: trimmedType,
      street: trimmedStreet,
      barangay: trimmedBarangay,
      zipCode: trimmedZip || null,
      cityId: normalizedCityId || null,
      municipalityId: normalizedMunicipalityId || null,
      latitude: parseCoordinateValue(latitude),
      longitude: parseCoordinateValue(longitude),
      mainImageUrl: resolvedMainImageUrl,
    };

    if (parsedInstitutions !== undefined) {
      updatePayload.nearInstitutions = parsedInstitutions;
    }

    if (parsedOtherInfo !== undefined) {
      updatePayload.otherInformation = parsedOtherInfo;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: updatePayload,
      select: {
        id: true,
        title: true,
      },
    });

    return res.json({
      message: `Property "${updatedProperty.title}" updated successfully.`,
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({
      message: "Failed to update property.",
      details: error.message,
    });
  }
};

// ------------------------------------------------------------------------------ 
// DELETE PROPERTY

export const deleteProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const ownerId = req.user?.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify property exists and belongs to the landlord
    const existingProperty = await prisma.property.findFirst({
      where: { id: propertyId, ownerId },
      select: {
        id: true,
        mainImageUrl: true,
        title: true,
      },
    });

    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Fetch all units for this property to delete their images
    const units = await prisma.unit.findMany({
      where: { propertyId },
      select: {
        id: true,
        mainImageUrl: true,
        otherImages: true,
      },
    });

    // Delete property image from Supabase if it exists
    if (existingProperty.mainImageUrl) {
      await deleteSupabaseImageIfExists(existingProperty.mainImageUrl);
    }

    // Delete all unit images from Supabase
    for (const unit of units) {
      // Delete unit main image
      if (unit.mainImageUrl) {
        await deleteSupabaseImageIfExists(unit.mainImageUrl);
      }

      // Delete unit other images (stored as JSON array)
      if (unit.otherImages) {
        try {
          const otherImagesArray = Array.isArray(unit.otherImages) 
            ? unit.otherImages 
            : JSON.parse(unit.otherImages);
          
          if (Array.isArray(otherImagesArray)) {
            for (const imageUrl of otherImagesArray) {
              if (imageUrl && typeof imageUrl === 'string') {
                await deleteSupabaseImageIfExists(imageUrl);
              }
            }
          }
        } catch (parseError) {
          console.warn(`⚠️ Failed to parse otherImages for unit ${unit.id}:`, parseError.message);
          // Continue even if parsing fails
        }
      }
    }

    // Delete property (cascade will handle related data: units, listings, leases, etc.)
    await prisma.property.delete({
      where: { id: propertyId },
    });

    return res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).json({
      message: "Failed to delete property.",
      details: error.message,
    });
  }
};