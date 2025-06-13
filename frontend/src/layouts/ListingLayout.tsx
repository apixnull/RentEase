import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut, Zap, Home, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ListingLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => setIsDarkMode(d => !d);
  const logout = () => navigate("/login");

  return (
    <div className={isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}>
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/listing")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ rotate: [0, 5, -5, 3, 0], scale: [1, 1.05, 1.02, 1.07, 1] }}
        >
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.1, 1], transition: { duration: 1, repeat: Infinity, repeatDelay: 2 } }}
          >
            <motion.div
              className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0],
                transition: { duration: 2, repeat: Infinity, repeatDelay: 3 }
              }}
            />
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-teal-500" fill="currentColor" />
          </motion.div>
          <motion.span
            className="font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 bg-[length:300%_auto] bg-clip-text text-transparent text-lg sm:text-xl md:text-2xl"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" } }}
          >
            RentEase
          </motion.span>
        </motion.div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="hidden md:inline">Account</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => navigate("/listing/dashboard")}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleTheme}>
              {isDarkMode ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};