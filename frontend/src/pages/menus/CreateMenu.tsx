import { useState } from 'react';
import axios from '../../utils/axios';
import { Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';

/* ---------------- Types ---------------- */

interface MenuColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  dark?: string;
  light?: string;
}

interface MenuData {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  colors?: MenuColors;
}

/* ---------------- Component ---------------- */

const CreateMenu: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [error, setError] = useState<string>('');

  const handleSearch = async (): Promise<void> => {
    if (!name.trim()) return;

    setLoading(true);
    setError('');
    setMenuData(null);

    try {
      const res = await axios.post<{ menuData: MenuData }>(
        '/menu/search-restaurant',
        { name }
      );

      setMenuData(res.data.menuData);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          'Failed to fetch restaurant'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0A0C0B]">
          Create New Menu
        </h1>
        <p className="text-[#687d76] mt-1">
          Search your restaurant on Google and auto-import details
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white p-6 rounded-xl border">
        <label className="block text-sm font-medium mb-2">
          Restaurant Name
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Osteria Francescana"
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-[#0A0C0B] text-white px-6 py-2 rounded-lg"
          >
            Search
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {/* Preview Data */}
      {menuData && (
        <div className="bg-white p-6 rounded-xl border space-y-6">
          <div className="flex gap-6 items-start">
            {menuData.logo && (
              <img
                src={menuData.logo}
                alt="logo"
                className="w-28 h-28 rounded-lg object-cover border"
              />
            )}

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                {menuData.name}
              </h2>
              {menuData.address && (
                <p className="text-sm text-[#687d76]">
                  {menuData.address}
                </p>
              )}
              {menuData.phone && (
                <p className="text-sm">{menuData.phone}</p>
              )}
              {menuData.website && (
                <a
                  href={menuData.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600"
                >
                  Website
                </a>
              )}
            </div>
          </div>

          {/* Colors Preview */}
          {menuData.colors && (
            <div>
              <h3 className="font-medium mb-2">
                Extracted Menu Colors
              </h3>
              <div className="flex gap-3">
                {Object.values(menuData.colors).map(
                  (color, i) =>
                    color && (
                      <div
                        key={i}
                        className="w-10 h-10 rounded"
                        style={{ backgroundColor: color }}
                      />
                    )
                )}
              </div>
            </div>
          )}

          {/* Theme Selection */}
          <div>
            <h3 className="font-medium mb-2">Theme</h3>
            <div className="flex gap-4">
              <button className="px-4 py-2 border rounded-lg">
                Light
              </button>
              <button className="px-4 py-2 border rounded-lg">
                Dark
              </button>
            </div>
          </div>

          {/* Final Action */}
          <div className="flex justify-end">
            <button className="bg-[#7BD5B5] px-6 py-2 rounded-lg font-medium">
              Create Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMenu;
