import { useState, useEffect, useRef, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Search,
  User,
  Zap,
  MoreHorizontal,
  X,
} from "lucide-react";
// Removed framer-motion for better performance - using CSS transitions instead
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutRequest } from "@/api/authApi";
import {
  getNotificationsRequest,
  getUnreadCountRequest,
  markNotificationAsReadRequest,
  markAllNotificationsAsReadRequest,
  type Notification,
} from "@/api/notificationApi";
import { useSocket } from "@/hooks/useSocket";
import { formatDistanceToNow } from "date-fns";
import { processImageUrl } from "@/api/utils";

// Enhanced sidebar configuration with status indicators
const sidebarItems = [
  {
    path: "/tenant",
    name: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview & analytics",
    badge: null,
  },
  {
    path: "/tenant/screening",
    name: "Screening",
    icon: FileText,
    description: "Identity Confirmation",
    badge: null,
  },
  {
    path: "/tenant/my-lease",
    name: "My Lease",
    icon: FileText,
    description: "Current agreement",
    badge: null,
  },
  {
    path: "/tenant/messages",
    name: "Messages",
    icon: MessageSquare,
    description: "Contact landlords",
    badge: null,
  },
];

// Simplified breadcrumb configuration (removed icons)
const breadcrumbConfig: Record<string, { name: string; parent?: string }> = {
  "/tenant": { name: "Dashboard" },
  "/tenant/browse-properties": { name: "Browse Properties" },
  "/tenant/my-lease": { name: "My Lease" },
  "/tenant/my-lease/:leaseId/details": { name: "Details" , parent: "/tenant/my-lease"},

  "/tenant/screening": { name: "Screening" },
  "/tenant/screening/:screeningId/details": { name: "Details", parent: "/tenant/screening" },
  "/tenant/messages": { name: "Messages" },
  "/tenant/messages/:channelId": { name: "Convo",  parent: "/tenant/messages" },
  "/tenant/notifications": { name: "Notifications" },
  "/tenant/settings": { name: "Settings" },
  "/tenant/account": { name: "Account" },
};

// Custom hook for sidebar state management
const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedState = sessionStorage.getItem('tenant-sidebar-collapsed');
    if (savedState) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const newState = !prev;
      sessionStorage.setItem('tenant-sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  return { collapsed, toggleCollapsed };
};

// Sidebar Components Structure
const SidebarHeader = ({ collapsed, isMobile, onClose }: { collapsed: boolean; isMobile?: boolean; onClose?: () => void }) => (
  <div className={cn(
    "p-4 transition-all duration-300 border-b border-gray-200/60 flex-shrink-0",
    collapsed ? "px-3" : "px-4"
  )}>
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300",
      collapsed ? "justify-center" : "justify-between"
    )}>
      <div className="flex items-center gap-3">
        <Zap 
          className="w-6 h-6 text-teal-500" 
          fill="currentColor"
        />
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">
              RentEase
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full border border-emerald-200">
              Tenant
            </span>
          </div>
        )}
      </div>
      {/* Mobile Close Button */}
      {isMobile && !collapsed && onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-lg hover:bg-gray-100 flex-shrink-0"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
);

const NavMain = ({ 
  items, 
  collapsed, 
  isMobile,
  onClose 
}: { 
  items: typeof sidebarItems;
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  const location = useLocation();

  return (
    <nav className="space-y-2 px-3 py-4">
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={cn(
            "group flex items-center transition-all duration-200 rounded-lg relative text-sm",
            location.pathname === item.path
              ? "bg-gradient-to-r from-emerald-50/80 to-sky-50/80 text-emerald-700 border border-emerald-200/50"
              : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
            collapsed && !isMobile ? "px-3 py-4 justify-center" : "px-3 py-3 justify-start gap-3"
          )}
        >
          {/* Active indicator */}
          {location.pathname === item.path && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-sky-500 rounded-r-full" />
          )}
          
          <div className="relative flex-shrink-0">
            <item.icon
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                location.pathname === item.path
                  ? "text-emerald-600"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />
          </div>
          
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between w-full">
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate text-sm">
                    {item.name}
                  </span>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Link>
      ))}
    </nav>
  );
};

const NavUser = ({ 
  collapsed, 
  isMobile,
  onClose 
}: { 
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logoutRequest(); // ✅ call backend
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // ✅ clear Zustand store
      const { clearUser } = useAuthStore.getState();
      clearUser();

      toast.success("Logged out successfully");
      navigate("/auth/login", { replace: true });
    }
  };

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  return (
    <>
      {(!collapsed || isMobile) && (
        <div className={cn(
          "mx-3 p-3 bg-gray-50 rounded-lg border border-gray-200/60 flex-shrink-0 min-w-0",
          isMobile ? "mb-4" : "mb-3"
        )}>
          <div className="flex items-center justify-between gap-2 min-w-0">
            {/* User Info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-10 w-10 border border-white shadow-sm flex-shrink-0">
                <AvatarImage src={processImageUrl(user?.avatarUrl)} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 text-sm">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "tenant@gmail.com"}
                </p>
              </div>
            </div>

            {/* More Button */}
            <div className="relative flex-shrink-0" ref={moreMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-all duration-200 flex-shrink-0 touch-manipulation"
                aria-label="More options"
                type="button"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Account Link */}
                    <Link
                      to="/tenant/account"
                      onClick={() => {
                        setShowMoreMenu(false);
                        onClose?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 text-sm transition-all duration-200 border-b border-gray-100/60",
                        location.pathname === "/tenant/account"
                          ? "bg-gradient-to-r from-emerald-50/80 to-sky-50/80 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                      )}
                    >
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Account</span>
                    </Link>

                    {/* Settings Link - Second Item */}
                    <Link
                      to="/tenant/settings"
                      onClick={() => {
                        setShowMoreMenu(false);
                        onClose?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 text-sm transition-all duration-200 border-b border-gray-100/60",
                        location.pathname === "/tenant/settings"
                          ? "bg-gradient-to-r from-emerald-50/80 to-sky-50/80 text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                      )}
                    >
                      <SettingsIcon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Settings</span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMoreMenu(false);
                        onClose?.();
                      }}
                      className="flex items-center gap-3 w-full p-3 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Logout</span>
                    </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SidebarContent = ({
  collapsed,
  isMobile,
  onClose
}: {
  collapsed: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
        <NavMain 
          items={sidebarItems} 
          collapsed={collapsed}
          isMobile={isMobile}
          onClose={onClose}
        />
      </div>
      <div className={cn(
        "flex-shrink-0 border-t border-gray-200/60",
        isMobile ? "pb-6 mb-6" : "pb-0 mb-0"
      )} style={isMobile ? { paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' } : undefined}>
        <NavUser 
          collapsed={collapsed} 
          isMobile={isMobile}
          onClose={onClose}
        />
      </div>
      {/* NavSecondary removed - Settings is now in the More menu */}
    </div>
  );
};

const Sidebar = ({
  isMobile,
  onClose,
  collapsed = false,
}: {
  isMobile?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white/95 backdrop-blur-sm transition-all duration-300 border-r border-gray-200/60 overflow-hidden",
        collapsed && !isMobile ? "w-0 opacity-0" : "w-64 opacity-100",
        isMobile && "w-64"
      )}
    >
      <SidebarHeader collapsed={collapsed && !isMobile} isMobile={isMobile} onClose={onClose} />
      <SidebarContent 
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={onClose}
      />
    </div>
  );
};

const MAX_VISIBLE_NOTIFICATIONS = 6;

const Header = ({ 
  onMobileMenuClick, 
  sidebarCollapsed,
  onToggleSidebar 
}: { 
  onMobileMenuClick: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { name: string; path?: string }[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        getNotificationsRequest({ limit: MAX_VISIBLE_NOTIFICATIONS }),
        getUnreadCountRequest(),
      ]);
      setNotifications(notifsRes.data.notifications);
      setUnreadCount(countRes.data.unreadCount);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRealtimeNotification = useCallback((newNotification: Notification) => {
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, MAX_VISIBLE_NOTIFICATIONS);
    });
    setUnreadCount((prev) => prev + 1);
    toast.info(newNotification.message, {
      description: "New notification",
    });
  }, []);

  useSocket(handleRealtimeNotification);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifsOpen(false);
      }
    };

    if (notifsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifsOpen]);

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
    }
  };

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
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    const type = notification.type?.toUpperCase() || "SYSTEM";
    switch (type) {
      case "PAYMENT":
        // Route to lease details page with payments tab if leaseId is available
        if (notification.leaseId) {
          return `/tenant/my-lease/${notification.leaseId}/details`;
        }
        return "/tenant/payments";
      case "MAINTENANCE":
        // Route to lease details page with maintenance tab if leaseId is available
        if (notification.leaseId) {
          return `/tenant/my-lease/${notification.leaseId}/details`;
        }
        return "/tenant/maintenance";
      case "MESSAGE":
        return "/tenant/messages";
      case "LEASE":
        // Route to specific lease with lease tab if leaseId is available
        if (notification.leaseId) {
          return `/tenant/my-lease/${notification.leaseId}/details`;
        }
        return "/tenant/my-lease";
      case "SCREENING":
        // Route to specific screening if screeningId is available
        if (notification.screeningId) {
          return `/tenant/screening/${notification.screeningId}`;
        }
        return "/tenant/screening";
      default:
        return "/tenant";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const type = notification.type?.toUpperCase() || "SYSTEM";
    
    // Set the appropriate tab in sessionStorage before navigation
    if (notification.leaseId) {
      if (type === "PAYMENT") {
        // Set payments tab for payment notifications
        sessionStorage.setItem(`lease-${notification.leaseId}-activeTab`, "payments");
      } else if (type === "MAINTENANCE") {
        // Set maintenance tab for maintenance notifications
        sessionStorage.setItem(`lease-${notification.leaseId}-activeTab`, "maintenance");
      } else if (type === "LEASE") {
        // Set lease tab for lease notifications (termination, etc.)
        sessionStorage.setItem(`lease-${notification.leaseId}-activeTab`, "lease");
      }
    }

    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    setNotifsOpen(false);
  };

  // Enhanced breadcrumb logic (simplified - removed icons)
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const currentPath = location.pathname;
      const crumbs: { name: string; path?: string }[] = [];
      const paramCache = new Map<string, string>();

      const resolvePath = (pattern: string) => {
        let resolved = pattern;
        for (const [key, value] of paramCache.entries()) {
          resolved = resolved.replace(`:${key}`, value);
        }
        return resolved;
      };

      const findMatch = (path: string) => {
        for (const pattern of Object.keys(breadcrumbConfig)) {
          const paramNames: string[] = [];
          const regexPattern = pattern.replace(/:\w+/g, (param) => {
            paramNames.push(param.substring(1));
            return "([^/]+)";
          });

          const regex = new RegExp(`^${regexPattern}$`);
          const match = path.match(regex);

          if (match) {
            paramNames.forEach((key, idx) => {
              paramCache.set(key, match[idx + 1]);
            });
            return pattern;
          }
        }
        return null;
      };

      const buildCrumbs = (path: string) => {
        const pattern = findMatch(path);
        if (!pattern) return;

        const config = breadcrumbConfig[pattern];
        const resolvedPath = resolvePath(pattern);

        crumbs.push({
          name: config.name,
          path: resolvedPath,
        });

        if (config.parent) {
          buildCrumbs(resolvePath(config.parent));
        }
      };

      buildCrumbs(currentPath);
      const reversed = crumbs.reverse();
      if (reversed.length > 0) {
        reversed[reversed.length - 1].path = undefined;
      }
      setBreadcrumbs(reversed);
    };

    generateBreadcrumbs();
  }, [location.pathname]);

  return (
    <header className="relative z-[200] bg-white/80 backdrop-blur-sm px-3 sm:px-3 md:px-4 py-3 sm:py-3 shadow-sm border-b border-gray-200/60 flex-shrink-0">
      <div className="flex items-center justify-between w-full gap-1.5 sm:gap-2 md:gap-3 min-w-0">
        {/* Left Section - Menu & Breadcrumbs */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden lg:flex flex-shrink-0 hover:bg-gray-50/80 rounded-lg transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9",
              sidebarCollapsed ? "" : "rotate-180"
            )}
            onClick={onToggleSidebar}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200" />
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0 hover:bg-gray-50/80 rounded-lg transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Simplified Breadcrumbs (removed icons) */}
          <nav className="flex items-center text-xs sm:text-sm flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0 flex-1 gap-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center min-w-0 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="mx-1 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  )}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="text-gray-600 hover:text-emerald-600 transition-colors duration-200 font-medium hover:underline truncate max-w-[100px] sm:max-w-[150px] md:max-w-none"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-emerald-600 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
                      {crumb.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
          {/* Browse Properties Button */}
          <Button
            asChild
            size="sm"
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-sm hover:shadow transition-all duration-200 rounded-lg text-xs sm:text-sm",
              "hidden md:flex h-8 sm:h-9 px-2 sm:px-3"
            )}
          >
            <Link to="/tenant/browse-unit" className="flex items-center gap-1.5 sm:gap-2">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden lg:inline">Browse Unit</span>
              <span className="lg:hidden">Browse</span>
            </Link>
          </Button>

          {/* Mobile Browse Button */}
          <Button
            asChild
            size="icon"
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-sm hover:shadow md:hidden rounded-lg",
              "h-8 w-8 sm:h-9 sm:w-9"
            )}
          >
            <Link to="/tenant/browse-unit">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </Button>

          {/* Notifications */}
          <div className="relative notification-dropdown" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative hover:bg-gray-50/80 h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200"
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notifsOpen && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-1rem)] sm:w-72 md:w-80 max-w-[calc(100vw-1rem)] sm:max-w-none bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-emerald-600 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <Link
                          key={notification.id}
                          to={getNotificationLink(notification)}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNotificationClick(notification);
                            // Navigate after setting sessionStorage
                            navigate(getNotificationLink(notification));
                          }}
                        >
                          <div
                            className={cn(
                              "p-3 hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 group text-sm cursor-pointer",
                              !notification.read && "bg-emerald-50/30"
                            )}
                          >
                            <div className="flex gap-3">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                  !notification.read
                                    ? "bg-emerald-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium group-hover:text-emerald-700 transition-colors",
                                    !notification.read
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  )}
                                >
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(
                                      new Date(notification.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </p>
                                  <div className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity group-hover:translate-x-0.5">
                                    <ChevronRight className="h-3 w-3" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-100/60 bg-gray-50/30 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                      onClick={() => setNotifsOpen(false)}
                    >
                      <Link to="/tenant/notifications">View all notifications</Link>
                    </Button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </header>
  );
};

const TenantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile sidebar and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
        document.body.style.overflow = '';
      }
    };

    // Global click handler to detect stuck overlay (only on mobile, as fallback)
    const handleGlobalClick = (e: MouseEvent) => {
      // Fallback: If sidebar is open but user clicks on header menu button, ensure it toggles
      if (mobileOpen && window.innerWidth < 1024) {
        const target = e.target as HTMLElement;
        // If clicking the menu button while sidebar is open, close it
        if (target.closest('button[aria-label*="menu"], button[class*="Menu"]')) {
          setMobileOpen(false);
          document.body.style.overflow = '';
        }
      }
    };

    if (mobileOpen) {
      document.addEventListener('keydown', handleEscape);
      // Only add global click handler on mobile
      if (window.innerWidth < 1024) {
        document.addEventListener('click', handleGlobalClick, true);
      }
      // Lock body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
      // Safety: Force close after 10 seconds if still open (prevents stuck state)
      const safetyTimeout = setTimeout(() => {
        console.warn('Mobile sidebar open for 10s, forcing close');
        setMobileOpen(false);
        document.body.style.overflow = '';
      }, 10000);

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleGlobalClick, true);
        document.body.style.overflow = '';
        clearTimeout(safetyTimeout);
      };
    } else {
      document.body.style.overflow = '';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('click', handleGlobalClick, true);
      };
    }
  }, [mobileOpen]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50/30 via-white to-sky-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-emerald-200/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 -right-8 w-12 h-12 bg-sky-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-teal-200/20 rounded-full blur-xl"></div>
      </div>

      {/* Desktop Sidebar - Use transform instead of width for better performance */}
      <aside className={cn(
        "hidden lg:block h-full bg-white/95 backdrop-blur-sm shadow-sm border-r border-gray-200/60 z-30 relative transition-all duration-300 ease-in-out",
        collapsed ? "w-0 -translate-x-full opacity-0 pointer-events-none" : "w-64 translate-x-0 opacity-100"
      )}>
        <div className={cn("h-full", collapsed && "overflow-hidden")}>
          <Sidebar collapsed={collapsed} />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay - Optimized with CSS transitions for better performance */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden mobile-sidebar-overlay transition-opacity duration-200",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => {
          if (mobileOpen) {
            e.stopPropagation();
            setMobileOpen(false);
            document.body.style.overflow = '';
          }
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen lg:hidden bg-white/95 backdrop-blur-sm shadow-xl w-64 transition-transform duration-200 ease-out will-change-transform overflow-hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ pointerEvents: mobileOpen ? 'auto' : 'none' }}
      >
        {mobileOpen && (
          <Sidebar isMobile onClose={() => {
            setMobileOpen(false);
            document.body.style.overflow = '';
          }} />
        )}
      </aside>
      

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 relative z-10 overflow-hidden">
        <Header 
          onMobileMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent min-h-0">
          <div className="p-3 sm:p-4 md:p-6 h-full max-w-7xl mx-auto w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantLayout;