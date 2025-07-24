// routes/landlord/propertyRoutes.js
import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import propertyDetailsController from "../controllers/landlord/property/propertyDetailsController.js";
import propertiesController from "../controllers/landlord/property/propertiesController.js";
import addPropertiesController from "../controllers/landlord/property/addPropertiesController.js";
import getUnitDetailsController from "../controllers/landlord/property/getUnitDetailsController.js";


const router = express.Router();

router.get("/property/properties", requireAuth(['LANDLORD']), propertiesController);
router.get("/property/:id", requireAuth(['LANDLORD']), propertyDetailsController);
router.post("/property/add-property", requireAuth(['LANDLORD']), addPropertiesController);
router.get("/property/:propertyId/unit/:unitId", requireAuth(['LANDLORD']), getUnitDetailsController);

export default router;