// src/server.js
import app from "./app.js";
import dotenv from "dotenv"; // ✅ must be a string

// Detect environment file
  process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";

// Load environment variables
dotenv.config(); 

// Define port 
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
