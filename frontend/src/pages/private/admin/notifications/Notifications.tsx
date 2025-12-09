import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  CheckCheck,
  ChevronRight,
  Search,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getNotificationsRequest,
  markNotificationAsReadRequest,
  markAllNotificationsAsReadRequest,
  type Notification,
} from "@/api/notificationApi";
import { useSocket } from "@/hooks/useSocket";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const observerRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    try {
      setLoading(pageNum === 1);
      const response = await getNotificationsRequest({
        limit: 20,
        status: filter === "all" ? undefined : filter.toUpperCase(),
      });
      
      const newNotifications = response.data.notifications;
      
      if (reset || pageNum === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications((prev) => [...prev, ...newNotifications]);
      }
      
      setHasMore(newNotifications.length === 20);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications(1, true);
    setPage(1);
  }, [fetchNotifications]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  // Filter notifications by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNotifications(notifications);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredNotifications(
        notifications.filter((n) =>
          n.message.toLowerCase().includes(query)
        )
      );
    }
  }, [notifications, searchQuery]);

  // Real-time notification handler
  const handleRealtimeNotification = useCallback((newNotification: Notification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  useSocket(handleRealtimeNotification);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsReadRequest(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, status: "READ", read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadRequest();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: "READ", read: true }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      toast.error("Failed to mark all as read");
    }
  };

  // Get notification link based on type (admin-specific)
  const getNotificationLink = (notification: Notification): string => {
    const type = notification.type?.toUpperCase() || "SYSTEM";
    switch (type) {
      case "USER":
        return "/admin/users";
      case "LISTING":
        return "/admin/listing";
      case "FRAUD":
        return "/admin/fraud-reports";
      case "ALERT":
        return "/admin/alerts";
      default:
        return "/admin";
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    const link = getNotificationLink(notification);
    navigate(link);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          fetchNotifications(nextPage, false);
          setPage(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, page, fetchNotifications]);

  // Prevent body scroll on mobile when modal is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobile]);

  const unreadNotifications = filteredNotifications.filter((n) => !n.read);
  const readNotifications = filteredNotifications.filter((n) => n.read);

  return (
    <>
      {/* Mobile: Full-screen modal */}
      <AnimatePresence>
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white lg:hidden flex flex-col"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9"
                >
                  <X className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-purple-600 hover:text-purple-700"
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* Mobile Search & Filter */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "unread", "read"] as const).map((filterOption) => (
                  <Button
                    key={filterOption}
                    variant={filter === filterOption ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilter(filterOption);
                      setPage(1);
                    }}
                    className={cn(
                      "text-xs capitalize",
                      filter === filterOption &&
                        "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                  >
                    {filterOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading && notifications.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-16 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No notifications found" : "No notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {unreadNotifications.length > 0 && (
                    <div className="bg-purple-50/30 py-2 px-4">
                      <p className="text-xs font-medium text-purple-700">
                        Unread ({unreadNotifications.length})
                      </p>
                    </div>
                  )}
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    />
                  ))}
                  {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                    <div className="bg-gray-50/30 py-2 px-4">
                      <p className="text-xs font-medium text-gray-600">
                        Earlier
                      </p>
                    </div>
                  )}
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    />
                  ))}
                  {hasMore && (
                    <div ref={observerRef} className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mx-auto" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: Facebook-style panel */}
      {!isMobile && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => navigate(-1)}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl pointer-events-auto flex flex-col"
          >
            {/* Desktop Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-purple-600" />
                <h1 className="text-lg font-semibold text-gray-900">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-purple-600 hover:text-purple-700"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="h-9 w-9"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Desktop Search & Filter */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {(["all", "unread", "read"] as const).map((filterOption) => (
                  <Button
                    key={filterOption}
                    variant={filter === filterOption ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilter(filterOption);
                      setPage(1);
                    }}
                    className={cn(
                      "text-xs capitalize",
                      filter === filterOption &&
                        "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                  >
                    {filterOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* Desktop Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading && notifications.length === 0 ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-16 bg-gray-200 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No notifications found" : "No notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {unreadNotifications.length > 0 && (
                    <div className="bg-purple-50/30 py-2 px-4 sticky top-0 z-10">
                      <p className="text-xs font-medium text-purple-700">
                        Unread ({unreadNotifications.length})
                      </p>
                    </div>
                  )}
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    />
                  ))}
                  {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                    <div className="bg-gray-50/30 py-2 px-4 sticky top-0 z-10">
                      <p className="text-xs font-medium text-gray-600">Earlier</p>
                    </div>
                  )}
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    />
                  ))}
                  {hasMore && (
                    <div ref={observerRef} className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mx-auto" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Notification Item Component
const NotificationItem = ({
  notification,
  onClick,
  onMarkAsRead,
}: {
  notification: Notification;
  onClick: () => void;
  onMarkAsRead: () => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative group p-4 hover:bg-gray-50/80 active:bg-gray-100/80 transition-all duration-200 cursor-pointer",
        !notification.read && "bg-purple-50/30"
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Unread indicator */}
        <div
          className={cn(
            "w-2 h-2 rounded-full mt-2 flex-shrink-0",
            !notification.read ? "bg-purple-500" : "bg-transparent"
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "font-medium text-sm mb-1 line-clamp-2",
              !notification.read ? "text-gray-900" : "text-gray-700"
            )}
          >
            {notification.message}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </p>
        </div>

        {/* More menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]"
                onClick={(e) => e.stopPropagation()}
              >
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark as read
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hover arrow indicator */}
      <motion.div
        whileHover={{ x: 2 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="h-4 w-4" />
      </motion.div>
    </motion.div>
  );
};

export default Notifications;

