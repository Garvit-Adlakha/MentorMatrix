import axiosInstance from "../axios/axiosInstance";

const MeetingService = {
    // Create a new meeting
    createMeeting: async (meetingData) => {
        try {
            const response = await axiosInstance.post(`/meeting/create/${meetingData.projectId}`, meetingData);
            console.log("Meeting created successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error creating meeting:", error);
            throw {
                message: error.response?.data?.message || "Failed to create meeting. Please try again.",
                originalError: error
            };
        }
    },

    // Get all meetings for the current user
    getUserMeetings: async (status = '') => {
        try {
            let url = '/meeting/';
            if (status) {
                url += `?status=${status}`;
            }
            const response = await axiosInstance.get(url);
            console.log("User meetings fetched successfully:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching user meetings:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch meetings. Please try again.",
                originalError: error
            };
        }
    },

    // Get meetings for a specific project
    getProjectMeetings: async (meetingId) => {
        try {
            const response = await axiosInstance.get(`/meeting/${meetingId}`);
            console.log("Project meetings fetched successfully:", response.data);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching project meetings:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch project meetings. Please try again.",
                originalError: error
            };
        }
    },

    // Update meeting status (accept/reject/cancel)
    updateMeetingStatus: async (meetingId, status) => {
        try {
            const response = await axiosInstance.patch(`/meeting/${meetingId}/status`, { status });
            console.log("Meeting status updated successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating meeting status:", error);
            throw {
                message: error.response?.data?.message || "Failed to update meeting status. Please try again.",
                originalError: error
            };
        }
    },

    // Delete a meeting
    deleteMeeting: async (meetingId) => {
        try {
            const response = await axiosInstance.delete(`/meeting/${meetingId}`);
            console.log("Meeting deleted successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error deleting meeting:", error);
            throw {
                message: error.response?.data?.message || "Failed to delete meeting. Please try again.",
                originalError: error
            };
        }
    },

    // Join a meeting
    joinMeeting: async (meetingId) => {
        try {
            const response = await axiosInstance.get(`/meeting/${meetingId}/join`);
            console.log("Meeting join info fetched successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error joining meeting:", error);
            throw {
                message: error.response?.data?.message || "Failed to join meeting. Please try again.",
                originalError: error
            };
        }
    }
};

export default MeetingService;