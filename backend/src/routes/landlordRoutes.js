// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { createProperty, getAmenities, getCitiesAndMunicipalities, getLandlordProperties, getPropertyDetailsAndUnits, } from "../controllers/landlord/propertyController.js";
import { createUnit, getUnitDetails } from "../controllers/landlord/unitController.js";
import { cancelListingPayment, createListingWithPayment, getEligibleUnitsForListing, getLandlordListings, getLandlordSpecificListing, getUnitForListingReview} from "../controllers/landlord/listingController.js";
import { getLandlordScreeningsList, getSpeceficScreeningLandlord, inviteTenantForScreening, landlordReviewTenantScreening} from "../controllers/landlord/tenantScreeningController.js";
import { createLease, findTenantForLease, getAllLeases, getAllPropertiesWithUnitsAndSuggestedTenants, getLeaseById, markPaymentAsPaid } from "../controllers/landlord/leaseController.js";
import { getAllMaintenanceRequestsByLandlord, updateMaintenanceStatus} from "../controllers/landlord/maintenanceController.js";

const router = Router();

// ----------------------------------------------------- PROPERTY 
router.get("/property/amenities", requireAuthentication(["LANDLORD"]), getAmenities);                                 // get all amenity
router.get("/property/city-municipality", requireAuthentication(["LANDLORD"]), getCitiesAndMunicipalities);           // get all city and municipality
router.post("/property/create", requireAuthentication(["LANDLORD"]), createProperty);                                 // create a new property
router.get("/property/properties", requireAuthentication(["LANDLORD"]), getLandlordProperties);                       // get all properties owned by landlord
router.get("/property/:propertyId", requireAuthentication(["LANDLORD"]), getPropertyDetailsAndUnits);                         // get specific property details

// ----------------------------------------------------- UNIT
router.get("/unit/:unitId", requireAuthentication(["LANDLORD"]), getUnitDetails);                                     // get specific unit details 
router.post("/unit/:propertyId/create", requireAuthentication(["LANDLORD"]), createUnit);                             // create a new unit


// ----------------------------------------------------- LISTING
router.get("/listings", requireAuthentication(["LANDLORD"]), getLandlordListings);                                        // landlord's listings
router.get("/listing/:unitId/review", requireAuthentication(["LANDLORD"]), getUnitForListingReview);                      // review unit before listing
router.post("/listing/:unitId/create", requireAuthentication(["LANDLORD"]), createListingWithPayment);                    // create listing + payment session
router.get("/listing/:listingId/details", requireAuthentication(["LANDLORD"]), getLandlordSpecificListing);               // get a specific listing information
router.get("/listing/eligible-units", requireAuthentication(["LANDLORD"]), getEligibleUnitsForListing);                   // get units that can be listed
router.delete("/listing/:listingId/cancel",requireAuthentication(["LANDLORD"]), cancelListingPayment); // cancel listing + payment session
// ----------------------------------------------------- TENANT SCREENING
router.post("/screening/invite", requireAuthentication(["LANDLORD"]), inviteTenantForScreening);                             // landlord invites tenant for screening
router.post("/screening/:screeningId/review", requireAuthentication(["LANDLORD"]), landlordReviewTenantScreening);           // 🧾 Landlord reviews (approve/reject) tenant screening
router.get("/screening/list", requireAuthentication(["LANDLORD"]), getLandlordScreeningsList );                              // 📋 Get all screenings of this landlord (categorized by status)
router.get("/screening/:screeningId/details", requireAuthentication(["LANDLORD"]), getSpeceficScreeningLandlord );           // 🔍 View details of a specific tenant screening

// ----------------------------------------------------- LEASE 
router.post("/lease/create", requireAuthentication(["LANDLORD"]), createLease);                                         // 🏗️ Create a new lease
router.get("/lease/list", requireAuthentication(["LANDLORD"]), getAllLeases);                                           // 📋 Get all leases (any status)
router.get("/lease/:id/details", requireAuthentication(["LANDLORD"]), getLeaseById);                                    // 🔍 Get specific lease details
router.get("/lease/properties-with-units-and-tenants", requireAuthentication(["LANDLORD"]), getAllPropertiesWithUnitsAndSuggestedTenants); // 🏠 Get all properties + units + suggested tenants (with riskLevel)
router.get("/lease/find-tenant", requireAuthentication(["LANDLORD"]), findTenantForLease); // 🔎 Search tenants by name or email

// ----------------------------------------------------- PAYMENTS
router.patch("/payments/:paymentId/mark-paid", requireAuthentication(["LANDLORD"]), markPaymentAsPaid); // 💸 Mark a specific payment as paid

// ----------------------------------------------------- MAINTENANCE
router.get("/maintenance/requests", requireAuthentication(["LANDLORD"]), getAllMaintenanceRequestsByLandlord);
router.patch("/maintenance/:maintenanceId/status", requireAuthentication(["LANDLORD"]), updateMaintenanceStatus);

export default router;
 