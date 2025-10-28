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
          landlordId,
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
            street: true,
            barangay: true,
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


    const validStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}.`,
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

    return res.status(200).json({
      message: `Maintenance request marked as ${status} for "${maintenance.property.title}".`,
    });
  } catch (err) {
    console.error("Error updating maintenance status:", err);
    return res.status(500).json({
      error: "Failed to update maintenance status.",
      details: err.message,
    });
  }
};
