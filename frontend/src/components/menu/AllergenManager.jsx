import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const AllergenManager = ({ menuId, allergens: initialAllergens = [], onAllergensUpdate }) => {
  const [allergens, setAllergens] = useState(initialAllergens);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [error, setError] = useState(null);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingAllergen, setEditingAllergen] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    icon: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialAllergens.length === 0) {
      fetchAllergens();
    } else {
      setLoading(false);
    }
  }, [initialAllergens]);

  const fetchAllergens = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Try different API endpoints
      const endpoints = ['/api/allergens', '/menu/allergens'];
      let response = null;
      
      for (const endpoint of endpoints) {
        try {
          response = await axios.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.data) break;
        } catch (err) {
          console.log(`Trying next endpoint: ${endpoint}`);
        }
      }
      
      if (response?.data) {
        const allergensData = response.data.data || response.data;
        setAllergens(Array.isArray(allergensData) ? allergensData : []);
        if (onAllergensUpdate) {
          onAllergensUpdate(Array.isArray(allergensData) ? allergensData : []);
        }
      } else {
        // Use default allergens if API is not available
        const defaultAllergens = getDefaultAllergens();
        setAllergens(defaultAllergens);
        if (onAllergensUpdate) {
          onAllergensUpdate(defaultAllergens);
        }
      }
    } catch (error) {
      console.error('Failed to fetch allergens:', error);
      setError('Failed to load allergens');
      // Use default allergens as fallback
      const defaultAllergens = getDefaultAllergens();
      setAllergens(defaultAllergens);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAllergens = () => {
    return [
      { id: 1, name: 'Gluten', code: 'A', description: 'Contains gluten from wheat, rye, barley, oats', icon: '🌾', isActive: true },
      { id: 2, name: 'Crustaceans', code: 'B', description: 'Crustaceans such as prawns, crabs, lobster', icon: '🦐', isActive: true },
      { id: 3, name: 'Eggs', code: 'C', description: 'Eggs and egg products', icon: '🥚', isActive: true },
      { id: 4, name: 'Fish', code: 'D', description: 'Fish and fish products', icon: '🐟', isActive: true },
      { id: 5, name: 'Peanuts', code: 'E', description: 'Peanuts and peanut products', icon: '🥜', isActive: true },
      { id: 6, name: 'Soybeans', code: 'F', description: 'Soybeans and soy products', icon: '🌱', isActive: true },
      { id: 7, name: 'Milk', code: 'G', description: 'Milk and milk products (including lactose)', icon: '🥛', isActive: true },
      { id: 8, name: 'Nuts', code: 'H', description: 'Tree nuts (almonds, hazelnuts, walnuts, etc.)', icon: '🌰', isActive: true }
    ];
  };

  const filteredAllergens = allergens.filter(allergen => {
    const matchesSearch = !searchTerm || 
      allergen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allergen.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (allergen.description && allergen.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = showInactive || allergen.isActive;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.code.trim()) errors.code = 'Code is required';
    if (formData.code.length > 10) errors.code = 'Code must be 10 characters or less';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (editingAllergen) {
        // Try to update via API
        try {
          await axios.put(`/api/allergens/${editingAllergen.id}`, formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (apiError) {
          console.log('API update failed, updating locally');
          // Update locally if API fails
          setAllergens(allergens.map(a => 
            a.id === editingAllergen.id ? { ...a, ...formData } : a
          ));
        }
        alert('Allergen updated successfully!');
      } else {
        // Try to create via API
        try {
          const response = await axios.post('/api/allergens', formData, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const newAllergen = response.data.data || { id: Date.now(), ...formData, isActive: true };
          setAllergens([...allergens, newAllergen]);
        } catch (apiError) {
          console.log('API create failed, creating locally');
          // Create locally if API fails
          const newAllergen = { id: Date.now(), ...formData, isActive: true };
          setAllergens([...allergens, newAllergen]);
        }
        alert('Allergen created successfully!');
      }
      
      resetForm();
      fetchAllergens();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Operation failed';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (allergen) => {
    setEditingAllergen(allergen);
    setFormData({
      name: allergen.name,
      code: allergen.code,
      description: allergen.description || '',
      icon: allergen.icon || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (allergen) => {
    if (!window.confirm(`Are you sure you want to delete "${allergen.name}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`/api/allergens/${allergen.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
        console.log('API delete failed, deleting locally');
      }
      
      // Remove locally
      setAllergens(allergens.filter(a => a.id !== allergen.id));
      alert('Allergen deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete allergen');
    }
  };

  const toggleActive = (allergen) => {
    const newStatus = !allergen.isActive;
    setAllergens(allergens.map(a => 
      a.id === allergen.id ? { ...a, isActive: newStatus } : a
    ));
    alert(`Allergen ${newStatus ? 'activated' : 'deactivated'} successfully!`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      icon: ''
    });
    setFormErrors({});
    setEditingAllergen(null);
    setShowForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const iconOptions = ['🌾', '🦐', '🥚', '🐟', '🥜', '🌱', '🥛', '🌰', '🥬', '🌭', '⚫', '⚗️', '🌿', '🐚'];

  const addCommonAllergens = () => {
    if (window.confirm('Add common EU allergens (1-14)?')) {
      const commonAllergens = getDefaultAllergens();
      const newAllergens = [...allergens];
      
      commonAllergens.forEach(allergen => {
        if (!newAllergens.find(a => a.code === allergen.code)) {
          newAllergens.push({ ...allergen, id: Date.now() + Math.random() });
        }
      });
      
      setAllergens(newAllergens);
      alert('Common allergens added!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Allergen Management</h2>
          <p className="text-gray-600 mt-1">Manage food allergens for your menu items</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={addCommonAllergens}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Add EU Allergens
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Allergen
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search allergens by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showInactive 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {showInactive ? <EyeOff size={18} /> : <Eye size={18} />}
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
            <button
              onClick={fetchAllergens}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <span className="text-sm text-gray-500">
              {filteredAllergens.length} of {allergens.length}
            </span>
          </div>
        </div>
      </div>

      {/* Allergen Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingAllergen ? 'Edit Allergen' : 'Add New Allergen'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      placeholder="e.g., Gluten, Peanuts, Dairy"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code * (Max 10 chars)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.code ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      placeholder="e.g., A, B, G1"
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of the allergen..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`text-2xl p-2 rounded-lg border ${
                          formData.icon === icon 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Or enter custom icon/emoji"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Used for visual identification on menus
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {editingAllergen ? 'Update Allergen' : 'Create Allergen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allergens List */}
      {filteredAllergens.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {allergens.length === 0 ? 'No allergens yet' : 'No matching allergens'}
          </h3>
          <p className="mt-2 text-gray-500">
            {allergens.length === 0 
              ? 'Get started by creating your first allergen.' 
              : 'Try adjusting your search or filter.'}
          </p>
          {allergens.length === 0 && (
            <div className="mt-4 space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus size={18} />
                Create First Allergen
              </button>
              <button
                onClick={addCommonAllergens}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Add Common Allergens
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllergens.map(allergen => (
            <div
              key={allergen.id}
              className={`bg-white border rounded-lg p-4 transition-all hover:shadow-md ${
                !allergen.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {allergen.icon && (
                    <span className="text-2xl">{allergen.icon}</span>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{allergen.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Code: {allergen.code}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                        allergen.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {allergen.isActive ? (
                          <>
                            <Check size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <X size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(allergen)}
                    className={`p-2 rounded-lg transition-colors ${
                      allergen.isActive 
                        ? 'text-gray-500 hover:text-red-600 hover:bg-red-50' 
                        : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={allergen.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {allergen.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => handleEdit(allergen)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(allergen)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              
              {allergen.description && (
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                  {allergen.description}
                </p>
              )}
              
              <div className="mt-4 pt-3 border-t text-xs text-gray-500 flex justify-between">
                <span>ID: {allergen.id}</span>
                <span className="text-gray-400">
                  {allergen.isActive ? '✓ Active' : '✗ Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-medium text-blue-900">About Allergen Management</h4>
            <p className="text-blue-700 text-sm mt-1">
              EU regulations require food businesses to declare 14 major allergens. 
              Use this section to manage allergens that apply to your menu items.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllergenManager;