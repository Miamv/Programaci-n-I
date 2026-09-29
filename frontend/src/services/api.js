import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getProjects() {
  return api.get('/projects/');
}

export function getProject(id) {
  return api.get(`/projects/${id}/`);
}

export function getMedia(projectId) {
  return api.get('/media/', { params: { project: projectId } });
}

export function getProfiles() {
  return api.get('/profiles/');
}

export function getBrands() {
  return api.get('/brands/');
}

export function sendContact(data) {
  return api.post('/contacts/', data);
}

export function login(credentials) {
  return api.post('/auth/login/', credentials);
}

export function register(data) {
  return api.post('/auth/register/', data);
}

export default api;
