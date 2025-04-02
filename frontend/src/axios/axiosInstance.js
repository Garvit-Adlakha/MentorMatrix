import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1', // Add backend API URL
  timeout: 5000,
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Basic error handling
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        console.error('Unauthorized - redirecting to login');
        // You might want to redirect to login
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Forbidden access');
      } else if (status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Error setting up request', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;