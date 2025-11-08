// file: routes/adminRoutes.js
import { Router } from "express";
import { getAllListingsForAdmin, getListingUnitAndProperty, getSpecificListingAdmin, updateListingStatus } from "../controllers/admin/listingController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();


// ----------------------------------------------------- LISTINGS
router.get("/listings", requireAuthentication(["ADMIN"]), getAllListingsForAdmin);                                                          // 🧾 Get all listings with property, unit, landlord, and review info
router.get("/listings/:listingId/details", requireAuthentication(["ADMIN"]), getSpecificListingAdmin);                                      // 🧾 Get all specific listings 
router.get("/listings/:listingId/unit-property", requireAuthentication(["ADMIN"]), getListingUnitAndProperty);                              // 🧾 Get unit and property info using listing id 
router.patch("/listings/:listingId/status",requireAuthentication(["ADMIN"]), updateListingStatus);                                          // ⚙️ Approve, Flag, or Block listing

export default router;