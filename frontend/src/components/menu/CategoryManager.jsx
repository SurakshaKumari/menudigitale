import React, { useState } from 'react';
import axios from 'axios';
import DishManager from './DishManager';

const CategoryManager = ({ menu, menuId, allergens, onUpdate, selectedLanguage }) => {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '',
    parentId: null 
  });
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/menus/${menuId}/categories`, newCategory, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNewCategory({ name: '', description: '', parentId: null });
        setShowAddCategory(false);
        onUpdate();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.name.trim()) {
      alert('Category name is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/menus/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        description: editingCategory.description
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setEditingCategory(null);
        onUpdate();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? All dishes will also be deleted.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/menus/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onUpdate();
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories & Dishes</h2>
          <p className="text-gray-600 mt-1">Manage your menu structure and items</p>
        </div>
        <button
          onClick={() => setShowAddCategory(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md flex items-center space-x-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Category</span>
        </button>
      </div>

      {/* Add Category Form */}
      {showAddCategory && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Appetizers, Main Courses, Desserts"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Brief description for this category"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory({ name: '', description: '', parentId: null });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-8">
        {menu.categories && menu.categories.length > 0 ? (
          menu.categories
            .filter(cat => !cat.parentId) // Show only main categories
            .map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded">
                        {category.dishes?.length || 0} dishes
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 text-sm mt-2">{category.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1.5 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1.5 text-sm flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Category Content */}
                <div className="p-6">
                  {/* Main dishes in this category */}
                  <DishManager
                    categoryId={category.id}
                    dishes={category.dishes || []}
                    allergens={allergens}
                    onUpdate={onUpdate}
                    selectedLanguage={selectedLanguage}
                  />
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No categories yet</h3>
            <p className="mt-2 text-gray-500">Add your first category to start building your menu</p>
            <button
              onClick={() => setShowAddCategory(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Your First Category
            </button>
          </div>
        )}
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Category</h3>
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;