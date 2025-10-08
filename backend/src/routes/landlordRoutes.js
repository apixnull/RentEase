// file: routes/landlordRoutes.js
import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { 
  createProperty, 
  getAmenities, 
  getCitiesAndMunicipalities, 
  getLandlordProperties, 
  getPropertyDetails, 
} from "../controllers/landlord/propertyController.js";
import { createUnit, getPropertyUnits, getUnitDetails } from "../controllers/landlord/unitController.js";
import { createListingWithPayment, getEligibleUnitsForListing, getLandlordListings, getLandlordSpecificListing, getUnitForListingReview} from "../controllers/landlord/listingController.js";
// import { createListing, getPropertiesForListing, getSpecificUnitForListing, getUnitsForListing } from "../controllers/landlord/listingController.js";

const router = Router();

// ---------------------------- Property
router.get("/property/amenities", requireAuthentication(["LANDLORD"]), getAmenities);                                 // get all amenity
router.get("/property/city-municipality", requireAuthentication(["LANDLORD"]), getCitiesAndMunicipalities);           // get all city and municipality

// Property 
router.post("/property/create", requireAuthentication(["LANDLORD"]), createProperty);                                 // create a new property
router.get("/property/properties", requireAuthentication(["LANDLORD"]), getLandlordProperties);                       // get all properties owned by landlord
router.get("/property/:propertyId", requireAuthentication(["LANDLORD"]), getPropertyDetails);                         // get specific property details


// ---------------------------- Unit 
router.get("/unit/:propertyId/units", requireAuthentication(["LANDLORD"]), getPropertyUnits);                         // get all unit of that property
router.get("/unit/:unitId", requireAuthentication(["LANDLORD"]), getUnitDetails);                                     // get specific unit details 
router.post("/unit/:propertyId/create", requireAuthentication(["LANDLORD"]), createUnit);                             // create a new unit


// ---------------------------- Listing
router.get("/listings", requireAuthentication(["LANDLORD"]), getLandlordListings);                                // landlord's listings
router.get("/listing/:unitId/review", requireAuthentication(["LANDLORD"]), getUnitForListingReview);             // review unit before listing
router.post("/listing/:unitId/create", requireAuthentication(["LANDLORD"]), createListingWithPayment);           // create listing + payment session
router.get("/listing/:listingId/details", requireAuthentication(["LANDLORD"]), getLandlordSpecificListing);       // get a specific listing information
router.get("/listing/eligible-units", requireAuthentication(["LANDLORD"]), getEligibleUnitsForListing);           // get units that can be listed

export default router;
