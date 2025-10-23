import prisma from "../../libs/prismaClient.js";

/**
 * @desc Landlord creates a new lease.
 * Lease starts as PENDING until tenant signs.
 */
export const createLease = async (req, res) => {
  try {
    const {
      propertyId,
      unitId,
      tenantId,
      leaseNickname,
      leaseType,
      startDate,
      endDate,
      rentAmount,
      securityDeposit,
      advanceMonths,
      interval,
      dueDate,
      leaseDocumentUrl,      // THIS WILL BE A FILE 
      landlordSignatureUrl,   // THIS WILL BE A FILE
    } = req.body;

    const landlordId = req.user?.id; // from auth middleware

    // --- Basic validation ---
    if (!landlordId)
      return res.status(401).json({ error: "Unauthorized: landlord not found." });

    if (!propertyId || !unitId || !tenantId || !startDate || !rentAmount || !dueDate)
      return res.status(400).json({ error: "Missing required lease fields." });

    // --- Create Lease record ---
    const newLease = await prisma.lease.create({
      data: {
        propertyId,
        unitId,
        tenantId,
        landlordId,
        leaseNickname: leaseNickname || null,
        leaseType: leaseType || "STANDARD",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        rentAmount: parseFloat(rentAmount),
        securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
        advanceMonths: advanceMonths ?? 0,
        interval: interval || "MONTHLY",
        dueDate,
        status: "PENDING",

        // --- Digital Docs (optional) ---
        leaseDocumentUrl: leaseDocumentUrl || null,
        landlordSignatureUrl: landlordSignatureUrl || null,
      },
      include: {
        tenant: true,
        landlord: true,
        property: true,
        unit: true,
      },
    });

    return res.status(201).json({
      message: "Lease created successfully and is pending tenant signature.",
    });
  } catch (err) {
    console.error("Error creating lease:", err);
    return res.status(500).json({
      error: "Failed to create lease.",
      details: err.message,
    });
  }
};


/**
 * @desc Retrieve all leases for a landlord (all statuses)
 * @route GET /api/leases
 */
export const getAllLeases = async (req, res) => {
  try {
    const landlordId = req.user.id; // handled by middleware

    const leases = await prisma.lease.findMany({
      where: { landlordId },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        tenantId: true,
        landlordId: true,
        leaseNickname: true,
        leaseType: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        dueDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        // Property: include id + title for frontend filters
        property: {
          select: {
            id: true,
            title: true,
          },
        },

        // Unit: include id + label for filtering
        unit: {
          select: {
            id: true,
            label: true,
          },
        },

        // Tenant: minimal info
        tenant: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "All leases retrieved successfully.",
    });
  } catch (err) {
    console.error("Error fetching leases:", err);
    return res.status(500).json({
      error: "Failed to fetch leases.",
      details: err.message,
    });
  }
};


/**
 * @desc Get a specific lease by ID
 * @route GET /api/leases/:id
 */
export const getLeaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const lease = await prisma.lease.findUnique({
      where: { id },
      select: {
        // === Core Lease Fields ===
        id: true,
        propertyId: true,
        unitId: true,
        tenantId: true,
        landlordId: true,
        leaseNickname: true,
        leaseType: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        dueDate: true,
        status: true,
        leaseDocumentUrl: true,
        landlordSignatureUrl: true,
        tenantSignatureUrl: true,
        createdAt: true,
        updatedAt: true,

        // === Related Property ===
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

        // === Related Unit ===
        unit: {
          select: {
            id: true,
            label: true,
            description: true,
            status: true,
            floorNumber: true,
            mainImageUrl: true,
          },
        },

        // === Tenant Info ===
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    return res.status(200).json({
      lease,
    });
  } catch (err) {
    console.error("Error fetching lease:", err);
    return res.status(500).json({
      error: "Failed to retrieve lease.",
      details: err.message,
    });
  }
};
