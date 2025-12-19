// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define user interface
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  restaurantId?: number | null;
  // Add other user properties as needed
}
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define auth state interface
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuthData: (user: User, token: string) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Initialize auth from localStorage on app start
      initializeAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              isAuthenticated: true,
              user,
              token,
            });
            console.log('Auth initialized from localStorage');
          } catch (error) {
            console.error('Failed to parse user data from localStorage:', error);
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },

      // store/authStore.ts - Updated login function
login: async (email: string, password: string) => {
  set({ isLoading: true, error: null });
  
  try {
    console.log('Attempting login for:', email);
    
    // Real API call
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      console.log('Login successful:', data);
      
      const user = data.data.user;
      const token = data.data.token;
      
      // IMPORTANT: Store token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Then update state
      set({
        isAuthenticated: true,
        user: user,
        token: token,
        isLoading: false,
      });
      
      console.log('Auth state updated and stored in localStorage');
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: error.message || 'Login failed. Please try again.',
    });
    
    throw error;
  }
},

      // Logout function
      logout: () => {
        console.log('Logging out...');
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        console.log('User logged out and storage cleared');
      },

      // Set auth data manually (useful for testing or after registration)
      setAuthData: (user: User, token: string) => {
        console.log('Setting auth data manually:', { user, token });
        set({
          isAuthenticated: true,
          user,
          token,
        });
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },

      // Clear error messages
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage', // key for localStorage
      // Only persist these properties
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Helper function to get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const { token } = useAuthStore.getState();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Helper function to check if user has specific role
export const hasRole = (role: string): boolean => {
  const { user } = useAuthStore.getState();
  return user?.role === role;
};

// Helper function to get current user ID
export const getCurrentUserId = (): number | null => {
  const { user } = useAuthStore.getState();
  return user?.id || null;
};

// Helper function to get current restaurant ID
export const getCurrentRestaurantId = (): number | null => {
  const { user } = useAuthStore.getState();
  return user?.restaurantId || null;
};

// Initialize auth on import (optional)
// You can call this in your main.tsx or App.tsx
export const initializeAuth = () => {
  useAuthStore.getState().initializeAuth();
};