import { User } from "../models/user.model.js";
import {Project} from "../models/project.model.js";
import { AppError } from "../middleware/error.middleware.js";
import { catchAsync } from "../middleware/error.middleware.js";
import {Chat} from '../models/chat.model.js'

export const createGroup = async (projectId) => {
  try {
    if (!projectId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid project ID', 400);
    }

    const project = await Project.findById(projectId)
      .populate('createdBy', '_id')
      .populate('assignedMentor', '_id')
      .populate('teamMembers', '_id')
      .lean();

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({ project: projectId }).lean();
    if (existingChat) return existingChat;

    const participants = Array.from(
      new Set([
        project.createdBy?._id.toString(),
        project.assignedMentor?._id.toString(),
        ...project.teamMembers.map(member => member._id.toString()),
      ])
    );

    const groupChat = await Chat.create({
      name: `${project.title} - Group Chat`,
      participants,
      project: projectId,
      isGroupChat: true,
    });

    // Return populated chat
    const populatedGroupChat = await Chat.findById(groupChat._id)
      .populate("participants", "name email");

    return populatedGroupChat;

  } catch (error) {
    console.error("Error creating group chat:", error);
    throw error; // Rethrow for the caller to handle
  }
};
export const getUserChats = catchAsync(async (req, res, next) => {
  const { id: userId } = req.user;

  // Find all group chats where user is a participant
  const chats = await Chat.find({ participants: userId })
    .populate('project', 'title') // Include project title
    .populate({
      path: 'lastMessage',
      select: 'content createdAt sender',
      populate: { path: 'sender', select: 'name' }
    })
    .sort({ updatedAt: -1 });

  if (!chats.length) {
    return next(new AppError("No group chats found", 404));
  }

  res.status(200).json({
    success: true,
    results: chats.length,
    chats,
  });
});
