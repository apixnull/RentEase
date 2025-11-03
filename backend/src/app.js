// file: app.js
// ------------------------------
// Main Express Application Setup
// ------------------------------

import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from './routes/authRoutes.js'
import landlordRoutes from './routes/landlordRoutes.js'
import tenantRoutes from './routes/tenantRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import { globalLimiter } from "./middlewares/requestRateLimiter.js";
import cookieParser from "cookie-parser";
import sessionMiddleware from "./middlewares/session.js";

const app = express();

// ------------------------------
// Middlewares
// ------------------------------

app.set('trust proxy', 1);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
// app.use(globalLimiter);
app.use(cookieParser());
app.use(sessionMiddleware);

// ------------------------------
// Routes
// ------------------------------

app.use("/api/auth", authRoutes); // Auth routes
app.use("/api/landlord/", landlordRoutes); // Landlord routes
app.use("/api/admin/", adminRoutes); // Auth routes
app.use("/api/tenant/", tenantRoutes); // Auth routes
app.use("/api/chat/", chatRoutes); // Chat routes
app.use("/api/webhook", webhookRoutes); // Auth routes

// Default route (health check / welcome route)
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Welcome to the API root route" });
});



// This app will be used in server.js to start listening on a port
export default app;
