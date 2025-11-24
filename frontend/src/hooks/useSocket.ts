import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";

/**
 * Custom hook for managing Socket.IO connection for chat channel updates
 * Automatically connects, joins user room, and handles reconnection
 */
export const useSocket = () => {
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

    // Initialize socket connection
    const socketUrl =
      import.meta.env.MODE === "development"
        ? "/" // will use proxy (to port 5000)
        : import.meta.env.VITE_BACKEND_URL || window.location.origin;

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

    // Cleanup on unmount or user change
    return () => {
      if (socketRef.current) {
        socketRef.current.off("connect");
        socketRef.current.off("disconnect");
        socketRef.current.off("connect_error");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [currentUser?.id]);

  return {
    socket: socketRef.current,
    isConnected,
  };
};

