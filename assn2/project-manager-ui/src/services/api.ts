import axios from 'axios';
// Use the production URL from environment variables, or fallback to localhost
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5123/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;
