// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { getSpecificListing, getVisibleListingsForTenant } from "../controllers/tenant/browseUnitController.js";
import { getSpecificTenantScreening, getTenantScreeningInvitations, tenantSubmitScreeningInfo } from "../controllers/tenant/tenantScreeningController.js";

const router = Router();

// browse unit listing
router.get("/browse-unit", requireAuthentication(["TENANT"]), getVisibleListingsForTenant);                                 // get all visible unit that is listed
router.get("/browse-unit/:listingId/details", requireAuthentication(["TENANT"]), getSpecificListing);                                            // get the specific listing details of this unit


// submit screening information
router.post("/screening/:screeningId/submit", requireAuthentication(["TENANT"]), tenantSubmitScreeningInfo);              // tenant submits screening info (mock AI analysis)
router.get("/screening/list", requireAuthentication(["TENANT"]), getTenantScreeningInvitations);                          // get all the screening invatation in this tenant 
router.get("/screening/:screeningId/details", requireAuthentication(["TENANT"]), getSpecificTenantScreening)

export default router;

