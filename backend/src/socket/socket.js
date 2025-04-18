// socket.js - WebSocket server with room management, rate limiting, and error handling
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";

const onlineUsers = new Map();
const userRooms = new Map(); // Store user-to-room mapping
const messageRateLimits = new Map(); // Store rate limits per user

// Create a global io variable to be exported and used in other modules
let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e7, // 10MB WebSocket Compression
  });

  // 1. Room Management Optimization
  const addUserToRoom = (userId, chatId) => {
    if (!userRooms.has(userId)) {
      userRooms.set(userId, new Set());
    }
    userRooms.get(userId).add(chatId);
  };

  const removeUserFromRoom = (userId, chatId) => {
    userRooms.get(userId)?.delete(chatId);
    if (userRooms.get(userId)?.size === 0) {
      userRooms.delete(userId);
    }
  };

  // 2. Rate Limiting and Throttling
  const isRateLimited = (userId) => {
    const userLimit = messageRateLimits.get(userId) || { count: 0, timestamp: Date.now() };
    const currentTime = Date.now();
    const timeDiff = currentTime - userLimit.timestamp;

    if (timeDiff < 1000) {
      userLimit.count += 1;
      if (userLimit.count > 5) {
        return true; // Limit: 5 messages per second
      }
    } else {
      userLimit.count = 1;
      userLimit.timestamp = currentTime;
    }

    messageRateLimits.set(userId, userLimit);
    return false;
  };

  // 3. Error Handling and Acknowledgements
  const sendError = (socket, message) => {
    socket.emit("error", { message });
  };

  // WebSocket Connection
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    onlineUsers.set(socket.id, socket.id);
    socket.broadcast.emit("userOnline", socket.id);

    // Join Chat Room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      addUserToRoom(socket.id, chatId);
      console.log(`User ${socket.id} joined room ${chatId}`);
    });

    // Leave Chat Room
    socket.on("leaveChat", (chatId) => {
      socket.leave(chatId);
      removeUserFromRoom(socket.id, chatId);
      console.log(`User ${socket.id} left room ${chatId}`);
    });

    // Typing Indicators
    socket.on("typing", ({ chatId, userName }) => {
      socket.to(chatId).emit("typing", { userName });
    });
    socket.on("stopTyping", ({ chatId, userName }) => {
      socket.to(chatId).emit("stopTyping", { userName });
    });

    // 4. Emit Events Selectively
    socket.on("sendMessage", ({ chatId, content }, callback) => {
      if (!chatId || !content) {
        return sendError(socket, "Chat ID and content are required.");
      }

      if (isRateLimited(socket.id)) {
        return sendError(socket, "Rate limit exceeded. Please slow down.");
      }

      io.to(chatId).emit("receiveMessage", {
        chatId,
        senderId: socket.id,
        content,
        createdAt: new Date(),
      });

      if (callback) callback({ success: true, message: "Message sent" });
    });

    // Mark Messages as Read
    socket.on("markMessagesRead", ({ chatId }) => {
      io.to(chatId).emit("messagesRead", {
        chatId,
        userId: socket.id,
      });
    });

    // 5. Connection Reconnection Handling
    socket.on("reconnect_attempt", () => {
      console.log(`User attempting to reconnect: ${socket.id}`);
    });
    socket.on("reconnect", (attempt) => {
      console.log(`User reconnected: ${socket.id} after ${attempt} attempts`);
    });

    // 6. WebSocket Monitoring
    socket.on("pingServer", (callback) => {
      const serverTime = Date.now();
      if (callback) callback({ serverTime });
    });

    // On Disconnect - leave all rooms
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      userRooms.get(socket.id)?.forEach((room) => socket.leave(room));
      userRooms.delete(socket.id);
      socket.broadcast.emit("userOffline", socket.id);
      console.log("User disconnected:", socket.id);
    });

    // Error Handling
    socket.on("error", (err) => {
      console.error(`Error on socket: ${err.message}`);
    });
  });

  return io;
};

// Export the io object so it can be imported in other modules
export { io };

