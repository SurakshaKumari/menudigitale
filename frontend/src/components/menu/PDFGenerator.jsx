import React from 'react';

const PDFGenerator = ({ menu, menuId, currentLanguage }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">PDF Generator</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">PDF Generator component is under development.</p>
        <p className="text-blue-700 text-sm mt-2">This will allow you to generate printable PDF versions of your menu in different languages and templates.</p>
      </div>
    </div>
  );
};

export default PDFGenerator;