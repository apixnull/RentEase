import { useState, useEffect, useRef, useCallback } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  FileText,
  Wrench,
  MessageSquare,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Building2,
  TrendingUp,
  MoreHorizontal,
  Zap,
  CreditCard,
  FileBarChart,
  X,
  Sparkles,
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
import SupportChat from "@/components/SupportChat";

// Enhanced sidebar configuration with status indicators
const sidebarItems = [
  {
    path: "/landlord",
    name: "Dashboard",
    icon: LayoutDashboard,
    description: "Property overview",
    badge: null,
  },
  {
    path: "/landlord/properties",
    name: "Properties",
    icon: Building2,
    description: "Manage properties",
    badge: null,
  },
  {
    path: "/landlord/listing",
    name: "Listing",
    icon: Home,
    description: "Advertise Unit",
    badge: null,
  },
  {
    path: "/landlord/screening",
    name: "Screening",
    icon: FileText,
    description: "Review Potential Tenant",
    badge: null,
  },
  {
    path: "/landlord/leases",
    name: "Leases",
    icon: FileText,
    description: "Rental agreements",
    badge: null,
  },
  {
    path: "/landlord/payments",
    name: "Rent Payments",
    icon: CreditCard,
    description: "Track rent inflows",
    badge: null,
  },
  {
    path: "/landlord/maintenance",
    name: "Maintenance",
    icon: Wrench,
    description: "Repair requests",
    badge: null,
  },
  {
    path: "/landlord/tenants",
    name: "Tenants",
    icon: Users,
    description: "Tenant management",
    badge: null,
  },
  {
    path: "/landlord/messages",
    name: "Messages",
    icon: MessageSquare,
    description: "Communications",
    badge: null,
  },
  {
    path: "/landlord/financials",
    name: "Financials",
    icon: TrendingUp,
    description: "Income & expenses",
    badge: null,
  },
  {
    path: "/landlord/reports",
    name: "Reports & Analytics",
    icon: FileBarChart,
    description: "Reports & analytics",
    badge: null,
  },
];

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { name: string; parent?: string }> = {
  // dashboard 
  "/landlord": { name: "Dashboard" },

  // properties
  "/landlord/properties": { name: "Properties" },
  "/landlord/properties/create": {
    name: "Create Property",
    parent: "/landlord/properties",
  },
  "/landlord/properties/:propertyId/edit": {
    name: "Edit Property",
    parent: "/landlord/properties",
  },
  "/landlord/properties/:propertyId": {
    name: "Details",
    parent: "/landlord/properties",
  },
  
  // unit
  "/landlord/units/:propertyId": {
    name: "Units",
    parent: "/landlord/properties",
  },
  "/landlord/units/:propertyId/create": {
    name: "Create",
    parent: "/landlord/units/:propertyId",
  },
  "/landlord/units/:propertyId/:unitId": {
    name: "Details",
    parent: "/landlord/units/:propertyId",
  },
  "/landlord/units/:propertyId/:unitId/edit": {
    name: "Edit",
    parent: "/landlord/units/:propertyId/:unitId",
  },

  // listing
  "/landlord/listing": { name: "Listing" },
  "/landlord/listing/:unitId/review": { name: "Unit Review", parent: "/landlord/listing"},
  "/landlord/listing/:listingId/details": { name: "Details", parent: "/landlord/listing"},

  // tenant screening
  "/landlord/screening": { name: "Tenant Screening" },
  "/landlord/screening/:screeningId/details": { name: "Screening Details", parent: "/landlord/screening"},

  // leases
  "/landlord/leases": { name: "Leases" },
  "/landlord/leases/create": { name: "Create", parent: "/landlord/leases"},
  "/landlord/leases/:leaseId/details": { name: "Details", parent: "/landlord/leases"},
  
  // maintenance
  "/landlord/maintenance": { name: "Maintenance" },

  "/landlord/messages": { name: "Messages" },
  "/landlord/messages/:channelId": { name: "Convo",  parent: "/landlord/messages" },
  
  // notifications
  "/landlord/notifications": { name: "Notifications" },
  
  // financials
  "/landlord/financials": { name: "Financials" },

  "/landlord/tenants": { name: "Tenants" },
  "/landlord/payments": { name: "Rent Payments" },
  "/landlord/reports": { name: "Reports & Analytics" },
  "/landlord/engagement": { name: "Engagement Analytics", parent: "/landlord/reports" },
  "/landlord/lease-analytics": { name: "Lease & Rent Analytics", parent: "/landlord/reports" },
  "/landlord/maintenance-analytics": { name: "Maintenance Analytics", parent: "/landlord/reports" },
  "/landlord/account": { name: "Account" },
  "/landlord/settings": { name: "Settings" },
};

// Custom hook for sidebar state management with responsive behavior
const useSidebarState = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedState = sessionStorage.getItem('landlord-sidebar-collapsed');
    if (savedState) {
      setCollapsed(JSON.parse(savedState));
    }

    // Check if mobile on mount and resize
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const newState = !prev;
      if (!isMobile) {
        sessionStorage.setItem('landlord-sidebar-collapsed', JSON.stringify(newState));
      }
      return newState;
    });
  };

  return { collapsed, toggleCollapsed, isMobile };
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
          className="w-6 h-6 text-green-500" 
          fill="currentColor"
        />
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              RentEase
            </span>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full border border-green-200">
              Landlord
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
    <nav className={cn(
      "flex-1 overflow-y-auto overscroll-contain min-h-0",
      isMobile ? "px-2 py-2 space-y-1" : "px-2 sm:px-3 py-3 sm:py-4 space-y-1.5 sm:space-y-2"
    )}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onClose}
          className={cn(
            "group flex items-center transition-colors duration-150 rounded-lg relative",
            "touch-manipulation", // Better touch handling
            location.pathname === item.path
              ? "bg-gradient-to-r from-green-50/80 to-blue-50/80 text-green-700 border border-green-200/50"
              : "text-gray-600 hover:bg-gray-50/80 active:bg-gray-100/80 hover:text-gray-900",
            collapsed && !isMobile ? "px-2 sm:px-3 justify-center" : "px-2 sm:px-3 justify-start gap-2 sm:gap-3",
            isMobile ? "py-2.5 min-h-[44px]" : "py-2.5 sm:py-3 min-h-[40px] sm:min-h-[44px]"
          )}
        >
          {/* Active indicator */}
          {location.pathname === item.path && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-gradient-to-b from-green-500 to-blue-500 rounded-r-full transition-opacity duration-150"
              style={{ height: isMobile ? '24px' : '32px' }}
            />
          )}
          
          <div className="relative flex-shrink-0">
            <item.icon
              className={cn(
                "transition-colors duration-150",
                location.pathname === item.path
                  ? "text-green-600"
                  : "text-gray-400 group-hover:text-gray-600",
                isMobile ? "h-4 w-4" : "h-4 w-4 sm:h-5 sm:w-5"
              )}
            />
          </div>
          
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    "font-medium block truncate",
                    isMobile ? "text-xs sm:text-sm" : "text-sm"
                  )}>
                    {item.name}
                  </span>
                  {item.description && !isMobile && (
                    <p className={cn(
                      "text-gray-500 mt-0.5 truncate text-xs hidden sm:block"
                    )}>
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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
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
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-sm">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "landlord@gmail.com"}
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
                    to="/landlord/account"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onClose?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 text-sm transition-all duration-200 border-b border-gray-100/60",
                      location.pathname === "/landlord/account"
                        ? "bg-gradient-to-r from-green-50/80 to-blue-50/80 text-green-700"
                        : "text-gray-700 hover:bg-gray-50/80 hover:text-gray-900"
                    )}
                  >
                    <Users className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Account</span>
                  </Link>

                  {/* Settings Link */}
                  <Link
                    to="/landlord/settings"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onClose?.();
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 text-sm transition-all duration-200 border-b border-gray-100/60",
                      location.pathname === "/landlord/settings"
                        ? "bg-gradient-to-r from-green-50/80 to-blue-50/80 text-green-700"
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
        "flex-shrink-0 border-t border-gray-200/60 bg-white",
        isMobile ? "pb-safe pb-4" : "pb-0"
      )} style={isMobile ? { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' } : undefined}>
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
        "flex flex-col h-full bg-white/95 backdrop-blur-sm transition-all duration-300 border-r border-gray-200/60",
        "overflow-hidden", // Prevent overflow
        collapsed && !isMobile ? "w-0 opacity-0 pointer-events-none" : "opacity-100",
        isMobile ? "w-[280px] sm:w-64" : "w-64"
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
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [supportChatOpen, setSupportChatOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { name: string; path?: string }[]
  >([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
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

  // Initial fetch
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

  // Listen for real-time notifications
  useSocket(handleRealtimeNotification);

  // Close notifications when clicking outside
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
    }
  };

  // Get notification link based on type
  const getNotificationLink = (notification: Notification): string => {
    const type = notification.type?.toUpperCase() || "SYSTEM";
    switch (type) {
      case "PAYMENT":
        return "/landlord/payments";
      case "MAINTENANCE":
        return "/landlord/maintenance";
      case "MESSAGE":
        return "/landlord/messages";
      case "LEASE":
        return "/landlord/leases";
      case "SCREENING":
        return "/landlord/screening";
      case "LISTING":
        return "/landlord/listing";
      default:
        return "/landlord";
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
    <header className="relative z-[200] bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm border-b border-gray-200/60">
      <div className="flex items-center justify-between w-full gap-2 sm:gap-3">
        {/* Left Section - Menu & Breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "hidden lg:flex flex-shrink-0 hover:bg-gray-50/80 rounded-lg transition-colors duration-150 h-8 w-8 sm:h-9 sm:w-9",
              sidebarCollapsed ? "" : "rotate-180"
            )}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-150" />
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0 hover:bg-gray-50/80 active:bg-gray-100/80 rounded-lg transition-all duration-200 h-8 w-8 sm:h-9 sm:w-9 touch-manipulation min-h-[44px] min-w-[44px]"
            onClick={onMobileMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center text-xs sm:text-sm flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0 flex-1 gap-0.5 sm:gap-1">
              {breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center min-w-0 flex-shrink-0">
                    {index > 0 && (
                      <ChevronRight className="mx-0.5 sm:mx-1 h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                    )}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className="text-gray-600 hover:text-green-600 transition-all duration-200 font-medium hover:underline truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] md:max-w-none"
                      >
                        {crumb.name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-green-600 truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[150px] md:max-w-none">
                        {crumb.name}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-xs sm:text-sm">Loading...</span>
              )}
            </div>
          </nav>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* AI Support Chat */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSupportChatOpen(!supportChatOpen)}
              className="relative hover:bg-gray-50/80 active:bg-gray-100/80 h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200 touch-manipulation group"
              aria-label="Open AI assistant"
              title="AI Assistant"
            >
              <div className="relative">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 group-hover:text-green-700 transition-colors" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Button>
            {supportChatOpen && (
              <SupportChat
                isOpen={supportChatOpen}
                onClose={() => setSupportChatOpen(false)}
              />
            )}
          </div>

          {/* Notifications */}
          <div className="relative notification-dropdown" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative hover:bg-gray-50/80 active:bg-gray-100/80 h-8 w-8 sm:h-9 sm:w-9 rounded-lg transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center shadow-sm font-semibold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>

            {notifsOpen && (
              <div
                className={cn(
                  "absolute right-0 mt-2 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-2xl z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
                  "w-[calc(100vw-2rem)] sm:w-80 max-w-[calc(100vw-1rem)]"
                )}
              >
                    <div className="p-2.5 sm:p-3 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex justify-between items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2">
                          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">Notifications</span>
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs sm:text-sm text-green-600 hover:underline font-medium whitespace-nowrap flex-shrink-0 touch-manipulation"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto overscroll-contain">
                      {loading ? (
                        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500">
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
                            className="touch-manipulation"
                          >
                            <div
                              className={cn(
                                "p-2.5 sm:p-3 hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors duration-150 border-b border-gray-100/50 last:border-b-0 group text-xs sm:text-sm cursor-pointer",
                                !notification.read && "bg-green-50/30"
                              )}
                            >
                              <div className="flex gap-2 sm:gap-3">
                                <div
                                  className={cn(
                                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mt-1.5 sm:mt-2 flex-shrink-0",
                                    !notification.read
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  )}
                                />
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      "font-medium group-hover:text-green-700 transition-colors duration-150 line-clamp-2",
                                      !notification.read
                                        ? "text-gray-900"
                                        : "text-gray-700"
                                    )}
                                  >
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-1 gap-2">
                                    <p className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0">
                                      {formatDistanceToNow(
                                        new Date(notification.createdAt),
                                        { addSuffix: true }
                                      )}
                                    </p>
                                    <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
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

                    <div className="p-2.5 sm:p-3 border-t border-gray-100/60 bg-gray-50/30 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm touch-manipulation"
                        asChild
                        onClick={() => setNotifsOpen(false)}
                      >
                        <Link to="/landlord/notifications">View all notifications</Link>
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

const LandlordLayout = () => {
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
    <div className="flex h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-green-200/20 rounded-full blur-xl hidden sm:block"></div>
        <div className="absolute top-1/4 -right-8 w-12 h-12 bg-blue-200/20 rounded-full blur-xl hidden sm:block"></div>
        <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-teal-200/20 rounded-full blur-xl hidden sm:block"></div>
      </div>

      {/* Desktop Sidebar - Now completely hidden when collapsed */}
      <aside className={cn(
        "hidden lg:block h-full transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-sm border-r border-gray-200/60 z-30 relative",
        "overflow-hidden",
        collapsed ? "w-0 opacity-0 pointer-events-none" : "w-64 opacity-100"
      )}>
        <Sidebar collapsed={collapsed} />
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
      <div className={cn(
        "flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300 relative z-10",
        "overflow-hidden", // Prevent horizontal scroll
        // Adjust main content width based on sidebar state
        collapsed ? "w-full" : "lg:w-[calc(100vw-16rem)]"
      )}>
        <Header 
          onMobileMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-transparent min-h-0 overscroll-contain">
          <div className="p-3 sm:p-4 md:p-6 h-full max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandlordLayout;