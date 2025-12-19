import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { Loader2 } from 'lucide-react';

interface MenuData {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  colors?: Record<string, string>;
}

export default function CreateMenu() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
    }
  }, []);

  // 🔍 Search restaurant
  const searchRestaurant = async () => {
    if (!name) {
      alert('Enter restaurant name');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get token manually to ensure it's attached
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      console.log('Searching with token:', token);

      const search = await axios.post('/menu/search', 
        { name }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const best = search.data.bestMatch;

      if (!best) {
        alert('No restaurant found');
        return;
      }

      setPlaceId(best.placeId);

      // Get details with token
      const details = await axios.post('/menu/details', 
        { placeId: best.placeId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMenuData(details.data.menuData);

    } catch (err: any) {
      console.error('Search error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.error || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // 🍽 Create menu
  const createMenu = async () => {
    if (!placeId) {
      alert('PlaceId missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get token manually
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login first');
        return;
      }

      console.log('Creating menu with token:', token);

      await axios.post('/menu/create', 
        {
          placeId,
          theme,
          background: '#ffffff'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Menu created successfully');
      
      // Reset form
      setName('');
      setMenuData(null);
      setPlaceId(null);

    } catch (err: any) {
      console.error('Create menu error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.error || 'Menu creation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-2xl font-bold">Create Menu</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <a href="/login" className="ml-2 text-blue-600 hover:text-blue-800 underline">
            Login here
          </a>
        </div>
      )}

      {/* Login reminder */}
      {!localStorage.getItem('token') && !error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <strong className="font-bold">Note: </strong>
          <span className="block sm:inline">You need to login to create a menu.</span>
          <a href="/login" className="ml-2 text-blue-600 hover:text-blue-800 underline">
            Login here
          </a>
        </div>
      )}

      <div className="flex gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Restaurant name"
          className="border px-4 py-2 rounded-lg flex-1"
          disabled={!localStorage.getItem('token')}
        />
        <button
          onClick={searchRestaurant}
          className="bg-black text-white px-6 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!localStorage.getItem('token') || loading}
        >
          {loading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
          Search
        </button>
      </div>

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}

      {menuData && (
        <div className="bg-white border p-6 rounded-xl space-y-4 shadow-md">
          <div className="flex gap-4">
            {menuData.logo && (
              <img
                src={menuData.logo}
                className="w-24 h-24 rounded object-cover border"
                alt="Restaurant logo"
              />
            )}
            <div>
              <h2 className="font-semibold text-xl">{menuData.name}</h2>
              {menuData.address && <p className="text-gray-600">{menuData.address}</p>}
              {menuData.phone && <p className="text-gray-600">{menuData.phone}</p>}
              {menuData.website && (
                <p className="text-blue-600">
                  <a href={menuData.website} target="_blank" rel="noopener noreferrer">
                    {menuData.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {menuData.colors && (
            <div>
              <p className="font-medium mb-2">Color Palette:</p>
              <div className="flex gap-2">
                {Object.values(menuData.colors).map((c, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded border"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="font-medium mb-2">Select Theme:</p>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`border px-4 py-2 rounded ${theme === 'light' ? 'bg-gray-200 border-gray-400' : 'hover:bg-gray-100'}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`border px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-900' : 'hover:bg-gray-100'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <button
            onClick={createMenu}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading || !localStorage.getItem('token')}
          >
            {loading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
            Create Menu
          </button>
        </div>
      )}
    </div>
  );
}