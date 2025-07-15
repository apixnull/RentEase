// routes/landlord/propertyRoutes.js
import express from "express";
import requireAuth from "../../middlewares/requireAuth.js";
import propertiesController from "../../controllers/landlord/property/propertiesController.js";
import propertyDetailsController from "../../controllers/landlord/property/propertyDetailsController.js";

const router = express.Router();

// GET /landlord/properties → get all properties owned by authenticated landlord
router.get("/property/properties", requireAuth(['LANDLORD']), propertiesController);
router.get("/property/:id", requireAuth(['LANDLORD']), propertyDetailsController);


export default router;
