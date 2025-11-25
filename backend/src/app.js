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

// Environment-based CORS configuration
const getFrontendUrl = () => {
  // If FRONTEND_URL is explicitly set, use it
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  
  // Otherwise, use environment-based defaults
  if (process.env.NODE_ENV === "production") {
    // Production frontend URL
    return "https://rent-ease-management.vercel.app";
  }
  
  // Development frontend URL
  return "http://localhost:5173";
};

const allowedOrigins = [
  getFrontendUrl(),
  // Add any additional allowed origins here
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
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
