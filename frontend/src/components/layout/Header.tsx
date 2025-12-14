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
  X,
  Check
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../theme-provider';
import { useTranslation } from 'react-i18next';

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
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Current language - normalize it
  const currentLanguage = i18n.language === 'en-US' || i18n.language === 'en' ? 'en' : i18n.language;

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is outside language elements
      const isLanguageButton = target.closest('[data-language-button]');
      const isLanguageDropdown = target.closest('[data-language-dropdown]');
      
      if (!isLanguageButton && !isLanguageDropdown) {
        setIsLanguageOpen(false);
      }
      
      // Check if click is outside profile elements
      const isProfileButton = target.closest('[data-profile-button]');
      const isProfileDropdown = target.closest('[data-profile-dropdown]');
      
      if (!isProfileButton && !isProfileDropdown) {
        setIsProfileOpen(false);
      }
      
      // Check if click is outside notifications elements
      const isNotificationsButton = target.closest('[data-notifications-button]');
      const isNotificationsDropdown = target.closest('[data-notifications-dropdown]');
      
      if (!isNotificationsButton && !isNotificationsDropdown) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update notifications with translations
  const notifications: Notification[] = [
    {
      id: '1',
      title: t('notifications.new_menu_created'),
      message: t('notifications.menu_created_message'),
      time: '2 hours ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: t('notifications.translation_completed'),
      message: t('notifications.translation_message'),
      time: '1 day ago',
      read: true,
      type: 'info'
    },
    {
      id: '3',
      title: t('notifications.pdf_generated'),
      message: t('notifications.pdf_message'),
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

  const handleLanguageChange = (lng: string) => {
    console.log("Language change button clicked, changing to:", lng);
    console.log("Current language before change:", currentLanguage);
    console.log("i18n.language before change:", i18n.language);
    
    // Change the language
    i18n.changeLanguage(lng)
      .then(() => {
        console.log("Language successfully changed to:", lng);
        console.log("Current language after change:", i18n.language);
        console.log("All languages:", i18n.languages);
        console.log("Translation test after change:", t('header.search'));
      })
      .catch((error: any) => {
        console.error("Error changing language:", error);
      });
    
    // Close the language dropdown
    setIsLanguageOpen(false);
    
    // Also close profile dropdown if open (for mobile)
    setIsProfileOpen(false);
    
    // Store language preference
    localStorage.setItem('i18nextLng', lng);
    console.log("Language saved to localStorage:", lng);
  };

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  const userRoleLabels: Record<string, string> = {
    admin: t('user_roles.admin'),
    editor: t('user_roles.editor'),
    restaurant_owner: t('user_roles.restaurant_owner')
  };

  return (
<header className="sticky top-0 z-[9999] flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 shadow-sm">      {/* Left Section: Logo & Mobile Menu */}
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
          ? 'absolute left-0 right-0 top-16 bg-background border-b px-4 py-3 z-[9998]' 
          : 'max-w-md mx-4'
      }`}>
        <form onSubmit={handleSearch} className="relative">
          {/* Search icon - only show on mobile when not expanded */}
          {!isSearchExpanded && (
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={t('header.search')}
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
            placeholder={isSearchExpanded ? t('header.search') : t('header.search_placeholder')}
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

          {/* Language Selector with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label={t('header.language')}
              data-language-button="true"
            >
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium hidden md:inline">
                {currentLanguage === 'it' ? 'IT' : 'EN'}
              </span>
            </button>

            {/* Language Dropdown */}
            {isLanguageOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-popover p-2 shadow-lg z-[9999]"
                data-language-dropdown="true"
              >
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    {t('header.language')}
                  </div>
                  <button
                    onClick={() => {
                      console.log("ENGLISH BUTTON DIRECT CLICK");
                      handleLanguageChange('en');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                      currentLanguage === 'en' ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇺🇸</span>
                      {t('header.language_en')}
                    </span>
                    {currentLanguage === 'en' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      console.log("ITALIAN BUTTON DIRECT CLICK");
                      handleLanguageChange('it');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                      currentLanguage === 'it' ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇮🇹</span>
                      {t('header.language_it')}
                    </span>
                    {currentLanguage === 'it' && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label={t('header.help')}
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
            data-profile-button="true"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
          
          {/* Mobile Dropdown Menu */}
          {isProfileOpen && (
            <div 
              className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-popover p-2 shadow-lg z-[9999]"
              data-profile-dropdown="true"
            >
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
                  {t('header.my_profile')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t('header.settings')}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      {t('header.light_mode')}
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      {t('header.dark_mode')}
                    </>
                  )}
                </button>
                <button
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  aria-label={t('header.help')}
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('header.help')}
                </button>
                {/* Language Options in Mobile Menu */}
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-3">
                    {t('header.language')}
                  </div>
                  <button
                    onClick={() => {
                      console.log("Mobile EN button click");
                      handleLanguageChange('en');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                      currentLanguage === 'en' ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇺🇸</span>
                      {t('header.language_en')}
                    </span>
                    {currentLanguage === 'en' && <Check className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      console.log("Mobile IT button click");
                      handleLanguageChange('it');
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors ${
                      currentLanguage === 'it' ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🇮🇹</span>
                      {t('header.language_it')}
                    </span>
                    {currentLanguage === 'it' && <Check className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="border-t pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  {t('header.logout')}
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
            aria-label={t('header.notifications')}
            data-notifications-button="true"
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
            <div 
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border bg-popover p-0 shadow-lg z-[9999]"
              data-notifications-dropdown="true"
            >
              <div className="p-4 border-b">
                <h3 className="font-semibold">{t('header.notifications')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(unreadCount === 1 ? 'header.unread_notifications' : 'header.unread_notifications_plural', { count: unreadCount })}
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
                  {t('header.view_all_notifications')}
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
            data-profile-button="true"
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
            <div 
              className="absolute right-0 top-full mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg z-[9999]"
              data-profile-dropdown="true"
            >
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
                  {t('header.my_profile')}
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t('header.settings')}
                </Link>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-4 w-4" />
                      {t('header.light_mode')}
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4" />
                      {t('header.dark_mode')}
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
                  {t('header.logout')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Notifications Icon */}
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="sm:hidden relative p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label={t('header.notifications')}
          data-notifications-button="true"
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
        <div 
          className="sm:hidden fixed inset-x-4 top-20 bottom-4 bg-popover rounded-lg border shadow-lg z-[9999] overflow-hidden flex flex-col"
          data-notifications-dropdown="true"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{t('header.notifications')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(unreadCount === 1 ? 'header.unread_notifications' : 'header.unread_notifications_plural', { count: unreadCount })}
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
              {t('header.view_all_notifications')}
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
          onClick={() => setIsSearchExpanded(false)}
        />
      )}

      {/* Debug button - remove in production */}
      <button
        onClick={() => {
          console.log("DEBUG: Manual language change test");
          console.log("Current i18n.language:", i18n.language);
          console.log("Normalized currentLanguage:", currentLanguage);
          console.log("LocalStorage language:", localStorage.getItem('i18nextLng'));
          
          i18n.changeLanguage('it')
            .then(() => console.log("DEBUG: Changed to Italian"))
            .catch((err: any) => console.error("DEBUG: Error:", err));
        }}
        style={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          zIndex: 1000,
          padding: '8px 16px',
          backgroundColor: '#0A0C0B',
          color: 'white',
          borderRadius: '8px',
          fontSize: '12px'
        }}
      >
        TEST IT
      </button>
    </header>
  );
};

export default Header;