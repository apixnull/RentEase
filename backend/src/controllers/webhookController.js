// ============================================================================
// File: src/controllers/webhookController.js
// Description: Handles PayMongo webhook events (listing activation)
// ============================================================================
import prisma from "../libs/prismaClient.js";

export const handlePaymongoWebhook = async (req, res) => {
  try {
    const payload = req.body?.data;
    const eventType = payload?.attributes?.type;

    console.log("🔔 PayMongo Webhook received:", eventType);

    // Only handle successful checkout payments
    if (eventType !== "checkout_session.payment.paid") {
      return res.status(200).send("Event ignored");
    }

    // --- Extract metadata (from PayMongo checkout metadata) ---
    const metadata = payload?.attributes?.data?.attributes?.metadata || {};
    const { listingId, unitId } = metadata;

    if (!listingId || !unitId) {
      console.warn("⚠️ Webhook missing listingId or unitId in metadata.");
      return res.status(400).send("Missing required metadata");
    }

    // --- Extract payment details ---
    const payment = payload?.attributes?.data?.attributes?.payments?.[0];
    const providerName = payment?.attributes?.source?.type?.toUpperCase() || "UNKNOWN";
    const providerTxnId = payment?.id || null;
    const paymentAmount = payment?.attributes?.amount
      ? payment.attributes.amount / 100 // convert centavos → pesos
      : 0;
    const payerPhone = payment?.attributes?.billing?.phone || null;

    // --- Calculate expiry (90 days from payment) ---
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 90);

    // --- Fetch listing + ensure it exists ---
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { unit: { select: { id: true, propertyId: true } } },
    });
    if (!listing) {
      console.warn("⚠️ Listing not found for webhook:", listingId);
      return res.status(404).send("Listing not found");
    }

    // --- Atomic transaction (update listing + mark unit as listed) ---
    const updatedListing = await prisma.$transaction(async (tx) => {
      const updated = await tx.listing.update({
        where: { id: listingId },
        data: {
          lifecycleStatus: "VISIBLE",
          providerName,
          providerTxnId,
          paymentAmount,
          paymentDate: now,
          payerPhone,
          expiresAt,

          // --- AI placeholders (for post-processing) ---
          riskLevel: "LOW",
          riskReason: "No duplicate photos found",
          aiAnalysis: [
            { part: "price", description: "Target price is within market range" },
            { part: "images", description: "Images quality is acceptable" },
          ],
          aiRecommendations: [
            { part: "description", suggestion: "Add more details about nearby landmarks" },
            { part: "images", suggestion: "Upload at least 2 more photos for better visibility" },
          ],
        },
      });

      await tx.unit.update({
        where: { id: unitId },
        data: { listedAt: now },
      });

      return updated;
    });

    console.log("✅ Listing activated via webhook:", updatedListing.id);
    return res.status(200).send("Webhook processed successfully");
  } catch (err) {
    console.error("❌ Error in PayMongo Webhook:", err?.response?.data || err);
    return res.status(500).send("Webhook error");
  }
};
