import { useState, useEffect, useRef, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Shield,
  MoreHorizontal,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

// Enhanced sidebar configuration with status indicators
const sidebarItems = [
  {
    path: "/admin",
    name: "Dashboard",
    icon: LayoutDashboard,
    description: "System overview",
    badge: null,
  },
  {
    path: "/admin/users",
    name: "All Users",
    icon: Users,
    description: "User management",
    badge: null,
  },
  {
    path: "/admin/listing",
    name: "Listings",
    icon: FileText,
    description: "Manage advertisements",
    badge: null,
  },
  {
    path: "/admin/fraud-reports",
    name: "Fraud Reports",
    icon: BarChart3,
    description: "Tenant fraud reports",
    badge: null,
  },
  {
    path: "/admin/reports",
    name: "Reports & Analytics",
    icon: BarChart3,
    description: "Platform insights and analytics",
    badge: null,
  },
  {
    path: "/admin/settings",
    name: "Settings",
    icon: Settings,
    description: "System settings and utilities",
    badge: null,
  },
];

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { name: string; parent?: string }> = {
  "/admin": { name: "Dashboard" },
  "/admin/reports": { name: "Reports & Analytics" },
  "/admin/reports/user-analytics": { name: "User Analytics", parent: "/admin/reports" },
  "/admin/reports/listing-analytics": { name: "Listing Analytics", parent: "/admin/reports" },
  "/admin/reports/fraud-report-analytics": { name: "Fraud Reports Analytics", parent: "/admin/reports" },
  "/admin/users": { name: "All Users" },
  "/admin/users/:id": { name: "Details", parent: "/admin/users" },
  "/admin/verifications": { name: "Verifications" },
  "/admin/properties": { name: "All Properties" },
  "/admin/listing": { name: "Listing Management" },
  "/admin/listing/:id/details": { name: "Details", parent: "/admin/listing" },
  "/admin/payments": { name: "All Payments" },
  "/admin/logs": { name: "System Logs" },
  "/admin/alerts": { name: "Alerts" },
  "/admin/account": { name: "Account" },
  "/admin/settings": { name: "Settings" },
};

// Custom hook for sidebar state management
const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedState = sessionStorage.getItem('admin-sidebar-collapsed');
    if (savedState) {
      setCollapsed(JSON.parse(savedState));
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const newState = !prev;
      sessionStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  return { collapsed, toggleCollapsed };
};

// Sidebar Components Structure
const SidebarHeader = ({ collapsed, isMobile }: { collapsed: boolean; isMobile?: boolean }) => (
  <div className={cn(
    "transition-all duration-300 border-b border-gray-200/60 flex-shrink-0",
    collapsed ? "p-3" : "p-4",
    isMobile ? "p-3" : "p-4"
  )}>
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300",
      collapsed ? "justify-center" : "justify-start"
    )}>
      <div className="flex items-center gap-3">
        <Shield 
          className={cn(
            "text-purple-500",
            isMobile ? "w-5 h-5" : "w-6 h-6"
          )} 
          fill="currentColor"
        />
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className={cn(
              "font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent",
              isMobile ? "text-base" : "text-lg"
            )}>
              RentEase
            </span>
            <span className={cn(
              "bg-purple-100 text-purple-700 font-medium rounded-full border border-purple-200",
              isMobile ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"
            )}>
              Admin
            </span>
          </div>
        )}
      </div>
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
    <nav className={cn(
      "flex-1 overflow-y-auto",
      isMobile ? "px-2 py-2 space-y-1" : "px-3 py-4 space-y-2"
    )}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={cn(
            "group flex items-center transition-all duration-200 rounded-lg relative",
            location.pathname === item.path
              ? "bg-gradient-to-r from-purple-50/80 to-blue-50/80 text-purple-700 border border-purple-200/50"
              : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900",
            collapsed && !isMobile ? "px-3 justify-center" : "px-3 justify-start gap-3",
            isMobile ? "py-2" : "py-3"
          )}
        >
          {/* Active indicator */}
          {location.pathname === item.path && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ height: isMobile ? '24px' : '32px' }}
            />
          )}
          
          <div className="relative flex-shrink-0">
            <item.icon
              className={cn(
                "transition-colors",
                location.pathname === item.path
                  ? "text-purple-600"
                  : "text-gray-400 group-hover:text-gray-600",
                isMobile ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"
              )}
            />
          </div>
          
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "font-medium block truncate",
                      isMobile ? "text-xs" : "text-sm"
                    )}>
                      {item.name}
                    </span>
                    {item.description && (
                      <p className={cn(
                        "text-gray-500 mt-0.5 truncate",
                        isMobile ? "text-xs" : "text-xs"
                      )}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
      await logoutRequest();
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
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
    <AnimatePresence>
      {(!collapsed || isMobile) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "bg-gray-50 rounded-lg border border-gray-200/60 flex-shrink-0",
            isMobile ? "mx-2 mb-2 p-2" : "mx-3 mb-3 p-3"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            {/* User Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className={cn(
                "border border-white shadow-sm",
                isMobile ? "h-8 w-8" : "h-10 w-10"
              )}>
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-semibold text-gray-900 truncate",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={cn(
                  "text-gray-500 truncate",
                  isMobile ? "text-xs" : "text-xs"
                )}>
                  {user?.email || "admin@rentease.com"}
                </p>
              </div>
            </div>

            {/* More Button */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-all duration-200"
              >
                <MoreHorizontal className={isMobile ? "h-3 w-3" : "h-4 w-4"} />
              </button>

              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={cn(
                      "absolute right-0 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-xl z-50 overflow-hidden",
                      isMobile ? "bottom-full mb-1 w-40" : "bottom-full mb-2 w-48"
                    )}
                  >
                    {/* Account Link */}
                    <Link
                      to="/admin/account"
                      onClick={() => {
                        setShowMoreMenu(false);
                        onClose?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 transition-all duration-200 border-b border-gray-100/60",
                        location.pathname === "/admin/account"
                          ? "bg-gradient-to-r from-purple-50/80 to-blue-50/80 text-purple-700"
                          : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900",
                        isMobile ? "p-2 text-xs" : "p-3 text-sm"
                      )}
                    >
                      <Users className={isMobile ? "h-3 w-3 flex-shrink-0" : "h-4 w-4 flex-shrink-0"} />
                      <span className="font-medium">Account</span>
                    </Link>

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowMoreMenu(false);
                        onClose?.();
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full text-red-600 hover:bg-red-50/80 transition-all duration-200",
                        isMobile ? "p-2 text-xs" : "p-3 text-sm"
                      )}
                    >
                      <LogOut className={isMobile ? "h-3 w-3 flex-shrink-0" : "h-4 w-4 flex-shrink-0"} />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
    <div className="flex flex-col h-full">
      <NavMain 
        items={sidebarItems} 
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={onClose}
      />
      <NavUser 
        collapsed={collapsed} 
        isMobile={isMobile}
        onClose={onClose}
      />
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
        "flex flex-col h-full bg-white/95 backdrop-blur-sm transition-all duration-300 border-r border-gray-200/60",
        collapsed && !isMobile ? "w-0 opacity-0" : "w-64 opacity-100",
        isMobile && "w-64"
      )}
    >
      <SidebarHeader collapsed={collapsed && !isMobile} isMobile={isMobile} />
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

  // Enhanced breadcrumb logic
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
    <header className="relative z-[200] bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm border-b border-gray-200/60">
      <div className="flex items-center justify-between w-full gap-3">
        {/* Left Section - Menu & Breadcrumbs */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex flex-shrink-0 hover:bg-gray-50/80 rounded-lg transition-all duration-200 h-9 w-9"
            onClick={onToggleSidebar}
          >
            <motion.div
              animate={{ rotate: sidebarCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0 hover:bg-gray-50/80 rounded-lg transition-all duration-200 h-9 w-9"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0 flex-1 gap-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center min-w-0 flex-shrink-0">
                  {index > 0 && (
                    <ChevronRight className="mx-1 h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="text-gray-600 hover:text-purple-600 transition-all duration-200 font-medium hover:underline truncate max-w-[100px] sm:max-w-none"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-purple-600 truncate max-w-[100px] sm:max-w-none">
                      {crumb.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <div className="relative notification-dropdown" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative hover:bg-gray-50/80 h-9 w-9 rounded-lg transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm"
                >
                  {unreadCount}
                </motion.span>
              )}
            </Button>

            <AnimatePresence>
              {notifsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1rem)] bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-2xl z-[9999] overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-purple-600 hover:underline font-medium"
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
                          onClick={() => {
                            if (!notification.read) {
                              handleMarkAsRead(notification.id);
                            }
                            setNotifsOpen(false);
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "p-3 hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 group text-sm cursor-pointer",
                              !notification.read && "bg-purple-50/30"
                            )}
                          >
                            <div className="flex gap-3">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                                  !notification.read
                                    ? "bg-purple-500"
                                    : "bg-gray-300"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={cn(
                                    "font-medium group-hover:text-purple-700 transition-colors",
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
                                  <motion.div
                                    whileHover={{ x: 2 }}
                                    className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
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
                      <Link to="/admin/alerts">View notifications</Link>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-purple-200/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 -right-8 w-12 h-12 bg-blue-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-indigo-200/20 rounded-full blur-xl"></div>
      </div>

      {/* Desktop Sidebar - Now completely hidden when collapsed */}
      <aside className={cn(
        "hidden lg:block h-full transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm border-r border-gray-200/60 z-30 relative",
        collapsed ? "w-0 opacity-0" : "w-64 opacity-100"
      )}>
        <Sidebar collapsed={collapsed} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen lg:hidden bg-white/95 backdrop-blur-sm shadow-xl flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Sidebar isMobile onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className={cn(
        "flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300 relative z-10",
        // Adjust main content width based on sidebar state
        collapsed ? "w-full" : "lg:w-[calc(100vw-16rem)]"
      )}>
        <Header 
          onMobileMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-transparent min-h-0">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;