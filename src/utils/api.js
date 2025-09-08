import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Candidates API
export const candidatesAPI = {
  getAll: () => api.get('/candidates'),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  getStats: () => api.get('/candidates/stats/overview'),
};

// Applications API
export const applicationsAPI = {
  getAll: () => api.get('/applications'),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications', data),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  getStats: () => api.get('/applications/stats/overview'),
};

// Documents API
export const documentsAPI = {
  getAll: () => api.get('/documents'),
  getByApplication: (applicationId) => api.get(`/documents/application/${applicationId}`),
  getByCandidate: (candidateId) => api.get(`/documents/candidate/${candidateId}`),
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Generation API
export const generationAPI = {
  authorization: (candidateId, type) => api.post(`/generation/authorization/${candidateId}`, { type }),
  invitation: (rapporteurId, data) => api.post(`/generation/invitation/${rapporteurId}`, data),
  pv: (meetingId, data) => api.post(`/generation/pv/${meetingId}`, data),
  diploma: (candidateId, data) => api.post(`/generation/diploma/${candidateId}`, data),
  summary: (candidateId) => api.post(`/generation/summary/${candidateId}`),
  batch: (data) => api.post('/generation/batch', data),
};

export default api;
