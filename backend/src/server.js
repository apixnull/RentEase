// file: server.js
// Load environment variables FIRST before importing anything else
import dotenv from "dotenv";
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config(); // default .env for development
}

// Now import other modules after env vars are loaded
import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import { setIoInstance } from "./services/socketService.js";
import prisma from "./libs/prismaClient.js";
import { startPaymentReminderCron } from "./services/paymentReminderCron.js";
import { startListingExpirationCron } from "./services/listingExpirationCron.js";

/**
 * Get allowed origins for Socket.io (same logic as Express CORS)
 * Supports:
 * - ALLOWED_ORIGINS: comma-separated list of origins
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
    console.warn("⚠️ No ALLOWED_ORIGINS or FRONTEND_URL configured for Socket.io. CORS will only allow requests with no origin.");
    return [];
  }

  // Split by comma and clean up
  const origins = allowedOriginsEnv
    .split(",")
    .map(url => url.trim())
    .filter(url => url.length > 0);

  console.log("✅ Allowed Socket.io CORS origins:", origins);
  return origins;
};

// Define port
const PORT = process.env.PORT || 5000;

// 1️⃣ Create an HTTP server manually
const server = http.createServer(app);

const allowedOrigins = getAllowedOrigins();

// --- Attach Socket.io ---
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like from Vite proxy)
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

      console.warn(`🚫 Socket.io CORS blocked origin: ${origin}. Allowed:`, allowedOrigins);
      callback(new Error(`Socket.io CORS: Origin ${origin} not allowed`));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  // Allow both polling and websocket transports
  transports: ["polling", "websocket"],
  // Increase ping timeout for development
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Set io instance in socket service for use in controllers
setIoInstance(io);

// Track which users are actively viewing channels (presence)
// Map: channelId -> Set of userIds viewing that channel
const channelViewers = new Map();

// Map: userId -> Set of channelIds they're viewing
const userActiveChannels = new Map();

// server.js
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // frontend will emit this after connecting
  socket.on("join:userRoom", (userId) => {
    console.log(`User joined their room: user-${userId}`);
    socket.join(`user-${userId}`);
    socket.data = { userId }; // Store userId on socket for later use
  });

  // Join a specific channel room for real-time messaging
  socket.on("join:channel", async (channelId) => {
    console.log(`User joined channel room: channel-${channelId}`);
    socket.join(`channel-${channelId}`);
    
    const userId = socket.data?.userId;
    if (userId) {
      // Track that this user is viewing this channel
      if (!channelViewers.has(channelId)) {
        channelViewers.set(channelId, new Set());
      }
      channelViewers.get(channelId).add(userId);
      
      if (!userActiveChannels.has(userId)) {
        userActiveChannels.set(userId, new Set());
      }
      userActiveChannels.get(userId).add(channelId);
      
      // Get channel info to find the other participant
      try {
        const channel = await prisma.chatChannel.findUnique({
          where: { id: channelId },
          select: { tenantId: true, landlordId: true },
        });
        
        if (channel) {
          // Determine the other participant
          const otherUserId = userId === channel.tenantId ? channel.landlordId : channel.tenantId;
          
          // Notify the other participant that this user is online
          io.to(`user-${otherUserId}`).emit("presence:userOnline", { userId, channelId });
          
          console.log(`👁️ User ${userId} is now viewing channel ${channelId} - notified ${otherUserId}`);
        }
      } catch (error) {
        console.error(`Error fetching channel ${channelId}:`, error);
        // Fallback: emit to channel room
        socket.to(`channel-${channelId}`).emit("presence:userOnline", { userId, channelId });
      }
    }
  });

  // Leave a channel room
  socket.on("leave:channel", async (channelId) => {
    console.log(`User left channel room: channel-${channelId}`);
    socket.leave(`channel-${channelId}`);
    
    const userId = socket.data?.userId;
    if (userId) {
      // Remove user from channel viewers
      if (channelViewers.has(channelId)) {
        channelViewers.get(channelId).delete(userId);
        if (channelViewers.get(channelId).size === 0) {
          channelViewers.delete(channelId);
        }
      }
      
      if (userActiveChannels.has(userId)) {
        userActiveChannels.get(userId).delete(channelId);
        if (userActiveChannels.get(userId).size === 0) {
          userActiveChannels.delete(userId);
        }
      }
      
      // Get channel info to find the other participant
      try {
        const channel = await prisma.chatChannel.findUnique({
          where: { id: channelId },
          select: { tenantId: true, landlordId: true },
        });
        
        if (channel) {
          // Determine the other participant
          const otherUserId = userId === channel.tenantId ? channel.landlordId : channel.tenantId;
          
          // Notify the other participant that this user went offline
          io.to(`user-${otherUserId}`).emit("presence:userOffline", { userId, channelId });
          
          console.log(`👋 User ${userId} stopped viewing channel ${channelId} - notified ${otherUserId}`);
        }
      } catch (error) {
        console.error(`Error fetching channel ${channelId}:`, error);
        // Fallback: emit to channel room
        socket.to(`channel-${channelId}`).emit("presence:userOffline", { userId, channelId });
      }
    }
  });

  socket.on("disconnect", async () => {
    console.log("🔴 Client disconnected:", socket.id);
    
    // Clean up presence tracking when user disconnects
    const userId = socket.data?.userId;
    if (userId && userActiveChannels.has(userId)) {
      const channels = Array.from(userActiveChannels.get(userId));
      
      // Use Promise.all for parallel processing
      await Promise.all(channels.map(async (channelId) => {
        if (channelViewers.has(channelId)) {
          channelViewers.get(channelId).delete(userId);
          if (channelViewers.get(channelId).size === 0) {
            channelViewers.delete(channelId);
          }
        }
        
        // Get channel info to notify other participant
        try {
          const channel = await prisma.chatChannel.findUnique({
            where: { id: channelId },
            select: { tenantId: true, landlordId: true },
          });
          
          if (channel) {
            const otherUserId = userId === channel.tenantId ? channel.landlordId : channel.tenantId;
            io.to(`user-${otherUserId}`).emit("presence:userOffline", { userId, channelId });
          }
        } catch (error) {
          console.error(`Error fetching channel ${channelId} on disconnect:`, error);
        }
      }));
      
      userActiveChannels.delete(userId);
    }
  });
});


// Start server with error handling
server.listen(PORT, '0.0.0.0', () => {
  const env = process.env.NODE_ENV || "development";
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || "not set";
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📦 Environment: ${env}`);
  console.log(`🌐 Allowed Origins: ${allowedOriginsEnv}`);
  console.log(`🔌 Socket.io enabled`);
  
  // Start payment reminder cron job
  try {
    startPaymentReminderCron();
  } catch (error) {
    console.error("❌ Error starting payment reminder cron:", error);
  }
  
  // Start listing expiration cron job
  try {
    startListingExpirationCron();
  } catch (error) {
    console.error("❌ Error starting listing expiration cron:", error);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Export io instance for use in controllers
export { io };