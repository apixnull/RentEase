// file: leaseAnalyticsController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get lease and rent analytics with tenant behavior analysis
 * @route GET /api/landlord/lease-analytics
 * @access Private (LANDLORD)
 * @query period (THIS_MONTH, LAST_MONTH, THIS_YEAR, LAST_YEAR, CUSTOM)
 * @query startMonth (YYYY-MM) - required if period is CUSTOM
 * @query endMonth (YYYY-MM) - required if period is CUSTOM
 */
export const getLeaseAnalytics = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const { period = "THIS_MONTH", startMonth, endMonth } = req.query;
    const now = new Date();
    let dateStart, dateEnd;

    // Calculate date range based on period
    switch (period) {
      case "LAST_YEAR":
        dateStart = new Date(now.getFullYear() - 1, 0, 1);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
      case "THIS_YEAR":
        dateStart = new Date(now.getFullYear(), 0, 1);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "LAST_MONTH":
        dateStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case "CUSTOM":
        if (!startMonth || !endMonth) {
          return res.status(400).json({ error: "startMonth and endMonth are required for CUSTOM period." });
        }
        // Parse YYYY-MM format
        const [startYear, startMonthNum] = startMonth.split('-').map(Number);
        const [endYear, endMonthNum] = endMonth.split('-').map(Number);
        dateStart = new Date(startYear, startMonthNum - 1, 1);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(endYear, endMonthNum, 0, 23, 59, 59, 999);
        break;
      default: // THIS_MONTH
        dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateStart.setHours(0, 0, 0, 0);
        dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Get all properties owned by landlord
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
      },
      orderBy: { title: 'asc' },
    });

    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return res.status(200).json({
        summary: {
          totalRentCollected: 0,
          totalLeases: 0,
          activeLeases: 0,
          totalProperties: 0,
          totalUnits: 0,
        },
        properties: [],
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString(),
        },
      });
    }

    // Get all leases for this landlord (not filtered by date - we want all leases to analyze behavior)
    const allLeases = await prisma.lease.findMany({
      where: {
        landlordId,
        status: { in: ['ACTIVE', 'COMPLETED'] }, // Only active and completed leases
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        tenantId: true,
        rentAmount: true,
        startDate: true,
        endDate: true,
        status: true,
        landlordNotes: true,
        property: {
          select: {
            id: true,
            title: true,
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
          },
        },
      },
    });

    // Get all payments for these leases (filtered by date range for rent collection)
    const leaseIds = allLeases.map(l => l.id);
    const payments = await prisma.payment.findMany({
      where: {
        leaseId: { in: leaseIds },
        status: 'PAID',
        paidAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        leaseId: true,
        amount: true,
        paidAt: true,
        timingStatus: true,
        type: true,
        method: true,
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    // Map leaseId to lease info for quick lookup
    const leaseMap = {};
    allLeases.forEach(lease => {
      leaseMap[lease.id] = lease;
    });

    // Build payment breakdown with property/unit/tenant info
    const paymentBreakdown = payments
      .filter(p => p.type === 'RENT' || p.type === 'ADVANCE_PAYMENT' || p.type === 'PREPAYMENT' || !p.type)
      .map(payment => {
        const lease = leaseMap[payment.leaseId];
        if (!lease) return null;
        
        return {
          paymentId: payment.id,
          amount: payment.amount,
          paidAt: payment.paidAt.toISOString(),
          method: payment.method,
          timingStatus: payment.timingStatus,
          propertyId: lease.propertyId,
          propertyTitle: lease.property.title,
          unitId: lease.unitId,
          unitLabel: lease.unit.label,
          tenantId: lease.tenantId,
          tenantName: `${lease.tenant.firstName} ${lease.tenant.lastName}`,
          tenantEmail: lease.tenant.email,
          leaseId: payment.leaseId,
        };
      })
      .filter(p => p !== null);

    // Calculate summary
    const totalRentCollected = paymentBreakdown.reduce((sum, p) => sum + p.amount, 0);
    const totalLeases = allLeases.length;
    const activeLeases = allLeases.filter(l => l.status === 'ACTIVE').length;
    const uniqueUnitIds = new Set(allLeases.map(l => l.unitId));
    const totalUnits = uniqueUnitIds.size;
    const avgRevenuePerProperty = properties.length > 0 ? totalRentCollected / properties.length : 0;

    // Calculate monthly revenue breakdown
    const monthlyRevenue = {};
    payments.forEach(p => {
      if (p.paidAt) {
        const monthKey = `${new Date(p.paidAt).getFullYear()}-${String(new Date(p.paidAt).getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyRevenue[monthKey]) {
          monthlyRevenue[monthKey] = 0;
        }
        // Only count rent payments (RENT, ADVANCE_PAYMENT, PREPAYMENT)
        if (p.type === 'RENT' || p.type === 'ADVANCE_PAYMENT' || p.type === 'PREPAYMENT' || !p.type) {
          monthlyRevenue[monthKey] += p.amount;
        }
      }
    });

    // Convert to array and sort
    const monthlyRevenueData = Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get properties list for filter
    const propertiesList = properties.map(p => ({
      id: p.id,
      title: p.title,
    }));

    // Get units list for filter (grouped by property)
    const unitsList = allLeases.reduce((acc, lease) => {
      const key = `${lease.propertyId}-${lease.unitId}`;
      if (!acc.find(u => u.id === key)) {
        acc.push({
          id: key,
          unitId: lease.unitId,
          unitLabel: lease.unit.label,
          propertyId: lease.propertyId,
          propertyTitle: lease.property.title,
        });
      }
      return acc;
    }, []);

    return res.status(200).json({
      summary: {
        totalRentCollected,
        totalLeases,
        activeLeases,
        totalProperties: properties.length,
        totalUnits,
        avgRevenuePerProperty,
        totalPayments: paymentBreakdown.length,
      },
      monthlyRevenue: monthlyRevenueData,
      paymentBreakdown,
      propertiesList,
      unitsList,
      dateRange: {
        start: dateStart.toISOString(),
        end: dateEnd.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error fetching lease analytics:", err);
    return res.status(500).json({
      error: "Failed to fetch lease analytics.",
      details: err.message,
    });
  }
};

