// file: app.js
// ------------------------------
// Main Express Application Setup
// ------------------------------

import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import landlordRoutes from "./routes/landlordRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { globalLimiter } from "./middlewares/requestRateLimiter.js";
import cookieParser from "cookie-parser";
import sessionMiddleware from "./middlewares/session.js";
import {
  ROUTE_PREFIXES,
  LEGACY_ROUTE_PREFIXES,
  getAllowedOrigins,
} from "./config/constants.js";

const app = express();

// ------------------------------
// Middlewares
// ------------------------------

app.set('trust proxy', 1);

const allowedOrigins = getAllowedOrigins();

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

const routeEntries = [
  { key: "auth", router: authRoutes },
  { key: "landlord", router: landlordRoutes },
  { key: "admin", router: adminRoutes },
  { key: "tenant", router: tenantRoutes },
  { key: "chat", router: chatRoutes },
  { key: "webhook", router: webhookRoutes },
];

routeEntries.forEach(({ key, router }) => {
  app.use(ROUTE_PREFIXES[key], router);

  const legacyPrefix = LEGACY_ROUTE_PREFIXES[key];
  if (legacyPrefix) {
    app.use(legacyPrefix, router);
  }
});

// Default route (health check / welcome route)
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Welcome to the API root route" });
});



// This app will be used in server.js to start listening on a port
export default app;
