import prisma from "../../libs/prismaClient.js";

/**
 * @desc Tenant submits a maintenance request
 * @route POST /api/tenant/maintenance/request
 * @access Private (Tenant)
 */
export const createMaintenanceRequest = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    const { propertyId, unitId, description, photoUrl } = req.body;

    if (!tenantId)
      return res.status(401).json({ error: "Unauthorized. Missing tenant ID." });

    if (!propertyId || !unitId || !description)
      return res.status(400).json({
        error: "Missing required fields: propertyId, unitId, description.",
      });

    // ✅ Optional: Verify that this tenant actually rents this unit
    const activeLease = await prisma.lease.findFirst({
      where: {
        tenantId,
        unitId,
        propertyId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (!activeLease) {
      return res.status(403).json({
        error: "You are not authorized to request maintenance for this unit.",
      });
    }

    // ✅ Create the maintenance request
    const maintenance = await prisma.maintenanceRequest.create({
      data: {
        propertyId,
        unitId,
        reporterId: tenantId,
        description,
        photoUrl: photoUrl || null,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      message: "Maintenance request submitted successfully.",
      maintenance,
    });
  } catch (err) {
    console.error("Error creating maintenance request:", err);
    return res.status(500).json({
      error: "Failed to create maintenance request.",
      details: err.message,
    });
  }
};
