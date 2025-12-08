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
  Clock
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Menus', href: '/menus', icon: Menu },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'PDF Generator', href: '/pdf', icon: FileText },
  { name: 'Translations', href: '/translations', icon: Globe },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Statistics', href: '/statistics', icon: BarChart3 },
  { name: 'QR Codes', href: '/qrcodes', icon: QrCode },
  { name: 'Opening Hours', href: '/opening-hours', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col sidebar-transition ${collapsed ? 'lg:w-20' : ''}`}>
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Menu className="h-8 w-8 text-blue-600" />
            {!collapsed && (
              <span className="ml-3 text-xl font-bold text-gray-900">MenuDigitale</span>
            )}
          </div>
          <nav className="mt-8 flex-1 flex flex-col space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {!collapsed && item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  )
}