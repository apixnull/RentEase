import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Info, Zap, LogIn, UserPlus, Menu, X
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Active link check
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with simple fade-in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center space-x-2">
            <Zap 
              className="w-7 h-7 md:w-8 md:h-8 text-teal-500" 
              fill="currentColor"
            />
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              RentEase
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-3 lg:gap-5 items-center text-sm font-medium">
          {/* Home */}
          <motion.div whileHover={{ y: -2 }}>
            <NavLink 
              to="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/") ? "text-teal-600 font-semibold" : "text-gray-600 hover:text-teal-600"
              }`}
            >
              <Home className="w-5 h-5" />
              Home
            </NavLink>
          </motion.div>
          
          {/* About */}
          <motion.div whileHover={{ y: -2 }}>
            <NavLink 
              to="/about" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/about") ? "text-teal-600 font-semibold" : "text-gray-600 hover:text-teal-600"
              }`}
            >
              <Info className="w-5 h-5" />
              About
            </NavLink>
          </motion.div>
          
          {/* Features - simplified without dropdown */}
          <motion.div whileHover={{ y: -2 }}>
            <NavLink 
              to="/features" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/features") ? "text-teal-600 font-semibold" : "text-gray-600 hover:text-teal-600"
              }`}
            >
              <Zap className="w-5 h-5" />
              Features
            </NavLink>
          </motion.div>
          
          
          {/* Auth Buttons */}
          <div className="flex gap-2 ml-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink 
                to="/auth/login" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                <LogIn className="w-4 h-4" />
                Login
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink 
                to="/auth/register" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </NavLink>
            </motion.div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </nav>

      {/* Mobile Menu with slide animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 py-2 px-2 bg-white/95">
              {/* Home */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <NavLink 
                  to="/" 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
                    isActive("/") ? "text-teal-600 font-semibold bg-gray-50" : "text-gray-600"
                  }`}
                  onClick={closeMenu}
                >
                  <Home className="w-5 h-5" />
                  Home
                </NavLink>
              </motion.div>
              
              {/* About */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <NavLink 
                  to="/about" 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
                    isActive("/about") ? "text-teal-600 font-semibold bg-gray-50" : "text-gray-600"
                  }`}
                  onClick={closeMenu}
                >
                  <Info className="w-5 h-5" />
                  About
                </NavLink>
              </motion.div>
              
              {/* Features */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <NavLink 
                  to="/features" 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
                    isActive("/features") ? "text-teal-600 font-semibold bg-gray-50" : "text-gray-600"
                  }`}
                  onClick={closeMenu}
                >
                  <Zap className="w-5 h-5" />
                  Features
                </NavLink>
              </motion.div>
              
              
              {/* Auth Buttons */}
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100">
                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <NavLink 
                    to="/auth/login" 
                    className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm border border-teal-500 text-teal-600 hover:bg-teal-50"
                    onClick={closeMenu}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </NavLink>
                </motion.div>
                <motion.div
                  initial={{ y: 10 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <NavLink 
                    to="/auth/register" 
                    className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
                    onClick={closeMenu}
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </NavLink>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}