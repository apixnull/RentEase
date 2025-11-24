// file: server.js
import dotenv from "dotenv";
import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import { setIoInstance } from "./services/socketService.js";

// Load environment variables
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config(); // default .env for development
}

// Define port
const PORT = process.env.PORT || 5000;

// 1️⃣ Create an HTTP server manually
const server = http.createServer(app);

// --- Attach Socket.io ---
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // your frontend dev URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set io instance in socket service for use in controllers
setIoInstance(io);

// server.js
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // frontend will emit this after connecting
  socket.on("join:userRoom", (userId) => {
    console.log(`User joined their room: user-${userId}`);
    socket.join(`user-${userId}`);
  });

  // Join a specific channel room for real-time messaging
  socket.on("join:channel", (channelId) => {
    console.log(`User joined channel room: channel-${channelId}`);
    socket.join(`channel-${channelId}`);
  });

  // Leave a channel room
  socket.on("leave:channel", (channelId) => {
    console.log(`User left channel room: channel-${channelId}`);
    socket.leave(`channel-${channelId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});


// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// Export io instance for use in controllers
export { io };