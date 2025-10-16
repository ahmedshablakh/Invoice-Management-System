import axios from 'axios';
import {
  Customer,
  Invoice,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
  InvoiceFilters,
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Customer API
export const customerAPI = {
  getAll: async (search?: string): Promise<Customer[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: CreateCustomerDTO): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCustomerDTO): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

// Invoice API
export const invoiceAPI = {
  getAll: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const response = await api.get('/invoices', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  create: async (data: CreateInvoiceDTO): Promise<Invoice> => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  update: async (id: string, data: UpdateInvoiceDTO): Promise<Invoice> => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`);
  },

  exportPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    return await api.post('/auth/login', { email, password });
  },

  register: async (email: string, password: string, name: string) => {
    return await api.post('/auth/register', { email, password, name });
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },
};

export default api;
