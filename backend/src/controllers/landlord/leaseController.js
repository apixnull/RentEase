import prisma from "../../libs/prismaClient.js";

/**
 * @desc Landlord creates a new lease.
 * Lease starts as PENDING until manually marked ACTIVE.
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
      dueDate,
      securityDeposit,    // Optional field
      leaseDocumentUrl,   // Optional file upload
    } = req.body;

    const landlordId = req.user?.id; // from auth middleware

    // --- Basic validation ---
    if (!landlordId)
      return res.status(401).json({ error: "Unauthorized: landlord not found." });

    if (!propertyId || !unitId || !tenantId || !startDate || !rentAmount || !dueDate)
      return res.status(400).json({ error: "Missing required lease fields." });

    // --- Validate numeric fields ---
    const parsedRent = parseFloat(rentAmount);
    const parsedSecurityDeposit = securityDeposit ? parseFloat(securityDeposit) : null;

    if (isNaN(parsedRent) || parsedRent <= 0)
      return res.status(400).json({ error: "Invalid rent amount." });

    if (securityDeposit && (isNaN(parsedSecurityDeposit) || parsedSecurityDeposit < 0))
      return res.status(400).json({ error: "Invalid security deposit amount." });

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
        rentAmount: parsedRent,
        securityDeposit: parsedSecurityDeposit,
        interval: "MONTHLY", // fixed interval
        dueDate,
        status: "PENDING",
        leaseDocumentUrl: leaseDocumentUrl || null,
      },
      select: {
        id: true,
      },
    });

    return res.status(201).json({
      message: "Lease created successfully and is pending activation.",
      leaseId: newLease.id,
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
        leaseDocumentUrl: true, // keep the digital doc for landlord reference
        createdAt: true,
        updatedAt: true,

        // Property info for frontend filtering
        property: {
          select: {
            id: true,
            title: true,
          },
        },

        // Unit info for frontend filtering
        unit: {
          select: {
            id: true,
            label: true,
          },
        },

        // Tenant minimal info
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      leases,
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
 * @desc Get a specific lease by ID with payments
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
        interval: true,
        securityDeposit: true,
        status: true,
        leaseDocumentUrl: true,
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
            unitCondition: true,
            occupiedAt: true,
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

        // === Payments ===
        payments: {
          orderBy: { dueDate: "asc" },
          select: {
            id: true,
            amount: true,
            dueDate: true,
            paidAt: true,
            method: true,
            status: true,
            timingStatus: true,
            type: true,
            reminderStage: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    return res.status(200).json({ lease });
  } catch (err) {
    console.error("Error fetching lease:", err);
    return res.status(500).json({
      error: "Failed to retrieve lease.",
      details: err.message,
    });
  }
};


/**
 * @desc Retrieve all properties (with at least one available unit) and suggested tenants (excluding those with active/pending leases)
 * @route GET /api/leases/properties-with-units-and-tenants
 */
export const getAllPropertiesWithUnitsAndSuggestedTenants = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    // Fetch properties with at least one AVAILABLE unit (no active/pending leases)
    const properties = await prisma.property.findMany({
      where: {
        ownerId: landlordId,
        Unit: {
          some: {
            Lease: {
              none: { status: { in: ["PENDING", "ACTIVE"] } },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        Unit: {
          where: {
            Lease: {
              none: { status: { in: ["PENDING", "ACTIVE"] } },
            },
          },
          select: {
            id: true,
            label: true,
            unitCondition: true,
          },
          orderBy: { label: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch tenants who have chat channels with this landlord
    // but are NOT already in a lease (pending/active) with the same landlord
    const suggestedTenants = await prisma.user.findMany({
      where: {
        role: "TENANT",
        tenantChannels: { some: { landlordId } },
        tenantLeases: {
          none: {
            landlordId,
            status: { in: ["PENDING", "ACTIVE"] },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        tenantScreening: {
          where: { landlordId },
          select: { riskLevel: true },
        },
      },
      orderBy: { firstName: "asc" },
    });

    // Flatten riskLevel
    const tenantsWithRisk = suggestedTenants.map((tenant) => {
      const riskLevel =
        tenant.tenantScreening?.length && tenant.tenantScreening[0]?.riskLevel
          ? tenant.tenantScreening[0].riskLevel
          : null;

      const { tenantScreening, ...rest } = tenant;
      return { ...rest, riskLevel };
    });

    return res.status(200).json({
      properties,
      suggestedTenants: tenantsWithRisk,
    });
  } catch (err) {
    console.error("Error fetching properties and tenants:", err);
    return res.status(500).json({
      error: "Failed to retrieve properties and tenants.",
      details: err.message,
    });
  }
};


/**
 * @desc Search for a tenant by name or email — used when adding tenant to lease
 * @route GET /api/leases/find-tenant?query=...
 */
export const findTenantForLease = async (req, res) => {
  try {
    const landlordId = req.user?.id; // from middleware
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters." });
    }

    // Search tenants (by first name, last name, or email)
    const tenants = await prisma.user.findMany({
      where: {
        role: "TENANT",
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        tenantScreening: {
          where: { landlordId },
          select: { riskLevel: true },
        },
      },
      take: 10,
      orderBy: { firstName: "asc" },
    });

    // Flatten riskLevel and remove tenantScreening array
    const results = tenants.map((tenant) => {
      const riskLevel =
        tenant.tenantScreening?.length && tenant.tenantScreening[0]?.riskLevel
          ? tenant.tenantScreening[0].riskLevel
          : null;

      // return without tenantScreening array
      const { tenantScreening, ...rest } = tenant;
      return { ...rest, riskLevel };
    });

    return res.status(200).json({
      tenants: results,
    });
  } catch (err) {
    console.error("Error searching for tenant:", err);
    return res.status(500).json({
      error: "Failed to search for tenant.",
      details: err.message,
    });
  }
};

/**
 * @desc Mark a specific payment as PAID
 * @route PATCH /api/payments/:paymentId/mark-paid
 * @access Private (Landlord or Tenant depending on use case)
 */
export const markPaymentAsPaid = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paidAt, method, type, timingStatus } = req.body;

    console.log("🟢 Incoming markPaymentAsPaid request:");
    console.log("paymentId:", paymentId);
    console.log("Body:", { paidAt, method, type, timingStatus });

    // --- Basic validation ---
    if (!paidAt || !method || !type || !timingStatus) {
      return res.status(400).json({
        error: "Missing required fields: paidAt, method, type, timingStatus",
      });
    }

    // --- Validate paidAt date ---
    const parsedPaidAt = new Date(paidAt);
    if (isNaN(parsedPaidAt.getTime())) {
      return res.status(400).json({ error: "Invalid paidAt date." });
    }

    // --- Check if payment exists ---
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // --- Update the payment record ---
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paidAt: parsedPaidAt,
        method,
        type,
        timingStatus,
        status: "PAID",
      },
    });

    console.log("✅ Payment updated:", updatedPayment);

    return res.status(200).json({
      message: "Payment marked as paid successfully.",
    });
  } catch (err) {
    console.error("🔥 Error marking payment as paid:", err);
    return res.status(500).json({
      error: "Failed to mark payment as paid.",
      details: err.message,
    });
  }
};
