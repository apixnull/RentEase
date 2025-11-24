import prisma from "../libs/prismaClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// File: src/controllers/webhookController.js
// Description: Handles PayMongo webhook events (listing activation + AI analysis)
// ============================================================================

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // ✅ Stable + supports JSON mode
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

// ============================================================================
// Stage 1: Sanitization Service
// ============================================================================
async function sanitizeListingData({ property, unit }) {
  const sanitizePrompt = `
You are a content sanitization AI for RentEase.
Task: Remove inappropriate, discriminatory, scam, fake, spam, illegal, or privacy-violating content.

--- RULES ---
1. ONLY remove violations. Do NOT remove content just because it's short or lacks details.
2. If content is clean, return empty arrays.
3. Remove violating items from arrays. Set description to "" if violating.
4. Property title and unit label: DO NOT SANITIZE (skip entirely).

--- REASON VALUES (USE EXACTLY) ---
For "reason" field, use ONLY one of these exact values:
- "inappropriate" (sexual/explicit content)
- "discriminatory" (race, gender, religion, etc.)
- "scam" (fraudulent pricing, upfront payment requests through online, viewing fees, etc.)
- "fake_info" (fake addresses, fake institutions) (this will be low severity if detected)
- "privacy" (personal info violations)
- "spam" (repetitive, promotional spam)
- "illegal" (illegal activities)
- "other" (any other violation)

IMPORTANT CASES:
- "boys only" is NOT an offense (some landlords prefer male tenants - valid preference)
- "Inviting 2-bedroom unit in central Cebu City. Features modern kitchen and AC. Close to shops and transport. PHP 2000/monthly. Contact us today!" is NOT scamming (normal listing description)

--- OUTPUT FORMAT (JSON ONLY) ---
{
  "propertySanitizations": [
    {
      "part": "nearInstitutions" | "otherInformation",
      "reason": "inappropriate" | "discriminatory" | "scam" | "fake_info" | "privacy" | "spam" | "illegal" | "other",
      "dataUsed": "original violating content",
      "action": "removed completely",
      "isScammingPattern": true // if reason is "scam", else false 
    }
  ],
  "unitSanitizations": [
    {
      "part": "description" | "unitLeaseRules",
      "reason": "inappropriate" | "discriminatory" | "scam" | "fake_info" | "privacy" | "spam" | "illegal" | "other",
      "dataUsed": "original violating content",
      "action": "removed completely",
      "isScammingPattern": true // if reason is "scam", else false
    }
  ],
  "sanitizedProperty": {
    "nearInstitutions": [/* array with violations removed, or original if clean */],
    "otherInformation": [/* array with violations removed, or original if clean */]
  },
  "sanitizedUnit": {
    "description": "" | "/* original if clean */",
    "unitLeaseRules": [/* array with violations removed, or original if clean */]
  }
}

--- DATA TO CHECK ---
Property:
- Near Institutions: ${JSON.stringify(property.nearInstitutions || [])}
- Other Information: ${JSON.stringify(property.otherInformation || [])}

Unit:
- Description: ${unit.description || ""}
- Lease Rules: ${JSON.stringify(unit.unitLeaseRules || [])}

Return JSON only, no commentary.
`;

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY, skipping sanitization.");
    return {
      propertySanitizeLogs: [],
      unitSanitizeLogs: [],
      sanitizedProperty: {
        nearInstitutions: property.nearInstitutions,
        otherInformation: property.otherInformation,
      },
      sanitizedUnit: {
        description: unit.description,
        unitLeaseRules: unit.unitLeaseRules,
      },
    };
  }

  try {
    console.log("🧹 Running sanitization for listing...");

    const result = await geminiModel.generateContent([{ text: sanitizePrompt }]);
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.response?.text?.() ||
      "";

    if (!text) {
      console.warn("⚠️ Gemini returned empty sanitization response.");
      return {
        propertySanitizeLogs: [],
        unitSanitizeLogs: [],
        sanitizedProperty: {
          title: property.title,
          nearInstitutions: property.nearInstitutions,
          otherInformation: property.otherInformation,
        },
        sanitizedUnit: {
          label: unit.label,
          description: unit.description,
          unitLeaseRules: unit.unitLeaseRules,
        },
      };
    }

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON in sanitization response");

    const parsed = JSON.parse(jsonMatch[0]);

    const allowedReasons = [
      "scam",
      "fake_info",
      "discriminatory",
      "illegal",
      "inappropriate",
      "other",
    ];

    const normalizeSanitizeLogs = (logs = []) =>
      (Array.isArray(logs) ? logs : []).map((log) => {
        const rawReason = (log?.reason || "").toString().toLowerCase().trim();
        const reason = allowedReasons.includes(rawReason) ? rawReason : "other";

        return {
          part: (log?.part || "unknown").toString(),
          reason,
          dataUsed: log?.dataUsed ?? null,
          action: "remove",
        };
      });

    const rawPropertyLogs = Array.isArray(parsed.propertySanitizations)
      ? parsed.propertySanitizations
      : [];
    const rawUnitLogs = Array.isArray(parsed.unitSanitizations)
      ? parsed.unitSanitizations
      : [];

    const propertySanitizeLogs = normalizeSanitizeLogs(rawPropertyLogs);
    const unitSanitizeLogs = normalizeSanitizeLogs(rawUnitLogs);

    // Parse sanitized JSON arrays if they're strings
    let sanitizedNearInstitutions = parsed.sanitizedProperty?.nearInstitutions;
    if (typeof sanitizedNearInstitutions === 'string') {
      try {
        sanitizedNearInstitutions = JSON.parse(sanitizedNearInstitutions);
      } catch {
        sanitizedNearInstitutions = property.nearInstitutions;
      }
    }

    let sanitizedOtherInformation = parsed.sanitizedProperty?.otherInformation;
    if (typeof sanitizedOtherInformation === 'string') {
      try {
        sanitizedOtherInformation = JSON.parse(sanitizedOtherInformation);
      } catch {
        sanitizedOtherInformation = property.otherInformation;
      }
    }

    let sanitizedUnitLeaseRules = parsed.sanitizedUnit?.unitLeaseRules;
    if (typeof sanitizedUnitLeaseRules === 'string') {
      try {
        sanitizedUnitLeaseRules = JSON.parse(sanitizedUnitLeaseRules);
      } catch {
        sanitizedUnitLeaseRules = unit.unitLeaseRules;
      }
    }

    // Ensure arrays are arrays, fallback to empty array if invalid
    if (!Array.isArray(sanitizedNearInstitutions)) {
      sanitizedNearInstitutions = Array.isArray(property.nearInstitutions) ? property.nearInstitutions : [];
    }
    if (!Array.isArray(sanitizedOtherInformation)) {
      sanitizedOtherInformation = Array.isArray(property.otherInformation) ? property.otherInformation : [];
    }
    if (!Array.isArray(sanitizedUnitLeaseRules)) {
      sanitizedUnitLeaseRules = Array.isArray(unit.unitLeaseRules) ? unit.unitLeaseRules : [];
    }

    // Calculate scamming pattern presence
    const allSanitizations = [
      ...rawPropertyLogs,
      ...rawUnitLogs,
    ];

    const scammingPatterns = allSanitizations.filter((s) =>
      s.isScammingPattern === true ||
      s.reason?.toLowerCase()?.trim() === "scam"
    );

    return {
      propertySanitizeLogs,
      unitSanitizeLogs,
      rawSanitizationLogs: {
        property: rawPropertyLogs,
        unit: rawUnitLogs,
      },
      sanitizedProperty: {
        nearInstitutions: sanitizedNearInstitutions,
        otherInformation: sanitizedOtherInformation,
      },
      sanitizedUnit: {
        description: parsed.sanitizedUnit?.description !== undefined ? parsed.sanitizedUnit.description : unit.description,
        unitLeaseRules: sanitizedUnitLeaseRules,
      },
      aiAnalysis: Array.isArray(parsed.aiAnalysis) ? parsed.aiAnalysis : [],
      scammingPatternCount: scammingPatterns.length,
      shouldBlock: scammingPatterns.length > 3, // Block if more than 3 scamming patterns
    };
  } catch (err) {
    console.error("⚠️ Sanitization failed:", err.message);
    return {
      propertySanitizeLogs: [],
      unitSanitizeLogs: [],
      rawSanitizationLogs: {
        property: [],
        unit: [],
      },
      sanitizedProperty: {
        nearInstitutions: property.nearInstitutions,
        otherInformation: property.otherInformation,
      },
      sanitizedUnit: {
        description: unit.description,
        unitLeaseRules: unit.unitLeaseRules,
      },
      aiAnalysis: [],
      scammingPatternCount: 0,
      shouldBlock: false,
    };
  }
}

function buildBlockedResubmissionReason({ scammingSanitizations, aiAnalysis }) {
  if (Array.isArray(scammingSanitizations) && scammingSanitizations.length > 0) {
    const uniqueReasons = Array.from(
      new Set(
        scammingSanitizations
          .map((entry) => (entry.reason || "scam").toString().replace(/_/g, " ").toLowerCase())
          .filter(Boolean)
      )
    )
      .map((reason) => reason.replace(/\b\w/g, (char) => char.toUpperCase()))
      .join(", ");

    const patternSummary = scammingSanitizations.length > 1
      ? `${scammingSanitizations.length} scamming patterns were detected`
      : `a scamming pattern was detected`;

    return `AI: Your Listing was blocked because ${patternSummary}${uniqueReasons ? ` (${uniqueReasons})` : "."}`;
  }

  if (Array.isArray(aiAnalysis) && aiAnalysis.length > 0) {
    const insights = aiAnalysis
      .slice(0, 3)
      .map((entry) => `${entry.part || "content"}: ${entry.description || "policy issue detected"}`)
      .join("; ");

    return `AI: Listing blocked due to policy concerns detected during analysis (${insights}).`;
  }

  return "AI: Listing blocked because automated safeguards detected potential policy violations.";
}

// ============================================================================
// Main Analysis Function (Sanitization + Risk Assessment)
// ============================================================================
export async function analyzeListingWithGemini({ property, unit }) {
  console.log("🧹 Sanitizing listing content and assessing risk...");
  const sanitizationResult = await sanitizeListingData({ property, unit });

  const shouldBlock = sanitizationResult.shouldBlock;
  if (shouldBlock) {
    console.log(`🚨 Blocking listing: ${sanitizationResult.scammingPatternCount} scamming patterns detected (>3)`);
  }

  return {
    propertySanitizeLogs: sanitizationResult.propertySanitizeLogs,
    unitSanitizeLogs: sanitizationResult.unitSanitizeLogs,
    rawSanitizationLogs: sanitizationResult.rawSanitizationLogs,
    sanitizedProperty: sanitizationResult.sanitizedProperty,
    sanitizedUnit: sanitizationResult.sanitizedUnit,
    aiAnalysis: sanitizationResult.aiAnalysis,
    shouldBlock: shouldBlock,
    scammingPatternCount: sanitizationResult.scammingPatternCount,
  };
}

// ============================================================================
// Listing Activation Service
// ----------------------------------------------------------------------------
// Purpose: After successful payment, run AI moderation (sanitization + risk),
// then set the listing lifecycle state based on the new schema rules:
//   - BLOCKED: More than 3 scamming patterns detected
//   - WAITING_REVIEW: Payment done, pending admin review (default)
// Notes:
//   - We DO NOT make the listing VISIBLE here; admin review is required.
//   - We update sanitized text/arrays for non-blocked listings.
//   - We create individual LandlordOffense records per violation with severity.
//   - If AI analysis fails, default to WAITING_REVIEW (graceful degradation)
// ============================================================================
async function activateListing({ listingId, unitId, paymentDetails }) {
  const now = new Date();
  // Visibility and expiry are handled after admin review; compute upfront for later use
  const visibleExpiry = new Date(now);
  visibleExpiry.setDate(visibleExpiry.getDate() + 92);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      landlordId: true,
      resubmissionHistory: true,
      unit: {
        select: {
          id: true,
          label: true,
          description: true,
          targetPrice: true,
          unitLeaseRules: true,
          property: {
            select: {
              id: true,
              title: true,
              street: true,
              barangay: true,
              zipCode: true,
              nearInstitutions: true,
              otherInformation: true,
              city: { select: { id: true, name: true } },
              municipality: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!listing) throw new Error(`Listing ${listingId} not found`);
  if (!listing.unit) throw new Error(`Unit not found for listing ${listingId}`);

  console.log("🤖 Running two-stage AI analysis for listing:", listingId);

  // 🧠 Include the full property info for AI evaluation
  // ✅ Safely handle nullable property - provide empty object fallback
  // ✅ Wrap in try-catch to handle AI failures gracefully
  let aiResult;
  try {
    aiResult = await analyzeListingWithGemini({
      property: listing.unit.property || {},
      unit: listing.unit,
    });
  } catch (aiError) {
    console.error("⚠️ AI analysis failed, defaulting to WAITING_REVIEW:", aiError.message);
    // Default to safe state if AI fails
    aiResult = {
      propertySanitizeLogs: [],
      unitSanitizeLogs: [],
      rawSanitizationLogs: {
        property: [],
        unit: [],
      },
      sanitizedProperty: {
        nearInstitutions: listing.unit.property?.nearInstitutions || [],
        otherInformation: listing.unit.property?.otherInformation || [],
      },
      sanitizedUnit: {
        description: listing.unit.description || "",
        unitLeaseRules: listing.unit.unitLeaseRules || [],
      },
      aiAnalysis: [],
      shouldBlock: false,
      scammingPatternCount: 0,
    };
  }

  // Determine lifecycle status based on analysis results
  // Default after payment: WAITING_REVIEW (admin must approve before visibility)
  let lifecycleStatus = "WAITING_REVIEW";
  let blockedAt = null;
  let blockedReason = null;

  const propertySanitizations = Array.isArray(aiResult.propertySanitizeLogs)
    ? aiResult.propertySanitizeLogs
    : [];
  const unitSanitizations = Array.isArray(aiResult.unitSanitizeLogs)
    ? aiResult.unitSanitizeLogs
    : [];

  const detectionSanitizations = [...propertySanitizations, ...unitSanitizations];

  const scammingSanitizations = detectionSanitizations.filter(
    (sanitization) => (sanitization.reason || "").toLowerCase() === "scam"
  );

  const existingResubmissionHistory = Array.isArray(listing.resubmissionHistory)
    ? [...listing.resubmissionHistory]
    : [];

  let updatedResubmissionHistory = existingResubmissionHistory;

  // Block only if more than 3 scamming patterns detected
  if (scammingSanitizations.length > 3) {
    // Auto-block: clear fraudulent content from being persisted, and prevent visibility
    lifecycleStatus = "BLOCKED";
    blockedAt = now;
    blockedReason = buildBlockedResubmissionReason({
      scammingSanitizations,
      aiAnalysis: aiResult.aiAnalysis,
    });
    updatedResubmissionHistory = [
      ...existingResubmissionHistory,
      {
        attempt: existingResubmissionHistory.length + 1,
        type: "BLOCKED",
        reason: blockedReason,
        resubmittedAt: now.toISOString(),
      },
    ];
    console.log(`🚨 BLOCKING listing: ${scammingSanitizations.length} scamming patterns detected (>3)`);
  } else {
    // All other cases go to WAITING_REVIEW
    lifecycleStatus = "WAITING_REVIEW";
  }

  return prisma.$transaction(async (tx) => {
    // Update listing with analysis results
    const updatedListing = await tx.listing.update({
      where: { id: listingId },
      data: {
        lifecycleStatus,
        // Visibility is not granted here; admin review required
        visibleAt: null,
        blockedAt,
        blockedReason,
        // Expiry is set even for blocked listings (worst case scenario)
        expiresAt: visibleExpiry,
        flaggedAt: null,
        flaggedReason: null,
        providerName: paymentDetails.providerName,
        providerTxnId: paymentDetails.providerTxnId,
        paymentAmount: paymentDetails.paymentAmount,
        paymentDate: now,
        propertySanitizeLogs: aiResult.propertySanitizeLogs.length > 0 
          ? aiResult.propertySanitizeLogs 
          : null,
        unitSanitizeLogs: aiResult.unitSanitizeLogs.length > 0 
          ? aiResult.unitSanitizeLogs 
          : null,
        resubmissionHistory: updatedResubmissionHistory,
      },
    });

    // Update property with sanitized data (ALWAYS apply sanitization, even for blocked listings)
    if (aiResult.sanitizedProperty && listing.unit.property) {
      await tx.property.update({
        where: { id: listing.unit.property.id },
        data: {
          nearInstitutions: aiResult.sanitizedProperty.nearInstitutions,
          otherInformation: aiResult.sanitizedProperty.otherInformation,
        },
      });
    }

    // Update unit with sanitized data (ALWAYS apply sanitization, even for blocked listings)
    await tx.unit.update({
      where: { id: unitId },
      data: {
        description: aiResult.sanitizedUnit.description,
        unitLeaseRules: aiResult.sanitizedUnit.unitLeaseRules,
      },
    });

    // Record listing payment as an EXPENSE transaction
    // This represents the cost the landlord pays to list their property
    if (listing.unit.property && paymentDetails.paymentAmount > 0) {
      const listingDescription = listing.isFeatured 
        ? "Featured listing payment" 
        : "Listing payment";
      
      await tx.transaction.create({
        data: {
          propertyId: listing.unit.property.id,
          unitId: unitId,
          amount: paymentDetails.paymentAmount,
          description: listingDescription,
          type: "EXPENSE",
          category: "LISTING_ADVERTISING",
          date: now,
          recurringInterval: null,
        },
      });
      console.log(`💰 Recorded listing payment as expense transaction: ${paymentDetails.paymentAmount} for property ${listing.unit.property.id}`);
    }

    // Record landlord offenses as individual rows linked to the listing (new schema)
    // We create offenses for ALL sanitizations to build an audit trail
    if (detectionSanitizations.length > 0 && listing.landlordId) {
      const mapSeverity = (reason) => {
        switch ((reason || "").toLowerCase()) {
          case "illegal":
          case "scam":
            return "HIGH";
          case "fake_info":
            return "MEDIUM";
          case "discriminatory":
          case "inappropriate":
            return "LOW";
          default:
            return "LOW";
        }
      };

      const offensesData = detectionSanitizations.map((s) => ({
        landlordId: listing.landlordId,
        listingId: listingId,
        type: (s.reason || "other").toString(),
        severity: mapSeverity(s.reason),
        description: `${s.part || "unknown"}: ${s.reason || "violation"}. Data: ${s.dataUsed || "N/A"}`,
        detectedBy: "AI",
        detectedAt: now,
      }));

      // Use createMany for efficiency; ignoreDuplicates to avoid duplicates on retries
      if (offensesData.length > 0) {
        await tx.landlordOffense.createMany({ data: offensesData, skipDuplicates: true });
        console.log(`⚠️ Recorded ${offensesData.length} landlord offense(s) for landlord ${listing.landlordId}`);
      }
    }

    return updatedListing;
  });
}

// ============================================================================
// 🎯 PayMongo Webhook Controller
// ============================================================================
// This webhook is triggered after successful payment.
// It creates the listing record and then activates/analyzes it.
// ============================================================================
export const handlePaymongoWebhook = async (req, res) => {
  try {
    const payload = req.body?.data;
    const eventType = payload?.attributes?.type;

    console.log("🔔 PayMongo Webhook received:", eventType);

    if (eventType !== "checkout_session.payment.paid") {
      return res.status(200).send("Event ignored (non-payment event)");
    }

    // Extract metadata from checkout session (contains all data needed to create listing)
    const metadata = payload?.attributes?.data?.attributes?.metadata || {};
    const { unitId, propertyId, landlordId, isFeatured, paymentAmount } = metadata;

    // Validate required metadata fields
    if (!unitId || !propertyId || !landlordId) {
      return res.status(400).send("Missing required metadata: unitId, propertyId, or landlordId");
    }

    // Extract payment details
    const payment = payload?.attributes?.data?.attributes?.payments?.[0];
    const paymentDetails = {
      providerName:
        payment?.attributes?.source?.type?.toUpperCase() || "UNKNOWN",
      providerTxnId: payment?.id || null,
      paymentAmount: (payment?.attributes?.amount || 0) / 100,
    };

    // Verify unit exists and belongs to the landlord
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: {
        id: true,
        propertyId: true,
        property: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!unit) {
      console.error(`❌ Unit ${unitId} not found in webhook`);
      return res.status(400).send("Unit not found");
    }

    if (unit.property.ownerId !== landlordId) {
      console.error(`❌ Landlord ${landlordId} does not own unit ${unitId}`);
      return res.status(403).send("Unauthorized: landlord does not own this unit");
    }

    // Create listing record (will be activated/analyzed next)
    const listing = await prisma.listing.create({
      data: {
        propertyId: propertyId,
        unitId: unitId,
        landlordId: landlordId,
        lifecycleStatus: "WAITING_REVIEW", // Temporary status, will be updated by activateListing
        isFeatured: isFeatured === "true" || isFeatured === true,
        paymentAmount: parseFloat(paymentAmount || "0"),
        providerName: paymentDetails.providerName,
        providerTxnId: paymentDetails.providerTxnId,
        paymentDate: new Date(),
        createdAt: new Date(),
      },
    });

    console.log(`📝 Listing ${listing.id} created from payment session`);

    // Now activate and analyze the listing
    const updatedListing = await activateListing({
      listingId: listing.id,
      unitId: unitId,
      paymentDetails,
    });

    if (updatedListing.lifecycleStatus === "BLOCKED") {
      console.log(
        `🚨 Listing ${updatedListing.id} BLOCKED automatically (scamming/fraud detected)`
      );
    } else {
      console.log("✅ Listing created, activated & analyzed:", updatedListing.id);
    }

    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    console.error("❌ Webhook Error:", error.message || error);
    res.status(500).send("Webhook processing failed.");
  }
};

