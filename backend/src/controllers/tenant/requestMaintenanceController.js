import prisma from "../../libs/prismaClient.js";
import { createNotification } from "../notificationController.js";

/**
 * @desc Tenant submits a maintenance request
 * @route POST /api/tenant/maintenance/request
 * @access Private (Tenant)
 */
export const createMaintenanceRequest = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    const { propertyId, unitId, description, photoUrl } = req.body;

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

    // ✅ Get property to find landlord ID
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true },
    });

    if (!property) {
      return res.status(404).json({
        error: "Property not found.",
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
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        description: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // ✅ Notify landlord about the maintenance request
    await createNotification(
      property.ownerId,
      "MAINTENANCE",
      "A new maintenance request has been submitted by a tenant. Please review and take action.",
      { maintenanceRequestId: maintenance.id, status: "OPEN" }
    );

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

/**
 * @desc Get all maintenance requests for a tenant (across all their active leases)
 * @route GET /api/tenant/maintenance/requests
 * @access Private (Tenant)
 */
export const getAllTenantRequests = async (req, res) => {
  try {
    const tenantId = req.user?.id;


    // Get all active leases for this tenant
    const activeLeases = await prisma.lease.findMany({
      where: {
        tenantId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
      },
    });

    // Extract unique property and unit IDs from active leases
    const propertyIds = [...new Set(activeLeases.map(lease => lease.propertyId))];
    const unitIds = [...new Set(activeLeases.map(lease => lease.unitId))];

    // Fetch all maintenance requests for this tenant's active leases
    const maintenanceRequests = await prisma.maintenanceRequest.findMany({
      where: {
        reporterId: tenantId,
        propertyId: { in: propertyIds },
        unitId: { in: unitIds },
      },
      select: {
        id: true,
        propertyId: true,
        unitId: true,
        description: true,
        photoUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        
        // Related property info
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
        
        // Related unit info
        unit: {
          select: {
            id: true,
            label: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      message: "Maintenance requests retrieved successfully.",
      maintenanceRequests,
    });
  } catch (err) {
    console.error("Error fetching tenant maintenance requests:", err);
    return res.status(500).json({
      error: "Failed to retrieve maintenance requests.",
      details: err.message,
    });
  }
};

/**
 * @desc Cancel a maintenance request (tenant only)
 * @route PATCH /api/tenant/maintenance/:maintenanceId/cancel
 * @access Private (Tenant)
 */
export const cancelMaintenanceRequest = async (req, res) => {
  try {
    const tenantId = req.user?.id;
    const { maintenanceId } = req.params;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized. Missing tenant ID." });
    }

    // Find the maintenance request
    const maintenance = await prisma.maintenanceRequest.findUnique({
      where: { id: maintenanceId },
      select: {
        id: true,
        reporterId: true,
        status: true,
      },
    });

    if (!maintenance) {
      return res.status(404).json({ error: "Maintenance request not found." });
    }

    // Verify the tenant owns this request
    if (maintenance.reporterId !== tenantId) {
      return res.status(403).json({
        error: "You are not authorized to cancel this maintenance request.",
      });
    }

    // Only allow cancellation if status is OPEN
    if (maintenance.status !== "OPEN") {
      return res.status(400).json({
        error: "Only OPEN maintenance requests can be cancelled.",
      });
    }

    // Update status to CANCELLED
    const updatedMaintenance = await prisma.maintenanceRequest.update({
      where: { id: maintenanceId },
      data: {
        status: "CANCELLED",
      },
      select: {
        id: true,
        status: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      message: "Maintenance request cancelled successfully.",
      maintenance: updatedMaintenance,
    });
  } catch (err) {
    console.error("Error cancelling maintenance request:", err);
    return res.status(500).json({
      error: "Failed to cancel maintenance request.",
      details: err.message,
    });
  }
};
