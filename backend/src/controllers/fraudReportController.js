import prisma from "../libs/prismaClient.js";

export const createFraudReport = async (req, res) => {
  const { listingId, reason, details } = req.body || {};
  const reporterId = req.user?.id;

  if (!listingId || !reason) {
    return res.status(400).json({ error: "listingId and reason are required." });
  }

  try {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });

    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const report = await prisma.fraudReport.create({
      data: {
        listingId,
        reporterId,
        reason,
        details: details || null,
      },
    });

    return res.status(201).json({ report });
  } catch (error) {
    console.error("❌ Error in createFraudReport:", error);
    return res.status(500).json({ error: "Failed to submit report." });
  }
};

export const getFraudReports = async (_req, res) => {
  try {
    const reports = await prisma.fraudReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            lifecycleStatus: true,
            unit: {
              select: {
                label: true,
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
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({ reports });
  } catch (error) {
    console.error("❌ Error in getFraudReports:", error);
    return res.status(500).json({ error: "Failed to fetch fraud reports." });
  }
};

// ============================================================================
// ADMIN — GET FRAUD REPORTS ANALYTICS
// ----------------------------------------------------------------------------
// Returns fraud reports analytics data for charts and trends
// Supports date filtering: period, month, year
// ============================================================================
export const getFraudReportsAnalytics = async (req, res) => {
  try {
    const { period = "this_month", month, year } = req.query || {};
    const now = new Date();
    
    let start, end, label;
    
    // If month is provided, use specific month
    if (month) {
      const monthNum = parseInt(month, 10);
      const yearNum = year ? parseInt(year, 10) : now.getFullYear();
      
      if (monthNum < 1 || monthNum > 12) {
        return res.status(400).json({
          success: false,
          message: "Invalid month. Must be between 1 and 12.",
        });
      }
      
      start = new Date(yearNum, monthNum - 1, 1);
      end = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      label = `${monthNames[monthNum - 1]} ${yearNum}`;
    } 
    // If year is provided (but no month), use entire year
    else if (year) {
      const yearNum = parseInt(year, 10);
      start = new Date(yearNum, 0, 1);
      end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
      label = `${yearNum}`;
    }
    // Legacy period support
    else if (period === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      label = "This Year";
    } else if (period === "all_time") {
      // All time - no date filter
      start = null;
      end = null;
      label = "All Time";
    } else {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = "This Month";
    }

    // Get fraud reports in the period
    const fraudReportWhere = start && end ? {
      createdAt: {
        gte: start,
        lte: end,
      },
    } : {};
    
    const fraudReports = await prisma.fraudReport.findMany({
      where: fraudReportWhere,
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

    // Count total reports
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
    if (start && end) {
      const fraudDate = new Date(start);
      while (fraudDate <= end) {
        const dateKey = fraudDate.toISOString().split("T")[0];
        dailyFraudReports.push({
          date: dateKey,
          count: dailyFraudReportsMap.get(dateKey) || 0,
        });
        fraudDate.setDate(fraudDate.getDate() + 1);
      }
    } else {
      // All time: return only dates that have fraud reports
      const sortedDates = Array.from(dailyFraudReportsMap.keys()).sort();
      sortedDates.forEach((dateKey) => {
        dailyFraudReports.push({
          date: dateKey,
          count: dailyFraudReportsMap.get(dateKey) || 0,
        });
      });
    }

    // Map all fraud reports to the expected structure
    const reports = fraudReports.map((report) => ({
      id: report.id,
      listingId: report.listingId,
      reason: report.reason,
      createdAt: report.createdAt.toISOString(),
      propertyTitle: report.listing?.unit?.property?.title || 'Unknown Property',
      reporterName: report.reporter.firstName && report.reporter.lastName
        ? `${report.reporter.firstName} ${report.reporter.lastName}`
        : report.reporter.email,
      reporterEmail: report.reporter.email,
    }));

    return res.status(200).json({
      period: {
        label,
        start: start ? start.toISOString() : null,
        end: end ? end.toISOString() : null,
      },
      totalFraudReports,
      dailyFraudReports,
      reports,
    });
  } catch (error) {
    console.error("❌ Error fetching fraud reports analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch fraud reports analytics data.",
      error: error.message,
    });
  }
};

