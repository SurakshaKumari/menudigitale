import React from 'react';

const StyleEditor = ({ menu, menuId, onUpdate }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Style Editor</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800">Style Editor component is under development.</p>
        <p className="text-yellow-700 text-sm mt-2">This will allow you to customize fonts, colors, and layout of your menu.</p>
      </div>
    </div>
  );
};

export default StyleEditor;