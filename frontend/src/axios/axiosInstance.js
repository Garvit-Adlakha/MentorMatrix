import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // This ensures cookies are sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (removed token handling as we use HTTP-only cookies)
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Define public routes that shouldn't redirect on auth errors
const publicRoutes = ['/', '/mentor', '/login', '/signup'];

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('Authentication expired or invalid');
          
          // Only redirect if we're not already on the login page AND we're not on a public route
          const currentPath = window.location.pathname;
          const isPublicRoute = publicRoutes.includes(currentPath);
          
          if (!isPublicRoute && !currentPath.includes('login')) {
            // Use history.push instead of direct location change for better handling
            // This prevents the crash on refresh
            console.log('Redirecting to login page due to auth error');
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }
          break;
          
        case 403:
          console.error('Forbidden access: You do not have permission for this action');
          break;
          
        case 404:
          console.error('Resource not found');
          break;
          
        case 422:
          console.error('Validation error', data.errors);
          break;
          
        case 429:
          console.error('Too many requests. Please try again later');
          break;
          
        case 500:
        case 502:
        case 503:
          console.error('Server error. Our team has been notified');
          break;
          
        default:
          console.error(`Unexpected error: ${status}`);
      }
    } else if (error.request) {
      console.error('Network error. Please check your connection');
    } else {
      console.error('Error setting up request', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;