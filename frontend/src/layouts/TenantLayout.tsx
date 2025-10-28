import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { logoutRequest } from "@/api/authApi";

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
    badge: "Active",
  },
  {
    path: "/tenant/my-lease",
    name: "My Lease",
    icon: FileText,
    description: "Current agreement",
    badge: "Active",
  },
  {
    path: "/tenant/messages",
    name: "Messages",
    icon: MessageSquare,
    description: "Contact landlords",
    badge: "3 New",
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
const SidebarHeader = ({ collapsed }: { collapsed: boolean }) => (
  <div className={cn(
    "p-4 transition-all duration-300 border-b border-gray-200/60",
    collapsed ? "px-3" : "px-4"
  )}>
    <div className={cn(
      "flex items-center gap-3 transition-all duration-300",
      collapsed ? "justify-center" : "justify-start"
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
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-emerald-500 to-sky-500 rounded-r-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          
          <div className="relative">
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors flex-shrink-0",
                location.pathname === item.path
                  ? "text-emerald-600"
                  : "text-gray-400 group-hover:text-gray-600"
              )}
            />
            {item.badge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                  item.badge.includes("Due") ? "bg-red-400" : 
                  item.badge.includes("New") ? "bg-blue-400" : "bg-emerald-400"
                )}
              />
            )}
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
                    <span className="font-medium block truncate text-sm">
                      {item.name}
                    </span>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Badge text for collapsed state */}
                  {item.badge && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium ml-2 flex-shrink-0",
                        item.badge.includes("Due") ? "bg-red-100 text-red-700" : 
                        item.badge.includes("New") ? "bg-blue-100 text-blue-700" : 
                        "bg-emerald-100 text-emerald-700"
                      )}
                    >
                      {item.badge.split(' ')[0]}
                    </motion.span>
                  )}
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
    <AnimatePresence>
      {(!collapsed || isMobile) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
          className="mx-3 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200/60"
        >
          <div className="flex items-center justify-between gap-3">
            {/* User Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-10 w-10 border border-white shadow-sm">
                <AvatarImage src={user?.avatarUrl} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 text-sm">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "tenant@gmail.com"}
                </p>
              </div>
            </div>

            {/* More Button */}
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-xl z-50 overflow-hidden"
                  >
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
      <div className="flex-1" />
      <NavUser 
        collapsed={collapsed} 
        isMobile={isMobile}
        onClose={onClose}
      />
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
        collapsed && !isMobile ? "w-0 opacity-0" : "w-64 opacity-100",
        isMobile && "w-64"
      )}
    >
      <SidebarHeader collapsed={collapsed && !isMobile} />
      <SidebarContent 
        collapsed={collapsed}
        isMobile={isMobile}
        onClose={onClose}
      />
    </div>
  );
};

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
  const notifRef = useRef<HTMLDivElement>(null);


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

  // Enhanced notifications data
  const notifications = [
    {
      id: 1,
      title: "Rent payment due in 3 days",
      time: "2 hours ago",
      read: false,
      link: "/tenant/payments",
      type: "payment",
    },
    {
      id: 2,
      title: "Maintenance request approved",
      time: "1 day ago",
      read: true,
      link: "/tenant/maintenance",
      type: "maintenance",
    },
    {
      id: 3,
      title: "New message from landlord",
      time: "2 days ago",
      read: true,
      link: "/tenant/messages",
      type: "message",
    },
    {
      id: 4,
      title: "Lease renewal available",
      time: "3 days ago",
      read: true,
      link: "/tenant/lease",
      type: "lease",
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <header className="bg-white/80 backdrop-blur-sm px-4 py-3 shadow-sm border-b border-gray-200/60">
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

          {/* Simplified Breadcrumbs (removed icons) */}
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
                      className="text-gray-600 hover:text-emerald-600 transition-all duration-200 font-medium hover:underline truncate max-w-[100px] sm:max-w-none"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-emerald-600 truncate max-w-[100px] sm:max-w-none">
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
          {/* Browse Properties Button */}
          <Button
            asChild
            size="sm"
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-sm hover:shadow transition-all duration-200 rounded-lg text-sm",
              "hidden sm:flex h-9"
            )}
          >
            <Link to="/tenant/browse-unit" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Browse Unit</span>
            </Link>
          </Button>

          {/* Mobile Browse Button */}
          <Button
            asChild
            size="icon"
            className={cn(
              "bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white shadow-sm hover:shadow sm:hidden rounded-lg",
              "h-9 w-9"
            )}
          >
            <Link to="/tenant/browse-unit">
              <Search className="h-4 w-4" />
            </Link>
          </Button>

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
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1rem)] bg-white/95 backdrop-blur-sm border border-gray-200/60 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </h3>
                      <button className="text-sm text-emerald-600 hover:underline font-medium">
                        Mark all as read
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={notification.link}
                        onClick={() => setNotifsOpen(false)}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "p-3 hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 group text-sm",
                            !notification.read && "bg-emerald-50/30"
                          )}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              !notification.read ? "bg-emerald-500" : "bg-gray-300"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-medium group-hover:text-emerald-700 transition-colors",
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                )}
                              >
                                {notification.title}
                              </p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500">
                                  {notification.time}
                                </p>
                                <motion.div
                                  whileHover={{ x: 2 }}
                                  className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <ChevronRight className="h-3 w-3" />
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-3 text-center border-t border-gray-100/60 bg-gray-50/30">
                    <Link
                      to="/tenant/notifications"
                      className="text-sm text-emerald-600 hover:underline font-medium"
                      onClick={() => setNotifsOpen(false)}
                    >
                      View all notifications
                    </Link>
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

const TenantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();
  const location = useLocation();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-emerald-50/30 via-white to-sky-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -left-8 w-16 h-16 bg-emerald-200/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 -right-8 w-12 h-12 bg-sky-200/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-8 left-1/4 w-20 h-20 bg-teal-200/20 rounded-full blur-xl"></div>
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
              className="fixed left-0 top-0 z-50 h-screen lg:hidden bg-white/95 backdrop-blur-sm shadow-xl"
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
          <div className="p-4 sm:p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TenantLayout;