import axios from 'axios';
const API_URL = 'http://localhost:5123/api';

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

// Add error interceptor for better feedback
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Try to extract a meaningful error message from the API response
    const message =
      error.response?.data?.message ||
      error.response?.data?.title || // For .NET validation errors
      error.message ||
      'An unknown error occurred';
    
    // You could also log the user out on 401 Unauthorized
    // if (error.response?.status === 401) {
    //   authService.logout();
    //   window.location.href = '/login';
    // }
    
    // Reject with a standardized error message
    return Promise.reject(new Error(message));
  }
);

export default api;
