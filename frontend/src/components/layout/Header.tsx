import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Menu as MenuIcon, 
  ChevronDown,
  Globe,
  HelpCircle,
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../theme-provider';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
}

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Mock notifications
  const notifications: Notification[] = [
    {
      id: '1',
      title: 'New Menu Created',
      message: 'Menu "Summer Specials" has been created successfully',
      time: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'Translation Completed',
      message: 'Your menu has been translated to French',
      time: '1 day ago',
      read: true,
      type: 'info'
    },
    {
      id: '3',
      title: 'PDF Generated',
      message: 'PDF version of your menu is ready for download',
      time: '2 days ago',
      read: true,
      type: 'info'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const userRoleLabels: Record<string, string> = {
    admin: 'Administrator',
    editor: 'Editor',
    restaurant_owner: 'Restaurant Owner'
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
      {/* Mobile Menu Toggle (hidden on desktop) */}
      <button className="lg:hidden mr-4" onClick={() => {/* Add mobile menu toggle */}}>
        <MenuIcon className="h-6 w-6" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search menus, restaurants, dishes..."
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Select language"
          >
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium hidden sm:inline">IT</span>
          </button>
        </div>

        {/* Help */}
        <button
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Help"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNotificationsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover p-0 shadow-lg z-50">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-accent transition-colors cursor-pointer ${
                        !notification.read ? 'bg-accent/50' : ''
                      }`}
                      onClick={() => {/* Handle notification click */}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full ${
                          notification.type === 'success' ? 'bg-green-500' :
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'error' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground mt-2 block">
                            {notification.time}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t">
                  <Link
                    to="/notifications"
                    className="text-sm text-primary hover:underline text-center block w-full py-2"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="User profile"
          >
            <div className="flex items-center gap-2">
          
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium truncate max-w-[120px]">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {userRoleLabels[user?.role || 'restaurant_owner']}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg z-50">
                <div className="p-3 border-b">
                  <div className="flex items-center gap-3">
                    {/* {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {userInitials}
                        </span>
                      </div>
                    )} */}
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-primary font-medium mt-1">
                        {userRoleLabels[user?.role || 'restaurant_owner']}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;