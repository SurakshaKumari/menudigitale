import React, { useState, useEffect } from 'react';
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
  Sun,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileOpen || isNotificationsOpen) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotificationsOpen]);

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
      setIsSearchExpanded(false);
      setSearchQuery('');
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
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 lg:px-8">
      {/* Left Section: Logo & Mobile Menu */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <MenuIcon className="h-5 w-5" />
          )}
        </button>

        {/* Logo/Brand - Hidden on small mobile when search is expanded */}
        {!isSearchExpanded && (
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                <span className="text-white font-bold text-sm">MD</span>
              </div>
              <span className="hidden sm:inline text-lg font-semibold text-[#0A0C0B]">
                MenùDigitale
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Center Section: Search Bar */}
      <div className={`flex-1 transition-all duration-300 ${
        isSearchExpanded 
          ? 'absolute left-0 right-0 top-16 bg-background border-b px-4 py-3 z-40' 
          : 'max-w-md mx-4'
      }`}>
        <form onSubmit={handleSearch} className="relative">
          {/* Search icon - only show on mobile when not expanded */}
          {!isSearchExpanded && (
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          {/* Desktop search icon */}
          <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
            isSearchExpanded ? 'hidden lg:block' : 'hidden lg:block'
          }`} />

          {/* Search input */}
          <input
            type="search"
            placeholder={isSearchExpanded ? "Search..." : "Search menus, restaurants, dishes..."}
            className={`w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isSearchExpanded ? 'pl-10' : 'pl-10'
            }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => window.innerWidth < 1024 && setIsSearchExpanded(true)}
          />

          {/* Close search button on mobile */}
          {isSearchExpanded && (
            <button
              type="button"
              onClick={() => {
                setIsSearchExpanded(false);
                setSearchQuery('');
              }}
              className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Right Section: Actions */}
      <div className={`flex items-center gap-1 sm:gap-2 ${
        isSearchExpanded ? 'hidden' : 'flex'
      }`}>
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
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
              <span className="text-sm font-medium hidden md:inline">IT</span>
            </button>
          </div>

          {/* Help */}
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Actions Menu */}
        <div className="sm:hidden relative">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Menu"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          
          {/* Mobile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-popover p-2 shadow-lg z-50">
              {/* User Info */}
              <div className="p-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userInitials}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
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
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                  Help
                </button>
                <button
                  className="flex items-center gap-1 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  aria-label="Language"
                >
                  <Globe className="h-4 w-4" />
                  Language (IT)
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
          )}
        </div>

        {/* Desktop Notifications */}
        <div className="hidden sm:block relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border bg-popover p-0 shadow-lg z-50">
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
                      <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {notification.time}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
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
          )}
        </div>

        {/* Desktop User Profile */}
        <div className="hidden sm:block relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors"
            aria-label="User profile"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                <span className="text-white font-semibold text-xs">
                  {userInitials}
                </span>
              </div>
              <div className="hidden md:block text-left max-w-[140px]">
                <p className="text-sm font-medium truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRoleLabels[user?.role || 'restaurant_owner']}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg z-50">
              <div className="p-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userInitials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user?.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <p className="text-xs text-primary font-medium mt-1 truncate">
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
          )}
        </div>

        {/* Mobile Notifications Icon */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="sm:hidden relative p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Notifications Dropdown */}
      {isNotificationsOpen && (
        <div className="sm:hidden fixed inset-x-4 top-20 bottom-4 bg-popover rounded-lg border shadow-lg z-50 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b hover:bg-accent transition-colors cursor-pointer ${
                  !notification.read ? 'bg-accent/50' : ''
                }`}
                onClick={() => {/* Handle notification click */}}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 h-2 w-2 rounded-full ${
                    notification.type === 'success' ? 'bg-green-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {notification.time}
                    </span>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
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
      )}

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSearchExpanded(false)}
        />
      )}
    </header>
  );
};

export default Header;