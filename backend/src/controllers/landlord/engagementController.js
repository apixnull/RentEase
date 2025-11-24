// file: engagementController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get engagement data (views and reviews) for properties/units
 * @route GET /api/landlord/engagement
 * @access Private (LANDLORD)
 * @query propertyId, unitId, startDate, endDate, range (MONTH, YEAR, RANGE)
 */
export const getEngagementData = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const { propertyId, unitId, startDate, endDate, range } = req.query;

    // Build date range
    let dateStart, dateEnd;
    const now = new Date();

    if (range === "MONTH") {
      // Current month
      dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === "YEAR") {
      // Current year
      dateStart = new Date(now.getFullYear(), 0, 1);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (range === "RANGE" && startDate && endDate) {
      // Custom range
      dateStart = new Date(startDate);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date(endDate);
      dateEnd.setHours(23, 59, 59, 999);
    } else {
      // Default to current month
      dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
      dateStart.setHours(0, 0, 0, 0);
      dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Build property filter
    const propertyWhere = {
      ownerId,
      ...(propertyId && propertyId !== "ALL" ? { id: propertyId } : {}),
    };

    // Build unit filter (no unit filter for chart - we'll return all data for client-side filtering)
    const unitWhere = {
      property: propertyWhere,
    };

    // Get all units matching filters with listing info
    const units = await prisma.unit.findMany({
      where: unitWhere,
      select: {
        id: true,
        label: true,
        property: {
          select: {
            id: true,
            title: true,
          },
        },
        listings: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get latest listing
          select: {
            id: true,
            lifecycleStatus: true,
            visibleAt: true,
            hiddenAt: true,
            expiresAt: true,
            blockedAt: true,
            flaggedAt: true,
          },
        },
      },
    });

    const unitIds = units.map((u) => u.id);

    if (unitIds.length === 0) {
      return res.json({
        summary: {
          totalViews: 0,
          totalReviews: 0,
          averageRating: 0,
          dateRange: {
            start: dateStart.toISOString(),
            end: dateEnd.toISOString(),
          },
        },
        units: [],
        dailyData: [],
      });
    }

    // Get views within date range
    const views = await prisma.unitView.findMany({
      where: {
        unitId: { in: unitIds },
        viewedAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      select: {
        id: true,
        unitId: true,
        viewedAt: true,
      },
      orderBy: {
        viewedAt: "asc",
      },
    });

    // Get reviews within date range
    const reviews = await prisma.unitReview.findMany({
      where: {
        unitId: { in: unitIds },
        createdAt: {
          gte: dateStart,
          lte: dateEnd,
        },
      },
      select: {
        id: true,
        unitId: true,
        rating: true,
        createdAt: true,
      },
    });

    // Return raw views and reviews data for client-side filtering
    // Client will calculate dailyData based on selected unit filter

    // Calculate stats per unit with listing status
    const unitStats = units.map((unit) => {
      const unitViews = views.filter((v) => v.unitId === unit.id);
      const unitReviews = reviews.filter((r) => r.unitId === unit.id);
      const avgRating =
        unitReviews.length > 0
          ? unitReviews.reduce((sum, r) => sum + r.rating, 0) / unitReviews.length
          : 0;

      // Determine listing status - only ACTIVE (VISIBLE/HIDDEN) or NOT_LISTED
      const latestListing = unit.listings[0];
      let listingStatus = "NOT_LISTED";
      if (latestListing) {
        const { lifecycleStatus, visibleAt, hiddenAt, expiresAt } = latestListing;
        const now = new Date();
        
        // ACTIVE = VISIBLE or HIDDEN (both are considered active listings)
        if (
          (lifecycleStatus === "VISIBLE" && visibleAt && (!expiresAt || expiresAt > now)) ||
          (lifecycleStatus === "HIDDEN" && hiddenAt)
        ) {
          listingStatus = "ACTIVE";
        } else {
          listingStatus = "NOT_LISTED";
        }
      }

      return {
        unitId: unit.id,
        unitLabel: unit.label,
        propertyTitle: unit.property.title,
        viewCount: unitViews.length,
        reviewCount: unitReviews.length,
        averageRating: Number(avgRating.toFixed(1)),
        listingStatus,
        // Performance score: views + (reviews * 10) + (avgRating * 5)
        performanceScore: unitViews.length + unitReviews.length * 10 + avgRating * 5,
      };
    });

    // Sort by performance score (highest to lowest)
    const sortedUnitStats = unitStats.sort((a, b) => b.performanceScore - a.performanceScore);

    // Aggregate stats for all selected units
    const totalViews = views.length;
    const totalReviews = reviews.length;
    const overallAvgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.json({
      summary: {
        totalViews,
        totalReviews,
        averageRating: Number(overallAvgRating.toFixed(1)),
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString(),
        },
      },
      units: sortedUnitStats,
      rawViews: views, // Raw views data for client-side filtering
      rawReviews: reviews, // Raw reviews data for client-side filtering
    });
  } catch (error) {
    console.error("❌ Error fetching engagement data:", error);
    return res.status(500).json({ error: "Failed to fetch engagement data" });
  }
};

