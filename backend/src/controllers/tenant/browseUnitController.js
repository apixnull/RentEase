// ============================================================================
// CONTROLLER: Tenant Browse Units
// File: controllers/tenant/browseUnitController.js
// Description: Handles fetching visible listings for tenant browsing.
// ============================================================================

import prisma from "../../libs/prismaClient.js";

export const getVisibleListingsForTenant = async (req, res) => {
  try {
    // Step 1: fetch all listings that are visible and not expired
    const listings = await prisma.listing.findMany({
      where: {
        lifecycleStatus: "VISIBLE",
        expiresAt: { gte: new Date() }, // exclude expired
      },
      include: {
        unit: {
          select: {
            id: true,
            label: true,
            mainImageUrl: true,
            viewCount: true,
            targetPrice: true,
            requiresScreening: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },
            reviews: { select: { rating: true } }, // for avgRating
          },
        },
      },
      orderBy: { createdAt: "desc" }, // newest first
    });

    // Step 2: calculate average rating for each unit
    const listingsWithRating = listings.map((listing) => {
      const reviews = listing.unit.reviews;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null;
      return { ...listing, unit: { ...listing.unit, avgRating } };
    });

    // Step 3: categorize listings
    const featured = listingsWithRating.filter((l) => l.isFeatured);
    const mostViewed = [...listingsWithRating].sort(
      (a, b) => b.unit.viewCount - a.unit.viewCount
    );
    const mostRated = [...listingsWithRating]
      .filter((l) => l.unit.avgRating !== null)
      .sort((a, b) => b.unit.avgRating - a.unit.avgRating);
    const newlyListed = [...listingsWithRating].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Step 4: clean listing for frontend (remove propertyId & landlordId)
    const cleanListingForFrontend = (listing) => ({
      id: listing.id,
      isFeatured: listing.isFeatured,
      unit: {
        id: listing.unit.id,
        label: listing.unit.label,
        mainImageUrl: listing.unit.mainImageUrl,
        viewCount: listing.unit.viewCount,
        targetPrice: listing.unit.targetPrice,
        requiresScreening: listing.unit.requiresScreening,
        property: listing.unit.property,
        avgRating: listing.unit.avgRating,
      },
    });

    // Step 5: return categorized listings
    return res.status(200).json({
      data: {
        featured: featured.map(cleanListingForFrontend),
        mostViewed: mostViewed.map(cleanListingForFrontend),
        mostRated: mostRated.map(cleanListingForFrontend),
        newlyListed: newlyListed.map(cleanListingForFrontend),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listings for tenant",
    });
  }
};


// ------------------------------------------------------------
// GET SPECIFIC LISTING (Tenant → Full Unit Details)
// ------------------------------------------------------------
export const getSpecificListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    // Step 1: Find the listing (must be visible and not expired)
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        lifecycleStatus: "VISIBLE",
        expiresAt: { gte: new Date() },
      },
      include: {
        unit: {
          include: {
            amenities: true, // all amenities attached to the unit
            property: {
              include: {
                city: true,
                municipality: true,
              },
            },
            reviews: {
              include: {
                tenant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            phoneNumber: true,
            messengerUrl: true,
            facebookUrl: true,
            whatsappUrl: true,
          },
        },
      },
    });

    // Step 2: Handle not found
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found or unavailable.",
      });
    }

    // Step 3: Compute average rating
    const reviews = listing.unit.reviews || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : null;

    // Step 4: Increment view count (analytics)
    await prisma.unit.update({
      where: { id: listing.unit.id },
      data: { viewCount: { increment: 1 } },
    });

    // Step 5: Prepare clean response for frontend
    const responseData = {
      unit: {
        id: listing.unit.id,
        label: listing.unit.label,
        description: listing.unit.description,
        floorNumber: listing.unit.floorNumber,
        mainImageUrl: listing.unit.mainImageUrl,
        otherImages: listing.unit.otherImages,
        unitLeaseRules: listing.unit.unitLeaseRules,
        targetPrice: listing.unit.targetPrice,
        securityDeposit: listing.unit.securityDeposit,
        requiresScreening: listing.unit.requiresScreening,
        viewCount: listing.unit.viewCount + 1,
        avgRating,
        amenities: listing.unit.amenities,
        reviews: listing.unit.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          tenant: r.tenant,
        })),
        property: {
          id: listing.unit.property.id,
          title: listing.unit.property.title,
          type: listing.unit.property.type,
          street: listing.unit.property.street,
          barangay: listing.unit.property.barangay,
          zipCode: listing.unit.property.zipCode,
          city: listing.unit.property.city,
          municipality: listing.unit.property.municipality,
          latitude: listing.unit.property.latitude,
          longitude: listing.unit.property.longitude,
          mainImageUrl: listing.unit.property.mainImageUrl,
          nearInstitutions: listing.unit.property.nearInstitutions,
        },
      },

      landlord: {
        id: listing.landlord.id,
        fullName: `${listing.landlord.firstName || ""} ${listing.landlord.lastName || ""}`.trim(),
        avatarUrl: listing.landlord.avatarUrl,
        contact: {
          phoneNumber: listing.landlord.phoneNumber,
          messengerUrl: listing.landlord.messengerUrl,
          facebookUrl: listing.landlord.facebookUrl,
          whatsappUrl: listing.landlord.whatsappUrl,
        },
      },

      // message button metadata (frontend can decide how to render it)
      messageButton: {
        available: !!(
          listing.landlord.messengerUrl ||
          listing.landlord.facebookUrl ||
          listing.landlord.whatsappUrl
        ),
        text: "Message Landlord",
      },
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching tenant specific listing:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing details.",
    });
  }
};
