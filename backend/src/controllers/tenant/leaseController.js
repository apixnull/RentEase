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
      // Ensure dueDay is valid (1-28)
      const validDueDay = Math.min(dueDay, 28);
      
      let firstDueDate = new Date(startDate);
      firstDueDate.setDate(validDueDay);

      // If the first due date is before the start date, move to next month
      if (firstDueDate < startDate) {
        firstDueDate.setMonth(firstDueDate.getMonth() + 1);
        firstDueDate.setDate(validDueDay);
      }

      // 🔍 Check if there's a gap between start date and first due date
      // If lease starts mid-month (e.g., Nov 14) but due date is 1st, 
      // there's a gap period (Nov 14 - Dec 1) that needs a prepayment
      const hasGap = firstDueDate > startDate;

      // 💰 If there's a gap, create a prepayment for the prorated first month
      // This prepayment is for the period between lease start and first due date
      // It's due on the lease start date + 3 days allowance
      if (hasGap) {
        const prepaymentDueDate = new Date(startDate);
        prepaymentDueDate.setDate(prepaymentDueDate.getDate() + 3); // Add 3 days allowance
        
        // Calculate prorated amount if due date is 1st and start date is not 1st
        let proratedAmount = 0;
        if (validDueDay === 1 && startDate.getDate() !== 1) {
          const startDay = startDate.getDate();
          const year = startDate.getFullYear();
          const month = startDate.getMonth();
          
          // Get total days in the start month
          const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
          
          // Calculate days from start date to end of month (inclusive)
          const daysInPartialMonth = totalDaysInMonth - startDay + 1;
          
          // Calculate prorated amount: (days in partial month / total days) * monthly rent
          proratedAmount = (daysInPartialMonth / totalDaysInMonth) * rent;
          proratedAmount = Math.round(proratedAmount * 100) / 100; // Round to 2 decimal places
        }
        
        paymentsToCreate.push({
          leaseId,
          amount: proratedAmount, // Use calculated prorated amount, or 0 if not applicable
          dueDate: prepaymentDueDate, // Due on start date + 3 days
          status: "PENDING",
          timingStatus: null,
          type: "PREPAYMENT", // Indicates this is a prepayment for the gap period
          reminderStage: 0,
          createdAt: now,
          updatedAt: now,
        });
      }

      // 📅 Create exactly the number of monthly payments equal to lease term
      // Industry Standard Approach: Calculate lease term in months and create exactly that many payments
      // This is how AppFolio, Buildium, and other major PM systems handle it
      if (endDate) {
        // Normalize dates to midnight for accurate comparison
        const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const normalizedFirstDue = new Date(firstDueDate.getFullYear(), firstDueDate.getMonth(), firstDueDate.getDate());
        
        // Industry Standard: Calculate lease term in months
        // Method: Count the number of calendar months the lease spans
        // For Dec 1, 2025 to Feb 28, 2026: Dec, Jan, Feb = 3 months
        const startYear = normalizedStart.getFullYear();
        const startMonth = normalizedStart.getMonth();
        const endYear = normalizedEnd.getFullYear();
        const endMonth = normalizedEnd.getMonth();
        
        // Calculate the number of full calendar months between start and end
        // This represents the lease term (e.g., 3 months = 3 payments)
        let leaseTermMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
        
        // The +1 accounts for including both the start and end months
        // Example: Dec (month 11) to Feb (month 1) = (1*12) + (1-11) + 1 = 12 - 10 + 1 = 3 ✓
        
        // IMPORTANT: If we created a PREPAYMENT (hasGap), it counts as one of the lease term payments
        // So we need to reduce the number of RENT payments by 1
        // Example: 3-month lease with prepayment = 1 PREPAYMENT + 2 RENT payments = 3 total payments
        let rentPaymentsToCreate = hasGap ? leaseTermMonths - 1 : leaseTermMonths;
        
        // SPECIAL CASE: If end date is on the 1st of the month, don't create a payment for that month
        // The tenant only occupies 1 day (the end date itself), so no full month payment is needed
        // Example: Lease ends Feb 1 → don't create Feb 1 payment
        const endDateIsFirst = normalizedEnd.getDate() === 1;
        const endDateMonth = normalizedEnd.getMonth();
        const endDateYear = normalizedEnd.getFullYear();
        
        // Check if firstDueDate would eventually create a payment in the end date's month
        // If end date is 1st and firstDueDate is also 1st, we need to check if we'd create a payment for that month
        if (endDateIsFirst && validDueDay === 1) {
          // Calculate what the last payment date would be
          const tempDate = new Date(normalizedFirstDue);
          for (let i = 0; i < rentPaymentsToCreate; i++) {
            const currentYear = tempDate.getFullYear();
            const currentMonth = tempDate.getMonth();
            
            // If this payment would be in the end date's month, reduce count
            if (currentMonth === endDateMonth && currentYear === endDateYear) {
              rentPaymentsToCreate = i; // Stop before this payment
              console.log(`⚠️ End date is on 1st of month (${normalizedEnd.toISOString()}), reducing payments to ${rentPaymentsToCreate} to avoid charging for single day`);
              break;
            }
            
            // Move to next month
            let nextMonth, nextYear;
            if (currentMonth === 11) {
              nextMonth = 0;
              nextYear = currentYear + 1;
            } else {
              nextMonth = currentMonth + 1;
              nextYear = currentYear;
            }
            tempDate.setMonth(nextMonth);
            tempDate.setFullYear(nextYear);
            tempDate.setDate(1);
          }
        }
        
        console.log(`📅 Lease Term Calculation: Start=${normalizedStart.toISOString()}, End=${normalizedEnd.toISOString()}, Term=${leaseTermMonths} months, HasGap=${hasGap}, EndIsFirst=${endDateIsFirst}, RentPayments=${rentPaymentsToCreate}`);
        
        // Industry Standard: Create exactly rentPaymentsToCreate number of RENT payments
        // Each payment is due on the specified day of the month, starting from firstDueDate
        let currentDueDate = new Date(normalizedFirstDue);
        
        for (let i = 0; i < rentPaymentsToCreate; i++) {
          // Normalize current due date for comparison
          const normalizedCurrent = new Date(currentDueDate.getFullYear(), currentDueDate.getMonth(), currentDueDate.getDate());
          
          // Safety check: don't create payment if it's beyond the end date
          // This handles edge cases where end date calculation might be off by a day
          if (normalizedCurrent > normalizedEnd) {
            console.log(`⏹️ Payment ${i + 1} skipped: ${normalizedCurrent.toISOString()} > ${normalizedEnd.toISOString()}`);
            break;
          }
          
          // SPECIAL CASE: Don't create payment if it's in the same month as end date AND end date is 1st
          // This prevents charging for a full month when tenant only occupies 1 day
          if (endDateIsFirst && 
              normalizedCurrent.getMonth() === normalizedEnd.getMonth() && 
              normalizedCurrent.getFullYear() === normalizedEnd.getFullYear()) {
            console.log(`⏹️ Payment ${i + 1} skipped: End date is 1st of month, tenant only occupies 1 day`);
            break;
          }
          
          console.log(`💰 Creating payment ${i + 1}/${rentPaymentsToCreate}: ${normalizedCurrent.toISOString()}`);
          
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
          
          // Move to next month - Industry Standard: Increment month, handle year rollover
          const currentYear = currentDueDate.getFullYear();
          const currentMonth = currentDueDate.getMonth();
          
          // Handle month and year rollover correctly
          let nextMonth, nextYear;
          if (currentMonth === 11) {
            // December -> January (next year)
            nextMonth = 0;
            nextYear = currentYear + 1;
          } else {
            nextMonth = currentMonth + 1;
            nextYear = currentYear;
          }
          
          // Ensure valid day exists in next month (handle Feb 30, Apr 31, etc.)
          const testDate = new Date(nextYear, nextMonth, validDueDay);
          if (testDate.getMonth() !== nextMonth) {
            // Day doesn't exist in this month (e.g., Feb 30), use 28th (max valid day)
            currentDueDate = new Date(nextYear, nextMonth, 28);
          } else {
            currentDueDate = new Date(nextYear, nextMonth, validDueDay);
          }
        }
        
        console.log(`✅ Created ${paymentsToCreate.length} payments (${hasGap ? '1 PREPAYMENT + ' : ''}${rentPaymentsToCreate} RENT) for ${leaseTermMonths}-month lease term`);
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
