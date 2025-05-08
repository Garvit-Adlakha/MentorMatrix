import axiosInstance from '../axios/axiosInstance';

export const adminService = {
    getDashboardStats: async () => {
        const response = await axiosInstance.get('/admin/dashboard');
        return response.data;
    },

    getAllUsers: async (params) => {
        const response = await axiosInstance.get('/admin/users', { params });
        return response.data;
    },

    updateUserStatus: async (userId, status) => {
        const response = await axiosInstance.patch(`/admin/users/${userId}/status`, { status });
        return response.data;
    },

    getMentorRequests: async (params) => {
        const response = await axiosInstance.get('/admin/mentor-requests', { params });
        return response.data;
    }
}; 