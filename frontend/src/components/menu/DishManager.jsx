import React, { useState } from 'react';
import axios from 'axios';

const DishManager = ({ categoryId, dishes, allergens, onUpdate, selectedLanguage }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    allergens: []
  });
  const [editingDish, setEditingDish] = useState(null);

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/menus/categories/${categoryId}/dishes`, newDish, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setNewDish({ title: '', description: '', price: '', imageUrl: '', allergens: [] });
        setShowAddForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add dish:', error);
    }
  };

  const handleUpdateDish = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/menus/dishes/${editingDish.id}`, {
        title: editingDish.title,
        description: editingDish.description,
        price: editingDish.price
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setEditingDish(null);
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update dish:', error);
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Are you sure you want to delete this dish?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/menus/dishes/${dishId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to delete dish:', error);
    }
  };

  const toggleAllergen = (allergenId) => {
    setNewDish(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergenId)
        ? prev.allergens.filter(id => id !== allergenId)
        : [...prev.allergens, allergenId]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-gray-900">Dishes</h4>
        <button
          onClick={() => setShowAddForm(!showAddForm)} 
          className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {showAddForm ? 'Cancel' : 'Add Dish'} {/* Fixed: changed showForm to showAddForm */}
        </button>
      </div>

      {/* Add Dish Form */}
      {showAddForm && ( /* Fixed: changed showForm to showAddForm */
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Add New Dish</h5>
          <form onSubmit={handleAddDish} className="space-y-4">
            <input
              type="text"
              value={newDish.title}
              onChange={(e) => setNewDish({...newDish, title: e.target.value})}
              placeholder="Dish title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
            <textarea
              value={newDish.description}
              onChange={(e) => setNewDish({...newDish, description: e.target.value})}
              placeholder="Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows="2"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              value={newDish.price}
              onChange={(e) => setNewDish({...newDish, price: e.target.value})}
              placeholder="Price"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
            
            {/* Allergens Selection */}
            {allergens.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergens
                </label>
                <div className="flex flex-wrap gap-2">
                  {allergens.map(allergen => (
                    <button
                      key={allergen.id}
                      type="button"
                      onClick={() => toggleAllergen(allergen.id)}
                      className={`px-3 py-1 text-sm rounded-full border ${
                        newDish.allergens.includes(allergen.id)
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      }`}
                    >
                      {allergen.icon} {allergen.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false); /* Fixed: changed showForm to showAddForm */
                  setNewDish({ title: '', description: '', price: '', imageUrl: '', allergens: [] });
                }}
                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-sm text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700"
              >
                Add Dish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dishes List */}
      <div className="space-y-3">
        {dishes && dishes.length > 0 ? (
          dishes.map((dish) => (
            <div key={dish.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{dish.title}</h5>
                      {dish.description && (
                        <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 ml-4">
                      €{parseFloat(dish.price).toFixed(2)}
                    </span>
                  </div>
                  
                  {/* Display Allergens */}
                  {dish.allergens && dish.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {dish.allergens.map(allergen => (
                        <span key={allergen.id} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {allergen.icon} {allergen.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingDish(dish)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDish(dish.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4 text-sm">No dishes yet in this category</p>
        )}
      </div>

      {/* Edit Dish Modal */}
      {editingDish && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Dish</h3>
            <form onSubmit={handleUpdateDish}>
              <input
                type="text"
                value={editingDish.title}
                onChange={(e) => setEditingDish({...editingDish, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                required
              />
              <textarea
                value={editingDish.description || ''}
                onChange={(e) => setEditingDish({...editingDish, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3"
                rows="3"
                placeholder="Description"
              />
              <input
                type="number"
                step="0.01"
                min="0"
                value={editingDish.price}
                onChange={(e) => setEditingDish({...editingDish, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                placeholder="Price"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingDish(null)}
                  className="px-4 py-2 text-gray-700 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
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

export default DishManager;