import axiosInstance from "../axios/axiosInstance";

const mentorService={
    getAllMentors:async(query="")=>{
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await axiosInstance.get(`user/mentor?search=${encodedQuery}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching mentors:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch mentors. Please try again.",
                originalError: error
            };
        }
    },
    
    getMentorByName:async(searchQuery)=>{
        try {
            const encodedQuery = encodeURIComponent(searchQuery);
            const response = await axiosInstance.get(`user/mentor?search=${encodedQuery}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching mentors:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch mentors. Please try again.",
                originalError: error
            };
        }
    },

    searchMentors:async(query)=>{
        try {
            if (!query.trim()) return [];
            
            const encodedQuery = encodeURIComponent(query);
            const response = await axiosInstance.get(`user/mentor?search=${encodedQuery}`);
            return response.data.mentors || [];
        } catch (error) {
            console.error("Error searching mentors:", error);
            return [];
        }
    }
}

export default mentorService;