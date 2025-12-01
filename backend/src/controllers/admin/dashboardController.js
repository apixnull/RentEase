import prisma from "../../libs/prismaClient.js";

// ============================================================================
// ADMIN — GET DASHBOARD DATA
// ----------------------------------------------------------------------------
// Returns comprehensive dashboard metrics and data for admin
// ============================================================================
export const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    // Get all users (excluding admins for most metrics)
    const allUsers = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
      },
      select: {
        id: true,
        role: true,
        isVerified: true,
        isDisabled: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    // Get all listings
    const allListings = await prisma.listing.findMany({
      select: {
        id: true,
        lifecycleStatus: true,
        isFeatured: true,
        paymentAmount: true,
        createdAt: true,
        updatedAt: true,
        reviewedAt: true,
        flaggedReason: true,
        blockedReason: true,
      },
    });

    // Get all fraud reports
    const allFraudReports = await prisma.fraudReport.findMany({
      select: {
        id: true,
        createdAt: true,
      },
    });

    // Calculate user metrics
    const totalUsers = allUsers.length;
    const landlords = allUsers.filter((u) => u.role === "LANDLORD").length;
    const tenants = allUsers.filter((u) => u.role === "TENANT").length;
    const verifiedUsers = allUsers.filter((u) => u.isVerified).length;
    const blockedUsers = allUsers.filter((u) => u.isDisabled).length;
    const newUsersLast30Days = allUsers.filter(
      (u) => new Date(u.createdAt) >= thirtyDaysAgo
    ).length;
    const newUsersLast7Days = allUsers.filter(
      (u) => new Date(u.createdAt) >= sevenDaysAgo
    ).length;
    const activeUsersLast30Days = allUsers.filter(
      (u) => u.lastLogin && new Date(u.lastLogin) >= thirtyDaysAgo
    ).length;

    // Calculate listing metrics
    const totalListings = allListings.length;
    const visibleListings = allListings.filter(
      (l) => l.lifecycleStatus === "VISIBLE"
    ).length;
    const hiddenListings = allListings.filter(
      (l) => l.lifecycleStatus === "HIDDEN"
    ).length;
    const blockedListings = allListings.filter(
      (l) => l.lifecycleStatus === "BLOCKED"
    ).length;
    const flaggedListings = allListings.filter(
      (l) => l.lifecycleStatus === "FLAGGED"
    ).length;
    const expiredListings = allListings.filter(
      (l) => l.lifecycleStatus === "EXPIRED"
    ).length;
    const waitingReview = allListings.filter(
      (l) => l.lifecycleStatus === "WAITING_REVIEW"
    ).length;
    const featuredListings = allListings.filter((l) => l.isFeatured).length;
    const newListingsLast30Days = allListings.filter(
      (l) => new Date(l.createdAt) >= thirtyDaysAgo
    ).length;
    const newListingsLast7Days = allListings.filter(
      (l) => new Date(l.createdAt) >= sevenDaysAgo
    ).length;

    // Calculate revenue from listings
    const totalRevenue = allListings.reduce(
      (sum, l) => sum + (l.paymentAmount || 0),
      0
    );
    const revenueLast30Days = allListings
      .filter((l) => new Date(l.createdAt) >= thirtyDaysAgo)
      .reduce((sum, l) => sum + (l.paymentAmount || 0), 0);

    // Calculate fraud report metrics
    const totalFraudReports = allFraudReports.length;
    const newFraudReportsLast30Days = allFraudReports.filter(
      (f) => new Date(f.createdAt) >= thirtyDaysAgo
    ).length;
    const newFraudReportsLast7Days = allFraudReports.filter(
      (f) => new Date(f.createdAt) >= sevenDaysAgo
    ).length;

    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      where: {
        role: { not: "ADMIN" },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
        isDisabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get recent listings (last 5)
    const recentListings = await prisma.listing.findMany({
      select: {
        id: true,
        lifecycleStatus: true,
        isFeatured: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get recent fraud reports (last 5)
    const recentFraudReports = await prisma.fraudReport.findMany({
      select: {
        id: true,
        reason: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
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
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return res.status(200).json({
      metrics: {
        users: {
          total: totalUsers,
          landlords,
          tenants,
          verified: verifiedUsers,
          blocked: blockedUsers,
          newLast30Days: newUsersLast30Days,
          newLast7Days: newUsersLast7Days,
          activeLast30Days: activeUsersLast30Days,
        },
        listings: {
          total: totalListings,
          visible: visibleListings,
          hidden: hiddenListings,
          blocked: blockedListings,
          flagged: flaggedListings,
          expired: expiredListings,
          waitingReview,
          featured: featuredListings,
          newLast30Days: newListingsLast30Days,
          newLast7Days: newListingsLast7Days,
        },
        fraudReports: {
          total: totalFraudReports,
          newLast30Days: newFraudReportsLast30Days,
          newLast7Days: newFraudReportsLast7Days,
        },
        revenue: {
          total: totalRevenue,
          last30Days: revenueLast30Days,
        },
      },
      recent: {
        users: recentUsers.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        })),
        listings: recentListings.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        })),
        fraudReports: recentFraudReports.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error in getAdminDashboard:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message,
    });
  }
};

