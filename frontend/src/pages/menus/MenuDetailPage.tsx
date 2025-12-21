// pages/menus/MenuListPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MoreVertical, Search, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MenuListPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - Replace with API call
  const menus = [
    { 
      id: 1, 
      name: 'Ristorante Pane e Sugo', 
      status: 'active', 
      categories: 5, 
      dishes: 25, 
      lastUpdated: '2024-01-15',
      views: 156 
    },
    { 
      id: 2, 
      name: 'Pizzeria Napoli', 
      status: 'active', 
      categories: 3, 
      dishes: 15, 
      lastUpdated: '2024-01-14',
      views: 89 
    },
    { 
      id: 3, 
      name: 'Trattoria Toscana', 
      status: 'inactive', 
      categories: 4, 
      dishes: 20, 
      lastUpdated: '2024-01-12',
      views: 234 
    },
  ];

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0C0B]">
            {t('menus.list.title')}
          </h1>
          <p className="text-[#687d76] mt-2">
            {t('menus.list.subtitle')}
          </p>
        </div>
        
        <Link
          to="/menus/create"
          className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1A1C1B] transition-colors"
        >
          <Plus className="h-5 w-5" />
          {t('menus.list.create_new')}
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#687d76]" />
          <input
            type="text"
            placeholder={t('menus.list.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
          />
        </div>
        
        <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5" />
          {t('menus.list.filter')}
        </button>
      </div>

      {/* Menus Grid/List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.name')}
                </th>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.status')}
                </th>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.categories')}
                </th>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.dishes')}
                </th>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.last_updated')}
                </th>
                <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                  {t('menus.list.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMenus.map((menu) => (
                <tr key={menu.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <Link 
                        to={`/menus/${menu.id}`}
                        className="font-medium text-[#0A0C0B] hover:text-[#7BD5B5]"
                      >
                        {menu.name}
                      </Link>
                      <p className="text-sm text-[#687d76] mt-1">
                        {menu.views} {t('menus.list.table.views')}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      menu.status === 'active'
                        ? 'bg-[#7BD5B5]/10 text-[#5a9e8a]'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`status.${menu.status}`)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-[#687d76]">
                    {menu.categories}
                  </td>
                  <td className="py-4 px-6 text-[#687d76]">
                    {menu.dishes}
                  </td>
                  <td className="py-4 px-6 text-[#687d76]">
                    {menu.lastUpdated}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/menus/${menu.id}`}
                        className="p-2 text-[#687d76] hover:text-[#0A0C0B] hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/menu/${menu.id}`} // Public link
                        className="p-2 text-[#687d76] hover:text-[#0A0C0B] hover:bg-gray-100 rounded-lg"
                        title="View"
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        className="p-2 text-[#687d76] hover:text-red-600 hover:bg-gray-100 rounded-lg"
                        title="Delete"
                        onClick={() => {
                          // Delete logic here
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredMenus.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('menus.list.empty.title')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('menus.list.empty.description')}
          </p>
          <Link
            to="/menus/create"
            className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A1C1B]"
          >
            <Plus className="h-5 w-5" />
            {t('menus.list.create_first')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MenuListPage;