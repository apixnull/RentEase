import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, Zap, HelpCircle
} from "lucide-react";

// ============================================================================
// TOP NAVIGATION BAR COMPONENT
// ============================================================================

const TopNavigationBar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link to="/tenant" className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-teal-500" fill="currentColor" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
                RentEase
              </h1>
              <p className="text-sm text-gray-600">Find your perfect home</p>
            </div>
          </div>
          
          {/* Desktop Navigation Icons */}
          <div className="hidden md:flex items-center gap-2">
            {/* FAQ Button */}
            <Button 
              variant="outline"
              className="flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm">FAQ</span>
            </Button>

            {/* Dashboard Icon */}
            <Link 
              to="/tenant"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Mobile Navigation - Just Dashboard Icon */}
          <div className="flex md:hidden items-center gap-2">
            <Link 
              to="/tenant"
              className="flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

const BrowseUnitLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-sky-50/30">
      {/* Top Navigation Bar */}
      <TopNavigationBar />

      {/* Main Content Area - This is where child routes will render */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default BrowseUnitLayout;