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

// Detect if using pooler (pooler URLs contain "pooler" or use specific ports)
const isUsingPooler = connectionString.includes("pooler") || connectionString.includes("pgbouncer");
const isProduction = process.env.NODE_ENV === "production";
// Detect Railway (Railway sets RAILWAY_ENVIRONMENT or RAILWAY_PROJECT_ID)
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID || connectionString.includes("railway.app");
// Detect Render (for backward compatibility)
const isRender = process.env.RENDER === "true" || process.env.RENDER_SERVICE_NAME;

// Build pool configuration
// Note: We use pg.Pool for connection pooling, so external poolers are optional
// Direct connections work fine and are often more reliable
const poolConfig = {
  connectionString,
  max: isUsingPooler ? 10 : 20, // Lower max for pooler connections, higher for direct
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for cloud providers
  // For direct connections, we can allow more connections since we're managing the pool
  min: isUsingPooler ? 0 : 2, // Keep minimum connections for direct connections
};

// Add SSL configuration for production cloud providers
// Railway PostgreSQL supports both SSL and non-SSL connections
// Render requires SSL, so we enable it for both
if (isProduction && (isRailway || isRender)) {
  // Check if SSL is already specified in connection string
  if (!connectionString.includes("sslmode=")) {
    // Railway: SSL is optional but recommended for production
    // Render: SSL is required
    // Enable SSL for both, but Railway will work without it too
    poolConfig.ssl = {
      rejectUnauthorized: false, // Cloud providers often use self-signed certs
    };
    if (process.env.NODE_ENV !== "production") {
      console.log(`🔒 SSL enabled for database connection (${isRailway ? 'Railway' : 'Render'} - ${isUsingPooler ? 'pooler' : 'direct'} mode)`);
    }
  }
}

const pool = new Pool(poolConfig);

// Add error handling for connection issues
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle database client:", err.message);
  if (err.code === "XX000" || err.message.includes("Tenant or user not found")) {
    console.error("💡 This error usually means:");
    console.error("   1. DATABASE_URL is incorrect or malformed");
    console.error("   2. The database user doesn't exist");
    console.error("   3. The database doesn't exist");
    if (isRailway) {
      console.error("   4. Check your Railway PostgreSQL service → Variables → DATABASE_URL");
    } else if (isRender) {
      console.error("   4. Check your Render database connection string");
    } else {
      console.error("   4. Verify your database connection string");
    }
  }
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
      if (err.code === "XX000" || err.message.includes("Tenant or user not found")) {
        console.error("\n🔍 Troubleshooting steps:");
        if (isRailway) {
          console.error("   1. Verify DATABASE_URL is set correctly in Railway → Variables");
          console.error("   2. Railway automatically provides DATABASE_URL when PostgreSQL service is linked");
          console.error("   3. Ensure the PostgreSQL service is running and linked to your web service");
          console.error("   4. Check Railway → PostgreSQL → Variables → DATABASE_URL");
          console.error("   5. Verify the connection string format: postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway");
          console.error("   6. Ensure the database exists and is accessible");
          console.error("   7. Check that the database user has proper permissions");
        } else if (isRender) {
          console.error("   1. Verify DATABASE_URL is set correctly in Render environment variables");
          console.error("   2. Go to your PostgreSQL service → Connect → Copy the Internal Database URL");
          console.error("   3. Ensure the database exists and is accessible");
          console.error("   4. Check that the database user has proper permissions");
          console.error("   5. Verify the connection string format: postgresql://user:password@host:port/database");
        } else {
          console.error("   1. Verify DATABASE_URL is set correctly in your environment variables");
          console.error("   2. Ensure the database exists and is accessible");
          console.error("   3. Check that the database user has proper permissions");
          console.error("   4. Verify the connection string format: postgresql://user:password@host:port/database");
        }
      }
      // Don't throw - let the app start and fail on first query if needed
      // This allows the app to start even if DB is temporarily unavailable
    });
}

process.on('beforeExit', async () => {
  await pool.end();
});

export default prisma;
