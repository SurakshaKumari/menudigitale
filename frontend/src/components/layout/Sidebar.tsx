import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Menu, 
  Users, 
  Settings,
  FileText,
  Globe,
  MessageSquare,
  BarChart3,
  QrCode,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useTranslation } from 'react-i18next' // Add this import

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation() // Add this hook

  // Update navigation with translations
  const navigation = [
    { 
      name: t('sidebar.dashboard'), // Translated
      href: '/', 
      icon: LayoutDashboard 
    },
    { 
      name: t('sidebar.menus'), // Translated
      href: '/menus', 
      icon: Menu 
    },
    { 
      name: t('sidebar.users'), // Translated
      href: '/users', 
      icon: Users 
    },
    { 
      name: t('sidebar.pdf_generator'), // Translated
      href: '/pdf', 
      icon: FileText 
    },
    { 
      name: t('sidebar.translations'), // Translated
      href: '/translations', 
      icon: Globe 
    },
    { 
      name: t('sidebar.whatsapp'), // Translated
      href: '/whatsapp', 
      icon: MessageSquare 
    },
    { 
      name: t('sidebar.statistics'), // Translated
      href: '/statistics', 
      icon: BarChart3 
    },
    { 
      name: t('sidebar.qr_codes'), // Translated
      href: '/qrcodes', 
      icon: QrCode 
    },
    { 
      name: t('sidebar.opening_hours'), // Translated
      href: '/opening-hours', 
      icon: Clock 
    },
    { 
      name: t('sidebar.settings'), // Translated
      href: '/settings', 
      icon: Settings 
    },
  ]

  return (
    <>
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col sidebar-transition ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                <span className="text-white font-bold text-sm">MD</span>
              </div>
              {!collapsed && (
                <span className="ml-3 text-xl font-bold text-[#0A0C0B]">
                  {t('sidebar.brand')} {/* Translated */}
                </span>
              )}
            </div>
            
            {/* Collapse button - desktop */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-[#687d76]" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-[#687d76]" />
              )}
            </button>
          </div>
          
          <nav className="mt-8 flex-1 flex flex-col space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7BD5B5]/10 to-[#5ac39a]/10 text-[#0A0C0B] border border-[#7BD5B5]/20'
                      : 'text-[#687d76] hover:bg-[#F0F7F4] hover:text-[#0A0C0B]'
                  }`
                }
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${
                  collapsed ? 'mx-auto' : 'mr-3'
                }`} />
                {!collapsed && (
                  <span className="truncate">{item.name}</span>
                )}
                
                {/* Active indicator */}
                {!collapsed && (
                  <span className="ml-auto">
                    <div className={`h-2 w-2 rounded-full ${
                      ({ isActive }: { isActive: boolean }) => 
                        isActive ? 'bg-[#7BD5B5]' : 'hidden'
                    }`} />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          
          {/* Sidebar footer */}
          {!collapsed && (
            <div className="px-4 pt-4 mt-auto border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                    <span className="text-white font-bold text-xs">KZ</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#0A0C0B]">
                    {t('sidebar.powered_by')} {/* Translated */}
                  </p>
                  <p className="text-xs text-[#687d76]">
                    KYZERO® WEBMARKETING
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        aria-label={t('sidebar.toggle_menu')}
      >
        <Menu className="h-6 w-6 text-[#0A0C0B]" />
      </button>
      
      {/* Mobile sidebar overlay */}
      {collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
        collapsed ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                <span className="text-white font-bold text-sm">MD</span>
              </div>
              <span className="ml-3 text-xl font-bold text-[#0A0C0B]">
                {t('sidebar.brand')}
              </span>
            </div>
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 rounded-md hover:bg-gray-100"
              aria-label={t('sidebar.close')}
            >
              <ChevronLeft className="h-5 w-5 text-[#687d76]" />
            </button>
          </div>
          
          <nav className="mt-8 flex-1 flex flex-col space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-[#7BD5B5]/10 to-[#5ac39a]/10 text-[#0A0C0B] border border-[#7BD5B5]/20'
                      : 'text-[#687d76] hover:bg-[#F0F7F4] hover:text-[#0A0C0B]'
                  }`}
                onClick={() => setCollapsed(false)}
              >
                <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="px-4 pt-4 mt-auto border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#7BD5B5] to-[#5ac39a] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">KZ</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#0A0C0B]">
                  {t('sidebar.powered_by')}
                </p>
                <p className="text-xs text-[#687d76]">
                  KYZERO® WEBMARKETING
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar