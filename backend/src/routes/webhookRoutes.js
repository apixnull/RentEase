// routes/webhookRoutes.js
import express from "express"; // ✅ add this import
import { Router } from "express";
import { handlePaymongoWebhook } from "../controllers/webhookController.js";

const router = Router();

// No authentication middleware — PayMongo must access this publicly
router.post("/paymongo", express.json({ type: "*/*" }), handlePaymongoWebhook);

export default router;
