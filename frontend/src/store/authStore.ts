// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  restaurantId?: string;
  lastLogin?: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

const API_URL = process.env.REACT_APP_API_URL;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
          });
          
          console.log('Login response:', response.data);
          
          if (response.data.success) {
            const { user, token } = response.data.data;
            
            // Set authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            // Store in localStorage for persistence
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            
            console.log('Login successful, user:', user.email);
          } else {
            throw new Error(response.data.error || 'Login failed');
          }
        } catch (error: any) {
          console.error('Login error details:', error);
          
          let errorMessage = 'Login failed. Please try again.';
          
          if (error.response) {
            // Server responded with error
            errorMessage = error.response.data?.error || 
                          error.response.data?.message || 
                          errorMessage;
          } else if (error.request) {
            // No response received
            errorMessage = 'Cannot connect to server. Please check your connection.';
          } else if (error.message) {
            // Other error
            errorMessage = error.message;
          }
          
          set({
            isLoading: false,
            isAuthenticated: false,
            error: errorMessage
          });
          
          // Re-throw the error so the component can handle it
          throw new Error(errorMessage);
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
        
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];
        
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        
        console.log('User logged out');
      },
      
      setUser: (user: User) => set({ user }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
      onRehydrateStorage: () => {
        // When rehydrating from storage, set axios header
        return (state) => {
          if (state?.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
          }
        };
      },
    }
  )
);