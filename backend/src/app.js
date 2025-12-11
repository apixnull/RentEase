// file: app.js
// ------------------------------
// Main Express Application Setup
// ------------------------------

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import authRoutes from "./routes/authRoutes.js";
import landlordRoutes from "./routes/landlordRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { globalLimiter } from "./middlewares/requestRateLimiter.js";
import cookieParser from "cookie-parser";
import sessionMiddleware from "./middlewares/session.js";
import { apiLogger } from "./middlewares/apiLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get allowed origins from environment variables
 * Supports:
 * - ALLOWED_ORIGINS: comma-separated list of origins (e.g., "https://app1.com,https://app2.com")
 * - FRONTEND_URL: single origin (for backward compatibility)
 * - Development mode: allows all origins
 */
const getAllowedOrigins = () => {
  // In development, allow all origins
  if (process.env.NODE_ENV === "development") {
    return true; // Allow all origins in development
  }

  // Get allowed origins from environment
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "";
  
  if (!allowedOriginsEnv) {
    console.warn("⚠️ No ALLOWED_ORIGINS or FRONTEND_URL configured. CORS will only allow requests with no origin.");
    return [];
  }

  // Split by comma and clean up
  const origins = allowedOriginsEnv
    .split(",")
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log("✅ Allowed CORS origins:", origins);
  return origins;
};

const app = express();

// ------------------------------
// Middlewares
// ------------------------------

app.set('trust proxy', 1);

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (Array.isArray(allowedOrigins) && allowedOrigins.length > 0) {
      // Normalize origin for comparison (remove trailing slash, convert to lowercase)
      const normalizedOrigin = origin.replace(/\/$/, "").toLowerCase();
      const isAllowed = allowedOrigins.some(
        allowed => allowed.replace(/\/$/, "").toLowerCase() === normalizedOrigin
      );

      if (isAllowed) {
        return callback(null, true);
      }
    }

    console.warn(`🚫 CORS blocked origin: ${origin}. Allowed:`, allowedOrigins);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
// app.use(globalLimiter);
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(apiLogger); // API request/response logger

// ------------------------------
// Static File Serving (Local Storage - Development Only)
// ------------------------------
// Serve uploaded images as static files at /local-images/ route
// Only enabled in development mode or when USE_LOCAL_STORAGE is true
if (process.env.NODE_ENV === "development" || process.env.USE_LOCAL_STORAGE === "true") {
  const uploadsPath = path.join(__dirname, "../public/uploads");
  app.use("/local-images", express.static(uploadsPath));
  console.log("📁 Local file storage enabled - serving from:", uploadsPath);
}

// ------------------------------
// Routes
// ------------------------------
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);

// Health check route (for Railway/load balancers)
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Default route (health check / welcome route)
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Welcome to the API root route" });
});



// This app will be used in server.js to start listening on a port
export default app;
 