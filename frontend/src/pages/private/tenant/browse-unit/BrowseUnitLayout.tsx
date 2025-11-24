import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, X, Zap, HelpCircle, Menu, Bell, ChevronRight
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type Notification = {
  id: string;
  type: 'viewing' | 'payment' | 'message' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
  action?: string;
};

// ============================================================================
// NOTIFICATION MODAL COMPONENT
// ============================================================================

const NotificationModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'viewing',
      title: 'Viewing Scheduled',
      description: 'Your property viewing for Modern Apartment has been confirmed for tomorrow at 2:00 PM',
      time: '10 min ago',
      read: false,
      action: 'View Details'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      description: 'Your security deposit of ₱15,000 has been processed successfully',
      time: '1 hour ago',
      read: false,
      action: 'View Receipt'
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'Maria Santos sent you a new message about the apartment',
      time: '2 hours ago',
      read: true,
      action: 'Reply'
    },
    {
      id: '4',
      type: 'system',
      title: 'System Update',
      description: 'New features have been added to your landlord dashboard',
      time: '1 day ago',
      read: true,
      action: 'Learn More'
    },
    {
      id: '5',
      type: 'viewing',
      title: 'Viewing Reminder',
      description: 'Remember your scheduled viewing tomorrow at 10:00 AM',
      time: '1 day ago',
      read: true,
      action: 'View Calendar'
    }
  ]);


  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      {/* Modal Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="absolute inset-x-0 top-0 sm:top-auto sm:right-4 sm:inset-x-auto sm:top-20 w-full sm:w-96 sm:max-w-md h-full sm:h-auto sm:max-h-[80vh] bg-white/95 backdrop-blur-sm sm:rounded-lg shadow-xl border-0 sm:border border-gray-200/60 flex flex-col z-[60] overflow-hidden"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Header */}
        <div className="p-3 sm:p-3 border-b border-gray-100/60 bg-gradient-to-r from-white to-gray-50/50 flex-shrink-0">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Notifications</span>
            </h3>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs sm:text-sm text-emerald-600 hover:underline font-medium whitespace-nowrap hidden sm:block"
                >
                  Mark all as read
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-1.5 sm:p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500 text-xs sm:text-sm px-4">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "p-3 sm:p-3 hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-100/50 last:border-b-0 group text-sm cursor-pointer",
                    !notification.read && "bg-emerald-50/30"
                  )}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 sm:gap-3"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                      !notification.read ? "bg-emerald-500" : "bg-gray-300"
                    )} />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p
                        className={cn(
                          "font-medium group-hover:text-emerald-700 transition-colors text-sm break-words",
                          !notification.read
                            ? "text-gray-900"
                            : "text-gray-700"
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-gray-600 text-xs mt-1 line-clamp-2 break-words">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <p className="text-xs text-gray-500 whitespace-nowrap">
                          {notification.time}
                        </p>
                        <motion.div
                          whileHover={{ x: 2 }}
                          className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3 text-center border-t border-gray-100/60 bg-gray-50/30 flex-shrink-0">
          <button className="text-xs sm:text-sm text-emerald-600 hover:underline font-medium">
            View all notifications
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============================================================================
// TOP NAVIGATION BAR COMPONENT
// ============================================================================

const TopNavigationBar = ({ 
  onOpenNotifications
}: { 
  onOpenNotifications: () => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notificationCount = 3; // Mock notification count

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
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
            {/* Notification Button */}
            <Button 
              variant="outline"
              onClick={onOpenNotifications}
              className="relative flex items-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Bell className="h-4 w-4" />
              <span className="text-sm">Notifications</span>
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm"
                >
                  {notificationCount}
                </motion.span>
              )}
            </Button>

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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Notification Icon for Mobile */}
            <Button 
              variant="ghost"
              size="sm"
              onClick={onOpenNotifications}
              className="relative p-2"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center shadow-sm"
                >
                  {notificationCount}
                </motion.span>
              )}
            </Button>

            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/tenant"
                className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Button 
                variant="ghost"
                className="justify-start gap-3 px-2 py-2 h-auto"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">FAQ</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================================================
// MAIN LAYOUT COMPONENT
// ============================================================================

const BrowseUnitLayout = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleOpenNotifications = () => {
    setNotificationOpen(true);
  };

  const handleCloseNotifications = () => {
    setNotificationOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/30 via-white to-sky-50/30">
      {/* Top Navigation Bar */}
      <TopNavigationBar 
        onOpenNotifications={handleOpenNotifications}
      />

      {/* Main Content Area - This is where child routes will render */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={notificationOpen}
        onClose={handleCloseNotifications}
      />
    </div>
  );
};

export default BrowseUnitLayout;