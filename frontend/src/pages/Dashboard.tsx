import { BarChart3, Users, Menu, FileText, Globe, QrCode, Clock, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Menus', value: '12', icon: Menu, color: 'bg-blue-500' },
    { name: 'Active Users', value: '8', icon: Users, color: 'bg-green-500' },
    { name: 'Menu Views', value: '1,254', icon: BarChart3, color: 'bg-purple-500' },
    { name: 'PDFs Generated', value: '45', icon: FileText, color: 'bg-orange-500' },
  ];

  const quickActions = [
    { title: 'Create New Menu', description: 'Start a new menu creation wizard', icon: Menu, color: 'text-blue-600', bgColor: 'bg-blue-50', path: '/menus/create' },
    { title: 'Generate PDF', description: 'Create printable menu PDF', icon: FileText, color: 'text-green-600', bgColor: 'bg-green-50', path: '/pdf' },
    { title: 'Translate Menu', description: 'Translate menu to other languages', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-50', path: '/translations' },
    { title: 'Manage Opening Hours', description: 'Set restaurant opening times', icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50', path: '/opening-hours' },
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your menus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              className={`${action.bgColor} rounded-xl border p-5 text-left hover:shadow-md transition-shadow`}
              onClick={() => window.location.href = action.path}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${action.color} bg-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Menus & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Menus */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Menus</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </button>
          </div>
          <div className="space-y-4">
            {recentMenus.map((menu) => (
              <div key={menu.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{menu.name}</h4>
                  <p className="text-sm text-gray-500">Updated {menu.updated}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{menu.views} views</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    menu.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
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
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics Overview</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Menu Performance</span>
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Translation Usage</span>
                <span className="text-sm text-blue-600 font-medium">+23.1%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">PDF Downloads</span>
                <span className="text-sm text-purple-600 font-medium">+8.2%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">QR Code Scans</span>
                <span className="text-sm text-orange-600 font-medium">+15.7%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">What's New?</h2>
            <p className="text-gray-600 mt-2">WhatsApp integration and Google My Business sync are coming soon!</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">WhatsApp Updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Google Sync</span>
              </div>
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Dynamic QR</span>
              </div>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Explore Features
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;