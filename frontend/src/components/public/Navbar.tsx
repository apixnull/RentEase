import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { path: "/about", label: "About" },
    { path: "/features", label: "Features" },
    { path: "/pricing", label: "Pricing" },
  ];

  const authLinks = [
    { path: "/auth/login", label: "Login", variant: "outline" },
    { path: "/auth/register", label: "Register", variant: "gradient" },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
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
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <header className="w-full px-4 py-3 bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo with animation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            to="/" 
            className="text-2xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent"
          >
            RentEase
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-center text-sm font-medium">
          {navLinks.map((link) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <NavLink 
                to={link.path} 
                className={({ isActive }) => 
                  `px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "text-white bg-gradient-to-r from-teal-500 to-blue-600 shadow-md" 
                      : "text-gray-600 hover:text-teal-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </motion.div>
          ))}

          <div className="flex gap-2 ml-2 lg:ml-4">
            {authLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NavLink 
                  to={link.path} 
                  className={`px-3 py-1.5 rounded-lg text-center ${
                    link.variant === "outline" 
                      ? "border border-teal-500 text-teal-600 hover:bg-teal-50" 
                      : "bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-md"
                  }`}
                >
                  {link.label}
                </NavLink>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
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
              className="flex flex-col gap-1 py-3 px-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {navLinks.map((link) => (
                <motion.div
                  key={link.path}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: "#f0fdfa" }}
                  className="rounded-lg"
                >
                  <NavLink 
                    to={link.path} 
                    className={({ isActive }) => 
                      `block py-2 px-4 rounded-lg ${
                        isActive 
                          ? "text-white bg-gradient-to-r from-teal-500 to-blue-600" 
                          : "text-gray-600"
                      }`
                    }
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100">
                {authLinks.map((link) => (
                  <motion.div
                    key={link.path}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-lg"
                  >
                    <NavLink 
                      to={link.path} 
                      className={`block py-2 px-4 rounded-lg text-center ${
                        link.variant === "outline" 
                          ? "border border-teal-500 text-teal-600" 
                          : "bg-gradient-to-r from-teal-500 to-blue-600 text-white"
                      }`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}