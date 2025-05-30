// src/components/Navbar.tsx
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full px-6 py-4 bg-white sticky top-0 z-50 border-b border-gray-100">
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo with gradient */}
        <Link 
          to="/" 
          className="text-2xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-600 bg-clip-text text-transparent"
        >
          RentEase
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8 items-center text-sm font-medium">
          <NavLink 
            to="/about" 
            className={({ isActive }) => 
              isActive 
                ? "text-white bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-md" 
                : "text-gray-600 hover:text-teal-600 transition-colors duration-200"
            }
          >
            About
          </NavLink>
          <NavLink 
            to="/features" 
            className={({ isActive }) => 
              isActive 
                ? "text-white bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-md" 
                : "text-gray-600 hover:text-teal-600 transition-colors duration-200"
            }
          >
            Features
          </NavLink>
          <NavLink 
            to="/pricing" 
            className={({ isActive }) => 
              isActive 
                ? "text-white bg-gradient-to-r from-teal-500 to-blue-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-md" 
                : "text-gray-600 hover:text-teal-600 transition-colors duration-200"
            }
          >
            Pricing
          </NavLink>

          {/* Auth Buttons with modern styling */}
          <div className="flex gap-4 ml-4">
            <NavLink 
              to="/auth/login" 
              className="px-4 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 transition-colors duration-200"
            >
              Login
            </NavLink>
            <NavLink 
              to="/auth/register" 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 text-white hover:shadow-lg transition-all duration-300"
            >
              Register
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}