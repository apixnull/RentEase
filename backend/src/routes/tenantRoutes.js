// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { getSpecificListing, getVisibleListingsForTenant } from "../controllers/tenant/browseUnitController.js";

const router = Router();

router.get("/browse-unit", requireAuthentication(["TENANT"]), getVisibleListingsForTenant);                                 // get all visible unit that is listed
router.get("/browse-unit/:listingId/details", requireAuthentication(["TENANT"]), getSpecificListing);                                            // get the specific listing details of this unit

export default router;
