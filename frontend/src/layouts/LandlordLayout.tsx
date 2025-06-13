import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Zap,
  FileText,
  Wrench,
  User,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  DollarSign,
  BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const LandlordLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const location = useLocation();

  const user = { name: "Alex Morgan", avatar: "/avatar.jpg" };
  const notifications = [
    { id: 1, title: "New lease application", time: "10m ago", read: false },
    { id: 2, title: "Maintenance request", time: "2h ago", read: true },
    { id: 3, title: "Payment received", time: "1d ago", read: true },
  ];
  const unread = notifications.filter(n => !n.read).length;

  const navGroups = [
    {
      label: "Core",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/landlord" },
        { name: "Properties", icon: Zap, path: "/landlord/properties" },
      ],
    },
    {
      label: "Management",
      items: [
        { name: "Leases", icon: FileText, path: "/landlord/leases" },
        { name: "Maintenance", icon: Wrench, path: "/landlord/maintenance" },
        { name: "Applicants", icon: User, path: "/landlord/applicants" },
        { name: "Tenants", icon: Users, path: "/landlord/tenants" }
      ],
    },
    {
      label: "Financial",
      items: [
        {
          name: "Payments",
          icon: DollarSign,
          path: "/landlord/payments",
        },
        { name: "Financials", icon: CreditCard, path: "/landlord/financials" },
        { name: "Reports", icon: BarChart3, path: "/landlord/reports" }
      ],
    },
  ];

  const settings = { name: "Settings", icon: SettingsIcon, path: "/landlord/settings" };
  const logout = () => { /* handle logout */ };
  const toggleTheme = () => setIsDarkMode(d => !d);

  // Dynamic header title
  const [title, setTitle] = useState("");
  useEffect(() => {
    const all = navGroups.flatMap(g => g.items).concat(settings);
    const match = all.find(i => i.path === location.pathname);
    setTitle(match?.name ?? "");
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden",
        isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      )}
    >
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-full overflow-y-auto border-r bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="p-5 flex items-center gap-3 flex-shrink-0">
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-lg">
            <Zap className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            RentEase
          </h1>
        </div>
        <nav className="px-3 py-4 flex-1">
          {navGroups.map(group => (
            <div key={group.label} className="mb-6">
              <p className="px-4 mb-2 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                          active
                            ? "bg-gradient-to-r from-teal-50 to-blue-50 text-teal-600 dark:from-teal-900/30 dark:to-blue-900/30 dark:text-teal-400"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="px-4 py-4 border-t dark:border-gray-700 flex-shrink-0 space-y-2">
          <Link
            to={settings.path}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <SettingsIcon className="h-5 w-5" />
            <span className="text-sm font-medium">{settings.name}</span>
          </Link>
          <Button
            variant="ghost"
            className="flex items-center gap-2 w-full justify-start px-4 py-2"
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </Button>
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
              className="fixed left-0 top-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 lg:hidden flex flex-col overflow-y-auto"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 flex justify-between items-center border-b dark:border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-lg">
                    <Zap className="text-white h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    RentEase
                  </h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="px-3 py-4 flex-1">
                {navGroups.map(group => (
                  <div key={group.label} className="mb-6">
                    <p className="px-4 mb-2 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">
                      {group.label}
                    </p>
                    <ul className="space-y-1">
                      {group.items.map(item => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
              <div className="px-4 py-4 border-t dark:border-gray-700 flex-shrink-0 space-y-2">
                <Link
                  to={settings.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">{settings.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 w-full justify-start px-4 py-2"
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
          {/* Left: menu + title */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent whitespace-nowrap">
              {title}
            </h1>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifsOpen(o => !o)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </Button>
              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50">
                  {/* …notifications list… */}
                </div>
              )}
            </div>

            {/* Avatar + name & badge */}
            <div className="flex items-center gap-2">
              <Avatar className="ring-2 ring-teal-500">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[0.6rem] font-semibold uppercase bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-100 px-1.5 py-0.5 rounded-full">
                  Landlord
                </span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
