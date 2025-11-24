// file: routes/adminRoutes.js
import { Router } from "express";
import { getAllListingsForAdmin, getEarningsSummary, getListingUnitAndProperty, getSpecificListingAdmin, updateListingStatus } from "../controllers/admin/listingController.js";
import { getAllUsers, getUserDetails, updateUserStatus } from "../controllers/admin/userController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();

// ----------------------------------------------------- USERS
router.get("/users", requireAuthentication(["ADMIN"]), getAllUsers); // 👥 Get all users sorted by recently created
router.get("/users/:userId", requireAuthentication(["ADMIN"]), getUserDetails); // 👤 Get detailed profile info for specific user
router.patch("/users/:userId/status", requireAuthentication(["ADMIN"]), updateUserStatus); // 🚫 Block or unblock user

// ----------------------------------------------------- LISTINGS
router.get("/listings", requireAuthentication(["ADMIN"]), getAllListingsForAdmin);                                                          // 🧾 Get all listings with property, unit, landlord, and review info
router.get("/listings/:listingId/details", requireAuthentication(["ADMIN"]), getSpecificListingAdmin);                                      // 🧾 Get all specific listings 
router.get("/listings/:listingId/unit-property", requireAuthentication(["ADMIN"]), getListingUnitAndProperty);                              // 🧾 Get unit and property info using listing id 
router.patch("/listings/:listingId/status",requireAuthentication(["ADMIN"]), updateListingStatus);                                          // ⚙️ Approve, Flag, or Block listing
router.get("/earnings", requireAuthentication(["ADMIN"]), getEarningsSummary);                                                              // 💰 Aggregate platform earnings

export default router;