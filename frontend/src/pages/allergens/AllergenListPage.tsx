// pages/allergens/AllergenListPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, AlertTriangle, Milk, Wheat, Fish, Nut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AllergenListPage = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock allergens data
  const [allergens, setAllergens] = useState([
    { 
      id: 1, 
      name: 'Lactose', 
      description: 'Milk sugar intolerance', 
      code: 'LAC',
      icon: 'MILK',
      createdAt: '2024-01-10'
    },
    { 
      id: 2, 
      name: 'Gluten', 
      description: 'Wheat protein intolerance', 
      code: 'GLU',
      icon: 'WHEAT',
      createdAt: '2024-01-10'
    },
    { 
      id: 3, 
      name: 'Shellfish', 
      description: 'Shellfish allergy', 
      code: 'SHE',
      icon: 'FISH',
      createdAt: '2024-01-09'
    },
    { 
      id: 4, 
      name: 'Nuts', 
      description: 'Tree nut allergy', 
      code: 'NUT',
      icon: 'NUT',
      createdAt: '2024-01-08'
    },
    { 
      id: 5, 
      name: 'Eggs', 
      description: 'Egg protein allergy', 
      code: 'EGG',
      icon: 'EGG',
      createdAt: '2024-01-07'
    },
  ]);

  const filteredAllergens = allergens.filter(allergen =>
    allergen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    allergen.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'MILK': return Milk;
      case 'WHEAT': return Wheat;
      case 'FISH': return Fish;
      case 'NUT': return Nut;
      default: return AlertTriangle;
    }
  };

  const handleDeleteAllergen = (id: number) => {
    if (window.confirm(t('allergens.delete_confirm'))) {
      setAllergens(allergens.filter(a => a.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0C0B]">
            {t('allergens.title')}
          </h1>
          <p className="text-[#687d76] mt-2">
            {t('allergens.subtitle')}
          </p>
        </div>
        
        <Link
          to="/allergens/create"
          className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#1A1C1B]"
        >
          <Plus className="h-5 w-5" />
          {t('allergens.create_new')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#687d76]">
                {t('allergens.stats.total')}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#0A0C0B]">
                {allergens.length}
              </p>
            </div>
            <div className="bg-[#0A0C0B]/5 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[#0A0C0B]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#687d76]">
                {t('allergens.stats.active')}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#0A0C0B]">
                {allergens.length}
              </p>
            </div>
            <div className="bg-[#7BD5B5]/5 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[#7BD5B5]" />
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#687d76]">
                {t('allergens.stats.used_in_dishes')}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#0A0C0B]">
                47
              </p>
            </div>
            <div className="bg-[#687d76]/5 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-[#687d76]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#687d76]" />
        <input
          type="text"
          placeholder={t('allergens.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
        />
      </div>

      {/* Allergens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAllergens.map((allergen) => {
          const IconComponent = getIconComponent(allergen.icon);
          
          return (
            <div key={allergen.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <IconComponent className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-[#0A0C0B]">
                      {allergen.name}
                    </h3>
                    <p className="text-sm text-[#687d76]">
                      Code: {allergen.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Link
                    to={`/allergens/${allergen.id}/edit`}
                    className="p-2 text-[#687d76] hover:text-[#0A0C0B] hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteAllergen(allergen.id)}
                    className="p-2 text-[#687d76] hover:text-red-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-[#687d76] text-sm mb-4">
                {allergen.description}
              </p>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {t('allergens.created')}: {allergen.createdAt}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAllergens.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t('allergens.empty.title')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('allergens.empty.description')}
          </p>
          <Link
            to="/allergens/create"
            className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A1C1B]"
          >
            <Plus className="h-5 w-5" />
            {t('allergens.create_first')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AllergenListPage;