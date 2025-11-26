// file: notificationController.js
import prisma from "../libs/prismaClient.js";
import { getIoInstance } from "../services/socketService.js";

// ---------------------------------------------- GET NOTIFICATIONS ----------------------------------------------
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, limit = 50 } = req.query;

    const where = { userId };
    if (status && ["UNREAD", "READ", "ARCHIVED"].includes(status)) {
      where.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type || "SYSTEM",
      message: notif.message,
      status: notif.status,
      read: notif.status === "READ",
      createdAt: notif.createdAt.toISOString(),
      readAt: notif.readAt?.toISOString() || null,
    }));

    return res.status(200).json({ notifications: formattedNotifications });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- MARK NOTIFICATION AS READ ----------------------------------------------
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Notification marked as read",
      notification: {
        id: updated.id,
        status: updated.status,
        readAt: updated.readAt?.toISOString() || null,
      },
    });
  } catch (err) {
    console.error("Mark notification as read error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- MARK ALL AS READ ----------------------------------------------
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        status: "UNREAD",
      },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("Mark all as read error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- GET UNREAD COUNT ----------------------------------------------
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        status: "UNREAD",
      },
    });

    return res.status(200).json({ unreadCount: count });
  } catch (err) {
    console.error("Get unread count error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ---------------------------------------------- CREATE NOTIFICATION (HELPER FUNCTION) ----------------------------------------------
/**
 * Helper function to create a notification and emit it via socket
 * This should be called from other controllers when events occur
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type (e.g., "PAYMENT", "LEASE", "MAINTENANCE", "MESSAGE", "SYSTEM")
 * @param {string} message - Notification message
 * @param {Object} metadata - Optional metadata to include
 */
export const createNotification = async (userId, type, message, metadata = {}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    // Emit real-time notification via socket
    const { emitNotification } = await import("../services/socketService.js");
    const notificationData = {
      id: notification.id,
      type: notification.type || "SYSTEM",
      message: notification.message,
      status: notification.status,
      read: false,
      createdAt: notification.createdAt.toISOString(),
      readAt: null,
      ...metadata,
    };

    emitNotification(userId, notificationData);

    return notification;
  } catch (err) {
    console.error("Create notification error:", err);
    return null;
  }
};
