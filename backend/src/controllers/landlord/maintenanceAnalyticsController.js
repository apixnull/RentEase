// file: maintenanceAnalyticsController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get maintenance request analytics with tenant information
 * @route GET /api/landlord/maintenance-analytics
 * @access Private (LANDLORD)
 * @query period (THIS_MONTH, LAST_MONTH, THIS_YEAR, LAST_YEAR, CUSTOM)
 * @query startMonth (YYYY-MM) - required if period is CUSTOM
 * @query endMonth (YYYY-MM) - required if period is CUSTOM
 */
export const getMaintenanceAnalytics = async (req, res) => {
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
          totalRequests: 0,
          statusCounts: {
            open: 0,
            in_progress: 0,
            resolved: 0,
            cancelled: 0,
            invalid: 0,
          },
          totalProperties: 0,
          totalUnits: 0,
        },
        dailyMaintenanceRequests: [],
        maintenanceBreakdown: [],
        propertiesList: [],
        dateRange: {
          start: dateStart.toISOString(),
          end: dateEnd.toISOString(),
        },
      });
    }

    // Get all maintenance requests for this landlord's properties (filtered by date range)
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        propertyId: { in: propertyIds },
        createdAt: { gte: dateStart, lte: dateEnd },
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        reporterId: true,
        description: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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
        reporter: {
          select: {
            id: true,
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

    // Calculate status counts
    const statusCounts = {
      open: maintenanceRequests.filter((m) => m.status === "OPEN").length,
      in_progress: maintenanceRequests.filter((m) => m.status === "IN_PROGRESS").length,
      resolved: maintenanceRequests.filter((m) => m.status === "RESOLVED").length,
      cancelled: maintenanceRequests.filter((m) => m.status === "CANCELLED").length,
      invalid: maintenanceRequests.filter((m) => m.status === "INVALID").length,
    };

    // Group maintenance requests by day for chart
    const dailyMaintenanceMap = new Map();
    maintenanceRequests.forEach((request) => {
      const dateKey = request.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD format
      const current = dailyMaintenanceMap.get(dateKey) || 0;
      dailyMaintenanceMap.set(dateKey, current + 1);
    });

    // Convert to array and sort
    const dailyMaintenanceRequests = Array.from(dailyMaintenanceMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build maintenance breakdown with tenant info
    const maintenanceBreakdown = maintenanceRequests.map((request) => ({
      requestId: request.id,
      propertyId: request.propertyId,
      propertyTitle: request.property.title,
      unitId: request.unitId,
      unitLabel: request.unit?.label || 'N/A',
      reporterId: request.reporterId,
      reporterName: `${request.reporter.firstName} ${request.reporter.lastName}`,
      reporterEmail: request.reporter.email,
      description: request.description,
      photoUrl: request.photoUrl,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
    }));

    // Get unique unit IDs
    const uniqueUnitIds = new Set(maintenanceRequests.map(m => m.unitId).filter(Boolean));
    const totalUnits = uniqueUnitIds.size;

    // Get properties list for filter
    const propertiesList = properties.map(p => ({
      id: p.id,
      title: p.title,
    }));

    return res.status(200).json({
      summary: {
        totalRequests: maintenanceRequests.length,
        statusCounts,
        totalProperties: properties.length,
        totalUnits,
      },
      dailyMaintenanceRequests,
      maintenanceBreakdown,
      propertiesList,
      dateRange: {
        start: dateStart.toISOString(),
        end: dateEnd.toISOString(),
      },
    });
  } catch (err) {
    console.error("Error fetching maintenance analytics:", err);
    return res.status(500).json({
      error: "Failed to fetch maintenance analytics.",
      details: err.message,
    });
  }
};

