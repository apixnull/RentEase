import prisma from "../../libs/prismaClient.js";

// ----------------------------------------------
// INVITE TENANT FOR SCREENING
// ----------------------------------------------
export const inviteTenantForScreening = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { tenantEmail } = req.body;

    if (!landlordId) {
      return res.status(401).json({ message: "Unauthorized. Landlord ID missing." });
    }

    if (!tenantEmail) {
      return res.status(400).json({ message: "Tenant email is required." });
    }

    const tenant = await prisma.user.findUnique({
      where: { email: tenantEmail },
      select: { id: true, role: true },
    });

    if (!tenant) {
      return res.status(404).json({ message: "No tenant found with that email." });
    }

    if (tenant.role !== "TENANT") {
      return res.status(400).json({ message: "Provided user is not a tenant account." });
    }

    // Prevent inviting tenants already in pending/active lease with this landlord
    const existingLease = await prisma.lease.findFirst({
      where: {
        tenantId: tenant.id,
        status: { in: ["PENDING", "ACTIVE"] },
      },
      select: { id: true, status: true },
    });

    if (existingLease) {
      return res.status(400).json({
        message: "This tenant is already in a pending or active lease.",
      });
    }

    const existing = await prisma.tenantScreening.findFirst({
      where: {
        tenantId: tenant.id,
        landlordId,
        status: "PENDING",
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "A screening invitation is already pending for this tenant.",
      });
    }

    await prisma.tenantScreening.create({
      data: {
        tenantId: tenant.id,
        landlordId,
        fullName: "",
        status: "PENDING",
      },
    });

    return res.status(201).json({
      message: "Tenant screening invitation sent successfully.",
    });
  } catch (error) {
    console.error("Error inviting tenant for screening:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ----------------------------------------------
// LANDLORD REVIEW TENANT SCREENING
// ----------------------------------------------
export const landlordReviewTenantScreening = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { screeningId } = req.params;
    const { action } = req.body;

    // ------------------------------------------------------------
    // 1. Validate request inputs
    // ------------------------------------------------------------
    if (!screeningId || !action) {
      return res.status(400).json({ message: "Screening ID and action are required." });
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use APPROVED or REJECTED." });
    }

    // ------------------------------------------------------------
    // 2. Fetch screening record
    // ------------------------------------------------------------
    const screening = await prisma.tenantScreening.findUnique({
      where: { id: screeningId },
    });

    if (!screening) {
      return res.status(404).json({ message: "Screening not found." });
    }

    if (screening.landlordId !== landlordId) {
      return res.status(403).json({ message: "Unauthorized access to this screening." });
    }

    // ------------------------------------------------------------
    // 3. Validate screening status before review
    // ------------------------------------------------------------
    if (screening.status === "PENDING") {
      return res.status(400).json({ message: "Cannot review a pending screening — tenant has not submitted yet." });
    }

    if (["APPROVED", "REJECTED"].includes(screening.status)) {
      return res.status(400).json({ message: "This screening has already been reviewed." });
    }

    if (screening.status !== "SUBMITTED") {
      return res.status(400).json({ message: "Invalid screening status for review." });
    }

    // ------------------------------------------------------------
    // 4. Auto-generate system remarks
    // ------------------------------------------------------------
    let systemRemarks = "";

    if (action === "APPROVED") {
      systemRemarks =
        "Your screening was approved! The landlord reviewed your details and is ready to move forward.";
    } else if (action === "REJECTED") {
      systemRemarks =
        "Thanks for applying! After careful review we couldn't move forward because the screening requirements were not fully met.";
    }

    // ------------------------------------------------------------
    // 5. Update screening record
    // ------------------------------------------------------------
    await prisma.tenantScreening.update({
      where: { id: screeningId },
      data: {
        status: action,
        remarks: systemRemarks,
        reviewedAt: new Date(),
      },
    });

    // ------------------------------------------------------------
    // 6. Return message only
    // ------------------------------------------------------------
    return res.status(200).json({
      message:
        action === "APPROVED"
          ? "Tenant screening approved successfully."
          : "Tenant screening rejected successfully.",
    });
  } catch (error) {
    console.error("Error reviewing tenant screening:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// ----------------------------------------------
// GET ALL SCREENINGS FOR THIS LANDLORD (TABLE VIEW)
// ----------------------------------------------
export const getLandlordScreeningsList = async (req, res) => {
  try {
    const landlordId = req.user.id;

    // ------------------------------------------------------------
    // Fetch only essential columns for table display
    // ------------------------------------------------------------
    const screenings = await prisma.tenantScreening.findMany({
      where: { landlordId },
      select: {
        id: true,
        tenantId: true,
        landlordId: true,

        // Review / status
        status: true,
        remarks: true,
        reviewedAt: true,

        // AI analysis
        riskLevel: true,

        // Metadata
        createdAt: true,
        updatedAt: true,

        // Minimal tenant details
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // ------------------------------------------------------------
    // Return raw list — frontend will handle grouping/filtering
    // ------------------------------------------------------------
    return res.status(200).json({
      message: "Landlord screenings retrieved successfully.",
      data: screenings,
    });
  } catch (error) {
    console.error("Error fetching landlord screenings:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// ----------------------------------------------
// GET SPECIFIC SCREENING FROM THIS LANDLORD
// ----------------------------------------------
export const getSpeceficScreeningLandlord = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { screeningId } = req.params;

    // ------------------------------------------------------------
    // 1. Validate params
    // ------------------------------------------------------------
    if (!screeningId) {
      return res.status(400).json({ message: "Screening ID is required." });
    }

    // ------------------------------------------------------------
    // 2. Find the screening record (include tenant info)
    // ------------------------------------------------------------
    const screening = await prisma.tenantScreening.findUnique({
      where: { id: screeningId },
      include: {
        tenant: {
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

    if (!screening) {
      return res.status(404).json({ message: "Screening not found." });
    }

    if (screening.landlordId !== landlordId) {
      return res.status(403).json({ message: "Unauthorized access to this screening." });
    }

    // ------------------------------------------------------------
    // 3. Return full screening details
    // ------------------------------------------------------------
    return res.status(200).json({
      message: "Tenant screening retrieved successfully.",
      data: screening,
    });
  } catch (error) {
    console.error("Error retrieving tenant screening:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ----------------------------------------------
// DELETE PENDING SCREENING (HARD DELETE)
// ----------------------------------------------
export const deletePendingScreening = async (req, res) => {
  try {
    const landlordId = req.user.id;
    const { screeningId } = req.params;

    // ------------------------------------------------------------
    // 1. Validate params
    // ------------------------------------------------------------
    if (!screeningId) {
      return res.status(400).json({ message: "Screening ID is required." });
    }

    // ------------------------------------------------------------
    // 2. Find the screening record
    // ------------------------------------------------------------
    const screening = await prisma.tenantScreening.findUnique({
      where: { id: screeningId },
    });

    if (!screening) {
      return res.status(404).json({ message: "Screening not found." });
    }

    if (screening.landlordId !== landlordId) {
      return res.status(403).json({ message: "Unauthorized access to this screening." });
    }

    // ------------------------------------------------------------
    // 3. Only allow deletion of PENDING screenings
    // ------------------------------------------------------------
    if (screening.status !== "PENDING") {
      return res.status(400).json({ 
        message: "Only pending screenings can be deleted. Once submitted, screenings cannot be deleted." 
      });
    }

    // ------------------------------------------------------------
    // 4. Hard delete the screening record
    // ------------------------------------------------------------
    await prisma.tenantScreening.delete({
      where: { id: screeningId },
    });

    // ------------------------------------------------------------
    // 5. Return success message
    // ------------------------------------------------------------
    return res.status(200).json({
      message: "Screening deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting tenant screening:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};