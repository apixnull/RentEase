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
Your task: Identify and sanitize inappropriate, discriminatory, scammy, or offensive content in property and unit data.

--- CONTEXT & RULES ---
1. Detect: inappropriate sexual terms, discriminatory language (race, gender, religion), SCAMMING PATTERNS, fake/fraudulent information
2. IMPORTANT: ONLY remove content that is inappropriate, discriminatory, or SCAMMING/FRAUD - do NOT remove content just because it's short or not descriptive
3. For each violation found, provide:
   - Original content (dataUsed)
   - Reason for sanitization (specify if it's "Scamming pattern" or "Fraudulent information" vs other violations)
   - Action must ALWAYS be "removed completely"
4. If content is clean (even if short or not descriptive), return empty arrays
5. ALL inappropriate content must be removed completely - do NOT replace with alternative text
6. For arrays (nearInstitutions, otherInformation, unitLeaseRules): remove the violating item from the array
7. For strings (description): set to empty string if violating content found
8. DO NOT sanitize property title or unit label - skip these fields
9. DO NOT remove content just because it's lacking details - only remove if it's inappropriate, discriminatory, or scammy
10. SCAMMING PATTERNS: fake addresses, fraudulent pricing schemes, deceptive descriptions, fake institutions

--- OUTPUT FORMAT (STRICT JSON) ---
{
  "propertySanitizations": [
    {
      "part": "nearInstitutions" | "otherInformation",
      "reason": "string (e.g., 'Inappropriate term', 'Discriminatory phrase', 'Scamming pattern', 'Fraudulent information', 'Fake institution')",
      "dataUsed": "original content that violated rules",
      "action": "removed completely",
      "isScammingPattern": boolean // true if reason contains "Scamming pattern" or "Fraudulent"
    }
  ],
  "unitSanitizations": [
    {
      "part": "description" | "unitLeaseRules",
      "reason": "string",
      "dataUsed": "original content that violated rules",
      "action": "removed completely",
      "isScammingPattern": boolean // true if reason contains "Scamming pattern" or "Fraudulent"
    }
  ],
  "sanitizedProperty": {
    "nearInstitutions": "sanitized array with violating items removed, or original if clean (JSON array)",
    "otherInformation": "sanitized array with violating items removed, or original if clean (JSON array)"
  },
  "sanitizedUnit": {
    "description": "sanitized description (empty string if removed, or original if clean)",
    "unitLeaseRules": "sanitized array with violating rules removed, or original if clean (JSON array)"
  }
}

--- CURRENT DATA TO SANITIZE ---
Property (only sanitize these):
- Near Institutions: ${JSON.stringify(property.nearInstitutions || [])}
- Other Information: ${JSON.stringify(property.otherInformation || [])}

Unit (only sanitize these):
- Description: ${unit.description || ""}
- Lease Rules: ${JSON.stringify(unit.unitLeaseRules || [])}

NOTE: Property title and unit label are NOT to be sanitized - skip them entirely.

Return ONLY valid JSON, no commentary.
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

    return {
      propertySanitizeLogs: Array.isArray(parsed.propertySanitizations) 
        ? parsed.propertySanitizations 
        : [],
      unitSanitizeLogs: Array.isArray(parsed.unitSanitizations) 
        ? parsed.unitSanitizations 
        : [],
      sanitizedProperty: {
        nearInstitutions: sanitizedNearInstitutions,
        otherInformation: sanitizedOtherInformation,
      },
      sanitizedUnit: {
        description: parsed.sanitizedUnit?.description !== undefined ? parsed.sanitizedUnit.description : unit.description,
        unitLeaseRules: sanitizedUnitLeaseRules,
      },
    };
  } catch (err) {
    console.error("⚠️ Sanitization failed:", err.message);
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
}

// ============================================================================
// Stage 2: Risk Analysis Service
// ============================================================================
async function analyzeListingRisk({ property, unit }) {
  // Use sanitized data from property and unit
  const {
    title,
    street,
    barangay,
    zipCode,
    city,
    municipality,
    latitude,
    longitude,
    nearInstitutions: rawNearInstitutions,
    otherInformation: rawOtherInformation,
  } = property;

  const {
    label,
    description,
    targetPrice,
    unitLeaseRules: rawUnitLeaseRules,
  } = unit;

  // ✅ Safely handle nullable fields - convert null/undefined to empty arrays
  const nearInstitutions = 
    rawNearInstitutions == null || !Array.isArray(rawNearInstitutions) 
      ? [] 
      : rawNearInstitutions;
  
  const otherInformation = 
    rawOtherInformation == null || !Array.isArray(rawOtherInformation) 
      ? [] 
      : rawOtherInformation;
  
  const unitLeaseRules = 
    rawUnitLeaseRules == null || !Array.isArray(rawUnitLeaseRules) 
      ? [] 
      : rawUnitLeaseRules;

  // Track incomplete address data (only for internal analysis, not shown as "UNKNOWN")
  const missingAddressFields = [];
  if (!street) missingAddressFields.push("street");
  if (!barangay) missingAddressFields.push("barangay");
  if (!zipCode) missingAddressFields.push("zipCode");
  if (!latitude || !longitude) missingAddressFields.push("coordinates");

  const formattedInstitutions =
    nearInstitutions.length > 0
      ? nearInstitutions
          .map((i) => `${i?.name || ""} (${i?.type || ""})`)
          .filter(item => item.trim() !== "()")
          .join(", ") || "None listed"
      : "None listed";

  const formattedOtherInfo =
    otherInformation.length > 0
      ? otherInformation
          .map(
            (i) =>
              `${i?.context || ""}: ${
                i?.description || ""
              }`
          )
          .filter(item => item.trim() !== ":")
          .join("; ") || "None listed"
      : "None listed";

  const prompt = `
You are a Cebu-based AI property auditor for RentEase.
Your task: review the given listing data and output an honest, concise JSON evaluation.

--- CONTEXT & LOCAL RULES ---
1. Cebu rental prices can be as low as ₱500-₱1000; this is NORMAL and not a red flag.
2. Only flag pricing if it is extremely unrealistic (e.g. ₱50 or ₱1,000,000 for a small unit).
3. Descriptions can be short - that's OKAY. Only flag if text is complete nonsense (e.g. "bluh222") or extremely short (< 5 words) AND suspicious.
4. Address fields may be missing (empty strings or null) - this is acceptable if basic address (street, barangay, zipCode) is provided.
   Only flag as risky if the entire address is completely blank or invalid. 
5. Invalid or obviously fake institution names or context data (like "LOL Mall" or "n/a"). Or if there is no such mall that exists.
6. Leave aiUnitRecommendations empty if everything is acceptable or normal.
7. Keep your output JSON clean and valid.
8. If lease rules contain multiple violations (e.g. racist or sexual), address EACH in the recommendations separately.
9. IMPORTANT: 
   - aiAnalysis and riskLevel are for ADMIN - be completely TRUTHFUL about all potential issues, risks, and concerns
   - aiUnitRecommendations are FRIENDLY SUGGESTIONS for landlords - be helpful and encouraging, not harsh (e.g., "Consider adding more details to help tenants understand the space better" for short descriptions)
 
--- OUTPUT FORMAT (STRICT JSON) ---
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "",
  "aiAnalysis": [{ "part": "string", "description": "string (≤15 words)" }], 
  "aiUnitRecommendations": [{ "part": "string", "suggestion": "string (≤15 words)" }]
}

--- LISTING DATA ---
Property:
- Title: ${title || ""}
- Address: ${street || ""}, ${barangay || ""}, ${zipCode || ""}, ${city?.name || ""}, ${municipality?.name || ""}
- Coordinates: ${latitude || ""}, ${longitude || ""}
- Missing address fields: ${missingAddressFields.length > 0 ? missingAddressFields.join(", ") : "None"}
- Nearby Institutions: ${formattedInstitutions}
- Other Information: ${formattedOtherInfo}

Unit:
- Label: ${label || ""}
- Description: ${description || ""}
- Target Price: ₱${targetPrice}
- Lease Rules: ${
    unitLeaseRules.length > 0 ? JSON.stringify(unitLeaseRules) : "[]"
  }

--- GUIDELINES ---
- Be objective and practical.
- Mention potential fraud or credibility risks (like missing address + absurd price).
- Do NOT suggest adding amenities.
- If acceptable, mark riskLevel as "LOW" and leave aiUnitRecommendations empty.
- aiUnitRecommendations are FRIENDLY SUGGESTIONS only (e.g., "Consider adding more details to the description" for short descriptions) - be helpful, not harsh
- Risk level and aiAnalysis are for ADMIN - be completely truthful about potential issues
- Return ONLY valid JSON, no commentary.
`;

  // 🧩 Safety net for missing API key
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY, skipping AI analysis.");
    return {
      riskLevel: "",
      aiAnalysis: [],
      aiUnitRecommendations: [],
    };
  }

  try {
    console.log("🤖 Running Gemini analysis for listing...");

    const result = await geminiModel.generateContent([{ text: prompt }]);

    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.response?.text?.() ||
      "";

    if (!text) {
      console.warn("⚠️ Gemini returned empty response text.");
      return {
        riskLevel: "",
        aiAnalysis: [],
        aiUnitRecommendations: [],
      };
    }

    console.log("🧠 Gemini raw response:", text.slice(0, 300));

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No valid JSON found in Gemini response");

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      riskLevel: parsed.riskLevel || "",
      aiAnalysis: Array.isArray(parsed.aiAnalysis) ? parsed.aiAnalysis : [],
      aiUnitRecommendations: Array.isArray(parsed.aiUnitRecommendations)
        ? parsed.aiUnitRecommendations
        : [],
    };
  } catch (err) {
    console.error("⚠️ Risk analysis failed:", err.message);
    return {
      riskLevel: "",
      aiAnalysis: [],
      aiUnitRecommendations: [],
    };
  }
}

// ============================================================================
// Main Analysis Function (Two-Stage: Sanitize → Analyze)
// ============================================================================
export async function analyzeListingWithGemini({ property, unit }) {
  // Stage 1: Sanitization
  console.log("🧹 Stage 1: Sanitizing listing content...");
  const sanitizationResult = await sanitizeListingData({ property, unit });
  
  // Stage 2: Risk Analysis (using sanitized data)
  console.log("🔍 Stage 2: Analyzing listing risk...");
  const analysisResult = await analyzeListingRisk({
    property: {
      ...property,
      title: sanitizationResult.sanitizedProperty.title,
      nearInstitutions: sanitizationResult.sanitizedProperty.nearInstitutions,
      otherInformation: sanitizationResult.sanitizedProperty.otherInformation,
    },
    unit: {
      ...unit,
      label: sanitizationResult.sanitizedUnit.label,
      description: sanitizationResult.sanitizedUnit.description,
      unitLeaseRules: sanitizationResult.sanitizedUnit.unitLeaseRules,
    },
  });

  return {
    // Sanitization logs
    propertySanitizeLogs: sanitizationResult.propertySanitizeLogs,
    unitSanitizeLogs: sanitizationResult.unitSanitizeLogs,
    
    // Sanitized data (to be used for updates)
    sanitizedProperty: sanitizationResult.sanitizedProperty,
    sanitizedUnit: sanitizationResult.sanitizedUnit,
    
    // Risk analysis results
    riskLevel: analysisResult.riskLevel,
    aiAnalysis: analysisResult.aiAnalysis,
    aiUnitRecommendations: analysisResult.aiUnitRecommendations,
  };
}

// ============================================================================
// Listing Activation Service
// ============================================================================
async function activateListing({ listingId, unitId, paymentDetails }) {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 90);

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      landlordId: true,
      unit: {
        select: {
          id: true,
          label: true,
          description: true,
          targetPrice: true,
          unitLeaseRules: true,
          listedAt: true,
          property: {
            select: {
              id: true,
              title: true,
              street: true,
              barangay: true,
              zipCode: true,
              latitude: true,
              longitude: true,
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
  const aiResult = await analyzeListingWithGemini({
    property: listing.unit.property || {},
    unit: listing.unit,
  });

  // ✅ If AI flags as HIGH risk → mark listing as FLAGGED instead of VISIBLE
  const lifecycleStatus = aiResult.riskLevel === "HIGH" ? "FLAGGED" : "VISIBLE";
  const flaggedAt = aiResult.riskLevel === "HIGH" ? now : null;

  // Extract scamming patterns from sanitization logs
  const scammingPatterns = [];
  const allSanitizations = [
    ...(aiResult.propertySanitizeLogs || []),
    ...(aiResult.unitSanitizeLogs || []),
  ];
  
  for (const sanitization of allSanitizations) {
    const reason = sanitization.reason?.toLowerCase() || "";
    const isScam = sanitization.isScammingPattern === true || 
                   reason.includes("scamming") || 
                   reason.includes("scam") ||
                   reason.includes("fraudulent") ||
                   reason.includes("fraud");
    
    if (isScam) {
      scammingPatterns.push({
        type: "Scamming Pattern",
        description: `${sanitization.part}: ${sanitization.reason || "Scamming pattern detected"}. Data: ${sanitization.dataUsed || "N/A"}`,
        date: now.toISOString(),
      });
    }
  }

  return prisma.$transaction(async (tx) => {
    // Update listing with analysis results
    const updatedListing = await tx.listing.update({
      where: { id: listingId },
      data: {
        lifecycleStatus,
        visibleAt: lifecycleStatus === "VISIBLE" ? now : null,
        flaggedAt,
        expiresAt,
        providerName: paymentDetails.providerName,
        providerTxnId: paymentDetails.providerTxnId,
        paymentAmount: paymentDetails.paymentAmount,
        paymentDate: now,
        riskLevel: aiResult.riskLevel,
        aiAnalysis: aiResult.aiAnalysis,
        aiUnitRecommendations: aiResult.aiUnitRecommendations.length > 0 
          ? aiResult.aiUnitRecommendations 
          : null,
        propertySanitizeLogs: aiResult.propertySanitizeLogs.length > 0 
          ? aiResult.propertySanitizeLogs 
          : null,
        unitSanitizeLogs: aiResult.unitSanitizeLogs.length > 0 
          ? aiResult.unitSanitizeLogs 
          : null,
      },
    });

    // Update property with sanitized data
    if (aiResult.sanitizedProperty && listing.unit.property) {
      await tx.property.update({
        where: { id: listing.unit.property.id },
        data: {
          nearInstitutions: aiResult.sanitizedProperty.nearInstitutions,
          otherInformation: aiResult.sanitizedProperty.otherInformation,
        },
      });
    }

    // Update unit with sanitized data
    await tx.unit.update({
      where: { id: unitId },
      data: {
        description: aiResult.sanitizedUnit.description,
        unitLeaseRules: aiResult.sanitizedUnit.unitLeaseRules,
        listedAt: listing.unit.listedAt || now,
      },
    });

    // Record scamming patterns as landlord offenses
    if (scammingPatterns.length > 0 && listing.landlordId) {
      // Check if landlord already has an offense record
      const existingOffense = await tx.landlordOffense.findUnique({
        where: { landlordId: listing.landlordId },
      });

      const fiftyDaysAgo = new Date(now);
      fiftyDaysAgo.setDate(fiftyDaysAgo.getDate() - 50);

      if (existingOffense) {
        // Append to existing offenses
        const currentOffenses = Array.isArray(existingOffense.offenses) 
          ? existingOffense.offenses 
          : [];
        
        // Filter out offenses older than 50 days for recent count
        const recentOffenses = currentOffenses.filter((offense) => {
          const offenseDate = new Date(offense.date);
          return offenseDate >= fiftyDaysAgo;
        });

        await tx.landlordOffense.update({
          where: { landlordId: listing.landlordId },
          data: {
            offenses: [...currentOffenses, ...scammingPatterns],
            recentOffenseCount: recentOffenses.length + scammingPatterns.length,
            lastOffenseAt: now,
          },
        });
      } else {
        // Create new offense record
        await tx.landlordOffense.create({
          data: {
            landlordId: listing.landlordId,
            offenses: scammingPatterns,
            recentOffenseCount: scammingPatterns.length,
            lastOffenseAt: now,
          },
        });
      }

      console.log(`⚠️ Recorded ${scammingPatterns.length} scamming pattern(s) for landlord ${listing.landlordId}`);
    }

    return updatedListing;
  });
}

// ============================================================================
// 🎯 PayMongo Webhook Controller
// ============================================================================
export const handlePaymongoWebhook = async (req, res) => {
  try {
    const payload = req.body?.data;
    const eventType = payload?.attributes?.type;

    console.log("🔔 PayMongo Webhook received:", eventType);

    if (eventType !== "checkout_session.payment.paid") {
      return res.status(200).send("Event ignored (non-payment event)");
    }

    const metadata = payload?.attributes?.data?.attributes?.metadata || {};
    const { listingId, unitId } = metadata;

    if (!listingId || !unitId)
      return res.status(400).send("Missing metadata: listingId or unitId");

    const payment = payload?.attributes?.data?.attributes?.payments?.[0];
    const paymentDetails = {
      providerName:
        payment?.attributes?.source?.type?.toUpperCase() || "UNKNOWN",
      providerTxnId: payment?.id || null,
      paymentAmount: (payment?.attributes?.amount || 0) / 100,
    };

    const updatedListing = await activateListing({
      listingId,
      unitId,
      paymentDetails,
    });

    if (updatedListing.lifecycleStatus === "FLAGGED") {
      console.log(
        `🚨 Listing ${updatedListing.id} flagged automatically (HIGH risk detected)`
      );
    } else {
      console.log("✅ Listing activated & analyzed:", updatedListing.id);
    }

    res.status(200).send("Webhook processed successfully.");
  } catch (error) {
    console.error("❌ Webhook Error:", error.message || error);
    res.status(500).send("Webhook processing failed.");
  }
};

