import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, X, Zap, HelpCircle, Menu, Bell,Home,
  Calendar, CreditCard, Settings
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'viewing':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="h-5 w-5 text-green-600" />;
      case 'message':
        return <Settings className="h-5 w-5 text-purple-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'viewing':
        return 'bg-blue-50 border-blue-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      case 'system':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

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
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal Panel */}
      <div className="absolute right-0 top-16 sm:top-20 sm:right-4 w-full sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-md bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm hover:bg-white/20 px-2 py-1 rounded transition-colors"
              >
                Mark all read
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500 text-sm">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="p-2 sm:p-3 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    notification.read 
                      ? getNotificationColor(notification.type) 
                      : `${getNotificationColor(notification.type)} border-l-4 border-l-green-500`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm sm:text-base ${
                          notification.read ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
                        {notification.action && (
                          <button className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors">
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 rounded-b-lg sm:rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {unreadCount} unread of {notifications.length} total
            </span>
            <button className="text-green-600 font-medium hover:text-green-700 transition-colors">
              Notification Settings
            </button>
          </div>
        </div>
      </div>
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
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <Link to="/tenant" className="flex items-center gap-2">
              <Zap className="h-7 w-7 text-green-500" fill="currentColor" />
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
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
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors"
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
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
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
                className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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