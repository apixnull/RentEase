import prisma from "../../libs/prismaClient.js";

// ----------------------------------------------
// TENANT SUBMIT SCREENING INFO
// ----------------------------------------------
export const tenantSubmitScreeningInfo = async (req, res) => {
  try {
        // 🔍 Debugging logs
    console.log("🟢 tenantSubmitScreeningInfo called");
    console.log("➡️  req.params:", req.params);
    console.log("➡️  req.user:", req.user);
    console.log("➡️  req.body:", req.body);


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

    // ------------------------------------------------------------
    // 3. Mock AI risk analysis (simple placeholder logic)
    // ------------------------------------------------------------
    let aiRiskScore = 0.5;
    let riskLevel = "MEDIUM";
    const aiFindings = {
      financial: "Moderate income stability detected.",
      behavior: "No major lifestyle red flags identified.",
    };

    if (monthlyIncome && monthlyIncome > 50000) {
      aiRiskScore = 0.2;
      riskLevel = "LOW";
      aiFindings.financial = "Strong income source, low financial risk.";
    } else if (monthlyIncome && monthlyIncome < 10000) {
      aiRiskScore = 0.8;
      riskLevel = "HIGH";
      aiFindings.financial = "Low income may affect payment reliability.";
    }

    if (hadEvictionHistory || latePaymentHistory) {
      aiRiskScore = Math.min(1, aiRiskScore + 0.2);
      riskLevel = "HIGH";
      aiFindings.behavior = "Negative rental history detected.";
    }

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
        aiScreeningSummary: `${riskLevel} risk tenant based on financial and lifestyle patterns.`,
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
