// file: dashboardController.js
import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get dashboard key metrics for landlord
 * @route GET /api/landlord/dashboard/metrics
 * @access Private (LANDLORD)
 */
export const getDashboardMetrics = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Get all properties with units
    const properties = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        Unit: {
          select: {
            id: true,
            unitCondition: true,
          },
        },
      },
    });

    // Get all listings
    const listings = await prisma.listing.findMany({
      where: { landlordId },
      select: {
        id: true,
        lifecycleStatus: true,
        blockedAt: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    // Get all leases
    const leases = await prisma.lease.findMany({
      where: { landlordId },
      select: {
        id: true,
        unitId: true,
        status: true,
      },
    });

    // Calculate metrics
    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, prop) => sum + prop.Unit.length, 0);

    // Listing metrics
    const advertisedUnits = listings.filter(
      (l) => l.lifecycleStatus === "VISIBLE" || l.lifecycleStatus === "HIDDEN"
    ).length;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const blockedUnits = listings.filter((l) => {
      if (l.lifecycleStatus === "BLOCKED") {
        // Use blockedAt if available, otherwise use updatedAt or createdAt
        const checkDate = l.blockedAt
          ? new Date(l.blockedAt)
          : l.updatedAt
          ? new Date(l.updatedAt)
          : new Date(l.createdAt);
        return checkDate >= thirtyDaysAgo;
      }
      return false;
    }).length;

    const flaggedListings = listings.filter(
      (l) => l.lifecycleStatus === "FLAGGED"
    ).length;

    const waitingReview = listings.filter(
      (l) => l.lifecycleStatus === "WAITING_REVIEW"
    ).length;

    // Lease metrics - get unique unit IDs with active leases
    const activeLeaseUnitIds = new Set(
      leases.filter((l) => l.status === "ACTIVE").map((l) => l.unitId)
    );
    const occupiedUnits = activeLeaseUnitIds.size;
    const vacantUnits = totalUnits - occupiedUnits;

    // Maintenance metrics - count units with UNDER_MAINTENANCE condition
    const underMaintenance = properties.reduce((sum, prop) => {
      return (
        sum +
        prop.Unit.filter((u) => u.unitCondition === "UNDER_MAINTENANCE").length
      );
    }, 0);

    // Get detailed data for modals
    const propertiesWithDetails = await prisma.property.findMany({
      where: { ownerId: landlordId },
      select: {
        id: true,
        title: true,
        street: true,
        barangay: true,
        zipCode: true,
        city: { select: { name: true } },
        municipality: { select: { name: true } },
        Unit: {
          select: {
            id: true,
            label: true,
            unitCondition: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all units with listings
    const allUnitsWithListings = await prisma.unit.findMany({
      where: {
        property: {
          ownerId: landlordId,
        },
      },
      select: {
        id: true,
        label: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
          },
        },
        listings: {
          where: {
            lifecycleStatus: { in: ["VISIBLE", "HIDDEN"] },
          },
          select: {
            id: true,
            lifecycleStatus: true,
          },
          take: 1,
        },
      },
    });

    // Format properties for modal
    const propertiesList = propertiesWithDetails.map((prop) => ({
      id: prop.id,
      title: prop.title,
      address: [
        prop.street,
        prop.barangay,
        prop.city?.name || prop.municipality?.name,
        prop.zipCode,
      ]
        .filter(Boolean)
        .join(", "),
    }));

    // Format all units
    const allUnitsList = propertiesWithDetails.flatMap((prop) =>
      prop.Unit.map((unit) => ({
        id: unit.id,
        label: unit.label,
        propertyTitle: prop.title,
        propertyAddress: [
          prop.street,
          prop.barangay,
          prop.city?.name || prop.municipality?.name,
          prop.zipCode,
        ]
          .filter(Boolean)
          .join(", "),
      }))
    );

    // Get occupied units (units with active leases)
    const occupiedUnitsList = allUnitsList.filter((unit) =>
      activeLeaseUnitIds.has(unit.id)
    );

    // Get vacant units (units without active leases)
    const vacantUnitsList = allUnitsList.filter(
      (unit) => !activeLeaseUnitIds.has(unit.id)
    );

    // Get advertised units (units with active listings)
    const advertisedUnitsList = allUnitsWithListings
      .filter((unit) => unit.listings.length > 0)
      .map((unit) => ({
        id: unit.id,
        label: unit.label,
        propertyTitle: unit.property.title,
        propertyAddress: [
          unit.property.street,
          unit.property.barangay,
          unit.property.city?.name || unit.property.municipality?.name,
          unit.property.zipCode,
        ]
          .filter(Boolean)
          .join(", "),
        listingStatus: unit.listings[0]?.lifecycleStatus || "VISIBLE",
      }));

    return res.status(200).json({
      metrics: {
        totalProperties,
        totalUnits,
        advertisedUnits,
        blockedUnits,
        flaggedListings,
        waitingReview,
        occupiedUnits,
        vacantUnits,
        underMaintenance,
      },
      details: {
        properties: propertiesList,
        allUnits: allUnitsList,
        occupiedUnits: occupiedUnitsList,
        vacantUnits: vacantUnitsList,
        advertisedUnits: advertisedUnitsList,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard metrics",
      details: error.message,
    });
  }
};

/**
 * @desc Get overdue and upcoming payments for landlord dashboard
 * @route GET /api/landlord/dashboard/payments
 * @access Private (LANDLORD)
 */
export const getDashboardPayments = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Get all leases for this landlord
    const leases = await prisma.lease.findMany({
      where: { landlordId },
      select: {
        id: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
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
            avatarUrl: true,
          },
        },
      },
    });

    const leaseIds = leases.map((lease) => lease.id);

    if (leaseIds.length === 0) {
      return res.status(200).json({
        overduePayments: [],
        upcomingPayments: [],
      });
    }

    // Get all payments for these leases
    const allPayments = await prisma.payment.findMany({
      where: {
        leaseId: { in: leaseIds },
        status: "PENDING",
      },
      select: {
        id: true,
        leaseId: true,
        amount: true,
        dueDate: true,
        paidAt: true,
        method: true,
        status: true,
        timingStatus: true,
        type: true,
        note: true,
        createdAt: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // Separate overdue and upcoming payments
    const overduePayments = allPayments
      .filter((payment) => {
        const dueDate = new Date(payment.dueDate);
        return dueDate < today;
      })
      .slice(0, 4) // Limit to 4 records
      .map((payment) => {
        const lease = leases.find((l) => l.id === payment.leaseId);
        return {
          ...payment,
          lease: lease
            ? {
                id: lease.id,
                property: lease.property
                  ? {
                      id: lease.property.id,
                      title: lease.property.title,
                      address: [
                        lease.property.street,
                        lease.property.barangay,
                        lease.property.city?.name ||
                          lease.property.municipality?.name,
                        lease.property.zipCode,
                      ]
                        .filter(Boolean)
                        .join(", "),
                    }
                  : null,
                unit: lease.unit
                  ? {
                      id: lease.unit.id,
                      label: lease.unit.label,
                    }
                  : null,
                tenant: lease.tenant
                  ? {
                      id: lease.tenant.id,
                      firstName: lease.tenant.firstName,
                      lastName: lease.tenant.lastName,
                      email: lease.tenant.email,
                      avatarUrl: lease.tenant.avatarUrl,
                    }
                  : null,
              }
            : null,
        };
      });

    const upcomingPayments = allPayments
      .filter((payment) => {
        const dueDate = new Date(payment.dueDate);
        return dueDate >= today && dueDate <= sevenDaysFromNow;
      })
      .slice(0, 4) // Limit to 4 records
      .map((payment) => {
        const lease = leases.find((l) => l.id === payment.leaseId);
        return {
          ...payment,
          lease: lease
            ? {
                id: lease.id,
                property: lease.property
                  ? {
                      id: lease.property.id,
                      title: lease.property.title,
                      address: [
                        lease.property.street,
                        lease.property.barangay,
                        lease.property.city?.name ||
                          lease.property.municipality?.name,
                        lease.property.zipCode,
                      ]
                        .filter(Boolean)
                        .join(", "),
                    }
                  : null,
                unit: lease.unit
                  ? {
                      id: lease.unit.id,
                      label: lease.unit.label,
                    }
                  : null,
                tenant: lease.tenant
                  ? {
                      id: lease.tenant.id,
                      firstName: lease.tenant.firstName,
                      lastName: lease.tenant.lastName,
                      email: lease.tenant.email,
                      avatarUrl: lease.tenant.avatarUrl,
                    }
                  : null,
              }
            : null,
        };
      });

    return res.status(200).json({
      overduePayments,
      upcomingPayments,
    });
  } catch (error) {
    console.error("Error fetching dashboard payments:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard payments",
      details: error.message,
    });
  }
};

/**
 * @desc Get pending leases and leases completing in 30 days for landlord dashboard
 * @route GET /api/landlord/dashboard/leases
 * @access Private (LANDLORD)
 */
export const getDashboardLeases = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Get pending leases
    const pendingLeases = await prisma.lease.findMany({
      where: {
        landlordId,
        status: "PENDING",
      },
      select: {
        id: true,
        leaseNickname: true,
        leaseType: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        status: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
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
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4, // Limit to 4 records
    });

    // Get active leases that will complete in 30 days
    const activeLeases = await prisma.lease.findMany({
      where: {
        landlordId,
        status: "ACTIVE",
        endDate: {
          not: null,
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      select: {
        id: true,
        leaseNickname: true,
        leaseType: true,
        startDate: true,
        endDate: true,
        rentAmount: true,
        status: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
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
            avatarUrl: true,
          },
        },
      },
      orderBy: { endDate: "asc" },
      take: 4, // Limit to 4 records
    });

    // Format pending leases
    const formattedPendingLeases = pendingLeases.map((lease) => ({
      id: lease.id,
      leaseNickname: lease.leaseNickname,
      leaseType: lease.leaseType,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount,
      status: lease.status,
      createdAt: lease.createdAt,
      property: lease.property
        ? {
            id: lease.property.id,
            title: lease.property.title,
            address: [
              lease.property.street,
              lease.property.barangay,
              lease.property.city?.name || lease.property.municipality?.name,
              lease.property.zipCode,
            ]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      unit: lease.unit
        ? {
            id: lease.unit.id,
            label: lease.unit.label,
          }
        : null,
      tenant: lease.tenant
        ? {
            id: lease.tenant.id,
            firstName: lease.tenant.firstName,
            lastName: lease.tenant.lastName,
            email: lease.tenant.email,
            avatarUrl: lease.tenant.avatarUrl,
          }
        : null,
    }));

    // Format active leases completing in 30 days
    const formattedCompletingLeases = activeLeases.map((lease) => ({
      id: lease.id,
      leaseNickname: lease.leaseNickname,
      leaseType: lease.leaseType,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rentAmount: lease.rentAmount,
      status: lease.status,
      createdAt: lease.createdAt,
      property: lease.property
        ? {
            id: lease.property.id,
            title: lease.property.title,
            address: [
              lease.property.street,
              lease.property.barangay,
              lease.property.city?.name || lease.property.municipality?.name,
              lease.property.zipCode,
            ]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      unit: lease.unit
        ? {
            id: lease.unit.id,
            label: lease.unit.label,
          }
        : null,
      tenant: lease.tenant
        ? {
            id: lease.tenant.id,
            firstName: lease.tenant.firstName,
            lastName: lease.tenant.lastName,
            email: lease.tenant.email,
            avatarUrl: lease.tenant.avatarUrl,
          }
        : null,
    }));

    return res.status(200).json({
      pendingLeases: formattedPendingLeases,
      completingLeases: formattedCompletingLeases,
    });
  } catch (error) {
    console.error("Error fetching dashboard leases:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard leases",
      details: error.message,
    });
  }
};

/**
 * @desc Get pending and submitted tenant screenings for landlord dashboard
 * @route GET /api/landlord/dashboard/screenings
 * @access Private (LANDLORD)
 */
export const getDashboardScreenings = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Get pending screenings
    const pendingScreenings = await prisma.tenantScreening.findMany({
      where: {
        landlordId,
        status: "PENDING",
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        createdAt: true,
        submitted: true,
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4, // Limit to 4 records
    });

    // Get submitted screenings
    const submittedScreenings = await prisma.tenantScreening.findMany({
      where: {
        landlordId,
        status: "SUBMITTED",
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        createdAt: true,
        submitted: true,
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { submitted: "desc" },
      take: 4, // Limit to 4 records
    });

    // Format screenings
    const formatScreening = (screening) => ({
      id: screening.id,
      fullName: screening.fullName,
      status: screening.status,
      createdAt: screening.createdAt,
      submitted: screening.submitted,
      tenant: screening.tenant
        ? {
            id: screening.tenant.id,
            firstName: screening.tenant.firstName,
            lastName: screening.tenant.lastName,
            email: screening.tenant.email,
            avatarUrl: screening.tenant.avatarUrl,
          }
        : null,
    });

    return res.status(200).json({
      pendingScreenings: pendingScreenings.map(formatScreening),
      submittedScreenings: submittedScreenings.map(formatScreening),
    });
  } catch (error) {
    console.error("Error fetching dashboard screenings:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard screenings",
      details: error.message,
    });
  }
};

/**
 * @desc Get open and in-progress maintenance requests for landlord dashboard
 * @route GET /api/landlord/dashboard/maintenance
 * @access Private (LANDLORD)
 */
export const getDashboardMaintenance = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    // Get open maintenance requests
    const openMaintenance = await prisma.maintenanceRequest.findMany({
      where: {
        property: {
          ownerId: landlordId,
        },
        status: "OPEN",
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
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
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4, // Limit to 4 records
    });

    // Get in-progress maintenance requests
    const inProgressMaintenance = await prisma.maintenanceRequest.findMany({
      where: {
        property: {
          ownerId: landlordId,
        },
        status: "IN_PROGRESS",
      },
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        property: {
          select: {
            id: true,
            title: true,
            street: true,
            barangay: true,
            zipCode: true,
            city: { select: { name: true } },
            municipality: { select: { name: true } },
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
            avatarUrl: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 4, // Limit to 4 records
    });

    // Format maintenance requests
    const formatMaintenance = (maintenance) => ({
      id: maintenance.id,
      description: maintenance.description,
      status: maintenance.status,
      createdAt: maintenance.createdAt,
      updatedAt: maintenance.updatedAt,
      property: maintenance.property
        ? {
            id: maintenance.property.id,
            title: maintenance.property.title,
            address: [
              maintenance.property.street,
              maintenance.property.barangay,
              maintenance.property.city?.name ||
                maintenance.property.municipality?.name,
              maintenance.property.zipCode,
            ]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      unit: maintenance.unit
        ? {
            id: maintenance.unit.id,
            label: maintenance.unit.label,
          }
        : null,
      reporter: maintenance.reporter
        ? {
            id: maintenance.reporter.id,
            firstName: maintenance.reporter.firstName,
            lastName: maintenance.reporter.lastName,
            email: maintenance.reporter.email,
            avatarUrl: maintenance.reporter.avatarUrl,
          }
        : null,
    });

    return res.status(200).json({
      openMaintenance: openMaintenance.map(formatMaintenance),
      inProgressMaintenance: inProgressMaintenance.map(formatMaintenance),
    });
  } catch (error) {
    console.error("Error fetching dashboard maintenance:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard maintenance",
      details: error.message,
    });
  }
};

/**
 * @desc Get listings data for landlord dashboard
 * @route GET /api/landlord/dashboard/listings
 * @access Private (LANDLORD)
 */
export const getDashboardListings = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    // First day of current month
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Last day of current month
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get pending review listings
    const pendingReview = await prisma.listing.findMany({
      where: {
        landlordId,
        lifecycleStatus: "WAITING_REVIEW",
      },
      select: {
        id: true,
        lifecycleStatus: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    // Get listings expiring in 30 days
    const expiringListings = await prisma.listing.findMany({
      where: {
        landlordId,
        lifecycleStatus: { in: ["VISIBLE", "HIDDEN"] },
        expiresAt: {
          not: null,
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      select: {
        id: true,
        lifecycleStatus: true,
        expiresAt: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { expiresAt: "asc" },
      take: 4,
    });

    // Get blocked listings this month
    const blockedListings = await prisma.listing.findMany({
      where: {
        landlordId,
        lifecycleStatus: "BLOCKED",
        blockedAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        id: true,
        lifecycleStatus: true,
        blockedAt: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { blockedAt: "desc" },
      take: 4,
    });

    // Get all flagged listings
    const flaggedListings = await prisma.listing.findMany({
      where: {
        landlordId,
        lifecycleStatus: "FLAGGED",
      },
      select: {
        id: true,
        lifecycleStatus: true,
        flaggedAt: true,
        createdAt: true,
        unit: {
          select: {
            id: true,
            label: true,
            property: {
              select: {
                id: true,
                title: true,
                street: true,
                barangay: true,
                zipCode: true,
                city: { select: { name: true } },
                municipality: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { flaggedAt: "desc" },
      take: 4,
    });

    // Format listings
    const formatListing = (listing) => ({
      id: listing.id,
      lifecycleStatus: listing.lifecycleStatus,
      expiresAt: listing.expiresAt,
      blockedAt: listing.blockedAt,
      flaggedAt: listing.flaggedAt,
      createdAt: listing.createdAt,
      property: listing.unit?.property
        ? {
            id: listing.unit.property.id,
            title: listing.unit.property.title,
            address: [
              listing.unit.property.street,
              listing.unit.property.barangay,
              listing.unit.property.city?.name || listing.unit.property.municipality?.name,
              listing.unit.property.zipCode,
            ]
              .filter(Boolean)
              .join(", "),
          }
        : null,
      unit: listing.unit
        ? {
            id: listing.unit.id,
            label: listing.unit.label,
          }
        : null,
    });

    return res.status(200).json({
      pendingReview: pendingReview.map(formatListing),
      expiringListings: expiringListings.map(formatListing),
      blockedListings: blockedListings.map(formatListing),
      flaggedListings: flaggedListings.map(formatListing),
    });
  } catch (error) {
    console.error("Error fetching dashboard listings:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard listings",
      details: error.message,
    });
  }
};

/**
 * @desc Get financial activity data for landlord dashboard
 * @route GET /api/landlord/dashboard/financial
 * @access Private (LANDLORD)
 */
export const getDashboardFinancial = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    if (!landlordId) {
      return res.status(401).json({ error: "Unauthorized: landlord not found." });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get all transactions for this month
    const transactions = await prisma.transaction.findMany({
      where: {
        property: {
          ownerId: landlordId,
        },
        date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth,
        },
      },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
      },
    });

    // Calculate totals
    const monthlyIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const netRevenue = monthlyIncome - monthlyExpenses;

    return res.status(200).json({
      monthlyIncome,
      monthlyExpenses,
      netRevenue,
    });
  } catch (error) {
    console.error("Error fetching dashboard financial:", error);
    return res.status(500).json({
      error: "Failed to fetch dashboard financial",
      details: error.message,
    });
  }
};

