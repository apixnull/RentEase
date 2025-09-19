import { useState, useEffect } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  FileText,
  Wrench,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  Search,
  CreditCard,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Sidebar configuration for tenants
const sidebarConfig = [
  {
    section: "Dashboard",
    icon: LayoutDashboard,
    items: [
      {
        path: "/tenant",
        name: "Dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    section: "Lease & Payments",
    icon: FileText,
    items: [
      {
        path: "/tenant/lease",
        name: "My Lease",
        icon: FileText,
      },
      {
        path: "/tenant/payments",
        name: "Payments",
        icon: CreditCard,
      },
    ],
  },
  {
    section: "Support",
    icon: MessageSquare,
    items: [
      {
        path: "/tenant/maintenance",
        name: "Maintenance",
        icon: Wrench,
      },
      {
        path: "/tenant/messages",
        name: "Messages",
        icon: MessageSquare,
      },
    ],
  },
];

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { name: string; parent?: string }> = {
  "/tenant": { name: "Dashboard" },
  "/tenant/lease": { name: "My Lease" },
  "/tenant/payments": { name: "Payments" },
  "/tenant/maintenance": { name: "Maintenance" },
  "/tenant/messages": { name: "Messages" },
  "/tenant/settings": { name: "Settings" },
};

// Components
const Sidebar = ({ isMobile, onClose }: { isMobile?: boolean; onClose?: () => void }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200",
      isMobile ? "w-64" : "w-56"
    )}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="bg-gradient-to-br from-green-400 to-blue-400 p-2 rounded-lg shadow-sm">
            <Home className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              RentEase
            </h1>
            <p className="text-xs text-gray-500">Tenant Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {sidebarConfig.map((section, index) => (
          <div key={index} className="space-y-2">
            {/* Section Header */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50/50 rounded-md">
              <section.icon className="h-3 w-3 text-gray-400" />
              <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {section.section}
              </h3>
            </div>
            
            {/* Section Items */}
            <div className="space-y-0.5 pl-1">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200",
                    location.pathname === item.path
                      ? "bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-3.5 w-3.5 transition-colors",
                    location.pathname === item.path ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                  )} />
                  <span className="text-xs font-medium">{item.name}</span>
                  {location.pathname === item.path && (
                    <div className="ml-auto w-1 h-1 bg-green-500 rounded-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <Link
          to="/tenant/account"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <User className="h-4 w-4" />
          <span>Account Profile</span>
        </Link>
        <Link
          to="/tenant/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const Header = ({ onMobileMenuClick }: { onMobileMenuClick: () => void }) => {
  const location = useLocation();
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; path?: string }[]>([]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (notifsOpen && !target.closest('.notification-dropdown')) {
        setNotifsOpen(false);
      }
    };

    if (notifsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifsOpen]);

  // User data
  const user = { name: "Sarah Johnson", avatar: "/avatar.jpg" };

  // Notifications data
  const notifications = [
    {
      id: 1,
      title: "Rent payment due in 3 days",
      time: "2 hours ago",
      read: false,
      link: "/tenant/payments",
    },
    {
      id: 2,
      title: "Maintenance request approved",
      time: "1 day ago",
      read: true,
      link: "/tenant/maintenance",
    },
    {
      id: 3,
      title: "New message from landlord",
      time: "2 days ago",
      read: true,
      link: "/tenant/messages",
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Breadcrumb logic
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
            return '([^/]+)';
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
          path: resolvedPath
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
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden flex-shrink-0"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Breadcrumbs */}
          <nav className="flex items-center text-xs sm:text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="mx-1 sm:mx-2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />}
                {crumb.path ? (
                  <Link
                    to={crumb.path}
                    className="text-gray-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent transition-all duration-200 font-medium hover:underline truncate max-w-[80px] sm:max-w-[120px]"
                  >
                    {crumb.name}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent truncate max-w-[100px] sm:max-w-[140px]">
                    {crumb.name}
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Browse Properties Button - Desktop Only */}
          <Button
            asChild
            className="hidden lg:flex bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-sm"
          >
            <Link to="/tenant/browse-properties">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </Link>
          </Button>

          {/* Notifications */}
          <div className="relative notification-dropdown">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotifsOpen(!notifsOpen)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            <AnimatePresence>
              {notifsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50"
                >
                  <div className="p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Notifications</h3>
                      <button className="text-xs sm:text-sm text-green-600 hover:underline">
                        Mark all as read
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={notification.link}
                        onClick={() => setNotifsOpen(false)}
                      >
                        <div
                          className={cn(
                            "p-3 sm:p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0",
                            !notification.read && "bg-green-50"
                          )}
                        >
                          <div className="flex gap-3">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-medium text-sm",
                                !notification.read ? "text-gray-900" : "text-gray-700"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-3 sm:p-4 text-center border-t border-gray-100">
                    <Link
                      to="/tenant/notifications"
                      className="text-xs sm:text-sm text-green-600 hover:underline"
                      onClick={() => setNotifsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs sm:text-sm">
                SJ
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Tenant</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const TenantLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Hide floating search button on messages page
  const isMessagesPage = location.pathname === '/tenant/messages';

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50/30 via-white to-blue-50/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen lg:hidden"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Header onMobileMenuClick={() => setMobileOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-green-50/20 to-blue-50/20">
          <div className="p-6">
            <Outlet />
          </div>
        </main>

        {/* Floating Browse Button for Mobile/Tablet - Hidden on Messages page */}
        {!isMessagesPage && (
          <div className="lg:hidden fixed bottom-6 right-6 z-30">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg rounded-full h-14 w-14 p-0"
            >
              <Link to="/tenant/browse-properties">
                <Search className="h-6 w-6" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
