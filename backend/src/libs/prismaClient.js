import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. Please set it in your .env file or Railway environment variables."
  );
}

// Clean up connection string (remove any extra whitespace)
connectionString = connectionString.trim();

// Build pool configuration
const poolConfig = {
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  min: 2,
};

// Add SSL for production if not already specified
if (process.env.NODE_ENV === "production" && !connectionString.includes("sslmode=")) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

// Add error handling for connection issues
pool.on("error", (err) => {
  console.error("❌ Database connection error:", err.message);
});

pool.on("connect", () => {
  if (process.env.NODE_ENV !== "production") {
    console.log("✅ Database connection established");
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Test connection on startup (only log errors, don't throw)
if (process.env.NODE_ENV !== "test") {
  prisma.$connect()
    .then(() => {
      if (process.env.NODE_ENV !== "production") {
        console.log("✅ Prisma client connected successfully");
      }
    })
    .catch((err) => {
      console.error("❌ Failed to connect to database:", err.message);
      
      // Handle P1001 - Can't reach database server
      if (err.code === "P1001" || err.message?.includes("Can't reach database server")) {
        console.error("🚨 Cannot reach database server. Check DATABASE_URL is set correctly.");
        return;
      }
      // Don't throw - let the app start and fail on first query if needed
      // This allows the app to start even if DB is temporarily unavailable
    });
}

process.on('beforeExit', async () => {
  await pool.end();
});

export default prisma;
