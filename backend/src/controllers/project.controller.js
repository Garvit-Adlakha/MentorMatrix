//todo:attach users to project

import { AppError } from "../middleware/error.middleware.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { sendEmail } from "../utils/sendEmail.js";
import { deleteMediaFromCloudinary,uploadMedia } from "../utils/cloudinary.js";
import { createGroup } from "./chat.controller.js";

export const createProject = catchAsync(async (req, res, next) => {
    const { title, description } = req.body;
    console.log("user id from create project",req.id)
    const userId = req.id;

    if (!title || !description) {
        return next(new AppError("Title and description are required", 400));
    }

    // // Check if user already has a project
    // const existingProject = await Project.findOne({
    //     $or: [
    //         { createdBy: userId },
    //         { teamMembers: { $in: [userId] } },
    //     ]
    // });

    // if (existingProject) {
    //     return next(new AppError("You are already part of a project", 400));
    // }

    // Create new project
    const newProject = await Project.create({
        title,
        description,
        createdBy: userId,
        teamMembers: [userId] // Add user as the first team member
    });

    // Populate project data before sending response
    const populatedProject = await Project.findById(newProject._id)
        .populate("createdBy assignedMentor teamMembers");

    res.status(201).json({
        success: true,
        message: "Project created successfully",
        project: populatedProject
    });
});

//todo: add more fields for matching users
export const addMemberToProject = catchAsync(async(req,res,next)=>{
  const {teamMembers}=req.body
    const userId=req.id
    const project=await Project.findOne({
        createdBy:userId
    })
    if(!project){
        return next(new AppError("Project not found",404))
    }
    const usersToAdd= await User.find(
    {    $or:[
            {roll_no:{$in:teamMembers}},
          { email:{$in:teamMembers}}
        ]}
    ).select("_id")

    const userIds= usersToAdd.map(user=>user._id)
    if (userIds.length !== teamMembers.length) {
        return next(new AppError("Some users were not found", 400));
    }

      // Add unique team members to the project
      project.teamMembers = [...new Set([...project.teamMembers, ...userIds])];
      await project.save();
  
      res.status(200).json({
          success: true,
          message: "Team members added successfully",
          project
      });

})

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
    await sendEmail({
        email: req.user.email,
        subject: "Mentor Request Sent",
        message: `Your mentor request for project '${project.title}' has been sent successfully.`,
    });

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
        project.assignedMentor = mentorId;
        project.status = "approved";
        project.mentorRequests = [];
        await project.save();

        if (emails.length) {
            await sendEmail({
                email: emails,
                subject: "Mentor Request Accepted",
                message: `Your mentor request for project '${project.title}' has been accepted. You will be contacted soon.`,
            });
        }

        // Create group chat and log if any issue
        try {
            const chatGroup = await createGroup(projectId);
            if (!chatGroup) {
                console.error("Group chat creation failed or returned undefined.");
                return next(new AppError("Failed to create group chat", 500));

            }

            return res.status(200).json({
                success: true,
                message: "Mentor assigned successfully and Group Created",
                chatGroup: chatGroup || {}
            });
        } catch (error) {
            console.error("Error creating group chat:", error);
            return next(new AppError("Group chat creation failed", 500));
        }

    } else if (decision === "reject") {
        project.mentorRequests = project.mentorRequests.filter(id => id.toString() !== mentorId);
        project.status = "rejected";
        await project.save();

        if (emails.length) {
            await sendEmail({
                email: emails,
                subject: "Mentor Request Rejected",
                message: `Your mentor request for project '${project.title}' has been rejected.`,
            });
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

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        {
            ...(title && { title }),
            ...(description && { description }),
            ...(documentToUpload && { documents: [...(project.documents || []), documentToUpload] }) // ✅ Fix: Ensure documents array exists
        },
        { new: true, runValidators: true }
    );

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
        filter = { assignedMentor: userId }; 
    }
    const projects = await Project.find(filter)
        .populate("createdBy assignedMentor teamMembers")
        .select("-documents -mentorRequests") 
        .lean(); //  Convert to plain objects for better performance

    if (!projects.length) return next(new AppError("No projects found", 404));

    res.status(200).json({
        success: true,
        message: "Projects fetched successfully",
        projects,
    });
});

//-------------------todo-------------------
//Improve File Management
//Allow users to remove specific files from a project

