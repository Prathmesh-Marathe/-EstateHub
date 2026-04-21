import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// ─── Properties ───────────────────────────────────────────────────────────────
export const getProperties = (params) => API.get('/properties', { params });
export const getFeaturedProperties = () => API.get('/properties/featured');
export const getProperty = (id) => API.get(`/properties/${id}`);
export const getMyProperties = () => API.get('/properties/my-properties');
export const createProperty = (data) =>
  API.post('/properties', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProperty = (id, data) =>
  API.put(`/properties/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProperty = (id) => API.delete(`/properties/${id}`);

// ─── User ─────────────────────────────────────────────────────────────────────
export const toggleSavedProperty = (propertyId) => API.post(`/users/saved/${propertyId}`);
export const getSavedProperties = () => API.get('/users/saved');

// ─── Contact ──────────────────────────────────────────────────────────────────
export const sendContactMessage = (propertyId, data) => API.post(`/contact/${propertyId}`, data);
export const getMyMessages = () => API.get('/contact/my-messages');

// ─── Admin ────────────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id) => API.put(`/admin/users/${id}/status`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminProperties = (params) => API.get('/admin/properties', { params });
export const toggleFeatured = (id) => API.put(`/admin/properties/${id}/featured`);

export default API;

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const getOrCreateConversation = (propertyId) => API.post('/chat/conversation', { propertyId });
export const getMyConversations = () => API.get('/chat/conversations');
export const getConversationMessages = (id) => API.get(`/chat/conversations/${id}/messages`);
