// src/components/allergen/AllergenIconPicker.tsx
import React from 'react';
import { 
  AlertTriangle, 
  Milk, 
  Wheat, 
  Fish, 
  Nut, 
  Egg, 
  Bean,
  Shell,
  Coffee
} from 'lucide-react';

interface AllergenIconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
}

const AllergenIconPicker: React.FC<AllergenIconPickerProps> = ({ 
  selectedIcon, 
  onIconSelect 
}) => {
  const icons = [
    { value: 'ALERT', label: 'Alert', component: AlertTriangle },
    { value: 'MILK', label: 'Milk', component: Milk },
    { value: 'WHEAT', label: 'Wheat', component: Wheat },
    { value: 'FISH', label: 'Fish', component: Fish },
    { value: 'NUT', label: 'Nuts', component: Nut },
    { value: 'EGG', label: 'Egg', component: Egg },
    { value: 'SOY', label: 'Soy', component: Bean },
    { value: 'SHELLFISH', label: 'Shellfish', component: Shell },
    { value: 'SEEDS', label: 'Seeds', component: Coffee },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
      {icons.map((icon) => {
        const IconComponent = icon.component;
        const isSelected = selectedIcon === icon.value;
        
        return (
          <button
            key={icon.value}
            type="button"
            onClick={() => onIconSelect(icon.value)}
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
  );
};

// THIS LINE IS MANDATORY - DON'T FORGET IT!
export default AllergenIconPicker;