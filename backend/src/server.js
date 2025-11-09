// file: server.js
import dotenv from "dotenv";
import app from "./app.js";
import { Server } from "socket.io";
import http from "http";

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
    origin: "http://localhost:5173", // your frontend dev URL
    methods: ["GET", "POST"],
  },
});

// --- Handle socket connections ---
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("chat:message", (msg) => {
    console.log("💬 Message received:", msg);
    io.emit("chat:message", msg); // broadcast to everyone
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
