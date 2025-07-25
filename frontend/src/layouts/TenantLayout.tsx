import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Home,
  Wrench,
  CreditCard,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuth  from "@/hooks/useAuth";

const TenantLayout = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const location = useLocation();

  // User data
  const user = { name: "Taylor Swift", avatar: "/avatar-tenant.jpg" };
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

  // Title logic
  const [title, setTitle] = useState("");
  useEffect(() => {
    const pathTitles: Record<string, string> = {
      "/tenant": "Dashboard",
      "/tenant/rented-property": "Rented Property",
      "/tenant/maintenance": "Maintenance",
      "/tenant/payments": "Payments",
      "/tenant/applications": "Applications",
      "/tenant/reports": "Reports",
      "/tenant/settings": "Settings",
    };
    setTitle(pathTitles[location.pathname] || "");
  }, [location.pathname]);

  // Notifications data
  const notifications = [
    {
      id: 1,
      title: "Maintenance request approved",
      time: "2 hours ago",
      read: false,
      link: "/tenant/maintenance",
    },
    {
      id: 2,
      title: "Payment confirmation",
      time: "1 day ago",
      read: true,
      link: "/tenant/payments",
    },
    {
      id: 3,
      title: "New property available nearby",
      time: "3 days ago",
      read: false,
      link: "/properties",
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
          {/* Management Section */}
          <div className="mb-3">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Management
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/tenant"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="text-xs font-medium">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tenant/rented-property"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant/rented-property"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Home className="h-4 w-4" />
                  <span className="text-xs font-medium">Rented Property</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tenant/maintenance"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant/maintenance"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Wrench className="h-4 w-4" />
                  <span className="text-xs font-medium">Maintenance</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tenant/applications"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant/applications"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-medium">Applications</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Financials Section */}
          <div className="mb-3">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Financials
            </h3>
            <ul className="space-y-0.5">
              <li>
                <Link
                  to="/tenant/payments"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant/payments"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs font-medium">Payments</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/tenant/reports"
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded transition-colors",
                    location.pathname === "/tenant/reports"
                      ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs font-medium">Reports</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="mt-auto px-2 py-3 border-t border-gray-200 space-y-0.5">
          <Link
            to="/tenant/settings"
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
                {/* Management Section */}
                <div className="mb-3">
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Management
                  </h3>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        to="/tenant"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="text-xs font-medium">Dashboard</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tenant/rented-property"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant/rented-property"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        <span className="text-xs font-medium">Rented Property</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tenant/maintenance"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant/maintenance"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <Wrench className="h-4 w-4" />
                        <span className="text-xs font-medium">Maintenance</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tenant/applications"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant/applications"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-xs font-medium">Applications</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Financials Section */}
                <div className="mb-3">
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Financials
                  </h3>
                  <ul className="space-y-0.5">
                    <li>
                      <Link
                        to="/tenant/payments"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant/payments"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span className="text-xs font-medium">Payments</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tenant/reports"
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded transition-colors",
                          location.pathname === "/tenant/reports"
                            ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600"
                            : "text-gray-600 hover:bg-gray-100"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-xs font-medium">Reports</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>

              <div className="mt-auto px-2 py-3 border-t border-gray-200 space-y-0.5">
                <Link
                  to="/tenant/settings"
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
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden lg:w-[calc(100%-12rem)]">
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

            <h1 className="text-base font-bold whitespace-nowrap bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Browse Property Button - Visible on all screens */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 border-teal-500 text-teal-600 hover:bg-teal-50"
              onClick={() => navigate("/tenant/browse-property")}
            >
              <Search className="h-4 w-4" />
              <span className="hidden xs:inline text-xs font-medium">Browse</span>
              <span className="hidden sm:inline text-xs font-medium">Browse Properties</span>
            </Button>

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
                      to="/tenant/notifications"
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
                    TS
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs font-medium">{user.name}</span>
                <span className="text-[0.6rem] font-semibold text-teal-600">
                  Tenant
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden bg-gradient-to-b from-blue-50/30 to-green-50/30">
          <main className="h-full overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default TenantLayout;