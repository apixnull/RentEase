import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export const LandlordLayout = () => {
  
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Mock user data
  const user = { name: "Alex Morgan", avatar: "/avatar.jpg" };
  
  // Logout function
  const handleLogout = () => {
    toast.success("You have been logged out.");
    logoutUser(); 
    navigate("/", { replace: true }); // Redirect to login page immediately
  };

  // Theme toggle
  const toggleTheme = () => setIsDarkMode(d => !d);

  // Dynamic header title
  const [title, setTitle] = useState("");
  useEffect(() => {
    const pathTitles: Record<string, string> = {
      "/landlord": "Dashboard",
      "/landlord/properties": "Properties",
      "/landlord/leases": "Leases",
      "/landlord/maintenance": "Maintenance",
      "/landlord/applicants": "Applicants",
      "/landlord/tenants": "Tenants",
      "/landlord/payments": "Payments",
      "/landlord/financials": "Financials",
      "/landlord/reports": "Reports",
      "/landlord/settings": "Settings",
    };
    
    setTitle(pathTitles[location.pathname] || "");
  }, [location.pathname]);

  // Close notifications when clicking outside
  useEffect(() => {
    if (!notifsOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const container = document.querySelector('.notification-container');
      if (container && !container.contains(e.target as Node)) {
        setNotifsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notifsOpen]);

  // Navigation items with categories
  const navItems = [
    {
      category: "Management",
      items: [
        { path: "/landlord", icon: LayoutDashboard, label: "Dashboard" },
        { path: "/landlord/properties", icon: Home, label: "Properties" },
        { path: "/landlord/leases", icon: FileText, label: "Leases" },
        { path: "/landlord/maintenance", icon: Wrench, label: "Maintenance" },
      ]
    },
    {
      category: "People",
      items: [
        { path: "/landlord/applicants", icon: User, label: "Applicants" },
        { path: "/landlord/tenants", icon: Users, label: "Tenants" },
      ]
    },
    {
      category: "Financials",
      items: [
        { path: "/landlord/payments", icon: DollarSign, label: "Payments" },
        { path: "/landlord/financials", icon: CreditCard, label: "Financials" },
        { path: "/landlord/reports", icon: BarChart3, label: "Reports" },
      ]
    }
  ];

  return (
    <div className={cn(
      "flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden",
      isDarkMode ? "dark" : "",
      isDarkMode ? "dark:bg-gray-900 dark:text-gray-100" : ""
    )}>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col h-full bg-white dark:bg-gray-800 transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64",
          "border-r dark:border-gray-700"
        )}
      >
        <div className={cn(
          "p-5 flex items-center gap-3 flex-shrink-0 transition-all",
          sidebarCollapsed ? "justify-center p-3" : ""
        )}>
          <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-lg">
            <Home className="text-white h-6 w-6" />
          </div>
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              RentEase
            </h1>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {navItems.map((section) => (
            <div key={section.category} className="mb-6 last:mb-0">
              {!sidebarCollapsed && (
                <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  {section.category}
                </h3>
              )}
              
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 py-3 rounded-lg transition-colors mx-2 group",
                        location.pathname === item.path
                          ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600 dark:from-teal-900/30 dark:to-blue-900/30 dark:text-teal-400"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                        sidebarCollapsed ? "justify-center px-3" : "px-4"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        <div className="mt-auto px-2 py-4 border-t dark:border-gray-700 flex-shrink-0 space-y-1">
          <Link
            to="/landlord/settings"
            className={cn(
              "flex items-center gap-3 py-3 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 mx-2 group",
              sidebarCollapsed ? "justify-center px-3" : "px-4"
            )}
          >
            <SettingsIcon className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Settings
              </div>
            )}
          </Link>
          
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full py-3 rounded-lg mx-2 group",
              "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30",
              sidebarCollapsed ? "justify-center px-3" : "px-4"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Logout
              </div>
            )}
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
              className="fixed left-0 top-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 lg:hidden flex flex-col"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-2 rounded-lg">
                    <Home className="text-white h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                    RentEase
                  </h1>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-4 px-2">
                {navItems.map((section) => (
                  <div key={section.category} className="mb-6 last:mb-0">
                    <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                      {section.category}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                              location.pathname === item.path
                                ? "bg-gradient-to-r from-teal-50/70 to-blue-50/70 text-teal-600 dark:from-teal-900/30 dark:to-blue-900/30 dark:text-teal-400"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            )}
                            onClick={() => setMobileOpen(false)}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="text-sm font-medium">{item.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
              
              <div className="mt-auto px-2 py-4 border-t dark:border-gray-700 space-y-1">
                <Link
                  to="/landlord/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  <SettingsIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
                <button
                   onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area - Now directly adjacent to sidebar */}
      <div className={cn(
        "flex-1 flex flex-col h-full w-full overflow-hidden",
        sidebarCollapsed ? "lg:w-[calc(100%-5rem)]" : "lg:w-[calc(100%-16rem)]"
      )}>
        {/* Topbar - Now perfectly connected to sidebar */}
        <header className={cn(
          "flex items-center justify-between px-4 py-3 sm:px-6",
          "bg-white dark:bg-gray-800",
          "border-b dark:border-gray-700",
          // Remove any margin to connect to sidebar
          "lg:ml-0",
          // Extend to cover the border
          "relative"
        )}>
          {/* Left section */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop sidebar toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
            
            <h1 className="text-xl font-bold whitespace-nowrap bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle with Sun/Moon icons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotifsOpen(o => !o)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  1
                </span>
              </Button>
              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50 notification-container">
                  <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold">Notifications</h3>
                    <button 
                      className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    <Link
                      to="/landlord/applicants"
                      onClick={() => setNotifsOpen(false)}
                    >
                      <div className="p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer bg-teal-50/50 dark:bg-teal-900/10">
                        <div className="flex-shrink-0 mt-1.5">
                          <span className="w-2 h-2 bg-teal-500 rounded-full inline-block"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate text-gray-900 dark:text-gray-100 font-semibold">
                            New lease application
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            10 minutes ago
                          </p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link
                      to="/landlord/maintenance"
                      onClick={() => setNotifsOpen(false)}
                    >
                      <div className="p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <div className="flex-shrink-0 mt-1.5 w-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-700 dark:text-gray-300">
                            Maintenance request
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            2 hours ago
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="p-3 text-center border-t dark:border-gray-700">
                    <Link 
                      to="/landlord/notifications" 
                      className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
                      onClick={() => setNotifsOpen(false)}
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <div className="flex items-center gap-2">
              <Avatar className="ring-2 ring-teal-500">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>AM</AvatarFallback>
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

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};