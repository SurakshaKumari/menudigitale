// utils/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Attach token automatically with better debugging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔐 Axios Request - Token from localStorage:', token);
    console.log('🔐 Request URL:', config.url);
    
    if (token) {
      // Clean the token (remove quotes if present)
      const cleanToken = token.replace(/['"]+/g, '');
      console.log('🔐 Clean Token:', cleanToken);
      
      config.headers.Authorization = `Bearer ${cleanToken}`;
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    
    console.log('🔐 Headers being sent:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with better debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Clearing auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;