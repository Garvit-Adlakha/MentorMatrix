import { User } from "../models/user.model.js";
import {Project} from "../models/project.model.js";
import { AppError } from "../middleware/error.middleware.js";
import { catchAsync } from "../middleware/error.middleware.js";
import {Chat} from '../models/chat.model.js'

export const createGroup = async (projectId) => {
  try {
    if (!mongoose.isValidObjectId(projectId)) {
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
      project: projectId,
      participants,
      isGroupChat: true,
    });

    const io=req.io
    // Broadcast to all participants that they have joined the chat
    io.to(participants).emit('joinedChat', {
      chatId: groupChat._id,
      chatName: groupChat.name,
      projectId: projectId,
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
  const { userId } = req.user; // Assuming user ID from auth middleware

  const chats = await Chat.aggregate([
    // 1️⃣ Match chats where the user is a participant
    { $match: { participants: new mongoose.Types.ObjectId(userId) } },

    // 2️⃣ Lookup latest message for each chat
    {
      $lookup: {
        from: 'messages',
        let: { chatId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 }
        ],
        as: 'lastMessage'
      }
    },

    // 3️⃣ Unwind to make lastMessage a single object
    { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

    // 4️⃣ Lookup sender details
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'lastMessage.sender'
      }
    },
    { $unwind: { path: '$lastMessage.sender', preserveNullAndEmptyArrays: true } },

    // 5️⃣ Project only required fields
    {
      $project: {
        name: 1,
        participants: 1,
        project: 1,
        createdAt: 1,
        lastMessage: {
          content: '$lastMessage.content',
          createdAt: '$lastMessage.createdAt',
          sender: {
            name: '$lastMessage.sender.name',
            email: '$lastMessage.sender.email'
          }
        }
      }
    },

    // 6️⃣ Sort chats by latest message or creation time
    { $sort: { 'lastMessage.createdAt': -1, createdAt: -1 } }
  ]);

  res.status(200).json({
    success: true,
    results: chats.length,
    chats
  });
});

