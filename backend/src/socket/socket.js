// socket.js
import { Server } from "socket.io";

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join user
    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.broadcast.emit("userOnline", userId);
    });

    // Join chat room
    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
    });

    // Send message
    socket.on("sendMessage", ({ chatId, senderId, content }) => {
      socket.to(chatId).emit("receiveMessage", { chatId, senderId, content });
    });

    // Disconnect
    socket.on("disconnect", () => {
      for (let [userId, id] of onlineUsers) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
          socket.broadcast.emit("userOffline", userId);
          break;
        }
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

