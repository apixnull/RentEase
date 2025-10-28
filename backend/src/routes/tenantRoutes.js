// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { getSpecificListing, getVisibleListingsForTenant } from "../controllers/tenant/browseUnitController.js";
import { getSpecificTenantScreening, getTenantScreeningInvitations, tenantSubmitScreeningInfo } from "../controllers/tenant/tenantScreeningController.js";
import { getLeaseDetails, getTenantLeases, handleTenantLeaseAction } from "../controllers/tenant/leaseController.js";
import { createMaintenanceRequest } from "../controllers/tenant/requestMaintenanceController.js";

const router = Router();

// ----------------------------------------------------- BROWSE UNIT
router.get("/browse-unit", requireAuthentication(["TENANT"]), getVisibleListingsForTenant);                                 // get all visible unit that is listed
router.get("/browse-unit/:listingId/details", requireAuthentication(["TENANT"]), getSpecificListing);                                            // get the specific listing details of this unit

// ----------------------------------------------------- SUBMIT TENANT SCREENING
router.post("/screening/:screeningId/submit", requireAuthentication(["TENANT"]), tenantSubmitScreeningInfo);              // tenant submits screening info (mock AI analysis)
router.get("/screening/list", requireAuthentication(["TENANT"]), getTenantScreeningInvitations);                          // get all the screening invatation in this tenant 
router.get("/screening/:screeningId/details", requireAuthentication(["TENANT"]), getSpecificTenantScreening)

// ----------------------------------------------------- LEASE
router.get("/lease/list", requireAuthentication(["TENANT"]), getTenantLeases); // Get all tenant leases (grouped)
router.patch("/lease/:leaseId/action", requireAuthentication(["TENANT"]), handleTenantLeaseAction); // Accept or reject lease
router.get("/lease/:leaseId/details", requireAuthentication(["TENANT"]), getLeaseDetails); // Get specific lease details

// ----------------------------------------------------- REQUEST MAINTENANCE
router.post("/maintenance/request", requireAuthentication(["TENANT"]), createMaintenanceRequest);

export default router;

