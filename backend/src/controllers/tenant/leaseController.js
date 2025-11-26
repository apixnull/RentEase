// file: controllers/tenant/leaseController.js
import prisma from "../../libs/prismaClient.js";
import { createNotification } from "../notificationController.js";
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

      // 🧮 Calculate the first due date (next occurrence of dueDay after or on startDate)
      let firstDueDate = new Date(startDate);
      firstDueDate.setDate(dueDay);

      // If the first due date is before the start date, move to next month
      if (firstDueDate < startDate) {
        firstDueDate.setMonth(firstDueDate.getMonth() + 1);
        firstDueDate.setDate(dueDay);
      }

      // 🔍 Check if there's a gap between start date and first due date
      // If lease starts mid-month (e.g., Nov 14) but due date is 1st, 
      // there's a gap period (Nov 14 - Dec 1) that needs a prepayment
      const hasGap = firstDueDate > startDate;

      // 💰 If there's a gap, create a prepayment without amount (landlord decides)
      // This prepayment is for the period between lease start and first due date
      // It's due on the lease start date + 3 days allowance (usually already paid, landlord marks it)
      if (hasGap) {
        const prepaymentDueDate = new Date(startDate);
        prepaymentDueDate.setDate(prepaymentDueDate.getDate() + 3); // Add 3 days allowance
        
        paymentsToCreate.push({
          leaseId,
          amount: 0, // Placeholder - landlord will set the actual prorated amount when marking as paid
          dueDate: prepaymentDueDate, // Due on start date + 3 days
          status: "PENDING",
          timingStatus: null,
          type: "PREPAYMENT", // Indicates this is a prepayment for the gap period
          reminderStage: 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 📅 Create all regular monthly payments from firstDueDate onwards
      if (endDate) {
        // Calculate all due dates from firstDueDate until endDate
        let currentDueDate = new Date(firstDueDate);
        while (currentDueDate <= endDate) {
          paymentsToCreate.push({
            leaseId,
            amount: rent,
            dueDate: new Date(currentDueDate),
            status: "PENDING",
            timingStatus: null,
            type: "RENT",
            reminderStage: 0,
            createdAt: now,
            updatedAt: now,
          });
          
          // Move to next month
          currentDueDate.setMonth(currentDueDate.getMonth() + 1);
          currentDueDate.setDate(dueDay);
        }
      } else {
        // For open-ended leases, create the first month's payment
        paymentsToCreate.push({
          leaseId,
          amount: rent,
          dueDate: new Date(firstDueDate),
          status: "PENDING",
          timingStatus: null,
          type: "RENT",
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

      // 💬 Update chat channel status to ACTIVE if it exists
      const existingChatChannel = await prisma.chatChannel.findUnique({
        where: {
          tenantId_landlordId: {
            tenantId: tenantId,
            landlordId: lease.landlordId,
          },
        },
      });

      // 💾 Transaction
      const transactionPromises = [
        prisma.lease.update({ where: { id: leaseId }, data: leaseUpdateData }),
        prisma.payment.createMany({ data: paymentsToCreate }),
      ];

      // Add chat channel update if it exists
      if (existingChatChannel) {
        transactionPromises.push(
          prisma.chatChannel.update({
            where: { id: existingChatChannel.id },
            data: { status: "ACTIVE" },
          })
        );
      }

      await prisma.$transaction(transactionPromises);

      // Notify landlord that tenant accepted the lease
      await createNotification(
        lease.landlordId,
        "LEASE",
        "Great news! The tenant has accepted the lease agreement. The lease is now active.",
        { leaseId: lease.id, status: "ACTIVE" }
      );

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

      // Notify landlord that tenant rejected the lease
      await createNotification(
        lease.landlordId,
        "LEASE",
        "The tenant has rejected the lease agreement. The lease has been cancelled.",
        { leaseId: lease.id, status: "CANCELLED" }
      );

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
            note: true,
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
