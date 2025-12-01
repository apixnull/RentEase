import prisma from "../../libs/prismaClient.js";
import axios from "axios";
import { activateListing } from "../../services/listingActivationService.js";

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
// CREATE PAYMENT SESSION (no listing record created yet)
// -----------------------------------------------------------------------------
// This function only creates a PayMongo checkout session.
// The listing will be created by the webhook after successful payment.
// -----------------------------------------------------------------------------
export const createPaymentSession = async (req, res) => {
  const landlordId = req.user.id;
  const { unitId } = req.params;
  const { isFeatured = false } = req.body;

  let listingRecord = null;

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

    // 3️⃣ Immediately create listing + run AI activation (no webhook)
    listingRecord = await prisma.listing.create({
      data: {
        propertyId: unit.propertyId,
        unitId: unit.id,
        landlordId,
        lifecycleStatus: "WAITING_REVIEW",
        isFeatured,
        paymentAmount: totalPrice,
        providerName: "GCASH",
        providerTxnId: null,
        paymentDate: new Date(),
        createdAt: new Date(),
      },
    });

    const paymentDetails = {
      providerName: "GCASH",
      providerTxnId: listingRecord.providerTxnId,
      paymentAmount: totalPrice,
    };

    const activatedListing = await activateListing({
      listingId: listingRecord.id,
      unitId: unit.id,
      paymentDetails,
    });

    // 4️⃣ Prepare PayMongo checkout session (for UX confirmation only)
    const lineItems = [
      {
        name: `Listing Fee`,
        currency: "PHP",
        amount: BASE_PRICE * 100, // centavos
        description: `Listing Fee for ${unit.label} - ${unit.property.title}`,
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
          payment_method_types: ["gcash"],
          description: `Listing Fee for Unit: ${unit.label} - Property: ${
            unit.property.title
          } ${isFeatured ? " (Featured)" : ""}`,
          show_line_items: true,
          show_description: true,
          cancel_url: `${process.env.FRONTEND_URL}/landlord/listing/${unitId}/review`,
          success_url: `${process.env.FRONTEND_URL}/landlord/listing/payment-success?unitId=${unitId}`,
          metadata: {
            // All data needed to create listing after payment success
            unitId: unit.id,
            propertyId: unit.propertyId,
            landlordId: landlordId,
            isFeatured: isFeatured.toString(),
            paymentAmount: totalPrice.toString(),
            listingId: listingRecord.id,
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
    const checkoutSessionId = response.data.data.id;

    // 5️⃣ Respond with checkout URL + newly created listing info
    return res.status(201).json({
      message: `Listing created and marked as paid via GCASH. Proceed to PayMongo checkout to showcase payment flow.`,
      checkoutUrl,
      checkoutSessionId, // Optional: for tracking/debugging
      listing: {
        id: activatedListing.id,
        lifecycleStatus: activatedListing.lifecycleStatus,
        paymentProvider: paymentDetails.providerName,
        paymentAmount: paymentDetails.paymentAmount,
      },
    });
  } catch (err) {
    console.error(
      "❌ Error in createPaymentSession:",
      err?.response?.data || err
    );
    return res.status(500).json({
      error: "Failed to create payment session.",
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
// GET LISTING BY UNIT ID (for payment success page)
// Finds the most recent listing for a unit that was paid within the last 10 minutes
// ----------------------------------------------------------------------------
export const getListingByUnitIdForSuccess = async (req, res) => {
  console.log("🔍 getListingByUnitIdForSuccess called with query:", req.query);
  try {
    const { unitId } = req.query;
    const landlordId = req.user.id;

    if (!unitId) {
      return res.status(400).json({ error: "unitId is required" });
    }

    // Find the most recent listing for this unit
    // Use a longer time window (30 minutes) to account for webhook delays
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    console.log("🔍 Searching for listing with unitId:", unitId, "landlordId:", landlordId);
    console.log("🔍 Time window:", thirtyMinutesAgo, "to now");
    
    // First, try to find listing with paymentDate within last 30 minutes
    let listing = await prisma.listing.findFirst({
      where: {
        unitId: unitId,
        landlordId: landlordId,
        paymentDate: {
          gte: thirtyMinutesAgo,
        },
      },
      orderBy: {
        paymentDate: 'desc',
      },
      select: {
        id: true,
        isFeatured: true,
        paymentAmount: true,
        paymentDate: true,
        providerName: true,
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

    // If no listing found with paymentDate, check for recently created listings
    // (webhook might still be processing the payment)
    if (!listing) {
      console.log("🔍 No listing with paymentDate found, checking recently created listings...");
      listing = await prisma.listing.findFirst({
        where: {
          unitId: unitId,
          landlordId: landlordId,
          createdAt: {
            gte: thirtyMinutesAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          isFeatured: true,
          paymentAmount: true,
          paymentDate: true,
          providerName: true,
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
    }

    // Last resort: find the most recent listing for this unit regardless of time
    // (in case webhook took longer than expected)
    if (!listing) {
      console.log("🔍 No listing found within time window, checking for most recent listing...");
      
      // Check if ANY listing exists for this unit
      const anyListing = await prisma.listing.findFirst({
        where: {
          unitId: unitId,
          landlordId: landlordId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          paymentDate: true,
          lifecycleStatus: true,
        },
      });

      if (anyListing) {
        console.log("⚠️ Found listing but outside time window:", {
          id: anyListing.id,
          createdAt: anyListing.createdAt,
          paymentDate: anyListing.paymentDate,
          status: anyListing.lifecycleStatus,
          ageMinutes: Math.round((Date.now() - new Date(anyListing.createdAt).getTime()) / 60000),
        });
      } else {
        console.log("❌ No listing found at all for unitId:", unitId, "and landlordId:", landlordId);
      }

      return res.status(404).json({
        error: "Listing not found. Payment may still be processing. Please wait a moment and refresh.",
      });
    }

    console.log("✅ Found listing:", listing.id, "paymentDate:", listing.paymentDate);

    return res.status(200).json({
      listingId: listing.id,
      isFeatured: listing.isFeatured,
      paymentAmount: listing.paymentAmount,
      paymentDate: listing.paymentDate,
      providerName: listing.providerName,
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
    console.error("❌ Error in getListingByUnitIdForSuccess:", error);
    return res.status(500).json({ error: "Failed to fetch listing details." });
  }
};

// ----------------------------------------------------------------------------
// GET LISTING BASIC INFO IF SUCCESS (by listingId - kept for backward compatibility)
// ----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// TOGGLE LISTING VISIBILITY (VISIBLE ↔ HIDDEN)
// -----------------------------------------------------------------------------
// Allows landlord to toggle listing between VISIBLE and HIDDEN status
// Only works if current status is VISIBLE or HIDDEN
// -----------------------------------------------------------------------------
export const toggleListingVisibility = async (req, res) => {
  const landlordId = req.user.id;
  const { listingId } = req.params;

  try {
    // 1️⃣ Fetch the listing and verify ownership
    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        landlordId: landlordId,
      },
      select: {
        id: true,
        lifecycleStatus: true,
        visibleAt: true,
        hiddenAt: true,
      },
    });

    if (!listing) {
      return res.status(404).json({
        error: "Listing not found or not owned by you.",
      });
    }

    // 2️⃣ Validate that current status is VISIBLE or HIDDEN
    const currentStatus = listing.lifecycleStatus;
    if (currentStatus !== "VISIBLE" && currentStatus !== "HIDDEN") {
      return res.status(400).json({
        error: `Cannot toggle visibility. Current status must be VISIBLE or HIDDEN, but it is ${currentStatus}.`,
      });
    }

    // 3️⃣ Determine new status and update timestamps
    const now = new Date();
    const newStatus = currentStatus === "VISIBLE" ? "HIDDEN" : "VISIBLE";
    
    const updateData = {
      lifecycleStatus: newStatus,
    };

    // Update appropriate timestamp
    if (newStatus === "HIDDEN") {
      updateData.hiddenAt = now;
      // Keep visibleAt as is (don't clear it)
    } else {
      // newStatus === "VISIBLE"
      updateData.visibleAt = listing.visibleAt || now; // Use existing visibleAt or set to now
      // Keep hiddenAt as is (don't clear it)
    }

    // 4️⃣ Update the listing
    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      select: {
        id: true,
        lifecycleStatus: true,
        visibleAt: true,
        hiddenAt: true,
      },
    });

    return res.status(200).json({
      message: `Listing is now ${newStatus.toLowerCase()}.`,
      listing: {
        id: updatedListing.id,
        lifecycleStatus: updatedListing.lifecycleStatus,
        visibleAt: updatedListing.visibleAt,
        hiddenAt: updatedListing.hiddenAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in toggleListingVisibility:", error);
    return res.status(500).json({
      error: "Failed to toggle listing visibility.",
    });
  }
};
