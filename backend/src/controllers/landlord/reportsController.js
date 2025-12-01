// file: reportsController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get comprehensive reports and analytics data for landlord
 * @route GET /api/landlord/reports
 * @access Private (LANDLORD)
 * @query period (MONTH, 3MONTHS, 6MONTHS, YEAR)
 */
export const getReportsData = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Get all-time data (no date filtering for summary stats)
    const now = new Date();
    // Use a very wide date range to get all data for summary stats
    const dateStart = new Date(2000, 0, 1);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(now.getFullYear() + 10, 11, 31, 23, 59, 59, 999);

    // Get all properties owned by landlord
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
        Unit: {
          select: {
            id: true,
            label: true,
          },
        },
      },
    });

    const propertyIds = properties.map((p) => p.id);
    const unitIds = properties.flatMap((p) => p.Unit.map((u) => u.id));

    // ============================================================
    // FINANCIAL DATA - Transactions
    // ============================================================
    const transactions = await prisma.transaction.findMany({
      where: {
        property: { ownerId: landlordId },
        date: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        propertyId: true,
      },
      orderBy: { date: "asc" },
    });

    // Group transactions by month
    const monthlyTransactions = {};
    transactions.forEach((t) => {
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyTransactions[monthKey]) {
        monthlyTransactions[monthKey] = { income: 0, expense: 0, month: monthKey };
      }
      if (t.type === "INCOME") {
        monthlyTransactions[monthKey].income += t.amount;
      } else {
        monthlyTransactions[monthKey].expense += t.amount;
      }
    });

    const monthlyFinancialData = Object.values(monthlyTransactions).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Total financials
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);
    const netRevenue = totalIncome - totalExpense;

    // ============================================================
    // LEASE DATA
    // ============================================================
    const allLeases = await prisma.lease.findMany({
      where: { landlordId },
      select: { id: true, status: true },
    });

    const leaseStatusCounts = {
      active: allLeases.filter((l) => l.status === "ACTIVE").length,
      pending: allLeases.filter((l) => l.status === "PENDING").length,
      completed: allLeases.filter((l) => l.status === "COMPLETED").length,
      terminated: allLeases.filter((l) => l.status === "TERMINATED").length,
      cancelled: allLeases.filter((l) => l.status === "CANCELLED").length,
    };

    const activeLeases = allLeases.filter((l) => l.status === "ACTIVE");
    const leaseIds = activeLeases.map((l) => l.id);

    const payments = await prisma.payment.findMany({
      where: {
        leaseId: { in: leaseIds },
        dueDate: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        paidAt: true,
        dueDate: true,
      },
    });

    // Payment status distribution
    const paymentStatusCounts = {
      paid: payments.filter((p) => p.status === "PAID").length,
      pending: payments.filter((p) => p.status === "PENDING").length,
      overdue: payments.filter((p) => {
        if (p.status === "PENDING") {
          const dueDate = new Date(p.dueDate);
          return dueDate < now;
        }
        return false;
      }).length,
    };

    const totalPaidAmount = payments
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
    const totalPendingAmount = payments
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    // ============================================================
    // LISTING DATA
    // ============================================================
    const listings = await prisma.listing.findMany({
      where: { landlordId },
      select: {
        id: true,
        lifecycleStatus: true,
        createdAt: true,
        visibleAt: true,
        unitId: true,
      },
    });

    const listingStatusCounts = {
      visible: listings.filter((l) => l.lifecycleStatus === "VISIBLE").length,
      hidden: listings.filter((l) => l.lifecycleStatus === "HIDDEN").length,
      waiting_review: listings.filter((l) => l.lifecycleStatus === "WAITING_REVIEW").length,
      expired: listings.filter((l) => l.lifecycleStatus === "EXPIRED").length,
      flagged: listings.filter((l) => l.lifecycleStatus === "FLAGGED").length,
      blocked: listings.filter((l) => l.lifecycleStatus === "BLOCKED").length,
    };

    // ============================================================
    // MAINTENANCE DATA
    // ============================================================
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        propertyId: { in: propertyIds },
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    const maintenanceStatusCounts = {
      open: maintenanceRequests.filter((m) => m.status === "OPEN").length,
      in_progress: maintenanceRequests.filter((m) => m.status === "IN_PROGRESS").length,
      resolved: maintenanceRequests.filter((m) => m.status === "RESOLVED").length,
      cancelled: maintenanceRequests.filter((m) => m.status === "CANCELLED").length,
      invalid: maintenanceRequests.filter((m) => m.status === "INVALID").length,
    };

    // ============================================================
    // TENANT SCREENING DATA
    // ============================================================
    const screenings = await prisma.tenantScreening.findMany({
      where: {
        landlordId,
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        status: true,
        aiRiskScore: true,
        riskLevel: true,
      },
    });

    const screeningStatusCounts = {
      pending: screenings.filter((s) => s.status === "PENDING").length,
      submitted: screenings.filter((s) => s.status === "SUBMITTED").length,
      approved: screenings.filter((s) => s.status === "APPROVED").length,
      rejected: screenings.filter((s) => s.status === "REJECTED").length,
    };

    const riskLevelCounts = {
      low: screenings.filter((s) => s.riskLevel === "LOW").length,
      medium: screenings.filter((s) => s.riskLevel === "MEDIUM").length,
      high: screenings.filter((s) => s.riskLevel === "HIGH").length,
    };

    // ============================================================
    // UNIT VIEWS DATA
    // ============================================================
    const unitViews = await prisma.unitView.findMany({
      where: {
        unitId: { in: unitIds },
        viewedAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        unitId: true,
        viewedAt: true,
      },
    });

    // Group views by month
    const monthlyViews = {};
    unitViews.forEach((v) => {
      const monthKey = `${v.viewedAt.getFullYear()}-${String(v.viewedAt.getMonth() + 1).padStart(2, "0")}`;
      monthlyViews[monthKey] = (monthlyViews[monthKey] || 0) + 1;
    });

    const monthlyViewsData = Object.entries(monthlyViews)
      .map(([month, count]) => ({ month, views: count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // ============================================================
    // UNIT REVIEWS DATA
    // ============================================================
    const unitReviews = await prisma.unitReview.findMany({
      where: {
        unitId: { in: unitIds },
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        rating: true,
        createdAt: true,
      },
    });

    const averageRating =
      unitReviews.length > 0
        ? unitReviews.reduce((sum, r) => sum + r.rating, 0) / unitReviews.length
        : 0;

    // Rating distribution
    const ratingDistribution = {
      5: unitReviews.filter((r) => r.rating === 5).length,
      4: unitReviews.filter((r) => r.rating === 4).length,
      3: unitReviews.filter((r) => r.rating === 3).length,
      2: unitReviews.filter((r) => r.rating === 2).length,
      1: unitReviews.filter((r) => r.rating === 1).length,
    };

    // ============================================================
    // PROPERTY PERFORMANCE (Income per property)
    // ============================================================
    const propertyPerformance = properties.map((property) => {
      const propertyTransactions = transactions.filter((t) => t.propertyId === property.id);
      const propertyIncome = propertyTransactions
        .filter((t) => t.type === "INCOME")
        .reduce((sum, t) => sum + t.amount, 0);
      const propertyExpense = propertyTransactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        income: propertyIncome,
        expense: propertyExpense,
        netRevenue: propertyIncome - propertyExpense,
        unitCount: property.Unit.length,
      };
    });

    // ============================================================
    // SUMMARY METRICS
    // ============================================================
    const summary = {
      totalProperties: properties.length,
      totalUnits: unitIds.length,
      activeLeases: activeLeases.length,
      totalListings: listings.length,
      totalViews: unitViews.length,
      totalReviews: unitReviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
      totalIncome,
      totalExpense,
      netRevenue,
      totalPaidAmount,
      totalPendingAmount,
      totalMaintenanceRequests: maintenanceRequests.length,
      totalScreenings: screenings.length,
    };

    return res.status(200).json({
      summary,
      leases: {
        statusCounts: leaseStatusCounts,
      },
      financial: {
        totalIncome,
        totalExpense,
        netRevenue,
        monthlyData: monthlyFinancialData,
      },
      payments: {
        statusCounts: paymentStatusCounts,
        totalPaidAmount,
        totalPendingAmount,
      },
      listings: {
        statusCounts: listingStatusCounts,
      },
      maintenance: {
        statusCounts: maintenanceStatusCounts,
      },
      screenings: {
        statusCounts: screeningStatusCounts,
        riskLevelCounts,
      },
      engagement: {
        totalViews: unitViews.length,
        totalReviews: unitReviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        monthlyViewsData,
        ratingDistribution,
      },
      propertyPerformance,
      dateRange: {
        start: dateStart.toISOString(),
        end: dateEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return res.status(500).json({
      error: "Failed to fetch reports data",
      details: error.message,
    });
  }
};

