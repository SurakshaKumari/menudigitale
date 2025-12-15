import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Components
import MenuHeader from '../components/menu/MenuHeader';
import CategoryManager from '../components/menu/CategoryManager';

// Placeholder Components
const StyleEditor = () => <div className="p-6"><h2>Style Editor (Coming Soon)</h2></div>;
const PDFGenerator = () => <div className="p-6"><h2>PDF Generator (Coming Soon)</h2></div>;
const StatisticsDashboard = () => <div className="p-6"><h2>Statistics (Coming Soon)</h2></div>;
const LiveMenuPanel = () => <div className="p-6"><h2>Live Menu (Coming Soon)</h2></div>;
const OpeningHoursEditor = () => <div className="p-6"><h2>Opening Hours (Coming Soon)</h2></div>;
const WhatsAppManager = () => <div className="p-6"><h2>WhatsApp (Coming Soon)</h2></div>;

const MenuManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('categories');
  const [menu, setMenu] = useState(null);
  const [allergens, setAllergens] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('it');

  useEffect(() => {
    fetchMenuData();
  }, [id]);

  const fetchMenuData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/menus/${id}/manage`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setMenu(response.data.data.menu);
        setAllergens(response.data.data.allergens || []);
        setStatistics(response.data.data.statistics);
      } else {
        console.error(response.data.error);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load menu data:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    console.log(`Language changed to: ${language}`);
  };

  const handleMenuUpdate = (updatedData) => {
    setMenu(prev => ({ ...prev, ...updatedData }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Menu not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MenuHeader 
        menu={menu}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        onMenuUpdate={handleMenuUpdate}
      />

      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-1 overflow-x-auto py-3 px-4">
            {[
              { id: 'categories', label: '📋 Categories & Dishes', icon: '📋' },
              { id: 'style', label: '🎨 Style Editor', icon: '🎨' },
              { id: 'pdf', label: '📄 PDF Generator', icon: '📄' },
              { id: 'statistics', label: '📊 Statistics', icon: '📊' },
              { id: 'live', label: '🔗 Live Menu', icon: '🔗' },
              { id: 'hours', label: '⏰ Opening Hours', icon: '⏰' },
              { id: 'whatsapp', label: '💬 WhatsApp', icon: '💬' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {activeTab === 'categories' && (
            <CategoryManager
              menu={menu}
              menuId={id}
              allergens={allergens}
              onUpdate={fetchMenuData}
              selectedLanguage={selectedLanguage}
            />
          )}
          
          {activeTab === 'style' && <StyleEditor />}
          {activeTab === 'pdf' && <PDFGenerator />}
          {activeTab === 'statistics' && <StatisticsDashboard />}
          {activeTab === 'live' && <LiveMenuPanel />}
          {activeTab === 'hours' && <OpeningHoursEditor />}
          {activeTab === 'whatsapp' && <WhatsAppManager />}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;