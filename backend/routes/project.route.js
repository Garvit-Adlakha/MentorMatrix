import { addMemberToProject, createProject } from "../controllers/project.controller.js";
import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { validateDescription } from "../middleware/validation.middleware.js";

const router=Router()



//authenticated route
router.post("/create-project",isAuthenticated,validateDescription,createProject)
router.post("/add-members",isAuthenticated,addMemberToProject)
export default router