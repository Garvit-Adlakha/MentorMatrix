import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import connectDB from './database/db.js';
import userRoute from './routes/user.route.js';
import projectRoute from './routes/project.route.js';
import chatRoute from './routes/chat.route.js';
import messageRoute from './routes/message.route.js';

// Import the initializeSocket function
import { initializeSocket } from './socket/socket.js';


dotenv.config();
await connectDB();
// generateUsers(10)

const app = express();
const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the server
const io = initializeSocket(server);

// Make io available to our Express routes via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again later",
});

// Middlewares
app.use(helmet());
app.use(hpp());
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

//sockets routes
app.get('/ws', (req, res) => {
  res.send('WebSocket server is running');
});

// API Routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/project', projectRoute);
app.use('/api/v1/chat', chatRoute);
app.use('/api/v1/message', messageRoute);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
