// file: notificationRoutes.js
import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";
import { requireAuthentication } from "../middlewares/requireAuthentication.js";

const router = Router();

// ----------------------------------------------------- NOTIFICATIONS
router.get("/", requireAuthentication(["ANY_ROLE"]), getNotifications); // Get all notifications
router.get("/unread-count", requireAuthentication(["ANY_ROLE"]), getUnreadCount); // Get unread count
router.patch("/:notificationId/read", requireAuthentication(["ANY_ROLE"]), markNotificationAsRead); // Mark single as read
router.patch("/mark-all-read", requireAuthentication(["ANY_ROLE"]), markAllAsRead); // Mark all as read

export default router;
