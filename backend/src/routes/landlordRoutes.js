// file: routes/landlordPropertyRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { 
  createProperty, 
  createUnit, 
  getAmenities, 
  getCitiesAndMunicipalities, 
  getLandlordProperties, 
  getPropertyDetails, 
  getPropertyUnits,
  getUnitDetails,   // ✅ import our new controller
} from "../controllers/landlord/propertyController.js";
import { getUnitsListingStatus, requestListing } from "../controllers/landlord/unitListingController.js";

const router = Router();

// ---------------------------- Property
// Lookup data
router.get("/property/amenities", requireAuthentication(["LANDLORD"]), getAmenities);                          // get all amenities 
router.get("/property/city-municipality", requireAuthentication(["LANDLORD"]), getCitiesAndMunicipalities);    // get all municipality and city

// Property CRUD
router.post("/property/create", requireAuthentication(["LANDLORD"]), createProperty);                          // create a new property
router.get("/property/properties", requireAuthentication(["LANDLORD"]), getLandlordProperties);                // get all properties of the landlord
router.get("/property/:propertyId", requireAuthentication(["LANDLORD"]), getPropertyDetails);                  // get specific property details


// ---------------------------- Unit ----------------------------
router.get("/property/:propertyId/units/listing-status", requireAuthentication(["LANDLORD"]), getUnitsListingStatus); // landlord get all the unit status request in listing
router.get("/property/:propertyId/units", requireAuthentication(["LANDLORD"]), getPropertyUnits);              // get all unit of that property
router.get("/property/:propertyId/units/:unitId", requireAuthentication(["LANDLORD"]), getUnitDetails);        // get specific unit details 
router.post("/property/:propertyId/units", requireAuthentication(["LANDLORD"]), createUnit);                   // create a new unit


// ---------------------------- Listing
router.post("/property/:propertyId/units/:unitId/request-listing",  requireAuthentication(["LANDLORD"]), requestListing); // landlord attempt to make a listing request

export default router;
