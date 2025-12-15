// src/pages/menu/CreateMenuPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, AlertCircle, Hash } from 'lucide-react';

const CreateMenuPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    restaurantId: '',
    language: 'en'
  });
  const [slug, setSlug] = useState('');
  const [slugError, setSlugError] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  
  // IMPORTANT: Fix environment variable name
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Function to generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
      .trim();
  };

  // Update slug when name changes (if not using custom slug)
  useEffect(() => {
    if (!isCustomSlug && formData.name) {
      const generatedSlug = generateSlug(formData.name);
      setSlug(generatedSlug);
    }
  }, [formData.name, isCustomSlug]);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Check localStorage for token
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        console.log('Auth Check - Token from localStorage:', token ? 'Present' : 'Missing');
        console.log('Auth Check - User from localStorage:', userStr ? 'Present' : 'Missing');
        
        if (token && userStr) {
          // Verify token is valid (not empty or 'null' string)
          if (token.trim() && token !== 'null' && token !== 'undefined') {
            setIsAuthenticated(true);
            
            // Try to auto-fill restaurantId from user data
            try {
              const user = JSON.parse(userStr);
              if (user?.restaurantId) {
                setFormData(prev => ({
                  ...prev,
                  restaurantId: user.restaurantId.toString()
                }));
              }
            } catch (parseError) {
              console.error('Failed to parse user data:', parseError);
            }
          } else {
            console.error('Invalid token in localStorage:', token);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const slugValue = generateSlug(value);
    setSlug(slugValue);
    setIsCustomSlug(true);
    
    // Validate slug
    if (!slugValue.trim()) {
      setSlugError('Slug cannot be empty');
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slugValue)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError('');
    }
  };

  const handleUseAutoSlug = () => {
    const generatedSlug = generateSlug(formData.name);
    setSlug(generatedSlug);
    setIsCustomSlug(false);
    setSlugError('');
  };

  // Helper function to get token from localStorage
  const getTokenFromLocalStorage = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        return null;
      }
      
      // Clean the token
      const cleanedToken = token.trim();
      
      if (!cleanedToken || cleanedToken === 'null' || cleanedToken === 'undefined') {
        console.error('Invalid token format:', token);
        return null;
      }
      
      console.log('Token retrieved from localStorage:', cleanedToken.substring(0, 20) + '...');
      return cleanedToken;
    } catch (error) {
      console.error('Error getting token from localStorage:', error);
      return null;
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  setSlugError('');

  // 1. Check authentication
  if (!isAuthenticated) {
    setError('You must be logged in to create a menu. Please login first.');
    setIsLoading(false);
    setTimeout(() => navigate('/login'), 2000);
    return;
  }

  // 2. Get token from localStorage
  const token = getTokenFromLocalStorage();
  if (!token) {
    setError('Authentication token not found. Please login again.');
    setIsLoading(false);
    setTimeout(() => navigate('/login'), 2000);
    return;
  }

  // 3. Validate form data
  if (!formData.name.trim()) {
    setError('Menu name is required');
    setIsLoading(false);
    return;
  }

  if (!formData.restaurantId.trim()) {
    setError('Restaurant ID is required');
    setIsLoading(false);
    return;
  }

  // 4. Validate slug
  if (!slug.trim()) {
    setSlugError('Menu slug is required');
    setIsLoading(false);
    return;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    setIsLoading(false);
    return;
  }

  // Prepare request data with slug
  const requestData = {
    ...formData,
    slug: slug
  };

  try {
    console.log('Creating menu with data:', requestData);
    console.log('API URL:', `${API_BASE_URL}/menus`);
    console.log('Using token:', token.substring(0, 20) + '...');

    // Make API call to create menu WITH Authorization header
    const response = await fetch(`${API_BASE_URL}/menus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Handle 500 Internal Server Error specifically
    if (response.status === 500) {
      let errorDetails = 'Internal Server Error (500)';
      
      try {
        // Try to get the error response text
        const errorText = await response.text();
        console.error('Server error response text:', errorText);
        
        // Try to parse as JSON
        try {
          const errorData = JSON.parse(errorText);
          errorDetails = errorData.message || errorData.error || errorText;
        } catch {
          errorDetails = errorText || 'Internal server error occurred';
        }
      } catch (fetchError) {
        console.error('Error reading response:', fetchError);
        errorDetails = 'Cannot read error response from server';
      }
      
      throw new Error(`Server Error: ${errorDetails}. Please check backend logs.`);
    }
    
    if (!response.ok) {
      let errorMessage = 'Failed to create menu';
      
      // Try to get error details from response
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('Error response:', errorData);
        
        // Handle slug-related errors
        if (errorData.error?.includes('slug') || errorMessage?.includes('slug')) {
          setSlugError('This slug is already taken. Please choose a different one.');
          setIsLoading(false);
          return;
        }
      } catch {
        // If response is not JSON
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      
      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setTimeout(() => navigate('/login'), 2000);
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to create menus.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Menu created successfully:', data);
    
    // Navigate to the newly created menu
    const menuId = data.id || data.data?.id || data.menu?.id;
    if (menuId) {
      navigate(`/menus/${menuId}/categories`);
    } else {
      // If no ID returned, navigate to dashboard
      console.warn('Menu created but no ID returned, navigating to dashboard');
      navigate('/');
    }
    
  } catch (err) {
    console.error('Error creating menu:', err);
    setError(err instanceof Error ? err.message : 'An unexpected error occurred');
  } finally {
    setIsLoading(false);
  }
};

  // Show loading while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show not authenticated message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to create a menu.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full mt-4 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Menu className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Menu</h1>
          <p className="mt-3 text-lg text-gray-600">
            Start by filling in the basic details of your menu
          </p>
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <svg className="mr-1.5 h-2 w-2 text-green-800" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Authenticated
            </span>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-700 font-medium">{error}</p>
                    {error.includes('Session expired') || error.includes('login') ? (
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Click here to login
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Menu Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Summer 2024 Menu"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Give your menu a descriptive name that represents your restaurant
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Menu Slug *
                  </label>
                  {!isCustomSlug && formData.name && (
                    <button
                      type="button"
                      onClick={handleUseAutoSlug}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      Edit Slug
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className={`w-full pl-10 pr-4 py-3 border ${
                      slugError ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="e.g., summer-2024-menu"
                    required
                  />
                </div>
                {slugError && (
                  <p className="mt-1 text-sm text-red-600">{slugError}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  URL-friendly version of your menu name. This will be used in the menu URL.
                  {!isCustomSlug && formData.name && (
                    <span className="text-green-600 ml-1">(Auto-generated from menu name)</span>
                  )}
                </p>
                {slug && !slugError && (
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600">
                      Your menu will be accessible at:{' '}
                      <code className="text-green-700 bg-green-50 px-1 py-0.5 rounded">
                        /menu/{slug}
                      </code>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of your menu..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Describe your menu's theme, special features, or seasonal offerings
                </p>
              </div>

              <div>
                <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant ID *
                </label>
                <input
                  type="text"
                  id="restaurantId"
                  name="restaurantId"
                  value={formData.restaurantId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter restaurant ID"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the ID of the restaurant this menu belongs to
                </p>
              </div>

              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Default Language
                </label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="it">Italian</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Primary language for your menu. You can add translations later.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">About Menu Slugs</span>
                </div>
                <p className="mt-2 text-sm text-blue-700">
                  The slug is a unique identifier for your menu in the URL. It should be:
                </p>
                <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>Lowercase letters and numbers only</li>
                  <li>Use hyphens instead of spaces</li>
                  <li>Unique (cannot be used by another menu)</li>
                  <li>Example: "summer-menu-2024" or "ristorante-roma"</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim() || !formData.restaurantId.trim() || !slug.trim() || !!slugError}
                  className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Menu'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Debug Panel - Remove in production */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-gray-700">
              🔧 Debug Information (Click to expand)
            </summary>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <div><strong>Authentication Status:</strong> {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</div>
              <div><strong>API Base URL:</strong> {API_BASE_URL}</div>
              <div><strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</div>
              <div><strong>LocalStorage User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</div>
              <div><strong>Generated Slug:</strong> {slug}</div>
              <div><strong>Is Custom Slug:</strong> {isCustomSlug ? 'Yes' : 'No'}</div>
              <div><strong>Form Data:</strong> {JSON.stringify({...formData, slug})}</div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const token = localStorage.getItem('token');
                    const user = localStorage.getItem('user');
                    console.log('LocalStorage Token:', token);
                    console.log('LocalStorage User:', user);
                    console.log('Generated Request Body:', {...formData, slug});
                    alert(`Token: ${token ? 'Present' : 'Missing'}\nSlug: ${slug}`);
                  }}
                  className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Check Data
                </button>
              </div>
            </div>
          </details>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for creating a great menu</h3>
          <ul className="text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Choose a clear, descriptive name that reflects your restaurant's theme</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Start with English as the base language, you can add translations later</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>After creation, you'll be able to add categories, dishes, and customize the design</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Keep your slug short, memorable, and relevant to your menu</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateMenuPage;