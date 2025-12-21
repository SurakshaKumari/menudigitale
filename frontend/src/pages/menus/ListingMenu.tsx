// pages/menus/MenuListPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search, Filter, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { menuService } from '../../services/menuService';
import { toast } from 'react-hot-toast';

// Updated interface to match API response
interface Menu {
  id: number;
  title: string;
  description: string;
  status: string;
  // REMOVED: logo: string | null; // This is not in API response
  theme: string;
  backgroundColor: string;
  primaryColor: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    categories: number;
    dishes: number;
    views: number;
    qrScans: number;
  };
  restaurant: {
    id: number;
    name: string;
    address: string;
    phone: string;
    website?: string;
    logoUrl: string | null; // This is where the logo URL comes from
  } | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalMenus: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

const MenuListPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalMenus: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to page 1 on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch menus
  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await menuService.getAllMenus({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearchTerm || undefined
      });
      
      if (response.success) {
        // Transform the API response to match our interface
        const transformedMenus = response.data.menus.map((menu: any) => ({
          ...menu,
          // If API returns logo at root level, use it, otherwise use restaurant.logoUrl
          // logo: menu.logo || menu.restaurant?.logoUrl || null // This line is commented out as per new interface
        }));
        
        setMenus(transformedMenus);
        setPagination(response.data.pagination);
      } else {
        setError(response.error || 'Failed to fetch menus');
        toast.error(response.error || 'Failed to fetch menus');
      }
    } catch (err: any) {
      console.error('Failed to fetch menus:', err);
      setError('Network error. Please check your connection.');
      toast.error('Failed to load menus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch menus when page or search term changes
  useEffect(() => {
    fetchMenus();
  }, [pagination.currentPage, debouncedSearchTerm]);

  const handleDeleteMenu = async (menuId: number) => {
    if (!window.confirm(t('menus.list.delete_confirm') || 'Are you sure you want to delete this menu?')) {
      return;
    }

    try {
      const response = await menuService.deleteMenu(menuId.toString());
      
      if (response.success) {
        toast.success('Menu deleted successfully');
        // Refresh menu list
        await fetchMenus();
      } else {
        toast.error(response.error || 'Failed to delete menu');
      }
    } catch (err: any) {
      console.error('Failed to delete menu:', err);
      toast.error('Failed to delete menu. Please try again.');
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleRefresh = () => {
    fetchMenus();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleStatusToggle = async (menuId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? false : true;
      const response = await menuService.updateMenu(menuId.toString(), {
        isActive: newStatus
      });

      if (response.success) {
        toast.success(`Menu ${newStatus ? 'activated' : 'deactivated'} successfully`);
        await fetchMenus();
      } else {
        toast.error(response.error || 'Failed to update menu status');
      }
    } catch (err: any) {
      console.error('Failed to update menu status:', err);
      toast.error('Failed to update menu status');
    }
  };

  // Helper function to get logo URL
  const getLogoUrl = (menu: Menu) => {
    return menu.restaurant?.logoUrl || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0C0B]">
            {t('menus.list.title') || 'Menu Management'}
          </h1>
          <p className="text-[#687d76] mt-2">
            {t('menus.list.subtitle') || 'Manage all your digital menus'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[#0A0C0B] transition-colors"
            disabled={loading}
          >
            Refresh
          </button>
          <Link
            to="/menus/create"
            className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#1A1C1B] transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('menus.list.create_new') || 'Create New Menu'}
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-[#687d76]">
            Total Menus
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#0A0C0B]">
            {pagination.totalMenus}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-[#687d76]">
            Active Menus
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#5a9e8a]">
            {menus.filter(m => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-[#687d76]">
            Total Categories
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#0A0C0B]">
            {menus.reduce((sum, menu) => sum + (menu.statistics?.categories || 0), 0)}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-medium text-[#687d76]">
            Total Dishes
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#0A0C0B]">
            {menus.reduce((sum, menu) => sum + (menu.statistics?.dishes || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#687d76]" />
          <input
            type="text"
            placeholder={t('menus.list.search_placeholder') || 'Search menus by name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            <Filter className="h-5 w-5" />
            {t('menus.list.filter') || 'Filter'}
          </button>
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
            onChange={(e) => {
              if (e.target.value === 'all') {
                setDebouncedSearchTerm('');
              } else {
                setDebouncedSearchTerm(`status:${e.target.value}`);
              }
            }}
            disabled={loading}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Error Loading Menus</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-auto text-sm font-medium text-red-700 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader className="h-8 w-8 text-[#7BD5B5] animate-spin mb-4" />
            <p className="text-[#687d76]">Loading menus...</p>
          </div>
        </div>
      )}

      {/* Menus Table */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Menu Name'}
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Status'}
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Categories'}
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Dishes'}
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Last Updated'}
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-[#0A0C0B]">
                      { 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu) => (
                    <tr key={menu.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <Link 
                            to={`/menus/${menu.id}`}
                            className="font-medium text-[#0A0C0B] hover:text-[#7BD5B5] transition-colors"
                          >
                            {menu.title}
                          </Link>
                          <p className="text-sm text-[#687d76] mt-1 line-clamp-1">
                            {menu.restaurant?.address || 'No address'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {formatDate(menu.createdAt)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            menu.status === 'active'
                              ? 'bg-[#7BD5B5]/10 text-[#5a9e8a]'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {menu.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleStatusToggle(menu.id, menu.status)}
                            className="text-xs text-[#687d76] hover:text-[#0A0C0B]"
                            title={menu.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {menu.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#687d76]">
                        <div className="flex items-center gap-1">
                          <span>{menu.statistics?.categories || 0}</span>
                          {menu.statistics?.categories === 0 && (
                            <span className="text-xs text-gray-400">(No categories)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#687d76]">
                        <div className="flex items-center gap-1">
                          <span>{menu.statistics?.dishes || 0}</span>
                          {menu.statistics?.dishes === 0 && (
                            <span className="text-xs text-gray-400">(No dishes)</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[#687d76]">
                        {formatDate(menu.updatedAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/menus/${menu.id}`}
                            className="p-2 text-[#687d76] hover:text-[#0A0C0B] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Menu"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/menu/${menu.id}`}
                            className="p-2 text-[#687d76] hover:text-[#0A0C0B] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Public Menu"
                            target="_blank"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            className="p-2 text-[#687d76] hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete Menu"
                            onClick={() => handleDeleteMenu(menu.id)}
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
          {menus.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('menus.list.empty.title') || 'No menus yet'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('menus.list.empty.description') || 'Create your first menu to get started'}
              </p>
              <Link
                to="/menus/create"
                className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A1C1B] transition-colors"
              >
                <Plus className="h-5 w-5" />
                {t('menus.list.create_first') || 'Create First Menu'}
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && menus.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <div className="text-sm text-[#687d76]">
                Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalMenus)} of{' '}
                {pagination.totalMenus} menus
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          pagination.currentPage === pageNum
                            ? 'bg-[#0A0C0B] text-white'
                            : 'text-[#687d76] hover:bg-gray-100'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                  className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuListPage;