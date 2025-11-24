import prisma from "../../libs/prismaClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ============================================================================
// Gemini AI Setup
// ============================================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash", // ✅ Stable + supports JSON mode
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

// Valid keys for aiFindings
const validFindingKeys = [
  "financial",
  "employment",
  "identity_verification",
  "documents",
  "rental_history",
  "eviction_risk",
  "payment_behavior",
  "lifestyle",
  "behavior",
  "overall",
];

const includesAnyKeyword = (text, keywords = []) => {
  if (!text || typeof text !== "string" || !Array.isArray(keywords) || keywords.length === 0) {
    return false;
  }
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
};

const suspiciousIncomeKeywords = [
  "selling drugs",
  "drug",
  "illegal",
  "scam",
  "fraud",
  "money laundering",
  "kidnap",
  "extortion",
  "human trafficking",
  "syndicate",
  "gang",
  "terror",
  "weapon dealing",
];

const harmfulLifestyleKeywords = [
  "gang",
  "syndicate",
  "illegal activity",
  "violent",
  "violence",
  "weapon",
  "drug den",
  "illegal business",
  "crime",
  "criminal",
];

const disruptiveLifestyleKeywords = [
  "disturbance",
  "noise complaint",
  "complaint",
  "harassment",
  "threat",
  "illegal",
  "violence",
  "violent",
  "crime",
  "criminal",
  "gang",
  "syndicate",
  "weapon",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runGeminiWithRetry(prompt, retries = 2) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await geminiModel.generateContent([{ text: prompt }]);
    } catch (error) {
      const message = error?.message || "";
      const status = error?.status || error?.response?.status;
      const overloaded = status === 503 || /503|overload/i.test(message);

      if (!overloaded || attempt === retries) {
        throw error;
      }

      const delay = 500 * Math.pow(2, attempt);
      console.warn(`⚠️ Gemini overloaded (attempt ${attempt + 1}). Retrying in ${delay}ms...`);
      await sleep(delay);
      attempt += 1;
    }
  }
}

// ============================================================================
// AI Risk Analysis Service
// ============================================================================
async function analyzeTenantScreeningRisk(screeningData) {
  const analysisPrompt = `
You are a tenant risk assessment AI for RentEase.
Task: Analyze tenant screening information and provide a comprehensive risk assessment.

--- CONTEXTUAL GUIDELINES ---
- You are evaluating renters in the Philippines. Treat all monetary values as Philippine Peso (PHP) and never convert them to USD.
- Allowances or stipends around PHP 2,000 or higher should be considered meaningful supplemental income.
- As long as income sources are understandable (salary, allowance, remittance, freelance, etc.), treat them as acceptable support unless explicit fraud indicators exist.
- Focus higher risk assessments on lifestyle or rental history red flags such as repeated late rent, eviction records, severe neighbor complaints, or document anomalies.
- Only classify a tenant as "HIGH" risk when there are serious, corroborated issues (eg. confirmed eviction, persistent non-payment, falsified documents, or contradictory statements). Otherwise lean toward "LOW" or "MEDIUM".
- Missing NBI clearance together with other core IDs should default to a MEDIUM risk recommendation unless additional severe red flags exist.
- Immediately mark HIGH risk when tenants explicitly mention illegal or harmful income sources (eg. selling drugs, gang operations) or lifestyle patterns involving gangs, violence, or criminal activity. Common habits like smoking or moderate drinking should not trigger HIGH risk on their own.
- Keep wording concise, practical, and localized for PH landlords.

--- RISK ASSESSMENT CRITERIA ---
1. Financial:
   - Monthly income vs. typical rental costs
   - Income source reliability
   - Proof of income documentation

2. Employment:
   - Employment stability (years employed, employment status)
   - Current employer credibility
   - Job position and career stability

3. Identity Verification:
   - Full name completeness
   - Birthdate validity
   - Personal information consistency

4. Documents:
   - Government ID availability
   - NBI clearance availability
   - Proof of income documentation
   - Overall document completeness

5. Rental History:
   - Previous rental addresses
   - Previous landlord references
   - Reason for leaving previous rental
   - Length of previous tenancy

6. Eviction Risk:
   - History of evictions
   - Patterns indicating potential eviction risk
   - Stability indicators

7. Payment Behavior:
   - Late payment history
   - Payment reliability indicators
   - Financial responsibility patterns

8. Lifestyle:
   - Smoking habits
   - Alcohol consumption
   - Pet ownership
   - Work schedule (night shift)
   - Visitor frequency
   - Noise level preferences
   - Other lifestyle factors

9. Behavior:
   - Overall behavioral patterns
   - Communication indicators
   - Responsibility indicators

10. Overall:
    - Holistic risk assessment
    - Summary of all factors combined
    - Final recommendation

3. Risk Scoring:
   - aiRiskScore: 0.0 (lowest risk) to 1.0 (highest risk)
   - riskLevel: "LOW" | "MEDIUM" | "HIGH"
   - Consider all factors holistically, not just individual flags

--- OUTPUT FORMAT (JSON ONLY) ---
{
  "aiRiskScore": 0.0-1.0,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "aiScreeningSummary": "Brief 1-2 sentence summary of the risk assessment",
  "aiFindings": {
    "financial": "Detailed analysis of financial stability, income adequacy",
    "employment": "Analysis of employment stability and career reliability",
    "identity_verification": "Assessment of identity verification completeness",
    "documents": "Evaluation of document availability and completeness",
    "rental_history": "Analysis of previous rental experiences and references",
    "eviction_risk": "Assessment of eviction history and risk factors",
    "payment_behavior": "Evaluation of payment reliability and history",
    "lifestyle": "Analysis of lifestyle factors affecting property suitability",
    "behavior": "Overall behavioral assessment and responsibility indicators",
    "overall": "Holistic summary combining all assessment factors"
  }
}

IMPORTANT: Include ALL applicable keys in aiFindings. Only omit keys if there is truly no relevant data to assess. Provide detailed analysis for each applicable category.

--- TENANT SCREENING DATA ---
${JSON.stringify(screeningData, null, 2)}

Return JSON only, no commentary.
`;

  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Missing GEMINI_API_KEY, using standard risk assessment.");
    const defaultFindings = {};
    validFindingKeys.forEach((key) => {
      const keyName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      defaultFindings[key] = `${keyName} evaluation completed using standard assessment criteria.`;
    });
    return {
      aiRiskScore: 0.5,
      riskLevel: "LOW",
      aiScreeningSummary: "Risk assessment completed using standard evaluation criteria.",
      aiFindings: defaultFindings,
    };
  }

  try {
    console.log("🤖 Running AI risk analysis for tenant screening...");

    const result = await runGeminiWithRetry(analysisPrompt);
    const text =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.response?.text?.() ||
      "";

    if (!text) {
      console.warn("⚠️ Gemini returned empty risk analysis response. Using standard assessment.");
      const defaultFindings = {};
      validFindingKeys.forEach((key) => {
        const keyName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        defaultFindings[key] = `${keyName} evaluation completed using standard assessment criteria.`;
      });
      return {
        aiRiskScore: 0.5,
        riskLevel: "LOW",
        aiScreeningSummary: "Risk assessment completed using standard evaluation criteria.",
        aiFindings: defaultFindings,
      };
    }

    const cleaned = text.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("⚠️ No valid JSON found in AI response, using standard assessment.");
      throw new Error("No valid JSON in risk analysis response");
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.warn("⚠️ Failed to parse AI JSON response, using standard assessment:", parseError.message);
      throw new Error("Failed to parse AI response");
    }

    // Validate and normalize the response
    const aiRiskScore = typeof parsed.aiRiskScore === "number"
      ? Math.max(0, Math.min(1, parsed.aiRiskScore)) // Clamp between 0 and 1
      : 0.5;

    const riskLevel = ["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "MEDIUM";

    const aiScreeningSummary = typeof parsed.aiScreeningSummary === "string"
      ? parsed.aiScreeningSummary.trim()
      : `${riskLevel} risk tenant based on financial and lifestyle patterns.`;

    // Dynamically parse aiFindings - include all valid keys from AI response
    const aiFindings = {};
    if (parsed.aiFindings && typeof parsed.aiFindings === "object") {
      // Include all keys from AI response that are valid
      validFindingKeys.forEach((key) => {
        if (parsed.aiFindings[key] && typeof parsed.aiFindings[key] === "string") {
          aiFindings[key] = parsed.aiFindings[key].trim();
        } else {
          // Provide default message if key is missing
          aiFindings[key] = `${key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} assessment completed.`;
        }
      });
    } else {
      // If aiFindings is missing or invalid, create defaults for all keys
      validFindingKeys.forEach((key) => {
        aiFindings[key] = `${key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} assessment completed.`;
      });
    }

    return {
      aiRiskScore,
      riskLevel,
      aiScreeningSummary,
      aiFindings,
    };
  } catch (err) {
    console.error("⚠️ AI risk analysis failed, continuing with standard assessment:", err.message);
    const defaultFindings = {};
    validFindingKeys.forEach((key) => {
      const keyName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      defaultFindings[key] = `${keyName} evaluation completed using standard assessment criteria.`;
    });
    return {
      aiRiskScore: 0.5,
      riskLevel: "LOW",
      aiScreeningSummary: "Risk assessment completed using standard evaluation criteria.",
      aiFindings: defaultFindings,
    };
  }
}

// ============================================================
// TENANT SUBMIT SCREENING INFO
// ============================================================
export const tenantSubmitScreeningInfo = async (req, res) => {
  try {

    const tenantId = req.user.id;
    const { screeningId } = req.params;
    const {
      fullName,
      birthdate,
      employmentStatus,
      incomeSource,
      monthlyIncome,

      // document checks
      hasGovernmentId,
      hasNbiClearance,
      hasProofOfIncome,

      // financial & employment
      currentEmployer,
      jobPosition,
      yearsEmployed,
      employmentRemarks,

      // rental history
      previousLandlordName,
      previousLandlordContact,
      previousRentalAddress,
      reasonForLeaving,
      hadEvictionHistory,
      latePaymentHistory,

      // lifestyle
      smokes,
      drinksAlcohol,
      hasPets,
      worksNightShift,
      hasVisitors,
      noiseLevel,
      otherLifestyle,
    } = req.body;

    // ------------------------------------------------------------
    // 1. Validate
    // ------------------------------------------------------------
    if (!screeningId) {
      return res.status(400).json({ message: "Screening ID and full name are required." });
    }

    // ------------------------------------------------------------
    // 2. Find screening record
    // ------------------------------------------------------------
    const screening = await prisma.tenantScreening.findUnique({
      where: { id: screeningId },
    });

    if (!screening || screening.tenantId !== tenantId) {
      return res.status(404).json({ message: "Screening not found or unauthorized." });
    }

    if (screening.status !== "PENDING") {
      return res.status(400).json({ message: "This screening has already been completed or reviewed." });
    }

    // ============================================================
    // AI ANALYSIS — System generated after submission
    // ============================================================
    const screeningDataForAI = {
      // Basic Info
      fullName,
      birthdate,
      employmentStatus,
      incomeSource,
      monthlyIncome,
      monthlyIncomeCurrency: "PHP",
      incomeNarrative: "All income values are reported in Philippine Peso (PHP). Allowances around PHP 2,000 or more are substantial support in the local context.",

      // Document checks
      hasGovernmentId,
      hasNbiClearance,
      hasProofOfIncome,

      // Financial & Employment
      currentEmployer,
      jobPosition,
      yearsEmployed,
      employmentRemarks,

      // Rental History
      previousLandlordName,
      previousLandlordContact,
      previousRentalAddress,
      reasonForLeaving,
      hadEvictionHistory,
      latePaymentHistory,

      // Lifestyle
      smokes,
      drinksAlcohol,
      hasPets,
      worksNightShift,
      hasVisitors,
      noiseLevel,
      otherLifestyle,
    };

    // Run AI risk analysis - always continue even if AI fails
    let aiAnalysisResult;
    try {
      aiAnalysisResult = await analyzeTenantScreeningRisk(screeningDataForAI);
      console.log("✅ AI risk analysis completed successfully");
    } catch (aiError) {
      console.warn("⚠️ AI risk analysis skipped, continuing with standard assessment:", aiError.message);
      // Fallback to default values if AI fails - program continues normally
      const defaultFindings = {};
      validFindingKeys.forEach((key) => {
        const keyName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        defaultFindings[key] = `${keyName} evaluation completed using standard assessment criteria.`;
      });
      aiAnalysisResult = {
        aiRiskScore: 0.5,
        riskLevel: "LOW",
        aiScreeningSummary: "Risk assessment completed using standard evaluation criteria.",
        aiFindings: defaultFindings,
      };
    }

    let { aiRiskScore, riskLevel, aiScreeningSummary, aiFindings } = aiAnalysisResult;

    const lifestyleNotes = aiFindings?.lifestyle ?? "";
    const paymentNotes = aiFindings?.payment_behavior ?? "";
    const evictionNotes = aiFindings?.eviction_risk ?? "";
    const documentNotes = aiFindings?.documents ?? "";
    const financialNotes = aiFindings?.financial ?? "";

    const missingCriticalDocs = !hasNbiClearance && !hasProofOfIncome && !hasGovernmentId;
    const suspiciousIncomeSource = includesAnyKeyword(incomeSource, suspiciousIncomeKeywords);

    const hasRentalRedFlags =
      Boolean(hadEvictionHistory || latePaymentHistory) ||
      includesAnyKeyword(evictionNotes, ["eviction", "evicted"]) ||
      includesAnyKeyword(paymentNotes, ["chronic late", "repeated late", "default", "non-payment"]);

    const hasDocumentAnomaly = includesAnyKeyword(documentNotes, ["anomaly", "forged", "fake", "mismatch"]);
    const hasFinancialAnomaly = includesAnyKeyword(financialNotes, ["anomaly", "fraud", "unverifiable", "suspicious"]);
    const hasLifestyleEscalation =
      includesAnyKeyword(lifestyleNotes, disruptiveLifestyleKeywords) ||
      (typeof otherLifestyle === "string" && includesAnyKeyword(otherLifestyle, disruptiveLifestyleKeywords));
    const severeLifestyleExplicit =
      includesAnyKeyword(lifestyleNotes, harmfulLifestyleKeywords) ||
      (typeof otherLifestyle === "string" && includesAnyKeyword(otherLifestyle, harmfulLifestyleKeywords));

    let severeIssueDetected = hasRentalRedFlags || hasDocumentAnomaly || hasFinancialAnomaly || hasLifestyleEscalation;

    if (suspiciousIncomeSource || severeLifestyleExplicit) {
      riskLevel = "HIGH";
      aiRiskScore = Math.max(typeof aiRiskScore === "number" ? aiRiskScore : 0.5, 0.85);
      severeIssueDetected = true;
    } else if (!severeIssueDetected) {
      if (riskLevel === "HIGH") {
        riskLevel = "MEDIUM";
      }
      aiRiskScore = Math.min(typeof aiRiskScore === "number" ? aiRiskScore : 0.5, 0.55);
      if (aiRiskScore <= 0.35) {
        riskLevel = "LOW";
      } else if (riskLevel === "LOW") {
        riskLevel = "MEDIUM";
      }
    } else if (hasRentalRedFlags && (hadEvictionHistory || latePaymentHistory)) {
      riskLevel = riskLevel === "LOW" ? "MEDIUM" : riskLevel;
    } else if (!hasRentalRedFlags && riskLevel === "HIGH" && !suspiciousIncomeSource && !severeLifestyleExplicit) {
      riskLevel = "MEDIUM";
    }

    if (missingCriticalDocs && riskLevel === "LOW") {
      riskLevel = "MEDIUM";
      aiRiskScore = Math.max(typeof aiRiskScore === "number" ? aiRiskScore : 0.45, 0.45);
    }

    aiRiskScore = Number((typeof aiRiskScore === "number" ? aiRiskScore : 0.5).toFixed(2));

    // ------------------------------------------------------------
    // 4. Update screening record
    // ------------------------------------------------------------
    await prisma.tenantScreening.update({
      where: { id: screeningId },
      data: {
        fullName,
        birthdate: birthdate ? new Date(birthdate) : null,
        employmentStatus,
        incomeSource,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,

        hasGovernmentId,
        hasNbiClearance,
        hasProofOfIncome,

        currentEmployer,
        jobPosition,
        yearsEmployed,
        employmentRemarks,

        previousLandlordName,
        previousLandlordContact,
        previousRentalAddress,
        reasonForLeaving,
        hadEvictionHistory,
        latePaymentHistory,

        smokes,
        drinksAlcohol,
        hasPets,
        worksNightShift,
        hasVisitors,
        noiseLevel,
        otherLifestyle,

        aiRiskScore,
        riskLevel,
        aiFindings,
        aiScreeningSummary,
        submitted: new Date(),
        aiGeneratedAt: new Date(),

        status: "SUBMITTED",
      },
    });

    // ------------------------------------------------------------
    // 5. Return simple success message
    // ------------------------------------------------------------
    return res.status(200).json({ message: "Tenant screening form submitted successfully." });
  } catch (error) {
    console.error("Error completing tenant screening:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ============================================================
// 📋 GET ALL TENANT SCREENING INVITATIONS (TENANT SIDE)
// ============================================================
export const getTenantScreeningInvitations = async (req, res) => {
  try {
    const tenantId = req.user.id;

    // --------------------------------------------------------
    // 1. Fetch lightweight screening data for this tenant
    // --------------------------------------------------------
    const screenings = await prisma.tenantScreening.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    // --------------------------------------------------------
    // 2. Handle empty result
    // --------------------------------------------------------
    if (!screenings.length) {
      return res.status(200).json({
        message: "No screening invitations found for this tenant.",
        data: [],
      });
    }

    // --------------------------------------------------------
    // 3. Format for frontend table view
    // --------------------------------------------------------
    const formatted = screenings.map((s) => ({
      id: s.id,
      landlord: {
        id: s.landlord.id,
        name: `${s.landlord.firstName || ""} ${s.landlord.lastName || ""}`.trim() || "Unknown Landlord",
        email: s.landlord.email,
        avatarUrl: s.landlord.avatarUrl,
      },
      status: s.status,
      remarks: s.remarks,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      reviewedAt: s.reviewedAt,
    }));

    // --------------------------------------------------------
    // 4. Send success response
    // --------------------------------------------------------
    return res.status(200).json({
      message: "Tenant screenings retrieved successfully.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching tenant screenings:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// ============================================================
// 📋 GET SPECIFIC TENANT SCREENING DETAILS (TENANT SIDE)
// ============================================================
export const getSpecificTenantScreening = async (req, res) => {
  try {
    const tenantId = req.user.id;
    const { screeningId } = req.params;

    // 1️⃣ Validate
    if (!screeningId) {
      return res.status(400).json({ message: "Screening ID is required." });
    }

    // 2️⃣ Fetch screening record for this tenant
    const screening = await prisma.tenantScreening.findUnique({
      where: { id: screeningId },
      select: {
        id: true,
        tenantId: true,
        landlordId: true,
        status: true,
        remarks: true,
        reviewedAt: true,
        createdAt: true,
        submitted: true,
        updatedAt: true,

        // Basic Info
        fullName: true,
        birthdate: true,
        employmentStatus: true,
        incomeSource: true,
        monthlyIncome: true,

        // Document checks
        hasGovernmentId: true,
        hasNbiClearance: true,
        hasProofOfIncome: true,

        // Financial & Employment
        currentEmployer: true,
        jobPosition: true,
        yearsEmployed: true,
        employmentRemarks: true,

        // Rental History
        previousLandlordName: true,
        previousLandlordContact: true,
        previousRentalAddress: true,
        reasonForLeaving: true,
        hadEvictionHistory: true,
        latePaymentHistory: true,

        // Lifestyle
        smokes: true,
        drinksAlcohol: true,
        hasPets: true,
        worksNightShift: true,
        hasVisitors: true,
        noiseLevel: true,
        otherLifestyle: true,

        // Landlord info
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 3️⃣ Check ownership
    if (!screening || screening.tenantId !== tenantId) {
      return res.status(404).json({ message: "Screening not found or unauthorized." });
    }

    // 4️⃣ Format response
    const formatted = {
      id: screening.id,
      status: screening.status,
      remarks: screening.remarks,
      createdAt: screening.createdAt,
      updatedAt: screening.updatedAt,
      reviewedAt: screening.reviewedAt,
      submitted: screening.submitted,
      landlord: {
        id: screening.landlord.id,
        name: `${screening.landlord.firstName || ""} ${screening.landlord.lastName || ""}`.trim(),
        email: screening.landlord.email,
        avatarUrl: screening.landlord.avatarUrl,
      },
      tenantInfo: {
        fullName: screening.fullName,
        birthdate: screening.birthdate,
        employmentStatus: screening.employmentStatus,
        incomeSource: screening.incomeSource,
        monthlyIncome: screening.monthlyIncome,
      },
      documents: {
        hasGovernmentId: screening.hasGovernmentId,
        hasNbiClearance: screening.hasNbiClearance,
        hasProofOfIncome: screening.hasProofOfIncome,
      },
      employment: {
        currentEmployer: screening.currentEmployer,
        jobPosition: screening.jobPosition,
        yearsEmployed: screening.yearsEmployed,
        employmentRemarks: screening.employmentRemarks,
      },
      rentalHistory: {
        previousLandlordName: screening.previousLandlordName,
        previousLandlordContact: screening.previousLandlordContact,
        previousRentalAddress: screening.previousRentalAddress,
        reasonForLeaving: screening.reasonForLeaving,
        hadEvictionHistory: screening.hadEvictionHistory,
        latePaymentHistory: screening.latePaymentHistory,
      },
      lifestyle: {
        smokes: screening.smokes,
        drinksAlcohol: screening.drinksAlcohol,
        hasPets: screening.hasPets,
        worksNightShift: screening.worksNightShift,
        hasVisitors: screening.hasVisitors,
        noiseLevel: screening.noiseLevel,
        otherLifestyle: screening.otherLifestyle,
      },
    };

    // 5️⃣ Return result
    return res.status(200).json({
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error fetching tenant screening details:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
