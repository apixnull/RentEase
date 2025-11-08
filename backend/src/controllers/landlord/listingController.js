import prisma from "../../libs/prismaClient.js";
import axios from "axios";

// -----------------------------------------------------------------------------
// GET LANDLORD LISTINGS (with Property + Unit details)
// -----------------------------------------------------------------------------
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
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,

        // --- Payment Info (nullable) ---
        providerName: true,
        paymentAmount: true,
        paymentDate: true,

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
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      expiresAt: l.expiresAt,
      reviewedAt: l.reviewedAt,

      // --- Payment section ---
      payment: {
        providerName: l.providerName || null,
        amount: l.paymentAmount || null,
        date: l.paymentDate || null,
      },

      // --- Unit and Property ---
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


// -----------------------------------------------------------------------------
// GET LANDLORD UNIT AND PROPERTY INFORMATION FOR REVIEW
// -----------------------------------------------------------------------------
export const getUnitForListingReview = async (req, res) => {
  const landlordId = req.user.id;
  const { unitId } = req.params;

  try {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        label: true,
        targetPrice: true,
        unitCondition: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            street: true,
            barangay: true,
            zipCode: true,
            ownerId: true, 
          },
        },
      },
    });

    if (!unit) return res.status(404).json({ error: "Unit not found" });

    // Authorization check
    if (unit.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "Not authorized for this unit" });
    }

    // Remove ownerId before returning
    const { property, ...unitData } = unit;
    const { ownerId, ...propertySafe } = property;

    return res.json({
      unit: unitData,
      property: propertySafe,
    });
  } catch (err) {
    console.error("❌ Error fetching unit for review:", err);
    return res.status(500).json({ error: "Failed to fetch unit for review" });
  }
};

// -----------------------------------------------------------------------------
// CREATE LISTING + PAYMENT SESSION (with optional FEATURED boost)
// -----------------------------------------------------------------------------
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
        label: true,
        propertyId: true,
        property: {
          select: { ownerId: true, title: true },
        },
      },
    });

    if (!unit) {
      return res.status(404).json({ error: "Unit not found." });
    }

    if (unit.property.ownerId !== landlordId) {
      return res.status(403).json({ error: "Not authorized for this unit." });
    }

    // 2️⃣ Pricing logic (base + optional featured boost)
    const BASE_PRICE = 100.0;
    const FEATURED_ADDON = 50.0;
    const totalPrice = BASE_PRICE + (isFeatured ? FEATURED_ADDON : 0.0);

    // 3️⃣ Create listing in WAITING_PAYMENT state
    // Lifecycle timestamp: none set yet, only payment setup
    const listing = await prisma.listing.create({
      data: {
        propertyId: unit.propertyId,
        unitId: unit.id,
        landlordId,
        lifecycleStatus: "WAITING_PAYMENT",
        isFeatured,
        paymentAmount: totalPrice,
        createdAt: new Date(),
      },
      select: { id: true, propertyId: true, paymentAmount: true },
    });

    // 4️⃣ Prepare PayMongo checkout session
    const lineItems = [
      {
        name: `Listing Fee`,
        currency: "PHP",
        amount: BASE_PRICE * 100, // centavos
        description: `Listing Fee for ${unit.label} ${unit.property.title} `,
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
          description: `Listing Fee for Unit: ${unit.label} - Property: ${
            unit.property.title
          } ${isFeatured ? " (Featured)" : ""}`,
          show_line_items: true,
          show_description: true,
          cancel_url: `${process.env.FRONTEND_URL}/landlord/listing/${unitId}/review?cancel=${unitId}`,
          success_url: `${process.env.FRONTEND_URL}/landlord/listing/${listing.id}/success`,
          metadata: {
            listingId: listing.id,
            unitId: unit.id,
            landlordId,
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

    // 5️⃣ Update listing with provider metadata (for traceability)
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        providerName: "PAYMONGO",
        providerTxnId: response.data.data.id,
      },
    });

    // 6️⃣ Respond with checkout URL and listing reference
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
    return res.status(500).json({
      error: "Failed to create listing with payment session.",
    });
  }
};

// ============================================================================
// CANCEL LISTING + PAYMENT SESSION
// ============================================================================
export const cancelListingPayment = async (req, res) => {
  const landlordId = req.user.id;
  const { listingId } = req.params;

  try {
    // 1️⃣ Fetch listing and ensure it belongs to the landlord
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        landlordId: true,
        lifecycleStatus: true,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    if (listing.landlordId !== landlordId) {
      return res
        .status(403)
        .json({ error: "Not authorized to cancel this listing." });
    }

    // 2️⃣ Only allow cancellation if payment is not completed
    if (listing.lifecycleStatus !== "WAITING_PAYMENT") {
      return res
        .status(400)
        .json({ error: "Listing cannot be canceled after payment." });
    }

    // 3️⃣ Delete the listing
    await prisma.listing.delete({ where: { id: listingId } });

    return res.status(200).json({
      message: "Listing canceled and removed successfully.",
      listingId,
    });
  } catch (err) {
    console.error("❌ Error in cancelListingPayment:", err);
    return res.status(500).json({
      error: "Failed to cancel listing.",
    });
  }
};
// -----------------------------------------------------------------------------
// GET SPECIFIC LISTING DETAILS (Refactored for new schema)
// -----------------------------------------------------------------------------
export const getLandlordSpecificListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        landlordId: req.user.id,
      },
      select: {
        // ---------------------------------------------------------------------
        // LISTING CORE
        // ---------------------------------------------------------------------
        id: true,
        lifecycleStatus: true,
        visibleAt: true,
        hiddenAt: true,
        expiresAt: true,
        blockedAt: true,
        reviewedAt: true,
        flaggedAt: true,

        // --- Boosting ---
        isFeatured: true,

        // ---------------------------------------------------------------------
        // AI MODERATION
        // ---------------------------------------------------------------------
        propertySanitizeLogs: true,
        unitSanitizeLogs: true,

        // ---------------------------------------------------------------------
        // PAYMENT INFO
        // ---------------------------------------------------------------------
        providerName: true,
        providerTxnId: true,
        paymentAmount: true,
        paymentDate: true,

        // ---------------------------------------------------------------------
        // REVIEW / ADMIN MODERATION
        // ---------------------------------------------------------------------
        reviewedBy: true,
        flaggedReason: true,
        blockedReason: true,

        // ---------------------------------------------------------------------
        // METADATA
        // ---------------------------------------------------------------------
        createdAt: true,
        updatedAt: true,

        // ---------------------------------------------------------------------
        // RELATIONSHIPS
        // ---------------------------------------------------------------------
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
                city: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                municipality: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or not owned by you.",
      });
    }

    return res.status(200).json(listing);
  } catch (error) {
    console.error("❌ Error in getLandlordSpecificListing:", error);
    return res.status(500).json({ error: "Failed to fetch landlord listing." });
  }
};


// ============================================================================
// GET ELIGIBLE UNITS FOR LISTING
// ----------------------------------------------------------------------------
// Returns units belonging to a landlord that can be listed again.
// Excludes units that have an active, visible, or waiting-for-payment listing.
// Eligible if:
//   - never listed, or
//   - last listing is BLOCKED or EXPIRED
//   - (optional) expiredAt < now()
// ============================================================================
export const getEligibleUnitsForListing = async (req, res) => {
  const landlordId = req.user.id;

  try {
    // 1️⃣ Fetch landlord’s properties and latest listings per unit
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
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                lifecycleStatus: true,
                expiresAt: true,
                blockedAt: true,
                flaggedAt: true,
                hiddenAt: true,
                visibleAt: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // 2️⃣ Determine eligible units
    const now = new Date();

    const formatted = properties.map((property) => {
      const eligibleUnits = property.Unit.filter((unit) => {
        const latest = unit.listings[0];

        // ✅ Never listed
        if (!latest) return true;

        const { lifecycleStatus, expiresAt, blockedAt, flaggedAt } = latest;

        // ✅ Eligible if expired
        if (lifecycleStatus === "EXPIRED" || (expiresAt && expiresAt < now))
          return true;

        // ✅ Eligible if blocked or flagged (for re-list after fix)
        if (lifecycleStatus === "BLOCKED") return true;

        // ❌ Not eligible if currently visible, hidden, or awaiting payment
        if (
          ["WAITING_PAYMENT", "WAITING_REVIEW", "VISIBLE", "HIDDEN", "FLAGGED"].includes(
            lifecycleStatus
          )
        )
          return false;

        // default fallback: not eligible
        return false;
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
        // ✅ only include units eligible for listing
        units: eligibleUnits.map((u) => ({
          id: u.id,
          label: u.label,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      };
    });

    // 3️⃣ Return only properties that still have eligible units
    const filtered = formatted.filter((p) => p.units.length > 0);

    return res.json({ properties: filtered });
  } catch (err) {
    console.error("❌ Error in getEligibleUnitsForListing:", err);
    return res.status(500).json({ error: "Failed to fetch eligible units." });
  }
};

// ----------------------------------------------------------------------------
// GET LISTING BASIC INFO IF SUCCESS
// ----------------------------------------------------------------------------
export const getLandlordListingInfoSuccess = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        landlordId: req.user.id,
      },
      select: {
        id: true,
        isFeatured: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
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

    if (!listing) {
      return res.status(404).json({
        message: "Listing not found or not owned by you.",
      });
    }

    return res.status(200).json({
      listingId: listing.id,
      isFeatured: listing.isFeatured,
      unit: {
        id: listing.unit.id,
        label: listing.unit.label,
      },
      property: {
        id: listing.unit.property.id,
        title: listing.unit.property.title,
        address: {
          street: listing.unit.property.street,
          barangay: listing.unit.property.barangay,
          zipCode: listing.unit.property.zipCode,
          city: listing.unit.property.city?.name,
          municipality: listing.unit.property.municipality?.name,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getLandlordListingInfoSuccess:", error);
    return res.status(500).json({ error: "Failed to fetch listing details." });
  }
};
