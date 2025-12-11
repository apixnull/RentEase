import prisma from "../../libs/prismaClient.js";

// ============================================================================
// ADMIN — GET SYSTEM PERFORMANCE METRICS
// ----------------------------------------------------------------------------
// Returns comprehensive system performance metrics including database health,
// user activity, business metrics, and engagement analytics
// ============================================================================
export const getSystemPerformance = async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Track query start time for performance measurement
    const queryStartTime = Date.now();

    // ========================================================================
    // DATABASE HEALTH METRICS
    // ========================================================================
    const [
      totalUsers,
      totalListings,
      totalLeases,
      totalPayments,
      totalProperties,
      totalUnits,
      totalMaintenanceRequests,
      totalChatMessages,
      totalNotifications,
      totalUnitViews,
      totalFraudReports,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: "ADMIN" } } }),
      prisma.listing.count(),
      prisma.lease.count(),
      prisma.payment.count(),
      prisma.property.count(),
      prisma.unit.count(),
      prisma.maintenanceRequest.count(),
      prisma.chatMessage.count(),
      prisma.notification.count(),
      prisma.unitView.count(),
      prisma.fraudReport.count(),
    ]);

    // Recent activity counts
    const [
      newUsers24h,
      newUsers7d,
      newUsers30d,
      newListings24h,
      newListings7d,
      newListings30d,
      newLeases24h,
      newLeases7d,
      newLeases30d,
      newPayments24h,
      newPayments7d,
      newPayments30d,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          role: { not: "ADMIN" },
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.user.count({
        where: {
          role: { not: "ADMIN" },
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.user.count({
        where: {
          role: { not: "ADMIN" },
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.listing.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.lease.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.lease.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.lease.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.payment.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.payment.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.payment.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // ========================================================================
    // USER ACTIVITY METRICS
    // ========================================================================
    const [
      totalLogins24h,
      totalLogins7d,
      totalLogins30d,
      uniqueLogins24hData,
      uniqueLogins7dData,
      uniqueLogins30dData,
    ] = await Promise.all([
      prisma.userLogin.count({
        where: {
          loggedInAt: { gte: twentyFourHoursAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
      prisma.userLogin.count({
        where: {
          loggedInAt: { gte: sevenDaysAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
      prisma.userLogin.count({
        where: {
          loggedInAt: { gte: thirtyDaysAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
      prisma.userLogin.groupBy({
        by: ["userId"],
        where: {
          loggedInAt: { gte: twentyFourHoursAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
      prisma.userLogin.groupBy({
        by: ["userId"],
        where: {
          loggedInAt: { gte: sevenDaysAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
      prisma.userLogin.groupBy({
        by: ["userId"],
        where: {
          loggedInAt: { gte: thirtyDaysAgo },
          user: { role: { not: "ADMIN" } },
        },
      }),
    ]);

    const uniqueLogins24h = uniqueLogins24hData?.length || 0;
    const uniqueLogins7d = uniqueLogins7dData?.length || 0;
    const uniqueLogins30d = uniqueLogins30dData?.length || 0;

    // User growth rate (comparing last 30 days to previous 30 days)
    const previous30DaysUsers = await prisma.user.count({
      where: {
        role: { not: "ADMIN" },
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    });
    const userGrowthRate =
      previous30DaysUsers > 0
        ? ((newUsers30d - previous30DaysUsers) / previous30DaysUsers) * 100
        : newUsers30d > 0
        ? 100
        : 0;

    // ========================================================================
    // BUSINESS HEALTH METRICS
    // ========================================================================
    const [
      visibleListings,
      activeLeases,
      completedLeases,
      paidPayments,
      pendingPayments,
      resolvedMaintenance,
      openMaintenance,
      fraudReports24h,
      fraudReports7d,
      fraudReports30d,
    ] = await Promise.all([
      prisma.listing.count({
        where: { lifecycleStatus: "VISIBLE" },
      }),
      prisma.lease.count({
        where: { status: "ACTIVE" },
      }),
      prisma.lease.count({
        where: { status: "COMPLETED" },
      }),
      prisma.payment.count({
        where: { status: "PAID" },
      }),
      prisma.payment.count({
        where: { status: "PENDING" },
      }),
      prisma.maintenanceRequest.count({
        where: { status: "RESOLVED" },
      }),
      prisma.maintenanceRequest.count({
        where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
      }),
      prisma.fraudReport.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.fraudReport.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.fraudReport.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Payment success rate
    const totalPaymentsCount = paidPayments + pendingPayments;
    const paymentSuccessRate =
      totalPaymentsCount > 0 ? (paidPayments / totalPaymentsCount) * 100 : 0;

    // Maintenance resolution rate
    const totalMaintenanceCount = resolvedMaintenance + openMaintenance;
    const maintenanceResolutionRate =
      totalMaintenanceCount > 0
        ? (resolvedMaintenance / totalMaintenanceCount) * 100
        : 0;

    // Average maintenance resolution time (for resolved requests)
    const resolvedMaintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: { status: "RESOLVED" },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      take: 100, // Sample for performance
    });

    const avgResolutionTime =
      resolvedMaintenanceRequests.length > 0
        ? resolvedMaintenanceRequests.reduce((sum, req) => {
            const resolutionTime =
              new Date(req.updatedAt) - new Date(req.createdAt);
            return sum + resolutionTime;
          }, 0) / resolvedMaintenanceRequests.length
        : 0;

    // ========================================================================
    // ENGAGEMENT METRICS
    // ========================================================================
    const [
      unitViews24h,
      unitViews7d,
      unitViews30d,
      chatMessages24h,
      chatMessages7d,
      chatMessages30d,
      notifications24h,
      notifications7d,
      notifications30d,
    ] = await Promise.all([
      prisma.unitView.count({
        where: { viewedAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.unitView.count({
        where: { viewedAt: { gte: sevenDaysAgo } },
      }),
      prisma.unitView.count({
        where: { viewedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.chatMessage.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.chatMessage.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.chatMessage.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.notification.count({
        where: { createdAt: { gte: twentyFourHoursAgo } },
      }),
      prisma.notification.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.notification.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
    ]);

    // Notification read rate
    const readNotifications = await prisma.notification.count({
      where: { status: "READ" },
    });
    const notificationReadRate =
      totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;

    // ========================================================================
    // TREND DATA (for charts)
    // ========================================================================
    // Get daily login trends for last 7 days
    const dailyLoginTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.userLogin.count({
        where: {
          loggedInAt: {
            gte: date,
            lt: nextDate,
          },
          user: { role: { not: "ADMIN" } },
        },
      });

      dailyLoginTrends.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // Get daily listing creation trends for last 7 days
    const dailyListingTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.listing.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });

      dailyListingTrends.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // Get daily payment trends for last 7 days
    const dailyPaymentTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await prisma.payment.count({
        where: {
          paidAt: {
            gte: date,
            lt: nextDate,
          },
          status: "PAID",
        },
      });

      dailyPaymentTrends.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    // ========================================================================
    // CALCULATE QUERY PERFORMANCE
    // ========================================================================
    const queryEndTime = Date.now();
    const queryPerformanceTime = queryEndTime - queryStartTime;

    // ========================================================================
    // CALCULATE SYSTEM HEALTH SCORE
    // ========================================================================
    // Composite score based on multiple factors (0-100)
    let healthScore = 100;

    // Deduct points for issues
    if (paymentSuccessRate < 80) healthScore -= 10;
    if (maintenanceResolutionRate < 70) healthScore -= 5;
    if (fraudReports30d > 50) healthScore -= 10;
    if (queryPerformanceTime > 2000) healthScore -= 15;
    if (uniqueLogins30d < 10 && totalUsers > 100) healthScore -= 10;

    healthScore = Math.max(0, Math.min(100, healthScore));

    const healthStatus =
      healthScore >= 80 ? "HEALTHY" : healthScore >= 60 ? "WARNING" : "CRITICAL";

    // ========================================================================
    // RESPONSE
    // ========================================================================
    return res.status(200).json({
      timestamp: now.toISOString(),
      queryPerformance: {
        responseTime: queryPerformanceTime,
        status: queryPerformanceTime < 1000 ? "FAST" : queryPerformanceTime < 2000 ? "GOOD" : "SLOW",
      },
      systemHealth: {
        score: healthScore,
        status: healthStatus,
      },
      database: {
        totalRecords: {
          users: totalUsers,
          listings: totalListings,
          leases: totalLeases,
          payments: totalPayments,
          properties: totalProperties,
          units: totalUnits,
          maintenanceRequests: totalMaintenanceRequests,
          chatMessages: totalChatMessages,
          notifications: totalNotifications,
          unitViews: totalUnitViews,
          fraudReports: totalFraudReports,
        },
        recentActivity: {
          users: {
            last24h: newUsers24h,
            last7d: newUsers7d,
            last30d: newUsers30d,
          },
          listings: {
            last24h: newListings24h,
            last7d: newListings7d,
            last30d: newListings30d,
          },
          leases: {
            last24h: newLeases24h,
            last7d: newLeases7d,
            last30d: newLeases30d,
          },
          payments: {
            last24h: newPayments24h,
            last7d: newPayments7d,
            last30d: newPayments30d,
          },
        },
      },
      userActivity: {
        activeUsers: {
          last24h: uniqueLogins24h,
          last7d: uniqueLogins7d,
          last30d: uniqueLogins30d,
        },
        totalLogins: {
          last24h: totalLogins24h,
          last7d: totalLogins7d,
          last30d: totalLogins30d,
        },
        growthRate: userGrowthRate,
        dailyLoginTrends,
      },
      businessHealth: {
        listings: {
          total: totalListings,
          visible: visibleListings,
          visibilityRate: totalListings > 0 ? (visibleListings / totalListings) * 100 : 0,
        },
        leases: {
          total: totalLeases,
          active: activeLeases,
          completed: completedLeases,
          completionRate: totalLeases > 0 ? (completedLeases / totalLeases) * 100 : 0,
        },
        payments: {
          total: totalPaymentsCount,
          paid: paidPayments,
          pending: pendingPayments,
          successRate: paymentSuccessRate,
        },
        maintenance: {
          total: totalMaintenanceCount,
          resolved: resolvedMaintenance,
          open: openMaintenance,
          resolutionRate: maintenanceResolutionRate,
          avgResolutionTimeHours: avgResolutionTime / (1000 * 60 * 60), // Convert ms to hours
        },
        fraudReports: {
          last24h: fraudReports24h,
          last7d: fraudReports7d,
          last30d: fraudReports30d,
        },
        dailyListingTrends,
        dailyPaymentTrends,
      },
      engagement: {
        unitViews: {
          last24h: unitViews24h,
          last7d: unitViews7d,
          last30d: unitViews30d,
        },
        chatMessages: {
          last24h: chatMessages24h,
          last7d: chatMessages7d,
          last30d: chatMessages30d,
        },
        notifications: {
          total: totalNotifications,
          read: readNotifications,
          readRate: notificationReadRate,
          last24h: notifications24h,
          last7d: notifications7d,
          last30d: notifications30d,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getSystemPerformance:", error);
    return res.status(500).json({
      error: "Failed to fetch system performance data",
      details: error.message,
    });
  }
};
