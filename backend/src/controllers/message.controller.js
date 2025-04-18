import { catchAsync } from "../middleware/error.middleware.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { AppError } from "../middleware/error.middleware.js";

export const sendMessage = catchAsync(async (req, res, next) => {
    const { chatId, content } = req.body; 
    const senderId  = req.id;
    const sender = await User.findById(senderId);
    const chat = await Project.findById(chatId);

    if (!sender || !chat) {
        return next(new AppError("Sender or chat not found", 404));
    }

 const message=await Message.create({
    chat: chatId,
    sender: senderId,
    content
 })

 const io=req.io

 io.to(chatId).emit("receiveMessage", {
    _id: message._id,
    chatId,
    sender: {
      _id: sender._id,
      name: sender.name,
    },
    content: message.content,
    createdAt: message.createdAt,
  });

    res.status(201).json({
        success: true,
        message });
});
// controllers/messageController.js
export const getMessages = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
  
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name email') 
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
  
    if (!messages.length) {
      return next(new AppError("No messages found for this chat", 404));
    }
  
    const totalMessages = await Message.countDocuments({ chat: chatId });
  
    res.status(200).json({
      success: true,
      results: messages.length,
      totalMessages,
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      messages,
    });
  });

  export const getUnreadMessages = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    const { id: userId } = req.user;
  
    const unreadMessages = await Message.find({
      chat: chatId,
      status: 'sent',
      sender: { $ne: userId },
    }).select("_id status createdAt sender");
  
    if (!unreadMessages.length) {
      return next(new AppError("No unread messages found for this chat", 404));
    }
  
    res.status(200).json({
      success: true,
      results: unreadMessages.length,
      unreadMessages, 
    })
  })

  export const markMessagesAsRead = catchAsync(async (req, res, next) => {
    const { chatId } = req.params;
    const { id: userId } = req.user;
  
    // Update message status
    const result = await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        status: "sent",
      },
      {
        $set: { status: "read" },
      }
    );
  
    if (result.modifiedCount === 0) {
      return next(new AppError("No messages to mark as read", 404));
    }
  
    // Emit event via WebSocket
    const io = req.io;
    io.to(chatId).emit("messagesRead", {
      chatId,
      userId,
    });
  
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} messages marked as read`,
    });
  });