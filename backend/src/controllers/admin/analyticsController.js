import prisma from "../../libs/prismaClient.js";

// ============================================================================
// ADMIN — GET ANALYTICS DATA
// ----------------------------------------------------------------------------
// Returns login, fraud reports, and listing analytics
// Supports "this_month" (default) and "this_year" query parameters
// ============================================================================
export const getAnalytics = async (req, res) => {
  try {
    const { period = "this_month" } = req.query || {};
    const now = new Date();
    
    let start, end, label;
    
    if (period === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      label = "This Year";
    } else {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = "This Month";
    }

    // Get all logins in the period
    const logins = await prisma.userLogin.findMany({
      where: {
        loggedInAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        userId: true,
        loggedInAt: true,
      },
    });

    // Calculate unique users who logged in this month
    const uniqueLogins = new Set(logins.map((l) => l.userId));
    const usersLoggedInThisMonth = uniqueLogins.size;

    // Total logins this month
    const totalLogins = logins.length;

    // Group logins by day for line chart
    const dailyLoginsMap = new Map();
    logins.forEach((login) => {
      const dateKey = login.loggedInAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const current = dailyLoginsMap.get(dateKey) || 0;
      dailyLoginsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0
    const dailyLogins = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const dayLabel = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

      dailyLogins.push({
        date: dateKey,
        label: dayLabel,
        count: dailyLoginsMap.get(dateKey) || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Get fraud reports in the period
    const fraudReports = await prisma.fraudReport.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        listingId: true,
        reason: true,
        createdAt: true,
        listing: {
          select: {
            unit: {
              select: {
                property: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        reporter: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Total fraud reports this month
    const totalFraudReports = fraudReports.length;

    // Group fraud reports by day for chart
    const dailyFraudReportsMap = new Map();
    fraudReports.forEach((report) => {
      const dateKey = report.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const current = dailyFraudReportsMap.get(dateKey) || 0;
      dailyFraudReportsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0 for fraud reports chart
    const dailyFraudReports = [];
    const fraudDate = new Date(start);
    while (fraudDate <= end) {
      const dateKey = fraudDate.toISOString().split("T")[0];
      dailyFraudReports.push({
        date: dateKey,
        count: dailyFraudReportsMap.get(dateKey) || 0,
      });
      fraudDate.setDate(fraudDate.getDate() + 1);
    }

    // Get listings created in the period
    const listings = await prisma.listing.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        createdAt: true,
        lifecycleStatus: true,
      },
    });

    // Total listings created
    const totalListingsCreated = listings.length;

    // Group listings by day for chart
    const dailyListingsMap = new Map();
    listings.forEach((listing) => {
      const dateKey = listing.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const current = dailyListingsMap.get(dateKey) || 0;
      dailyListingsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0 for listings chart
    const dailyListings = [];
    const listingDate = new Date(start);
    while (listingDate <= end) {
      const dateKey = listingDate.toISOString().split("T")[0];
      const dayLabel = `${listingDate.getMonth() + 1}/${listingDate.getDate()}`;
      dailyListings.push({
        date: dateKey,
        label: dayLabel,
        count: dailyListingsMap.get(dateKey) || 0,
      });
      listingDate.setDate(listingDate.getDate() + 1);
    }

    // Get 3 most recent fraud reports
    const recentFraudReports = fraudReports.slice(0, 3).map((report) => ({
      id: report.id,
      listingId: report.listingId,
      reason: report.reason,
      createdAt: report.createdAt.toISOString(),
      propertyTitle: report.listing?.unit?.property?.title || 'Unknown Property',
      reporterName: report.reporter.firstName && report.reporter.lastName
        ? `${report.reporter.firstName} ${report.reporter.lastName}`
        : report.reporter.email,
    }));

    return res.status(200).json({
      period: {
        label,
        start: start.toISOString(),
        end: end.toISOString(),
      },
      usersLoggedInThisMonth,
      totalLogins,
      dailyLogins,
      totalFraudReports,
      dailyFraudReports,
      recentFraudReports,
      totalListingsCreated,
      dailyListings,
    });
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data.",
      error: error.message,
    });
  }
};

