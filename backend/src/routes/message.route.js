import { Router } from "express";
import { sendMessage,getMessages,markMessagesAsRead } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router=Router()

router.post('/chats/:chatId/messages', isAuthenticated, sendMessage);
router.get('/chats/:chatId/messages', isAuthenticated, getMessages);

router.post("/mark-read/:chatId", isAuthenticated, markMessagesAsRead);

export default router