import React from 'react';

const LiveMenuPanel = ({ menu, menuId }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Menu</h2>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <p className="text-purple-800">Live Menu Panel component is under development.</p>
        <p className="text-purple-700 text-sm mt-2">This will show your public menu URL and QR code.</p>
      </div>
    </div>
  );
};

export default LiveMenuPanel;