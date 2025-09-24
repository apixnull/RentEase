import { Router } from "express";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";
import { createProperty, getAmenities, getCitiesAndMunicipalities, getLandlordProperties, getPropertyDetails, getPropertyUnits } from "../controllers/landlord/propertyController.js";

const router = Router();

// ---------------------------- Property
router.get("/property/amenities", requireAuthentication(["ANY_ROLE"]), getAmenities);
router.get("/property/city-municipality", requireAuthentication(["ANY_ROLE"]), getCitiesAndMunicipalities);

router.post("/property/create", requireAuthentication(["LANDLORD"]), createProperty);
router.get("/property/properties", requireAuthentication(["LANDLORD"]), getLandlordProperties);
router.get("/property/:propertyId", requireAuthentication(["LANDLORD"]), getPropertyDetails);
router.get("/property/:propertyId/units", requireAuthentication(["LANDLORD"]), getPropertyUnits);

export default router;