import { useState, type JSX } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { 
  Home, Info, Zap, LogIn, UserPlus, Menu, X,
  DollarSign, ChevronDown, Sparkles
} from "lucide-react";

interface NavLinkItem {
  path: string;
  label: string;
  icon: JSX.Element;
  submenu?: Array<{ path: string; label: string }>;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [desktopHoveredMenu, setDesktopHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => {
    setIsOpen(false);
    setMobileSubmenu(null);
  };

  const toggleSubmenu = (menu: string) => {
    setMobileSubmenu(mobileSubmenu === menu ? null : menu);
  };

  const navLinks: NavLinkItem[] = [
    { path: "/", label: "Home", icon: <Home className="w-4 h-4 md:w-5 md:h-5" /> },
    { path: "/about", label: "About", icon: <Info className="w-4 h-4 md:w-5 md:h-5" /> },
    { 
      path: "/features", 
      label: "Features", 
      icon: <Zap className="w-4 h-4 md:w-5 md:h-5" />,
      submenu: [
        { path: "/features/booking", label: "Easy Booking" },
        { path: "/features/payment", label: "Secure Payments" },
        { path: "/features/support", label: "24/7 Support" },
      ]
    },
    { path: "/pricing", label: "Pricing", icon: <DollarSign className="w-4 h-4 md:w-5 md:h-5" /> },
  ];

  // Check if link is active
  const isActiveLink = (path: string, submenuItems?: Array<{ path: string }>) => {
    if (location.pathname === path) return true;
    if (submenuItems) {
      return submenuItems.some(item => location.pathname === item.path);
    }
    return false;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <header className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* **************************** LOGO SECTION **************************** */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
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

        {/* **************************** DESKTOP NAVIGATION **************************** */}
        <motion.div 
          className="hidden md:flex gap-3 lg:gap-5 items-center text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.path, link.submenu);
            return (
              <motion.div 
                key={link.path} 
                className="relative group"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                onHoverStart={() => link.submenu && setDesktopHoveredMenu(link.path)}
                onHoverEnd={() => setDesktopHoveredMenu(null)}
              >
                <NavLink 
                  to={link.path} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    isActive ? "text-teal-600 font-semibold" : "text-gray-600 hover:text-teal-600"
                  }`}
                >
                  {link.icon}
                  {link.label}
                  
                  {link.submenu && (
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      desktopHoveredMenu === link.path ? "rotate-180" : ""
                    }`} />
                  )}
                </NavLink>
                
                {/* Desktop submenu - Fixed to only appear on hover */}
                {link.submenu && (
                  <AnimatePresence>
                    {desktopHoveredMenu === link.path && (
                      <motion.div 
                        className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl rounded-lg overflow-hidden"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="py-1">
                          {link.submenu.map((subItem) => (
                            <NavLink
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                location.pathname === subItem.path 
                                  ? "bg-teal-50 text-teal-600 font-medium" 
                                  : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              {subItem.label}
                            </NavLink>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </motion.div>
            );
          })}

          {/* **************************** AUTH BUTTONS **************************** */}
          <motion.div 
            className="flex gap-2 ml-2 lg:ml-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink 
                to="/auth/login" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors duration-200"
              >
                <LogIn className="w-4 h-4" />
                Login
              </NavLink>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink 
                to="/auth/register" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md transition-shadow duration-200"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </NavLink>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* **************************** MOBILE MENU BUTTON **************************** */}
        <motion.button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </nav>

      {/* **************************** MOBILE MENU CONTENT **************************** */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <motion.div 
              className="flex flex-col gap-1 py-2 px-2 bg-white/95 backdrop-blur-sm"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.path, link.submenu);
                return (
                  <motion.div 
                    key={link.path} 
                    className="rounded-lg"
                    variants={itemVariants}
                  >
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg">
                      <NavLink 
                        to={link.path} 
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg flex-1 text-sm ${
                          isActive ? "text-teal-600 font-semibold" : "text-gray-600"
                        }`}
                        onClick={!link.submenu ? closeMenu : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {link.icon}
                          {link.label}
                        </div>
                      </NavLink>
                      
                      {link.submenu && (
                        <button
                          className="p-2 mr-1"
                          onClick={() => toggleSubmenu(link.path)}
                        >
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                            mobileSubmenu === link.path ? "rotate-180" : ""
                          }`} />
                        </button>
                      )}
                    </div>
                    
                    {/* Mobile submenu */}
                    {link.submenu && mobileSubmenu === link.path && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pl-6 pr-2"
                      >
                        {link.submenu.map((subItem) => (
                          <NavLink 
                            key={subItem.path}
                            to={subItem.path} 
                            className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm my-1 ${
                              location.pathname === subItem.path
                                ? "bg-teal-50 text-teal-600 font-medium"
                                : "bg-gray-50 text-gray-700"
                            }`}
                            onClick={closeMenu}
                          >
                            <Sparkles className="w-3 h-3" />
                            {subItem.label}
                          </NavLink>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}

              {/* **************************** MOBILE AUTH BUTTONS **************************** */}
              <motion.div 
                className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100"
                variants={itemVariants}
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex"
                >
                  <NavLink 
                    to="/auth/login" 
                    className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm border border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors flex-1"
                    onClick={closeMenu}
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </NavLink>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="flex"
                >
                  <NavLink 
                    to="/auth/register" 
                    className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md transition-shadow flex-1"
                    onClick={closeMenu}
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </NavLink>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}