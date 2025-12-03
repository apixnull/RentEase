// file: routes/adminRoutes.js
import { Router } from "express";
import { getAllListingsForAdmin, getListingUnitAndProperty, getSpecificListingAdmin, updateListingStatus } from "../controllers/admin/listingController.js";
import { getAllUsers, getUserDetails, updateUserStatus, deleteLandlordOffense } from "../controllers/admin/userController.js";
import { getFraudReports, getFraudReportsAnalytics } from "../controllers/fraudReportController.js";
import { getUserAnalytics, getListingAnalytics } from "../controllers/admin/reportAnalyticsController.js";
import { getAdminDashboard } from "../controllers/admin/dashboardController.js";
import { triggerPaymentReminders } from "../controllers/admin/paymentReminderController.js";
import { triggerListingExpiration } from "../controllers/admin/listingExpirationController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();

// ----------------------------------------------------- Dashboard 
router.get("/dashboard", requireAuthentication(["ADMIN"]), getAdminDashboard); 

// ----------------------------------------------------- USERS
router.get("/users", requireAuthentication(["ADMIN"]), getAllUsers); // 👥 Get all users sorted by recently created
router.get("/users/:userId", requireAuthentication(["ADMIN"]), getUserDetails); // 👤 Get detailed profile info for specific user
router.patch("/users/:userId/status", requireAuthentication(["ADMIN"]), updateUserStatus); // 🚫 Block or unblock user
router.delete("/users/offenses/:offenseId", requireAuthentication(["ADMIN"]), deleteLandlordOffense); // 🗑️ Delete landlord offense

// ----------------------------------------------------- LISTINGS
router.get("/listings", requireAuthentication(["ADMIN"]), getAllListingsForAdmin);                                                          // 🧾 Get all listings with property, unit, landlord, and review info
router.get("/listings/:listingId/details", requireAuthentication(["ADMIN"]), getSpecificListingAdmin);                                      // 🧾 Get all specific listings 
router.get("/listings/:listingId/unit-property", requireAuthentication(["ADMIN"]), getListingUnitAndProperty);                              // 🧾 Get unit and property info using listing id 
router.patch("/listings/:listingId/status",requireAuthentication(["ADMIN"]), updateListingStatus);  

// ----------------------------------------------------- FRAUD REPORTS
router.get("/fraud-reports", requireAuthentication(["ADMIN"]), getFraudReports);                                                           // 🚨 Tenant fraud reports
                    
// ----------------------------------------------------- REPORT ANALYTICS
router.get("/report-analytics/users", requireAuthentication(["ADMIN"]), getUserAnalytics);                                                           // 📊 User analytics for reports
router.get("/report-analytics/listings", requireAuthentication(["ADMIN"]), getListingAnalytics);                                                    // 📊 Listing analytics for reports
router.get("/report-analytics/fraud-reports", requireAuthentication(["ADMIN"]), getFraudReportsAnalytics);                                                       // 📊 Reports analytics with status breakdown

// ----------------------------------------------------- PAYMENT REMINDERS (Testing/Admin)
router.post("/payment-reminders/trigger", requireAuthentication(["ADMIN"]), triggerPaymentReminders);                                               // 🔔 Manually trigger payment reminder emails

// ----------------------------------------------------- LISTING EXPIRATION (Testing/Admin)
router.post("/listing-expiration/trigger", requireAuthentication(["ADMIN"]), triggerListingExpiration);                                             // 📅 Manually trigger listing expiration process

export default router;