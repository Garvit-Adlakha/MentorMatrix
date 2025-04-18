import axiosInstance from "../axios/axiosInstance";

const ProjectService = {
    // Get projects based on user role
    getAllProjects: async () => {
        try {
            // Use the appropriate endpoint based on user role
            const endpoint ="/project/get-project";
            const response = await axiosInstance.get(`${endpoint}`);
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
    
    // Get a single project by ID
    getProjectById: async (projectId) => {
        try {
            if (!projectId) {
                throw new Error("Project ID is required");
            }
            
            const response = await axiosInstance.get(`/project/get-project/${projectId}`);
            console.log("Project fetched successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching project:", error);
            throw {
                message: error.response?.data?.message || "Failed to fetch project details. Please try again.",
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
    },

    acceptProjectRequest:async(projectId)=>{
        try {
            if (!projectId) {
                throw new Error("Project ID is required");
            }
            
            const response = await axiosInstance.post(`/project/accept-project/${projectId}`);
            console.log("Project request accepted successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error accepting project request:", error);
            throw {
                message: error.response?.data?.message || "Failed to accept project request. Please try again.",
                originalError: error
            };
        }
    },
    mentorDecision:async({projectId , decision})=>{
        try {
            if (!projectId) {
                throw new Error("Project ID is required");
            }
            const response = await axiosInstance.post(`/project/assign-mentor/${projectId}`,{
                decision
            });
            console.log("Mentor decision made successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error making mentor decision:", error);
            throw {
                message: error.response?.data?.message || "Failed to make mentor decision. Please try again.",
                originalError: error
            };
        }
    },
    // Get a summary of the project description
    getSummary: async (projectId) => {
        try {
            const response = await axiosInstance.get(`/project/${projectId}/summary`)
            console.log("Project summary fetched successfully:", response.data);
            return response.data.summary.summary;
        } catch (error) {
            console.error("Error getting project summary:", error);
            throw error;
        }
    },

    // Upload a document to a project
    uploadProjectDocument: async (projectId, formData) => {
        try {
            const response = await axiosInstance.post(`/project/${projectId}/document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log("Document uploaded successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error uploading document:", error);
            throw {
                message: error.response?.data?.message || "Failed to upload document. Please try again.",
                originalError: error
            };
        }
    },

    // Delete a document from a project
    deleteProjectDocument: async (projectId, documentId) => {
        try {
            const response = await axiosInstance.delete(`/project/${projectId}/document/${documentId}`);
            console.log("Document deleted successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error deleting document:", error);
            throw {
                message: error.response?.data?.message || "Failed to delete document. Please try again.",
                originalError: error
            };
        }
    },

    // Add team members to a project
    addTeamMembers: async (projectId, memberEmails) => {
        try {
            const response = await axiosInstance.post('/project/add-members', {
                projectId,
                teamMembers: memberEmails
            });
            console.log("Team members added successfully:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error adding team members:", error);
            throw {
                message: error.response?.data?.message || "Failed to add team members. Please try again.",
                originalError: error
            };
        }
    }
};

export default ProjectService;