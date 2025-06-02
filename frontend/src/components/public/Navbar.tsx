// this navbar, 
// create home, about, features, login and register 
// also make sure it is responsive and sticky
// use the color of gradient green and blue and it must look moder
// add some animations as well using framer motions
// also use icons
// logo RentEase (make sure this is animated text or etc)
// use tailwind css only 
import { motion } from "framer-motion";
import { HomeIcon, InformationCircleIcon, SparklesIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", icon: <HomeIcon className="w-5 h-5" />, href: "#" },
    { name: "About", icon: <InformationCircleIcon className="w-5 h-5" />, href: "#" },
    { name: "Features", icon: <SparklesIcon className="w-5 h-5" />, href: "#" },
    { name: "Login", icon: <UserIcon className="w-5 h-5" />, href: "#" },
    { name: "Register", icon: <UserPlusIcon className="w-5 h-5" />, href: "#" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-white font-bold text-2xl"
            >
              <motion.span
                className="inline-block"
                animate={{ 
                  rotate: [0, 10, -10, 5, 0],
                  scale: [1, 1.1, 1.05, 1.08, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 5
                }}
              >
                Rent
              </motion.span>
              <motion.span 
                className="inline-block ml-1"
                animate={{ 
                  color: ["#fff", "#a5f3fc", "#fff"],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity
                }}
              >
                Ease
              </motion.span>
            </motion.div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="flex items-center text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                whileHover={{ 
                  y: -3,
                  scale: 1.05,
                  textShadow: "0px 0px 8px rgba(255,255,255,0.8)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-gradient-to-b from-teal-600 to-blue-600"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="flex items-center text-white hover:bg-blue-500 px-3 py-3 rounded-md text-base font-medium"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;