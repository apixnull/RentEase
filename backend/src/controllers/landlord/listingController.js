import prisma from "../../libs/prismaClient.js";
import axios from "axios";
// ----------------------------------------------
// GET LANDLORD LISTINGS (Property + Unit details)
// ----------------------------------------------
export const getLandlordListings = async (req, res) => {
  const landlordId = req.user.id;

  try {
    const listings = await prisma.listing.findMany({
      where: { landlordId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        lifecycleStatus: true,
        isFeatured: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,

        // --- Payment Info ---
        providerName: true,
        paymentAmount: true,
        paymentDate: true,

        // --- Admin Block Info ---
        blockedAt: true,

        // --- Relations ---
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    // --- Format output ---
    const formatted = listings.map((l) => ({
      id: l.id,
      lifecycleStatus: l.lifecycleStatus,
      isFeatured: l.isFeatured,
      expiresAt: l.expiresAt,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,

      payment: {
        providerName: l.providerName,
        amount: l.paymentAmount,
        date: l.paymentDate,
      },

      blockedAt: l.blockedAt,

      unit: {
        id: l.unit.id,
        label: l.unit.label,
      },

      property: {
        id: l.unit.property.id,
        title: l.unit.property.title,
        type: l.unit.property.type,
        address: {
          street: l.unit.property.street,
          barangay: l.unit.property.barangay,
          zipCode: l.unit.property.zipCode,
          city: l.unit.property.city?.name || null,
          municipality: l.unit.property.municipality?.name || null,
        },
      },
    }));

    return res.json({ listings: formatted });
  } catch (err) {
    console.error("❌ Error in getLandlordListings:", err);
    return res.status(500).json({ error: "Failed to fetch landlord listings" });
  }
};


// ---------------------------------------------- GET UNIT FOR LISTING REVIEW ----------------------------------------------
// GET /landlord/units/:unitId/review
export const getUnitForListingReview = async (req, res) => {
  const landlordId = req.user.id; 
  const { unitId } = req.params;

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        label: true,
        description: true,
        status: true,
        floorNumber: true,
        maxOccupancy: true,
        targetPrice: true,
        securityDeposit: true,
        requiresScreening: true,
        mainImageUrl: true,
        otherImages: true,
        unitLeaseRules: true, // <-- included
        createdAt: true,
        updatedAt: true,
        amenities: { select: { id: true, name: true, category: true } },
        property: {
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
            city: { select: { name: true } },
            municipality: { select: { name: true } },
            ownerId: true, // used only server-side for authorization — will NOT be returned
          },
        },
      },
    });

    if (!unit) return res.status(404).json({ error: "Unit not found" });

    // authorize (ownerId fetched only for this check)
    if (unit.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "Not authorized for this unit" });
    }

    // remove ownerId before returning response
    const { property, ...unitWithoutProperty } = unit;
    const { ownerId, ...propertySafe } = property;

    return res.json({
      unit: unitWithoutProperty,
      property: propertySafe,
    });
  } catch (err) {
    console.error("❌ Error in getUnitForListingReview:", err);
    return res.status(500).json({ error: "Failed to fetch unit for review" });
  }
};

// ============================================================================
// CREATE LISTING + PAYMENT SESSION (with optional FEATURED boost)
// ============================================================================
export const createListingWithPayment = async (req, res) => {
  const landlordId = req.user.id;
  const { unitId } = req.params;
  const { isFeatured = false } = req.body;

  try {
    // 1️⃣ Verify unit exists & belongs to landlord
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        propertyId: true,
        property: { select: { ownerId: true } },
      },
    });

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }
    if (unit.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "Not authorized for this unit" });
    }

    // 2️⃣ Pricing logic
    const BASE_PRICE = 100.0;
    const FEATURED_ADDON = 50.0;
    const totalPrice = BASE_PRICE + (isFeatured ? FEATURED_ADDON : 0.0);

    // 3️⃣ Create Listing in WAITING_PAYMENT
    const listing = await prisma.listing.create({
      data: {
        propertyId: unit.propertyId,
        unitId: unit.id,
        landlordId,
        lifecycleStatus: "WAITING_PAYMENT",
        isFeatured,
        paymentAmount: totalPrice,
      },
    });

    // 4️⃣ Prepare PayMongo checkout session
    const lineItems = [
      {
        name: `Listing Fee for Unit ${unit.id}`,
        currency: "PHP",
        amount: BASE_PRICE * 100, // centavos
        description: "Standard rental listing fee",
        quantity: 1,
      },
    ];

    if (isFeatured) {
      lineItems.push({
        name: "Featured Listing Boost",
        currency: "PHP",
        amount: FEATURED_ADDON * 100,
        description: "Feature this listing for better visibility",
        quantity: 1,
      });
    }

    const checkoutPayload = {
      data: {
        attributes: {
          line_items: lineItems,
          payment_method_types: ["gcash", "paymaya"],
          description: `Listing fee for property ${unit.propertyId}${
            isFeatured ? " (Featured)" : ""
          }`,
          show_line_items: true,
          show_description: true,
          cancel_url: `${process.env.FRONTEND_URL}/landlord/listing/${unitId}/review`,
            success_url: `${process.env.FRONTEND_URL}/landlord/listing/${listing.id}/success`,
          metadata: {
            listingId: listing.id,
            unitId: unit.id,
          },
        },
      },
    };

    const response = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      checkoutPayload,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkoutUrl = response.data.data.attributes.checkout_url;

    // 5️⃣ Respond with checkout URL
    return res.status(201).json({
      message: `Listing created${
        isFeatured ? " (Featured)" : ""
      }. Proceed to payment.`,
      listingId: listing.id,
      checkoutUrl,
    });
  } catch (err) {
    console.error(
      "❌ Error in createListingWithPayment:",
      err?.response?.data || err
    );
    return res
      .status(500)
      .json({ error: "Failed to create listing with payment" });
  }
};

// ---------------------------------------------------------
// GET SPECIFIC LISTING FOR LANDLORD (with Property & Unit info)
// ---------------------------------------------------------

export const getLandlordSpecificListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        landlordId: req.user.id, // only landlord’s own listing
      },
      select: {
        id: true,
        lifecycleStatus: true,
        expiresAt: true,
        isFeatured: true,

        // --- AI Analysis Snapshot ---
        riskLevel: true,
        riskReason: true,
        aiAnalysis: true,
        aiRecommendations: true,

        // --- Payment Info ---
        providerName: true,
        providerTxnId: true,
        paymentAmount: true,
        paymentDate: true,
        payerPhone: true,

        // --- Admin Review ---
        blockedAt: true,
        blockedReason: true,

        // --- Metadata ---
        createdAt: true,
        updatedAt: true,

        // --- Unit (with Property nested) ---
        unit: {
          select: {
            id: true,
            label: true,
            description: true,
            status: true,
            floorNumber: true,
            maxOccupancy: true,
            mainImageUrl: true,
            otherImages: true,
            unitLeaseRules: true,
            targetPrice: true,
            securityDeposit: true,
            requiresScreening: true,
            viewCount: true,
            createdAt: true,
            updatedAt: true,
            amenities: {
              select: { id: true, name: true, category: true },
            },
            property: {
              select: {
                id: true,
                title: true,
                type: true,
                street: true,
                barangay: true,
                zipCode: true,
                mainImageUrl: true,
                nearInstitutions: true,
                city: { select: { id: true, name: true } },
                municipality: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return res
        .status(404)
        .json({ message: "Listing not found or not owned by you." });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error("❌ Error in getLandlordSpecificListing:", error);
    return res.status(500).json({ error: "Failed to fetch landlord listing." });
  }
};

// ---------------------------------------------------------
// GET ELIGIBLE UNITS FOR LISTING (exclude already listed)
// ---------------------------------------------------------
export const getEligibleUnitsForListing = async (req, res) => {
  const landlordId = req.user.id;

  try {
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
        type: true,
        street: true,
        barangay: true,
        zipCode: true,
        city: { select: { name: true } },
        municipality: { select: { name: true } },
        Unit: {
          select: {
            id: true,
            label: true,
            createdAt: true,
            updatedAt: true,
            listings: {
              orderBy: { createdAt: "desc" }, // latest listing first
              take: 1,
              select: {
                id: true,
                lifecycleStatus: true,
                blockedAt: true,
              },
            },
          },
        },
      },
    });

    const formatted = properties.map((property) => {
      const eligibleUnits = property.Unit.filter((unit) => {
        const latest = unit.listings[0];

        if (!latest) return true; // ✅ Never listed
        if (latest.lifecycleStatus === "BLOCKED") return true; // ✅ Blocked → can re-list
        if (latest.lifecycleStatus === "EXPIRED") return true; // ✅ Expired → can re-list

        // ❌ Not eligible if still active/waiting
        return !["WAITING_PAYMENT", "VISIBLE", "HIDDEN"].includes(
          latest.lifecycleStatus
        );
      });

      return {
        id: property.id,
        title: property.title,
        type: property.type,
        address: {
          street: property.street,
          barangay: property.barangay,
          zipCode: property.zipCode,
          city: property.city?.name || null,
          municipality: property.municipality?.name || null,
        },
        units: eligibleUnits.map((u) => ({
          id: u.id,
          label: u.label,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      };
    });

    return res.json({ properties: formatted });
  } catch (err) {
    console.error("❌ Error in getEligibleUnitsForListing:", err);
    return res.status(500).json({ error: "Failed to fetch eligible units" });
  }
};
