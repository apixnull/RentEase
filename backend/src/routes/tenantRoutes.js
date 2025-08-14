import express from "express";
import requireAuth from "../middlewares/requireAuth.js";
import { getListedUnitController } from "../controllers/tenant/browse-property/getListedUnitController.js";

const router = express.Router();

// ------------------------------------ Browse Related Routes ------------------------------------ //
router.get("/browse/listed-units", requireAuth(["TENANT"]), getListedUnitController );

export default router;
