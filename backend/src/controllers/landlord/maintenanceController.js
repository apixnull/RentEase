import prisma from "../../libs/prismaClient.js";

/**
 * @desc Get all maintenance requests for a landlord
 * @route GET /api/landlord/maintenance/requests
 * @access Private (Landlord)
 */
export const getAllMaintenanceRequestsByLandlord = async (req, res) => {
  try {
    const landlordId = req.user?.id;

    // Fetch all maintenance requests for properties owned by this landlord
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        property: {
          ownerId: landlordId,
        },
      },
      select: {
        id: true,
        description: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,

        // Related info
        property: {
          select: {
            id: true,
            title: true,
            type: true,
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
            phoneNumber: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ maintenanceRequests });
  } catch (err) {
    console.error("Error fetching maintenance requests:", err);
    return res.status(500).json({
      error: "Failed to retrieve maintenance requests.",
      details: err.message,
    });
  }
};

/**
 * @desc Update maintenance request status (OPEN, IN_PROGRESS, RESOLVED)
 * @route PATCH /api/landlord/maintenance/:maintenanceId/status
 * @access Private (LANDLORD)
 */
export const updateMaintenanceStatus = async (req, res) => {
  try {
    const landlordId = req.user?.id;
    const { maintenanceId } = req.params;
    const { status } = req.body; // 👈 new desired status


    // Landlords can set: OPEN, IN_PROGRESS, RESOLVED, INVALID
    // They cannot set CANCELLED (only tenants can cancel)
    // But they CAN update a CANCELLED request to any other status
    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "INVALID"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}. Landlords cannot set status to CANCELLED.`,
      });
    }

    // --- Verify ownership ---
    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      include: {
        property: { select: { ownerId: true, title: true } },
      },
    });

    if (!maintenance) {
      return res.status(404).json({ error: "Maintenance request not found." });
    }

    if (maintenance.property.ownerId !== landlordId) {
      return res.status(403).json({
        error: "You are not authorized to update this maintenance request.",
      });
    }

    // Prevent updating final statuses (RESOLVED, INVALID, CANCELLED) - these cannot be changed
    const finalStatuses = ["RESOLVED", "INVALID", "CANCELLED"];
    if (finalStatuses.includes(maintenance.status)) {
      return res.status(400).json({
        error: `Cannot update a ${maintenance.status} maintenance request. This status is final and cannot be changed.`,
      });
    }

    // Fetch the maintenance request with unit info
    const maintenanceWithUnit = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      include: {
        unit: {
          select: { id: true },
        },
      },
    });

    // Update the maintenance request status and unit condition if applicable
    const updatedMaintenance = await prisma.maintenanceRequest.update({
      where: { id: maintenanceId },
      data: { status },
      select: {
        id: true,
        status: true,
        updatedAt: true,
        unitId: true,
      },
    });

    // Update unit condition based on status change
    if (maintenanceWithUnit.unitId) {
      if (status === "IN_PROGRESS") {
        // Set unit condition to UNDER_MAINTENANCE when maintenance starts
        await prisma.unit.update({
          where: { id: maintenanceWithUnit.unitId },
          data: { unitCondition: "UNDER_MAINTENANCE" },
        });
      } else if (status === "RESOLVED") {
        // Check if there are any other active maintenance requests for this unit
        const activeMaintenanceCount = await prisma.maintenanceRequest.count({
          where: {
            unitId: maintenanceWithUnit.unitId,
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
            id: {
              not: maintenanceId, // Exclude the current request
            },
          },
        });

        // Only set back to GOOD if there are no other active maintenance requests
        if (activeMaintenanceCount === 0) {
          await prisma.unit.update({
            where: { id: maintenanceWithUnit.unitId },
            data: { unitCondition: "GOOD" },
          });
        }
      } else if (status === "OPEN" && maintenance.status === "IN_PROGRESS") {
        // If changing from IN_PROGRESS back to OPEN, check if there are other active requests
        const activeMaintenanceCount = await prisma.maintenanceRequest.count({
          where: {
            unitId: maintenanceWithUnit.unitId,
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
            id: {
              not: maintenanceId, // Exclude the current request
            },
          },
        });

        // Only set back to GOOD if there are no other active maintenance requests
        if (activeMaintenanceCount === 0) {
          await prisma.unit.update({
            where: { id: maintenanceWithUnit.unitId },
            data: { unitCondition: "GOOD" },
          });
        }
      }
    }

    return res.status(200).json({
      message: `Maintenance request marked as ${status} for "${maintenance.property.title}".`,
      maintenance: updatedMaintenance,
    });
  } catch (err) {
    console.error("Error updating maintenance status:", err);
    return res.status(500).json({
      error: "Failed to update maintenance status.",
      details: err.message,
    });
  }
};
