// src/api/index.js — Axios instance + all API helpers
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('msms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('msms_token');
      localStorage.removeItem('msms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  login: (data)  => api.post('/auth/login', data),
  me:    ()      => api.get('/auth/me'),
};

// ── Generic CRUD factory ─────────────────────────────────
const crud = (path) => ({
  getAll:  (params) => api.get(path, { params }),
  getById: (id)     => api.get(`${path}/${id}`),
  create:  (data)   => api.post(path, data),
  update:  (id, d)  => api.put(`${path}/${id}`, d),
  remove:  (id)     => api.delete(`${path}/${id}`),
});

export const categoriesAPI    = crud('/categories');
export const manufacturersAPI = crud('/manufacturers');
export const suppliersAPI     = crud('/suppliers');
export const medicinesAPI     = crud('/medicines');
export const stockAPI = {
  ...crud('/stock'),
  restock: (data) => api.post('/stock/restock', data),
};
export const doctorsAPI       = crud('/doctors');
export const customersAPI     = {
  ...crud('/customers'),
  searchByPhone: (phone) => api.get('/customers/search/phone', { params: { phone } }),
};
export const employeesAPI     = crud('/employees');
export const prescriptionsAPI = crud('/prescriptions');
export const paymentsAPI      = crud('/payments');

// ── Orders ───────────────────────────────────────────────
export const ordersAPI = {
  ...crud('/orders'),
  getBill:    (id)   => api.get(`/orders/${id}/bill`),
  complete:   (id, d)=> api.post(`/orders/${id}/complete`, d),
  cancel:     (id)   => api.put(`/orders/${id}/cancel`),
};

// ── Reports ──────────────────────────────────────────────
export const reportsAPI = {
  dashboardStats:       ()       => api.get('/reports/dashboard-stats'),
  lowStock:             ()       => api.get('/reports/low-stock'),
  expiringSoon:         ()       => api.get('/reports/expiring-soon'),
  salesSummary:         (params) => api.get('/reports/sales-summary', { params }),
  topMedicines:         ()       => api.get('/reports/top-medicines'),
  employeePerformance:  ()       => api.get('/reports/employee-performance'),
};

export default api;
