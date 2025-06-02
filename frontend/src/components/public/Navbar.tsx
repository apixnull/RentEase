import { useState, type JSX } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

interface AuthLinkItem {
  path: string;
  label: string;
  variant: "outline" | "gradient";
  icon: JSX.Element;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
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

  const authLinks: AuthLinkItem[] = [
    { 
      path: "/auth/login", 
      label: "Login", 
      variant: "outline",
      icon: <LogIn className="w-4 h-4" />
    },
    { 
      path: "/auth/register", 
      label: "Register", 
      variant: "gradient",
      icon: <UserPlus className="w-4 h-4" />
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 15,
        duration: 0.5
      }
    }
  };

  const submenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { 
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const isActiveLink = (path: string, submenuItems?: Array<{ path: string }>) => {
    if (location.pathname === path) return true;
    if (submenuItems) {
      return submenuItems.some(item => location.pathname === item.path);
    }
    return false;
  };

  return (
    <header className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Animated Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{
                rotate: [0, 5, -5, 3, 0],
                scale: [1, 1.1, 1.05, 1.08, 1],
                transition: { 
                  duration: 0.8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              <motion.div
                className="relative"
                animate={{
                  scale: [1, 1.1, 1],
                  transition: {
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }
                }}
              >
                <motion.div
                  className="absolute inset-0 bg-teal-500/20 rounded-full blur-sm"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0],
                    transition: { 
                      duration: 2, 
                      repeat: Infinity,
                      repeatDelay: 3
                    }
                  }}
                />
                <Zap 
                  className="w-7 h-7 md:w-8 md:h-8 text-teal-500" 
                  fill="currentColor"
                />
              </motion.div>
              <motion.span 
                className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-teal-600 via-blue-600 to-teal-600 
                bg-[length:300%_auto] bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  backgroundPosition: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                RentEase
              </motion.span>
            </motion.div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div 
          className="hidden md:flex gap-3 lg:gap-5 items-center text-sm font-medium"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {navLinks.map((link, index) => {
            const isActive = isActiveLink(link.path, link.submenu);
            return (
              <motion.div
                key={link.path}
                variants={itemVariants}
                className="relative group"
              >
                <NavLink 
                  key={index}
                  to={link.path} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 relative ${
                    isActive
                      ? "text-teal-600 font-semibold"
                      : "text-gray-600 hover:text-teal-600"
                  }`}
                >
                  <motion.span
                    whileHover={{ rotate: link.submenu ? 0 : 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {link.icon}
                  </motion.span>
                  {link.label}
                  
                  {isActive && (
                    <motion.div 
                      className="absolute bottom-0 left-1/2 w-4/5 h-0.5 bg-teal-500 rounded-full -translate-x-1/2"
                      initial={{ width: 0 }}
                      animate={{ width: "80%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {link.submenu && (
                    <ChevronDown className="w-4 h-4 ml-1 transform group-hover:rotate-180 transition-transform" />
                  )}
                </NavLink>
                
                {/* Desktop Submenu */}
                {link.submenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 origin-top scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 invisible group-hover:visible">
                    <div className="py-1">
                      {link.submenu.map((subItem) => {
                        const isSubActive = location.pathname === subItem.path;
                        return (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center gap-2 px-4 py-2 text-sm ${
                              isSubActive 
                                ? "bg-teal-50 text-teal-600 font-medium" 
                                : "text-gray-700 hover:bg-teal-50 hover:text-teal-600"
                            }`}
                          >
                            <Sparkles className={`w-3 h-3 ${isSubActive ? "text-teal-500" : "text-teal-400"}`} />
                            {subItem.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          <motion.div 
            className="flex gap-2 ml-2 lg:ml-4"
            variants={containerVariants}
          >
            {authLinks.map((link, index) => (
              <motion.div
                key={link.path}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink 
                  to={link.path} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                    link.variant === "outline" 
                      ? "border border-teal-500 text-teal-600 hover:bg-teal-50" 
                      : "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={toggleMenu}
        >
          {isOpen ? (
            <X size={24} className="text-teal-600" />
          ) : (
            <Menu size={24} />
          )}
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <motion.div 
              className="flex flex-col gap-1 py-2 px-2 bg-white/95 backdrop-blur-sm max-h-[75vh] overflow-y-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => {
                const isActive = isActiveLink(link.path, link.submenu);
                return (
                  <motion.div 
                    key={link.path} 
                    variants={itemVariants}
                    className="rounded-lg"
                  >
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg">
                      <NavLink 
                        to={link.path} 
                        className={`flex items-center gap-3 py-2 px-3 rounded-lg flex-1 text-sm ${
                          isActive
                            ? "text-teal-600 font-semibold" 
                            : "text-gray-600"
                        }`}
                        onClick={!link.submenu ? closeMenu : undefined}
                      >
                        <div className="flex items-center gap-2">
                          {link.icon}
                          {link.label}
                        </div>
                      </NavLink>
                      
                      {link.submenu && (
                        <motion.button
                          className="p-2 mr-1"
                          onClick={() => toggleSubmenu(link.path)}
                          animate={{ rotate: mobileSubmenu === link.path ? 180 : 0 }}
                        >
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        </motion.button>
                      )}
                    </div>
                    
                    {/* Mobile Submenu */}
                    {link.submenu && (
                      <AnimatePresence>
                        {mobileSubmenu === link.path && (
                          <motion.div
                            variants={submenuVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="pl-6 pr-2 mt-1"
                          >
                            {link.submenu.map((subItem) => {
                              const isSubActive = location.pathname === subItem.path;
                              return (
                                <motion.div
                                  key={subItem.path}
                                  variants={itemVariants}
                                  className="rounded-lg my-1"
                                >
                                  <NavLink 
                                    to={subItem.path} 
                                    className={`flex items-center gap-2 py-2 px-4 rounded-lg text-sm ${
                                      isSubActive
                                        ? "bg-teal-50 text-teal-600 font-medium"
                                        : "bg-gray-50 text-gray-700"
                                    }`}
                                    onClick={closeMenu}
                                  >
                                    <Sparkles className={`w-3 h-3 ${isSubActive ? "text-teal-500" : "text-teal-400"}`} />
                                    {subItem.label}
                                  </NavLink>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                );
              })}

              <motion.div 
                className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100"
                variants={containerVariants}
              >
                {authLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    variants={itemVariants}
                    custom={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <NavLink 
                      to={link.path} 
                      className={`flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm ${
                        link.variant === "outline" 
                          ? "border border-teal-500 text-teal-600" 
                          : "bg-gradient-to-r from-teal-500 to-blue-600 text-white"
                      }`}
                      onClick={closeMenu}
                    >
                      {link.icon}
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}