import { Router } from "express";
import { getUserChats } from "../controllers/chat.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router=Router()

router.get('/chats', isAuthenticated, getUserChats);
export default router