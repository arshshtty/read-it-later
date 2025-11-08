import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Link, Category, AuthResponse } from '../types';

// Update this to your backend URL
const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post<AuthResponse>('/auth/register', { email, password, name }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  getCurrentUser: () =>
    api.get<{ user: User }>('/auth/me'),
};

// Links API
export const linksApi = {
  getLinks: (params?: { categoryId?: string; isRead?: boolean; search?: string }) =>
    api.get<Link[]>('/links', { params }),

  getLink: (id: string) =>
    api.get<Link>(`/links/${id}`),

  createLink: (url: string, categoryId?: string) =>
    api.post<Link>('/links', { url, categoryId }),

  updateLink: (id: string, data: { isRead?: boolean; categoryId?: string | null }) =>
    api.patch<Link>(`/links/${id}`, data),

  deleteLink: (id: string) =>
    api.delete(`/links/${id}`),
};

// Categories API
export const categoriesApi = {
  getCategories: () =>
    api.get<Category[]>('/categories'),

  createCategory: (name: string, color?: string) =>
    api.post<Category>('/categories', { name, color }),

  updateCategory: (id: string, data: { name?: string; color?: string }) =>
    api.patch<Category>(`/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/categories/${id}`),
};

export default api;
