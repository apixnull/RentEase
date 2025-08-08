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
  User,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  X,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuth from "@/hooks/useAuth";

// Sidebar configuration
const sidebarConfig = [
  {
    section: "Management",
    items: [
      {
        path: "/landlord",
        name: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        path: "/landlord/property/properties",
        name: "Properties",
        icon: Home,
      },
      {
        path: "/landlord/leases",
        name: "Leases",
        icon: FileText,
      },
      {
        path: "/landlord/maintenance/maintenances",
        name: "Maintenance",
        icon: Wrench,
      },
    ],
  },
  {
    section: "People",
    items: [
      {
        path: "/landlord/applicants",
        name: "Applicants",
        icon: User,
      },
      {
        path: "/landlord/tenants",
        name: "Tenants",
        icon: Users,
      },
    ],
  },
  {
    section: "Financials",
    items: [
      {
        path: "/landlord/payments",
        name: "Payments",
        icon: DollarSign,
      },
      {
        path: "/landlord/financials",
        name: "Financials",
        icon: CreditCard,
      },
      {
        path: "/landlord/reports",
        name: "Reports",
        icon: BarChart3,
      },
    ],
  },
];

// Breadcrumb configuration
const breadcrumbConfig: Record<string, { name: string; parent?: string }> = {
  "/landlord": { name: "Dashboard" },
  "/landlord/property/properties": { name: "Properties" },
  "/landlord/property/add-property": {
    name: "Add Property",
    parent: "/landlord/property/properties",
  },
  "/landlord/property/:propertyId/details": {
    name: "Details",
    parent: "/landlord/property/properties",
  }, 
  "/landlord/property/:propertyId/add-unit": {
    name: "Add Unit",
    parent: "/landlord/property/:propertyId/details",
  },
  "/landlord/leases": { name: "Leases" },
  "/landlord/maintenance/maintenances": { name: "Maintenance" },
  "/landlord/applicants": { name: "Applicants" },
  "/landlord/tenants": { name: "Tenants" },
  "/landlord/payments": { name: "Payments" },
  "/landlord/financials": { name: "Financials" },
  "/landlord/reports": { name: "Reports" },
  "/landlord/settings": { name: "Settings" },
};

export const LandlordLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const location = useLocation();

  // User data
  const user = { name: "Alex Morgan", avatar: "/avatar.jpg" };
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const message = await logout();
      toast.success(message);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Logout failed. Please try again.");
    }
  };

  // Breadcrumb logic
  const [breadcrumbs, setBreadcrumbs] = useState<
    { name: string; path?: string }[]
  >([]);
// Updated breadcrumb generation logic in useEffect
useEffect(() => {
  const generateBreadcrumbs = () => {
    const currentPath = location.pathname;
    const crumbs: { name: string; path?: string }[] = [];
    const paramCache = new Map<string, string>();

    // Helper to replace params in paths
    const resolvePath = (pattern: string) => {
      let resolved = pattern;
      for (const [key, value] of paramCache.entries()) {
        resolved = resolved.replace(`:${key}`, value);
      }
      return resolved;
    };

    // Find matching pattern with extracted params
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

    // Recursive function to build crumbs
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

    // Start building from current path
    buildCrumbs(currentPath);

    // Reverse to get root-first order and remove current page link
    const reversed = crumbs.reverse();
    if (reversed.length > 0) {
      reversed[reversed.length - 1].path = undefined;
    }

    setBreadcrumbs(reversed);
  };

  generateBreadcrumbs();
}, [location.pathname]);

  // Notifications data
  const notifications = [
    {
      id: 1,
      title: "New lease application",
      time: "10 minutes ago",
      read: false,
      link: "/landlord/applicants",
    },
    {
      id: 2,
      title: "Maintenance request",
      time: "2 hours ago",
      read: true,
      link: "/landlord/maintenance",
    },
    {
      id: 3,
      title: "Payment received",
      time: "5 hours ago",
      read: true,
      link: "/landlord/payments",
    },
  ];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen w-full bg-gradient-to-b from-blue-50 to-green-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-full bg-white w-48 border-r border-gray-200">
        <div className="p-4 flex items-center gap-2">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-1.5 rounded-lg">
            <Home className="text-white h-5 w-5" />
          </div>
          <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            RentEase
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {sidebarConfig.map((section, index) => (
            <div key={index} className="mb-3">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {section.section}
              </h3>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto px-2 py-3 border-t border-gray-200 space-y-0.5">
          <Link
            to="/landlord/settings"
            className="flex items-center gap-3 py-2 px-3 rounded text-gray-600 hover:bg-gray-100"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="text-xs font-medium">Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full py-2 px-3 rounded text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
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
              className="fixed left-0 top-0 z-50 h-screen w-64 bg-white lg:hidden flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-3 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-1.5 rounded-lg">
                    <Home className="text-white h-5 w-5" />
                  </div>
                  <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    RentEase
                  </h1>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-2">
                {sidebarConfig.map((section, index) => (
                  <div key={index} className="mb-3">
                    <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      {section.section}
                    </h3>
                    <ul className="space-y-0.5">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                              location.pathname === item.path
                                ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              {item.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="mt-auto px-2 py-3 border-t border-gray-200 space-y-0.5">
                <Link
                  to="/landlord/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">Settings</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 lg:border-l lg:border-l-gray-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumbs */}
            <div className="flex items-center">
              <nav className="flex items-center text-sm text-gray-600">
                {breadcrumbs.map((crumb, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                    {crumb.path ? (
                      <Link
                        to={crumb.path}
                        className={cn(
                          "font-medium transition-colors duration-200",
                          "hover:bg-gradient-to-r hover:from-teal-600 hover:to-blue-600 hover:bg-clip-text hover:text-transparent",
                          "hover:underline underline-offset-4 decoration-1",
                          "truncate max-w-[100px] sm:max-w-[140px]"
                        )}
                      >
                        {crumb.name}
                      </Link>
                    ) : (
                      <span className="font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-[160px]">
                        {crumb.name}
                      </span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifsOpen((o) => !o)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[0.65rem] rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <button className="text-xs text-teal-600 hover:underline">
                      Mark all as read
                    </button>
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
                            "p-3 flex gap-2 hover:bg-gray-50 cursor-pointer text-sm",
                            !notification.read && "bg-teal-50"
                          )}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {!notification.read && (
                              <span className="w-2 h-2 bg-teal-500 rounded-full inline-block"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "truncate font-medium",
                                !notification.read
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="p-2 text-center border-t border-gray-200">
                    <Link
                      to="/landlord/notifications"
                      className="text-xs text-teal-600 hover:underline"
                      onClick={() => setNotifsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.avatar}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-blue-500 text-white text-xs">
                    AM
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-[0.6rem] font-semibold text-teal-600">
                  Landlord
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 min-h-0 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
