import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LanguageSelector from './LanguageSelector';

const MenuHeader = ({ menu, selectedLanguage, onLanguageChange, onMenuUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(menu.title);
  const [editedDescription, setEditedDescription] = useState(menu.description || '');

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/menus/${menu.id}`, {
        title: editedTitle,
        description: editedDescription
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        onMenuUpdate(response.data.data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update menu:', error);
    }
  };

  const handleCopyLink = () => {
    const publicUrl = `${window.location.origin}/menu/${menu.slug}`;
    navigator.clipboard.writeText(publicUrl);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Top row */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              
              {isEditing ? (
                <div className="flex-1 max-w-2xl">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full text-2xl font-bold border-b-2 border-blue-500 focus:outline-none pb-1"
                    placeholder="Menu title"
                    autoFocus
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full text-sm text-gray-600 border rounded p-2 mt-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="2"
                    placeholder="Add a description..."
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{menu.title}</h1>
                  {menu.description && (
                    <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Restaurant: {menu.restaurant?.name}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Views: {menu.viewsCount || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <LanguageSelector
                currentLanguage={selectedLanguage}
                onLanguageChange={onLanguageChange}
                translations={menu.translations || []}
              />
              
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>

          {/* Bottom row - Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? 'Cancel' : 'Edit Info'}
              </button>
              
              <a
                href={`/menu/${menu.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Live
              </a>
            </div>

            {isEditing && (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHeader;