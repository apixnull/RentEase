// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { createProperty, getAmenities, getCitiesAndMunicipalities, getLandlordProperties, getPropertyDetailsAndUnits, getPropertyEditableData, updateProperty, deleteProperty, } from "../controllers/landlord/propertyController.js";
import { createUnit, getUnitDetails, updateUnit, deleteUnit } from "../controllers/landlord/unitController.js";
import { createPaymentSession, getEligibleUnitsForListing, getLandlordListings, getLandlordSpecificListing, getUnitForListingReview, getListingByUnitIdForSuccess, toggleListingVisibility} from "../controllers/landlord/listingController.js";
import { getLandlordScreeningsList, getSpeceficScreeningLandlord, inviteTenantForScreening, landlordReviewTenantScreening, deletePendingScreening} from "../controllers/landlord/tenantScreeningController.js";
import { cancelLease, createLease, createPayment, findTenantForLease, getAllLeases, getAllPropertiesWithUnits, getAllPropertiesWithUnitsAndSuggestedTenants, getLeaseById, getLandlordMonthlyPayments, markPaymentAsPaid, updatePayment, deletePayment, terminateLease, completeLease, updateLease, addLandlordNote, updateLandlordNote, deleteLandlordNote } from "../controllers/landlord/leaseController.js";
import { getAllMaintenanceRequestsByLandlord, updateMaintenanceStatus} from "../controllers/landlord/maintenanceController.js";
import { getAllTransactions, createTransaction, updateTransaction, deleteTransaction, getPropertiesWithUnits } from "../controllers/landlord/financialController.js";
import { getEngagementData } from "../controllers/landlord/engagementController.js";
import { getDashboardMetrics, getDashboardPayments, getDashboardLeases, getDashboardScreenings, getDashboardMaintenance, getDashboardListings, getDashboardFinancial } from "../controllers/landlord/dashboardController.js";
import { getReportsData } from "../controllers/landlord/reportsController.js";
import { getLeaseAnalytics } from "../controllers/landlord/leaseAnalyticsController.js";
import { getMaintenanceAnalytics } from "../controllers/landlord/maintenanceAnalyticsController.js";


const router = Router();

// ----------------------------------------------------- PROPERTY 
router.get("/property/amenities", requireAuthentication(["LANDLORD"]), getAmenities);                                 // get all amenity
router.get("/property/city-municipality", requireAuthentication(["LANDLORD"]), getCitiesAndMunicipalities);           // get all city and municipality
router.post("/property/create", requireAuthentication(["LANDLORD"]), createProperty);                                 // create a new property
router.get("/property/properties", requireAuthentication(["LANDLORD"]), getLandlordProperties);                       // get all properties owned by landlord
router.get("/property/:propertyId/edit-data", requireAuthentication(["LANDLORD"]), getPropertyEditableData);                 // get property info for edit
router.patch("/property/:propertyId", requireAuthentication(["LANDLORD"]), updateProperty);                                  // update an existing property
router.delete("/property/:propertyId", requireAuthentication(["LANDLORD"]), deleteProperty);                                // delete a property
router.get("/property/:propertyId", requireAuthentication(["LANDLORD"]), getPropertyDetailsAndUnits);                         // get specific property details

// ----------------------------------------------------- UNIT
router.get("/unit/:unitId", requireAuthentication(["LANDLORD"]), getUnitDetails);                                     // get specific unit details 
router.post("/unit/:propertyId/create", requireAuthentication(["LANDLORD"]), createUnit);                             // create a new unit
router.patch("/unit/:unitId", requireAuthentication(["LANDLORD"]), updateUnit);                                       // update an existing unit
router.delete("/unit/:unitId", requireAuthentication(["LANDLORD"]), deleteUnit);                                     // delete a unit


// ----------------------------------------------------- LISTING
router.get("/listings", requireAuthentication(["LANDLORD"]), getLandlordListings);                                        // landlord's listings
router.get("/listing/eligible-units", requireAuthentication(["LANDLORD"]), getEligibleUnitsForListing);                   // get units that can be listed
router.get("/listing/payment-success", requireAuthentication(["LANDLORD"]), getListingByUnitIdForSuccess);              // get listing by unitId for payment success page (MUST be before parameterized routes)
router.get("/listing/:unitId/review", requireAuthentication(["LANDLORD"]), getUnitForListingReview);                      // review unit before listing
router.post("/listing/:unitId/payment-session", requireAuthentication(["LANDLORD"]), createPaymentSession);              // create payment session (listing created after payment via webhook)
router.get("/listing/:listingId/details", requireAuthentication(["LANDLORD"]), getLandlordSpecificListing);               // get a specific listing information
router.patch("/listing/:listingId/toggle-visibility", requireAuthentication(["LANDLORD"]), toggleListingVisibility);    // toggle listing visibility (VISIBLE ↔ HIDDEN) 

// ----------------------------------------------------- TENANT SCREENING
router.post("/screening/invite", requireAuthentication(["LANDLORD"]), inviteTenantForScreening);                             // landlord invites tenant for screening
router.post("/screening/:screeningId/review", requireAuthentication(["LANDLORD"]), landlordReviewTenantScreening);           // 🧾 Landlord reviews (approve/reject) tenant screening
router.get("/screening/list", requireAuthentication(["LANDLORD"]), getLandlordScreeningsList );                              // 📋 Get all screenings of this landlord (categorized by status)
router.get("/screening/:screeningId/details", requireAuthentication(["LANDLORD"]), getSpeceficScreeningLandlord );           // 🔍 View details of a specific tenant screening
router.delete("/screening/:screeningId", requireAuthentication(["LANDLORD"]), deletePendingScreening);                      // 🗑️ Delete pending screening (hard delete)


// ----------------------------------------------------- LEASE 
router.post("/lease/create", requireAuthentication(["LANDLORD"]), createLease);                                         // 🏗️ Create a new lease
router.get("/lease/list", requireAuthentication(["LANDLORD"]), getAllLeases);                                           // 📋 Get all leases (any status)
router.get("/lease/:id/details", requireAuthentication(["LANDLORD"]), getLeaseById);                                    // 🔍 Get specific lease details
router.patch("/lease/:id/cancel", requireAuthentication(["LANDLORD"]), cancelLease);                                    // ❌ Cancel pending lease
router.patch("/lease/:id/terminate", requireAuthentication(["LANDLORD"]), terminateLease);                              // ⛔ Terminate lease early
router.patch("/lease/:id/complete", requireAuthentication(["LANDLORD"]), completeLease);                                 // ✅ Mark lease as completed
router.patch("/lease/:id/update", requireAuthentication(["LANDLORD"]), updateLease);                                     // ✏️ Update pending lease
router.get("/lease/properties-with-units", requireAuthentication(["LANDLORD"]), getAllPropertiesWithUnits); // 🏠 Get all properties + units (for editing - includes all units)
router.get("/lease/properties-with-units-and-tenants", requireAuthentication(["LANDLORD"]), getAllPropertiesWithUnitsAndSuggestedTenants); // 🏠 Get all properties + units + suggested tenants (with riskLevel)
router.get("/lease/find-tenant", requireAuthentication(["LANDLORD"]), findTenantForLease); // 🔎 Search tenants by name or email (for lease creation)

// ----------------------------------------------------- PAYMENTS
router.post("/lease/:leaseId/payments", requireAuthentication(["LANDLORD"]), createPayment); // 💰 Create a new payment record
router.get("/payments/list", requireAuthentication(["LANDLORD"]), getLandlordMonthlyPayments); // 📅 Fetch payments for current/specified month
router.patch("/payments/:paymentId/mark-paid", requireAuthentication(["LANDLORD"]), markPaymentAsPaid); // 💸 Mark a specific payment as paid
router.patch("/payments/:paymentId/update", requireAuthentication(["LANDLORD"]), updatePayment); // ✏️ Update a PENDING payment record
router.delete("/payments/:paymentId", requireAuthentication(["LANDLORD"]), deletePayment); // 🗑️ Delete a PENDING payment record

// ----------------------------------------------------- TENANT BEHAVIOR ANALYSIS
router.post("/lease/:leaseId/behavior/notes", requireAuthentication(["LANDLORD"]), addLandlordNote); // 📝 Add a landlord note
router.patch("/lease/:leaseId/behavior/notes/:noteIndex", requireAuthentication(["LANDLORD"]), updateLandlordNote); // ✏️ Update a landlord note
router.delete("/lease/:leaseId/behavior/notes/:noteIndex", requireAuthentication(["LANDLORD"]), deleteLandlordNote); // 🗑️ Delete a landlord note

// ----------------------------------------------------- MAINTENANCE
router.get("/maintenance/requests", requireAuthentication(["LANDLORD"]), getAllMaintenanceRequestsByLandlord);
router.patch("/maintenance/:maintenanceId/status", requireAuthentication(["LANDLORD"]), updateMaintenanceStatus);

// ----------------------------------------------------- FINANCIALS
router.get("/financial/properties-with-units", requireAuthentication(["LANDLORD"]), getPropertiesWithUnits);
router.get("/financial/transactions", requireAuthentication(["LANDLORD"]), getAllTransactions);
router.post("/financial/transactions", requireAuthentication(["LANDLORD"]), createTransaction);
router.patch("/financial/transactions/:transactionId", requireAuthentication(["LANDLORD"]), updateTransaction);
router.delete("/financial/transactions/:transactionId", requireAuthentication(["LANDLORD"]), deleteTransaction);



// ----------------------------------------------------- DASHBOARD
router.get("/dashboard/metrics", requireAuthentication(["LANDLORD"]), getDashboardMetrics);
router.get("/dashboard/payments", requireAuthentication(["LANDLORD"]), getDashboardPayments);
router.get("/dashboard/leases", requireAuthentication(["LANDLORD"]), getDashboardLeases);
router.get("/dashboard/screenings", requireAuthentication(["LANDLORD"]), getDashboardScreenings);
router.get("/dashboard/maintenance", requireAuthentication(["LANDLORD"]), getDashboardMaintenance);
router.get("/dashboard/listings", requireAuthentication(["LANDLORD"]), getDashboardListings);
router.get("/dashboard/financial", requireAuthentication(["LANDLORD"]), getDashboardFinancial);

// ----------------------------------------------------- REPORTS
router.get("/reports", requireAuthentication(["LANDLORD"]), getReportsData);
// ----------------------------------------------------- ENGAGEMENT
router.get("/engagement", requireAuthentication(["LANDLORD"]), getEngagementData);
// ----------------------------------------------------- LEASE ANALYTICS
router.get("/lease-analytics", requireAuthentication(["LANDLORD"]), getLeaseAnalytics);
// ----------------------------------------------------- MAINTENANCE ANALYTICS
router.get("/maintenance-analytics", requireAuthentication(["LANDLORD"]), getMaintenanceAnalytics);

export default router;
 