import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Home, Info, Sparkles, Coins, 
  Mail, Phone, MapPin, Heart, Github, Youtube,
  Linkedin, Facebook, LogIn, UserPlus, Menu, X, Cookie, LayoutDashboard
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

/* ****************** PUBLIC LAYOUT  ****************** */
const PublicLayout = () => {
  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    <CookieConsent />
    </>
  )
}

/* ****************** NAVBAR ****************** */
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Active link check
  const isActive = (path: string) => location.pathname === path;

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "LANDLORD":
        return "/landlord";
      case "TENANT":
        return "/tenant";
      default:
        return "/";
    }
  };

  return (
    <header className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-100 shadow-sm">
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
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
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
                isActive("/") ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"
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
                isActive("/about") ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"
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
                isActive("/features") ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Zap className="w-5 h-5" />
              Features
            </NavLink>
          </motion.div>
          
          {/* Pricing */}
          <motion.div whileHover={{ y: -2 }}>
            <NavLink 
              to="/pricing" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive("/pricing") ? "text-emerald-600 font-semibold" : "text-gray-600 hover:text-emerald-600"
              }`}
            >
              <Coins className="w-5 h-5" />
              Pricing
            </NavLink>
          </motion.div>
          
          {/* Auth Buttons or Dashboard */}
          <div className="flex gap-2 ml-4">
            {user ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={() => navigate(getDashboardRoute())}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavLink 
                    to="/auth/login" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </NavLink>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavLink 
                    to="/auth/register" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:shadow-md"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </NavLink>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-emerald-50"
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
            <div className="flex flex-col gap-1 py-2 px-2 bg-white/90">
              {/* Home */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <NavLink 
                  to="/" 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
                    isActive("/") ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-600"
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
                    isActive("/about") ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-600"
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
                    isActive("/features") ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-600"
                  }`}
                  onClick={closeMenu}
                >
                  <Zap className="w-5 h-5" />
                  Features
                </NavLink>
              </motion.div>
              
              {/* Pricing */}
              <motion.div
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <NavLink 
                  to="/pricing" 
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${
                    isActive("/pricing") ? "text-emerald-600 font-semibold bg-emerald-50" : "text-gray-600"
                  }`}
                  onClick={closeMenu}
                >
                  <Coins className="w-5 h-5" />
                  Pricing
                </NavLink>
              </motion.div>
              
              {/* Auth Buttons or Dashboard */}
              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-emerald-100">
                {user ? (
                  <motion.div
                    initial={{ y: 10 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => {
                        navigate(getDashboardRoute());
                        closeMenu();
                      }}
                      className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:shadow-md w-full"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      initial={{ y: 10 }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <NavLink 
                        to="/auth/login" 
                        className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm border border-emerald-500 text-emerald-600 hover:bg-emerald-50"
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
                        className="flex items-center gap-2 justify-center py-2 px-4 rounded-lg text-sm bg-gradient-to-r from-emerald-600 to-sky-600 text-white hover:shadow-md"
                        onClick={closeMenu}
                      >
                        <UserPlus className="w-4 h-4" />
                        Register
                      </NavLink>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ****************** FOOTER ****************** */
const Footer = () => {
  return (
    <motion.footer 
      className="bg-gradient-to-br from-emerald-950 to-sky-900 text-white pt-16 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* **************************** BRAND COLUMN **************************** */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-emerald-400 mr-3" fill="currentColor" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
                RentEase
              </span>
            </div>
            
            <p className="text-emerald-100/90 max-w-xs">
              Your trusted platform for seamless property rentals. Find your perfect space with ease and confidence.
            </p>
            
            <div className="flex space-x-4">
              {[
                { icon: Facebook, label: "Facebook" },
                { icon: Github, label: "GitHub" },
                { icon: Youtube, label: "YouTube" },
                { icon: Linkedin, label: "LinkedIn" },
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-emerald-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>
          
          {/* **************************** QUICK LINKS **************************** */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { icon: Home, label: "Home", path: "/" },
                { icon: Info, label: "About Us", path: "/about" },
                { icon: Sparkles, label: "Features", path: "/features" },
                { icon: Coins, label: "Pricing", path: "/pricing" },
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.path} 
                    className="flex items-center text-emerald-100/90 hover:text-emerald-400 transition-colors"
                  >
                    <link.icon className="w-4 h-4 mr-3" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
          
          {/* **************************** CONTACT INFO **************************** */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-6 pb-2 border-b-2 border-emerald-500 inline-block">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {[
                { icon: MapPin, text: "123 Rental Street, Property City, PC 12345" },
                { icon: Phone, text: "+1 (555) 123-4567" },
                { icon: Mail, text: "support@rentease.com" },
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <item.icon className="w-5 h-5 mr-3 mt-0.5 text-emerald-400 flex-shrink-0" />
                  <span className="text-emerald-100/90">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          
        </div>
        
        
        {/* **************************** COPYRIGHT **************************** */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-emerald-100/70 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} RentEase. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item, index) => (
              <a
                key={index}
                href="#"
                className="text-emerald-100/70 text-sm hover:text-emerald-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        
        {/* **************************** MADE WITH LOVE **************************** */}
        <motion.div 
          className="flex justify-center items-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10">
            <span className="text-emerald-100/80 text-sm">Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
            <span className="text-emerald-100/80 text-sm">by</span>
            <span className="font-bold bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">RentEase Team</span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};




/* ****************** COOKIE CONSENT ****************** */
const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Cookie className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">We use cookies</h3>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Accept
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PublicLayout