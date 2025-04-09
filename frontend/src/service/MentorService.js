import axiosInstance from "../axios/axiosInstance";

const mentorService={
    getAllMentors:async(query="")=>{
        try {
            const encodedQuery = encodeURIComponent(query);
            const response = await axiosInstance.get(`user/mentor?search=${encodedQuery}`);
            console.log("Mentors fetched successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching mentors:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch mentors. Please try again.",
                originalError: error
            };
        }
    },
    
}

export default mentorService;