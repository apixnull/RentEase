// file: controllers/tenant/leaseController.js
import prisma from "../../libs/prismaClient.js";
/**
 * @desc Get all leases belonging to the current tenant
 * @route GET /api/tenant/leases
 * @access Private (TENANT)
 */
export const getTenantLeases = async (req, res) => {
  try {
    const tenantId = req.user?.id;

    const leases = await prisma.lease.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        leaseNickname: true,
        leaseType: true,
        interval: true,
        dueDate: true,
        status: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        securityDeposit: true,
        createdAt: true,
        updatedAt: true,

        // --- Property & Unit details
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
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

        // --- Landlord info
        landlord: {
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
    });

    return res.status(200).json(leases);
  } catch (err) {
    console.error("Error fetching tenant leases:", err);
    return res.status(500).json({
      error: "Failed to fetch tenant leases.",
      details: err.message,
    });
  }
};

/**
 * @desc Tenant accepts or rejects a lease
 * @route PATCH /api/tenant/leases/:leaseId/action
 * @access Private (TENANT)
 */
export const handleTenantLeaseAction = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    const { leaseId } = req.params;
    const { action } = req.body; // "accept" or "reject"

    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Must be 'accept' or 'reject'." });
    }

    // 🔍 Find lease and related unit
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      include: { unit: true },
    });

    if (!lease) return res.status(404).json({ message: "Lease not found." });
    if (lease.tenantId !== tenantId) return res.status(403).json({ message: "Unauthorized action." });
    if (lease.status !== "PENDING") return res.status(400).json({ message: "Lease is not pending." });

    const now = new Date();

    if (action === "accept") {
      const startDate = new Date(lease.startDate);
      const endDate = lease.endDate ? new Date(lease.endDate) : null;
      const rent = lease.rentAmount;
      const dueDay = lease.dueDate ?? startDate.getDate();

      const paymentsToCreate = [];

      if (endDate) {
        // 🧮 Calculate full months between start and end
        const durationMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                               (endDate.getMonth() - startDate.getMonth()) + 1;

        for (let i = 0; i < durationMonths; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(startDate.getMonth() + i);
          dueDate.setDate(dueDay);

          paymentsToCreate.push({
            leaseId,
            amount: rent,
            dueDate,
            status: "PENDING",
            timingStatus: null,
            reminderStage: 0,
            createdAt: now,
            updatedAt: now,
          });
        }
      } else {
        // For open-ended leases, create the first month's payment only
        const dueDate = new Date(startDate);
        dueDate.setDate(dueDay);

        paymentsToCreate.push({
          leaseId,
          amount: rent,
          dueDate,
          status: "PENDING",
          timingStatus: null,
          reminderStage: 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 🧾 Update lease
      const leaseUpdateData = {
        status: "ACTIVE",
        updatedAt: now,
      };

      // 🏘️ Update unit
      const unitUpdateData = {
        occupiedById: tenantId,
        occupiedAt: now,
        listedAt: null,
      };

      // 💾 Transaction
      await prisma.$transaction([
        prisma.lease.update({ where: { id: leaseId }, data: leaseUpdateData }),
        prisma.unit.update({ where: { id: lease.unitId }, data: unitUpdateData }),
        prisma.payment.createMany({ data: paymentsToCreate }),
      ]);

      return res.status(200).json({
        message: `Lease accepted and activated. ${paymentsToCreate.length} payments created.`,
        paymentsCreated: paymentsToCreate.length,
      });
    }

    // ❌ REJECT LEASE
    if (action === "reject") {
      await prisma.lease.update({
        where: { id: leaseId },
        data: { status: "CANCELLED", updatedAt: now },
      });

      return res.status(200).json({ message: "Lease has been rejected and cancelled." });
    }
  } catch (err) {
    console.error("Error handling tenant lease action:", err);
    return res.status(500).json({ message: "Failed to process tenant lease action." });
  }
};

/**
 * @desc Get full lease details for tenant
 * @route GET /api/tenant/leases/:leaseId
 * @access Private (TENANT)
 */
export const getLeaseDetails = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    const { leaseId } = req.params;

    if (!tenantId) {
      return res.status(401).json({ message: "Unauthorized: tenant not found." });
    }

    // Retrieve lease including related property, unit, landlord, tenant, and payments
    const lease = await prisma.lease.findUnique({
      where: { id: leaseId },
      select: {
        id: true,
        leaseNickname: true,
        leaseType: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        securityDeposit: true,
        interval: true,
        dueDate: true,
        status: true,
        leaseDocumentUrl: true,
        createdAt: true,
        updatedAt: true,

        // Tenant info
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            gender: true,
            role: true,
            avatarUrl: true,
          },
        },

        // Landlord info
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            gender: true,
            role: true,
            avatarUrl: true,
          },
        },

        // Property details
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

        // Unit details
        unit: {
          select: {
            id: true,
            label: true,
          },
        },

        // All payments related to this lease
        payments: {
          orderBy: { dueDate: "asc" }, // chronological order for tenant view
          select: {
            id: true,
            amount: true,
            dueDate: true,
            paidAt: true,
            method: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            timingStatus: true,
            type: true,
            reminderStage: true,
          },
        },
      },
    });

    if (!lease) {
      return res.status(404).json({ message: "Lease not found." });
    }

    if (lease.tenant.id !== tenantId) {
      return res.status(403).json({ message: "Unauthorized access." });
    }

    return res.status(200).json({ lease });
  } catch (err) {
    console.error("Error retrieving lease details:", err);
    return res.status(500).json({ message: "Failed to retrieve lease details.", details: err.message });
  }
};
