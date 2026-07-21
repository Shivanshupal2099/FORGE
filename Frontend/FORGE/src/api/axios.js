import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add authentication token
axiosInstance.interceptors.request.use(
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

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - token might be expired
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Error in request setup
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
