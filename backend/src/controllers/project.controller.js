import { AppError } from "../middleware/error.middleware.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import { deleteMediaFromCloudinary,uploadMedia } from "../utils/cloudinary.js";
import { createGroup } from "./chat.controller.js";
import mongoose from "mongoose";
import { getSummary } from "../utils/summarizer.js";
import { Chat } from "../models/chat.model.js";

export const createProject = catchAsync(async (req, res, next) => {
    const { title, description, teamMembers, targetFaculty } = req.body;
    const userId = req.id;

    // Validate required fields based on the schema structure
    if (!title || !description || !description.abstract || !description.problemStatement || !description.proposedMethodology) {
        return next(new AppError("Title and complete description with abstract, problem statement, and methodology are required", 400));
    }

    // Add tech stack if provided or default to empty array
    if (!description.techStack) {
        description.techStack = [];
    }

    let teamMembersIds = [];
    
    // Only process team members if provided
    if (teamMembers && teamMembers.length > 0) {
        const foundUsers = await User.find({
            $or: [
                { roll_no: { $in: teamMembers } },
                { email: { $in: teamMembers } }
            ]
        }).select("_id email");
        
        teamMembersIds = foundUsers.map(user => user._id);
    }
    
    // Create new project with properly structured details
    const newProject = await Project.create({
        title,
        description,
        createdBy: userId,
        teamMembers: [userId, ...teamMembersIds] // Add user as the first team member, followed by any found team members
    });
    
    // Generate project summary
    try {
        const summary = await getSummary(newProject);
        if (summary) {
            newProject.summary = summary;
            await newProject.save();
        }
    } catch (error) {
        console.error("Error generating project summary:", error);
        // Continue even if summary generation fails
    }

    // Handle mentor request if targetFaculty is provided
    let mentorRequestResult = null;
    if (targetFaculty) {
        try {
            const potentialMentor = await User.findOne({
                name: { $regex: targetFaculty, $options: 'i' },
                role: "mentor"
            });
            
            if (potentialMentor) {
                // Add mentor request to the project
                newProject.mentorRequests.push(potentialMentor._id);
                await newProject.save();
                
                // Send email to the mentor
                await sendEmail({
                    email: potentialMentor.email,
                    subject: "Mentor Request",
                    message: `You have a new mentor request for project '${newProject.title}'.`,
                });
                
                mentorRequestResult = {
                    success: true,
                    mentorName: potentialMentor.name
                };
            }
        } catch (mentorError) {
            console.error("Error handling mentor request:", mentorError);
            mentorRequestResult = {
                success: false,
                error: "Failed to process mentor request"
            };
            // Continue even if mentor request fails
        }
    }

    // Populate project data before sending response
    const populatedProject = await Project.findById(newProject._id)
        .populate("createdBy assignedMentor teamMembers");

    res.status(201).json({
        success: true,
        message: "Project created successfully",
        project: populatedProject,
         mentorRequest: mentorRequestResult
    });
});

export const addMemberToProject = catchAsync(async(req, res, next) => {
    const { teamMembers, projectId } = req.body;
    const userId = req.id;
    
    if (!teamMembers || !Array.isArray(teamMembers) || teamMembers.length === 0) {
        return next(new AppError("Please provide valid team members", 400));
    }
    
    if (!projectId) {
        return next(new AppError("Project ID is required", 400));
    }

    // Find the project and verify the user is authorized to add members
    const project = await Project.findById(projectId);
    if (!project) {
        return next(new AppError("Project not found", 404));
    }
    
    // Verify the user is the project creator
    if (!project.createdBy.equals(userId)) {
        return next(new AppError("Only project creator can add team members", 403));
    }

    // Find all users that match the provided roll numbers or emails
    const usersToAdd = await User.find({
        $or: [
            { roll_no: { $in: teamMembers } },
            { email: { $in: teamMembers } }
        ]
    }).select("_id email");

    if (usersToAdd.length === 0) {
        return next(new AppError("No valid users found", 404));
    }
    
    // Get IDs of users to add
    const userIds = usersToAdd.map(user => user._id);
    
    // Add unique team members to the project (avoid duplicates)
    const existingMembers = project.teamMembers.map(id => id.toString());
    const newMembers = userIds.filter(id => !existingMembers.includes(id.toString()));
    
    if (newMembers.length === 0) {
        return next(new AppError("All provided users are already team members", 400));
    }
    
    // Add the new members to the project
    project.teamMembers = [...project.teamMembers, ...newMembers];
    await project.save();
    
    // Update the chat group if it exists
    try {
        const chatGroup = await Chat.findOne({ project: project._id });
        if (chatGroup) {
            // Only add participants who aren't already in the chat
            const existingParticipants = chatGroup.participants.map(id => id.toString());
            const newParticipants = newMembers.filter(id => !existingParticipants.includes(id.toString()));
            
            if (newParticipants.length > 0) {
                chatGroup.participants = [...chatGroup.participants, ...newParticipants];
                await chatGroup.save();
            }
        }
    } catch (error) {
        console.error("Error updating chat group:", error);
        // Don't fail the member addition if chat update fails
    }

    // Populate the project to return complete data
    const updatedProject = await Project.findById(project._id)
        .populate("createdBy teamMembers assignedMentor");
        
    // Notify the added members via email if needed
    try {
        const addedUsers = usersToAdd.filter(user => 
            newMembers.some(id => id.equals(user._id)));
            
        const emails = addedUsers.map(user => user.email).filter(Boolean);
        
        if (emails.length > 0) {
            // Send email notification (assuming sendEmail utility exists)
            await sendEmail({
                email: emails,
                subject: `You've been added to project: ${project.title}`,
                message: `You have been added as a team member to the project "${project.title}".`
            });
        }
    } catch (emailError) {
        console.error("Error sending notification emails:", emailError);
        // Continue even if email notifications fail
    }
    
    res.status(200).json({
        success: true,
        message: `${newMembers.length} team members added successfully`,
        project: updatedProject
    });
});

export const requestMentor = catchAsync(async (req, res, next) => {
    // Only team leader can request mentor
    const { mentorName, email,mentorId,projectId} = req.body;
    const userId = req.id;
    if (!userId) {
        return next(new AppError("User not found", 404));
    }

    const project = await Project.findById(projectId);
    if (!project) {
        return next(new AppError("You don't lead any project", 403));
    }

    if(project.mentorRequests.length>0){
        return next(new AppError("You have already requested a mentor", 403));
    }

    const mentor = await User.findOne({
        $or: [
            { name: mentorName, email },
            { _id: mentorId }
        ]
    }) 
    if (!mentor) {
        return next(new AppError("Mentor not found", 404));
    }

    // Check if mentor is already assigned
    if (project.assignedMentor) {
        return next(new AppError("This project already has a mentor", 400));
    }

    // Check if request already sent
    if (project.mentorRequests.includes(mentor._id)) {
        return next(new AppError("Mentor request already sent", 400));
    }

    // Add mentor request
    project.mentorRequests.push(mentor._id);
    await project.save();

    await sendEmail({
        email: mentor.email,
        subject: "Mentor Request",
        message: `You have a new mentor request for project '${project.title}'.`,
    })
    
    // Get the user's email for confirmation
    const user = await User.findById(userId).select("email");
    if (user && user.email) {
        await sendEmail({
            email: user.email,
            subject: "Mentor Request Sent",
            message: `Your mentor request for project '${project.title}' has been sent successfully.`,
        });
    }

    res.status(200).json({
        success: true,
        message: "Mentor request sent successfully",
    });
});

export const mentorDecision = catchAsync(async (req, res, next) => {
    const { projectId } = req.params;
    const { decision } = req.body;
    const mentorId = req.id;

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== "mentor") {
        return next(new AppError("Only mentors can accept/reject projects", 403));
    }

    const project = await Project.findById(projectId);
    if (!project) return next(new AppError("Project not found", 404));

    if (!project.mentorRequests.includes(mentorId)) {
        return next(new AppError("You are not requested as a mentor for this project", 403));
    }

    const usersEmails = await User.find({ _id: { $in: project.teamMembers } }).select("email");
    const emails = usersEmails.map(user => user.email).filter(email => email);

    if (decision === "accept") {
        // Update project first
        project.assignedMentor = mentorId;
        project.status = "approved";
        // Clear all mentor requests when accepting
        project.mentorRequests = [];
        await project.save();

        // Send emails to team members
        if (emails.length) {
            try {
                await sendEmail({
                    email: emails,
                    subject: "Mentor Request Accepted",
                    message: `Your mentor request for project '${project.title}' has been accepted. You will be contacted soon.`,
                });
            } catch (emailError) {
                console.error("Error sending emails:", emailError);
                // Continue with the process even if emails fail
            }
        }

        // Try to create group chat but don't stop the process if it fails
        let chatGroup = null;
        try {
            chatGroup = await createGroup(projectId);
        } catch (chatError) {
            console.error("Error creating group chat:", chatError);
            // Don't block the mentor assignment if chat creation fails
        }

        return res.status(200).json({
            success: true,
            message: chatGroup ? "Mentor assigned successfully and Group Created" : "Mentor assigned successfully, but group chat creation failed",
            chatGroup: chatGroup || {}
        });

    } else if (decision === "reject") {
        project.mentorRequests = project.mentorRequests.filter(id => id.toString() !== mentorId);
        project.status = "rejected";
        await project.save();

        if (emails.length) {
            try {
                await sendEmail({
                    email: emails,
                    subject: "Mentor Request Rejected",
                    message: `Your mentor request for project '${project.title}' has been rejected.`,
                });
            } catch (emailError) {
                console.error("Error sending rejection emails:", emailError);
                // Continue with the process even if emails fail
            }
        }

        return res.status(200).json({
            success: true,
            message: "Mentor request rejected",
        });
    } else {
        return next(new AppError("Invalid decision value. Use 'accept' or 'reject'", 400));
    }
});

export const updateProject = catchAsync(async (req, res, next) => {
    const { projectId } = req.params; 
    const { title, description } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
        return next(new AppError("Project not found", 404));
    }

    let documentToUpload = null;
    if (req.file) {
        try {
            const result = await uploadMedia(req.file.path);
            documentToUpload = {
                name: req.file.originalname,
                url: result?.secure_url || req.file.path,
                format: req.file.mimetype,
                uploadedAt: new Date(),
            };
        } catch (error) {
            return next(new AppError("File upload failed", 500));
        }
    }

    const updateFields = {
        ...(title && { title }),
        ...(description && { description }),
        ...(documentToUpload && { documents: [...(project.documents || []), documentToUpload] })
    };

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updateFields,
        { new: true, runValidators: true }
    );

    // Generate updated project summary
    try {
        const summary = await getSummary(updatedProject);
        if (summary) {
            updatedProject.summary = summary;
            await updatedProject.save();
        }
    } catch (error) {
        console.error("Error generating updated project summary:", error);
        // Continue even if summary generation fails
    }

    res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project: updatedProject,
    });
});

export const deleteProject = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
        return next(new AppError("Project not found", 404));
    }

    if(!project.createdBy.equals(userId)){
        return next(new AppError("You are not authorized to delete this project only team leader can", 403));
    }


    // Delete associated documents from Cloudinary
    try {
        if (project.documents && project.documents.length > 0) {
            await deleteMediaFromCloudinary(project.documents.map(doc => doc.url));
        }
    } catch (error) {
        return next(new AppError("Error deleting project files from Cloudinary", 500));
    }

    // Delete project from DB
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
        success: true,
        message: "Project deleted successfully",
    });
});

//for mentors only
export const listProjects = catchAsync(async (req, res, next) => {
    const userId = req.id;
    let { page = 1, limit = 10, status, mentor, search } = req.query;

    // Convert and validate query params
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    // **Role Check: Restrict Access Before Querying**
    const user = await User.findById(userId).select("role");
    if (!user) return next(new AppError("User not found", 404));
    if (user.role === "student") return next(new AppError("Access denied: Students cannot list all projects", 403));

    // Build Filter
    const filter = {};
    if (status) filter.status = status;
    if (mentor && mongoose.Types.ObjectId.isValid(mentor)) filter.assignedMentor = mentor; 
    if (search) filter.title = { $regex: search, $options: "i" }; 

    // **Fetch Projects**
    const [projects, totalProjects] = await Promise.all([
        Project.find(filter)
            .populate("createdBy assignedMentor teamMembers")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Project.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        message: "All projects fetched successfully",
        totalPages: Math.ceil(totalProjects / limit),
        currentPage: page,
        totalProjects,
        projects,
    });
});

//for students
export const getProject = catchAsync(async (req, res, next) => {
    const userId = req.id;

    const user = await User.findById(userId).select("role");
    if (!user) return next(new AppError("User not found", 404));
    let filter = {};

    if (user.role === "student") {
        filter = { $or: [{ createdBy: userId }, { teamMembers: userId }] };
    } else if (user.role === "mentor") {
        filter ={ $or:[{ assignedMentor: userId },{mentorRequests: userId}]}; 
    }
    const projects = await Project.find(filter)
        .populate("createdBy assignedMentor teamMembers mentorRequests")
        .select("-documents") 
        .lean(); //  Convert to plain objects for better performance

    if (!projects.length) return next(new AppError("No projects found", 404));

    res.status(200).json({
        success: true,
        message: "Projects fetched successfully",
        projects,
    });
});

export const getProjectById=catchAsync(async(req,res,next)=>{
    const {projectId}=req.params
    const userId=req.id
    const user=await User.findById(userId).select("role")
    if(!user) return next(new AppError("User not found",404))
    
    const project=await Project.findById(projectId).populate("createdBy assignedMentor teamMembers")

    return res.status(201)
    .json({
        success:true,
        message:"Project fetched successfully",
        project
    })
})

export const getProjectSummary=catchAsync(async(req,res,next)=>{
    const {projectId}=req.params
    const summary=await Project.findById(projectId).select("summary")
    if(!summary) return next(new AppError("Project not found",404))
    return res.status(200)
    .json({
        success:true,
        message:"Project summary fetched successfully",
        summary
    })
})
//-------------------todo-------------------
//Improve File Management
//Allow users to remove specific files from a project

