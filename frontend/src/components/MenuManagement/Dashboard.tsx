import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../utils/axios';
import {
  Plus,
  Edit,
  Trash2,
  Menu as MenuIcon,
  Tag,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface Menu {
  id: number;
  title: string;
  restaurantId: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  position: number;
  MenuItems?: MenuItem[];
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  position: number;
}

const MenuManagementDashboard: React.FC = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, [menuId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch menu details
      const menuRes = await axios.get(`/menus/${menuId}`);
      setMenu(menuRes.data.data);
      
      // Fetch categories
      const categoriesRes = await axios.get(`/menu-management/${menuId}/categories`);
      setCategories(categoriesRes.data.data);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`/menu-management/categories/${categoryId}`);
      setCategories(categories.filter(c => c.id !== categoryId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const deleteMenuItem = async (itemId: number, categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await axios.delete(`/menu-management/items/${itemId}`);
      
      // Update local state
      setCategories(categories.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            MenuItems: category.MenuItems?.filter(item => item.id !== itemId)
          };
        }
        return category;
      }));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete item');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600 mt-2">{menu?.title}</p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/menu/${menuId}/allergens`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Tag size={18} />
              Manage Allergens
            </Link>
            <Link
              to={`/menu/${menuId}/categories/new`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Category
            </Link>
          </div>
        </div>
      </div>

      {/* Categories & Items */}
      <div className="space-y-6">
        {categories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
            <MenuIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No categories yet</h3>
            <p className="mt-2 text-gray-500">Create your first category to start adding menu items.</p>
            <Link
              to={`/menu/${menuId}/categories/new`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={18} />
              Create Category
            </Link>
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {/* Category Header */}
              <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-blue-500 rounded"></div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {category.MenuItems?.length || 0} items
                  </span>
                  <Link
                    to={`/menu/${menuId}/categories/${category.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y">
                {category.MenuItems && category.MenuItems.length > 0 ? (
                  category.MenuItems.map(item => (
                    <div key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4 flex-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <MenuIcon className="text-gray-400" size={24} />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/menu/${menuId}/items/${item.id}/edit`}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => deleteMenuItem(item.id, category.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-500">No items in this category yet</p>
                    <Link
                      to={`/menu/${menuId}/categories/${category.id}/items/new`}
                      className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={16} />
                      Add first item
                    </Link>
                  </div>
                )}

                {/* Add Item Button */}
                <div className="px-6 py-4 border-t">
                  <Link
                    to={`/menu/${menuId}/categories/${category.id}/items/new`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Plus size={18} />
                    Add New Item
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuManagementDashboard;