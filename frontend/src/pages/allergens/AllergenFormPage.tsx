// pages/allergens/AllergenFormPage.tsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, AlertTriangle, Milk, Wheat, Fish, Nut, Egg, Bean } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AllergenFormPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { allergenId } = useParams();
  
  const isEditing = !!allergenId;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
    icon: 'ALERT',
  });

  const icons = [
    { value: 'ALERT', label: t('allergens.icons.alert'), component: AlertTriangle },
    { value: 'MILK', label: t('allergens.icons.milk'), component: Milk },
    { value: 'WHEAT', label: t('allergens.icons.wheat'), component: Wheat },
    { value: 'FISH', label: t('allergens.icons.fish'), component: Fish },
    { value: 'NUT', label: t('allergens.icons.nut'), component: Nut },
    { value: 'EGG', label: t('allergens.icons.egg'), component: Egg },
    { value: 'Bean', label: t('allergens.icons.Bean'), component: Bean },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    
    // After successful save, navigate back
    navigate('/allergens');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/allergens')}
          className="inline-flex items-center gap-2 text-[#687d76] hover:text-[#0A0C0B] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>
        
        <h1 className="text-3xl font-bold text-[#0A0C0B]">
          {isEditing ? t('allergens.edit_title') : t('allergens.create_title')}
        </h1>
        <p className="text-[#687d76] mt-2">
          {isEditing 
            ? t('allergens.edit_subtitle')
            : t('allergens.create_subtitle')}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#0A0C0B] mb-2">
              {t('allergens.form.name.label')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t('allergens.form.name.placeholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
            />
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-[#0A0C0B] mb-2">
              {t('allergens.form.code.label')} *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              maxLength={3}
              placeholder={t('allergens.form.code.placeholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent uppercase"
            />
            <p className="text-sm text-[#687d76] mt-2">
              {t('allergens.form.code.hint')}
            </p>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-[#0A0C0B] mb-3">
              {t('allergens.form.icon.label')} *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {icons.map((icon) => {
                const IconComponent = icon.component;
                const isSelected = formData.icon === icon.value;
                
                return (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                    className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-all ${
                      isSelected
                        ? 'border-[#7BD5B5] bg-[#7BD5B5]/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`h-6 w-6 mb-2 ${
                      isSelected ? 'text-[#7BD5B5]' : 'text-gray-500'
                    }`} />
                    <span className={`text-xs font-medium ${
                      isSelected ? 'text-[#7BD5B5]' : 'text-gray-600'
                    }`}>
                      {icon.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#0A0C0B] mb-2">
              {t('allergens.form.description.label')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder={t('allergens.form.description.placeholder')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7BD5B5] focus:border-transparent"
            />
            <p className="text-sm text-[#687d76] mt-2">
              {t('allergens.form.description.hint')}
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/allergens')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-[#0A0C0B] hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-[#0A0C0B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1A1C1B]"
          >
            <Save className="h-5 w-5" />
            {isEditing ? t('common.save_changes') : t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllergenFormPage;