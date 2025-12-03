import prisma from "../../libs/prismaClient.js";

// ============================================================================
// ADMIN — GET USER ANALYTICS DATA
// ----------------------------------------------------------------------------
// Returns user breakdown data for analytics reports
// Supports time filtering via month, year, or period query parameters
// ============================================================================
export const getUserAnalytics = async (req, res) => {
  try {
    const { period = "this_month", month, year } = req.query || {};
    const now = new Date();
    
    let start, end;
    
    // If month is provided, use specific month (assumed current year if year not provided)
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
    } 
    // If year is provided (but no month), use entire year
    else if (year) {
      const yearNum = parseInt(year, 10);
      start = new Date(yearNum, 0, 1);
      end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }
    // Legacy period support
    else if (period === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "all_time") {
      // All time - no date filter
      start = null;
      end = null;
    } else {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Get all users (excluding admins) - always get all users for metrics
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isDisabled: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Count users by role
    const tenants = users.filter((u) => u.role === 'TENANT').length;
    const landlords = users.filter((u) => u.role === 'LANDLORD').length;
    const totalUsers = tenants + landlords;

    // Count user status
    const blocked = users.filter((u) => u.isDisabled === true).length;
    const verified = users.filter((u) => u.isVerified === true).length;
    const notVerified = users.filter((u) => u.isVerified === false).length;

    // Build login where clause with date filter if applicable
    const loginWhereClause = {
      user: {
        role: {
          not: 'ADMIN',
        },
      },
    };

    if (start && end) {
      loginWhereClause.loggedInAt = {
        gte: start,
        lte: end,
      };
    }

    // Get login events (excluding admin logins) filtered by time period
    const userLogins = await prisma.userLogin.findMany({
      where: loginWhereClause,
      select: {
        id: true,
        userId: true,
        loggedInAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        loggedInAt: 'desc',
      },
    });

    // Group logins by date
    const dailyLoginsMap = new Map();
    userLogins.forEach((login) => {
      const dateKey = login.loggedInAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const current = dailyLoginsMap.get(dateKey) || 0;
      dailyLoginsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0 if we have a date range
    const dailyLogins = [];
    if (start && end) {
      const loginDate = new Date(start);
      while (loginDate <= end) {
        const dateKey = loginDate.toISOString().split('T')[0];
        dailyLogins.push({
          date: dateKey,
          count: dailyLoginsMap.get(dateKey) || 0,
        });
        loginDate.setDate(loginDate.getDate() + 1);
      }
    } else {
      // All time: return only dates that have logins
      const sortedDates = Array.from(dailyLoginsMap.keys()).sort();
      sortedDates.forEach((dateKey) => {
        dailyLogins.push({
          date: dateKey,
          count: dailyLoginsMap.get(dateKey) || 0,
        });
      });
    }

    // Calculate total logins for the period
    const totalLogins = userLogins.length;

    return res.status(200).json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
        createdAt: user.createdAt.toISOString(),
      })),
      metrics: {
        totalUsers,
        tenants,
        landlords,
        blocked,
        verified,
        notVerified,
        totalLogins,
      },
      dailyLogins,
      loginEvents: userLogins.map((login) => ({
        id: login.id,
        userId: login.userId,
        loggedInAt: login.loggedInAt.toISOString(),
        user: {
          id: login.user.id,
          email: login.user.email,
          firstName: login.user.firstName,
          lastName: login.user.lastName,
          role: login.user.role,
        },
      })),
    });
  } catch (error) {
    console.error("❌ Error fetching user analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user analytics data.",
      error: error.message,
    });
  }
};

// ============================================================================
// ADMIN — GET LISTING ANALYTICS DATA
// ----------------------------------------------------------------------------
// Returns listing breakdown data for analytics reports
// Supports time filtering via month, year, or period query parameters
// ============================================================================
export const getListingAnalytics = async (req, res) => {
  try {
    const { period = "this_month", month, year } = req.query || {};
    const now = new Date();
    
    let start, end;
    
    // If month is provided, use specific month (assumed current year if year not provided)
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
    } 
    // If year is provided (but no month), use entire year
    else if (year) {
      const yearNum = parseInt(year, 10);
      start = new Date(yearNum, 0, 1);
      end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }
    // Legacy period support
    else if (period === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "all_time") {
      // All time - no date filter
      start = null;
      end = null;
    } else {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Build where clause with date filter if applicable
    const whereClause = {
      lifecycleStatus: {
        not: 'WAITING_PAYMENT',
      },
    };

    if (start && end) {
      whereClause.createdAt = {
        gte: start,
        lte: end,
      };
    }

    // Get all listings (excluding WAITING_PAYMENT) with payment and featured data
    const listings = await prisma.listing.findMany({
      where: whereClause,
      select: {
        id: true,
        lifecycleStatus: true,
        createdAt: true,
        paymentAmount: true,
        isFeatured: true,
        landlordId: true,
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
        landlord: {
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

    // Count by status
    const waitingReview = listings.filter((l) => l.lifecycleStatus === 'WAITING_REVIEW').length;
    const visible = listings.filter((l) => l.lifecycleStatus === 'VISIBLE').length;
    const hidden = listings.filter((l) => l.lifecycleStatus === 'HIDDEN').length;
    const activeListings = visible + hidden; // Combined active listings
    const expired = listings.filter((l) => l.lifecycleStatus === 'EXPIRED').length;
    const flagged = listings.filter((l) => l.lifecycleStatus === 'FLAGGED').length;
    const blocked = listings.filter((l) => l.lifecycleStatus === 'BLOCKED').length;
    const totalListings = listings.length;

    // Calculate total earnings (sum of all paymentAmount)
    const totalEarnings = listings.reduce((sum, listing) => {
      return sum + (listing.paymentAmount || 0);
    }, 0);

    // Count featured vs standard listings based on payment amount
    // Featured: paymentAmount = 150 AND isFeatured = true
    // Standard: paymentAmount = 100 AND isFeatured = false
    const featuredListings = listings.filter(
      (l) => l.paymentAmount === 150 && l.isFeatured === true
    ).length;
    const standardListings = listings.filter(
      (l) => l.paymentAmount === 100 && l.isFeatured === false
    ).length;

    // Count unique landlords who have featured listings (paymentAmount = 150 AND isFeatured = true)
    const landlordsWithFeatured = new Set(
      listings
        .filter((l) => l.paymentAmount === 150 && l.isFeatured === true)
        .map((l) => l.landlordId)
    ).size;

    // Count unique landlords who have standard listings (paymentAmount = 100 AND isFeatured = false)
    const landlordsWithStandard = new Set(
      listings
        .filter((l) => l.paymentAmount === 100 && l.isFeatured === false)
        .map((l) => l.landlordId)
    ).size;

    // Group listings by date for daily chart
    const dailyListingsMap = new Map();
    listings.forEach((listing) => {
      const dateKey = listing.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD
      const current = dailyListingsMap.get(dateKey) || 0;
      dailyListingsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0 if we have a date range
    const dailyListings = [];
    if (start && end) {
      const listingDate = new Date(start);
      while (listingDate <= end) {
        const dateKey = listingDate.toISOString().split('T')[0];
        dailyListings.push({
          date: dateKey,
          count: dailyListingsMap.get(dateKey) || 0,
        });
        listingDate.setDate(listingDate.getDate() + 1);
      }
    } else {
      // All time: return only dates that have listings
      const sortedDates = Array.from(dailyListingsMap.keys()).sort();
      sortedDates.forEach((dateKey) => {
        dailyListings.push({
          date: dateKey,
          count: dailyListingsMap.get(dateKey) || 0,
        });
      });
    }

    return res.status(200).json({
      listings: listings.map((listing) => ({
        id: listing.id,
        status: listing.lifecycleStatus,
        createdAt: listing.createdAt.toISOString(),
        paymentAmount: listing.paymentAmount,
        isFeatured: listing.isFeatured,
        unitLabel: listing.unit?.label || 'N/A',
        propertyTitle: listing.unit?.property?.title || 'N/A',
        ownerName: listing.landlord?.firstName && listing.landlord?.lastName
          ? `${listing.landlord.firstName} ${listing.landlord.lastName}`
          : listing.landlord?.email || 'N/A',
        ownerEmail: listing.landlord?.email || 'N/A',
      })),
      metrics: {
        totalListings,
        waitingReview,
        visible,
        hidden,
        activeListings,
        expired,
        flagged,
        blocked,
        totalEarnings,
        featuredListings,
        standardListings,
        landlordsWithFeatured,
        landlordsWithStandard,
      },
      dailyListings,
    });
  } catch (error) {
    console.error("❌ Error fetching listing analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch listing analytics data.",
      error: error.message,
    });
  }
};

// ============================================================================
// ADMIN — GET REPORTS ANALYTICS DATA
// ----------------------------------------------------------------------------
// Returns fraud reports analytics data
// Supports time filtering via month, year, or period query parameters
// ============================================================================
export const getReportsAnalytics = async (req, res) => {
  try {
    const { period = "this_month", month, year } = req.query || {};
    const now = new Date();
    
    let start, end;
    
    // If month is provided, use specific month (assumed current year if year not provided)
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
    } 
    // If year is provided (but no month), use entire year
    else if (year) {
      const yearNum = parseInt(year, 10);
      start = new Date(yearNum, 0, 1);
      end = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    }
    // Legacy period support
    else if (period === "this_year") {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (period === "all_time") {
      // All time - no date filter
      start = null;
      end = null;
    } else {
      // Default to this_month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Build where clause with date filter if applicable
    const whereClause = {};
    if (start && end) {
      whereClause.createdAt = {
        gte: start,
        lte: end,
      };
    }

    // Get all fraud reports in the period
    const reports = await prisma.fraudReport.findMany({
      where: whereClause,
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
    const totalReports = reports.length;

    // Group reports by day for chart
    const dailyReportsMap = new Map();
    reports.forEach((report) => {
      const dateKey = report.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      const current = dailyReportsMap.get(dateKey) || 0;
      dailyReportsMap.set(dateKey, current + 1);
    });

    // Fill in missing days with 0 for reports chart
    const dailyReports = [];
    if (start && end) {
      const reportDate = new Date(start);
      while (reportDate <= end) {
        const dateKey = reportDate.toISOString().split("T")[0];
        dailyReports.push({
          date: dateKey,
          count: dailyReportsMap.get(dateKey) || 0,
        });
        reportDate.setDate(reportDate.getDate() + 1);
      }
    } else {
      // All time: return only dates that have reports
      const sortedDates = Array.from(dailyReportsMap.keys()).sort();
      sortedDates.forEach((dateKey) => {
        dailyReports.push({
          date: dateKey,
          count: dailyReportsMap.get(dateKey) || 0,
        });
      });
    }

    return res.status(200).json({
      reports: reports.map((report) => ({
        id: report.id,
        listingId: report.listingId,
        reason: report.reason,
        createdAt: report.createdAt.toISOString(),
        propertyTitle: report.listing?.unit?.property?.title || 'Unknown Property',
        reporterName: report.reporter.firstName && report.reporter.lastName
          ? `${report.reporter.firstName} ${report.reporter.lastName}`
          : report.reporter.email,
        reporterEmail: report.reporter.email,
      })),
      metrics: {
        totalReports,
      },
      dailyReports,
    });
  } catch (error) {
    console.error("❌ Error fetching reports analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports analytics data.",
      error: error.message,
    });
  }
};

