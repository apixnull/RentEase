import prisma from "../../libs/prismaClient.js";
import supabase from "../../libs/supabaseClient.js";

/**
 * Helper function to compute tenant behavior metrics from payments and maintenance requests
 * @param {string} leaseId - The lease ID
 * @param {string} tenantId - The tenant ID
 * @param {string} propertyId - The property ID
 * @param {string} unitId - The unit ID
 * @returns {Promise<Object>} Computed metrics
 */
async function computeTenantBehaviorMetrics(leaseId, tenantId, propertyId, unitId) {
  try {
    // Get all paid payments with timing status
    const paidPayments = await prisma.payment.findMany({
      where: {
        leaseId,
        status: 'PAID',
        timingStatus: { not: null },
      },
    });

    // Calculate payment metrics
    let paymentReliability = null;
    let paymentBehavior = null;

    if (paidPayments.length > 0) {
      // Calculate payment reliability
      const onTimeCount = paidPayments.filter(p => p.timingStatus === 'ONTIME').length;
      paymentReliability = onTimeCount / paidPayments.length;

      // Determine dominant payment behavior
      const timingCounts = {
        ONTIME: paidPayments.filter(p => p.timingStatus === 'ONTIME').length,
        LATE: paidPayments.filter(p => p.timingStatus === 'LATE').length,
        ADVANCE: paidPayments.filter(p => p.timingStatus === 'ADVANCE').length,
      };

      const maxCount = Math.max(timingCounts.ONTIME, timingCounts.LATE, timingCounts.ADVANCE);
      
      // Count how many statuses have the max count (for tie detection)
      const tiedStatuses = [];
      if (timingCounts.ONTIME === maxCount) tiedStatuses.push('ONTIME');
      if (timingCounts.LATE === maxCount) tiedStatuses.push('LATE');
      if (timingCounts.ADVANCE === maxCount) tiedStatuses.push('ADVANCE');

      if (tiedStatuses.length > 1) {
        paymentBehavior = 'MIXED'; // True tie
      } else {
        paymentBehavior = tiedStatuses[0]; // Dominant pattern
      }
    }

    // Count maintenance requests
    const maintenanceRequestsCount = await prisma.maintenanceRequest.count({
      where: {
        reporterId: tenantId,
        propertyId: propertyId,
        unitId: unitId,
      },
    });

    return {
      paymentReliability,
      paymentBehavior,
      maintenanceRequestsCount,
    };
  } catch (err) {
    console.error(`❌ Error computing tenant behavior metrics for lease ${leaseId}:`, err);
    return {
      paymentReliability: null,
      paymentBehavior: null,
      maintenanceRequestsCount: 0,
    };
  }
}

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
            type: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
          },
        },

        // Unit info for frontend filtering
        unit: {
          select: {
            id: true,
            label: true,
          },
        },

        // Tenant info
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
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
        landlordNotes: true,
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
            note: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    // Compute tenant behavior metrics on the fly
    const behaviorMetrics = await computeTenantBehaviorMetrics(
      lease.id,
      lease.tenantId,
      lease.propertyId,
      lease.unitId
    );

    // Add computed metrics and landlordNotes to lease response
    const leaseWithMetrics = {
      ...lease,
      behaviorMetrics: {
        paymentBehavior: behaviorMetrics.paymentBehavior,
        paymentReliability: behaviorMetrics.paymentReliability,
        maintenanceRequestsCount: behaviorMetrics.maintenanceRequestsCount,
      },
    };

    return res.status(200).json({ lease: leaseWithMetrics });
  } catch (err) {
    console.error("Error fetching lease:", err);
    return res.status(500).json({
      error: "Failed to retrieve lease.",
      details: err.message,
    });
  }
};


/**
 * @desc Get all properties with all units (for lease editing - includes units with pending/active leases)
 * @route GET /api/landlord/lease/properties-with-units
 * @access Private (LANDLORD)
 */
export const getAllPropertiesWithUnits = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
        Unit: {
          select: {
            id: true,
            label: true,
            unitCondition: true,
          },
          orderBy: {
            label: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ properties });
  } catch (err) {
    console.error("Error fetching properties with units:", err);
    return res.status(500).json({
      error: "Failed to fetch properties.",
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
 * @desc Create a new payment record for a lease
 * @route POST /api/leases/:leaseId/payments
 * @access Private (Landlord)
 */
export const createPayment = async (req, res) => {
  try {
    const { leaseId } = req.params;
    const { amount, dueDate, paidAt, method, type, status, timingStatus, note } = req.body;

    console.log("🟢 Incoming createPayment request:");
    console.log("leaseId:", leaseId);
    console.log("Body:", { amount, dueDate, paidAt, method, type, status, timingStatus, note });

    // --- Basic validation ---
    if (!amount || !dueDate || !type) {
      return res.status(400).json({
        error: "Missing required fields: amount, dueDate, type",
      });
    }

    // --- Validate numeric fields ---
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount." });
    }

    // --- Validate dates ---
    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return res.status(400).json({ error: "Invalid dueDate." });
    }

    let parsedPaidAt = null;
    if (paidAt) {
      parsedPaidAt = new Date(paidAt);
      if (isNaN(parsedPaidAt.getTime())) {
        return res.status(400).json({ error: "Invalid paidAt date." });
      }
    }

    // --- Check if lease exists and belongs to landlord ---
    const landlordId = req.user?.id;
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: {
        property: { select: { id: true } },
        unit: { select: { id: true } },
        tenant: { select: { firstName: true, lastName: true } },
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res.status(403).json({ error: "Unauthorized: You don't have access to this lease." });
    }

    // --- Determine payment status ---
    const paymentStatus = status || (parsedPaidAt ? "PAID" : "PENDING");

    // --- Validate timingStatus if provided ---
    if (timingStatus && !["ONTIME", "LATE", "ADVANCE"].includes(timingStatus)) {
      return res.status(400).json({ error: "Invalid timingStatus. Must be ONTIME, LATE, or ADVANCE." });
    }

    // --- Create payment data ---
    const paymentData = {
      leaseId,
      amount: parsedAmount,
      dueDate: parsedDueDate,
      type,
      status: paymentStatus,
      method: paymentStatus === "PAID" ? (method || null) : null,
      paidAt: paymentStatus === "PAID" ? parsedPaidAt : null,
      timingStatus: paymentStatus === "PAID" ? (timingStatus || null) : null,
      reminderStage: 0,
      note: note || null,
    };

    // --- If payment is PAID, create transaction as well ---
    if (paymentStatus === "PAID") {
      // --- Determine transaction category based on payment type ---
      let transactionCategory = "RENT"; // Default to RENT
      if (type === "RENT" || type === "ADVANCE_PAYMENT" || type === "PREPAYMENT") {
        transactionCategory = "RENT";
      } else {
        // For other payment types (PENALTY, ADJUSTMENT, etc.), use OTHER_INCOME
        transactionCategory = "OTHER_INCOME";
      }

      // --- Create transaction description ---
      const tenantName = lease.tenant
        ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
        : "Tenant";
      const transactionDescription = `${tenantName} payment`;

      // --- Create payment and transaction in a single transaction ---
      const [newPayment] = await prisma.$transaction([
        prisma.payment.create({
          data: paymentData,
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
            note: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.transaction.create({
          data: {
            propertyId: lease.property.id,
            unitId: lease.unit.id,
            amount: parsedAmount,
            description: transactionDescription,
            type: "INCOME",
            category: transactionCategory,
            date: parsedPaidAt,
            recurringInterval: null,
          },
        }),
      ]);

      console.log("✅ Payment created with transaction:", newPayment);

      return res.status(201).json({
        message: "Payment record created successfully.",
        payment: newPayment,
      });
    } else {
      // --- Create payment only (status is PENDING) ---
      const newPayment = await prisma.payment.create({
        data: paymentData,
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
          note: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log("✅ Payment created:", newPayment);

      return res.status(201).json({
        message: "Payment record created successfully.",
        payment: newPayment,
      });
    }
  } catch (err) {
    console.error("🔥 Error creating payment:", err);
    return res.status(500).json({
      error: "Failed to create payment record.",
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
    const { paidAt, method, type, timingStatus, amount } = req.body;

    console.log("🟢 Incoming markPaymentAsPaid request:");
    console.log("paymentId:", paymentId);
    console.log("Body:", { paidAt, method, type, timingStatus, amount });

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

    // --- Check if payment exists and fetch lease info ---
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        lease: {
          include: {
            property: { select: { id: true } },
            unit: { select: { id: true } },
            tenant: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // --- Validate amount if provided (for prepayments with amount 0) ---
    let updateData = {
      paidAt: parsedPaidAt,
      method,
      type,
      timingStatus,
      status: "PAID",
    };

    let finalAmount = payment.amount;
    if (amount !== undefined) {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ error: "Invalid amount." });
      }
      updateData.amount = parsedAmount;
      finalAmount = parsedAmount;
    }

    // --- Determine transaction category based on payment type ---
    let transactionCategory = "RENT"; // Default to RENT
    if (type === "RENT" || type === "ADVANCE_PAYMENT" || type === "PREPAYMENT") {
      transactionCategory = "RENT";
    } else {
      // For other payment types (PENALTY, ADJUSTMENT, etc.), use OTHER_INCOME
      transactionCategory = "OTHER_INCOME";
    }

    // --- Create transaction description ---
    const tenantName = payment.lease.tenant
      ? `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`
      : "Tenant";
    const transactionDescription = `${tenantName} payment`;

    // --- Update the payment record and create transaction ---
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: updateData,
      }),
      prisma.transaction.create({
        data: {
          propertyId: payment.lease.property.id,
          unitId: payment.lease.unit.id,
          amount: finalAmount,
          description: transactionDescription,
          type: "INCOME",
          category: transactionCategory,
          date: parsedPaidAt,
          recurringInterval: null,
        },
      }),
    ]);

    console.log("✅ Payment updated and transaction created");

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

/**
* @desc Retrieve payments for the selected month or whole year (defaults to current month)
* @route GET /api/landlord/payments/list?month=11&year=2025&scope=month|year
 * @access Private (Landlord)
 */
export const getLandlordMonthlyPayments = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const now = new Date();
    const parsedMonth = parseInt(req.query.month, 10);
    const parsedYear = parseInt(req.query.year, 10);

    const scopeParam = (req.query.scope || "month").toString().toLowerCase();
    const fetchAllTime = scopeParam === "all";
    const fetchEntireYear = scopeParam === "year";

    const targetMonth =
      !isNaN(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12
        ? parsedMonth - 1
        : now.getMonth();
    const targetYear = !isNaN(parsedYear) ? parsedYear : now.getFullYear();

    const rangeStart = fetchAllTime
      ? null
      : fetchEntireYear
        ? new Date(targetYear, 0, 1, 0, 0, 0, 0)
        : new Date(targetYear, targetMonth, 1, 0, 0, 0, 0);
    const rangeEnd = fetchAllTime
      ? null
      : fetchEntireYear
        ? new Date(targetYear, 12, 0, 23, 59, 59, 999)
        : new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // First, get all ACTIVE leases for this landlord
    const leases = await prisma.lease.findMany({
      where: {
        landlordId,
        status: "ACTIVE", // Only query ACTIVE leases
      },
      select: {
        id: true,
      },
    });

    const leaseIds = leases.map((lease) => lease.id);

    // Then, get all payments from those leases for the selected range
    const payments = await prisma.payment.findMany({
      where: {
        leaseId: {
          in: leaseIds,
        },
        ...(fetchAllTime
          ? {}
          : {
              dueDate: {
                gte: rangeStart,
                lte: rangeEnd,
              },
            }),
      },
      select: {
        id: true,
        leaseId: true,
        amount: true,
        dueDate: true,
        paidAt: true,
        method: true,
        status: true,
        timingStatus: true,
        type: true,
        reminderStage: true,
        note: true,
        createdAt: true,
        updatedAt: true,
        lease: {
          select: {
            id: true,
            leaseNickname: true,
            status: true,
            rentAmount: true,
            interval: true,
            dueDate: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                type: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
            unit: {
              select: {
                id: true,
                label: true,
              },
            },
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { dueDate: "asc" },
      ],
    });

    const propertyMap = new Map();
    const unitMap = new Map();
    const leaseMap = new Map();

    payments.forEach((payment) => {
      const property = payment.lease?.property;
      if (property && !propertyMap.has(property.id)) {
        propertyMap.set(property.id, {
          id: property.id,
          title: property.title,
        });
      }

      const unit = payment.lease?.unit;
      if (unit && !unitMap.has(unit.id)) {
        unitMap.set(unit.id, {
          id: unit.id,
          label: unit.label,
          propertyId: property?.id || null,
        });
      }

      const lease = payment.lease;
      if (lease && !leaseMap.has(lease.id)) {
        leaseMap.set(lease.id, {
          id: lease.id,
          label:
            lease.leaseNickname ||
            `${lease.tenant?.firstName ?? ""} ${lease.tenant?.lastName ?? ""}`.trim() ||
            `Lease ${lease.id.slice(0, 6)}`,
          propertyId: property?.id || null,
          tenantName: lease.tenant
            ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
            : null,
        });
      }
    });

    return res.status(200).json({
      meta: {
        month: fetchAllTime || fetchEntireYear ? null : targetMonth + 1,
        year: fetchAllTime ? null : targetYear,
        scope: fetchAllTime ? "all" : fetchEntireYear ? "year" : "month",
        start: rangeStart ? rangeStart.toISOString() : null,
        end: rangeEnd ? rangeEnd.toISOString() : null,
      },
      filters: {
        properties: Array.from(propertyMap.values()),
        units: Array.from(unitMap.values()),
        leases: Array.from(leaseMap.values()),
      },
      payments,
    });
  } catch (err) {
    console.error("Error fetching monthly payments:", err);
    return res.status(500).json({
      error: "Failed to fetch payments.",
      details: err.message,
    });
  }
};

/**
 * @desc Cancel a pending lease before activation
 * @route PATCH /api/landlord/lease/:id/cancel
 * @access Private (Landlord)
 */
export const cancelLease = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      select: {
        landlordId: true,
        status: true,
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to cancel this lease." });
    }

    if (lease.status !== "PENDING") {
      return res.status(400).json({
        error: "Only pending leases can be cancelled.",
      });
    }

    await prisma.$transaction([
      prisma.payment.deleteMany({
        where: { leaseId: id },
      }),
      prisma.lease.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
    ]);

    return res.status(200).json({
      message: "Lease cancelled successfully.",
    });
  } catch (err) {
    console.error("Error cancelling lease:", err);
    return res.status(500).json({
      error: "Failed to cancel lease.",
      details: err.message,
    });
  }
};

/**
 * @desc Terminate a lease early (locks further edits & payments)
 * @route PATCH /api/landlord/lease/:id/terminate
 * @access Private (Landlord)
 */
export const terminateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const lease = await prisma.lease.findUnique({
      where: { id },
      select: {
        landlordId: true,
        status: true,
        endDate: true,
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to terminate this lease." });
    }

    if (lease.status === "TERMINATED") {
      return res
        .status(400)
        .json({ error: "Lease has already been terminated." });
    }

    if (["CANCELLED", "COMPLETED"].includes(lease.status)) {
      return res.status(400).json({
        error: `Lease is already ${lease.status.toLowerCase()} and cannot be terminated.`,
      });
    }

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: {
          leaseId: id,
          status: "PENDING",
        },
        data: {
          reminderStage: 0,
        },
      }),
      prisma.lease.update({
        where: { id },
        data: {
          status: "TERMINATED",
          endDate: lease.endDate ?? new Date(),
        },
      }),
    ]);

    return res
      .status(200)
      .json({ message: "Lease terminated and locked successfully." });
  } catch (err) {
    console.error("Error terminating lease:", err);
    return res.status(500).json({
      error: "Failed to terminate lease.",
      details: err.message,
    });
  }
};

/**
 * @desc Update a pending lease (only PENDING leases can be edited)
 * @route PATCH /api/landlord/lease/:id/update
 * @access Private (Landlord)
 */
export const updateLease = async (req, res) => {
  try {
    const { id } = req.params;
    const landlordId = req.user?.id;
    const {
      propertyId,
      unitId,
      leaseNickname,
      leaseType,
      startDate,
      endDate,
      rentAmount,
      dueDate,
      securityDeposit,
      leaseDocumentUrl,
    } = req.body;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if lease exists and belongs to landlord
    const lease = await prisma.lease.findUnique({
      where: { id },
      select: {
        landlordId: true,
        status: true,
        tenantId: true, // Keep tenant ID unchanged
        leaseDocumentUrl: true, // Get current document URL to delete if needed
      },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res
        .status(403)
        .json({ error: "You do not have permission to update this lease." });
    }

    // Only allow editing PENDING leases
    if (lease.status !== "PENDING") {
      return res.status(400).json({
        error: "Only pending leases can be edited.",
      });
    }

    // Validate required fields
    if (!propertyId || !unitId || !startDate || !rentAmount || !dueDate) {
      return res.status(400).json({ error: "Missing required lease fields." });
    }

    // Validate numeric fields
    const parsedRent = parseFloat(rentAmount);
    const parsedSecurityDeposit = securityDeposit ? parseFloat(securityDeposit) : null;

    if (isNaN(parsedRent) || parsedRent <= 0) {
      return res.status(400).json({ error: "Invalid rent amount." });
    }

    if (securityDeposit && (isNaN(parsedSecurityDeposit) || parsedSecurityDeposit < 0)) {
      return res.status(400).json({ error: "Invalid security deposit amount." });
    }

    // Delete old document if a new one is provided
    if (leaseDocumentUrl && lease.leaseDocumentUrl && leaseDocumentUrl !== lease.leaseDocumentUrl) {
      try {
        // Extract file path from the old document URL
        // Example: https://...supabase.co/storage/v1/object/public/rentease-images/lease-documents/filename.pdf
        const baseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/rentease-images/`;
        if (lease.leaseDocumentUrl.startsWith(baseUrl)) {
          const oldPath = lease.leaseDocumentUrl.replace(baseUrl, ""); // gives "lease-documents/filename.pdf"

          if (oldPath) {
            const { error } = await supabase.storage
              .from("rentease-images")
              .remove([oldPath]);

            if (error) {
              console.warn("⚠️ Supabase delete error:", error.message);
            } else {
              console.log(`✅ Old lease document deleted: ${oldPath}`);
            }
          }
        }
      } catch (delErr) {
        console.warn("⚠️ Failed to delete old lease document:", delErr.message);
        // Don't fail the update if deletion fails, just log it
      }
    }

    // Update lease record (tenantId and landlordId remain unchanged)
    await prisma.lease.update({
      where: { id },
      data: {
        propertyId,
        unitId,
        leaseNickname: leaseNickname || null,
        leaseType: leaseType || "STANDARD",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        rentAmount: parsedRent,
        securityDeposit: parsedSecurityDeposit,
        dueDate,
        leaseDocumentUrl: leaseDocumentUrl || null,
      },
    });

    return res.status(200).json({
      message: "Lease updated successfully.",
    });
  } catch (err) {
    console.error("Error updating lease:", err);
    return res.status(500).json({
      error: "Failed to update lease.",
      details: err.message,
    });
  }
};

/**
 * @desc Add a landlord note to lease
 * @route POST /api/landlord/lease/:leaseId/behavior/notes
 * @access Private (LANDLORD)
 */
export const addLandlordNote = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { leaseId } = req.params;
    const { note, category } = req.body;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    if (!note || !category) {
      return res.status(400).json({ error: "Missing required fields: note and category." });
    }

    const validCategories = ['CLEANLINESS', 'NOISE', 'BEHAVIOR', 'COMMUNICATION', 'PROPERTY_DAMAGE', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category. Must be one of: " + validCategories.join(', ') });
    }

    // Verify lease belongs to this landlord
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { landlordId: true, landlordNotes: true },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res.status(403).json({ error: "Unauthorized: you don't have access to this lease." });
    }

    const newNote = {
      date: new Date().toISOString(),
      note: note.trim(),
      category,
    };

    // Get existing notes or initialize empty array
    const existingNotes = lease.landlordNotes || [];
    const updatedNotes = [...existingNotes, newNote];

    // Update lease with new note
    await prisma.lease.update({
      where: { id: leaseId },
      data: { landlordNotes: updatedNotes },
    });

    return res.status(200).json({
      message: "Note added successfully.",
      note: newNote,
    });
  } catch (err) {
    console.error("Error adding landlord note:", err);
    return res.status(500).json({
      error: "Failed to add note.",
      details: err.message,
    });
  }
};

/**
 * @desc Update a landlord note in lease
 * @route PATCH /api/landlord/lease/:leaseId/behavior/notes/:noteIndex
 * @access Private (LANDLORD)
 */
export const updateLandlordNote = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { leaseId, noteIndex } = req.params;
    const { note, category } = req.body;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    if (!note || !category) {
      return res.status(400).json({ error: "Missing required fields: note and category." });
    }

    const validCategories = ['CLEANLINESS', 'NOISE', 'BEHAVIOR', 'COMMUNICATION', 'PROPERTY_DAMAGE', 'OTHER'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category. Must be one of: " + validCategories.join(', ') });
    }

    const index = parseInt(noteIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ error: "Invalid note index." });
    }

    // Verify lease belongs to this landlord
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { landlordId: true, landlordNotes: true },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res.status(403).json({ error: "Unauthorized: you don't have access to this lease." });
    }

    if (!lease.landlordNotes || !Array.isArray(lease.landlordNotes)) {
      return res.status(404).json({ error: "No notes found." });
    }

    const notes = lease.landlordNotes;
    if (index >= notes.length) {
      return res.status(404).json({ error: "Note index out of range." });
    }

    // Update the note (preserve original date)
    const updatedNotes = [...notes];
    updatedNotes[index] = {
      ...updatedNotes[index],
      note: note.trim(),
      category,
    };

    await prisma.lease.update({
      where: { id: leaseId },
      data: { landlordNotes: updatedNotes },
    });

    return res.status(200).json({
      message: "Note updated successfully.",
      note: updatedNotes[index],
    });
  } catch (err) {
    console.error("Error updating landlord note:", err);
    return res.status(500).json({
      error: "Failed to update note.",
      details: err.message,
    });
  }
};

/**
 * @desc Delete a landlord note from lease
 * @route DELETE /api/landlord/lease/:leaseId/behavior/notes/:noteIndex
 * @access Private (LANDLORD)
 */
export const deleteLandlordNote = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { leaseId, noteIndex } = req.params;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const index = parseInt(noteIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({ error: "Invalid note index." });
    }

    // Verify lease belongs to this landlord
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: { landlordId: true, landlordNotes: true },
    });

    if (!lease) {
      return res.status(404).json({ error: "Lease not found." });
    }

    if (lease.landlordId !== landlordId) {
      return res.status(403).json({ error: "Unauthorized: you don't have access to this lease." });
    }

    if (!lease.landlordNotes || !Array.isArray(lease.landlordNotes)) {
      return res.status(404).json({ error: "No notes found." });
    }

    const notes = lease.landlordNotes;
    if (index >= notes.length) {
      return res.status(404).json({ error: "Note index out of range." });
    }

    // Remove the note
    const updatedNotes = notes.filter((_, i) => i !== index);

    await prisma.lease.update({
      where: { id: leaseId },
      data: { landlordNotes: updatedNotes.length > 0 ? updatedNotes : null },
    });

    return res.status(200).json({
      message: "Note deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting landlord note:", err);
    return res.status(500).json({
      error: "Failed to delete note.",
      details: err.message,
    });
  }
};