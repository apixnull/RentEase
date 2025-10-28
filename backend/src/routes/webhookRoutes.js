// routes/webhookRoutes.js
import express from "express"; // ✅ add this import
import { Router } from "express";
import { handlePaymongoWebhook } from "../controllers/webhookController.js";

const router = Router();

// ----------------------------------------------------- LISTING
router.post("/paymongo", express.json({ type: "*/*" }), handlePaymongoWebhook);         // Mark a listing as Paid

export default router;
