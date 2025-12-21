// services/menuService.ts
// import api from './api';
import axios from '../utils/axios';
export interface MenuFilters {
  page?: number;
  limit?: number;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface Menu {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  statistics: {
    categories: number;
    dishes: number;
    views: number;
    qrScans: number;
  };
  restaurant: {
    id: number;
    name: string;
    address: string;
    phone: string;
  } | null;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalMenus: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface MenusResponse {
  success: boolean;
  message: string;
  data: {
    menus: Menu[];
    pagination: Pagination;
  };
  error?: string;
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data: Menu;
  error?: string;
}

export interface BaseResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const menuService = {
  // Get all menus for current user
  getAllMenus: async (params?: MenuFilters): Promise<MenusResponse> => {
    try {
      const response = await axios.get('/menu/all', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get all menus error:', error);
      return {
        success: false,
        message: 'Failed to fetch menus',
        error: error.response?.data?.error || error.message,
        data: {
          menus: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalMenus: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: params?.limit || 10
          }
        }
      };
    }
  },

  // Get single menu details
  getMenuById: async (menuId: string): Promise<MenuResponse> => {
    try {
      const response = await axios.get(`/api/menus/${menuId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get menu by ID error:', error);
      return {
        success: false,
        message: 'Failed to fetch menu',
        error: error.response?.data?.error || error.message,
        data: {} as Menu
      };
    }
  },

  // Update menu
  updateMenu: async (menuId: string, data: any): Promise<BaseResponse> => {
    try {
      const response = await axios.put(`/api/menus/${menuId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Update menu error:', error);
      return {
        success: false,
        message: 'Failed to update menu',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Delete menu (soft delete)
  deleteMenu: async (menuId: string): Promise<BaseResponse> => {
    try {
      const response = await axios.delete(`/api/menus/${menuId}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete menu error:', error);
      return {
        success: false,
        message: 'Failed to delete menu',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Create menu from Google
  createMenuFromGoogle: async (data: { placeId: string; theme?: string; background?: string }): Promise<BaseResponse> => {
    try {
      const response = await axios.post('/api/menus/create', data);
      return response.data;
    } catch (error: any) {
      console.error('Create menu from Google error:', error);
      return {
        success: false,
        message: 'Failed to create menu',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Search restaurant
  searchRestaurant: async (name: string): Promise<any> => {
    try {
      const response = await axios.post('/api/menus/search', { name });
      return response.data;
    } catch (error: any) {
      console.error('Search restaurant error:', error);
      return {
        success: false,
        message: 'Failed to search restaurant',
        error: error.response?.data?.error || error.message
      };
    }
  },

  // Fetch restaurant details
  fetchRestaurantDetails: async (placeId: string): Promise<any> => {
    try {
      const response = await axios.post('/api/menus/details', { placeId });
      return response.data;
    } catch (error: any) {
      console.error('Fetch restaurant details error:', error);
      return {
        success: false,
        message: 'Failed to fetch restaurant details',
        error: error.response?.data?.error || error.message
      };
    }
  }
};