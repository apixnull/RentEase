import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Custom hook for managing Socket.IO connection for chat channel updates and notifications
 * Automatically connects, joins user room, and handles reconnection
 */
export const useSocket = (onNotification?: (notification: any) => void) => {
  const currentUser = useAuthStore((state) => state.user);
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection with environment-based URL
    const getSocketUrl = () => {
      // If VITE_BACKEND_URL is explicitly set, use it (remove /api if present)
      if (import.meta.env.VITE_BACKEND_URL) {
        const url = import.meta.env.VITE_BACKEND_URL.replace(/\/api$/, "");
        return url;
      }
      
      // Environment-based defaults
      if (import.meta.env.MODE === "development") {
        // Development: use proxy (to port 5000)
        return "/";
      }
      
      // Production: use production backend URL (without /api)
      return "https://rentease-tm0i.onrender.com";
    };

    const socketUrl = getSocketUrl();

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on("connect", () => {
      console.log("✅ Socket.IO connected:", socket.id);
      setIsConnected(true);

      // Join user's room for receiving channel updates
      socket.emit("join:userRoom", currentUser.id);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket.IO disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connection error:", error);
      setIsConnected(false);
    });

    // Listen for real-time notifications
    if (onNotification) {
      socket.on("notification:new", (notification) => {
        console.log("📬 Received new notification:", notification);
        onNotification(notification);
      });
    }

    // Cleanup on unmount or user change
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.off("notification:new");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [currentUser?.id, onNotification]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};

