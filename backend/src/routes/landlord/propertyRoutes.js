// routes/landlord/propertyRoutes.js
import express from "express";
import requireAuth from "../../middlewares/requireAuth.js";
import getAllPropertiesController from "../../controllers/landlord/property/getAllPropertiesController.js";

const router = express.Router();

// GET /landlord/properties → get all properties owned by authenticated landlord
router.get("/properties", requireAuth(['LANDLORD']), getAllPropertiesController);

export default router;
