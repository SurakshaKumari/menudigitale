import { BarChart3, Users, Menu, FileText, Globe, QrCode, Clock, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Menus', value: '12', icon: Menu, color: 'bg-[#0A0C0B]' },
    { name: 'Active Users', value: '8', icon: Users, color: 'bg-[#7BD5B5]' },
    { name: 'Menu Views', value: '1,254', icon: BarChart3, color: 'bg-[#687d76]' },
    { name: 'PDFs Generated', value: '45', icon: FileText, color: 'bg-[#5ac39a]' },
  ];

  const quickActions = [
    { title: 'Create New Menu', description: 'Start a new menu creation wizard', icon: Menu, color: 'text-[#0A0C0B]', bgColor: 'bg-[#0A0C0B]/5', path: '/menus/create' },
    { title: 'Generate PDF', description: 'Create printable menu PDF', icon: FileText, color: 'text-[#7BD5B5]', bgColor: 'bg-[#7BD5B5]/5', path: '/pdf' },
    { title: 'Translate Menu', description: 'Translate menu to other languages', icon: Globe, color: 'text-[#687d76]', bgColor: 'bg-[#687d76]/5', path: '/translations' },
    { title: 'Manage Opening Hours', description: 'Set restaurant opening times', icon: Clock, color: 'text-[#5ac39a]', bgColor: 'bg-[#5ac39a]/5', path: '/opening-hours' },
  ];

  const recentMenus = [
    { id: 1, name: 'Ristorante Pane e Sugo', updated: '2 hours ago', views: 156, status: 'active' },
    { id: 2, name: 'Pizzeria Napoli', updated: '1 day ago', views: 89, status: 'active' },
    { id: 3, name: 'Trattoria Toscana', updated: '2 days ago', views: 234, status: 'inactive' },
    { id: 4, name: 'Gelateria Artigianale', updated: '3 days ago', views: 67, status: 'active' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#0A0C0B]">Dashboard</h1>
        <p className="mt-2 text-[#687d76]">Welcome back! Here's what's happening with your menus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#687d76]">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-[#0A0C0B]">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#7BD5B5] rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-[#0A0C0B] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              className={`${action.bgColor} rounded-xl border border-gray-200 p-5 text-left hover:shadow-md transition-all hover:border-[#7BD5B5]/30 hover:translate-y-[-2px]`}
              onClick={() => window.location.href = action.path}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.color} bg-white border border-gray-200`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0A0C0B]">{action.title}</h3>
                  <p className="text-sm text-[#687d76] mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Menus & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Menus */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#0A0C0B]">Recent Menus</h2>
            <button className="text-sm text-[#0A0C0B] hover:text-[#2a2c2b] font-medium">
              View all →
            </button>
          </div>
          <div className="space-y-4">
            {recentMenus.map((menu) => (
              <div key={menu.id} className="flex items-center justify-between p-3 hover:bg-[#F0F7F4] rounded-lg transition-colors">
                <div>
                  <h4 className="font-medium text-[#0A0C0B]">{menu.name}</h4>
                  <p className="text-sm text-[#687d76]">Updated {menu.updated}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#687d76]">{menu.views} views</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    menu.status === 'active' 
                      ? 'bg-[#7BD5B5]/10 text-[#5a9e8a]' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {menu.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-[#0A0C0B] mb-6">Statistics Overview</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#687d76]">Menu Performance</span>
                <span className="text-sm text-[#5a9e8a] font-medium">+12.5%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#7BD5B5] rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#687d76]">Translation Usage</span>
                <span className="text-sm text-[#0A0C0B] font-medium">+23.1%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0A0C0B] rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#687d76]">PDF Downloads</span>
                <span className="text-sm text-[#687d76] font-medium">+8.2%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#687d76] rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#687d76]">QR Code Scans</span>
                <span className="text-sm text-[#5ac39a] font-medium">+15.7%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5ac39a] rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="bg-gradient-to-r from-[#F0F7F4] to-[#E8F0ED] rounded-xl border border-[#7BD5B5]/20 p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-semibold text-[#0A0C0B]">What's New?</h2>
            <p className="text-[#687d76] mt-2">WhatsApp integration and Google My Business sync are coming soon!</p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#7BD5B5]" />
                <span className="text-sm font-medium text-[#0A0C0B]">WhatsApp Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#0A0C0B]" />
                <span className="text-sm font-medium text-[#0A0C0B]">Google Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#687d76]" />
                <span className="text-sm font-medium text-[#0A0C0B]">Dynamic QR</span>
              </div>
            </div>
          </div>
          <button className="bg-[#0A0C0B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A1C1B] transition-colors shadow-md hover:shadow-lg whitespace-nowrap">
            Explore Features
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;