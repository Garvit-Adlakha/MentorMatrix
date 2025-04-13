import axiosInstance from "../axios/axiosInstance";

const authService = {
  // Login user
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await axiosInstance.post('/user/signin', {
        email,
        password,
        rememberMe
      });
      // No need to store token in localStorage as it's in an HTTP-only cookie
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/user/signup', userData);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Get current user profile with error handling specifically for refresh scenarios
  currentUser: async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      return response.data;
    } catch (error) {
      // Don't throw errors on auth failures when checking current user
      // This helps prevent refresh loops
      if (error.response && error.response.status === 401) {
        console.log('User not authenticated');
        return null;
      }
      return Promise.reject(error);
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend to clear the cookie
      const response = await axiosInstance.post('/user/signout');
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, clear local state
      return {success: true, message: "Logged out locally"};
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/user/profile', userData);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    try {
      const response = await axiosInstance.post('/user/forgot-password', { email });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Reset password with token
  resetPassword: async (token, password) => {
    try {
      const response = await axiosInstance.post(`/user/reset-password/${token}`, {
        password
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

export default authService;