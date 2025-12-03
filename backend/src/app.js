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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "";

const buildAllowedOrigins = () => {
  if (!FRONTEND_URL) {
    console.warn(
      "⚠️ FRONTEND_URL is not configured. CORS will only allow dev/no-origin requests."
    );
    return [];
  }

  const normalized = FRONTEND_URL.replace(/\/$/, "");
  return [normalized, `${normalized}/`, FRONTEND_URL];
};

const app = express();

// ------------------------------
// Middlewares
// ------------------------------

app.set('trust proxy', 1);

const allowedOrigins = buildAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin (remove trailing slash for comparison)
    const normalizedOrigin = origin.replace(/\/$/, "");
    const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ""));
    
    // Check if origin matches any allowed origin (case-insensitive, normalized)
    const isAllowed = normalizedAllowed.some(
      allowed => allowed.toLowerCase() === normalizedOrigin.toLowerCase()
    );
    
    if (isAllowed || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}. Allowed origins:`, allowedOrigins);
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
app.use("/api/auth", authRoutes);
app.use("/api/landlord", landlordRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notification", notificationRoutes);

// Default route (health check / welcome route)
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Welcome to the API root route" });
});



// This app will be used in server.js to start listening on a port
export default app;
