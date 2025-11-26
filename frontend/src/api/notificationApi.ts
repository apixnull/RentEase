// ---------------------- Notifications ----------------------
import { privateApi } from "./axios";
import { apiRoutes } from "./routes";

export interface Notification {
  id: string;
  type: string;
  message: string;
  status: "UNREAD" | "READ" | "ARCHIVED";
  read: boolean;
  createdAt: string;
  readAt: string | null;
  leaseId?: string;
  maintenanceRequestId?: string;
  screeningId?: string;
  [key: string]: any; // Allow additional metadata fields
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface UnreadCountResponse {
  unreadCount: number;
}

// Get all notifications
export const getNotificationsRequest = (
  params?: { status?: string; limit?: number },
  options?: { signal?: AbortSignal }
) =>
  privateApi.get<NotificationsResponse>(apiRoutes.notification("/"), {
    params,
    signal: options?.signal,
  });

// Get unread count
export const getUnreadCountRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get<UnreadCountResponse>(
    apiRoutes.notification("/unread-count"),
    {
      signal: options?.signal,
    }
  );

// Mark notification as read
export const markNotificationAsReadRequest = (
  notificationId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(
    apiRoutes.notification(`/${notificationId}/read`),
    {},
    {
      signal: options?.signal,
    }
  );

// Mark all notifications as read
export const markAllNotificationsAsReadRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(
    apiRoutes.notification("/mark-all-read"),
    {},
    {
      signal: options?.signal,
    }
  );
