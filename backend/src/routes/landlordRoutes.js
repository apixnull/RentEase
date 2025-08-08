// routes/landlord/propertyRoutes.js
import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import { addPropertyController, updatePropertyImagesController } from "../controllers/landlord/property/addPropertyController.js";
import { addUnitController, updateUnitImagesController } from "../controllers/landlord/property/addUnitController.js";
import propertiesController from "../controllers/landlord/property/propertiesController.js";
import { propertyDetailsController } from "../controllers/landlord/property/propertyDetailsController.js";
import { getUnitController } from "../controllers/landlord/property/getUnitsController.js";
import { getUserProfileController } from "../controllers/landlord/settings/getProfileController.js";
import { editProfileController } from "../controllers/landlord/settings/editProfileController.js";


const router = express.Router();

// ------------------------------------ Property Related Routes ------------------------------------ //
// get all properties 
router.get("/property/properties", requireAuth(['LANDLORD']), propertiesController);

// get specefic property details
router.get("/property/:propertyId/details", requireAuth(["LANDLORD"]), propertyDetailsController);

// get all units within that property 
router.get("/unit/:propertyId/units", requireAuth(["LANDLORD"]), getUnitController);

// add property
router.post("/property/add-property", requireAuth(['LANDLORD']), addPropertyController);
router.patch("/property/update-images", requireAuth(["LANDLORD"]), updatePropertyImagesController);

// add unit
router.post("/unit/add-unit", requireAuth(["LANDLORD"]), addUnitController);
router.patch("/unit/:unitId/update-images", requireAuth(["LANDLORD"]), updateUnitImagesController);

// ------------------------------------ Settings Related Routes ------------------------------------ //
router.patch("/settings/edit-profile", requireAuth(["LANDLORD"]), editProfileController)
router.get("/settings/get-profile",  requireAuth(["LANDLORD"]), getUserProfileController);

// ------------------------------------ Leases Related Routes ------------------------------------ //


export default router;