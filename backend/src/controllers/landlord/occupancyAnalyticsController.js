// file: occupancyAnalyticsController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get occupancy analytics for all units and properties
 * @route GET /api/landlord/occupancy-analytics
 * @access Private (LANDLORD)
 * @query year (optional, defaults to current year)
 */
export const getOccupancyAnalytics = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const { year } = req.query;
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    // Year range: January 1 to December 31
    const yearStart = new Date(targetYear, 0, 1);
    yearStart.setHours(0, 0, 0, 0);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59, 999);
    
    // For calculating occupancy, use current date if viewing current year, otherwise use year end
    // We only count actual days occupied, not projected future days
    const effectiveYearEnd = targetYear === now.getFullYear() 
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
      : yearEnd;
    
    // Calculate actual days in the period (current year up to today, or full year for past years)
    const daysInYear = targetYear === now.getFullYear()
      ? Math.ceil((effectiveYearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : (targetYear % 4 === 0 && (targetYear % 100 !== 0 || targetYear % 400 === 0) ? 366 : 365);

    // Get all properties and units owned by landlord
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
          orderBy: { label: 'asc' },
        },
      },
      orderBy: { title: 'asc' },
    });

    if (properties.length === 0) {
      return res.status(200).json({
        year: targetYear,
        summary: {
          totalProperties: 0,
          totalUnits: 0,
          occupiedUnits: 0,
          vacantUnits: 0,
          overallOccupancyRate: 0,
        },
        properties: [],
        dateRange: {
          start: yearStart.toISOString(),
          end: yearEnd.toISOString(),
        },
      });
    }

    // Get all leases that overlap with the target year
    // Only include ACTIVE, COMPLETED, and TERMINATED leases (exclude PENDING and CANCELLED)
    // Include leases that started before the year but ended during/after, or started during/after the year
    const allLeases = await prisma.lease.findMany({
      where: {
        landlordId,
        status: {
          in: ['ACTIVE', 'COMPLETED', 'TERMINATED'], // Only include these statuses
        },
        OR: [
          // Lease starts before year end and ends after year start (overlaps)
          {
            AND: [
              { startDate: { lte: yearEnd } },
              {
                OR: [
                  { endDate: { gte: yearStart } },
                  { endDate: null }, // Active leases without end date
                ],
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        tenantId: true,
        startDate: true,
        endDate: true,
        status: true,
        rentAmount: true,
        createdAt: true,
        updatedAt: true, // Needed for TERMINATED leases
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
      orderBy: { startDate: 'asc' },
    });

    // Helper function to calculate days occupied in the year
    // Only counts ACTUAL days occupied, not projected future days
    const calculateDaysOccupiedInYear = (lease) => {
      const leaseStart = new Date(lease.startDate);
      
      // Determine the actual end date based on lease status
      let leaseEnd;
      if (lease.status === 'TERMINATED') {
        // For TERMINATED leases, use updatedAt (when it was terminated)
        leaseEnd = new Date(lease.updatedAt);
      } else if (lease.status === 'ACTIVE') {
        // For ACTIVE leases, use the earliest of: endDate, current date, or year end
        // We don't count future days that haven't happened yet
        const possibleEnds = [];
        if (lease.endDate) {
          possibleEnds.push(new Date(lease.endDate));
        }
        possibleEnds.push(effectiveYearEnd); // Current date or year end
        leaseEnd = new Date(Math.min(...possibleEnds.map(d => d.getTime())));
      } else {
        // For COMPLETED leases, use endDate
        leaseEnd = lease.endDate ? new Date(lease.endDate) : effectiveYearEnd;
      }
      
      // Clamp dates to the effective year range (start of year to effective end)
      const actualStart = leaseStart < yearStart ? yearStart : leaseStart;
      const actualEnd = leaseEnd > effectiveYearEnd ? effectiveYearEnd : leaseEnd;
      
      // If start is after end, no occupancy
      if (actualStart > actualEnd) return 0;
      
      // Calculate difference in days (inclusive of both start and end)
      const diffTime = actualEnd.getTime() - actualStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    };

    // Process data by property
    const propertiesData = properties.map((property) => {
      const propertyUnits = property.Unit.map((unit) => {
        // Get all leases for this unit
        const unitLeases = allLeases.filter(
          (lease) => lease.unitId === unit.id && lease.propertyId === property.id
        );

        // Filter leases that overlap with the effective year period
        const yearLeases = unitLeases.filter((lease) => {
          const leaseStart = new Date(lease.startDate);
          
          // Determine the actual end date based on lease status
          let leaseEnd;
          if (lease.status === 'TERMINATED') {
            leaseEnd = new Date(lease.updatedAt);
          } else if (lease.status === 'ACTIVE') {
            // For ACTIVE leases, use the earliest of: endDate, current date, or year end
            const possibleEnds = [];
            if (lease.endDate) {
              possibleEnds.push(new Date(lease.endDate));
            }
            possibleEnds.push(effectiveYearEnd);
            leaseEnd = new Date(Math.min(...possibleEnds.map(d => d.getTime())));
          } else {
            // COMPLETED
            leaseEnd = lease.endDate ? new Date(lease.endDate) : effectiveYearEnd;
          }
          
          // Lease overlaps if it starts before effective end and ends after year start
          return leaseStart <= effectiveYearEnd && leaseEnd >= yearStart;
        });

        // Calculate total days occupied
        let totalDaysOccupied = 0;
        const leasePeriods = yearLeases.map((lease) => {
          const daysOccupied = calculateDaysOccupiedInYear(lease);
          totalDaysOccupied += daysOccupied;
          
          // Determine the effective end date for display
          let effectiveEndDate;
          if (lease.status === 'TERMINATED') {
            effectiveEndDate = lease.updatedAt; // When it was terminated
          } else if (lease.status === 'ACTIVE') {
            // For ACTIVE leases, show the actual end date used in calculation
            // (either endDate if it's in the past, or current date)
            if (lease.endDate && new Date(lease.endDate) <= effectiveYearEnd) {
              effectiveEndDate = lease.endDate;
            } else {
              // Show null for ongoing active leases (they don't have an end yet)
              effectiveEndDate = null;
            }
          } else {
            effectiveEndDate = lease.endDate;
          }
          
          return {
            leaseId: lease.id,
            startDate: lease.startDate.toISOString(),
            endDate: effectiveEndDate ? effectiveEndDate.toISOString() : null,
            status: lease.status,
            rentAmount: lease.rentAmount,
            createdAt: lease.createdAt.toISOString(),
            daysOccupied,
            tenant: lease.tenant,
          };
        });

        // Calculate occupancy rate for this unit
        const occupancyRate = daysInYear > 0 ? ((totalDaysOccupied / daysInYear) * 100) : 0;
        const isOccupied = totalDaysOccupied > 0;

        return {
          unitId: unit.id,
          unitLabel: unit.label,
          totalLeases: yearLeases.length,
          totalDaysOccupied,
          occupancyRate: Math.round(occupancyRate * 10) / 10, // Round to 1 decimal
          isOccupied,
          leases: leasePeriods,
        };
      });

      // Calculate property-level stats
      const totalPropertyUnits = propertyUnits.length;
      const occupiedPropertyUnits = propertyUnits.filter((u) => u.isOccupied).length;
      const totalPropertyDaysOccupied = propertyUnits.reduce((sum, u) => sum + u.totalDaysOccupied, 0);
      const propertyOccupancyRate =
        totalPropertyUnits > 0
          ? (totalPropertyDaysOccupied / (totalPropertyUnits * daysInYear)) * 100
          : 0;

      return {
        propertyId: property.id,
        propertyTitle: property.title,
        totalUnits: totalPropertyUnits,
        occupiedUnits: occupiedPropertyUnits,
        vacantUnits: totalPropertyUnits - occupiedPropertyUnits,
        occupancyRate: Math.round(propertyOccupancyRate * 10) / 10,
        units: propertyUnits,
      };
    });

    // Calculate overall summary
    const allUnits = propertiesData.flatMap((p) => p.units);
    const totalUnits = allUnits.length;
    const occupiedUnits = allUnits.filter((u) => u.isOccupied).length;
    const totalDaysOccupied = allUnits.reduce((sum, u) => sum + u.totalDaysOccupied, 0);
    const overallOccupancyRate =
      totalUnits > 0 ? (totalDaysOccupied / (totalUnits * daysInYear)) * 100 : 0;

    return res.status(200).json({
      year: targetYear,
      summary: {
        totalProperties: properties.length,
        totalUnits,
        occupiedUnits,
        vacantUnits: totalUnits - occupiedUnits,
        overallOccupancyRate: Math.round(overallOccupancyRate * 10) / 10,
        daysInYear,
      },
      properties: propertiesData,
      dateRange: {
        start: yearStart.toISOString(),
        end: effectiveYearEnd.toISOString(),
      },
      daysInPeriod: daysInYear, // Actual days in the period (up to today for current year)
    });
  } catch (error) {
    console.error("Error fetching occupancy analytics:", error);
    return res.status(500).json({
      error: "Failed to fetch occupancy analytics",
      details: error.message,
    });
  }
};

