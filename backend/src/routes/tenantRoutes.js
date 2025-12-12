// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { getSpecificListing, getVisibleListingsForTenant, getCitiesAndMunicipalities, searchListings, handleAIChatbotMessage, recordUnitView, createUnitReview, updateUnitReview, deleteUnitReview } from "../controllers/tenant/browseUnitController.js";
import { getSpecificTenantScreening, getTenantScreeningInvitations, tenantSubmitScreeningInfo, tenantRejectScreeningInvitation } from "../controllers/tenant/tenantScreeningController.js";
import { getLeaseDetails, getTenantLeases, handleTenantLeaseAction } from "../controllers/tenant/leaseController.js";
import { createMaintenanceRequest, getAllTenantRequests, cancelMaintenanceRequest } from "../controllers/tenant/requestMaintenanceController.js";
import { createFraudReport } from "../controllers/fraudReportController.js";

const router = Router();

// ----------------------------------------------------- BROWSE UNIT
router.get("/browse-unit/cities-municipalities", requireAuthentication(["TENANT"]), getCitiesAndMunicipalities);  // get all cities and municipalities
router.get("/browse-unit", requireAuthentication(["TENANT"]), getVisibleListingsForTenant);                        // get all visible unit that is listed (with search & filters)
router.get("/browse-unit/search", requireAuthentication(["TENANT"]), searchListings);                             // server-side search with filters
router.post("/browse-unit/ai-chat", requireAuthentication(["TENANT"]), handleAIChatbotMessage);                    // AI chatbot for rental inquiries
router.get("/browse-unit/:listingId/details", requireAuthentication(["TENANT"]), getSpecificListing);              // get the specific listing details of this unit
router.post("/browse-unit/:unitId/view", requireAuthentication(["TENANT"]), recordUnitView);                        // record unit view (after 20 seconds)
router.post("/browse-unit/:unitId/review", requireAuthentication(["TENANT"]), createUnitReview);                    // create unit review
router.patch("/browse-unit/review/:reviewId", requireAuthentication(["TENANT"]), updateUnitReview);                 // update unit review
router.delete("/browse-unit/review/:reviewId", requireAuthentication(["TENANT"]), deleteUnitReview);               // delete unit review
router.post("/fraud-reports", requireAuthentication(["TENANT"]), createFraudReport);                               // report fraudulent listings

// ----------------------------------------------------- SUBMIT TENANT SCREENING
router.post("/screening/:screeningId/submit", requireAuthentication(["TENANT"]), tenantSubmitScreeningInfo);              // tenant submits screening info (mock AI analysis)
router.post("/screening/:screeningId/reject", requireAuthentication(["TENANT"]), tenantRejectScreeningInvitation);        // tenant rejects screening invitation
router.get("/screening/list", requireAuthentication(["TENANT"]), getTenantScreeningInvitations);                          // get all the screening invatation in this tenant 
router.get("/screening/:screeningId/details", requireAuthentication(["TENANT"]), getSpecificTenantScreening)

// ----------------------------------------------------- LEASE
router.get("/lease/list", requireAuthentication(["TENANT"]), getTenantLeases); // Get all tenant leases (grouped)
router.patch("/lease/:leaseId/action", requireAuthentication(["TENANT"]), handleTenantLeaseAction); // Accept or reject lease
router.get("/lease/:leaseId/details", requireAuthentication(["TENANT"]), getLeaseDetails); // Get specific lease details

// ----------------------------------------------------- REQUEST MAINTENANCE
router.post("/maintenance/request", requireAuthentication(["TENANT"]), createMaintenanceRequest);
router.get("/maintenance/requests", requireAuthentication(["TENANT"]), getAllTenantRequests);
router.patch("/maintenance/:maintenanceId/cancel", requireAuthentication(["TENANT"]), cancelMaintenanceRequest);

export default router;

