import axiosInstance from "../axios/axiosInstance";

const ProjectService = {
    // Get projects based on user role
    getAllProjects: async (query = "", role = "student") => {
        try {
            // Use the appropriate endpoint based on user role
            const endpoint = role === "mentor" ? "/project/list-projects" : "/project/get-project";
            const encodedQuery = encodeURIComponent(query);
            
            // Add query parameters if it's the mentor endpoint
            const queryString = role === "mentor" && query ? `?search=${encodedQuery}` : "";
            const response = await axiosInstance.get(`${endpoint}${queryString}`);
            
            console.log("Projects fetched successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch projects. Please try again.",
                originalError: error
            };
        }
    },
    
    // Create a new project
    createProject: async (data) => {
        try {
            const response = await axiosInstance.post("/project/create-project", data);
            console.log("Project created successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error creating project:", error);
            throw {
                message: error.response?.data?.message || "Failed to create project. Please try again.",
                originalError: error
            };
        }
    },
    
    // Legacy method - keeping for backward compatibility
    getSelfProject: async () => {
        try {
            const response = await axiosInstance.get("/project/get-project");
            console.log("Self project fetched successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching self project:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch self project. Please try again.",
                originalError: error
            };
        }
    },
    
    // Request a mentor for a project
    requestMentor: async ({ mentorId, projectId }) => {
        try {
            if (!mentorId || !projectId) {
                throw new Error("Both mentor ID and project ID are required");
            }
            
            const response = await axiosInstance.post("/project/request-mentor", {
                mentorId,
                projectId
            });
            
            console.log("Mentor request sent successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error sending mentor request:", error);
            throw {
                message: error.response?.data?.message || "Failed to send mentor request. Please try again.",
                originalError: error
            };
        }
    }
}

export default ProjectService;